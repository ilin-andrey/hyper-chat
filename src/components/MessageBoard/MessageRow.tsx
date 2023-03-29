import { Message } from "~/core/messages";
import { formatDate } from "~/core/utils/dates";

export function MessageRow({
  message,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  message: Message;
}) {
  const formattedDate = formatDate(message.createdAt);

  return (
    <div className="m-4 border-1 shadow sm:rounded-lg" {...rest}>
      <div className="p-6">
        <div>
          <pre className="font-sans whitespace-pre-line">{message.content}</pre>
        </div>
        <div className="flex justify-between italic mt-2">
          <span>{formattedDate}</span>
          <span>{message.author}</span>
        </div>
      </div>
    </div>
  );
}
