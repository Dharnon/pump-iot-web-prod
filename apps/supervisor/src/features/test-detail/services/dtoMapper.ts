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
  Status: string;
  BancoId: number;
  GeneralInfo: {
    Pedido: string;
    Cliente: string;
    ModeloBomba?: string;
    OrdenTrabajo?: string;
    NumeroBombas: number;
    Fecha?: string;
    Item?: string;
    PedidoCliente?: string;
    Posicion?: string;
  };
  PdfData?: {
    // Bomba fields (PascalCase for backend)
    Item?: string;
    ModeloBomba?: string;
    SuctionDiameter?: number;
    DischargeDiameter?: number;
    ImpellerDiameter?: string;
    SealType?: string;
    Vertical?: boolean | string;
    
    // H2O Point
    FlowRate?: number;
    Head?: number;
    Rpm?: number;
    MaxPower?: number;
    Efficiency?: number;
    Npshr?: number;

    // Fluid Point
    LiquidDescription?: string;
    Temperature?: number;
    Viscosity?: number;
    Density?: number;
    FluidFlowRate?: number;
    FluidHead?: number;
    FluidRpm?: number;
    FluidPower?: number;
    FluidEfficiency?: number;
    Cq?: number;
    Ch?: number;
    Ce?: number;

    // Comments
    Tolerance?: string;
    InternalComment?: string;
    
    // Detailed Data
    DetallesCorreccionManometrica?: number;
    DetallesPresionAtmosferica?: number;
    DetallesTemperaturaAgua?: number;
    DetallesTemperaturaAmbiente?: number;
    DetallesTemperaturaLadoAcoplamiento?: number;
    DetallesTemperaturaLadoBomba?: number;
    DetallesTiempoFuncionamientoBomba?: number;

    // Motor Data
    MotorMarca?: string;
    MotorTipo?: string;
    MotorPotencia?: number;
    MotorVelocidad?: number;
    MotorIntensidad?: number;
    MotorRendimiento25?: number;
    MotorRendimiento50?: number;
    MotorRendimiento75?: number;
    MotorRendimiento100?: number;
    MotorRendimiento125?: number;
  } | null;
}

/**
 * Maps application test data to backend DTO format
 * 
 * @param generalInfo - General test information
 * @param pdfData - Extracted PDF data
 * @param bancoId - Test bench ID (defaults to 1)
 * @returns Backend-compatible DTO object
 */
export function mapTestToSaveDTO(
  generalInfo: TestGeneralInfo,
  pdfData: TestPdfData | null | undefined,
  bancoId: number = 1
): TestSaveDTO {
  return {
    Status: "GENERADO",
    BancoId: bancoId,
    GeneralInfo: {
      Pedido: generalInfo.pedido,
      Cliente: generalInfo.cliente,
      ModeloBomba: generalInfo.modeloBomba,
      OrdenTrabajo: generalInfo.ordenTrabajo,
      NumeroBombas: generalInfo.numeroBombas,
      Fecha: generalInfo.fecha,
      Item: generalInfo.item,
      PedidoCliente: generalInfo.pedidoCliente,
      Posicion: generalInfo.posicion
    },
    PdfData: pdfData ? {
      // Bomba fields
      Item: pdfData.item,
      ModeloBomba: pdfData.modeloBomba,
      SuctionDiameter: pdfData.suctionDiameter,
      DischargeDiameter: pdfData.dischargeDiameter,
      ImpellerDiameter: pdfData.impellerDiameter,
      SealType: pdfData.sealType,
      Vertical: pdfData.vertical,
      
      // H2O Point
      FlowRate: pdfData.flowRate,
      Head: pdfData.head,
      Rpm: pdfData.rpm,
      MaxPower: pdfData.maxPower,
      Efficiency: pdfData.efficiency,
      Npshr: pdfData.npshr,

      // Fluid Point
      LiquidDescription: pdfData.liquidDescription,
      Temperature: pdfData.temperature,
      Viscosity: pdfData.viscosity,
      Density: pdfData.density,
      FluidFlowRate: pdfData.fluidFlowRate,
      FluidHead: pdfData.fluidHead,
      FluidRpm: pdfData.fluidRpm,
      FluidPower: pdfData.fluidPower,
      FluidEfficiency: pdfData.fluidEfficiency,
      Cq: pdfData.cq,
      Ch: pdfData.ch,
      Ce: pdfData.ce,

      // Comments
      Tolerance: pdfData.tolerance,
      InternalComment: pdfData.internalComment,
      
      // Detailed Data
      DetallesCorreccionManometrica: pdfData.detallesCorreccionManometrica,
      DetallesPresionAtmosferica: pdfData.detallesPresionAtmosferica,
      DetallesTemperaturaAgua: pdfData.detallesTemperaturaAgua,
      DetallesTemperaturaAmbiente: pdfData.detallesTemperaturaAmbiente,
      DetallesTemperaturaLadoAcoplamiento: pdfData.detallesTemperaturaLadoAcoplamiento,
      DetallesTemperaturaLadoBomba: pdfData.detallesTemperaturaLadoBomba,
      DetallesTiempoFuncionamientoBomba: pdfData.detallesTiempoFuncionamientoBomba,

      // Motor Data
      MotorMarca: pdfData.motorMarca,
      MotorTipo: pdfData.motorTipo,
      MotorPotencia: pdfData.motorPotencia,
      MotorVelocidad: pdfData.motorVelocidad,
      MotorIntensidad: pdfData.motorIntensidad,
      MotorRendimiento25: pdfData.motorRendimiento25,
      MotorRendimiento50: pdfData.motorRendimiento50,
      MotorRendimiento75: pdfData.motorRendimiento75,
      MotorRendimiento100: pdfData.motorRendimiento100,
      MotorRendimiento125: pdfData.motorRendimiento125
    } : null
  };
}
