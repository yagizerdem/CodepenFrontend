import { Fragment } from "react/jsx-runtime";
import { useChatContext } from "../../context/ChatContext";
import ProfileImageContainer from "../common/ProfileImageContainer";
import { Button } from "../../ui";
import { FeatherMoreHorizontal, FeatherSend } from "@subframe/core";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import type { PrivateChatMessageEntity } from "../../models/entity/PrivateChatMessageEntity";
import type { ApiResponse } from "../../models/responsetype/ApiResponse";
import { API } from "../../utils/API";

function ChatPanel() {
  const { targetProfile } = useChatContext();

  if (targetProfile == null)
    return (
      <div className="flex-1 w-full  items-center justify-center h-full flex flex-col  bg-gray-800">
        <div className="text-white font-bold text-2xl">
          Select a user to chat with
        </div>
      </div>
    );

  return (
    <Fragment>
      <div
        className="flex-1 w-full h-full flex flex-col"
        style={{ background: "rgb(39 40 34)" }}
      >
        <div className="flex w-full h-16">
          <Header />
        </div>
        <div className="flex-1 w-full overflow-y-auto">
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

// chat messages here
function ContextPanel() {
  const { profile } = useAppContext();
  const { chatMessages, targetProfile, setChatMessages } = useChatContext();
  const limit = 100;
  const [hasFullyFetched, setHasFullyFetched] = useState(false);

  useEffect(() => {
    if (targetProfile) {
      fetchMessages();
    }
  }, [targetProfile]);

  async function fetchMessages() {
    try {
      const offset = chatMessages.length;

      const apiRResponse: ApiResponse<PrivateChatMessageEntity[]> = (
        await API.get(
          `/privatechat/my-messages?offset=${offset}&limit=${limit}&targetUserId=${targetProfile?.id}`
        )
      ).data;

      console.log(apiRResponse);

      if (!apiRResponse.success) {
        return;
      }

      setHasFullyFetched(apiRResponse.data.length < limit);

      setChatMessages((prev) => [...prev, ...apiRResponse.data]);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="overflow-y-auto flex flex-col flex-1 w-full h-full bg-gray-900 p-4 space-y-2 ">
      {chatMessages.map((msg) => {
        const isMine = msg.senderId === profile?.id;
        const isTarget = msg.senderId === targetProfile?.id;

        return (
          <div
            key={msg.id}
            className={`flex w-full ${
              isMine ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl shadow-md break-words ${
                isMine
                  ? "bg-green-600 text-white rounded-br-none"
                  : isTarget
                  ? "bg-blue-600 text-white rounded-bl-none"
                  : "bg-gray-700 text-gray-200"
              }`}
            >
              <div className="text-sm">{msg.message}</div>
            </div>
          </div>
        );
      })}

      {!hasFullyFetched && (
        <div className="w-fit mx-auto">
          <Button
            icon={<FeatherMoreHorizontal />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              fetchMessages();
            }}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

function Footer() {
  const [message, setMessage] = React.useState<string>("");
  const { targetProfile, connection } = useChatContext();

  async function sendMessage() {
    try {
      if (!connection) return;

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
