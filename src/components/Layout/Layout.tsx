export function Layout({ children }: React.PropsWithChildren) {
  return <div className="h-screen max-h-screen flex flex-col">{children}</div>;
}
