import { useEffect, useState } from "react";

export function useClientDimensions() {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  function updateDimensions() {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  useEffect(() => {
    if (window != null) {
      updateDimensions();
      window.addEventListener("resize", updateDimensions);
    }

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  return dimensions;
}
