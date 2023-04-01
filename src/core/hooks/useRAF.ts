export function cancelTimeout(timeoutId: number) {
  cancelAnimationFrame(timeoutId);
}

export function requestTimeout(
  callback: FrameRequestCallback,
  delay: number
): number {
  const start = performance.now();

  const tick = () => {
    if (performance.now() - start >= delay) {
      callback.call(null, timeoutId);
    } else {
      timeoutId = requestAnimationFrame(tick);
    }
  };

  let timeoutId: number = requestAnimationFrame(tick);

  return timeoutId;
}
