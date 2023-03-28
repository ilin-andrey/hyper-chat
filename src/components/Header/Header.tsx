export function Header({ children }: React.PropsWithChildren) {
  return (
    <header className="flex items-center justify-between p-6 lg:px-8">
      {children}
    </header>
  );
}
