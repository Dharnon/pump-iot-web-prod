import type { TestsToPerform } from "@/lib/schemas";
import type { ExtractedSpecs } from "@/lib/pdfExtractionService";
import type { TestGeneralInfo, TestPdfData } from "../services/dtoMapper";
import type {
  BombaEntity,
  DetallesEntity,
  FluidoEntity,
  FluidoH2OEntity,
  MotorEntity,
} from "../services/entityMapper";

export type TestDetailStatus =
  | "PENDING"
  | "SIN_PROCESAR"
  | "PROCESADO"
  | "EN_PROCESO"
  | "EN_BANCO"
  | "GENERADO"
  | "GENERATED"
  | "COMPLETED";

export type TestDetailFieldValue = string | number | boolean | null | undefined;

export type PdfExtractionSpecs = ExtractedSpecs;

export interface TestDetailRecord {
  id: string;
  numeroProtocolo?: number;
  bancoId?: number;
  motorPlantillaId?: number | null;
  availableBankMotors?: BankTemplateMotor[];
  isBankChangeLocked?: boolean;
  fecha?: string;
  status: TestDetailStatus;
  generalInfo: TestGeneralInfo;
  bomba?: BombaEntity;
  cliente?: Record<string, unknown>;
  motor?: MotorEntity;
  fluido?: FluidoEntity;
  fluidoH2O?: FluidoH2OEntity;
  detalles?: DetallesEntity;
  hasPdf?: boolean;
  pdfData?: TestPdfData;
  testsToPerform?: TestsToPerform;
  createdAt?: string;
}

export interface BankTemplateMotor {
  id?: number;
  nombre?: string;
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

export interface BankTemplate {
  motorPlantilla?: BankTemplateMotor | null;
  motores?: BankTemplateMotor[] | null;
}
