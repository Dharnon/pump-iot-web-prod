import type { MotorPlantilla } from "@/lib/api";

import { useConfigurationBancosState } from "@/features/configuration/hooks/use-configuration-bancos-state";

export function useBancosConfig(motores: MotorPlantilla[]) {
  return useConfigurationBancosState(motores);
}
