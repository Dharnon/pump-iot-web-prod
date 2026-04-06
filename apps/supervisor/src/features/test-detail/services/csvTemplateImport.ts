import type { TestsToPerform } from "@/lib/schemas";

import type { TestGeneralInfo, TestPdfData } from "./dtoMapper";

type AppliedFieldGroups = {
  generalInfo: string[];
  pdfData: string[];
  testsToPerform: string[];
};

export interface ParsedCsvTemplateImport {
  generalInfo: Partial<TestGeneralInfo>;
  pdfData: Partial<TestPdfData>;
  testsToPerform: Partial<TestsToPerform>;
  applied: AppliedFieldGroups;
  warnings: string[];
}

const TRUE_CHECK_VALUES = new Set([
  "X",
  "SI",
  "S",
  "TRUE",
  "1",
  "YES",
  "Y",
]);

const FALSE_CHECK_VALUES = new Set([
  "NO",
  "N",
  "FALSE",
  "0",
]);

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === "\"") {
      if (inQuotes && line[i + 1] === "\"") {
        current += "\"";
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ";" && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function parseCsvRows(csvContent: string): string[][] {
  const normalized = csvContent.replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");

  return lines.map((line, index) => {
    const cells = parseCsvLine(line);
    if (index === 0 && cells.length > 0) {
      cells[0] = cells[0].replace(/^\uFEFF/, "");
    }
    return cells;
  });
}

function columnToIndex(column: string): number {
  let result = 0;
  const upper = column.toUpperCase();

  for (let i = 0; i < upper.length; i += 1) {
    result = (result * 26) + (upper.charCodeAt(i) - 64);
  }

  return result - 1;
}

function getCell(rows: string[][], column: string, row: number): string {
  if (row <= 0) {
    return "";
  }

  const rowValue = rows[row - 1];
  if (!rowValue) {
    return "";
  }

  const cell = rowValue[columnToIndex(column)];
  return cell?.trim() ?? "";
}

function normalizeToken(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function parseLocalizedNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const compact = trimmed.replace(/\s+/g, "");
  const hasComma = compact.includes(",");
  const hasDot = compact.includes(".");

  let normalized = compact;
  if (hasComma && hasDot) {
    normalized = compact.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    normalized = compact.replace(",", ".");
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseCheckValue(rawValue: string): boolean | undefined {
  const token = normalizeToken(rawValue);
  if (!token) {
    return undefined;
  }

  if (TRUE_CHECK_VALUES.has(token)) {
    return true;
  }

  if (FALSE_CHECK_VALUES.has(token)) {
    return false;
  }

  return undefined;
}

function setTextField<T extends object, K extends keyof T>(
  target: Partial<T>,
  key: K,
  value: string,
  applied: string[],
) {
  const trimmed = value.trim();
  if (!trimmed) {
    return;
  }
  target[key] = trimmed as T[K];
  applied.push(String(key));
}

function setNumberField<T extends object, K extends keyof T>(
  target: Partial<T>,
  key: K,
  value: string,
  applied: string[],
) {
  const parsed = parseLocalizedNumber(value);
  if (parsed === undefined) {
    return;
  }
  target[key] = parsed as T[K];
  applied.push(String(key));
}

function setBooleanField<T extends object, K extends keyof T>(
  target: Partial<T>,
  key: K,
  value: string,
  applied: string[],
  warnings: string[],
  fieldLabel: string,
) {
  const normalized = normalizeToken(value);
  if (!normalized) {
    return;
  }

  const parsed = parseCheckValue(value);
  if (parsed === undefined) {
    warnings.push(`Valor no reconocido para "${fieldLabel}": "${value}".`);
    return;
  }

  target[key] = parsed as T[K];
  applied.push(String(key));
}

export function parseCsvTemplateImport(csvContent: string): ParsedCsvTemplateImport {
  const rows = parseCsvRows(csvContent);
  const warnings: string[] = [];

  const generalInfo: Partial<TestGeneralInfo> = {};
  const pdfData: Partial<TestPdfData> = {};
  const testsToPerform: Partial<TestsToPerform> = {};

  const applied: AppliedFieldGroups = {
    generalInfo: [],
    pdfData: [],
    testsToPerform: [],
  };

  // General info block: label in B, value in C from row 5 onward. Date in B13.
  setTextField(generalInfo, "pedido", getCell(rows, "C", 5), applied.generalInfo);
  setTextField(generalInfo, "posicion", getCell(rows, "C", 6), applied.generalInfo);
  setTextField(generalInfo, "modeloBomba", getCell(rows, "C", 7), applied.generalInfo);
  setTextField(generalInfo, "ordenTrabajo", getCell(rows, "C", 8), applied.generalInfo);
  setTextField(generalInfo, "cliente", getCell(rows, "C", 9), applied.generalInfo);
  setTextField(generalInfo, "item", getCell(rows, "C", 10), applied.generalInfo);
  setTextField(generalInfo, "pedidoCliente", getCell(rows, "C", 11), applied.generalInfo);

  const numeroBombas = parseLocalizedNumber(getCell(rows, "C", 12));
  if (numeroBombas !== undefined) {
    generalInfo.numeroBombas = Math.trunc(numeroBombas);
    applied.generalInfo.push("numeroBombas");
  }

  setTextField(generalInfo, "fecha", getCell(rows, "B", 13), applied.generalInfo);

  // Tests block: label in F, value/check in G.
  setBooleanField(
    testsToPerform,
    "performanceTest",
    getCell(rows, "G", 5),
    applied.testsToPerform,
    warnings,
    "Performance Test",
  );
  setBooleanField(
    testsToPerform,
    "npsh",
    getCell(rows, "G", 6),
    applied.testsToPerform,
    warnings,
    "NPSH",
  );
  setBooleanField(
    testsToPerform,
    "vibraciones",
    getCell(rows, "G", 7),
    applied.testsToPerform,
    warnings,
    "Vibraciones",
  );
  setBooleanField(
    testsToPerform,
    "ruido",
    getCell(rows, "G", 8),
    applied.testsToPerform,
    warnings,
    "Ruido",
  );
  setBooleanField(
    testsToPerform,
    "mrt1h",
    getCell(rows, "G", 9),
    applied.testsToPerform,
    warnings,
    "MRT 1h",
  );
  setBooleanField(
    testsToPerform,
    "mrt4h",
    getCell(rows, "G", 10),
    applied.testsToPerform,
    warnings,
    "MRT 4h",
  );
  setBooleanField(
    testsToPerform,
    "homologacion",
    getCell(rows, "G", 11),
    applied.testsToPerform,
    warnings,
    "Homologación",
  );
  setBooleanField(
    testsToPerform,
    "presenciada",
    getCell(rows, "G", 12),
    applied.testsToPerform,
    warnings,
    "Presenciada",
  );
  setBooleanField(
    testsToPerform,
    "motorDelPedido",
    getCell(rows, "G", 13),
    applied.testsToPerform,
    warnings,
    "Motor del Pedido",
  );

  // ISO 9906 Tolerance in F15/G15.
  setTextField(pdfData, "tolerance", getCell(rows, "G", 15), applied.pdfData);

  // Data sheet block: label in I, value in J.
  setTextField(pdfData, "liquidDescription", getCell(rows, "J", 5), applied.pdfData);
  setNumberField(pdfData, "temperature", getCell(rows, "J", 6), applied.pdfData);
  setNumberField(pdfData, "viscosity", getCell(rows, "J", 7), applied.pdfData);
  setNumberField(pdfData, "density", getCell(rows, "J", 8), applied.pdfData);
  setNumberField(pdfData, "fluidFlowRate", getCell(rows, "J", 9), applied.pdfData);
  setNumberField(pdfData, "fluidHead", getCell(rows, "J", 10), applied.pdfData);
  setNumberField(pdfData, "fluidRpm", getCell(rows, "J", 11), applied.pdfData);
  setNumberField(pdfData, "fluidPower", getCell(rows, "J", 12), applied.pdfData);
  setNumberField(pdfData, "fluidEfficiency", getCell(rows, "J", 13), applied.pdfData);
  setNumberField(pdfData, "npshr", getCell(rows, "J", 14), applied.pdfData);
  setNumberField(pdfData, "qMin", getCell(rows, "J", 15), applied.pdfData);
  setNumberField(pdfData, "bepFlow", getCell(rows, "J", 16), applied.pdfData);
  setNumberField(pdfData, "qMax", getCell(rows, "J", 17), applied.pdfData);

  const impellerValue = getCell(rows, "J", 18);
  if (impellerValue) {
    const impellerNumber = parseLocalizedNumber(impellerValue);
    pdfData.impellerDiameter = impellerNumber ?? impellerValue;
    applied.pdfData.push("impellerDiameter");
  }

  // Additional coefficient block: labels L6-L8, values M6-M8.
  setNumberField(pdfData, "cq", getCell(rows, "M", 6), applied.pdfData);
  setNumberField(pdfData, "ch", getCell(rows, "M", 7), applied.pdfData);
  setNumberField(pdfData, "ce", getCell(rows, "M", 8), applied.pdfData);

  // Additional water block: labels N6-N7, values O6-O7.
  setNumberField(pdfData, "flowRate", getCell(rows, "O", 6), applied.pdfData);
  setNumberField(pdfData, "head", getCell(rows, "O", 7), applied.pdfData);

  if (
    applied.generalInfo.length === 0 &&
    applied.pdfData.length === 0 &&
    applied.testsToPerform.length === 0
  ) {
    warnings.push("No se detectaron valores aplicables en el CSV.");
  }

  return {
    generalInfo,
    pdfData,
    testsToPerform,
    applied,
    warnings,
  };
}

export async function parseCsvTemplateImportFile(file: File): Promise<ParsedCsvTemplateImport> {
  const content = await file.text();
  return parseCsvTemplateImport(content);
}
