"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type SupervisorTrendDirection = "up" | "down" | "flat";

export interface SupervisorSummaryCardData {
  label: string;
  value: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  icon?: LucideIcon;
  trendLabel?: string;
  trendDirection?: SupervisorTrendDirection;
  trendTone?: "neutral" | "positive" | "warning" | "destructive";
  className?: string;
}

export interface SupervisorSummaryCardsProps {
  cards: SupervisorSummaryCardData[];
  className?: string;
}

function getTrendIcon(direction?: SupervisorTrendDirection) {
  switch (direction) {
    case "down":
      return ArrowDownRight;
    case "flat":
      return Minus;
    case "up":
    default:
      return ArrowUpRight;
  }
}

function getTrendVariant(tone?: SupervisorSummaryCardData["trendTone"]) {
  switch (tone) {
    case "destructive":
      return "destructive";
    case "warning":
      return "warning";
    case "positive":
      return "success";
    case "neutral":
    default:
      return "outline";
  }
}

export function SupervisorSummaryCards({
  cards,
  className,
}: SupervisorSummaryCardsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 px-4 md:grid-cols-2 xl:grid-cols-4 md:px-6",
        className,
      )}
    >
      {cards.map((card) => {
        const TrendIcon = getTrendIcon(card.trendDirection);

        return (
          <Card
            key={card.label}
            className={cn(
              "border-border/70 bg-gradient-to-b from-card to-card/95 shadow-xs",
              card.className,
            )}
          >
            <CardHeader className="items-start gap-2">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardDescription>{card.label}</CardDescription>
                  <CardTitle className="mt-1 text-2xl font-semibold tabular-nums md:text-3xl">
                    {card.value}
                  </CardTitle>
                </div>
                {card.icon ? (
                  <span className="flex size-10 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground">
                    <card.icon />
                  </span>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {card.description ? (
                <div className="text-sm text-muted-foreground">
                  {card.description}
                </div>
              ) : null}
            </CardContent>
            <CardFooter className="flex items-center justify-between gap-3 pt-0">
              {card.footer ? (
                <div className="text-sm font-medium text-foreground">
                  {card.footer}
                </div>
              ) : (
                <div />
              )}
              {card.trendLabel ? (
                <Badge
                  variant={getTrendVariant(card.trendTone)}
                  className="gap-1 rounded-full px-2.5 py-1"
                >
                  <TrendIcon />
                  {card.trendLabel}
                </Badge>
              ) : null}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
