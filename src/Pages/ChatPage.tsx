import { Fragment } from "react";
import { ProfileSelection } from "../components/chatPage/ProfileSelection";
import { ChatPanel } from "../components/chatPage/ChatPanel";

function ChatPage() {
  return (
    <Fragment>
      <div className="flex flex-1 w-full h-full">
        <ProfileSelection />
        <ChatPanel />
      </div>
    </Fragment>
  );
}

export { ChatPage };
