"use client";

import { useState } from 'react';
import { ArrowRightLeft, Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

export function UnitConverter() {
    // State for input values
    const [usgpm, setUsgpm] = useState<string>('');
    const [ft, setFt] = useState<string>('');
    const [hp, setHp] = useState<string>('');
    const [inches, setInches] = useState<string>('');

    // Conversions
    // 1 US gpm = 0.227125 m3/h
    const m3h = usgpm ? (parseFloat(usgpm) * 0.227125).toFixed(2) : '-';

    // 1 ft = 0.3048 m
    const meters = ft ? (parseFloat(ft) * 0.3048).toFixed(2) : '-';

    // 1 hp = 0.7457 kW
    const kw = hp ? (parseFloat(hp) * 0.7457).toFixed(2) : '-';

    // 1 inch = 25.4 mm
    const mm = inches ? (parseFloat(inches) * 25.4).toFixed(2) : '-';

    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="unit-converter" className="border-dashed">
                <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2 text-primary">
                        <Calculator className="w-4 h-4" />
                        <span className="text-sm font-semibold uppercase tracking-wider">Conversor de Unidades</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-2 pt-2">
                        {/* Flow: USGPM -> m3/h */}
                        <ConversionRow
                            label="Caudal"
                            input={usgpm}
                            setInput={setUsgpm}
                            unitIn="Usgpm"
                            valueOut={m3h}
                            unitOut="m³/h"
                        />

                        {/* Head: ft -> m */}
                        <ConversionRow
                            label="TDH"
                            input={ft}
                            setInput={setFt}
                            unitIn="ft"
                            valueOut={meters}
                            unitOut="m"
                        />

                        {/* Power: hp -> kW */}
                        <ConversionRow
                            label="Potencia"
                            input={hp}
                            setInput={setHp}
                            unitIn="hp"
                            valueOut={kw}
                            unitOut="kW"
                        />

                        {/* Diameter: in -> mm */}
                        <ConversionRow
                            label="Diámetro"
                            input={inches}
                            setInput={setInches}
                            unitIn="in"
                            valueOut={mm}
                            unitOut="mm"
                        />
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

interface ConversionRowProps {
    label: string;
    input: string;
    setInput: (value: string) => void;
    unitIn: string;
    valueOut: string;
    unitOut: string;
}

function ConversionRow({ label, input, setInput, unitIn, valueOut, unitOut }: ConversionRowProps) {
    return (
        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center text-sm">
            <div className="relative">
                <Input
                    type="number"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="h-8 text-right pr-2 text-xs"
                    placeholder="0"
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground uppercase">{label}</span>
            </div>

            <div className="text-muted-foreground px-1 text-xs flex items-center gap-1">
                {unitIn} <ArrowRightLeft className="w-3 h-3" />
            </div>

            <div className="flex items-center justify-between bg-muted/50 border rounded px-2 py-1.5 h-8">
                <span className="font-mono text-primary text-xs font-medium">{valueOut}</span>
                <span className="text-[10px] text-muted-foreground ml-1">{unitOut}</span>
            </div>
        </div>
    );
}
