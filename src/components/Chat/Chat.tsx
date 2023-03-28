import useSWRImmutable from "swr/immutable";

import { MessageBoard } from "~/components/MessageBoard";
import { MessageForm } from "~/components/MessageForm/";
import { fetcher } from "~/core/api/fetcher";
import { Message } from "~/core/messages";
import { ROUTES } from "~/core/routes";

function ChatView({
  messages,
  onLoadMore,
}: {
  messages: Array<Message>;
  onLoadMore: () => void;
}) {
  return (
    <div className="grow mx-auto max-w-7xl mt-4 mb-6 sm:px-6 lg:px-8">
      <div className="h-full flex flex-col justify-between mx-auto max-w-3xl">
        <MessageBoard messages={messages} onLoadMore={onLoadMore} />
        <MessageForm onSubmit={undefined} />
      </div>
    </div>
  );
}

export function Chat() {
  const { data, isLoading, mutate } = useSWRImmutable(ROUTES.MESSAGES, fetcher);
  const messages: Array<Message> = data?.messages || [];

  const handleLoadMore = async () => {
    await mutate();
  };

  if (isLoading) return <div>Loading...</div>;

  return <ChatView messages={messages} onLoadMore={handleLoadMore} />;
}
