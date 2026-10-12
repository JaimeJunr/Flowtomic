/**
 * CodeTabs - Flowtomic UI
 *
 * Um mesmo exemplo de código em várias combinações (eixos de abas) e com valores
 * trocáveis dentro do código (chips de variável). Reaproveita o CodeBlock.
 */

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "motion/react";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  CodeBlock,
  CodeBlockCopyButton,
  type CodeBlockLanguage,
} from "../../../atoms/code/code-block";

export type CodeTabsOption = { value: string; label: ReactNode; icon?: ReactNode };

export type CodeTabsAxis = {
  id: string;
  /** Nome acessível do tablist. */
  label: string;
  options: CodeTabsOption[];
  /** "end" = à direita da última linha (ex.: linguagem). */
  placement?: "row" | "end";
};

export type CodeTabsSnippet = {
  /** Eixo ausente no `match` casa com qualquer valor. */
  match: Record<string, string>;
  code: string;
  language: CodeBlockLanguage;
};

export type CodeTabsVariable = {
  id: string;
  label: string;
  options: CodeTabsOption[];
  more?: { label: ReactNode; href: string };
};

export type CodeTabsProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  axes: CodeTabsAxis[];
  snippets: CodeTabsSnippet[];
  variables?: CodeTabsVariable[];
  value?: Record<string, string>;
  defaultValue?: Record<string, string>;
  onValueChange?: (value: Record<string, string>) => void;
  footerStart?: ReactNode;
  footerEnd?: ReactNode;
  /** Padrão true. */
  showLineNumbers?: boolean;
  /** Altura mínima da área de código, em linhas. Padrão 8. */
  minLines?: number;
  /** Marca por 600 ms o valor trocado por uma variável. Padrão true. */
  highlightChanges?: boolean;
  onCopy?: (code: string) => void;
};

const CHANGE_MS = 600;
const HIGHLIGHT_NAME = "code-tabs-change";
const PLACEHOLDER = /\{\{([\w-]+)\}\}/g;

function snippetMatches(snippet: CodeTabsSnippet, selection: Record<string, string>): boolean {
  return Object.entries(snippet.match).every(([axisId, v]) => selection[axisId] === v);
}

type ResolvedAxis = { axis: CodeTabsAxis; options: CodeTabsOption[]; current: string };

/**
 * Resolve a seleção eixo a eixo: opção sem exemplo (dado o que vem antes) some, e o valor
 * atual que ficou sem exemplo pula para a primeira opção disponível.
 */
function resolveAxes(
  axes: CodeTabsAxis[],
  snippets: CodeTabsSnippet[],
  requested: Record<string, string>
): { resolved: ResolvedAxis[]; selection: Record<string, string> } {
  const selection: Record<string, string> = {};
  const resolved: ResolvedAxis[] = [];
  for (const axis of axes) {
    const available = axis.options.filter((option) => {
      const probe = { ...selection, [axis.id]: option.value };
      return snippets.some((s) => {
        // só compara com os eixos já decididos e este
        return Object.entries(s.match).every(([id, v]) => (id in probe ? probe[id] === v : true));
      });
    });
    const options = available.length > 0 ? available : axis.options;
    const wanted = requested[axis.id];
    const current = options.some((o) => o.value === wanted) ? wanted : (options[0]?.value ?? "");
    selection[axis.id] = current;
    resolved.push({ axis, options, current });
  }
  return { resolved, selection };
}

function substitute(code: string, values: Record<string, string>): string {
  return code.replace(PLACEHOLDER, (whole, id: string) => values[id] ?? whole);
}

type HighlightRegistry = {
  set: (name: string, h: unknown) => void;
  delete: (name: string) => void;
};

function getHighlightApi(): {
  registry: HighlightRegistry;
  Highlight: new (...r: Range[]) => unknown;
} | null {
  const registry = (globalThis as { CSS?: { highlights?: HighlightRegistry } }).CSS?.highlights;
  const HighlightCtor = (globalThis as { Highlight?: new (...r: Range[]) => unknown }).Highlight;
  return registry && HighlightCtor ? { registry, Highlight: HighlightCtor } : null;
}

const tabTriggerClass =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-muted data-[state=active]:text-foreground";

