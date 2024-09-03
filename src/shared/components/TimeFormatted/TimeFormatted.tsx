"use client";

import React from "react";
import { format } from "date-fns";

export function TimeFormatted(props: { time: Date; format: string }) {
  return <React.Fragment>{format(props.time, props.format)}</React.Fragment>;
}
