"use client";

import { useEffect, useState } from "react";
import { Banco, getBancos } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BankSelectProps {
  /** Currently selected bank ID, or null if no bank is selected */
  currentBankId: number | null;
  /** Callback when a bank is selected */
  onBankChange: (bankId: number) => void;
  /** Optional placeholder text when no bank is selected */
  placeholder?: string;
  /** Optional disabled state */
  disabled?: boolean;
  /** Optional className for the trigger */
  className?: string;
}

/**
 * BankSelect - A reusable component for selecting a test bench (banco)
 *
 * Fetches available banks from the API and displays them in a Shadcn UI Select.
 * Used in test detail pages for assigning tests to specific test benches.
 */
export function BankSelect({
  currentBankId,
  onBankChange,
  placeholder = "Seleccionar banco",
  disabled = false,
  className,
}: BankSelectProps) {
  const [banks, setBanks] = useState<Banco[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBanks() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getBancos();
        // Filter only active banks
        const activeBanks = data.filter((bank) => bank.estado);
        setBanks(activeBanks);
      } catch (err) {
        console.error("Failed to fetch banks:", err);
        setError("Error al cargar bancos");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBanks();
  }, []);

  const handleValueChange = (value: string) => {
    const bankId = parseInt(value, 10);
    if (!isNaN(bankId)) {
      onBankChange(bankId);
    }
  };

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  return (
    <Select
      value={currentBankId !== null ? currentBankId.toString() : undefined}
      onValueChange={handleValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={cn("w-full", className)}>
        {isLoading ? (
          <span className="text-muted-foreground">Cargando...</span>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        {banks.map((bank) => (
          <SelectItem key={bank.id} value={bank.id.toString()}>
            {bank.nombre}
          </SelectItem>
        ))}
        {banks.length === 0 && !isLoading && (
          <div className="p-2 text-sm text-muted-foreground">
            No hay bancos disponibles
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
