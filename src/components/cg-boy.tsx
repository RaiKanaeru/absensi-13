import { SVGProps } from "react";

export function CgBoy(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <g fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx={12} cy={4} r={2}></circle>
        <path strokeLinecap="round" d="M12 13V6m0 0L9.5 8.5M12 6l2.5 2.5"></path>
        <path d="M12 22v-9"></path>
        <path strokeLinecap="round" d="M12 22l-3-3m3 3l3-3M4 16.5l3.5-3m9 3L13 13.5"></path>
      </g>
    </svg>
  );
}