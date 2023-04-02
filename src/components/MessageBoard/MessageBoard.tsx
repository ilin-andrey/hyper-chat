import { useCallback, useEffect, useRef, useState } from "react";

import {
  cancelTimeout,
  requestTimeout,
  useIntersectionObserver,
} from "~/core/hooks";
import { Message } from "~/core/messages";

import { MessageRow } from "./MessageRow";
import { Mesurable } from "./Mesurable";

const DEFAULT_ITEM_HEIGHT = 130;
const DEFAULT_SCROLL_TIMEOUT = 150;

export function MessageBoard({
  items,
  onLoadMore,
}: {
  items: Array<Message>;
  onLoadMore: () => Promise<number>;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const rafTimeoutRef = useRef<number>(0);
  const lastCorrectOffsetIndex = useRef<number>(-1);
  const prevItemsCount = useRef<number>(0);
  const innerHeightRef = useRef<number>(0);
  const itemsHeights = useRef<Record<number, number>>({});
  const itemsOffsets = useRef<Record<number, number>>({});
  const [[startIdx, endIdx], setVisibleRange] = useState([0, 0]);

  // let's imagine we know that list grows from beginning this case
  const handleLoadMore = useCallback(async () => {
    // const length = await onLoadMore();
    // setVisibleRange((prev) => [prev[0] + length, prev[1] + length]);
  }, [onLoadMore]);

  const handleNewMessage = useCallback(() => {
    if (!outerRef.current) return;

    const left =
      items.length -
      Math.max(
        0,
        Math.ceil(outerRef.current.clientHeight / DEFAULT_ITEM_HEIGHT)
      );
    setVisibleRange([left, items.length - 1]);
  }, [items.length]);

  const getItemOffset = (index: number) => {
    return itemsOffsets.current[index] || 0;
  };

  const setItemOffset = (index: number): void => {
    if (index === 0) {
      itemsOffsets.current[index] = 0;
      return;
    }

    // index is next for lastCorrectOffsetIndex or is next relatively to aprox offset
    if (index - lastCorrectOffsetIndex.current === 1 || index - startIdx > 0) {
      itemsOffsets.current[index] =
        itemsOffsets.current[index - 1] + itemsHeights.current[index - 1];
      return;
    }

    const count = index - lastCorrectOffsetIndex.current - 1;

    if (count <= 0) return;

    const lm =
      itemsOffsets.current[lastCorrectOffsetIndex.current] +
      itemsHeights.current[lastCorrectOffsetIndex.current];

    itemsOffsets.current[index] = lm + count * DEFAULT_ITEM_HEIGHT;
  };

  // get element size from cache
  const getCachedItemHeight = (index: number): number => {
    return itemsHeights.current[index];
  };

  // set element height in cache
  const setItemHeight = (index: number, height: number): void => {
    itemsHeights.current[index] = height;
  };

  const setInnerHeight = (index: number, itemHeight: number) => {
    const cachedHeight = getCachedItemHeight(index);

    if (!cachedHeight && itemHeight > DEFAULT_ITEM_HEIGHT) {
      const diff = itemHeight - DEFAULT_ITEM_HEIGHT;

      innerHeightRef.current = innerHeightRef.current + diff;
      if (innerRef.current) {
        innerRef.current.style.minHeight = `${innerHeightRef.current}px`;
      }
    }
  };

  const handleItemRender = (index: number, ref?: HTMLDivElement | null) => {
    const itemHeight = ref?.clientHeight;

    if (itemHeight != null) {
      setInnerHeight(index, itemHeight);
      setItemHeight(index, itemHeight);
      setItemOffset(index);

      if (index - lastCorrectOffsetIndex.current === 1)
        lastCorrectOffsetIndex.current++;
    }
  };

  // update visible range based on the current scroll position
  const updateVisibleRange = useCallback(() => {
    const node = outerRef?.current;

    if (!node) return;

    const scrollTop = node.scrollTop;
    const bottom = scrollTop + node.clientHeight;

    // const lastCorrectOffset =
    //   itemsOffsets.current[lastCorrectOffsetIndex.current] || 0;
    // const lastCorrectHeight =
    //   getCachedItemHeight(lastCorrectOffsetIndex.current) ||
    //   DEFAULT_ITEM_HEIGHT;

    let firstVisibleIndex = startIdx;
    let lastVisibleIndex = endIdx;

    // if (scrollTop === 0) {
    //   firstVisibleIndex = 0;
    //   lastVisibleIndex = Math.min(
    //     Math.floor(node.clientHeight / DEFAULT_ITEM_HEIGHT),
    //     prevItemsCount.current - 1
    //   );
    // }

    // FIXME: when jump somewhere in the unknown area, fill gaps with default size

    // const lastCorrectPosition = lastCorrectOffset + lastCorrectHeight;

    // if (scrollTop > 0 && bottom > lastCorrectPosition) {
    //   const diff = bottom - lastCorrectPosition;
    //   const toAdd = Math.ceil(diff / DEFAULT_ITEM_HEIGHT);

    //   lastVisibleIndex = Math.min(
    //     lastCorrectOffsetIndex.current + toAdd,
    //     prevItemsCount.current - 1
    //   );

    //   firstVisibleIndex = Math.max(
    //     0,
    //     lastVisibleIndex - Math.ceil(node.clientHeight / DEFAULT_ITEM_HEIGHT)
    //   );
    // }

    let firstHeight = getCachedItemHeight(startIdx) || DEFAULT_ITEM_HEIGHT;
    let firstOffset = itemsOffsets.current[startIdx] || 0;
    let lastHeight = getCachedItemHeight(endIdx) || DEFAULT_ITEM_HEIGHT;
    let lastOffset = itemsOffsets.current[endIdx] || 0;

    if (scrollTop < firstOffset) {
      firstVisibleIndex--;
    }
    if (bottom < lastOffset) {
      lastVisibleIndex--;
    }

    if (scrollTop > firstOffset + firstHeight) {
      firstVisibleIndex++;
    }

    if (bottom > lastOffset + lastHeight) {
      lastVisibleIndex++;
    }

    setVisibleRange([firstVisibleIndex, lastVisibleIndex]);
  }, [endIdx, startIdx]);

  const throttledHandleScroll = useCallback(() => {
    if (!rafTimeoutRef.current) {
      const handler = () => {
        updateVisibleRange();
        rafTimeoutRef.current = 0;
      };
      rafTimeoutRef.current = requestTimeout(handler, DEFAULT_SCROLL_TIMEOUT);
    }
  }, [updateVisibleRange]);

  // update inner container height on items.length change
  useEffect(() => {
    if (!outerRef.current || !innerRef.current) return;

    // if list grows
    if (prevItemsCount.current < items.length) {
      const minEstimatedDiff =
        DEFAULT_ITEM_HEIGHT * (items.length - prevItemsCount.current);
      innerHeightRef.current = innerHeightRef.current + minEstimatedDiff;
      // when inner container estimated height less than size of outer container
      if (innerHeightRef.current < outerRef.current.clientHeight) {
        innerHeightRef.current = outerRef.current.clientHeight;
      }

      innerRef.current.style.minHeight = `${innerHeightRef.current}px`;

      // FIXME: this is hack to detect new message
      const isNewMessage = items.length - prevItemsCount.current === 1;
      if (isNewMessage) {
        handleNewMessage();
      }

      prevItemsCount.current = items.length;
    }
  }, [handleNewMessage, items.length]);

  // recalculate visible range
  useEffect(() => {
    updateVisibleRange();
  }, [updateVisibleRange]);

  // assign handlers for onScroll events
  useEffect(() => {
    const node = outerRef?.current;
    if (node) {
      node.addEventListener("scroll", throttledHandleScroll);
    }

    return () => {
      if (node) {
        node.removeEventListener("scroll", throttledHandleScroll);
        cancelTimeout(rafTimeoutRef.current);
        rafTimeoutRef.current = 0;
      }
    };
  }, [throttledHandleScroll]);

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
      // scrollable container for the content
      ref={outerRef}
      className="relative min-h-96 overflow-auto"
      style={{
        height: "calc(100vh - 350px)", // workaround to set fixed height of the scrollable container
        // property indicates that an element and its contents are, as much as possible, independent from the rest of the document tree
        // https://developer.mozilla.org/en-US/docs/Web/CSS/contain
        contain: "content",
        willChange: "transform",
      }}
    >
      <div
        // 1px absolute block to trigger loading more data
        ref={loadMoreRef}
        className="absolute top-0 h-px w-full"
      />
      <div
        // relative container to position all messages
        ref={innerRef}
        className="relative min-h-full"
        style={{
          minHeight: `${innerHeightRef.current}px`,
        }}
      >
        {items.slice(startIdx, endIdx + 1).map((item, index) => (
          <Mesurable
            // wrapper to measure size of each message and put it to the right place on the canvas
            key={item.id}
            // hack to identify size and position of the element, values are in place when useEffect runs after re-render
            ref={(ref) => handleItemRender(startIdx + index, ref)}
            offset={getItemOffset(startIdx + index)}
            style={
              // don't show to user elements with wrong position
              index > 0 && getItemOffset(startIdx + index) === 0
                ? {
                    visibility: "hidden",
                  }
                : {}
            }
          >
            <MessageRow message={item} />
          </Mesurable>
        ))}
      </div>
    </div>
  );
}
