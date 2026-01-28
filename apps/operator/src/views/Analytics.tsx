/**
 * Analytics.tsx - Refactored to use isolated providers
 * 
 * Changes:
 * - useTesting() → useJob() + useNavigation() + useTelemetry()
 * - resetTest split into navigation + telemetry reset
 */
import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { CheckCircle2, Download, FileText, ArrowLeft, RotateCcw, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useJob } from '@/contexts/JobProvider';
import { useNavigation } from '@/contexts/NavigationProvider';
import { useTelemetry } from '@/contexts/TelemetryProvider';

// Generate theoretical Q-H curve data
const generateTheoreticalCurve = (nominalFlow: number) => {
  const points = [];
  const maxHead = 12; // Maximum head at zero flow
  for (let q = 0; q <= nominalFlow * 1.5; q += 0.5) {
    // Parabolic Q-H curve: H = Hmax - k*Q^2
    const k = maxHead / (nominalFlow * 1.5) ** 2;
    const h = Math.max(0, maxHead - k * q * q);
    points.push({ flow: q, head: h, theoretical: true });
  }
  return points;
};

export const Analytics: React.FC = () => {
  const { currentJob, testConfig, clearJob } = useJob();
  const { setCurrentView } = useNavigation();
  const { capturedPoints, resetTelemetry } = useTelemetry();

  const isApproved = currentJob?.status === 'OK' || (currentJob?.status !== 'KO');
  const isHistorical = currentJob?.status === 'OK' || currentJob?.status === 'KO';

  // Generate chart data
  const chartData = useMemo(() => {
    if (!currentJob || !testConfig) return { theoretical: [], captured: [] };

    const theoretical = generateTheoreticalCurve(currentJob.targetFlow);

    // Map captured points to Q-H format
    const captured = capturedPoints.map((point, index) => {
      const targetFlow = testConfig.points[index]?.targetFlow || point.flow;
      const head = 12 - (point.pressure * 0.8); // Simplified head calculation from pressure
      const deviation = Math.abs(point.flow - targetFlow);
      const isOutOfTolerance = deviation > targetFlow * 0.05; // 5% tolerance

      return {
        flow: targetFlow,
        actualFlow: point.flow,
        head,
        power: point.power,
        efficiency: (point.flow * 10 / point.power) * 10, // Simplified efficiency
        isOutOfTolerance,
        deviation,
      };
    });

    return { theoretical, captured };
  }, [currentJob, testConfig, capturedPoints]);

  const failedPoints = chartData.captured.filter(p => p.isOutOfTolerance);

  // Combined reset function
  const resetTest = useCallback(() => {
    resetTelemetry();
    clearJob();
    setCurrentView('dashboard');
  }, [resetTelemetry, clearJob, setCurrentView]);

  const handleFinish = () => {
    // In a real app, this would save the report
    resetTest();
  };

  const handleBack = () => {
    if (isHistorical) {
      resetTest();
    } else {
      setCurrentView('cockpit');
    }
  };

  if (!currentJob) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No hay datos de prueba</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="w-12 h-12 rounded-xl bg-card shadow-soft"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isHistorical ? 'Reporte de Prueba' : 'Análisis de Resultados'}
              </h1>
              <p className="text-muted-foreground">
                Pedido {currentJob.orderId} • {currentJob.model}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-full h-12 px-6">
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" className="rounded-full h-12 px-6">
              <FileText className="w-4 h-4 mr-2" />
              Ver Datos
            </Button>
          </div>
        </motion.div>

        {/* Main Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl p-6 shadow-soft mb-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Curva Q-H (Caudal vs Altura)
          </h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="flow"
                  type="number"
                  domain={[0, 'auto']}
                  label={{ value: 'Caudal (m³/h)', position: 'bottom', offset: -10 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  dataKey="head"
                  type="number"
                  domain={[0, 'auto']}
                  label={{ value: 'Altura (m)', angle: -90, position: 'insideLeft' }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'head') return [value.toFixed(2) + ' m', 'Altura'];
                    return [value.toFixed(2), name];
                  }}
                />

                {/* Theoretical curve - dashed */}
                <Line
                  data={chartData.theoretical}
                  type="monotone"
                  dataKey="head"
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="8 4"
                  strokeWidth={2}
                  dot={false}
                  name="Curva Teórica"
                />

                {/* Captured points - colored based on status */}
                <Line
                  data={chartData.captured}
                  type="monotone"
                  dataKey="head"
                  stroke={currentJob.status === 'KO' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
                  strokeWidth={3}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    const isOutOfTolerance = payload?.isOutOfTolerance;
                    const color = isOutOfTolerance ? 'hsl(var(--destructive))' : 'hsl(var(--success))';
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={8}
                        fill={color}
                        stroke="hsl(var(--card))"
                        strokeWidth={3}
                      />
                    );
                  }}
                  activeDot={{
                    fill: currentJob.status === 'KO' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
                    stroke: 'hsl(var(--primary-glow))',
                    strokeWidth: 4,
                    r: 10,
                  }}
                  name="Puntos Capturados"
                />

                {/* Nominal flow reference line */}
                <ReferenceLine
                  x={currentJob.targetFlow}
                  stroke="hsl(var(--success))"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Nominal',
                    position: 'top',
                    fill: 'hsl(var(--success))',
                    fontSize: 12,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 border-t-2 border-dashed border-muted-foreground" />
              <span className="text-sm text-muted-foreground">Curva Teórica</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-sm text-muted-foreground">Punto OK</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-sm text-muted-foreground">Punto Fuera Tolerancia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 border-t-2 border-dashed border-success" />
              <span className="text-sm text-muted-foreground">Caudal Nominal</span>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Status Card - Dynamic based on OK/KO */}
          {currentJob.status === 'KO' ? (
            <div className="bg-card rounded-3xl p-6 shadow-soft border-2 border-destructive/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-destructive/20 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <p className="text-xl font-bold text-destructive">RECHAZADO</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm font-medium">{currentJob.errorMessage || 'Error de tolerancia'}</p>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-3xl p-6 shadow-soft border-2 border-success/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <p className="text-xl font-bold text-success">APROBADO</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Todos los puntos dentro del rango de tolerancia ±5%
              </p>
            </div>
          )}

          <div className="bg-card rounded-3xl p-6 shadow-soft">
            <span className="text-sm text-muted-foreground">Puntos Capturados</span>
            <p className="text-3xl font-bold font-mono text-foreground mt-1">
              {capturedPoints.length} / {testConfig?.points.length || 0}
            </p>
            {failedPoints.length > 0 ? (
              <p className="text-sm text-destructive mt-2">
                {failedPoints.length} punto(s) fuera de tolerancia
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                Prueba completada exitosamente
              </p>
            )}
          </div>

          <div className="bg-card rounded-3xl p-6 shadow-soft">
            <span className="text-sm text-muted-foreground">Eficiencia Promedio</span>
            <p className="text-3xl font-bold font-mono text-foreground mt-1">
              {chartData.captured.length > 0
                ? (chartData.captured.reduce((sum, p) => sum + (p.efficiency || 0), 0) / chartData.captured.length).toFixed(1)
                : '--'
              }%
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {chartData.captured.length > 0 ? 'Calculada sobre puntos capturados' : 'Sin datos disponibles'}
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4"
        >
          {isHistorical ? (
            <Button
              onClick={handleFinish}
              className="h-14 px-8 rounded-full gradient-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setCurrentView('cockpit')}
                className="h-14 px-8 rounded-full font-semibold"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Repetir Prueba
              </Button>
              <Button
                onClick={handleFinish}
                className="h-14 px-8 rounded-full gradient-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Firmar y Finalizar
              </Button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};