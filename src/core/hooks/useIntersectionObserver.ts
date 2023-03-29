import { RefObject, useEffect } from "react";

export const useIntersectionObserver = (
  ref: RefObject<Element>,
  options: IntersectionObserverInit,
  callback: () => void
) => {
  useEffect(() => {
    const node = ref?.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || !node) return;

    const observer = new IntersectionObserver(
      ([entry]: IntersectionObserverEntry[]) => {
        if (entry.isIntersecting) {
          callback();
        }
      },
      options
    );

    if (node) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, [ref, options, callback]);
};
