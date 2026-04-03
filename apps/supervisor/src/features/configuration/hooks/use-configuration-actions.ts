import { useCallback } from "react";

import type { MotorPlantilla } from "@/lib/api";

import type { useConfigurationData } from "./use-configuration-data";

type ConfigurationData = ReturnType<typeof useConfigurationData>;

export function useConfigurationActions(data: ConfigurationData) {
  const handleSaveMotor = useCallback(async () => {
    const savedMotor = await data.motores.saveMotor();

    if (savedMotor) {
      data.bancos.syncMotorReference(savedMotor);
    }

    return savedMotor;
  }, [data.bancos, data.motores]);

  const handleDeleteMotor = useCallback(async () => {
    const deletedMotor = await data.motores.deleteSelectedMotor();

    if (deletedMotor) {
      data.bancos.clearMotorReference(deletedMotor.id);
    }

    return deletedMotor;
  }, [data.bancos, data.motores]);

  const handleSaveBanco = useCallback(async () => {
    return data.bancos.saveBanco();
  }, [data.bancos]);

  const handleDeleteBanco = useCallback(async () => {
    return data.bancos.deleteSelectedBanco();
  }, [data.bancos]);

  const openMotorDialog = useCallback(
    (motor?: MotorPlantilla) => data.motores.openMotorDialog(motor),
    [data.motores],
  );

  const openBancoDialog = useCallback(
    (banco?: Parameters<typeof data.bancos.openBancoDialog>[0]) =>
      data.bancos.openBancoDialog(banco),
    [data.bancos],
  );

  return {
    handleSaveMotor,
    handleDeleteMotor,
    handleSaveBanco,
    handleDeleteBanco,
    openMotorDialog,
    openBancoDialog,
  };
}
