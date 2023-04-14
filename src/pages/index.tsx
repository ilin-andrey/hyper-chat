import { Chat } from "~/components/Chat";
import { Header } from "~/components/Header";

export default function Index() {
  return (
    <>
      <Header>
        <span>JetBrains [Datalore] - Tech Interview</span>
      </Header>
      <Chat />
    </>
  );
}
