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

interface DetailViewProps {
  hookResult: UseTestDetailPageResult;
  t: UseLanguageReturn["t"];
  backRoute?: string;
  breadcrumbLabel?: string;
  onMoveToBank?: (id: string) => void;
}

export function DetailView({
  hookResult,
  t,
  backRoute = "/supervisor",
  breadcrumbLabel = "test.tests",
  onMoveToBank,
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
      <header className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 border-b bg-background/50 backdrop-blur-sm shrink-0 gap-2">
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
              <span className="truncate max-w-[100px] sm:max-w-[200px]">{test.generalInfo.pedido}</span>
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

          {onMoveToBank && (test.status === 'GENERATED' || test.status === 'GENERADO') && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
              onClick={() => onMoveToBank(test.id)}
            >
              <Wrench className="w-3.5 h-3.5 mr-1.5" />
              Banco
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border/50"
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
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
              className="bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all text-xs font-semibold px-3 h-8"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
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
            defaultSize={45}
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
            defaultSize={55}
            minSize={30}
            className="bg-background/50 backdrop-blur-sm"
          >
            <Tabs defaultValue="data" className="h-full flex flex-col">
              <div className="px-3 md:px-4 border-b bg-background/50 backdrop-blur-sm shrink-0">
                <TabsList
                  variant="line"
                  className="h-9 w-full justify-start gap-4"
                >
                  <TabsTrigger
                    value="data"
                    className="px-0 py-1.5 text-xs uppercase tracking-widest"
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
                      className="h-7 gap-1.5 text-muted-foreground hover:text-primary transition-colors ml-2"
                      title={isPdfExpanded ? "Colapsar PDF" : "Expandir PDF"}
                    >
                      {isPdfExpanded ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span className="text-[9px] uppercase tracking-wider font-bold">
                            PDF
                          </span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span className="text-[9px] uppercase tracking-wider font-bold">
                            PDF
                          </span>
                        </>
                      )}
                    </Button>
                  )}
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2 md:p-3 space-y-4">
                  <TabsContent value="data" className="space-y-4 mt-0">
                    {/* General Info Section */}
                    <GeneralInfoSection
                      generalInfo={test.generalInfo}
                      t={t}
                      onDataChange={handlePdfDataChange}
                      allFieldsEditable={viewConfig.allFieldsEditable}
                      showQty={viewConfig.mode === "PENDING"}
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
