import { useEffect } from "react";
import { Message } from "~/core/messages";

import { MessageRow } from "./MessageRow";

export function MessageBoard({
  messages,
  loading,
}: {
  messages: Array<Message>;
  loading?: boolean;
  onLoadMore: () => void;
}) {
  useEffect(() => {
    if (!messages.length) return;

    const lastEl = messages[messages.length - 1].id;
    const el = document.getElementById(lastEl);
    if (el) {
      el.scrollIntoView();
    }
  }, [messages]);

  return (
    <div className="grow flex flex-col gap-6">
      <div className="flex justify-between items-center mx-4">
        <h2 className="font-bold">Messages</h2>
      </div>

      <div
        style={{ height: "calc(100vh - 350px)" }}
        className="min-h-96 overflow-scroll py-2"
      >
        {loading ? (
          <div className="p-4 w-full">Loading...</div>
        ) : (
          <>
            {messages.map((m) => (
              <MessageRow key={m.id} id={m.id} message={m} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
