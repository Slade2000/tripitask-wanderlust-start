
import React from "react";

interface StarProps {
  filled: boolean;
}

export function Star({ filled }: StarProps) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill={filled ? "rgb(250 204 21)" : "none"}
      stroke={filled ? "rgb(250 204 21)" : "currentColor"}
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
    </svg>
  );
}

export default Star;
