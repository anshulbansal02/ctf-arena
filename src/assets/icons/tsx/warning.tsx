import type { SVGProps } from "react";
const SvgWarning = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 -960 960 960"
    role="img"
    {...props}
  >
    <path d="m40-120 440-760 440 760zm104-60h672L480-760zm340.175-57q12.825 0 21.325-8.675t8.5-21.5-8.675-21.325-21.5-8.5-21.325 8.675-8.5 21.5 8.675 21.325 21.5 8.5M454-348h60v-224h-60zm26-122" />
  </svg>
);
export default SvgWarning;
