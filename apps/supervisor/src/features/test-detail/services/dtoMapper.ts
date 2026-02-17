/**
 * DTO Mapper Service
 * 
 * Transforms application data to backend DTOs (Data Transfer Objects).
 * Follows Single Responsibility Principle: Only handles data transformation.
 * Dependency Inversion: Business logic depends on this abstraction, not implementation.
 */

export interface TestGeneralInfo {
  pedido: string;
  posicion?: string;
  cliente: string;
  modeloBomba?: string;
  ordenTrabajo?: string;
  numeroBombas: number;
  fecha?: string;
  item?: string;
  pedidoCliente?: string;
}

export interface TestPdfData {
  // Bomba fields
  item?: string;
  modeloBomba?: string;
  suctionDiameter?: number;
  dischargeDiameter?: number;
  impellerDiameter?: string;
  sealType?: string;
  vertical?: boolean | string;
  
  // H2O Point
  flowRate?: number;
  head?: number;
  rpm?: number;
  maxPower?: number;
  efficiency?: number;
  npshr?: number;
  qMin?: number;
  bepFlow?: number;

  // Fluid Point
  liquidDescription?: string;
  temperature?: number;
  viscosity?: number;
  density?: number;
  fluidFlowRate?: number;
  fluidHead?: number;
  fluidRpm?: number;
  fluidPower?: number;
  fluidEfficiency?: number;
  cq?: number;
  ch?: number;
  ce?: number;

  // Comments
  tolerance?: string;
  internalComment?: string;
  
  // Detailed Data
  detallesCorreccionManometrica?: number;
  detallesPresionAtmosferica?: number;
  detallesTemperaturaAgua?: number;
  detallesTemperaturaAmbiente?: number;
  detallesTemperaturaLadoAcoplamiento?: number;
  detallesTemperaturaLadoBomba?: number;
  detallesTiempoFuncionamientoBomba?: number;

  // Motor Data
  motorMarca?: string;
  motorTipo?: string;
  motorPotencia?: number;
  motorVelocidad?: number;
  motorIntensidad?: number;
  motorRendimiento25?: number;
  motorRendimiento50?: number;
  motorRendimiento75?: number;
  motorRendimiento100?: number;
  motorRendimiento125?: number;
}

export interface TestSaveDTO {
  status?: string; // Optional, only set when finalizing from PENDING
  bancoId: number;
  generalInfo: {
    pedido: string;
    cliente: string;
    modeloBomba?: string;
    ordenTrabajo?: string;
    numeroBombas: number;
    fecha?: string;
    item?: string;
    pedidoCliente?: string;
    posicion?: string;
  };
  pdfData?: {
    // Bomba fields
    item?: string;
    modeloBomba?: string;
    suctionDiameter?: string;
    dischargeDiameter?: string;
    impellerDiameter?: string;
    sealType?: string;
    vertical?: string;
    
    // H2O Point
    flowRate?: string;
    head?: string;
    rpm?: string;
    maxPower?: string;
    efficiency?: string;
    npshr?: string;
    qMin?: string;
    bepFlow?: string;

    // Fluid Point
    liquidDescription?: string;
    temperature?: string;
    viscosity?: string;
    density?: string;
    fluidFlowRate?: string;
    fluidHead?: string;
    fluidRpm?: string;
    fluidPower?: string;
    fluidEfficiency?: string;
    cq?: string;
    ch?: string;
    ce?: string;

    // Comments
    tolerance?: string;
    internalComment?: string;
    
    // Detailed Data
    detallesCorreccionManometrica?: string;
    detallesPresionAtmosferica?: string;
    detallesTemperaturaAgua?: string;
    detallesTemperaturaAmbiente?: string;
    detallesTemperaturaLadoAcoplamiento?: string;
    detallesTemperaturaLadoBomba?: string;
    detallesTiempoFuncionamientoBomba?: string;

    // Motor Data
    motorMarca?: string;
    motorTipo?: string;
    motorPotencia?: string;
    motorVelocidad?: string;
    motorIntensidad?: string;
    motorRendimiento25?: string;
    motorRendimiento50?: string;
    motorRendimiento75?: string;
    motorRendimiento100?: string;
    motorRendimiento125?: string;
  } | null;
}

