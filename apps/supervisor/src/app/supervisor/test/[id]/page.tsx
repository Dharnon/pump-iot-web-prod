"use client";

/**
 * Test Detail Page (Pending Tests)
 * 
 * This page handles pending tests that haven't been generated yet.
 * - Shows PDF upload and extraction functionality
 * - Allows editing of extracted data
 * - Has "Finalize" button to generate protocol
 * - Does not show motor/details sections
 */

import { useParams } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { useTestDetailPage, DetailView } from "@/features/test-detail";

export default function TestDetailPage() {
  const params = useParams();
  const { t } = useLanguage();
  
  // Use hook with PENDING view mode
  const hookResult = useTestDetailPage(params.id as string, t, 'PENDING');

  return (
    <DetailView 
      hookResult={hookResult}
      t={t}
      backRoute="/supervisor"
      breadcrumbLabel="test.tests"
    />
  );
}
