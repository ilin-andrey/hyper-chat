import { Message } from "~/core/messages";
import { formatDate } from "~/core/utils/dates";

export function MessageRow({ message }: { message: Message }) {
  const formattedDate = formatDate(message.createdAt);

  return (
    <div className="p-4">
      <div className="border-1 shadow sm:rounded-lg">
        <div className="p-6">
          <div>
            <pre className="font-sans whitespace-pre-line">
              {message.content}
            </pre>
          </div>
          <div className="flex justify-between italic mt-2">
            <span>{formattedDate}</span>
            <span>{message.author}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
