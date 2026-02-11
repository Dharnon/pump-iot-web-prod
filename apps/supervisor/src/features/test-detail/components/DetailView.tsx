"use client";

/**
 * Shared Detail View Component
 * 
 * This component is used by both test/[id] and protocolo/[id] routes.
 * It adapts its behavior based on the viewConfig passed to it.
 */

import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, ChevronRight, FileText, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
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
  t: UseLanguageReturn['t'];
  backRoute?: string;
  breadcrumbLabel?: string;
}

export function DetailView({ 
  hookResult, 
  t, 
  backRoute = "/supervisor",
  breadcrumbLabel = "test.tests"
}: DetailViewProps) {
  const router = useRouter();
  const {
    test,
    loading,
    pdfFile,
    pdfUrl,
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
            <EmptyMedia variant="icon"><FileText /></EmptyMedia>
            <EmptyTitle>{t("test.notFound.title")}</EmptyTitle>
            <EmptyDescription>{t("test.notFound.desc")}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => router.push(backRoute)}>{t("test.back")}</Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-4 py-2 border-b bg-background/50 backdrop-blur-sm shrink-0 gap-2">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 -ml-2 text-muted-foreground hover:text-foreground shrink-0" 
            onClick={() => router.push(backRoute)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium shrink-0">
              <span>{t(breadcrumbLabel)}</span>
              <ChevronRight className="w-3 h-3" />
              <span>{test.generalInfo.pedido}</span>
            </div>
            <span className="text-muted-foreground/30 text-lg sm:text-xl font-light">/</span>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate" title={test.generalInfo.cliente}>
              {test.generalInfo.cliente}
            </h1>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <StatusBadge status={test.status} />
          {viewConfig.showSaveButton && (
            <Button
              onClick={handleSave}
              disabled={saving || test.status === "SIN_PROCESAR"}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all text-xs font-semibold px-4 h-9"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              {viewConfig.mode === 'PENDING' ? t("test.finalize") : "Guardar"}
            </Button>
          )}
        </div>
      </header>

      {/* Resizable Content */}
      <div className="flex-1 min-h-0 bg-muted/20">
        <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"} key={isMobile ? "v" : "h"}>
          
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
              onUpload={viewConfig.showPdfUpload ? handleFileUpload : (_e) => {}}
              onRemove={() => {}}
              onDrop={viewConfig.showPdfUpload ? handleDrop : (_e) => {}}
              onDragOver={viewConfig.showPdfUpload ? handleDragOver : (_e) => {}}
              onDragLeave={viewConfig.showPdfUpload ? handleDragLeave : (_e) => {}}
              isDragging={isDragging}
              onAnalyze={viewConfig.showPdfUpload ? handleAnalyzePdf : undefined}
              isAnalyzing={extracting}
              t={t}
            />
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-border focus-visible:ring-0 focus-visible:ring-offset-0" />

          {/* Data Panel */}
          <ResizablePanel defaultSize={55} minSize={30} className="bg-background/50 backdrop-blur-sm">
            <Tabs defaultValue="data" className="h-full flex flex-col">
              <div className="px-6 md:px-8 border-b bg-background/50 backdrop-blur-sm shrink-0">
                <TabsList variant="line" className="h-12 w-full justify-start gap-8">
                  <TabsTrigger value="data" className="px-0 py-3 text-xs uppercase tracking-widest">
                    Datos
                  </TabsTrigger>
                  {viewConfig.mode === 'GENERATED' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        togglePdf();
                      }}
                      className="h-8 gap-2 text-muted-foreground hover:text-primary transition-colors ml-4"
                      title={isPdfExpanded ? "Colapsar PDF" : "Expandir PDF"}
                    >
                      {isPdfExpanded ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span className="text-[10px] uppercase tracking-widest font-bold">Ocultar PDF</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span className="text-[10px] uppercase tracking-widest font-bold">Ver PDF</span>
                        </>
                      )}
                    </Button>
                  )}
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 md:p-6 space-y-8">
                  <TabsContent value="data" className="space-y-8 mt-0">
                    
                    {/* General Info Section */}
                    <GeneralInfoSection 
                      generalInfo={test.generalInfo} 
                      t={t}
                      onDataChange={handlePdfDataChange}
                      allFieldsEditable={viewConfig.allFieldsEditable}
                    />
                    
                    {/* Tests to Perform Section - Only in PENDING mode */}
                    {viewConfig.mode === 'PENDING' && (
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
                    
                    {/* Fluid H2O Section */}
                    <FluidH2OSection 
                      pdfData={test.pdfData} 
                      onDataChange={handlePdfDataChange} 
                      allFieldsEditable={viewConfig.allFieldsEditable}
                    />
                    
                    {/* Fluid Section */}
                    <FluidSection 
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
                    
                    {/* Details Section - Show if configured or if not pending */}
                    {viewConfig.showExtendedSections && (
                      <DetailsSection 
                        pdfData={test.pdfData} 
                        onDataChange={handlePdfDataChange} 
                        allFieldsEditable={viewConfig.allFieldsEditable}
                      />
                    )}
                    
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
