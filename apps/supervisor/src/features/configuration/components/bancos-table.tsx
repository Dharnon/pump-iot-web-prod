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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-card/40 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Banco</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Motor asignado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Cargando bancos...
              </TableCell>
            </TableRow>
          ) : bancos.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-28 text-center text-muted-foreground"
              >
                {searchQuery
                  ? "No hay bancos que coincidan con la busqueda actual."
                  : "No hay bancos configurados todavia."}
              </TableCell>
            </TableRow>
          ) : (
            bancos.map((banco) => (
              <TableRow key={banco.id}>
                <TableCell className="font-mono text-sm">{banco.id}</TableCell>
                <TableCell className="font-medium">{banco.nombre}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      banco.estado
                        ? "rounded-full border-emerald-500/30 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400"
                        : "rounded-full border-border/70 bg-muted/20 text-muted-foreground"
                    }
                  >
                    {banco.estado ? "Activo" : "Inactivo"}
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
                    <span className="text-sm text-muted-foreground">
                      Sin motor asignado
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                          aria-label="Acciones del banco"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => onEdit(banco)}>
                          <Pencil />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete(banco)}
                        >
                          <Trash2 />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
