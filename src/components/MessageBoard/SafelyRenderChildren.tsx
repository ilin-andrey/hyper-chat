import React, { Children } from "react";

export function SafelyRenderChildren({ children }: React.PropsWithChildren) {
  const count = Children.count(children);
  if (count > 5000) {
    return <span>Attempt to render too many children</span>;
  }

  return <>{children}</>;
}
