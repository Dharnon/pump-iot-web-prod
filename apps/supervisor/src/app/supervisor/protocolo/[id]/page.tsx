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

import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { useTestDetailPage, DetailView } from "@/features/test-detail";
import { toast } from "sonner";

export default function ProtocolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  
  // Use hook with GENERATED view mode
  const hookResult = useTestDetailPage(params.id as string, t, 'GENERATED');

  const handleMoveToBank = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/Tests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'EN_BANCO' }),
      });
      
      if (response.ok) {
        toast.success('Prueba movida a banco');
        router.push('/supervisor/programacion');
      }
    } catch (error) {
      console.error('Error moving test to bank:', error);
      toast.error('Error al mover la prueba a banco');
    }
  };

  return (
    <DetailView 
      hookResult={hookResult}
      t={t}
      backRoute="/supervisor"
      breadcrumbLabel="Protocolos"
      onMoveToBank={handleMoveToBank}
    />
  );
}
