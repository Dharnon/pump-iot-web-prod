import { Test } from '@/lib/api';

export const MOCK_TESTS: Test[] = [
    {
        id: "MOCK-1",
        status: 'PENDING',
        numeroSerie: "SERIE-001",
        generalInfo: {
            pedido: "PED-001",
            cliente: "Industrias ACME",
            tipoDeBomba: "Centrífuga X-200",
            modeloBomba: "Centrífuga X-200", // Dual field support
            ordenDeTrabajo: "OT-1001",
            ordenTrabajo: "OT-1001",         // Dual field support
            numeroBombas: 2
        } as any, // Cast to allow extra fields for UI compatibility
        createdAt: new Date().toISOString()
    },
    {
        id: "MOCK-2",
        status: 'IN_PROGRESS',
        numeroSerie: "SERIE-002",
        generalInfo: {
            pedido: "PED-002",
            cliente: "Constructora Global",
            tipoDeBomba: "Sumergible S-50",
            modeloBomba: "Sumergible S-50",
            ordenDeTrabajo: "OT-1002",
            ordenTrabajo: "OT-1002",
            numeroBombas: 1
        } as any,
        createdAt: new Date(Date.now() - 86400000).toISOString() // Yesterday
    },
    {
        id: "MOCK-3",
        status: 'GENERATED',
        numeroSerie: "SERIE-003",
        generalInfo: {
            pedido: "PED-003",
            cliente: "Aguas del Norte",
            tipoDeBomba: "Multietapa M-10",
            modeloBomba: "Multietapa M-10",
            ordenDeTrabajo: "OT-1003",
            ordenTrabajo: "OT-1003",
            numeroBombas: 5
        } as any,
        createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    }
];
