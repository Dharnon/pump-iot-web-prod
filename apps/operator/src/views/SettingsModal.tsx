import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { theme, setTheme } = useTheme();

    const XIcon = X as any;
    const SunIcon = Sun as any;
    const MoonIcon = Moon as any;
    const MonitorIcon = Monitor as any;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-2xl shadow-lg z-50 p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Ajustes</h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                <XIcon className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {/* Theme Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Apariencia</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button
                                        variant={theme === 'light' ? 'default' : 'outline'}
                                        onClick={() => setTheme('light')}
                                        className="flex flex-col gap-2 h-auto py-4"
                                    >
                                        <SunIcon className="w-6 h-6" />
                                        <span className="text-xs">Claro</span>
                                    </Button>
                                    <Button
                                        variant={theme === 'dark' ? 'default' : 'outline'}
                                        onClick={() => setTheme('dark')}
                                        className="flex flex-col gap-2 h-auto py-4"
                                    >
                                        <MoonIcon className="w-6 h-6" />
                                        <span className="text-xs">Oscuro</span>
                                    </Button>
                                    <Button
                                        variant={theme === 'system' ? 'default' : 'outline'}
                                        onClick={() => setTheme('system')}
                                        className="flex flex-col gap-2 h-auto py-4"
                                    >
                                        <MonitorIcon className="w-6 h-6" />
                                        <span className="text-xs">Sistema</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Other Settings (Placeholder) */}
                            <div className="space-y-4 pt-4 border-t border-border">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Sonidos</Label>
                                        <p className="text-xs text-muted-foreground">Efectos de sonido al interactuar</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Notificaciones</Label>
                                        <p className="text-xs text-muted-foreground">Alertas de estado de prueba</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border">
                            <p className="text-center text-xs text-muted-foreground">
                                Versión 1.0.0 • Operator View
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
