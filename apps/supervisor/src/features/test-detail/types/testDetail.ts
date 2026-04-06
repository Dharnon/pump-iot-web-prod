import type { TestsToPerform } from "@/lib/schemas";
import type { TestGeneralInfo, TestPdfData } from "../services/dtoMapper";

export type TestDetailStatus =
  | "PENDING"
  | "SIN_PROCESAR"
  | "EN_PROCESO"
  | "EN_BANCO"
  | "GENERADO"
  | "GENERATED"
  | "COMPLETED";

export type TestDetailFieldValue = string | number | boolean | null | undefined;

export type PdfExtractionSpecs = Partial<TestPdfData>;

export interface TestDetailRecord {
  id: string;
  numeroProtocolo?: number;
  bancoId?: number;
  fecha?: string;
  status: TestDetailStatus;
  generalInfo: TestGeneralInfo;
  bomba?: Record<string, unknown>;
  cliente?: Record<string, unknown>;
  motor?: Record<string, unknown>;
  fluido?: Record<string, unknown>;
  fluidoH2O?: Record<string, unknown>;
  detalles?: Record<string, unknown>;
  hasPdf?: boolean;
  pdfData?: TestPdfData;
  testsToPerform?: TestsToPerform;
  createdAt?: string;
}

export interface BankTemplateMotor {
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
}
