import type { Test } from "@/lib/api";
import type { Locks } from "@/hooks/useSignalR";

export type InboxViewMode =
  | "pending"
  | "protocols"
  | "en_banco"
  | "completed";

export type InboxStatusFilter =
  | "all"
  | "PENDING"
  | "GENERATED"
  | "GENERADO"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "EN_BANCO";

/** Tarjetas de métricas del inbox (alineadas con filtros / pestañas) */
export type InboxMetricId =
  | "pending"
  | "protocols_generated"
  | "en_banco"
  | "active"
  | "completed";

export function isInboxMetricSelected(
  id: InboxMetricId,
  viewMode: InboxViewMode,
  statusFilter: InboxStatusFilter,
): boolean {
  switch (id) {
    case "pending":
      return viewMode === "pending";
    case "protocols_generated":
      return (
        viewMode === "protocols" &&
        (statusFilter === "all" ||
          statusFilter === "GENERATED" ||
          statusFilter === "GENERADO")
      );
    case "en_banco":
      return (
        viewMode === "en_banco" ||
        (viewMode === "protocols" && statusFilter === "EN_BANCO")
      );
    case "active":
      return viewMode === "protocols" && statusFilter === "IN_PROGRESS";
    case "completed":
      return viewMode === "completed";
    default:
      return false;
  }
}

export function getPendingTests(tests: Test[]) {
  return tests.filter((test) => test.id.startsWith("pending-"));
}

export function getGeneratedTests(tests: Test[]) {
  return tests.filter((test) => !test.id.startsWith("pending-"));
}

export function getGeneratedTestsOnly(tests: Test[], locks: Locks) {
  return tests.filter((test) => {
    const isGenerated =
      test.status === "GENERATED" || test.status === "GENERADO";
    return isGenerated && !locks[test.id];
  });
}

export function getInProgressTests(tests: Test[], locks: Locks) {
  return tests.filter(
    (test) => test.status === "IN_PROGRESS" || Boolean(locks[test.id]),
  );
}

export function filterInboxTests({
  viewMode,
  statusFilter,
  pendingTests,
  generatedTests,
  locks,
}: {
  viewMode: InboxViewMode;
  statusFilter: InboxStatusFilter;
  pendingTests: Test[];
  generatedTests: Test[];
  locks: Locks;
}) {
  if (viewMode === "pending") {
    const dataSource = pendingTests;

    if (statusFilter === "all") {
      return dataSource;
    }

    return dataSource.filter((test) => test.status === statusFilter);
  }

  if (viewMode === "en_banco") {
    return generatedTests.filter((test) => test.status === "EN_BANCO");
  }

  if (viewMode === "completed") {
    return generatedTests.filter((test) => test.status === "COMPLETED");
  }

  const dataSource = generatedTests;

  if (statusFilter === "all") {
    return dataSource;
  }

  return dataSource.filter((test) => {
    if (statusFilter === "IN_PROGRESS") {
      return test.status === "IN_PROGRESS" || Boolean(locks[test.id]);
    }

    if (statusFilter === "GENERATED" || statusFilter === "GENERADO") {
      const isGenerated =
        test.status === "GENERATED" || test.status === "GENERADO";
      return isGenerated && !locks[test.id];
    }

    if (statusFilter === "EN_BANCO") {
      return test.status === "EN_BANCO";
    }

    return test.status === statusFilter;
  });
}
