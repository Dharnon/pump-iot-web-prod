/**
 * SetupModal.tsx - Refactored to use isolated providers
 * 
 * Changes:
 * - useTesting() → useJob() + useNavigation()
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useJob, TestPoint } from '@/contexts/JobProvider';
import { useNavigation } from '@/contexts/NavigationProvider';
import { cn } from '@/lib/utils';

const BANK_OPTIONS = ['A', 'B', 'C', 'D', 'E'] as const;

export const SetupModal: React.FC = () => {
  const { currentJob, testConfig, setTestConfig } = useJob();
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Blurred backdrop - shows cockpit preview */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-card/95 backdrop-blur-xl rounded-3xl shadow-soft-xl border border-white/50 w-full max-w-2xl max-h-[90vh] overflow-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-card/95 backdrop-blur-xl p-6 border-b border-border rounded-t-3xl flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Configuración de Prueba</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Pedido {currentJob.orderId} • {currentJob.model}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-secondary hover:bg-accent flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Bank Selection */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-4 block">
                Selección de Banco
              </label>
              <div className="flex gap-4 justify-center">
                {BANK_OPTIONS.map((bank) => (
                  <motion.button
                    key={bank}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedBank(bank)}
                    className={cn(
                      "w-16 h-16 rounded-2xl text-xl font-bold transition-all",
                      selectedBank === bank
                        ? "gradient-primary text-primary-foreground shadow-lg ring-4 ring-primary/30"
                        : "bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                    )}
                  >
                    {bank}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Test Pressure */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-3 block">
                Presión de Prueba (bar)
              </label>
              <Input
                type="number"
                value={testPressure}
                onChange={(e) => setTestPressure(Number(e.target.value))}
                className="h-14 text-lg font-mono rounded-xl max-w-xs bg-card"
                min={1}
                max={20}
                step={0.5}
              />
            </div>

            {/* Number of Points */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-3 block">
                Número de Puntos de Caudal
              </label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={removePoint}
                  disabled={points.length <= 2}
                  className="w-12 h-12 rounded-xl"
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <span className="text-3xl font-bold font-mono w-16 text-center">
                  {points.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={addPoint}
                  disabled={points.length >= 10}
                  className="w-12 h-12 rounded-xl"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Flow Points Table */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-3 block">
                Puntos de Caudal (m³/h)
              </label>
              <div className="bg-secondary rounded-2xl p-4">
                <div className="grid grid-cols-5 gap-3">
                  {points.map((point, index) => (
                    <div key={point.id} className="flex flex-col items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Punto {index + 1}
                        {index === 0 && ' (Min)'}
                        {point.targetFlow === currentJob.targetFlow && ' (Nom)'}
                      </span>
                      <Input
                        type="number"
                        value={point.targetFlow}
                        onChange={(e) => updatePointFlow(index, Number(e.target.value))}
                        className="h-12 text-center font-mono font-bold rounded-xl bg-card"
                        min={0}
                        max={50}
                        step={0.1}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-card/95 backdrop-blur-xl p-6 border-t border-border rounded-b-3xl">
            <Button
              onClick={handleConfirm}
              className="w-full h-14 rounded-full gradient-primary text-primary-foreground text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Confirmar y Entrar a Banco
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
