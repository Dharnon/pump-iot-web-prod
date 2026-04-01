import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, Sun, Monitor, User, Building2 } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useUser, type BankId } from "@/contexts/UserProvider";
import { useJob } from "@/contexts/JobProvider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme, setTheme } = useTheme();
  const { user, setAssignedBank } = useUser();
  const { bancos } = useJob();

  // Helper to extract letter (A, B, C...) from bank name for user matching
  const getBankLetter = (name: string) => name.split(" ").pop() || "";

  // Sort banks by name to ensure A, B, C... order
  const sortedBancos = [...bancos].sort((a: any, b: any) =>
    (a.nombre || "").localeCompare(b.nombre || "", undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );

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
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* ── USER SECTION ── */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Operario
                </h3>

                {/* Current user info */}
                <div className="flex items-center gap-3 px-4 py-3 bg-muted/40 rounded-xl border border-border">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ID: {user.id}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 px-2 py-1 bg-primary/20 rounded-lg">
                    <Building2 className="w-3 h-3 text-primary" />
                    <span className="text-xs font-bold text-primary">
                      Banco {user.assignedBank}
                    </span>
                  </div>
                </div>

                {/* Bank selector */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Cambiar banco asignado
                  </p>
                  <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
                    {sortedBancos.map((bank: any) => {
                      const letter = getBankLetter(bank.nombre) as any;
                      return (
                        <button
                          key={bank.id}
                          onClick={() => setAssignedBank(letter)}
                          className={[
                            "py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-all border",
                            user.assignedBank === letter
                              ? "bg-primary text-primary-foreground border-primary shadow-md"
                              : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground",
                          ].join(" ")}
                        >
                          {bank.nombre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── THEME SECTION ── */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Apariencia
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                    className="flex flex-col gap-2 h-auto py-4"
                  >
                    <Sun className="w-6 h-6" />
                    <span className="text-xs">Claro</span>
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                    className="flex flex-col gap-2 h-auto py-4"
                  >
                    <Moon className="w-6 h-6" />
                    <span className="text-xs">Oscuro</span>
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    onClick={() => setTheme("system")}
                    className="flex flex-col gap-2 h-auto py-4"
                  >
                    <Monitor className="w-6 h-6" />
                    <span className="text-xs">Sistema</span>
                  </Button>
                </div>
              </div>

              {/* ── NOTIFICATIONS ── */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sonidos</Label>
                    <p className="text-xs text-muted-foreground">
                      Efectos de sonido al interactuar
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones</Label>
                    <p className="text-xs text-muted-foreground">
                      Alertas de estado de prueba
                    </p>
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