function AxisTabs({
  axis,
  options,
  current,
  size,
  panelId,
  innermost,
  baseId,
  onChange,
}: {
  axis: CodeTabsAxis;
  options: CodeTabsOption[];
  current: string;
  size: "md" | "sm";
  panelId: string;
  innermost: boolean;
  baseId: string;
  onChange: (value: string) => void;
}) {
  const textClass = size === "md" ? "text-sm" : "text-xs";
  if (axis.placement === "end" && options.length > 3) {
    return (
      <select
        data-slot="code-tabs-axis"
        data-axis={axis.id}
        aria-label={axis.label}
        value={current}
        onChange={(event) => onChange(event.target.value)}
        className="h-7 rounded-md border bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {typeof option.label === "string" ? option.label : option.value}
          </option>
        ))}
      </select>
    );
  }
  return (
    <TabsPrimitive.Root value={current} onValueChange={onChange} activationMode="automatic">
      <TabsPrimitive.List
        data-slot="code-tabs-axis"
        data-axis={axis.id}
        aria-label={axis.label}
        className={cn("flex items-center gap-0.5", textClass)}
      >
        {options.map((option) => (
          <TabsPrimitive.Trigger
            key={option.value}
            value={option.value}
            id={`${baseId}-${axis.id}-${option.value}`}
            aria-controls={innermost ? panelId : undefined}
            className={tabTriggerClass}
          >
            {option.icon}
            {option.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}

function CodeTabs({
  axes,
  snippets,
  variables = [],
  value,
  defaultValue,
  onValueChange,
  footerStart,
  footerEnd,
  showLineNumbers = true,
  minLines = 8,
  highlightChanges = true,
  onCopy,
  className,
  ...props
}: CodeTabsProps) {
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const reduceMotion = useShouldReduceMotion();
  const [internal, setInternal] = useState<Record<string, string>>(defaultValue ?? {});
  const requested = value ?? internal;

  const { resolved, selection: axisSelection } = useMemo(
    () => resolveAxes(axes, snippets, requested),
    [axes, snippets, requested]
  );

  const variableValues = useMemo(() => {
    const result: Record<string, string> = {};
    for (const variable of variables) {
      const wanted = requested[variable.id];
      const option = variable.options.find((o) => o.value === wanted) ?? variable.options[0];
      if (option) result[variable.id] = option.value;
    }
    return result;
  }, [variables, requested]);

  const fullSelection = { ...axisSelection, ...variableValues };
  const snippetIndex = snippets.findIndex((s) => snippetMatches(s, fullSelection));
  const snippet = snippetIndex >= 0 ? snippets[snippetIndex] : undefined;
  const code = snippet ? substitute(snippet.code, variableValues) : "";

  const change = (patch: Record<string, string>) => {
    const next = { ...fullSelection, ...patch };
    const { selection } = resolveAxes(axes, snippets, next);
    const emitted = { ...next, ...selection };
    if (value === undefined) setInternal(emitted);
    onValueChange?.(emitted);
  };

  // linhas: eixos "row" um por linha; eixos "end" vão ao fim da última linha
  const rowAxes = resolved.filter((r) => r.axis.placement !== "end");
  const endAxes = resolved.filter((r) => r.axis.placement === "end");
  const rows: ResolvedAxis[][] =
    rowAxes.length > 0 ? rowAxes.map((r) => [r]) : endAxes.length > 0 ? [[]] : [];
  if (rows.length > 0) rows[rows.length - 1] = [...rows[rows.length - 1], ...endAxes];
  const innermostAxisId = (rowAxes.length > 0 ? rowAxes : resolved).at(-1)?.axis.id;

  // marcação do valor trocado por variável
  const panelRef = useRef<HTMLDivElement>(null);
  const previousVariables = useRef(variableValues);
  const [flash, setFlash] = useState<string[]>([]);
  const variablesKey = JSON.stringify(variableValues);

  // biome-ignore lint/correctness/useExhaustiveDependencies: roda só quando a seleção de variáveis muda
  useEffect(() => {
    const before = previousVariables.current;
    previousVariables.current = variableValues;
    if (!highlightChanges || reduceMotion) return;
    const changed = Object.entries(variableValues)
      .filter(([id, v]) => id in before && before[id] !== v)
      .map(([, v]) => v);
    if (changed.length === 0) return;
    setFlash(changed);
    const timer = setTimeout(() => setFlash([]), CHANGE_MS);
    return () => clearTimeout(timer);
  }, [variablesKey]);

  useEffect(() => {
    const api = getHighlightApi();
    const root = panelRef.current;
    if (flash.length === 0 || !api || !root) return;
    const apply = () => {
      const ranges: Range[] = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node.textContent ?? "";
        for (const needle of flash) {
          for (
            let at = text.indexOf(needle);
            at >= 0;
            at = text.indexOf(needle, at + needle.length)
          ) {
            const range = document.createRange();
            range.setStart(node, at);
            range.setEnd(node, at + needle.length);
            ranges.push(range);
          }
        }
      }
      api.registry.set(HIGHLIGHT_NAME, new api.Highlight(...ranges));
    };
    apply();
    // o realce do Shiki chega depois: reaplica quando o conteúdo mudar
    const observer = new MutationObserver(apply);
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      api.registry.delete(HIGHLIGHT_NAME);
    };
  }, [flash]);

  const hasFooter = Boolean(footerStart) || Boolean(footerEnd);

  return (
    <div data-slot="code-tabs" className={cn("flex w-full flex-col gap-3", className)} {...props}>
      <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
        {rows.length > 0 ? (
          <div className="flex flex-col gap-1 border-b p-1.5">
            {rows.map((row, rowIndex) => {
              const primary = rowIndex === 0;
              const own = rowAxes[rowIndex] ?? undefined;
              const rowKey = own?.axis.id ?? row[0]?.axis.id ?? String(rowIndex);
              return (
                <div key={rowKey} className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center">
                    {own ? (
                      <AxisTabs
                        axis={own.axis}
                        options={own.options}
                        current={own.current}
                        size={primary ? "md" : "sm"}
                        panelId={panelId}
                        innermost={own.axis.id === innermostAxisId}
                        baseId={baseId}
                        onChange={(next) => change({ [own.axis.id]: next })}
                      />
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {row
                      .filter((r) => r.axis.placement === "end")
                      .map((r) => (
                        <AxisTabs
                          key={r.axis.id}
                          axis={r.axis}
                          options={r.options}
                          current={r.current}
                          size="sm"
                          panelId={panelId}
                          innermost={r.axis.id === innermostAxisId}
                          baseId={baseId}
                          onChange={(next) => change({ [r.axis.id]: next })}
                        />
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
        <div
          ref={panelRef}
          id={panelId}
          role="tabpanel"
          data-slot="code-tabs-panel"
          aria-labelledby={
            innermostAxisId
              ? `${baseId}-${innermostAxisId}-${axisSelection[innermostAxisId]}`
              : undefined
          }
          style={{ minHeight: `calc(${minLines} * 1.25rem + 2rem)` }}
          className="relative"
        >
          {snippet ? (
            <motion.div
              key={snippetIndex}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <CodeBlock
                code={code}
                language={snippet.language}
                showLineNumbers={showLineNumbers}
                showLanguage={false}
                className="rounded-none border-0 [&_[data-slot=code-block-header]]:absolute [&_[data-slot=code-block-header]]:top-1 [&_[data-slot=code-block-header]]:right-1 [&_[data-slot=code-block-header]]:z-10 [&_[data-slot=code-block-header]]:min-h-0 [&_[data-slot=code-block-header]]:border-b-0 [&_[data-slot=code-block-header]]:p-0 [&_[data-slot=code-block-language]]:hidden"
              >
                <CodeBlockCopyButton onCopy={() => onCopy?.(code)} />
              </CodeBlock>
            </motion.div>
          ) : (
            <p className="p-4 text-sm text-muted-foreground">Sem exemplo para esta combinação.</p>
          )}
          <style>{`::highlight(${HIGHLIGHT_NAME}){background-color:color-mix(in oklch,var(--primary) 25%,transparent)}`}</style>
        </div>
        {hasFooter ? (
          <div
            data-slot="code-tabs-footer"
            className="flex items-center justify-between gap-2 border-t px-2 py-1.5 text-sm"
          >
            <div className="flex items-center gap-2">{footerStart}</div>
            <div className="flex items-center gap-2">{footerEnd}</div>
          </div>
        ) : null}
      </div>
      {variables.length > 0 ? (
        <div data-slot="code-tabs-variables" className="flex flex-wrap items-center gap-2">
          {variables.map((variable) => (
            <div key={variable.id} className="flex flex-wrap items-center gap-2">
              <RadioGroupPrimitive.Root
                aria-label={variable.label}
                value={variableValues[variable.id] ?? ""}
                onValueChange={(next) => change({ [variable.id]: next })}
                orientation="horizontal"
                className="flex flex-wrap items-center gap-2"
              >
                {variable.options.map((option) => (
                  <RadioGroupPrimitive.Item
                    key={option.value}
                    value={option.value}
                    data-slot="code-tabs-variable-chip"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-transparent px-3 py-1 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=checked]:border-foreground data-[state=checked]:bg-background data-[state=checked]:text-foreground"
                  >
                    {option.icon}
                    {option.label}
                  </RadioGroupPrimitive.Item>
                ))}
              </RadioGroupPrimitive.Root>
              {variable.more ? (
                <a
                  href={variable.more.href}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {variable.more.label}
                </a>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
CodeTabs.displayName = "CodeTabs";

export { CodeTabs };
