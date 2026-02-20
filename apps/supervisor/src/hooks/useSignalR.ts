"use client";

/**
 * useSignalR.ts (supervisor)
 *
 * Connects to the backend ProtocolHub and:
 *   - provides `locks` map (protocolId → deviceName)
 *   - provides `connectionState` for the header indicator
 *   - fires `onListUpdated` callback so the supervisor list can auto-refresh
 *
 * Note: supervisor is a Next.js app so API URL comes from NEXT_PUBLIC_API_URL.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  LogLevel,
} from "@microsoft/signalr";


const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5002";

const HUB_URL = `${API_BASE_URL}/hubs/protocol`;

export type Locks = Record<string, string>; // protocolId → deviceName

interface UseSignalROptions {
  onListUpdated?: () => void;
}

export interface UseSignalRResult {
  connectionState: HubConnectionState;
  locks: Locks;
  isConnected: boolean;
}

export function useSignalR({ onListUpdated }: UseSignalROptions = {}): UseSignalRResult {
  const connectionRef = useRef<HubConnection | null>(null);
  // Guard against StrictMode double-mount: old connection's onclose must not overwrite state
  const activeConnectionRef = useRef<HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<HubConnectionState>(
    HubConnectionState.Disconnected
  );
  const [locks, setLocks] = useState<Locks>({});

  const onListUpdatedRef = useRef(onListUpdated);
  onListUpdatedRef.current = onListUpdated;

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        // Bypass the HTTP negotiate endpoint (CORS issues) by going directly to WebSocket
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();


    connectionRef.current = connection;
    activeConnectionRef.current = connection; // mark as active

    connection.on("ActiveLocks", (snapshot: Record<string, string>) => {
      setLocks(snapshot);
    });

    connection.on("ProtocolLocked", (protocolId: string, deviceName: string) => {
      setLocks((prev) => ({ ...prev, [protocolId]: deviceName }));
    });

    connection.on("ProtocolUnlocked", (protocolId: string) => {
      setLocks((prev) => {
        const next = { ...prev };
        delete next[protocolId];
        return next;
      });
    });

    connection.on("ProtocolListUpdated", () => {
      onListUpdatedRef.current?.();
    });

    connection.onreconnecting(() => {
      if (activeConnectionRef.current === connection)
        setConnectionState(HubConnectionState.Reconnecting);
    });
    connection.onreconnected(() => {
      if (activeConnectionRef.current === connection)
        setConnectionState(HubConnectionState.Connected);
    });
    connection.onclose(() => {
      if (activeConnectionRef.current === connection)
        setConnectionState(HubConnectionState.Disconnected);
    });

    // Prevent: "Failed to start the HttpConnection before stop() was called"
    let isCancelled = false;
    const startPromise = connection
      .start()
      .then(() => {
        if (!isCancelled) setConnectionState(HubConnectionState.Connected);
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error("[SignalR Supervisor] Connection failed:", err);
          setConnectionState(HubConnectionState.Disconnected);
        }
      });

    return () => {
      isCancelled = true;
      startPromise.finally(() => connection.stop());
    };
  }, []);


  return {
    connectionState,
    locks,
    isConnected: connectionState === HubConnectionState.Connected,
  };
}
