import { RefObject, useCallback, useEffect, useRef } from "react";

import { cancelTimeout, requestTimeout } from "./useRAF";

export function useScrollPosition(
  element: RefObject<HTMLElement>,
  callback: (i: number) => void,
  wait: number = 0
) {
  const rafTimeoutRef = useRef<number>(0);

  const throttledHandleScroll = useCallback(() => {
    if (!rafTimeoutRef.current) {
      const handler = () => {
        if (element.current) {
          callback(element.current.scrollTop);
          rafTimeoutRef.current = 0;
        }
      };

      rafTimeoutRef.current = requestTimeout(handler, wait);
    }
  }, [callback, element, wait]);

  useEffect(() => {
    const node = element.current;

    if (!node) return;

    node.addEventListener("scroll", throttledHandleScroll);

    return () => {
      if (node) {
        node.removeEventListener("scroll", throttledHandleScroll);
        cancelTimeout(rafTimeoutRef.current);
        rafTimeoutRef.current = 0;
      }
    };
  }, [element, throttledHandleScroll]);
}