/**
 * Maps application test data to backend DTO format
 * 
 * @param generalInfo - General test information
 * @param pdfData - Extracted PDF data
 * @param bancoId - Test bench ID (defaults to 1)
 * @param setStatusGenerated - Whether to set status to GENERADO (true for PENDING mode finalization)
 * @returns Backend-compatible DTO object
 */
export function mapTestToSaveDTO(
  generalInfo: TestGeneralInfo,
  pdfData: TestPdfData | null | undefined,
  bancoId: number = 1,
  setStatusGenerated: boolean = true
): TestSaveDTO {
  // Helper to safely convert any value to string or undefined
  const toString = (val: any) => val !== undefined && val !== null ? String(val) : undefined;

  return {
    status: setStatusGenerated ? "GENERADO" : undefined,
    bancoId: bancoId,
    generalInfo: {
      pedido: generalInfo.pedido,
      cliente: generalInfo.cliente,
      modeloBomba: generalInfo.modeloBomba,
      ordenTrabajo: generalInfo.ordenTrabajo,
      numeroBombas: generalInfo.numeroBombas,
      fecha: generalInfo.fecha,
      item: generalInfo.item,
      pedidoCliente: generalInfo.pedidoCliente,
      posicion: generalInfo.posicion
    },
    pdfData: pdfData ? {
      // Bomba fields
      item: pdfData.item,
      modeloBomba: pdfData.modeloBomba,
      suctionDiameter: toString(pdfData.suctionDiameter),
      dischargeDiameter: toString(pdfData.dischargeDiameter),
      impellerDiameter: toString(pdfData.impellerDiameter),
      sealType: pdfData.sealType,
      vertical: toString(pdfData.vertical),
      
      // H2O Point
      flowRate: toString(pdfData.flowRate),
      head: toString(pdfData.head),
      rpm: toString(pdfData.rpm),
      maxPower: toString(pdfData.maxPower),
      efficiency: toString(pdfData.efficiency),
      npshr: toString(pdfData.npshr),
      qMin: toString(pdfData.qMin),
      bepFlow: toString(pdfData.bepFlow),

      // Fluid Point
      liquidDescription: pdfData.liquidDescription,
      temperature: toString(pdfData.temperature),
      viscosity: toString(pdfData.viscosity),
      density: toString(pdfData.density),
      fluidFlowRate: toString(pdfData.fluidFlowRate),
      fluidHead: toString(pdfData.fluidHead),
      fluidRpm: toString(pdfData.fluidRpm),
      fluidPower: toString(pdfData.fluidPower),
      fluidEfficiency: toString(pdfData.fluidEfficiency),
      cq: toString(pdfData.cq),
      ch: toString(pdfData.ch),
      ce: toString(pdfData.ce),

      // Comments
      tolerance: pdfData.tolerance,
      internalComment: pdfData.internalComment,
      
      // Detailed Data
      detallesCorreccionManometrica: toString(pdfData.detallesCorreccionManometrica),
      detallesPresionAtmosferica: toString(pdfData.detallesPresionAtmosferica),
      detallesTemperaturaAgua: toString(pdfData.detallesTemperaturaAgua),
      detallesTemperaturaAmbiente: toString(pdfData.detallesTemperaturaAmbiente),
      detallesTemperaturaLadoAcoplamiento: toString(pdfData.detallesTemperaturaLadoAcoplamiento),
      detallesTemperaturaLadoBomba: toString(pdfData.detallesTemperaturaLadoBomba),
      detallesTiempoFuncionamientoBomba: toString(pdfData.detallesTiempoFuncionamientoBomba),

      // Motor Data
      motorMarca: pdfData.motorMarca,
      motorTipo: pdfData.motorTipo,
      motorPotencia: toString(pdfData.motorPotencia),
      motorVelocidad: toString(pdfData.motorVelocidad),
      motorIntensidad: toString(pdfData.motorIntensidad),
      motorRendimiento25: toString(pdfData.motorRendimiento25),
      motorRendimiento50: toString(pdfData.motorRendimiento50),
      motorRendimiento75: toString(pdfData.motorRendimiento75),
      motorRendimiento100: toString(pdfData.motorRendimiento100),
      motorRendimiento125: toString(pdfData.motorRendimiento125)
    } : null
  };
}
