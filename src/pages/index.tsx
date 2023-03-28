import { Chat } from "~/components/Chat";
import { Header } from "~/components/Header";

export default function Index() {
  return (
    <>
      <Header>
        <span>Hyper Chat</span>
      </Header>
      <Chat />
    </>
  );
}
