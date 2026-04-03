import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createMotor,
  deleteMotor,
  getMotores,
  type MotorPlantilla,
  updateMotor,
} from "@/lib/api";

function createEmptyMotorForm(): Partial<MotorPlantilla> {
  return {
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
  };
}

export function useMotoresConfig() {
  const [motores, setMotores] = useState<MotorPlantilla[]>([]);
  const [loadingMotores, setLoadingMotores] = useState(false);
  const [motorDialogOpen, setMotorDialogOpen] = useState(false);
  const [editingMotor, setEditingMotor] = useState<MotorPlantilla | null>(null);
  const [motorForm, setMotorForm] = useState<Partial<MotorPlantilla>>(
    createEmptyMotorForm(),
  );
  const [motorToDelete, setMotorToDelete] = useState<MotorPlantilla | null>(null);
  const [motorSearch, setMotorSearch] = useState("");

  const loadMotores = useCallback(async () => {
    setLoadingMotores(true);
    try {
      const data = await getMotores();
      setMotores(data);
    } catch {
      toast.error("Error al cargar las plantillas de motor");
    } finally {
      setLoadingMotores(false);
    }
  }, []);

  useEffect(() => {
    void loadMotores();
  }, [loadMotores]);

  const filteredMotores = useMemo(
    () =>
      motores.filter((motor) => {
        const query = motorSearch.toLowerCase();
        return (
          motor.nombre.toLowerCase().includes(query) ||
          (motor.marca?.toLowerCase().includes(query) ?? false) ||
          (motor.tipo?.toLowerCase().includes(query) ?? false)
        );
      }),
    [motorSearch, motores],
  );

  const openMotorDialog = useCallback((motor?: MotorPlantilla) => {
    if (motor) {
      setEditingMotor(motor);
      setMotorForm(motor);
    } else {
      setEditingMotor(null);
      setMotorForm(createEmptyMotorForm());
    }

    setMotorDialogOpen(true);
  }, []);

  const saveMotor = useCallback(async () => {
    try {
      const savedMotor = editingMotor
        ? await updateMotor(editingMotor.id, {
            ...motorForm,
            id: editingMotor.id,
          })
        : await createMotor(motorForm);

      if (!savedMotor?.id) {
        await loadMotores();
        setMotorDialogOpen(false);
        setEditingMotor(null);
        setMotorForm(createEmptyMotorForm());
        toast.success(editingMotor ? "Motor actualizado" : "Motor creado");
        return null;
      }

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

      setMotorDialogOpen(false);
      setEditingMotor(null);
      setMotorForm(createEmptyMotorForm());
      toast.success(editingMotor ? "Motor actualizado" : "Motor creado");
      return savedMotor;
    } catch {
      toast.error("Error al guardar el motor");
      return null;
    }
  }, [editingMotor, loadMotores, motorForm]);

  const deleteSelectedMotor = useCallback(async () => {
    if (!motorToDelete) {
      return null;
    }

    try {
      await deleteMotor(motorToDelete.id);
      setMotores((previousMotores) =>
        previousMotores.filter((motor) => motor.id !== motorToDelete.id),
      );
      toast.success("Motor eliminado");
      return motorToDelete;
    } catch {
      toast.error("Error al eliminar el motor");
      return null;
    } finally {
      setMotorToDelete(null);
    }
  }, [motorToDelete]);

  return {
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
    openMotorDialog,
    saveMotor,
    deleteSelectedMotor,
    motorStats: {
      total: motores.length,
    },
  };
}
