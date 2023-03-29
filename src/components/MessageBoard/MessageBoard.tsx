import { useCallback, useEffect, useRef } from "react";
import { useIntersectionObserver } from "~/core/hooks/useIntersectionObserver";

import { Message } from "~/core/messages";

import { MessageRow } from "./MessageRow";

export function MessageBoard({
  messages,
  onLoadMore,
}: {
  messages: Array<Message>;
  onLoadMore: () => void;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const prevInnerHeight = useRef<number | null>(null);

  const handleLoadMore = useCallback(() => {
    onLoadMore();
  }, [onLoadMore]);

  // manage scroll position
  useEffect(() => {
    if (outerRef.current && innerRef.current) {
      const outerHeight = outerRef.current.clientHeight;
      const innerHeight = innerRef.current.clientHeight;
      const outerScrollTop = outerRef.current.scrollTop;

      // start the container at the bottom
      if (
        !prevInnerHeight.current ||
        outerScrollTop === prevInnerHeight.current - outerHeight
      ) {
        outerRef.current.scrollTo({
          top: innerHeight! - outerHeight!,
          left: 0,
          behavior: prevInnerHeight.current ? "smooth" : "auto",
        });
      }

      // don't stay at the top on load new data
      if (outerScrollTop === 0) {
        outerRef.current.scrollTo({
          top: innerHeight! - prevInnerHeight.current!,
          left: 0,
          behavior: "auto",
        });
      }

      prevInnerHeight.current = innerHeight;
    }
  }, [messages]);

  // trigger data load at the top of the scrollable area
  useIntersectionObserver(
    loadMoreRef,
    {
      threshold: 0,
      root: null,
      rootMargin: "0%",
    },
    handleLoadMore
  );

  return (
    <div
      ref={outerRef}
      style={{ height: "calc(100vh - 350px)" }}
      className="relative min-h-96 overflow-scroll"
    >
      <div ref={innerRef} className="relative">
        <div ref={loadMoreRef} className="h-px w-full" />

        {messages.map((m) => (
          <MessageRow key={m.id} message={m} />
        ))}
      </div>
    </div>
  );
}
