---
name: plc-websocket
description: Use when implementing real-time WebSocket connections to PLC systems via vNode for industrial pump testing applications. Covers SignalR, Socket.IO, and data polling patterns.
triggers:
  - websocket
  - signalr
  - socket.io
  - plc
  - vnode
  - tiempo real
  - realtime
  - datos plc
  - telemetry
role: specialist
scope: implementation
output-format: code
---

# PLC WebSocket Connection Expert

Specialist in implementing real-time WebSocket connections to industrial PLC systems (via vNode) for monitoring and controlling pump test benches.

## When to Use This Skill

- Connecting to vNode/Codesys PLC via WebSocket
- Implementing real-time telemetry updates (100-500ms)
- Creating PLC command interface (start, stop, set values)
- Handling connection drops and reconnection
- Managing multiple bank connections simultaneously
- Integrating with TanStack Query for state management

## Project Context

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Operator App                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Banco 1 │ │ Banco 2 │ │ Banco 3 │ │ Banco 4 │ ...  │
│  │  3D    │ │  3D    │ │  3D    │ │  3D    │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  WebSocket / SignalR │
              │  (tiempo real)       │
              └───────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  vNode (Codesys)     │
              │  → PLC                │
              └───────────────────────┘
```

### Current Stack

- **Operator App**: TanStack Query + custom WebSocket hook
- **Backend**: Not decided yet (.NET SignalR vs Node Socket.IO)
- **vNode**: Codesys/industrial virtual PLC

## Data Schema

### PLC Read Data
```typescript
interface PLCData {
  timestamp: number
  bankId: number
  readings: {
    temperature: number      // °C
    pressure: number        // bar
    flow: number           // m³/h
    rpm: number            // revolutions/min
  }
  controls: {
    pumpOn: boolean
    valveOpen: number      // 0-100%
  }
  status: 'idle' | 'running' | 'error' | 'maintenance'
}
```

### PLC Commands
```typescript
interface PLCCommand {
  bankId: number
  action: 'start' | 'stop' | 'setValve' | 'setSpeed'
  value?: number
}
```

### Update Frequency
- **Critical**: 100-500ms (temperature, pressure)
- **Normal**: 1s (RPM, flow)
- **Commands**: On-demand

## Core Patterns

### WebSocket Hook Pattern
```typescript
import { useWebSocket } from '@/hooks/usePLCConnection'

const useBankTelemetry = (bankId: number) => {
  const { data, sendCommand, connectionStatus } = useWebSocket({
    url: `ws://plc-gateway/bank/${bankId}`,
    reconnectInterval: 3000,
    onMessage: (data) => parsePLCData(data),
  })

  return { telemetry: data, sendCommand, status: connectionStatus }
}
```

### TanStack Query Integration
```typescript
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

const usePLCQuery = (bankId: number) => {
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket>()

  useEffect(() => {
    wsRef.current = new WebSocket(`ws://plc-gateway/${bankId}`)
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      queryClient.setQueryData(['plc', bankId], data)
    }

    return () => wsRef.current?.close()
  }, [bankId])

  return useQuery({
    queryKey: ['plc', bankId],
    queryFn: () => queryClient.getQueryData(['plc', bankId]),
  })
}
```

### Multi-Bank Connection
```typescript
const useAllBanks = () => {
  const [selectedBank, setSelectedBank] = useState(1)
  const bankConnections = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => 
      useBankTelemetry(i + 1)
    )
  }, [])

  return { banks: bankConnections, selectedBank, selectBank: setSelectedBank }
}
```

### Command Sending
```typescript
const sendPLCCommand = async (command: PLCCommand) => {
  const response = await fetch('/api/plc/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  })
  return response.json()
}
```

## Connection Management

### Auto-Reconnect Pattern
```typescript
const useReconnectingWebSocket = (url: string) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')
  const reconnectAttempts = useRef(0)
  const maxAttempts = 5

  const connect = useCallback(() => {
    const ws = new WebSocket(url)
    
    ws.onopen = () => {
      setStatus('connected')
      reconnectAttempts.current = 0
    }
    
    ws.onclose = () => {
      setStatus('disconnected')
      if (reconnectAttempts.current < maxAttempts) {
        reconnectAttempts.current++
        setTimeout(connect, 1000 * Math.pow(2, reconnectAttempts.current))
      }
    }

    return ws
  }, [url])

  return { status, connect }
}
```

## Constraints

### MUST DO
- Use TanStack Query for caching and state management
- Implement reconnection logic for PLC connections
- Handle connection status UI (connected/disconnected/error)
- Separate concerns: connection, parsing, state
- Support multiple banks (1-5)

### MUST NOT DO
- Don't create new WebSocket on every render
- Don't forget cleanup (close connections on unmount)
- Don't ignore connection errors
- Don't poll when WebSocket is available
- Don't hardcode URLs (use environment variables)
