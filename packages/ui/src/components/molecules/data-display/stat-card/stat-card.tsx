/**
 * StatCard - Componente Visual
 *
 * Implementação visual usando o Headless UI hook useStatCard
 * Este componente adiciona markup e styles ao hook Headless
 */

import { type StatCardData, useStatCard } from "flowtomic/logic";
import {
  ArrowDown,
  ArrowUp,
  Minus,
  MoreHorizontal,
  Pin,
  Settings,
  Share2,
  Trash,
  TriangleAlert,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { cn } from "@/lib/utils";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SlidingNumber,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../atoms";

export interface StatCardProps extends StatCardData {
  /**
   * Título do card
   */
  title: string;

  /**
   * Subtítulo/descrição do card
   */
  subtitle?: string;

  /**
   * Cor de destaque do card (tokens semânticos)
   */
  color?: "primary" | "success" | "warning" | "error" | "info";

  /**
   * Variante do layout do card
   */
  variant?: "compact" | "default" | "detailed";

  /**
   * Classe CSS adicional
   */
  className?: string;

  /**
   * Conteúdo adicional (children)
   */
  children?: React.ReactNode;

  /**
   * Se deve mostrar o menu de ações (dropdown)
   */
  showActions?: boolean;

  /**
   * Callbacks para ações do menu
   */
  onSettings?: () => void;
  onAddAlert?: () => void;
  onPin?: () => void;
  onShare?: () => void;
  onRemove?: () => void;
}

const colorClasses = {
  primary: "bg-card border-border hover:bg-surface-hover",
  success: "bg-card border-border hover:bg-surface-hover",
  warning: "bg-card border-border hover:bg-surface-hover",
  error: "bg-card border-border hover:bg-surface-hover",
  info: "bg-card border-border hover:bg-surface-hover",
};

const accentColors = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
  info: "text-muted-foreground",
};

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      title,
      value,
      subtitle,
      delta,
      lastMonth,
      prefix,
      suffix,
      locale,
      currency,
      currencyDisplay,
      format,
      lastFormat,
      positive,
      color = "primary",
      variant = "default",
      className,
      children,
      showActions = false,
      onSettings,
      onAddAlert,
      onPin,
      onShare,
      onRemove,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const prevValueRef = React.useRef<number>(typeof value === "number" ? value : 0);

    // Atualiza valor anterior quando value muda
    React.useEffect(() => {
      if (typeof value === "number") {
        prevValueRef.current = value;
      }
    }, [value]);

    // Variantes de layout
    const isCompact = variant === "compact";
    const isDetailed = variant === "detailed";

    // Determina se o botão de ações deve ser visível
    // Visível quando: hover no card OU dropdown aberto OU variante detailed
    const shouldShowActions = isHovered || isDropdownOpen || isDetailed;

    // Determina se é positivo baseado no delta
    const computedPositive = React.useMemo(() => {
      if (positive !== undefined) return positive;
      if (delta !== undefined) return delta >= 0;
      return undefined;
    }, [positive, delta]);

    // Headless UI Hook - apenas lógica
    // Se value for number, usa o hook; se for string, usa diretamente
    const isNumericValue = typeof value === "number";
    const statCardData = useStatCard(
      isNumericValue
        ? {
            value,
            delta,
            lastMonth,
            prefix,
            suffix,
            locale,
            currency,
            currencyDisplay,
            format,
            lastFormat,
            positive: computedPositive,
          }
        : {
            value: 0,
            delta,
            lastMonth,
            prefix,
            suffix,
            locale,
            currency,
            currencyDisplay,
            format,
            lastFormat,
            positive: computedPositive,
          }
    );

    // Valor formatado (do hook ou string direto)
    const displayValue = isNumericValue ? statCardData.formattedValue : value;

    // Determina se deve usar animação
    // Só anima se:
    // 1. O valor é numérico
    // 2. Não há função de formatação customizada (SlidingNumber não suporta format customizado)
    // 3. Não há currency definido (currency já formata com símbolo, não compatível com SlidingNumber)
    // O SlidingNumber gerencia internamente as mudanças de valor e anima automaticamente
    const shouldAnimate = React.useMemo(() => {
      return isNumericValue && typeof value === "number" && !format && !currency;
    }, [isNumericValue, value, format, currency]);

    // Determina direção da animação baseada no delta
    const animationDirection = React.useMemo(() => {
      if (delta === undefined || delta === 0) return "neutral";
      return delta > 0 ? "up" : "down";
    }, [delta]);

    // Ícone de tendência
    const getTrendIcon = () => {
      // Determina a direção: usa delta diretamente se disponível, senão usa a direção do hook
      let direction: "up" | "down" | "neutral" = "neutral";

      if (delta !== undefined) {
        // Prioriza o delta explícito
        direction = delta > 0 ? "up" : delta < 0 ? "down" : "neutral";
      } else {
        // Caso contrário, usa a direção calculada pelo hook
        direction = statCardData.trend.direction;
      }

      // Retorna o ícone apropriado
      return direction === "up" ? (
        <ArrowUp className="h-4 w-4 text-success" />
      ) : direction === "down" ? (
        <ArrowDown className="h-4 w-4 text-error" />
      ) : (
        <Minus className="h-4 w-4 text-muted-foreground" />
      );
    };

    return (
      <Card
        ref={ref}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "transition-all duration-300 hover:shadow-lg hover:scale-[1.01] border relative",
          colorClasses[color],
          isCompact && "p-4",
          className
        )}
        {...props}
      >
        <CardHeader
          className={cn(
            "flex flex-row items-start justify-between space-y-0 border-0",
            isCompact ? "pb-2" : "pb-4 sm:pb-6"
          )}
        >
          <div className="space-y-1 flex-1 min-w-0 pr-2">
            <CardTitle
              className={cn(
                "font-medium text-muted-foreground uppercase tracking-wide truncate",
                isCompact ? "text-[10px]" : "text-xs"
              )}
            >
              {title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {showActions && (
              <TooltipProvider delayDuration={200}>
                <AnimatePresence>
                  {shouldShowActions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => {
                        // Só remove hover se o dropdown não estiver aberto
                        if (!isDropdownOpen) {
                          setIsHovered(false);
                        }
                      }}
                    >
                      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            Mais opções
                          </TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent
                          align="end"
                          side="bottom"
                          className="w-48"
                          onMouseEnter={() => setIsHovered(true)}
                          onMouseLeave={() => {
                            // Quando o mouse sai do menu, fecha o dropdown
                            setIsDropdownOpen(false);
                            setIsHovered(false);
                          }}
                        >
                          {onSettings && (
                            <DropdownMenuItem onClick={onSettings} className="cursor-pointer">
                              <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                              Configurações
                            </DropdownMenuItem>
                          )}
                          {onAddAlert && (
                            <DropdownMenuItem onClick={onAddAlert} className="cursor-pointer">
                              <TriangleAlert className="mr-2 h-4 w-4 text-muted-foreground" />
                              Adicionar Alerta
                            </DropdownMenuItem>
                          )}
                          {onPin && (
                            <DropdownMenuItem onClick={onPin} className="cursor-pointer">
                              <Pin className="mr-2 h-4 w-4 text-muted-foreground" />
                              Fixar no Dashboard
                            </DropdownMenuItem>
                          )}
                          {onShare && (
                            <DropdownMenuItem onClick={onShare} className="cursor-pointer">
                              <Share2 className="mr-2 h-4 w-4 text-muted-foreground" />
                              Compartilhar
                            </DropdownMenuItem>
                          )}
                          {onRemove && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={onRemove}
                                className="text-error cursor-pointer focus:text-error"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Remover
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TooltipProvider>
            )}
          </div>
        </CardHeader>
        <CardContent className={cn("space-y-2.5", isCompact && "pt-2")}>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3">
            <motion.div
              key={typeof value === "number" ? value : displayValue}
              initial={
                animationDirection === "up"
                  ? { y: 10, opacity: 0.5 }
                  : animationDirection === "down"
                    ? { y: -10, opacity: 0.5 }
                    : { y: 0, opacity: 1 }
              }
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn(
                "text-xl sm:text-2xl font-semibold tracking-tight wrap-break-word inline-flex items-baseline gap-1",
                accentColors[color],
                isCompact && "text-lg sm:text-xl"
              )}
            >
              {shouldAnimate ? (
                <>
                  {prefix && <span className="text-base sm:text-lg font-medium">{prefix}</span>}
                  <SlidingNumber
                    number={value}
                    inView={true}
                    inViewOnce={false}
                    transition={{
                      stiffness: 200,
                      damping: 20,
                      mass: 0.4,
                    }}
                  />
                  {suffix && <span className="text-base sm:text-lg font-medium">{suffix}</span>}
                </>
              ) : (
                displayValue
              )}
            </motion.div>
            {(delta !== undefined || statCardData.trend.delta > 0) && (
              <Badge
                variant={statCardData.trend.variant}
                className={cn(
                  "text-xs font-semibold inline-flex items-center gap-1 w-fit shrink-0",
                  "h-fit py-0.5 px-2"
                )}
              >
                {getTrendIcon()}
                {statCardData.trend.percentage}
              </Badge>
            )}
          </div>
          {subtitle && !isCompact && (
            <p
              className={cn(
                "text-muted-foreground leading-relaxed wrap-break-word",
                isDetailed ? "text-sm sm:text-base pt-1" : "text-xs sm:text-sm pt-1"
              )}
            >
              {subtitle}
            </p>
          )}
          {statCardData.formattedLastMonth && !isCompact && (
            <div
              className={cn(
                "text-xs text-muted-foreground border-t border-border",
                isDetailed ? "mt-3 pt-3" : "mt-2 pt-2 sm:pt-2.5"
              )}
            >
              <span className="wrap-break-word">
                Vs último mês:{" "}
                <span className="font-medium text-foreground">
                  {statCardData.formattedLastMonth}
                </span>
              </span>
            </div>
          )}
          {children && !isCompact && (
            <div className={cn("border-t border-border", isDetailed ? "mt-4 pt-4" : "mt-3 pt-3")}>
              {children}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = "StatCard";

export { StatCard };
