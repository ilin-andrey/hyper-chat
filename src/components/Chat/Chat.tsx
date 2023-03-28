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
    <div className="m-6 flex flex-col items-center justify-between gap-6">
      <MessageBoard messages={messages} onLoadMore={onLoadMore} />
      <MessageForm onSubmit={undefined} />
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
