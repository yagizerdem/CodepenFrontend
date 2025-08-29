import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as signalR from "@microsoft/signalr";
import { useAppContext } from "./AppContext";
import type { ApplicationUserEntity } from "../models/entity/ApplicationUserEntity";
import type { ApiResponse } from "../models/responsetype/ApiResponse";
import { showErrorToast } from "../utils/Toaster";
import { API } from "../utils/API";
import type { PrivateChatMessageEntity } from "../models/entity/PrivateChatMessageEntity";

interface ChatContextType {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  followers: ApplicationUserEntity[];
  followersPage: number;
  fetchFollowers: () => Promise<void>;
  userListPanelMode: UserListPanelMode;
  setUserListPanelMode: React.Dispatch<React.SetStateAction<UserListPanelMode>>;
  fetchFollowing: () => Promise<void>;
  following: ApplicationUserEntity[];
  followingPage: number;
  targetProfile: ApplicationUserEntity | null;
  setTargetProfile: React.Dispatch<
    React.SetStateAction<ApplicationUserEntity | null>
  >;
  chatMessages: PrivateChatMessageEntity[];
  setChatMessages: React.Dispatch<
    React.SetStateAction<PrivateChatMessageEntity[]>
  >;
}

const pageSize = 20;

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export type UserListPanelMode = "followers" | "following" | "latest";

export function ChatProvider({ children }: { children: ReactNode }) {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  // followers related
  const [followers, setFollowers] = useState<ApplicationUserEntity[]>([]);
  const [followersPage, setFollowersPage] = useState<number>(1);
  // following related
  const [following, setFollowing] = useState<ApplicationUserEntity[]>([]);
  const [followingPage, setFollowingPage] = useState<number>(1);

  const { profile } = useAppContext();

  const [targetProfile, setTargetProfile] =
    useState<ApplicationUserEntity | null>(null);

  // panel mode
  const [userListPanelMode, setUserListPanelMode] =
    useState<UserListPanelMode>("followers");

  const [chatMessages, setChatMessages] = useState<PrivateChatMessageEntity[]>(
    []
  );

  // signal r client setup
  useEffect(() => {
    const connect = async () => {
      const wsUrl = import.meta.env.VITE_WS_BASE_URL as string;

      const hub = new signalR.HubConnectionBuilder()
        .withUrl(wsUrl)
        .withAutomaticReconnect()
        .build();

      hub.onreconnected(() => {
        console.log("SignalR reconnected");
        setIsConnected(true);
      });

      hub.onclose(() => {
        console.log("SignalR disconnected");
        setIsConnected(false);
      });

      try {
        await hub.start();
        console.log("SignalR connected");
        setConnection(hub);
        setIsConnected(true);
      } catch (err) {
        console.error("SignalR connection error:", err);
      }
    };

    connect();

    return () => {
      connection?.stop();
    };
  }, []);

  // handle incoming messages
  useEffect(() => {
    if (!connection) return;

    const handler = (chatMessage: PrivateChatMessageEntity) => {
      if (
        chatMessage.senderId === targetProfile?.id ||
        chatMessage.senderId === profile?.id
      ) {
        setChatMessages((prev) => [...prev, chatMessage]);
      }
    };

    connection.on("ReceiveMessage", handler);
    return () => {
      connection.off("ReceiveMessage", handler);
    };
  }, [connection, profile?.id, targetProfile?.id]);

  //initial users load
  useEffect(() => {
    // followrers
    fetchFollowers();

    // followings
    fetchFollowing();
  }, [profile?.id]);

  // network related helpers
  async function fetchFollowers() {
    try {
      if (!profile?.id) return;

      const apiRResponse: ApiResponse<ApplicationUserEntity[]> = (
        await API.get(
          `/relation/get-followers/${profile?.id}?page=${followersPage}&pageSize=${pageSize}`
        )
      ).data;

      if (!apiRResponse.success) {
        showErrorToast(
          apiRResponse.message ||
            "Unknown error occurred while fetching followers"
        );
        return;
      }

      setFollowers((prev) => [...prev, ...apiRResponse.data]);
      setFollowersPage((prev) => prev + 1);
    } catch (error) {
      console.log(error);
      showErrorToast("Unknown error occurred while fetching followers");
    }
  }

  async function fetchFollowing() {
    try {
      if (!profile?.id) return;

      const apiRResponse: ApiResponse<ApplicationUserEntity[]> = (
        await API.get(
          `/relation/get-followings/${profile?.id}?page=${followingPage}&pageSize=${pageSize}`
        )
      ).data;

      if (!apiRResponse.success) {
        showErrorToast(
          apiRResponse.message ||
            "Unknown error occurred while fetching following"
        );
        return;
      }

      setFollowing((prev) => [...prev, ...apiRResponse.data]);
      setFollowingPage((prev) => prev + 1);
    } catch (error) {
      console.log(error);
      showErrorToast("Unknown error occurred while fetching following");
    }
  }

  return (
    <ChatContext.Provider
      value={{
        connection,
        isConnected,
        followers,
        followersPage,
        fetchFollowers,
        userListPanelMode,
        setUserListPanelMode,
        fetchFollowing,
        following,
        followingPage,
        targetProfile,
        setTargetProfile,
        chatMessages,
        setChatMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChatContext = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used inside ChatProvider");
  return ctx;
};
