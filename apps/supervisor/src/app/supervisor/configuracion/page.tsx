"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, Zap, Database } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useConfiguracion } from "./hooks/useConfiguracion";
import { MotorFormDialog } from "./components/motor-form-dialog";
import { BancoFormDialog } from "./components/banco-form-dialog";
import { BancosTable } from "./components/bancos-table";
import { MotoresTable } from "./components/motores-table";

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

  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-2 border-b bg-background/50 backdrop-blur-sm shrink-0 gap-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold tracking-tight">
              {t("config.title")}
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {t("config.desc")}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-6"
        >
          <div className="flex w-full flex-row items-center justify-start">
            <TabsList>
              <TabsTrigger value="bancos" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                {t("config.bancos")}
                <Badge variant="secondary" className="ml-1">
                  {bancoStats.total}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="motores" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                {t("config.motores")}
                <Badge variant="secondary" className="ml-1">
                  {motorStats.total}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Pestaña Bancos */}
          <TabsContent value="bancos" className="space-y-4 outline-none">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("config.bancos.total")}
                  </CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bancoStats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("config.bancos.active")}
                  </CardTitle>
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bancoStats.activos}</div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-muted-foreground/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("config.bancos.inactive")}
                  </CardTitle>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {bancoStats.inactivos}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bancos Table Area */}
            <Card className="w-full border-none bg-transparent shadow-none">
              <CardHeader className="px-0 pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>{t("config.bancos.manage")}</CardTitle>
                    <CardDescription>{t("config.bancos.desc")}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-[300px]">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t("table.search")}
                        value={bancoSearch}
                        onChange={(e) => setBancoSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Button onClick={() => openBancoDialog()}>
                      <Plus className="mr-2 h-4 w-4" />
                      {t("config.bancos.new")}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <BancosTable
                  bancos={filteredBancos}
                  loading={loadingBancos}
                  onEdit={openBancoDialog}
                  onDelete={setBancoToDelete}
                  searchQuery={bancoSearch}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña Motores */}
          <TabsContent value="motores" className="space-y-4 outline-none">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-1">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("config.motores.total")}
                  </CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{motorStats.total}</div>
                </CardContent>
              </Card>
            </div>

            {/* Motores Table Area */}
            <Card className="w-full border-none bg-transparent shadow-none">
              <CardHeader className="px-0 pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>{t("config.motores.manage")}</CardTitle>
                    <CardDescription>
                      {t("config.motores.desc")}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-[300px]">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t("table.search")}
                        value={motorSearch}
                        onChange={(e) => setMotorSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Button onClick={() => openMotorDialog()}>
                      <Plus className="mr-2 h-4 w-4" />
                      {t("config.motores.new")}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <MotoresTable
                  motores={filteredMotores}
                  loading={loadingMotores}
                  onEdit={openMotorDialog}
                  onDelete={setMotorToDelete}
                  searchQuery={motorSearch}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Forms and Dialogs */}
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

      {/* Delete Confirmation for Motor */}
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

      {/* Delete Confirmation for Banco */}
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
