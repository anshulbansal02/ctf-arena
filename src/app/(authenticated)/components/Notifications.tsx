"use client";

import { Button } from "@/shared/components";
import clsx from "clsx";
import { SvgBell, SvgBellActive, SvgEmptyBox } from "@/assets/icons";
import { getNotifications, markAllNotificationsAsRead } from "@/services/user";
import * as Popover from "@radix-ui/react-popover";
import React, { useEffect } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { useAction } from "@/shared/hooks";

export function Notifications() {
  const {
    data: notifications,
    execute: refetchNotifications,
    loading,
  } = useAction(getNotifications, {
    immediate: true,
    preserveData: true,
    args: [],
  });

  const { execute: markRead } = useAction(markAllNotificationsAsRead);

  const unseenNotificationsCount =
    notifications?.filter((n) => n.status !== "seen").length ?? 0;

  useEffect(() => {
    const interval = setInterval(() => refetchNotifications(), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Popover.Root
      onOpenChange={(open) => {
        if (!open) markRead();
      }}
    >
      <Popover.Trigger asChild>
        <Button variant="outlined" className="relative mr-2 !rounded-full">
          {unseenNotificationsCount > 0 ? <SvgBellActive /> : <SvgBell />}
          {unseenNotificationsCount > 0 && (
            <div className="absolute right-[1px] top-[1px] h-3 w-3 rounded-full bg-red-500"></div>
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="z-20 mt-4 max-h-80 w-80 overflow-y-auto rounded-lg bg-zinc-800 px-4 py-3 shadow-lg">
          <ul className="-order-1 flex flex-col gap-3">
            {loading && !notifications?.length && (
              <p>Getting your notifications</p>
            )}

            {!loading && !notifications?.length && (
              <li className="flex flex-col items-center gap-2">
                <SvgEmptyBox width={24} height={24} />
                <p className="text-center text-sm leading-tight text-gray-400">
                  You don&apos;t have any notifications.
                  <br />
                  Check back later.
                </p>
              </li>
            )}

            {notifications?.map((notification, i) => (
              <React.Fragment key={notification.id}>
                <li>
                  <div className="flex gap-2">
                    {notification.status !== "seen" && (
                      <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#4ec8c8]" />
                    )}
                    <div
                      className={clsx(
                        {
                          "text-gray-400": notification.status === "seen",
                        },
                        "leading-snug",
                      )}
                      dangerouslySetInnerHTML={{
                        __html: notification.content ?? "",
                      }}
                    ></div>
                  </div>
                  <span className="mt-1 block self-center whitespace-nowrap text-right text-sm text-gray-500">
                    {formatDistanceToNowStrict(notification.createdAt, {
                      addSuffix: true,
                    })}
                  </span>
                </li>
                {i < notifications.length - 1 && (
                  <hr className="border-gray-600" />
                )}
              </React.Fragment>
            ))}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
