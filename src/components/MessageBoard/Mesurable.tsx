import React, { Ref } from "react";

type Args = React.HTMLAttributes<HTMLDivElement> &
  React.PropsWithChildren<{ offset: number }>;

function MesurableComponent(
  { children, style, offset = 0, ...rest }: Args,
  ref: Ref<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      className="absolute w-full"
      style={{ ...style, transform: `translateY(${offset}px)` }}
      {...rest}
    >
      {children}
    </div>
  );
}

export const Mesurable = React.forwardRef(MesurableComponent);
