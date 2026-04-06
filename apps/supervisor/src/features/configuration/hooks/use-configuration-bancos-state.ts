import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createBanco,
  deleteBanco,
  getAllBancos,
  type Banco,
  type BancoMotorPlantilla,
  type MotorPlantilla,
  updateBanco,
} from "@/lib/api";

import {
  createEmptyBancoForm,
  getErrorMessage,
  toBancoMotorPlantilla,
  type BancoFormState,
} from "../lib/configuration-model";

function normalizeBancoMotors(
  banco: Banco,
  motores: MotorPlantilla[],
): BancoMotorPlantilla[] {
  if (banco.motores?.length) {
    return banco.motores;
  }

  if (banco.motorPlantillaId != null) {
    const selectedMotor = motores.find(
      (motor) => motor.id === banco.motorPlantillaId,
    );

    const normalizedMotor = toBancoMotorPlantilla(selectedMotor);
    if (normalizedMotor) {
      return [normalizedMotor];
    }
  }

  if (banco.motorPlantilla) {
    return [banco.motorPlantilla];
  }

  return [];
}

export function useConfigurationBancosState(motores: MotorPlantilla[]) {
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [loadingBancos, setLoadingBancos] = useState(false);
  const [bancoDialogOpen, setBancoDialogOpen] = useState(false);
  const [editingBanco, setEditingBanco] = useState<Banco | null>(null);
  const [bancoForm, setBancoForm] = useState<BancoFormState>(
    createEmptyBancoForm(),
  );
  const [bancoToDelete, setBancoToDelete] = useState<Banco | null>(null);
  const [bancoSearch, setBancoSearch] = useState("");

  const normalizeBanco = useCallback(
    (banco: Banco): Banco => {
      const bancoMotores = normalizeBancoMotors(banco, motores);
      const selectedMotor =
        bancoMotores.find((motor) => motor.id === banco.motorPlantillaId) ??
        bancoMotores[0] ??
        null;

      return {
        ...banco,
        motores: bancoMotores,
        motorPlantilla: selectedMotor,
        motorPlantillaId: selectedMotor?.id ?? null,
      };
    },
    [motores],
  );

  const loadBancos = useCallback(async () => {
    setLoadingBancos(true);
    try {
      const data = await getAllBancos();
      setBancos(data.map(normalizeBanco));
    } catch {
      toast.error("Error al cargar los bancos");
    } finally {
      setLoadingBancos(false);
    }
  }, [normalizeBanco]);

  useEffect(() => {
    void loadBancos();
  }, [loadBancos]);

  useEffect(() => {
    setBancos((previousBancos) => previousBancos.map(normalizeBanco));
  }, [normalizeBanco]);

  const filteredBancos = useMemo(
    () =>
      bancos.filter((banco) => {
        const query = bancoSearch.toLowerCase();
        const matchesMotor = (banco.motores ?? []).some((motor) =>
          `${motor.nombre ?? ""} ${motor.marca ?? ""}`.toLowerCase().includes(query),
        );

        return (
          banco.nombre.toLowerCase().includes(query) ||
          matchesMotor
        );
      }),
    [bancoSearch, bancos],
  );

  const openBancoDialog = useCallback((banco?: Banco) => {
    if (banco) {
      setEditingBanco(banco);
      setBancoForm({
        nombre: banco.nombre,
        estado: banco.estado,
      });
    } else {
      setEditingBanco(null);
      setBancoForm(createEmptyBancoForm());
    }

    setBancoDialogOpen(true);
  }, []);

  const saveBanco = useCallback(async () => {
    let successMessage = editingBanco ? "Banco actualizado" : "Banco creado";

    try {
      let savedBanco: Banco;
      const payload = {
        nombre: bancoForm.nombre,
        estado: bancoForm.estado,
      };

      if (editingBanco) {
        savedBanco = await updateBanco(editingBanco.id, {
          ...payload,
          id: editingBanco.id,
        });
      } else {
        try {
          savedBanco = await createBanco(payload);
        } catch (error: unknown) {
          const message = getErrorMessage(error).toLowerCase();
          const bancoNombre = `${bancoForm.nombre || ""}`.trim().toLowerCase();
          const duplicateError =
            message.includes("exist") ||
            message.includes("duplic") ||
            message.includes("unique") ||
            message.includes("ya existe");

          const inactiveMatch = bancos.find(
            (b) => !b.estado && b.nombre.trim().toLowerCase() === bancoNombre,
          );

          if (duplicateError && inactiveMatch) {
            savedBanco = await updateBanco(inactiveMatch.id, {
              id: inactiveMatch.id,
              ...payload,
              estado: true,
            });
            successMessage = "Banco reactivado";
          } else {
            throw error;
          }
        }
      }

      if (!savedBanco?.id) {
        await loadBancos();
        setBancoDialogOpen(false);
        setEditingBanco(null);
        setBancoForm(createEmptyBancoForm());
        toast.success(successMessage);
        return null;
      }

      setBancos((previousBancos) => {
        const nextBanco = normalizeBanco(savedBanco);
        const index = previousBancos.findIndex(
          (existingBanco) => existingBanco.id === nextBanco.id,
        );

        if (index === -1) {
          return [nextBanco, ...previousBancos];
        }

        const nextBancos = [...previousBancos];
        nextBancos[index] = nextBanco;
        return nextBancos;
      });

      setBancoDialogOpen(false);
      setEditingBanco(null);
      setBancoForm(createEmptyBancoForm());
      toast.success(successMessage);
      return savedBanco;
    } catch {
      toast.error("Error al guardar el banco");
      return null;
    }
  }, [bancoForm.estado, bancoForm.nombre, bancos, editingBanco, loadBancos, normalizeBanco]);

  const deleteSelectedBanco = useCallback(async () => {
    if (!bancoToDelete) {
      return;
    }

    try {
      const deleteResult = await deleteBanco(bancoToDelete.id, { hard: true });
      const deleteMessage =
        typeof deleteResult === "object" &&
        deleteResult !== null &&
        "message" in deleteResult
          ? String((deleteResult as { message?: unknown }).message ?? "")
          : "";
      const isInactiveResponse = deleteMessage
        .toLowerCase()
        .includes("inactive");

      setBancos((previousBancos) => {
        if (isInactiveResponse) {
          return previousBancos.map((banco) =>
            banco.id === bancoToDelete.id ? { ...banco, estado: false } : banco,
          );
        }

        return previousBancos.filter((banco) => banco.id !== bancoToDelete.id);
      });

      toast.success(isInactiveResponse ? "Banco desactivado" : "Banco eliminado");
    } catch {
      toast.error("Error al eliminar el banco");
    } finally {
      setBancoToDelete(null);
    }
  }, [bancoToDelete]);

  const syncMotorReference = useCallback((savedMotor: MotorPlantilla) => {
    const normalizedMotor = toBancoMotorPlantilla(savedMotor);

    setBancos((previousBancos) =>
      previousBancos.map((banco) => {
        const currentMotores = (banco.motores ?? []).filter(
          (motor) => motor.id !== savedMotor.id,
        );

        if (savedMotor.bancoId !== banco.id || !normalizedMotor) {
          const fallbackMotor = currentMotores[0] ?? null;
          return {
            ...banco,
            motores: currentMotores,
            motorPlantilla: fallbackMotor,
            motorPlantillaId: fallbackMotor?.id ?? null,
          };
        }

        const nextMotores = [normalizedMotor, ...currentMotores];
        return {
          ...banco,
          motores: nextMotores,
          motorPlantilla: nextMotores[0],
          motorPlantillaId: nextMotores[0]?.id ?? null,
        };
      }),
    );
  }, []);

  const clearMotorReference = useCallback((motorId: number) => {
    setBancos((previousBancos) =>
      previousBancos.map((banco) => {
        const nextMotores = (banco.motores ?? []).filter(
          (motor) => motor.id !== motorId,
        );
        const fallbackMotor = nextMotores[0] ?? null;

        return {
          ...banco,
          motores: nextMotores,
          motorPlantillaId: fallbackMotor?.id ?? null,
          motorPlantilla: fallbackMotor,
        };
      }),
    );
  }, []);

  return {
    bancos,
    loadingBancos,
    bancoDialogOpen,
    setBancoDialogOpen,
    editingBanco,
    bancoForm,
    setBancoForm,
    bancoToDelete,
    setBancoToDelete,
    bancoSearch,
    setBancoSearch,
    filteredBancos,
    openBancoDialog,
    saveBanco,
    deleteSelectedBanco,
    syncMotorReference,
    clearMotorReference,
    loadBancos,
    bancoStats: {
      total: bancos.length,
      activos: bancos.filter((banco) => banco.estado).length,
      inactivos: bancos.filter((banco) => !banco.estado).length,
    },
  };
}
