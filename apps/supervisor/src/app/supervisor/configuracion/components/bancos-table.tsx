"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { Banco } from "@/lib/api";

interface BancosTableProps {
  bancos: Banco[];
  loading: boolean;
  onEdit: (banco: Banco) => void;
  onDelete: (banco: Banco) => void;
  searchQuery: string;
}

export function BancosTable({
  bancos,
  loading,
  onEdit,
  onDelete,
  searchQuery,
}: BancosTableProps) {
  const { t } = useLanguage();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>{t("field.model")}</TableHead>
            <TableHead>{t("col.status")}</TableHead>
            <TableHead>{t("config.motores")}</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                {t("login.loading")}
              </TableCell>
            </TableRow>
          ) : bancos.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                {searchQuery
                  ? t("empty.desc") // "No se encontraron bancos..." - I'll reuse or use hardcoded if missing
                  : t("empty.title")}
              </TableCell>
            </TableRow>
          ) : (
            bancos.map((banco) => (
              <TableRow key={banco.id}>
                <TableCell className="font-mono text-sm">{banco.id}</TableCell>
                <TableCell className="font-medium">{banco.nombre}</TableCell>
                <TableCell>
                  <Badge
                    variant={banco.estado ? "secondary" : "secondary"}
                    className={
                      banco.estado ? "bg-green-500 hover:bg-green-600" : ""
                    }
                  >
                    {banco.estado ? t("config.active") : t("config.inactive")}
                  </Badge>
                </TableCell>
                <TableCell>
                  {banco.motorPlantilla ? (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {banco.motorPlantilla.nombre}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {banco.motorPlantilla.marca}{" "}
                        {banco.motorPlantilla.potencia}kW
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      {t("config.noMotor")}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(banco)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => onDelete(banco)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
