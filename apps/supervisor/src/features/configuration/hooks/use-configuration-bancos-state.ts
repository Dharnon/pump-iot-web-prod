import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createBanco,
  deleteBanco,
  getAllBancos,
  type Banco,
  type MotorPlantilla,
  updateBanco,
} from "@/lib/api";

import {
  createEmptyBancoForm,
  getErrorMessage,
  toBancoMotorPlantilla,
  type BancoFormState,
} from "../lib/configuration-model";

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
      if (banco.motorPlantillaId == null) {
        return { ...banco, motorPlantilla: null };
      }

      const selectedMotor = motores.find(
        (motor) => motor.id === banco.motorPlantillaId,
      );

      return {
        ...banco,
        motorPlantilla:
          toBancoMotorPlantilla(selectedMotor) ?? banco.motorPlantilla ?? null,
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
        return (
          banco.nombre.toLowerCase().includes(query) ||
          (banco.motorPlantilla?.nombre?.toLowerCase().includes(query) ?? false)
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
        motorPlantillaId: banco.motorPlantillaId,
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

      if (editingBanco) {
        savedBanco = await updateBanco(editingBanco.id, {
          ...bancoForm,
          id: editingBanco.id,
        });
      } else {
        try {
          savedBanco = await createBanco(bancoForm);
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
              ...bancoForm,
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
  }, [bancoForm, bancos, editingBanco, loadBancos, normalizeBanco]);

  const deleteSelectedBanco = useCallback(async () => {
    if (!bancoToDelete) {
      return;
    }

    try {
      const deleteResult = await deleteBanco(bancoToDelete.id, { hard: true });
      const isInactiveResponse = `${deleteResult?.message || ""}`
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
    setBancos((previousBancos) =>
      previousBancos.map((banco) =>
        banco.motorPlantillaId === savedMotor.id
          ? { ...banco, motorPlantilla: toBancoMotorPlantilla(savedMotor) }
          : banco,
      ),
    );
  }, []);

  const clearMotorReference = useCallback((motorId: number) => {
    setBancos((previousBancos) =>
      previousBancos.map((banco) =>
        banco.motorPlantillaId === motorId
          ? { ...banco, motorPlantillaId: null, motorPlantilla: null }
          : banco,
      ),
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
