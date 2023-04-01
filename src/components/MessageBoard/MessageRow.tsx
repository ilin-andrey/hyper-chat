import { Message } from "~/core/messages";
import { formatDate } from "~/core/utils/dates";

export function MessageRow({ message }: { message: Message }) {
  const formattedDate = formatDate(message.createdAt);

  return (
    <div className="p-4 box-border">
      <div className="border-1 shadow p-6 sm:rounded-lg">
        <pre className="font-sans whitespace-pre-line">{message.content}</pre>
        <div className="flex justify-between italic mt-2">
          <span>{formattedDate}</span>
          <span>{message.author}</span>
        </div>
      </div>
    </div>
  );
}
