"use client";

import { type ComponentType, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupervisorPageHeader } from "@/components/supervisor/supervisor-page-header-context";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Database, Plus, Search, Settings2, Zap } from "lucide-react";

import { useLanguage } from "@/lib/language-context";
import { BancoFormDialog } from "./components/banco-form-dialog";
import { BancosTable } from "./components/bancos-table";
import { MotorFormDialog } from "./components/motor-form-dialog";
import { MotoresTable } from "./components/motores-table";
import { useConfiguracion } from "./hooks/useConfiguracion";

export default function ConfiguracionPage() {
  const { t } = useLanguage();
  const {
    activeTab,
    setActiveTab,
    motores,
    loadingMotores,
    motorDialogOpen,
    setMotorDialogOpen,
    editingMotor,
    motorForm,
    setMotorForm,
    motorToDelete,
    setMotorToDelete,
    motorSearch,
    setMotorSearch,
    filteredMotores,
    handleSaveMotor,
    handleDeleteMotor,
    openMotorDialog,
    bancos,
    loadingBancos,
    bancoDialogOpen,
    setBancoDialogOpen,
    editingBanco,
    bancoForm,
    setBancoForm,
    bancoToDelete,
    setBancoToDelete,
    bancoSearch,
    setBancoSearch,
    filteredBancos,
    handleSaveBanco,
    handleDeleteBanco,
    openBancoDialog,
    bancoStats,
    motorStats,
  } = useConfiguracion();

  const bancosWithMotor = useMemo(
    () => bancos.filter((banco) => banco.motorPlantillaId != null).length,
    [bancos],
  );

  const bancosWithoutMotor = useMemo(
    () => bancos.filter((banco) => banco.motorPlantillaId == null).length,
    [bancos],
  );

  const activeSearch = activeTab === "bancos" ? bancoSearch : motorSearch;
  const setActiveSearch =
    activeTab === "bancos" ? setBancoSearch : setMotorSearch;

  const configuracionHeader = useMemo(
    () => ({
      density: "compact" as const,
      center: (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Configuracion
              </span>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {activeTab === "bancos" ? "Bancos" : "Motores"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      ),
    }),
    [activeTab],
  );

  useSupervisorPageHeader(configuracionHeader);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--supervisor-page-background)]">
      <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
        <div className="grid auto-rows-min gap-3 md:grid-cols-3">
          <ConfigStatCard
            title="Bancos activos"
            value={bancoStats.activos}
            description="Bancos listos para operar dentro del entorno."
            icon={Database}
          />
          <ConfigStatCard
            title="Sin motor asignado"
            value={bancosWithoutMotor}
            description="Pendientes de vincular con una plantilla de motor."
            icon={Settings2}
          />
          <ConfigStatCard
            title="Plantillas de motor"
            value={motorStats.total}
            description={`${bancosWithMotor} bancos usan una plantilla actualmente.`}
            icon={Zap}
          />
        </div>

        <section className="min-h-[calc(100vh-13rem)] flex flex-1 flex-col gap-4 rounded-xl border border-border/60 bg-card/50 p-4 md:min-h-min md:p-5">
          <div className="flex flex-col gap-3 border-b border-border/50 pb-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  Workspace de configuracion
                </h2>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Bancos queda como vista principal y motores como catalogo de
                  soporte para asignaciones y mantenimiento.
                </p>
              </div>

              <div className="flex w-full flex-col gap-2 xl:w-auto xl:min-w-[34rem]">
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="relative min-w-0">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={activeSearch}
                      onChange={(event) => setActiveSearch(event.target.value)}
                      placeholder={
                        activeTab === "bancos"
                          ? "Buscar banco o motor asignado"
                          : "Buscar plantilla, marca o tipo"
                      }
                      className="pl-9"
                    />
                  </div>

                  <Button
                    onClick={() =>
                      activeTab === "bancos"
                        ? openBancoDialog()
                        : openMotorDialog()
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {activeTab === "bancos" ? "Nuevo banco" : "Nuevo motor"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full lg:w-auto"
              >
                <TabsList variant="line" className="flex-wrap">
                  <TabsTrigger value="bancos">
                    Bancos
                    <Badge variant="secondary">{bancoStats.total}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="motores">
                    Motores
                    <Badge variant="secondary">{motorStats.total}</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <p className="text-xs text-muted-foreground lg:text-right">
                {activeTab === "bancos"
                  ? `${bancosWithMotor} bancos vinculados a motor y ${bancoStats.inactivos} inactivos.`
                  : "Catalogo de plantillas reutilizable para asignar y mantener motores."}
              </p>
            </div>
          </div>

          <div className="flex min-h-[520px] flex-1 flex-col rounded-xl bg-muted/35 p-1">
            {activeTab === "bancos" ? (
              <BancosTable
                bancos={filteredBancos}
                loading={loadingBancos}
                onEdit={openBancoDialog}
                onDelete={setBancoToDelete}
                searchQuery={bancoSearch}
              />
            ) : (
              <MotoresTable
                motores={filteredMotores}
                loading={loadingMotores}
                onEdit={openMotorDialog}
                onDelete={setMotorToDelete}
                searchQuery={motorSearch}
              />
            )}
          </div>
        </section>
      </div>

      <MotorFormDialog
        open={motorDialogOpen}
        onOpenChange={setMotorDialogOpen}
        motor={motorForm}
        editingMotor={editingMotor}
        onChange={setMotorForm}
        onSubmit={handleSaveMotor}
      />

      <BancoFormDialog
        open={bancoDialogOpen}
        onOpenChange={setBancoDialogOpen}
        banco={bancoForm}
        editingBanco={editingBanco}
        motores={motores}
        onChange={setBancoForm}
        onSubmit={handleSaveBanco}
      />

      <AlertDialog
        open={!!motorToDelete}
        onOpenChange={(open) => !open && setMotorToDelete(null)}
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
              onClick={handleDeleteMotor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("config.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!bancoToDelete}
        onOpenChange={(open) => !open && setBancoToDelete(null)}
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
              onClick={handleDeleteBanco}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("config.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ConfigStatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/28 px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/70">
          <Icon className="size-4 text-primary" />
        </div>
      </div>
      <p className="mt-2 max-w-[18rem] text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
