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
    },
    {
        id: "MOCK-2",
        status: 'EN_BANCO',
        numeroSerie: "SERIE-002",
        banco: "A",
        generalInfo: {
            pedido: "PED-002",
            cliente: "Constructora Global",
            tipoDeBomba: "Sumergible S-50",
            modeloBomba: "Sumergible S-50",
            ordenDeTrabajo: "OT-1002",
            ordenTrabajo: "OT-1002",
            numeroBombas: 1
        } as any,
    },
    {
        id: "MOCK-3",
        status: 'EN_BANCO',
        numeroSerie: "SERIE-003",
        banco: "B",
        generalInfo: {
            pedido: "PED-003",
            cliente: "Aguas del Norte",
            tipoDeBomba: "Multietapa M-10",
            modeloBomba: "Multietapa M-10",
            ordenDeTrabajo: "OT-1003",
            ordenTrabajo: "OT-1003",
            numeroBombas: 5
        } as any,
    },
    {
        id: "MOCK-4",
        status: 'IN_PROGRESS',
        numeroSerie: "SERIE-004",
        banco: "C",
        generalInfo: {
            pedido: "PED-004",
            cliente: "Refinerías del Levante",
            tipoDeBomba: "Centrífuga H-400",
            modeloBomba: "Centrífuga H-400",
            ordenDeTrabajo: "OT-1004",
            ordenTrabajo: "OT-1004",
            numeroBombas: 1
        } as any,
    },
    {
        id: "MOCK-5",
        status: 'EN_BANCO',
        numeroSerie: "SERIE-005",
        banco: "A",
        generalInfo: {
            pedido: "PED-005",
            cliente: "Aceites del Norte",
            tipoDeBomba: "Hidráulica HP-100",
            modeloBomba: "Hidráulica HP-100",
            ordenDeTrabajo: "OT-1005",
            ordenTrabajo: "OT-1005",
            numeroBombas: 2
        } as any,
    },
    {
        id: "MOCK-6",
        status: 'GENERATED',
        numeroSerie: "SERIE-006",
        generalInfo: {
            pedido: "PED-006",
            cliente: "Bombas Industriales",
            tipoDeBomba: "Vertical V-200",
            modeloBomba: "Vertical V-200",
            ordenDeTrabajo: "OT-1006",
            ordenTrabajo: "OT-1006",
            numeroBombas: 3
        } as any,
    }
];
