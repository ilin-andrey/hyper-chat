import { MessageBoard } from "~/components/MessageBoard";
import { MessageForm } from "~/components/MessageForm/";

function ChatView() {
  return (
    <div className="w-full m-6 flex flex-col items-center gap-6">
      <MessageBoard />
      <MessageForm onSubmit={undefined} />
    </div>
  );
}

export function Chat() {
  return <ChatView />;
}
