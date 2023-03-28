import { Message } from "~/core/messages";
import { formatDate } from "~/core/utils/dates";

export function MessageRow({ message }: { message: Message }) {
  const createdAt = formatDate(message.createdAt);

  return (
    <div className="m-4 border-1">
      <div>{message.content}</div>
      <div className="flex justify-between italic">
        <span>{createdAt}</span>
        <span>{message.author}</span>
      </div>
    </div>
  );
}
