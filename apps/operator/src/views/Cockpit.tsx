/**
 * Cockpit.tsx - Refactored to use isolated providers
 * 
 * Changes:
 * - useTesting() → useJob() + useNavigation() + useTelemetry() + useCaptureLogic()
 * - Business logic extracted to useCaptureLogic hook
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Gauge, Droplets, Thermometer, Zap, ArrowDownToLine, ArrowLeft } from 'lucide-react';
import { Scene3D } from '@/components/testing/Scene3D';
import { ControlPanel } from '@/components/testing/ControlPanel';
import { TelemetryCard } from '@/components/testing/TelemetryCard';
import { Stepper } from '@/components/testing/Stepper';
import { useJob } from '@/contexts/JobProvider';
import { useNavigation } from '@/contexts/NavigationProvider';
import { useTelemetry } from '@/contexts/TelemetryProvider';
import { useCaptureLogic } from '@/hooks/useCaptureLogic';
import { useIsTabletPortrait } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const Cockpit: React.FC = () => {
  // Separated concerns from different providers
  const { currentJob, testConfig } = useJob();
  const { setCurrentView } = useNavigation();
  const {
    controls,
    setMotorOn,
    setMotorSpeed,
    setValveOpening,
    telemetry,
    telemetryHistory
  } = useTelemetry();
  const { isStable, capturePoint, currentPointIndex } = useCaptureLogic();

  const isTabletPortrait = useIsTabletPortrait();

  if (!currentJob || !testConfig) return null;

  // Extract history arrays for sparklines
  const pressureHistory = telemetryHistory.map(t => t.pressure);
  const flowHistory = telemetryHistory.map(t => t.flow);
  const tempHistory = telemetryHistory.map(t => t.temperature);
  const powerHistory = telemetryHistory.map(t => t.power);
  const npshHistory = telemetryHistory.map(t => t.npsh);

  const currentTarget = testConfig.points[currentPointIndex]?.targetFlow;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 3D Scene Background */}
      <Scene3D
        isRunning={controls.motorOn}
        motorSpeed={controls.motorSpeed}
        className="absolute inset-0 z-0"
      />

      {/* Floating Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-3 md:top-4 left-3 md:left-4 right-3 md:right-4 z-20 flex items-center justify-between"
      >
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentView('dashboard')}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-card/90 backdrop-blur-xl shadow-soft"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </Button>

          <div className="bg-card/90 backdrop-blur-xl rounded-xl md:rounded-2xl px-3 md:px-6 py-2 md:py-3 shadow-soft">
            <h1 className="text-sm md:text-xl font-bold text-foreground">Water Pump Testing</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Pedido {currentJob.orderId} • Banco {testConfig.bankId}
            </p>
          </div>
        </div>

        <Badge
          className={cn(
            "h-8 md:h-10 px-3 md:px-5 text-xs md:text-sm font-semibold rounded-full",
            controls.motorOn
              ? "bg-success text-success-foreground pulse-success"
              : "bg-pending text-pending-foreground"
          )}
        >
          <span className={cn(
            "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-1.5 md:mr-2",
            controls.motorOn ? "bg-success-foreground animate-pulse" : "bg-pending-foreground"
          )} />
          {controls.motorOn ? 'EN PROCESO' : 'DETENIDO'}
        </Badge>
      </motion.div>

      {/* Tablet Portrait Layout - Vertical stacking */}
      {isTabletPortrait ? (
        <>
          {/* Control Panel - Top area below header */}
          <div className="absolute top-20 left-3 right-3 z-20">
            <ControlPanel
              motorOn={controls.motorOn}
              motorSpeed={controls.motorSpeed}
              valveOpening={controls.valveOpening}
              onMotorToggle={setMotorOn}
              onMotorSpeedChange={setMotorSpeed}
              onValveOpeningChange={setValveOpening}
              compact
            />
          </div>

          {/* Telemetry - Horizontal scroll below controls */}
          <div className="absolute top-44 left-3 right-3 z-20 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-2">
              <TelemetryCard
                label="Presión"
                value={telemetry.pressure}
                unit="bar"
                icon={<Gauge className="w-4 h-4" />}
                history={pressureHistory}
                target={testConfig.testPressure}
                compact
              />
              <TelemetryCard
                label="Caudal"
                value={telemetry.flow}
                unit="m³/h"
                icon={<Droplets className="w-4 h-4" />}
                history={flowHistory}
                target={currentTarget}
                compact
              />
              <TelemetryCard
                label="Temp"
                value={telemetry.temperature}
                unit="°C"
                icon={<Thermometer className="w-4 h-4" />}
                history={tempHistory}
                compact
              />
              <TelemetryCard
                label="Potencia"
                value={telemetry.power}
                unit="kW"
                icon={<Zap className="w-4 h-4" />}
                history={powerHistory}
                compact
              />
              <TelemetryCard
                label="NPSH"
                value={telemetry.npsh}
                unit="m"
                icon={<ArrowDownToLine className="w-4 h-4" />}
                history={npshHistory}
                compact
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Desktop/Landscape - Left Control Panel */}
          <div
            className="absolute top-1/2 -translate-y-1/2 z-20"
            style={{ left: 'var(--fluid-edge-spacing)' }}
          >
            <ControlPanel
              motorOn={controls.motorOn}
              motorSpeed={controls.motorSpeed}
              valveOpening={controls.valveOpening}
              onMotorToggle={setMotorOn}
              onMotorSpeedChange={setMotorSpeed}
              onValveOpeningChange={setValveOpening}
            />
          </div>

          {/* Desktop/Landscape - Right Telemetry Panel */}
          <div
            className="absolute top-1/2 -translate-y-1/2 z-20"
            style={{
              right: 'var(--fluid-edge-spacing)',
              width: 'clamp(13rem, 19vw, 20rem)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--fluid-gap-sm)' }}>
              <TelemetryCard
                label="Presión"
                value={telemetry.pressure}
                unit="bar"
                icon={<Gauge style={{ width: 'var(--fluid-icon-sm)', height: 'var(--fluid-icon-sm)' }} />}
                history={pressureHistory}
                target={testConfig.testPressure}
              />
              <TelemetryCard
                label="Caudal"
                value={telemetry.flow}
                unit="m³/h"
                icon={<Droplets style={{ width: 'var(--fluid-icon-sm)', height: 'var(--fluid-icon-sm)' }} />}
                history={flowHistory}
                target={currentTarget}
              />
              <TelemetryCard
                label="Temperatura"
                value={telemetry.temperature}
                unit="°C"
                icon={<Thermometer style={{ width: 'var(--fluid-icon-sm)', height: 'var(--fluid-icon-sm)' }} />}
                history={tempHistory}
              />
              <TelemetryCard
                label="Potencia"
                value={telemetry.power}
                unit="kW"
                icon={<Zap style={{ width: 'var(--fluid-icon-sm)', height: 'var(--fluid-icon-sm)' }} />}
                history={powerHistory}
              />
              <TelemetryCard
                label="NPSH"
                value={telemetry.npsh}
                unit="m"
                icon={<ArrowDownToLine style={{ width: 'var(--fluid-icon-sm)', height: 'var(--fluid-icon-sm)' }} />}
                history={npshHistory}
              />
            </div>
          </div>
        </>
      )}

      {/* Bottom Stepper Bar */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 z-20 w-full",
          isTabletPortrait ? "bottom-4 max-w-full px-3" : ""
        )}
        style={!isTabletPortrait ? {
          bottom: 'var(--fluid-gap-lg)',
          paddingLeft: 'var(--fluid-edge-spacing)',
          paddingRight: 'var(--fluid-edge-spacing)',
          maxWidth: 'var(--fluid-stepper-width)',
        } : undefined}
      >
        <Stepper
          points={testConfig.points}
          currentIndex={currentPointIndex}
          isStable={isStable && controls.motorOn}
          onCapture={capturePoint}
        />
      </div>
    </div>
  );
};