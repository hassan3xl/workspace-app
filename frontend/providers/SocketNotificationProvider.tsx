"use client";

import React, { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell, Sparkles, AlertCircle, Info } from "lucide-react";

const NOTIFICATION_SERVER_URL =
  process.env.NEXT_PUBLIC_NOTIFICATION_SERVER_URL ||
  "https://notification.qstack.com.ng";

export const SocketNotificationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    let socket: any = null;

    const connectSocket = (ioInstance: any) => {
      if (socketRef.current) return;

      try {
        socket = ioInstance(NOTIFICATION_SERVER_URL, {
          transports: ["websocket", "polling"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
          console.log("[QStack Socket] Connected to notification server:", socket.id);
          socket.emit("subscribe", { channel: "default" });
        });

        socket.on("notification", (data: any) => {
          const payload = data.payload || {};
          const payloadRecipient = (payload.recipient || "").trim().toLowerCase();
          const userEmail = (user.user?.email || (user as any).email || user.username || "")
            .trim()
            .toLowerCase();

          // Recipient check: only trigger toast & invalidate if targeted to user or all
          if (
            userEmail &&
            payloadRecipient &&
            payloadRecipient !== userEmail &&
            payloadRecipient !== "all"
          ) {
            return;
          }

          console.log("[QStack Socket] Real-time notification received:", data);

          // 1. Toast Notification
          toast(data.title || "New Notification", {
            description: data.body || data.message || "",
            duration: 6000,
            icon: <Bell className="w-4 h-4 text-primary" />,
          });

          // 2. Invalidate React Query notifications cache for instant UI sync
          queryClient.invalidateQueries({ queryKey: ["notifications"] });

          // 3. Dispatch custom DOM event
          const customEvent = new CustomEvent("qstack:notification", {
            detail: data,
            bubbles: true,
          });
          document.dispatchEvent(customEvent);
        });

        socket.on("disconnect", () => {
          console.log("[QStack Socket] Disconnected from notification server.");
          socketRef.current = null;
        });
      } catch (err) {
        console.error("[QStack Socket] Failed to initialize socket connection:", err);
      }
    };

    // Load Socket.IO client dynamically if window.io is undefined
    if (typeof (window as any).io !== "undefined") {
      connectSocket((window as any).io);
    } else {
      const existingScript = document.getElementById("qstack-socket-io-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "qstack-socket-io-script";
        script.src = "https://cdn.socket.io/4.7.5/socket.io.min.js";
        script.async = true;
        script.onload = () => {
          if ((window as any).io) {
            connectSocket((window as any).io);
          }
        };
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", () => {
          if ((window as any).io) {
            connectSocket((window as any).io);
          }
        });
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, queryClient]);

  return <>{children}</>;
};

export default SocketNotificationProvider;
