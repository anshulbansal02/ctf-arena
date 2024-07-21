import { useCallback, useEffect, useReducer } from "react";

type AsyncFunction<P, R> = (args: P) => Promise<R>;

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
) & { preserveData?: boolean };

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
        data: event.payload as R,
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

export function useAction<ParamsType, ReturnType>(
  action: AsyncFunction<ParamsType, ReturnType>,
  opts?: Options<ParamsType>,
) {
  const [actionState, dispatch] = useReducer(reducer<ReturnType>, {
    success: undefined,
    loading: Boolean(opts?.immediate),
    error: null,
    data: null,
  });

  const execute = useCallback(
    async (params: ParamsType): Promise<ReturnType | undefined> => {
      dispatch({ type: "loading", preserveData: opts?.preserveData });
      try {
        const result = await action(params);
        dispatch({ type: "success", payload: result });

        return result;
      } catch (error) {
        dispatch({
          type: "error",
          payload: error,
          preserveData: opts?.preserveData,
        });
      }
    },
    [action],
  );

  useEffect(() => {
    if (opts?.immediate) {
      execute(opts.args);
    }
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  return { ...actionState, execute, reset };
}
