"use client";

/**
 * Protocol Detail Page (Generated Protocols)
 * 
 * This page handles already generated protocols.
 * - Shows existing PDF (readonly viewer)
 * - All fields are editable
 * - Has "Save" button to update protocol data
 * - Shows all sections including motor/details
 */

import { useParams } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { useTestDetailPage, DetailView } from "@/features/test-detail";

export default function ProtocolDetailPage() {
  const params = useParams();
  const { t } = useLanguage();
  
  // Use hook with GENERATED view mode
  const hookResult = useTestDetailPage(params.id as string, t, 'GENERATED');

  return (
    <DetailView 
      hookResult={hookResult}
      t={t}
      backRoute="/supervisor"
      breadcrumbLabel="Protocolos"
    />
  );
}
