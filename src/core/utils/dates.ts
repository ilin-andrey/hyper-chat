export function formatDate(isoDateString: string): string {
  const date = new Date(isoDateString);

  return date.toLocaleString();
}
