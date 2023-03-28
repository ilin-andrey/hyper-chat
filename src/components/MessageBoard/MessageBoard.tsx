import { Message } from "~/core/messages";

import { MessageRow } from "./MessageRow";

export function MessageBoard({
  messages,
  onLoadMore,
}: {
  messages: Array<Message>;
  onLoadMore: () => void;
}) {
  return (
    <div className="w-2/4">
      <div className="flex justify-between">
        <h2 className="font-bold">Messages</h2>
        <button
          className="rounded-md bg-white py-2 px-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          onClick={onLoadMore}
        >
          More...
        </button>
      </div>

      <div>
        {messages.map((m) => (
          <MessageRow key={m.id} message={m} />
        ))}
      </div>
    </div>
  );
}
