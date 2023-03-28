export function Header({ children }: React.PropsWithChildren) {
  return (
    <header className="flex items-center justify-between min-h-6 m-0 px-4 py-6 sm:px-6 lg:px-8">
      {children}
    </header>
  );
}
