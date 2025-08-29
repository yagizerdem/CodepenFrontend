import { Fragment } from "react/jsx-runtime";
import { useChatContext } from "../../context/ChatContext";
import ProfileImageContainer from "../common/ProfileImageContainer";
import { Button } from "../../ui";
import { FeatherSend } from "@subframe/core";
import React from "react";

function ChatPanel() {
  const { targetProfile } = useChatContext();

  console.log(targetProfile);

  return (
    <Fragment>
      <div
        className="flex-1 w-full h-full flex flex-col"
        style={{ background: "rgb(39 40 34)" }}
      >
        <div className="flex w-full h-16">
          <Header />
        </div>
        <div className="flex-1 w-full ">
          <ContextPanel />
        </div>
        <div className="flex w-full h-16 bg-gray-800 items-center align-middle">
          <Footer />
        </div>
      </div>
    </Fragment>
  );
}

export { ChatPanel };

function Header() {
  const { targetProfile } = useChatContext();

  return (
    <div className="flex flex-row items-center w-full h-16 bg-gray-800 px-3">
      {targetProfile != null && (
        <Fragment>
          {/* Profile Picture */}
          <div className="w-fit mr-3">
            <ProfileImageContainer
              customStyle={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                overflow: "hidden",
              }}
              profileImagePath={`${
                targetProfile?.id
                  ? import.meta.env.VITE_API_BASE_URL
                  : "/default-profile.png"
              }/client/get-profile-image/${targetProfile?.id}`}
              expandOnClick={true}
            />
          </div>

          {/* User Info */}
          <div className="flex flex-col justify-center">
            <span className="text-white font-semibold text-base leading-tight">
              {targetProfile?.fullName}
            </span>
            <span className="text-gray-400 text-sm leading-tight">
              @{targetProfile?.userName}
            </span>
            <span className="text-gray-500 text-xs leading-tight italic">
              {targetProfile?.email}
            </span>
          </div>
        </Fragment>
      )}
    </div>
  );
}

function ContextPanel() {
  return <div className="flex flex-1 w-full h-full bg-gray-900"></div>;
}

function Footer() {
  const [message, setMessage] = React.useState<string>("");
  const { targetProfile, connection } = useChatContext();

  async function sendMessage() {
    try {
      if (!connection) return;

      console.log("send message : ", message, targetProfile);

      await connection.invoke("SendMessage", targetProfile?.id, message);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setMessage("");
    }
  }

  return (
    <div className="flex w-full h-12  bg-gray-800 flex-row align-middle justify-center items-center gap-3">
      <input
        type="text"
        placeholder="Enter text..."
        className="text-white form-input w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button
        icon={<FeatherSend />}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          sendMessage();
        }}
      >
        Send
      </Button>
    </div>
  );
}
