import type { Banco, MotorPlantilla } from "@/lib/api";

export type ConfigurationTab = "bancos" | "motores";

export type BancoFormState = Partial<Banco>;
export type MotorFormState = Partial<MotorPlantilla>;

export function createEmptyBancoForm(): BancoFormState {
  return {
    nombre: "",
    estado: true,
    motorPlantillaId: null,
  };
}

export function createEmptyMotorForm(): MotorFormState {
  return {
    nombre: "",
    marca: "",
    tipo: "",
    potencia: null,
    velocidad: null,
    intensidad: null,
    rendimiento25: null,
    rendimiento50: null,
    rendimiento75: null,
    rendimiento100: null,
    rendimiento125: null,
  };
}

export function toBancoMotorPlantilla(motor: MotorPlantilla | undefined | null) {
  if (!motor) {
    return null;
  }

  return {
    id: motor.id,
    nombre: motor.nombre,
    marca: motor.marca ?? undefined,
    tipo: motor.tipo ?? undefined,
    potencia: motor.potencia ?? undefined,
    velocidad: motor.velocidad ?? undefined,
    intensidad: motor.intensidad ?? undefined,
    rendimiento25: motor.rendimiento25 ?? undefined,
    rendimiento50: motor.rendimiento50 ?? undefined,
    rendimiento75: motor.rendimiento75 ?? undefined,
    rendimiento100: motor.rendimiento100 ?? undefined,
    rendimiento125: motor.rendimiento125 ?? undefined,
  };
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "";
}
