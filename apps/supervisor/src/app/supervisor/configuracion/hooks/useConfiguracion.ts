import { useCallback, useState } from "react";

import { useBancosConfig } from "./useBancosConfig";
import { useMotoresConfig } from "./useMotoresConfig";

export function useConfiguracion() {
  const [activeTab, setActiveTab] = useState("bancos");
  const motoresConfig = useMotoresConfig();
  const bancosConfig = useBancosConfig(motoresConfig.motores);

  const handleSaveMotor = useCallback(async () => {
    const savedMotor = await motoresConfig.saveMotor();

    if (savedMotor) {
      bancosConfig.syncMotorReference(savedMotor);
    }
  }, [bancosConfig, motoresConfig]);

  const handleDeleteMotor = useCallback(async () => {
    const deletedMotor = await motoresConfig.deleteSelectedMotor();

    if (deletedMotor) {
      bancosConfig.clearMotorReference(deletedMotor.id);
    }
  }, [bancosConfig, motoresConfig]);

  return {
    activeTab,
    setActiveTab,
    motores: motoresConfig.motores,
    loadingMotores: motoresConfig.loadingMotores,
    motorDialogOpen: motoresConfig.motorDialogOpen,
    setMotorDialogOpen: motoresConfig.setMotorDialogOpen,
    editingMotor: motoresConfig.editingMotor,
    motorForm: motoresConfig.motorForm,
    setMotorForm: motoresConfig.setMotorForm,
    motorToDelete: motoresConfig.motorToDelete,
    setMotorToDelete: motoresConfig.setMotorToDelete,
    motorSearch: motoresConfig.motorSearch,
    setMotorSearch: motoresConfig.setMotorSearch,
    filteredMotores: motoresConfig.filteredMotores,
    handleSaveMotor,
    handleDeleteMotor,
    openMotorDialog: motoresConfig.openMotorDialog,
    bancos: bancosConfig.bancos,
    loadingBancos: bancosConfig.loadingBancos,
    bancoDialogOpen: bancosConfig.bancoDialogOpen,
    setBancoDialogOpen: bancosConfig.setBancoDialogOpen,
    editingBanco: bancosConfig.editingBanco,
    bancoForm: bancosConfig.bancoForm,
    setBancoForm: bancosConfig.setBancoForm,
    bancoToDelete: bancosConfig.bancoToDelete,
    setBancoToDelete: bancosConfig.setBancoToDelete,
    bancoSearch: bancosConfig.bancoSearch,
    setBancoSearch: bancosConfig.setBancoSearch,
    filteredBancos: bancosConfig.filteredBancos,
    handleSaveBanco: bancosConfig.saveBanco,
    handleDeleteBanco: bancosConfig.deleteSelectedBanco,
    openBancoDialog: bancosConfig.openBancoDialog,
    bancoStats: bancosConfig.bancoStats,
    motorStats: motoresConfig.motorStats,
  };
}
