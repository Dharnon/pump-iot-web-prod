import { useConfigurationBancosState } from "./use-configuration-bancos-state";
import { useConfigurationMotoresState } from "./use-configuration-motores-state";

export function useConfigurationData() {
  const motores = useConfigurationMotoresState();
  const bancos = useConfigurationBancosState(motores.motores);

  return {
    motores,
    bancos,
  };
}
