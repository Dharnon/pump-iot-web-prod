"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SupervisorChartRange = {
  label: string;
  value: string;
};

export type SupervisorChartSeries<T> = {
  key: keyof T & string;
  label: string;
  stroke: string;
  fill?: string;
};

export interface SupervisorChartCardProps<T extends Record<string, unknown>> {
  title: string;
  description?: string;
  data: T[];
  xKey: keyof T & string;
  series: SupervisorChartSeries<T>[];
  ranges?: SupervisorChartRange[];
  selectedRange?: string;
  onRangeChange?: (value: string) => void;
  xLabel?: (item: T) => string;
  yLabel?: (value: number) => string;
  footer?: ReactNode;
  className?: string;
  emptyState?: string;
}

function formatDefaultNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function buildLinePath(points: Array<{ x: number; y: number }>) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function buildAreaPath(points: Array<{ x: number; y: number }>, baseY: number) {
  if (points.length === 0) return "";
  const line = buildLinePath(points);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  return `${line} L ${lastPoint.x} ${baseY} L ${firstPoint.x} ${baseY} Z`;
}

export function SupervisorChartCard<T extends Record<string, unknown>>({
  title,
  description,
  data,
  xKey,
  series,
  ranges,
  selectedRange,
  onRangeChange,
  xLabel,
  yLabel = formatDefaultNumber,
  footer,
  className,
  emptyState = "No hay datos disponibles.",
}: SupervisorChartCardProps<T>) {
  const visibleData = data ?? [];
  const maxValue = Math.max(
    1,
    ...visibleData.flatMap((item) =>
      series.map((entry) => toNumber(item[entry.key])),
    ),
  );
  const chartWidth = 100;
  const paddingX = 6;
  const paddingTop = 8;
  const baseY = 86;
  const chartHeightAvailable = baseY - paddingTop;
  const pointCount = Math.max(visibleData.length - 1, 1);

  const pointsBySeries = series.map((entry) => {
    const points = visibleData.map((item, index) => {
      const value = toNumber(item[entry.key]);
      const x = paddingX + (index / pointCount) * (chartWidth - paddingX * 2);
      const y = baseY - (value / maxValue) * chartHeightAvailable;
      return { x, y, value };
    });

    return {
      ...entry,
      points,
      linePath: buildLinePath(points),
      areaPath: buildAreaPath(points, baseY),
      latestValue: points.length ? points[points.length - 1].value : 0,
    };
  });

  return (
    <Card className={cn("border-border/70 shadow-xs", className)}>
      <CardHeader className="flex items-start gap-3">
        <div className="flex-1">
          <CardTitle className="text-base font-semibold md:text-lg">
            {title}
          </CardTitle>
          {description ? (
            <CardDescription className="mt-1">{description}</CardDescription>
          ) : null}
        </div>
        {ranges?.length && onRangeChange ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full">
                {ranges.find((range) => range.value === selectedRange)?.label ??
                  ranges[0].label}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {ranges.map((range) => (
                <DropdownMenuItem
                  key={range.value}
                  onSelect={(event) => {
                    event.preventDefault();
                    onRangeChange(range.value);
                  }}
                >
                  {range.label}
                  {selectedRange === range.value ? (
                    <Badge
                      variant="secondary"
                      className="ml-auto rounded-full px-2 py-0 text-[10px]"
                    >
                      Activo
                    </Badge>
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </CardHeader>
      <CardContent className="pt-0">
        {visibleData.length === 0 ? (
          <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground">
            {emptyState}
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 bg-background/60 p-3">
            <svg viewBox="0 0 100 100" className="h-64 w-full overflow-visible">
              <defs>
                {pointsBySeries.map((entry, index) => {
                  const gradientId = `supervisor-chart-fill-${entry.key}-${index}`;
                  return (
                    <linearGradient
                      id={gradientId}
                      key={gradientId}
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={entry.fill ?? entry.stroke}
                        stopOpacity="0.35"
                      />
                      <stop
                        offset="95%"
                        stopColor={entry.fill ?? entry.stroke}
                        stopOpacity="0.03"
                      />
                    </linearGradient>
                  );
                })}
              </defs>
              {[0, 1, 2, 3].map((grid) => (
                <line
                  key={grid}
                  x1="0"
                  x2="100"
                  y1={paddingTop + (grid * chartHeightAvailable) / 3}
                  y2={paddingTop + (grid * chartHeightAvailable) / 3}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                />
              ))}
              {pointsBySeries.map((entry, index) => {
                const gradientId = `supervisor-chart-fill-${entry.key}-${index}`;
                return (
                  <g key={entry.key}>
                    <path d={entry.areaPath} fill={`url(#${gradientId})`} />
                    <path
                      d={entry.linePath}
                      fill="none"
                      stroke={entry.stroke}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {entry.points.map((point, pointIndex) => (
                      <circle
                        key={`${entry.key}-${pointIndex}`}
                        cx={point.x}
                        cy={point.y}
                        r="1.6"
                        fill={entry.stroke}
                      />
                    ))}
                  </g>
                );
              })}
              <text x="2" y="97" className="fill-muted-foreground" fontSize="4">
                {xLabel
                  ? xLabel(visibleData[0])
                  : String(visibleData[0][xKey])}
              </text>
              <text
                x="86"
                y="97"
                className="fill-muted-foreground"
                fontSize="4"
                textAnchor="end"
              >
                {xLabel
                  ? xLabel(visibleData[visibleData.length - 1])
                  : String(visibleData[visibleData.length - 1][xKey])}
              </text>
            </svg>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3 pt-0">
        <div className="flex flex-wrap gap-2">
          {pointsBySeries.map((entry) => (
            <Badge
              key={entry.key}
              variant="outline"
              className="gap-2 rounded-full px-2.5 py-1 text-xs"
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: entry.stroke }}
              />
              {entry.label}
            </Badge>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          {pointsBySeries.map((entry) => (
            <span key={entry.key} className="ml-3 first:ml-0">
              {entry.label}:{" "}
              <span className="font-medium text-foreground">
                {yLabel(entry.latestValue)}
              </span>
            </span>
          ))}
        </div>
        {footer ? (
          <div className="w-full text-sm text-muted-foreground">{footer}</div>
        ) : null}
      </CardFooter>
    </Card>
  );
}
