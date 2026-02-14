import { TestPdfData } from '../services/dtoMapper';

export const MOCK_TEST_DETAIL: any = {
  id: "MOCK-12345",
  numeroProtocolo: 12345,
  bancoId: 1,
  fecha: new Date().toISOString(),
  status: "PENDING",
  generalInfo: {
    pedido: "PED-MOCK-001",
    posicion: "10",
    cliente: "CLIENTE MOCK S.A.",
    modeloBomba: "BOMBA-X-500",
    ordenTrabajo: "OT-2024-999",
    numeroBombas: 1,
    fecha: new Date().toISOString(),
    item: "ITEM-1",
    pedidoCliente: "OC-CLIENTE-123"
  },
  testsToPerform: {},
  createdAt: new Date().toISOString(),
  hasPdf: false,
  pdfData: {
    item: "ITEM-1",
    modeloBomba: "BOMBA-X-500",
    suctionDiameter: 100,
    dischargeDiameter: 80,
    impellerDiameter: "250",
    sealType: "MECANICO",
    vertical: false,
    
    flowRate: 150,
    head: 45,
    rpm: 1450,
    maxPower: 30,
    efficiency: 75,
    npshr: 2.5,

    liquidDescription: "AGUA",
    temperature: 25,
    viscosity: 1,
    density: 1000,
    
    motorMarca: "SIEMENS",
    motorTipo: "1LA7",
    motorPotencia: 30,
    motorVelocidad: 1470,
    motorIntensidad: 55,
    
    tolerance: "ISO 9906 Grade 2B",
    internalComment: "Datos simulados para pruebas de frontend"
  } as TestPdfData
};
