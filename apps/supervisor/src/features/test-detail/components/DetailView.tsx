"use client";

import { useMemo, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { UseLanguageReturn } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import type { UseTestDetailPageResult } from "@/features/test-detail";

import { BombaDataSection } from "./BombaDataSection";
import { DetailsSection } from "./DetailsSection";
import { DetailPreviewPanel } from "./DetailPreviewPanel";
import { DetailStateActions } from "./DetailStateActions";
import { FluidH2OSection } from "./FluidH2OSection";
import { FluidSection } from "./FluidSection";
import { GeneralInfoSection } from "./GeneralInfoSection";
import { MotorDataSection } from "./MotorDataSection";
import {
  TestDetailHeaderCenter,
  TestDetailHeaderEnd,
} from "./TestDetailHeader";
import { TestsToPerformSection } from "./TestsToPerformSection";
import { useSupervisorPageHeader } from "@/components/supervisor/supervisor-page-header-context";

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
    togglePdf,
    testsToPerform,
    toggleTest,
    handlePdfDataChange,
    isMobile,
    viewConfig,
    deleting,
    handleDelete,
    handleBankChange,
  } = hookResult;

  const [previewMode, setPreviewMode] = useState<"pdf" | "excel">("pdf");

  const shouldShowTestsToPerform = viewConfig.mode === "PENDING";

  const formSurface = useMemo(() => {
    if (!test) {
      return null;
    }

    return (
      <div className="flex flex-col gap-5 pb-2">
        {/* Row 1: Información general | Datos bomba (equal height on large screens) */}
        <div className="grid min-w-0 gap-5 lg:grid-cols-2 lg:items-stretch lg:gap-6">
          <GeneralInfoSection
            generalInfo={test.generalInfo}
            bancoId={test.bancoId ?? null}
            onBankChange={handleBankChange}
            t={t}
            onDataChange={handlePdfDataChange}
            allFieldsEditable={viewConfig.allFieldsEditable}
            showQty={viewConfig.mode === "PENDING"}
            isPending={viewConfig.mode === "PENDING"}
            className="h-full min-h-0"
          />
          <BombaDataSection
            pdfData={test.pdfData}
            generalInfo={test.generalInfo}
            onDataChange={handlePdfDataChange}
            allFieldsEditable={viewConfig.allFieldsEditable}
            className="h-full min-h-0"
          />
        </div>

        {/* Row 2: Pruebas a realizar (full width) */}
        {shouldShowTestsToPerform ? (
          <TestsToPerformSection
            testsToPerform={testsToPerform}
            onToggleTest={toggleTest}
            t={t}
          />
        ) : null}

        {/* Row 3: Punto H2O | Punto fluido */}
        <div className="grid min-w-0 gap-5 lg:grid-cols-2 lg:items-stretch lg:gap-6">
          <FluidH2OSection
            pdfData={test.pdfData}
            onDataChange={handlePdfDataChange}
            allFieldsEditable={viewConfig.allFieldsEditable}
            className="h-full min-h-0"
          />
          <FluidSection
            pdfData={test.pdfData}
            onDataChange={handlePdfDataChange}
            allFieldsEditable={viewConfig.allFieldsEditable}
            className="h-full min-h-0"
          />
        </div>

        {viewConfig.showExtendedSections ? (
          <MotorDataSection
            pdfData={test.pdfData}
            onDataChange={handlePdfDataChange}
            allFieldsEditable={viewConfig.allFieldsEditable}
          />
        ) : null}

        <DetailsSection
          pdfData={test.pdfData}
          onDataChange={handlePdfDataChange}
        />
      </div>
    );
  }, [
    handleBankChange,
    handlePdfDataChange,
    shouldShowTestsToPerform,
    test,
    testsToPerform,
    toggleTest,
    t,
    viewConfig.allFieldsEditable,
    viewConfig.mode,
    viewConfig.showExtendedSections,
  ]);

  const detailPageHeader = useMemo(() => {
    if (!test) {
      return null;
    }
    return {
      density: "relaxed" as const,
      center: (
        <TestDetailHeaderCenter
          test={test}
          onBack={() => router.push(backRoute)}
          breadcrumbLabel={breadcrumbLabel}
          t={t}
        />
      ),
      end: (
        <TestDetailHeaderEnd
          test={test}
          onTogglePreview={togglePdf}
          previewOpen={isPdfExpanded}
          actions={
            <DetailStateActions
              test={test}
              saving={saving}
              deleting={deleting}
              handleSave={handleSave}
              handleDelete={handleDelete}
              onMoveToBank={onMoveToBank}
              onReturnToProcessed={onReturnToProcessed}
              t={t}
              viewMode={viewConfig.mode}
            />
          }
        />
      ),
    };
  }, [
    test,
    router,
    backRoute,
    breadcrumbLabel,
    t,
    togglePdf,
    isPdfExpanded,
    saving,
    deleting,
    handleSave,
    handleDelete,
    onMoveToBank,
    onReturnToProcessed,
    viewConfig.mode,
  ]);

  useSupervisorPageHeader(detailPageHeader);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
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
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--supervisor-page-background)]">
      <div className="relative min-h-0 flex-1 px-3 py-3 md:px-6 md:py-5">
        <div
          className={cn(
            "grid h-full min-h-0 gap-4 md:gap-5",
            isPdfExpanded && !isMobile
              ? "xl:grid-cols-[minmax(0,1fr)_30rem] 2xl:grid-cols-[minmax(0,1fr)_34rem]"
              : "grid-cols-1",
          )}
        >
          <ScrollArea className="min-h-0">
            {formSurface}
          </ScrollArea>

          <DetailPreviewPanel
            isMobile={isMobile}
            open={isPdfExpanded}
            onOpenChange={(open) => {
              if (open !== isPdfExpanded) {
                togglePdf();
              }
            }}
            previewMode={previewMode}
            onPreviewModeChange={setPreviewMode}
            file={pdfFile}
            url={pdfUrl}
            onUpload={handleFileUpload}
            onRemove={removePdf}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            isDragging={isDragging}
            onAnalyze={handleAnalyzePdf}
            isAnalyzing={extracting}
            showPdfUpload={viewConfig.showPdfUpload}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
