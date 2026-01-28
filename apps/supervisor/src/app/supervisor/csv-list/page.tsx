"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, RefreshCw, ExternalLink } from "lucide-react";
import { getListados, type Listado } from "@/lib/api";

/**
 * CSV List Page - View imported CSV/Excel data
 */
export default function CsvListPage() {
    const [listados, setListados] = useState<Listado[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchListados = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getListados();
            setListados(data);
        } catch (error) {
            console.error("Error fetching listados:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchListados();
    }, [fetchListados]);

    return (
        <div className="h-full overflow-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Listados CSV</h1>
                    <p className="text-muted-foreground">
                        Datos importados desde archivos CSV/Excel
                    </p>
                </div>
                <Button variant="outline" onClick={fetchListados} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Actualizar
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Registros</CardDescription>
                        <CardTitle className="text-4xl">{listados.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Clientes Únicos</CardDescription>
                        <CardTitle className="text-4xl">
                            {new Set(listados.map(l => l.cliente)).size}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Bombas</CardDescription>
                        <CardTitle className="text-4xl">
                            {listados.reduce((acc, l) => acc + l.numeroBombas, 0)}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5" />
                        Datos Importados
                    </CardTitle>
                    <CardDescription>
                        Tabla de staging - Se borra y rellena con cada importación
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : listados.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No hay datos en la tabla de staging</p>
                            <p className="text-sm">Importa un archivo desde el Dashboard</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Pedido</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Tipo de Bomba</TableHead>
                                        <TableHead>Orden de Trabajo</TableHead>
                                        <TableHead className="text-right">Nº Bombas</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {listados.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                            <TableCell className="font-medium">{item.pedido}</TableCell>
                                            <TableCell>{item.cliente}</TableCell>
                                            <TableCell>{item.tipoDeBomba}</TableCell>
                                            <TableCell>{item.ordenDeTrabajo}</TableCell>
                                            <TableCell className="text-right">{item.numeroBombas}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a href={`/supervisor/pdf-extractor?pedido=${item.pedido}`}>
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
