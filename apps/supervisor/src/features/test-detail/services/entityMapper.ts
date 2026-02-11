/**
 * Entity Mapper Service
 * 
 * Maps backend entity data to application format (pdfData).
 * Follows Single Responsibility Principle: Only handles entity-to-pdfData mapping.
 */

import type { TestPdfData } from './dtoMapper';

interface BombaEntity {
  item?: string;
  tipo?: string;
  diametroAspiracion?: number;
  diametroImpulsion?: number;
  diametroRodete?: string;
  tipoCierre?: string;
  vertical?: boolean;
}

interface FluidoH2OEntity {
  caudal?: number;
  altura?: number;
  velocidad?: number;
  potencia?: number;
  rendimiento?: number;
  npshRequerido?: number;
}

interface FluidoEntity {
  nombre?: string;
  temperatura?: number;
  viscosidad?: number;
  densidad?: number;
  caudal?: number;
  altura?: number;
  velocidad?: number;
  potencia?: number;
  rendimiento?: number;
  caudalCoeficiente?: number;
  alturaCoeficiente?: number;
  rendimientoCoeficiente?: number;
}

interface DetallesEntity {
  comentario?: string;
  comentarioInterno?: string;
  correccionManometrica?: number;
  presionAtmosferica?: number;
  temperaturaAgua?: number;
  temperaturaAmbiente?: number;
  temperaturaLadoAcoplamiento?: number;
  temperaturaLadoBomba?: number;
  tiempoFuncionamientoBomba?: number;
}

interface MotorEntity {
  marca?: string;
  tipo?: string;
  potencia?: number;
  velocidad?: number;
  intensidad?: number;
  rendimiento25?: number;
  rendimiento50?: number;
  rendimiento75?: number;
  rendimiento100?: number;
  rendimiento125?: number;
}

export interface TestEntities {
  bomba?: BombaEntity;
  fluidoH2O?: FluidoH2OEntity;
  fluido?: FluidoEntity;
  detalles?: DetallesEntity;
  motor?: MotorEntity;
}

/**
 * Maps backend entity data to pdfData format for form editing
 * 
 * @param entities - Backend entity objects
 * @returns Mapped pdfData object
 */
export function mapEntitiesToPdfData(entities: TestEntities): TestPdfData {
  return {
    // Bomba
    item: entities.bomba?.item,
    modeloBomba: entities.bomba?.tipo,
    suctionDiameter: entities.bomba?.diametroAspiracion,
    dischargeDiameter: entities.bomba?.diametroImpulsion,
    impellerDiameter: entities.bomba?.diametroRodete,
    sealType: entities.bomba?.tipoCierre,
    vertical: entities.bomba?.vertical,
    
    // H2O Point
    flowRate: entities.fluidoH2O?.caudal,
    head: entities.fluidoH2O?.altura,
    rpm: entities.fluidoH2O?.velocidad,
    maxPower: entities.fluidoH2O?.potencia,
    efficiency: entities.fluidoH2O?.rendimiento,
    npshr: entities.fluidoH2O?.npshRequerido,

    // Fluid Point
    liquidDescription: entities.fluido?.nombre,
    temperature: entities.fluido?.temperatura,
    viscosity: entities.fluido?.viscosidad,
    density: entities.fluido?.densidad,
    fluidFlowRate: entities.fluido?.caudal,
    fluidHead: entities.fluido?.altura,
    fluidRpm: entities.fluido?.velocidad,
    fluidPower: entities.fluido?.potencia,
    fluidEfficiency: entities.fluido?.rendimiento,
    cq: entities.fluido?.caudalCoeficiente,
    ch: entities.fluido?.alturaCoeficiente,
    ce: entities.fluido?.rendimientoCoeficiente,

    // Comments / Details
    tolerance: entities.detalles?.comentario,
    internalComment: entities.detalles?.comentarioInterno,
    
    // Detailed Data
    detallesCorreccionManometrica: entities.detalles?.correccionManometrica,
    detallesPresionAtmosferica: entities.detalles?.presionAtmosferica,
    detallesTemperaturaAgua: entities.detalles?.temperaturaAgua,
    detallesTemperaturaAmbiente: entities.detalles?.temperaturaAmbiente,
    detallesTemperaturaLadoAcoplamiento: entities.detalles?.temperaturaLadoAcoplamiento,
    detallesTemperaturaLadoBomba: entities.detalles?.temperaturaLadoBomba,
    detallesTiempoFuncionamientoBomba: entities.detalles?.tiempoFuncionamientoBomba,

    // Motor Data
    motorMarca: entities.motor?.marca,
    motorTipo: entities.motor?.tipo,
    motorPotencia: entities.motor?.potencia,
    motorVelocidad: entities.motor?.velocidad,
    motorIntensidad: entities.motor?.intensidad,
    motorRendimiento25: entities.motor?.rendimiento25,
    motorRendimiento50: entities.motor?.rendimiento50,
    motorRendimiento75: entities.motor?.rendimiento75,
    motorRendimiento100: entities.motor?.rendimiento100,
    motorRendimiento125: entities.motor?.rendimiento125
  };
}
