"use client";

import { useMemo } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/lib/language-context";
import { BancoFormDialog } from "@/features/configuration/components/banco-form-dialog";
import { BancosTable } from "@/features/configuration/components/bancos-table";
import { ConfigurationPage } from "@/features/configuration/components/configuration-page";
import { MotorFormDialog } from "@/features/configuration/components/motor-form-dialog";
import { MotoresTable } from "@/features/configuration/components/motores-table";
import { useConfiguration } from "@/features/configuration/hooks/use-configuration";

export default function ConfiguracionPageRoute() {
  const { t } = useLanguage();
  const configuration = useConfiguration();

  const banksWithMotor = useMemo(
    () =>
      configuration.bancos.filter((banco) => banco.motorPlantillaId != null)
        .length,
    [configuration.bancos],
  );

  const banksWithoutMotor = useMemo(
    () =>
      configuration.bancos.filter((banco) => banco.motorPlantillaId == null)
        .length,
    [configuration.bancos],
  );

  const activeSearch =
    configuration.activeTab === "bancos"
      ? configuration.bancoSearch
      : configuration.motorSearch;

  const setActiveSearch =
    configuration.activeTab === "bancos"
      ? configuration.setBancoSearch
      : configuration.setMotorSearch;

  const table =
    configuration.activeTab === "bancos" ? (
      <BancosTable
        bancos={configuration.filteredBancos}
        loading={configuration.loadingBancos}
        onEdit={configuration.openBancoDialog}
        onDelete={configuration.setBancoToDelete}
        searchQuery={configuration.bancoSearch}
      />
    ) : (
      <MotoresTable
        motores={configuration.filteredMotores}
        loading={configuration.loadingMotores}
        onEdit={configuration.openMotorDialog}
        onDelete={configuration.setMotorToDelete}
        searchQuery={configuration.motorSearch}
      />
    );

  const dialogs = (
    <>
      <MotorFormDialog
        open={configuration.motorDialogOpen}
        onOpenChange={configuration.setMotorDialogOpen}
        motor={configuration.motorForm}
        editingMotor={configuration.editingMotor}
        onChange={configuration.setMotorForm}
        onSubmit={configuration.handleSaveMotor}
      />

      <BancoFormDialog
        open={configuration.bancoDialogOpen}
        onOpenChange={configuration.setBancoDialogOpen}
        banco={configuration.bancoForm}
        editingBanco={configuration.editingBanco}
        motores={configuration.motores}
        onChange={configuration.setBancoForm}
        onSubmit={configuration.handleSaveBanco}
      />

      <AlertDialog
        open={!!configuration.motorToDelete}
        onOpenChange={(open) => !open && configuration.setMotorToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("config.motores.deleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("config.motores.deleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("config.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={configuration.handleDeleteMotor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("config.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!configuration.bancoToDelete}
        onOpenChange={(open) => !open && configuration.setBancoToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("config.bancos.deleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("config.bancos.deleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("config.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={configuration.handleDeleteBanco}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("config.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  return (
    <ConfigurationPage
      activeTab={configuration.activeTab}
      onActiveTabChange={configuration.setActiveTab}
      searchValue={activeSearch}
      onSearchValueChange={setActiveSearch}
      onCreate={() =>
        configuration.activeTab === "bancos"
          ? configuration.openBancoDialog()
          : configuration.openMotorDialog()
      }
      banksWithMotorCount={banksWithMotor}
      banksInactiveCount={configuration.bancoStats.inactivos}
      activeBanks={configuration.bancoStats.activos}
      banksWithoutMotor={banksWithoutMotor}
      motorTemplates={configuration.motorStats.total}
      table={table}
      dialogs={dialogs}
    />
  );
}
