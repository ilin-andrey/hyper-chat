import { useCallback, useEffect, useRef, useState } from "react";

import { useIntersectionObserver, useScrollPosition } from "~/core/hooks";
import { Message } from "~/core/messages";

import { MessageRow } from "./MessageRow";
import { Mesurable } from "./Mesurable";
import { SafelyRenderChildren } from "./SafelyRenderChildren";

const DEFAULT_ITEM_HEIGHT = 130;
const DEFAULT_SCROLL_TIMEOUT = 50;

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

  const [[firstIndex, lastIndex], setVisibleRange] = useState([
    items.length - 10,
    items.length - 1,
  ]);
  const [, forceReRender] = useState<number>(0);
  const [forcedCalculation, forceHeightCalculation] = useState<number>(0);
  const [scrollToBottom, forceScrollToBottom] = useState<number>(0);

  const lastCorrectOffsetIndex = useRef<number>(-1);
  const prevItemsCount = useRef<number>(0);
  const innerHeightRef = useRef<number>(0);
  const itemsHeights = useRef<Record<number, number>>({});
  const itemsOffsets = useRef<Record<number, number>>({ 0: 0 });
  const scrollToAlignRef = useRef<number>(0);
  const skipRenderRef = useRef<boolean>(false);
  const skipScrollEventRef = useRef<boolean>(false);

  const handleLoadMore = useCallback(async () => {
    skipRenderRef.current = true;
    // this call triggers re-render in the middle cause it updates parent component and props
    // and this is hack to avoid any wrong calculations during useless re-renders with old visible range on new data
    const length = await onLoadMore();
    skipRenderRef.current = false;

    lastCorrectOffsetIndex.current = -1;
    // FIXME: performance
    for (const key in itemsHeights.current) {
      itemsHeights.current[+key + length] = itemsHeights.current[key];
      delete itemsHeights.current[key];
    }
    for (const key in itemsOffsets.current) {
      itemsOffsets.current[+key + length] =
        itemsOffsets.current[key] + length * DEFAULT_ITEM_HEIGHT;
      delete itemsOffsets.current[key];
    }
    itemsOffsets.current[0] = 0;
    setVisibleRange(([start, end]) => [start + length, end + length]);
    forceHeightCalculation(performance.now());
  }, [onLoadMore]);

  const handleNewMessage = useCallback(() => {
    setVisibleRange([items.length - 10, items.length - 1]);
    forceScrollToBottom(performance.now());
  }, [items.length]);

  const scrollTo = (top: number, behavior: ScrollBehavior = "auto") => {
    if (!outerRef.current) return;

    outerRef.current.scrollTo({
      top: top,
      behavior: behavior,
    });
  };

  const setInnerContainerHeight = (newHeight: number) => {
    if (innerRef.current) {
      innerRef.current.style.minHeight = `${newHeight}px`;
    }
  };

  const getCachedItemOffset = (index: number) => {
    return itemsOffsets.current[index] || 0;
  };

  const getCachedItemHeight = (index: number): number => {
    return itemsHeights.current[index];
  };

  const setCachedItemHeight = (index: number, height: number): void => {
    itemsHeights.current[index] = height;
  };

  const setItemOffset = (index: number): void => {
    if (index === 0) {
      itemsOffsets.current[index] = 0;
      return;
    }

    // index is next for lastCorrectOffsetIndex or is next relatively to aprox offset
    if (index <= lastCorrectOffsetIndex.current + 1 || index - firstIndex > 0) {
      itemsOffsets.current[index] =
        itemsOffsets.current[index - 1] + itemsHeights.current[index - 1];
      return;
    }

    // otherwise fill gap with default (height * number of minimum possible items)

    if (index - lastCorrectOffsetIndex.current - 1 <= 0) return;

    // count from 0 when render not from the beginning of the range
    const lastCorrectPositionBottom =
      lastCorrectOffsetIndex.current < 0
        ? 0
        : itemsOffsets.current[lastCorrectOffsetIndex.current] +
          itemsHeights.current[lastCorrectOffsetIndex.current];

    let diff = 0;
    for (let i = lastCorrectOffsetIndex.current + 1; i < index; i++) {
      diff = diff + (itemsHeights.current[i] || DEFAULT_ITEM_HEIGHT);
    }

    itemsOffsets.current[index] = lastCorrectPositionBottom + diff;
  };

  const setInnerHeight = (index: number, itemHeight: number) => {
    const cachedHeight = getCachedItemHeight(index);

    if (!cachedHeight && itemHeight > DEFAULT_ITEM_HEIGHT) {
      innerHeightRef.current =
        innerHeightRef.current + (itemHeight - DEFAULT_ITEM_HEIGHT);
      setInnerContainerHeight(innerHeightRef.current);

      // if element is new it triggers movement of all subsequent elements
      // move scroll down to visually prevent it
      scrollToAlignRef.current = itemHeight - DEFAULT_ITEM_HEIGHT;
    }
  };

  // process items during rendering and save their sizes and pre-calculate positions
  const handleItemRender = (index: number, ref?: HTMLDivElement | null) => {
    if (skipRenderRef.current) return;

    const itemHeight = ref?.clientHeight;

    // FIXME: issue with wrong total inner height calculation on loading more data

    if (itemHeight != null) {
      setInnerHeight(index, itemHeight);
      setCachedItemHeight(index, itemHeight);
      setItemOffset(index);

      // check that last correct offset is updated only if it follows previous
      if (index === lastCorrectOffsetIndex.current + 1)
        lastCorrectOffsetIndex.current++;
    }
  };

  // update visible range based on state and current scroll position
  const updateVisibleRange = useCallback(() => {
    const node = outerRef?.current;

    if (!node) return;

    const newScrollTop = node.scrollTop;
    const newBottom = newScrollTop + node.clientHeight;

    if (newScrollTop === 0) return;
    if (skipScrollEventRef.current) {
      skipScrollEventRef.current = false;
      return;
    }

    // FIXME: performance

    let firstVisibleIndex = firstIndex;
    let lastVisibleIndex = lastIndex;

    let firstHeight = getCachedItemHeight(firstIndex) || DEFAULT_ITEM_HEIGHT;
    let firstOffset = itemsOffsets.current[firstIndex] || 0;
    let lastHeight = getCachedItemHeight(lastIndex) || DEFAULT_ITEM_HEIGHT;
    let lastOffset = itemsOffsets.current[lastIndex] || 0;

    if (newScrollTop < firstOffset) {
      let shift = firstOffset - newScrollTop;
      let acc = getCachedItemHeight(firstIndex - 1) || DEFAULT_ITEM_HEIGHT;
      let toShift = 2;
      for (let i = firstIndex - 2; i >= 0; i--) {
        if (acc >= shift) break;
        acc += getCachedItemHeight(i) || DEFAULT_ITEM_HEIGHT;
        toShift++;
      }
      firstVisibleIndex = Math.max(0, firstVisibleIndex - toShift);
    }

    if (newBottom < lastOffset) {
      let shift = lastOffset - newBottom;
      let acc = getCachedItemHeight(lastIndex - 1) || DEFAULT_ITEM_HEIGHT;
      let toShift = 1;
      for (let i = lastOffset - 2; i >= 0; i--) {
        if (acc >= shift) break;
        acc += getCachedItemHeight(i) || DEFAULT_ITEM_HEIGHT;
        toShift++;
      }

      lastVisibleIndex = Math.max(0, lastVisibleIndex - toShift);
    }

    if (newScrollTop > firstOffset + firstHeight) {
      let shift = newScrollTop - (firstOffset + firstHeight);
      let acc = getCachedItemHeight(firstIndex + 1) || DEFAULT_ITEM_HEIGHT;
      let toShift = 1;
      for (let i = firstIndex + 2; i < items.length; i++) {
        if (acc >= shift) break;
        acc += getCachedItemHeight(i) || DEFAULT_ITEM_HEIGHT;
        toShift++;
      }

      firstVisibleIndex = Math.min(
        items.length - 1,
        firstVisibleIndex + toShift
      );
    }

    if (newBottom > lastOffset + lastHeight) {
      let shift = newBottom - (lastOffset + lastHeight);
      let acc = getCachedItemHeight(lastIndex + 1) || DEFAULT_ITEM_HEIGHT;
      let toShift = 2;
      for (let i = lastOffset + 2; i < items.length; i--) {
        if (acc >= shift) break;
        acc += getCachedItemHeight(i) || DEFAULT_ITEM_HEIGHT;
        toShift++;
      }

      lastVisibleIndex = Math.min(items.length - 1, lastVisibleIndex + toShift);
    }

    setVisibleRange([firstVisibleIndex, lastVisibleIndex]);
  }, [firstIndex, lastIndex, items.length]);

  useScrollPosition(outerRef, updateVisibleRange, DEFAULT_SCROLL_TIMEOUT);

  // update inner container height on items.length change
  useEffect(() => {
    if (!outerRef.current || !innerRef.current) return;

    if (skipRenderRef.current) return;

    // if list grows + first render
    if (prevItemsCount.current < items.length) {
      const minEstimatedHeight =
        DEFAULT_ITEM_HEIGHT * (items.length - prevItemsCount.current);

      innerHeightRef.current = innerHeightRef.current + minEstimatedHeight;

      // stretch inner container when inner container estimated height less than size of outer container
      if (innerHeightRef.current < outerRef.current.clientHeight) {
        innerHeightRef.current = outerRef.current.clientHeight;
      }

      setInnerContainerHeight(innerHeightRef.current);

      // FIXME: this is hack to detect new messages
      const isNewMessage = items.length - prevItemsCount.current === 1;
      if (isNewMessage) {
        handleNewMessage();
      } else {
        scrollTo(outerRef.current?.scrollTop + minEstimatedHeight);
      }

      prevItemsCount.current = items.length;
    }
  }, [handleNewMessage, items.length, forcedCalculation]);

  useEffect(() => {
    forceReRender(performance.now());

    if (outerRef.current) {
      // skip next `scroll` event
      skipScrollEventRef.current = true;
      scrollTo(outerRef.current.scrollTop + scrollToAlignRef.current);
      scrollToAlignRef.current = 0;
    }
  }, [firstIndex, lastIndex]);

  // scroll to the bottom when state of the flag was changed, skip first render
  useEffect(() => {
    if (!outerRef.current) return;

    if (!scrollToBottom) return;

    // scroll smoothly on short distances
    const isSmooth =
      outerRef.current.scrollTop >
      innerHeightRef.current -
        outerRef.current.clientHeight -
        outerRef.current.clientHeight / 2;

    scrollTo(
      innerHeightRef.current - outerRef.current.clientHeight,
      isSmooth ? "smooth" : "auto"
    );
  }, [scrollToBottom]);

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
        className="absolute top-0 h-10 w-full"
      />
      <div
        // relative container to position all messages
        ref={innerRef}
        className="relative min-h-full"
        style={{
          minHeight: `${innerHeightRef.current}px`,
        }}
      >
        <SafelyRenderChildren>
          {items.slice(firstIndex, lastIndex + 1).map((item, index) => (
            <Mesurable
              // wrapper to measure size of each message and put it to the right place on the canvas
              key={item.id}
              // hack to identify size and position of element, values are in place when useEffect runs after re-render
              ref={(ref) => handleItemRender(firstIndex + index, ref)}
              offset={getCachedItemOffset(firstIndex + index)}
              style={
                // don't show to user elements with wrong position
                firstIndex + index > 0 &&
                getCachedItemOffset(firstIndex + index) === 0
                  ? {
                      visibility: "hidden",
                    }
                  : {}
              }
            >
              <MessageRow message={item} />
            </Mesurable>
          ))}
        </SafelyRenderChildren>
      </div>
    </div>
  );
}
