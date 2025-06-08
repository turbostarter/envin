"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import type { HotReloadChange } from "@/cli/utils/hot-reload/types";

/**
 * Hook that detects any "reload" event sent from the CLI's web socket
 * and calls the received parameter callback
 */
export const useHotreload = (
  onShouldReload: (changes: HotReloadChange[]) => void,
) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io();
    }
    const socket = socketRef.current;

    socket.on("reload", (changes: HotReloadChange[]) => {
      console.debug("Reloading...");
      void onShouldReload(changes);
    });

    return () => {
      socket.off();
    };
  }, [onShouldReload]);
};
