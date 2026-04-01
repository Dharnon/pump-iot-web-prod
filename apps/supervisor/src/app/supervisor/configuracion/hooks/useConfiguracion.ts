import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  getMotores,
  createMotor,
  updateMotor,
  deleteMotor,
  getAllBancos,
  createBanco,
  updateBanco,
  deleteBanco,
  MotorPlantilla,
  Banco,
} from "@/lib/api";

export function useConfiguracion() {
  // Tabs state
  const [activeTab, setActiveTab] = useState("bancos");

  // Engines state
  const [motores, setMotores] = useState<MotorPlantilla[]>([]);
  const [loadingMotores, setLoadingMotores] = useState(false);
  const [motorDialogOpen, setMotorDialogOpen] = useState(false);
  const [editingMotor, setEditingMotor] = useState<MotorPlantilla | null>(null);
  const [motorForm, setMotorForm] = useState<Partial<MotorPlantilla>>({});
  const [motorToDelete, setMotorToDelete] = useState<MotorPlantilla | null>(null);
  const [motorSearch, setMotorSearch] = useState("");

  // Banks state
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [loadingBancos, setLoadingBancos] = useState(false);
  const [bancoDialogOpen, setBancoDialogOpen] = useState(false);
  const [editingBanco, setEditingBanco] = useState<Banco | null>(null);
  const [bancoForm, setBancoForm] = useState<Partial<Banco>>({});
  const [bancoToDelete, setBancoToDelete] = useState<Banco | null>(null);
  const [bancoSearch, setBancoSearch] = useState("");

  // Load data
  const loadMotores = useCallback(async () => {
    setLoadingMotores(true);
    try {
      const data = await getMotores();
      setMotores(data);
    } catch (error) {
      console.error("Error loading motores:", error);
      toast.error("Error al cargar las plantillas de motor");
    } finally {
      setLoadingMotores(false);
    }
  }, []);

  const loadBancos = useCallback(async (): Promise<Banco[]> => {
    setLoadingBancos(true);
    try {
      const data = await getAllBancos();
      setBancos(data);
      return data;
    } catch (error) {
      console.error("Error loading bancos:", error);
      toast.error("Error al cargar los bancos");
      return [];
    } finally {
      setLoadingBancos(false);
    }
  }, []);

  useEffect(() => {
    loadMotores();
    loadBancos();
  }, [loadMotores, loadBancos]);

  // Filtering
  const filteredMotores = useMemo(
    () =>
      motores.filter(
        (motor: MotorPlantilla) =>
          motor.nombre.toLowerCase().includes(motorSearch.toLowerCase()) ||
          (motor.marca?.toLowerCase().includes(motorSearch.toLowerCase()) ??
            false) ||
          (motor.tipo?.toLowerCase().includes(motorSearch.toLowerCase()) ??
            false),
      ),
    [motores, motorSearch],
  );

  const filteredBancos = useMemo(
    () =>
      bancos.filter(
        (banco: Banco) =>
          banco.nombre.toLowerCase().includes(bancoSearch.toLowerCase()) ||
          (banco.motorPlantilla?.nombre
            ?.toLowerCase()
            .includes(bancoSearch.toLowerCase()) ??
            false),
      ),
    [bancos, bancoSearch],
  );

  const toBancoMotorPlantilla = (motor: MotorPlantilla | undefined | null) => {
    if (!motor) return null;
    return {
      id: motor.id,
      nombre: motor.nombre,
      marca: motor.marca ?? undefined,
      tipo: motor.tipo ?? undefined,
      potencia: motor.potencia ?? undefined,
      velocidad: motor.velocidad ?? undefined,
      intensidad: motor.intensidad ?? undefined,
      rendimiento25: motor.rendimiento25 ?? undefined,
      rendimiento50: motor.rendimiento50 ?? undefined,
      rendimiento75: motor.rendimiento75 ?? undefined,
      rendimiento100: motor.rendimiento100 ?? undefined,
      rendimiento125: motor.rendimiento125 ?? undefined,
    };
  };

  const normalizeBanco = (banco: Banco): Banco => {
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
  };

  // Motor Actions
  const handleSaveMotor = async () => {
    try {
      let savedMotor: MotorPlantilla;

      if (editingMotor) {
        savedMotor = await updateMotor(editingMotor.id, {
          ...motorForm,
          id: editingMotor.id,
        });
      } else {
        savedMotor = await createMotor(motorForm);
      }

      if (!savedMotor?.id) {
        await loadMotores();
      } else {
      setMotores((previousMotores) => {
        const index = previousMotores.findIndex(
          (motor) => motor.id === savedMotor.id,
        );
        if (index === -1) {
          return [savedMotor, ...previousMotores];
        }

        const nextMotores = [...previousMotores];
        nextMotores[index] = savedMotor;
        return nextMotores;
      });

      setBancos((previousBancos) =>
        previousBancos.map((banco) =>
          banco.motorPlantillaId === savedMotor.id
            ? { ...banco, motorPlantilla: toBancoMotorPlantilla(savedMotor) }
            : banco,
        ),
      );
      }

      setMotorDialogOpen(false);
      setEditingMotor(null);
      setMotorForm({});
      toast.success(editingMotor ? "Motor actualizado" : "Motor creado");
    } catch {
      toast.error("Error al guardar el motor");
    }
  };

  const handleDeleteMotor = async () => {
    if (!motorToDelete) return;
    try {
      await deleteMotor(motorToDelete.id);
      setMotores((previousMotores) =>
        previousMotores.filter((motor) => motor.id !== motorToDelete.id),
      );
      setBancos((previousBancos) =>
        previousBancos.map((banco) =>
          banco.motorPlantillaId === motorToDelete.id
            ? { ...banco, motorPlantillaId: null, motorPlantilla: null }
            : banco,
        ),
      );
      toast.success("Motor eliminado");
    } catch {
      toast.error("Error al eliminar el motor");
    } finally {
      setMotorToDelete(null);
    }
  };

  const openMotorDialog = (motor?: MotorPlantilla) => {
    if (motor) {
      setEditingMotor(motor);
      setMotorForm(motor);
    } else {
      setEditingMotor(null);
      setMotorForm({
        nombre: "",
        marca: "",
        tipo: "",
        potencia: null,
        velocidad: null,
        intensidad: null,
        rendimiento25: null,
        rendimiento50: null,
        rendimiento75: null,
        rendimiento100: null,
        rendimiento125: null,
      });
    }
    setMotorDialogOpen(true);
  };

  // Banco Actions
  const handleSaveBanco = async () => {
    let bancoSuccessMessage = editingBanco ? "Banco actualizado" : "Banco creado";
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
        } catch (error: any) {
          const message = `${error?.message || ""}`.toLowerCase();
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
            bancoSuccessMessage = "Banco reactivado";
          } else {
            throw error;
          }
        }
      }

      if (!savedBanco?.id) {
        await loadBancos();
      } else {
        setBancos((previousBancos) => {
          const nextBanco = normalizeBanco(savedBanco);
          const index = previousBancos.findIndex(
            (banco) => banco.id === nextBanco.id,
          );
          if (index === -1) {
            return [nextBanco, ...previousBancos];
          }

          const nextBancos = [...previousBancos];
          nextBancos[index] = nextBanco;
          return nextBancos;
        });
      }

      setBancoDialogOpen(false);
      setEditingBanco(null);
      setBancoForm({});
      toast.success(bancoSuccessMessage);
    } catch {
      toast.error("Error al guardar el banco");
    }
  };

  const handleDeleteBanco = async () => {
    if (!bancoToDelete) return;
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
  };

  const openBancoDialog = (banco?: Banco) => {
    if (banco) {
      setEditingBanco(banco);
      setBancoForm({
        nombre: banco.nombre,
        estado: banco.estado,
        motorPlantillaId: banco.motorPlantillaId,
      });
    } else {
      setEditingBanco(null);
      setBancoForm({
        nombre: "",
        estado: true,
        motorPlantillaId: null,
      });
    }
    setBancoDialogOpen(true);
  };

  // Stats
  const bancoStats = {
    total: bancos.length,
    activos: bancos.filter((b) => b.estado).length,
    inactivos: bancos.filter((b) => !b.estado).length,
  };

  const motorStats = {
    total: motores.length,
  };

  return {
    activeTab,
    setActiveTab,
    motores,
    loadingMotores,
    motorDialogOpen,
    setMotorDialogOpen,
    editingMotor,
    motorForm,
    setMotorForm,
    motorToDelete,
    setMotorToDelete,
    motorSearch,
    setMotorSearch,
    filteredMotores,
    handleSaveMotor,
    handleDeleteMotor,
    openMotorDialog,
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
    handleSaveBanco,
    handleDeleteBanco,
    openBancoDialog,
    bancoStats,
    motorStats,
  };
}
