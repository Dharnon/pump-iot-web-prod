import type { MotorPlantilla } from "@/lib/api";

import type { useConfigurationData } from "./use-configuration-data";

type ConfigurationData = ReturnType<typeof useConfigurationData>;

export function useConfigurationActions(data: ConfigurationData) {
  const { bancos, motores } = data;

  const handleSaveMotor = async () => {
    const savedMotor = await motores.saveMotor();

    if (savedMotor) {
      bancos.syncMotorReference(savedMotor);
    }

    return savedMotor;
  };

  const handleDeleteMotor = async () => {
    const deletedMotor = await motores.deleteSelectedMotor();

    if (deletedMotor) {
      bancos.clearMotorReference(deletedMotor.id);
    }

    return deletedMotor;
  };

  const handleSaveBanco = async () => {
    return bancos.saveBanco();
  };

  const handleDeleteBanco = async () => {
    return bancos.deleteSelectedBanco();
  };

  const openMotorDialog = (motor?: MotorPlantilla) =>
    motores.openMotorDialog(motor);

  const openBancoDialog = (
    banco?: Parameters<typeof bancos.openBancoDialog>[0],
  ) => bancos.openBancoDialog(banco);

  return {
    handleSaveMotor,
    handleDeleteMotor,
    handleSaveBanco,
    handleDeleteBanco,
    openMotorDialog,
    openBancoDialog,
  };
}
