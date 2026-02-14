/**
 * SetupModal.tsx - Enhanced with Tabs and Protocol Details
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  Plus,
  Minus,
  Settings as SettingsIconImport,
  ClipboardList as ClipboardListIconImport,
  FileText as FileTextIcon,
  Play,
  Save,
  CheckCircle2,
  AlertCircle,
  Activity,
  Droplets
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { useJob, TestPoint } from '@/contexts/JobProvider';
import { useNavigation } from '@/contexts/NavigationProvider';
import { cn } from '@/lib/utils';
import { Toaster, toast } from 'sonner';

const BANK_OPTIONS = ['A', 'B', 'C', 'D', 'E'] as const;

// Fix for Lucide icons in some environments
const XIcon = X as any;
const SettingsIcon = SettingsIconImport as any;
const ClipboardListIcon = ClipboardListIconImport as any;
const FileTextIconFixed = FileTextIcon as any;
const PlusIcon = Plus as any;
const MinusIcon = Minus as any;
const SaveIcon = Save as any;
const FileCheckIcon = CheckCircle2 as any;
const ChevronRightIcon = ChevronRight as any;
const ActivityIcon = Activity as any;
const DropletsIcon = Droplets as any;

export const SetupModal: React.FC = () => {
  const { currentJob, testConfig, setTestConfig, updateJob } = useJob();
  const { setCurrentView } = useNavigation();

  const [selectedBank, setSelectedBank] = useState<typeof BANK_OPTIONS[number]>(testConfig?.bankId || 'A');
  const [testPressure, setTestPressure] = useState(testConfig?.testPressure || 6);
  const [points, setPoints] = useState<TestPoint[]>(
    testConfig?.points || [
      { id: 1, targetFlow: 0, captured: false },
      { id: 2, targetFlow: 5, captured: false },
      { id: 3, targetFlow: currentJob?.targetFlow || 10.7, captured: false },
      { id: 4, targetFlow: (currentJob?.targetFlow || 10.7) * 1.1, captured: false },
      { id: 5, targetFlow: (currentJob?.targetFlow || 10.7) * 1.3, captured: false },
    ]
  );

  // Protocol Form State - Cast as any to avoid strict type checks on partial updates
  const [protocolForm, setProtocolForm] = useState<any>(currentJob?.protocolSpec || {});
  const [isDirty, setIsDirty] = useState(false);

  // Helper to update protocol form
  const handleProtocolChange = (field: string, value: any) => {
    setProtocolForm(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSaveProtocol = () => {
    if (currentJob) {
      updateJob({ protocolSpec: protocolForm });
      setIsDirty(false);
      toast.success("Protocolo actualizado correctamente");
    }
  };


  const addPoint = () => {
    if (points.length >= 10) return;
    const newPoint: TestPoint = {
      id: points.length + 1,
      targetFlow: 0,
      captured: false,
    };
    setPoints([...points, newPoint]);
  };

  const removePoint = () => {
    if (points.length <= 2) return;
    setPoints(points.slice(0, -1));
  };

  const updatePointFlow = (index: number, value: number) => {
    const updated = [...points];
    updated[index] = { ...updated[index], targetFlow: value };
    setPoints(updated);
  };

  const handleConfirm = () => {
    setTestConfig({
      bankId: selectedBank,
      testPressure,
      points,
    });
    setCurrentView('cockpit');
  };

  const handleClose = () => {
    setCurrentView('dashboard');
  };

  if (!currentJob) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
      >
        {/* Blurred backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-card/95 backdrop-blur-xl rounded-3xl shadow-soft-xl border border-white/50 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-card/95 backdrop-blur-xl p-6 border-b border-border flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-baseline gap-3">
                <h2 className="text-2xl font-bold text-foreground">Configuración</h2>
                <span className="text-lg font-medium text-muted-foreground">#{currentJob.orderId}</span>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                {currentJob.client} • {currentJob.model} • {currentJob.impeller}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-secondary hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <Tabs defaultValue="config" className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 pt-4 shrink-0">
                <TabsList className="bg-secondary/50 p-1 rounded-xl w-full sm:w-auto h-auto grid grid-cols-3 sm:flex">
                  <TabsTrigger
                    value="config"
                    className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm py-2.5 px-4 h-auto"
                  >
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    Configuración
                  </TabsTrigger>
                  <TabsTrigger
                    value="protocol"
                    className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm py-2.5 px-4 h-auto"
                  >
                    <ClipboardListIcon className="w-4 h-4 mr-2" />
                    Protocolo
                  </TabsTrigger>
                  <TabsTrigger
                    value="docs"
                    className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm py-2.5 px-4 h-auto"
                  >
                    <FileTextIconFixed className="w-4 h-4 mr-2" />
                    Documentos
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto p-6">

                {/* CONFIGURATION TAB */}
                <TabsContent value="config" className="space-y-8 m-0 h-full animate-in fade-in-50 slide-in-from-bottom-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Bank & Pressure */}
                    <div className="space-y-8">
                      <div className="glass-panel p-5 rounded-2xl border border-border/50">
                        <label className="text-sm font-semibold text-foreground mb-4 block flex items-center gap-2">
                          <SettingsIcon className="w-4 h-4 text-primary" />
                          Selección de Banco
                        </label>
                        <div className="flex gap-3 flex-wrap">
                          {BANK_OPTIONS.map((bank) => (
                            <motion.button
                              key={bank}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedBank(bank)}
                              className={cn(
                                "w-14 h-14 rounded-xl text-xl font-bold transition-all border-2",
                                selectedBank === bank
                                  ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                                  : "border-transparent bg-secondary text-muted-foreground hover:bg-secondary/80"
                              )}
                            >
                              {bank}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div className="glass-panel p-5 rounded-2xl border border-border/50">
                        <label className="text-sm font-semibold text-foreground mb-3 block">
                          Presión de Prueba (bar)
                        </label>
                        <div className="flex items-center gap-4">
                          <Input
                            type="number"
                            value={testPressure}
                            onChange={(e) => setTestPressure(Number(e.target.value))}
                            className="h-14 text-2xl font-mono text-center font-bold rounded-xl bg-secondary/30 border-secondary-foreground/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min={1}
                            max={20}
                            step={0.5}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Flow Points */}
                    <div className="glass-panel p-5 rounded-2xl border border-border/50 h-full flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <SettingsIcon className="w-4 h-4 text-primary" />
                          Puntos de Caudal (m³/h)
                        </label>
                        <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-1">
                          <Button variant="ghost" size="icon" onClick={removePoint} disabled={points.length <= 2} className="h-8 w-8">
                            <MinusIcon className="w-4 h-4" />
                          </Button>
                          <span className="w-6 text-center text-sm font-bold font-mono">{points.length}</span>
                          <Button variant="ghost" size="icon" onClick={addPoint} disabled={points.length >= 10} className="h-8 w-8">
                            <PlusIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-2 gap-3">
                          {points.map((point, index) => (
                            <div key={point.id} className="relative group">
                              <span className="absolute left-3 top-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                {index === 0 ? 'Mínimo' : point.targetFlow === currentJob.targetFlow ? 'Nominal' : `Punto ${index + 1}`}
                              </span>
                              <Input
                                type="number"
                                value={point.targetFlow}
                                onChange={(e) => updatePointFlow(index, Number(e.target.value))}
                                className={cn(
                                  "h-16 pt-6 pb-2 text-center font-mono text-lg font-bold rounded-xl transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                  point.targetFlow === currentJob.targetFlow
                                    ? "bg-primary/10 border-primary/30 text-primary"
                                    : "bg-secondary/30 border-transparent focus:bg-background"
                                )}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* PROTOCOL TAB */}
                <TabsContent value="protocol" className="space-y-6 m-0 animate-in fade-in-50 slide-in-from-bottom-2 pb-24">

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">

                    {/* MOTOR SECTION */}
                    <div className="glass-panel p-5 rounded-2xl border border-border/50">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <SettingsIcon className="w-4 h-4" />
                        Motor & Eléctrico
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground font-medium">Marca</label>
                          <input
                            type="text"
                            value={protocolForm.motorBrand || ''}
                            onChange={(e) => handleProtocolChange('motorBrand', e.target.value)}
                            className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground font-medium">Modelo/Tipo</label>
                          <input
                            type="text"
                            value={protocolForm.motorType || ''}
                            onChange={(e) => handleProtocolChange('motorType', e.target.value)}
                            className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground font-medium">Potencia (kW)</label>
                          <input
                            type="number"
                            value={protocolForm.motorPower || ''}
                            onChange={(e) => handleProtocolChange('motorPower', Number(e.target.value))}
                            className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground font-medium">Velocidad (rpm)</label>
                          <input
                            type="number"
                            value={protocolForm.nominalSpeed || ''}
                            onChange={(e) => handleProtocolChange('nominalSpeed', Number(e.target.value))}
                            className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground font-medium">Voltaje (V)</label>
                          <input
                            type="number"
                            value={protocolForm.voltage || ''}
                            onChange={(e) => handleProtocolChange('voltage', Number(e.target.value))}
                            className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground font-medium">Corriente (A)</label>
                          <input
                            type="number"
                            value={protocolForm.current || ''}
                            onChange={(e) => handleProtocolChange('current', Number(e.target.value))}
                            className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground font-medium">Frecuencia (Hz)</label>
                          <input
                            type="number"
                            value={protocolForm.frequency || ''}
                            onChange={(e) => handleProtocolChange('frequency', Number(e.target.value))}
                            className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground font-medium">Polos</label>
                          <input
                            type="number"
                            value={protocolForm.poles || ''}
                            onChange={(e) => handleProtocolChange('poles', Number(e.target.value))}
                            className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary/50 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PUMP SECTION */}
                    <div className="glass-panel p-5 rounded-2xl border border-border/50">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <SettingsIcon className="w-4 h-4" /> {/* Should be PumpIcon theoretically */}
                        Bomba & Hidráulica
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-xs text-muted-foreground font-medium">Modelo</label>
                          <input
                            type="text"
                            defaultValue={currentJob.model}
                            readOnly
                            className="w-full bg-secondary/30 border border-input/50 rounded-lg px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground font-medium">Impulsor Ø (mm)</label>
                          <input
                            type="text"
                            value={protocolForm.impellerDiameter || ''}
                            onChange={(e) => handleProtocolChange('impellerDiameter', e.target.value)}
                            className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground font-medium">Sello</label>
                          <select
                            value={protocolForm.sealType || "MECANICO"}
                            onChange={(e) => handleProtocolChange('sealType', e.target.value)}
                            className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none"
                          >
                            <option value="MECANICO">MECANICO</option>
                            <option value="CARTUCHO">CARTUCHO</option>
                            <option value="EMPAQUETADURA">EMPAQUETADURA</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground font-medium">Succión Ø (mm)</label>
                          <input
                            type="number"
                            value={protocolForm.suctionDiameter || ''}
                            onChange={(e) => handleProtocolChange('suctionDiameter', Number(e.target.value))}
                            className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary/50 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground font-medium">Descarga Ø (mm)</label>
                          <input
                            type="number"
                            value={protocolForm.dischargeDiameter || ''}
                            onChange={(e) => handleProtocolChange('dischargeDiameter', Number(e.target.value))}
                            className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary/50 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-xs text-muted-foreground font-medium">Orientación</label>
                          <div className="flex bg-secondary/50 rounded-lg p-1">
                            <button
                              onClick={() => handleProtocolChange('isVertical', false)}
                              className={cn(
                                "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                                !protocolForm.isVertical ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                              )}
                            >
                              HORIZONTAL
                            </button>
                            <button
                              onClick={() => handleProtocolChange('isVertical', true)}
                              className={cn(
                                "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                                protocolForm.isVertical ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                              )}
                            >
                              VERTICAL
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* OPERATING POINT SECTION */}
                    <div className="glass-panel p-5 rounded-2xl border border-border/50">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <ActivityIcon className="w-4 h-4" />
                        Punto de Operación
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground font-medium">Caudal (m³/h)</label>
                          <input
                            type="number"
                            value={protocolForm.flowRate || ''}
                            onChange={(e) => handleProtocolChange('flowRate', Number(e.target.value))}
                            className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary/50 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground font-medium">Altura (m)</label>
                          <input
                            type="number"
                            value={protocolForm.head || ''}
                            onChange={(e) => handleProtocolChange('head', Number(e.target.value))}
                            className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary/50 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground font-medium">NPSHr (m)</label>
                          <input
                            type="number"
                            value={protocolForm.npshr || ''}
                            onChange={(e) => handleProtocolChange('npshr', Number(e.target.value))}
                            className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary/50 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground font-medium">Eficiencia (%)</label>
                          <input
                            type="number"
                            value={protocolForm.efficiency || ''}
                            onChange={(e) => handleProtocolChange('efficiency', Number(e.target.value))}
                            className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary/50 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* FLUID & GENERAL SECTION */}
                    <div className="glass-panel p-5 rounded-2xl border border-border/50">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <DropletsIcon className="w-4 h-4" />
                        Fluido & General
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-xs text-muted-foreground font-medium">Fluido</label>
                          <input
                            type="text"
                            value={protocolForm.liquidDescription || ''}
                            onChange={(e) => handleProtocolChange('liquidDescription', e.target.value)}
                            className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground font-medium">Temperatura (°C)</label>
                          <input
                            type="number"
                            value={protocolForm.temperature || ''}
                            onChange={(e) => handleProtocolChange('temperature', Number(e.target.value))}
                            className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary/50 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground font-medium">Densidad (kg/m³)</label>
                          <input
                            type="number"
                            value={protocolForm.density || ''}
                            onChange={(e) => handleProtocolChange('density', Number(e.target.value))}
                            className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary/50 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-xs text-muted-foreground font-medium">Norma / Tolerancia</label>
                          <select
                            value={protocolForm.tolerance || "ISO 9906 Grade 2B"}
                            onChange={(e) => handleProtocolChange('tolerance', e.target.value)}
                            className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none"
                          >
                            <option value="ISO 9906 Grade 1B">ISO 9906 Grade 1B</option>
                            <option value="ISO 9906 Grade 1E">ISO 9906 Grade 1E</option>
                            <option value="ISO 9906 Grade 2B">ISO 9906 Grade 2B</option>
                            <option value="ISO 9906 Grade 3B">ISO 9906 Grade 3B</option>
                          </select>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-border/50">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Comentarios Internos</h3>
                    <textarea
                      value={protocolForm.internalComment || ''}
                      onChange={(e) => handleProtocolChange('internalComment', e.target.value)}
                      className="w-full bg-secondary/50 border border-input rounded-xl px-4 py-3 text-sm min-h-[100px] focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                      placeholder="Agregar comentarios sobre el equipo o la prueba..."
                    />
                  </div>

                  {/* Sticky Footer for Save Changes */}
                  <div className="absolute bottom-32 right-8 z-20 pointer-events-none">
                    <AnimatePresence>
                      {isDirty && (
                        <motion.button
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 20, scale: 0.9 }}
                          onClick={handleSaveProtocol}
                          className="pointer-events-auto bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95 flex items-center gap-2"
                        >
                          <SaveIcon className="w-5 h-5" />
                          Guardar Cambios
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>

                </TabsContent>

                {/* DOCUMENTS TAB */}
                <TabsContent value="docs" className="m-0 h-full animate-in fade-in-50 slide-in-from-bottom-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* PDF Viewer Placeholder */}
                    <div className="glass-panel p-8 rounded-2xl border border-border/50 flex flex-col items-center justify-center text-center gap-4 bg-secondary/20 min-h-[300px]">
                      <div className="w-20 h-20 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-2">
                        <FileCheckIcon className="w-10 h-10 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Protocolo de Prueba.pdf</h3>
                        <p className="text-muted-foreground text-sm">Versión 1.0 • 2.4 MB</p>
                      </div>
                      <Button variant="outline" className="mt-4 gap-2">
                        <FileTextIconFixed className="w-4 h-4" />
                        Abrir Documento
                      </Button>
                    </div>

                    {/* Technical Datasheet */}
                    <div className="glass-panel p-8 rounded-2xl border border-border/50 flex flex-col items-center justify-center text-center gap-4 bg-secondary/20 min-h-[300px]">
                      <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-2">
                        <ClipboardListIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Ficha Técnica {currentJob.model}</h3>
                        <p className="text-muted-foreground text-sm">Especificaciones completas</p>
                      </div>
                      <Button variant="outline" className="mt-4 gap-2">
                        <FileTextIconFixed className="w-4 h-4" />
                        Abrir Ficha Técnica
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Footer - Start Button */}
          <div className="p-6 border-t border-border bg-card/95 backdrop-blur-xl shrink-0">
            <Button
              onClick={handleConfirm}
              className="w-full h-14 rounded-full gradient-primary text-primary-foreground text-lg font-semibold shadow-lg hover:shadow-xl transition-all group"
            >
              Comenzar Prueba
              <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
