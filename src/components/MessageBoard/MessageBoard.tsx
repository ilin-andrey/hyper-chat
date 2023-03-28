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
    <div className="grow flex flex-col gap-6">
      <div className="flex justify-between items-center mx-4">
        <h2 className="font-bold">Messages</h2>
        <button
          className="rounded-md bg-white py-2 px-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          onClick={onLoadMore}
        >
          Reload
        </button>
      </div>

      <div
        style={{ height: "calc(100vh - 350px)" }}
        className="min-h-96 overflow-scroll py-2"
      >
        {messages.map((m) => (
          <MessageRow key={m.id} message={m} />
        ))}
      </div>
    </div>
  );
}
