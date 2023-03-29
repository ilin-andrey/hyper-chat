import { useCallback } from "react";
import useSWRImmutable from "swr/immutable";

import { MessageBoard } from "~/components/MessageBoard";
import { MessageForm } from "~/components/MessageForm/";
import { fetcher } from "~/core/api/fetcher";
import { getRandomMessage, Message } from "~/core/messages";
import { ROUTES } from "~/core/routes";
import { CustomResponse } from "~/pages/api/messages";

function ChatView({
  messages,
  isLoading,
  onLoadMore,
  onNewMessage,
}: {
  messages: Array<Message>;
  isLoading?: boolean;
  onLoadMore: () => void;
  onNewMessage: (s: string) => void;
}) {
  return (
    <div className="grow flex flex-col items-center w-full mt-4 mb-6 md:px-6">
      <div className="h-full flex flex-col justify-between mx-auto w-full max-w-3xl">
        <div className="relative grow flex flex-col gap-6">
          <div className="flex justify-between items-center mx-4">
            <h2 className="font-bold">Messages</h2>
          </div>

          {isLoading ? (
            <div className="p-4 w-full">Loading...</div>
          ) : (
            <MessageBoard messages={messages} onLoadMore={onLoadMore} />
          )}
        </div>
        <MessageForm disabled={isLoading} onSubmit={onNewMessage} />
      </div>
    </div>
  );
}

export function Chat() {
  const { data, isLoading, mutate } = useSWRImmutable<CustomResponse>(
    ROUTES.API.MESSAGES,
    fetcher
  );

  const messages = data?.messages || [];

  const handleLoadMore = useCallback(async () => {
    // TODO: process error if needed
    const updatedData = await fetcher(ROUTES.API.MESSAGES);

    const newMessages = updatedData?.messages || [];

    // add new messages to the beginning of the SWR cache
    await mutate(
      { ...data, messages: [...newMessages, ...(data?.messages || [])] },
      false
    );
  }, [data, mutate]);

  const handleNewMessage = useCallback(
    async (msg: string) => {
      if (msg.length === 0) return;

      // TODO: add real data if needed
      const newMsg = {
        ...getRandomMessage(),
        content: msg,
        createdAt: new Date().toISOString(),
      };

      // add new message to the end of the SWR cache
      await mutate(
        { ...data, messages: [...(data?.messages || []), newMsg] },
        false
      );
    },
    [data, mutate]
  );

  return (
    <ChatView
      messages={messages}
      isLoading={isLoading}
      onLoadMore={handleLoadMore}
      onNewMessage={handleNewMessage}
    />
  );
}
