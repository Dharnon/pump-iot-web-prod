/**
 * useSignalR.ts
 *
 * Hook that manages a SignalR connection to the backend ProtocolHub.
 * Provides:
 *   - connectionState: HubConnectionState (Connected / Disconnected / Reconnecting)
 *   - locks: Map of protocolId → deviceName (who is editing what)
 *   - lockProtocol(id): acquire editing lock on a protocol
 *   - unlockProtocol(id): release the lock
 *   - onListUpdated: fires when the protocol list changes (new protocol generated)
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
  import.meta.env?.VITE_API_URL ?? "http://127.0.0.1:5002";

const HUB_URL = `${API_BASE_URL}/hubs/protocol`;

// Device name identifies this tablet in the UI. Uses hostname or a random suffix.
const DEVICE_NAME =
  typeof window !== "undefined"
    ? window.location.hostname || `Tablet-${Math.random().toString(36).slice(2, 6)}`
    : "Tablet";

export type Locks = Record<string, string>; // protocolId → deviceName

interface UseSignalROptions {
  onListUpdated?: () => void;
}

export interface UseSignalRResult {
  connectionState: HubConnectionState;
  locks: Locks;
  lockProtocol: (protocolId: string) => void;
  unlockProtocol: (protocolId: string) => void;
  isConnected: boolean;
}


export function useSignalR({ onListUpdated }: UseSignalROptions = {}): UseSignalRResult {
  const connectionRef = useRef<HubConnection | null>(null);
  // Tracks the CURRENT connection to prevent StrictMode's stale onclose from wiping state
  const activeConnectionRef = useRef<HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<HubConnectionState>(
    HubConnectionState.Disconnected
  );
  const [locks, setLocks] = useState<Locks>({});

  // Keep onListUpdated ref stable so the effect doesn't re-run on every render
  const onListUpdatedRef = useRef(onListUpdated);
  onListUpdatedRef.current = onListUpdated;

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        // Skip the HTTP negotiate handshake and go directly to WebSocket.
        // This avoids CORS issues with the /negotiate endpoint.
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();


    connectionRef.current = connection;
    activeConnectionRef.current = connection; // mark as the active connection

    // ─── Event handlers ───────────────────────────────────────────────────────

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

    connection.on("LockDenied", (protocolId: string, by: string) => {
      console.warn(`[SignalR] Lock denied on ${protocolId} — held by ${by}`);
    });

    connection.on("ProtocolListUpdated", () => {
      onListUpdatedRef.current?.();
    });

    // ─── State change callbacks ─── guard against stale connection ────────────

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

    // ─── Start connection ─────────────────────────────────────────────────────

    // Use promise chain so cleanup never calls stop() before start() resolves.
    // Prevents: "Failed to start the HttpConnection before stop() was called"
    let isCancelled = false;
    const startPromise = connection
      .start()
      .then(() => {
        if (!isCancelled) setConnectionState(HubConnectionState.Connected);
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error("[SignalR] Connection failed:", err);
          setConnectionState(HubConnectionState.Disconnected);
        }
      });

    return () => {
      isCancelled = true;
      // Wait for start to settle, then stop gracefully
      startPromise.finally(() => connection.stop());
    };
  }, []); // Only run once on mount

  const lockProtocol = useCallback((protocolId: string) => {
    connectionRef.current
      ?.invoke("LockProtocol", protocolId, DEVICE_NAME)
      .catch((err) => console.error("[SignalR] LockProtocol error:", err));
  }, []);

  const unlockProtocol = useCallback((protocolId: string) => {
    connectionRef.current
      ?.invoke("UnlockProtocol", protocolId)
      .catch((err) => console.error("[SignalR] UnlockProtocol error:", err));
  }, []);

  return {
    connectionState,
    locks,
    lockProtocol,
    unlockProtocol,
    isConnected: connectionState === HubConnectionState.Connected,
  };
}

