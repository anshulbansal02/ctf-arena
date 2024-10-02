import { useCallback, useEffect, useReducer } from "react";
import { useToaster } from "./useToaster";

class AsyncActionError {
  message: string;
  constructor(message: string) {
    this.message = message;
  }
}

type Event = "loading" | "success" | "error" | "reset";

type EventWithPayload = {
  type: Event;
  payload?: unknown;
  preserveData?: boolean;
};

type ActionState<R> = {
  loading: boolean;
  error: unknown;
  data: R | null;
  success: boolean | undefined;
};

type Options<T> = (
  | {
      immediate: true;
      args: T;
    }
  | {
      immediate: false;
    }
) & { preserveData?: boolean; noError?: boolean };

function reducer<R>(
  state: ActionState<R>,
  event: EventWithPayload,
): ActionState<R> {
  switch (event.type) {
    case "loading":
      return {
        data: event.preserveData ? state.data : null,
        success: undefined,
        error: false,
        loading: true,
      };
    case "success":
      return {
        success: true,
        data: event.payload as Exclude<R, { error: string }>,
        error: null,
        loading: false,
      };
    case "error":
      return {
        success: false,
        data: event.preserveData ? state.data : null,
        error: event.payload,
        loading: false,
      };
    case "reset":
      return { success: undefined, data: null, error: false, loading: false };
    default:
      return state;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useAction<T extends (...args: any[]) => any>(
  action: T,
  opts?: Options<Parameters<T>>,
) {
  const [actionState, dispatch] = useReducer(reducer<Awaited<ReturnType<T>>>, {
    success: undefined,
    loading: Boolean(opts?.immediate),
    error: null,
    data: null,
  });

  const toaster = useToaster();

  const setState = useCallback((state: Awaited<ReturnType<T>>) => {
    dispatch({ type: "success", payload: state });
  }, []);

  const execute = useCallback(
    async (
      ...args: Parameters<T>
    ): Promise<Awaited<ReturnType<T>> | undefined | { error: string }> => {
      dispatch({ type: "loading", preserveData: opts?.preserveData });
      try {
        const result = await action(...args);

        if (
          result &&
          typeof result === "object" &&
          "error" in result &&
          typeof result.error === "string"
        )
          throw new AsyncActionError(result.error);

        dispatch({ type: "success", payload: result });
        return result;
      } catch (error) {
        let errorMessage = "Something went wrong. Please try again.";

        if (error instanceof AsyncActionError) errorMessage = error.message;
        else if (error instanceof Error && "digest" in error)
          errorMessage += ` If the error persists please share this code (${error.digest}) with the support.`;

        const errorReadingTime = Math.max(
          2500,
          errorMessage.split(" ").length * 350,
        ); // Number of words * 350ms;

        toaster.error({ title: errorMessage, timeout: errorReadingTime });

        dispatch({
          type: "error",
          payload: errorMessage,
          preserveData: opts?.preserveData,
        });

        return { error: errorMessage };
      }
    },
    [action],
  );

  useEffect(() => {
    if (opts?.immediate) {
      execute(...opts.args);
    }
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  return { ...actionState, execute, reset, setState };
}
