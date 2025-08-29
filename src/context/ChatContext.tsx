import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as signalR from "@microsoft/signalr";

interface ChatContextType {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);

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

  return (
    <ChatContext.Provider value={{ connection, isConnected }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
};
