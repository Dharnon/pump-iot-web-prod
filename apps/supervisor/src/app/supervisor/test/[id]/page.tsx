"use client";

/**
 * Test Detail Page - Refactored
 * 
 * Follows Clean Architecture and SOLID principles:
 * - Single Responsibility: Each component handles one concern
 * - Open/Closed: Extensible through composition
 * - Dependency Inversion: Depends on abstractions (hooks)
 * - Interface Segregation: Small, focused interfaces
 */

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, ChevronRight, FileText, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { PdfViewer } from "@/components/PdfViewer";
import { useLanguage } from "@/lib/language-context";

// Feature imports - clean architecture
import {
  useTestDetailPage,
  StatusBadge,
  GeneralInfoSection,
  TestsToPerformSection,
  BombaDataSection,
  FluidH2OSection,
  FluidSection,
  MotorDataSection,
  DetailsSection,
} from "@/features/test-detail";

export default function TestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  
  // Use facade hook for all page functionality
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
  } = useTestDetailPage(params.id as string, t);

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
            <Button onClick={() => router.push("/supervisor")}>{t("test.back")}</Button>
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
            onClick={() => router.push("/supervisor")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium shrink-0">
              <span>{t("test.tests")}</span>
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
          <Button
            onClick={handleSave}
            disabled={saving || test.status === "SIN_PROCESAR"}
            size="sm"
            className={test.status === "GENERADO" ? "hidden" : "bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all text-xs font-semibold px-4 h-9"}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            {t("test.finalize")}
          </Button>
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
              onUpload={handleFileUpload}
              onRemove={() => {}}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              isDragging={isDragging}
              onAnalyze={handleAnalyzePdf}
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
                  {(test.status === "GENERADO" || test.status === "GENERATED" || test.status === "COMPLETED") && (
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
                    <GeneralInfoSection generalInfo={test.generalInfo} t={t} />
                    
                    {/* Tests to Perform Section */}
                    <TestsToPerformSection 
                      testsToPerform={testsToPerform} 
                      onToggleTest={toggleTest} 
                      t={t} 
                    />
                    
                    {/* Bomba Data Section */}
                    <BombaDataSection 
                      pdfData={test.pdfData} 
                      generalInfo={test.generalInfo}
                      onDataChange={handlePdfDataChange} 
                    />
                    
                    {/* Fluid H2O Section */}
                    <FluidH2OSection 
                      pdfData={test.pdfData} 
                      onDataChange={handlePdfDataChange} 
                    />
                    
                    {/* Fluid Section */}
                    <FluidSection 
                      pdfData={test.pdfData} 
                      onDataChange={handlePdfDataChange} 
                    />
                    
                    {/* Motor Data Section - Only for non-pending tests */}
                    {test.status !== "PENDING" && (
                      <MotorDataSection 
                        pdfData={test.pdfData} 
                        onDataChange={handlePdfDataChange} 
                      />
                    )}
                    
                    {/* Details Section - Only for non-pending tests */}
                    {test.status !== "PENDING" && (
                      <DetailsSection 
                        pdfData={test.pdfData} 
                        onDataChange={handlePdfDataChange} 
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
