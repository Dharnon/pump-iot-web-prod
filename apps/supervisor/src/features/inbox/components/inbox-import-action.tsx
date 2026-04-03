"use client";

import dynamic from "next/dynamic";

const ImportModal = dynamic(
  () => import("@/components/import-modal").then((module) => module.ImportModal),
  { ssr: false },
);

export function InboxImportAction({
  onImportSuccess,
}: {
  onImportSuccess: () => void;
}) {
  return (
    <ImportModal
      onImportSuccess={() => {
        onImportSuccess();
      }}
    />
  );
}
