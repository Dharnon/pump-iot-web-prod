"use client";

/**
 * Shared Detail View Component
 *
 * This component is used by both test/[id] and protocolo/[id] routes.
 * It adapts its behavior based on the viewConfig passed to it.
 */

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ChevronRight,
  FileText,
  Eye,
  EyeOff,
  Trash2,
  Wrench,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { PdfViewer } from "@/components/PdfViewer";
import { BankSelect } from "@/components/supervisor/BankSelect";
import type { UseLanguageReturn } from "@/lib/language-context";
import type { UseTestDetailPageResult } from "@/features/test-detail";

import {
  StatusBadge,
  GeneralInfoSection,
  TestsToPerformSection,
  BombaDataSection,
  FluidH2OSection,
  FluidSection,
  MotorDataSection,
  DetailsSection,
} from "@/features/test-detail";

const detailActionButtonClass =
  "h-8 rounded-md px-3 text-xs font-medium shadow-xs transition-[background-color,border-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background";

const detailMoveToBankButtonClass = `${detailActionButtonClass} border-sky-200/80 bg-sky-50/90 text-sky-700 hover:border-sky-300 hover:bg-sky-100 focus-visible:ring-sky-400 dark:border-sky-900/80 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:border-sky-800 dark:hover:bg-sky-950/70 dark:focus-visible:ring-sky-700`;

const detailReturnToGeneratedButtonClass = `${detailActionButtonClass} border-emerald-200/80 bg-emerald-50/90 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 focus-visible:ring-emerald-400 dark:border-emerald-900/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/70 dark:focus-visible:ring-emerald-700`;

interface DetailViewProps {
  hookResult: UseTestDetailPageResult;
  t: UseLanguageReturn["t"];
  backRoute?: string;
  breadcrumbLabel?: string;
  onMoveToBank?: (id: string) => void;
  onReturnToProcessed?: (id: string) => void;
}

