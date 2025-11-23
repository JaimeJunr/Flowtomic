/**
 * MonthlySummary - Organism Component
 *
 * Componente complexo que exibe resumo financeiro mensal.
 * Tornado agnóstico de moeda e localização.
 */

import { TrendingUp } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "../../atoms";

export interface MonthlySummaryProps {
  totalRevenue?: number;
  costs?: number;
  netProfit?: number;
  growthPercentage?: number;
  className?: string;
  /**
   * Função de formatação de moeda (padrão: formata como número simples)
   */
  formatCurrency?: (value: number) => string;
  /**
   * Labels customizáveis
   */
  labels?: {
    title?: string;
    totalRevenue?: string;
    costs?: string;
    netProfit?: string;
    growthLabel?: string;
  };
}

/**
 * Organismo: MonthlySummary
 *
 * Componente complexo que exibe resumo financeiro mensal
 * Composto por múltiplas moléculas e átomos
 */
export const MonthlySummary = React.forwardRef<HTMLDivElement, MonthlySummaryProps>(
  (
    {
      totalRevenue = 0,
      costs = 0,
      netProfit = 0,
      growthPercentage,
      className,
      formatCurrency = (value: number) => value.toLocaleString(),
      labels = {},
      ...props
    },
    ref
  ) => {
    const {
      title = "Resumo do Mês",
      totalRevenue: totalRevenueLabel = "Receita Total",
      costs: costsLabel = "Custos",
      netProfit: netProfitLabel = "Lucro Líquido",
      growthLabel = "vs mês anterior",
    } = labels;

    return (
      <Card
        ref={ref}
        className={cn(
          "bg-card border border-border hover:shadow-lg transition-all duration-300",
          className
        )}
        {...props}
      >
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <CardTitle className="text-foreground font-semibold text-base">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
              <span className="text-sm font-medium text-muted-foreground">{totalRevenueLabel}</span>
              <span className="font-bold text-lg text-success">{formatCurrency(totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
              <span className="text-sm font-medium text-muted-foreground">{costsLabel}</span>
              <span className="font-bold text-lg text-destructive">{formatCurrency(costs)}</span>
            </div>
            <div className="flex items-center justify-between p-5 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground mt-2 shadow-md">
              <span className="text-sm font-semibold">{netProfitLabel}</span>
              <span className="font-bold text-2xl">{formatCurrency(netProfit)}</span>
            </div>
            {growthPercentage !== undefined && (
              <div className="pt-2">
                <Badge variant="success" className="font-semibold">
                  <TrendingUp className="h-3 w-3 mr-1" />+{growthPercentage}% {growthLabel}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

MonthlySummary.displayName = "MonthlySummary";
