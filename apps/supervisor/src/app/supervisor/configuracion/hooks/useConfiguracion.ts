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
    Banco
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

  const loadBancos = useCallback(async () => {
    setLoadingBancos(true);
    try {
      const data = await getAllBancos();
      setBancos(data);
    } catch (error) {
      console.error("Error loading bancos:", error);
      toast.error("Error al cargar los bancos");
    } finally {
      setLoadingBancos(false);
    }
  }, []);

  useEffect(() => {
    loadMotores();
    loadBancos();
  }, [loadMotores, loadBancos]);

  // Filtering
  const filteredMotores = useMemo(() => motores.filter(
    (motor: MotorPlantilla) =>
      motor.nombre.toLowerCase().includes(motorSearch.toLowerCase()) ||
      (motor.marca?.toLowerCase().includes(motorSearch.toLowerCase()) ?? false) ||
      (motor.tipo?.toLowerCase().includes(motorSearch.toLowerCase()) ?? false),
  ), [motores, motorSearch]);

  const filteredBancos = useMemo(() => bancos.filter(
    (banco: Banco) =>
      banco.nombre.toLowerCase().includes(bancoSearch.toLowerCase()) ||
      (banco.motorPlantilla?.nombre?.toLowerCase().includes(bancoSearch.toLowerCase()) ?? false),
  ), [bancos, bancoSearch]);

  // Motor Actions
  const handleSaveMotor = async () => {
    try {
      if (editingMotor) {
        await updateMotor(editingMotor.id, motorForm);
      } else {
        await createMotor(motorForm);
      }
      
      await loadMotores();
      setMotorDialogOpen(false);
      setEditingMotor(null);
      setMotorForm({});
      toast.success(editingMotor ? "Motor actualizado" : "Motor creado");
    } catch (error) {
      toast.error("Error al guardar el motor");
    }
  };

  const handleDeleteMotor = async () => {
    if (!motorToDelete) return;
    try {
      await deleteMotor(motorToDelete.id);
      await loadMotores();
      toast.success("Motor eliminado");
    } catch (error) {
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
    try {
      if (editingBanco) {
        await updateBanco(editingBanco.id, bancoForm);
      } else {
        await createBanco(bancoForm);
      }
      
      await loadBancos();
      setBancoDialogOpen(false);
      setEditingBanco(null);
      setBancoForm({});
      toast.success(editingBanco ? "Banco actualizado" : "Banco creado");
    } catch (error) {
      toast.error("Error al guardar el banco");
    }
  };

  const handleDeleteBanco = async () => {
    if (!bancoToDelete) return;
    try {
      await deleteBanco(bancoToDelete.id);
      await loadBancos();
      toast.success("Banco eliminado");
    } catch (error) {
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