export function DetailView({
  hookResult,
  t,
  backRoute = "/supervisor",
  breadcrumbLabel = "test.tests",
  onMoveToBank,
  onReturnToProcessed,
}: DetailViewProps) {
  const router = useRouter();
  const {
    test,
    loading,
    pdfFile,
    pdfUrl,
    removePdf,
    isDragging,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    extracting,
    handleAnalyzePdf,
    saving,
    handleSave,
    isPdfExpanded,
    pdfPanelRef,
    togglePdf,
    onPanelResize,
    testsToPerform,
    toggleTest,
    handlePdfDataChange,
    isMobile,
    viewConfig,
    deleting,
    handleDelete,
    setTest,
    handleBankChange,
  } = hookResult;

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not found state
  if (!test) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>{t("test.notFound.title")}</EmptyTitle>
            <EmptyDescription>{t("test.notFound.desc")}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => router.push(backRoute)}>
              {t("test.back")}
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between px-2 py-1.5 border-b bg-background/50 backdrop-blur-sm shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
            onClick={() => router.push(backRoute)}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium shrink-0">
              <span>{t(breadcrumbLabel)}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="truncate max-w-[100px] sm:max-w-[200px]">
                {test.generalInfo.pedido}
              </span>
            </div>
            <span className="text-muted-foreground/30 text-sm font-light">
              /
            </span>
            <h1
              className="text-sm sm:text-base font-semibold tracking-tight text-foreground truncate"
              title={test.generalInfo.cliente}
            >
              {test.generalInfo.cliente}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={test.status} />

          {onMoveToBank &&
            (test.status === "GENERATED" || test.status === "GENERADO") && (
              <Button
                variant="outline"
                size="sm"
                className={detailMoveToBankButtonClass}
                onClick={() => onMoveToBank(test.id)}
                aria-label="Enviar a banco"
              >
                <Wrench className="w-3.5 h-3.5 mr-1.5" />
                Enviar a banco
              </Button>
            )}

          {onReturnToProcessed && test.status === "EN_BANCO" && (
            <Button
              variant="outline"
              size="sm"
              className={detailReturnToGeneratedButtonClass}
              onClick={() => onReturnToProcessed(test.id)}
              aria-label="Regresar a generado"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Regresar a generado
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente
                  este{" "}
                  {viewConfig.mode === "PENDING" ? "registro" : "protocolo"} y
                  toda su información.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Confirmar eliminación
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {viewConfig.showSaveButton && (
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                test.status === "SIN_PROCESAR" ||
                (viewConfig.mode === "PENDING" &&
                  (test.status === "GENERATED" || test.status === "PROCESADO"))
              }
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all text-xs font-semibold px-0 w-8 h-8 flex items-center justify-center"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
            </Button>
          )}
        </div>
      </header>

      {/* Resizable Content */}
      <div className="flex-1 min-h-0 bg-muted/20">
        <ResizablePanelGroup
          direction={isMobile ? "vertical" : "horizontal"}
          key={isMobile ? "v" : "h"}
        >
          {/* PDF Panel */}
          <ResizablePanel
            id="pdf-panel"
            ref={pdfPanelRef}
            defaultSize={33}
            minSize={0}
            collapsible
            onResize={onPanelResize}
            className="relative flex flex-col bg-background transition-colors"
          >
            <PdfViewer
              file={pdfFile}
              url={pdfUrl}
              onUpload={
                viewConfig.showPdfUpload ? handleFileUpload : (_e) => {}
              }
              onRemove={removePdf}
              onDrop={viewConfig.showPdfUpload ? handleDrop : (_e) => {}}
              onDragOver={
                viewConfig.showPdfUpload ? handleDragOver : (_e) => {}
              }
              onDragLeave={
                viewConfig.showPdfUpload ? handleDragLeave : (_e) => {}
              }
              isDragging={isDragging}
              onAnalyze={
                viewConfig.showPdfUpload ? handleAnalyzePdf : undefined
              }
              isAnalyzing={extracting}
              t={t}
            />
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="bg-border focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          {/* Data Panel */}
          <ResizablePanel
            defaultSize={67}
            minSize={30}
            className="bg-background/50 backdrop-blur-sm"
          >
            <Tabs defaultValue="data" className="h-full flex flex-col">
              <div className="px-2 max-[2048px]:px-1 max-[1600px]:px-0.75 md:px-3 border-b bg-background/50 backdrop-blur-sm shrink-0">
                <TabsList
                  variant="line"
                  className="h-9 max-[2048px]:h-7 max-[1600px]:h-6.5 w-full justify-start gap-4 max-[2048px]:gap-2.5 max-[1600px]:gap-2"
                >
                  <TabsTrigger
                    value="data"
                    className="px-0 py-1.5 max-[2048px]:py-0.75 max-[1600px]:py-0.5 text-xs max-[2048px]:text-[10px] max-[1600px]:text-[9px] uppercase tracking-widest"
                  >
                    Datos
                  </TabsTrigger>
                  {viewConfig.mode === "GENERATED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        togglePdf();
                      }}
                      className="h-7 max-[2048px]:h-6 max-[1600px]:h-5.5 gap-1 text-muted-foreground hover:text-primary transition-colors ml-2"
                      title={isPdfExpanded ? "Colapsar PDF" : "Expandir PDF"}
                    >
                      {isPdfExpanded ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span className="text-[9px] max-[1600px]:text-[8px] uppercase tracking-wider font-bold">
                            PDF
                          </span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span className="text-[9px] max-[1600px]:text-[8px] uppercase tracking-wider font-bold">
                            PDF
                          </span>
                        </>
                      )}
                    </Button>
                  )}
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-1.5 max-[2048px]:p-0.75 max-[1600px]:p-0.5 md:p-2 space-y-3 max-[2048px]:space-y-1.5 max-[1600px]:space-y-1">
                  <TabsContent
                    value="data"
                    className="space-y-3 max-[2048px]:space-y-1.5 max-[1600px]:space-y-1 mt-0"
                  >
                    {/* General Info Section */}
                    <GeneralInfoSection
                      generalInfo={test.generalInfo}
                      bancoId={test.bancoId ?? null}
                      onBankChange={handleBankChange}
                      t={t}
                      onDataChange={handlePdfDataChange}
                      allFieldsEditable={viewConfig.allFieldsEditable}
                      showQty={viewConfig.mode === "PENDING"}
                      isPending={viewConfig.mode === "PENDING"}
                    />

                    {/* Tests to Perform Section - Only in PENDING mode */}
                    {viewConfig.mode === "PENDING" && (
                      <TestsToPerformSection
                        testsToPerform={testsToPerform}
                        onToggleTest={toggleTest}
                        t={t}
                      />
                    )}

                    {/* Bomba Data Section */}
                    <BombaDataSection
                      pdfData={test.pdfData}
                      generalInfo={test.generalInfo}
                      onDataChange={handlePdfDataChange}
                      allFieldsEditable={viewConfig.allFieldsEditable}
                    />

                    {/* Fluid Section - Punto Garantizado en Fluido */}
                    <FluidSection
                      pdfData={test.pdfData}
                      onDataChange={handlePdfDataChange}
                      allFieldsEditable={viewConfig.allFieldsEditable}
                    />

                    {/* Fluid H2O Section - Punto Garantizado en Agua (calculado desde fluido) */}
                    <FluidH2OSection
                      pdfData={test.pdfData}
                      onDataChange={handlePdfDataChange}
                      allFieldsEditable={viewConfig.allFieldsEditable}
                    />

                    {/* Motor Data Section - Show if configured or if not pending */}
                    {viewConfig.showExtendedSections && (
                      <MotorDataSection
                        pdfData={test.pdfData}
                        onDataChange={handlePdfDataChange}
                        allFieldsEditable={viewConfig.allFieldsEditable}
                      />
                    )}

                    {/* Details Section - Always separate but internally hidden if no extended sections */}
                    <DetailsSection
                      pdfData={test.pdfData}
                      onDataChange={handlePdfDataChange}
                      allFieldsEditable={viewConfig.allFieldsEditable}
                      showExtendedSections={viewConfig.showExtendedSections}
                    />
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
