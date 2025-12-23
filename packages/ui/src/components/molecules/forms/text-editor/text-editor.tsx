/**
 * TextEditor - Flowtomic UI
 *
 * Editor de texto rico com TipTap + modos opcionais Markdown e Preview.
 * Regras de modo:
 * - Somente 'rich' => sem abas, apenas editor rico
 * - Somente 'markdown' => textarea markdown + (preview opcional)
 * - Somente 'preview' => somente visualização
 * - Múltiplos modos => abas para cada modo disponível
 */

import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Eye,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  List as ListIcon,
  ListOrdered,
  Palette,
  Quote,
  Strikethrough,
} from "lucide-react";
import * as React from "react";
import { Streamdown } from "streamdown";
import { Markdown } from "tiptap-markdown";
import { cn } from "@/lib/utils";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../atoms";

export type TextEditorMode = "rich" | "markdown" | "preview";

export type TextEditorToolbarAction =
  | "bold"
  | "italic"
  | "strike"
  | "code"
  | "h1"
  | "h2"
  | "h3"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "alignLeft"
  | "alignCenter"
  | "alignRight"
  | "textColor"
  | "image";

const DEFAULT_ACTIONS: TextEditorToolbarAction[] = [
  "bold",
  "italic",
  "strike",
  "code",
  "h1",
  "h2",
  "h3",
  "bulletList",
  "orderedList",
  "blockquote",
  "alignLeft",
  "alignCenter",
  "alignRight",
  "textColor",
  "image",
];

const PRESET_COLORS = [
  { label: "Preto", value: "#000000" },
  { label: "Cinza escuro", value: "#374151" },
  { label: "Cinza", value: "#6B7280" },
  { label: "Cinza claro", value: "#9CA3AF" },
  { label: "Vermelho", value: "#EF4444" },
  { label: "Laranja", value: "#F97316" },
  { label: "Amarelo", value: "#EAB308" },
  { label: "Verde", value: "#10B981" },
  { label: "Azul", value: "#3B82F6" },
  { label: "Índigo", value: "#6366F1" },
  { label: "Roxo", value: "#A855F7" },
  { label: "Rosa", value: "#EC4899" },
  { label: "Vermelho escuro", value: "#991B1B" },
  { label: "Laranja escuro", value: "#9A3412" },
  { label: "Amarelo escuro", value: "#854D0E" },
  { label: "Verde escuro", value: "#065F46" },
  { label: "Azul escuro", value: "#1E40AF" },
  { label: "Índigo escuro", value: "#3730A3" },
  { label: "Roxo escuro", value: "#6B21A8" },
  { label: "Rosa escuro", value: "#9F1239" },
  { label: "Vermelho claro", value: "#FCA5A5" },
  { label: "Laranja claro", value: "#FDBA74" },
  { label: "Amarelo claro", value: "#FDE047" },
  { label: "Verde claro", value: "#6EE7B7" },
  { label: "Azul claro", value: "#93C5FD" },
  { label: "Índigo claro", value: "#A5B4FC" },
  { label: "Roxo claro", value: "#D8B4FE" },
  { label: "Rosa claro", value: "#F9A8D4" },
] as const;

function useMarkdownState(controlled: string | undefined, initial: string) {
  const isControlled = controlled !== undefined;
  const [value, setValue] = React.useState(initial);
  React.useEffect(() => {
    if (isControlled && controlled !== undefined) setValue(controlled);
  }, [controlled, isControlled]);
  return { value, setValue, isControlled } as const;
}

function stripMarkdown(md: string): string {
  return md
    .replace(/`{1,3}[^`]*`/g, (m) => m.replace(/`/g, ""))
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/>\s+/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]\([^)]*\)/g, (m) => m.match(/\[([^\]]+)\]/)?.[1] || "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type BaseDivProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">;

export interface TextEditorProps extends BaseDivProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  mode?: TextEditorMode; // modo controlado atual
  onModeChange?: (mode: TextEditorMode) => void;
  toolbar?: boolean;
  allowedActions?: TextEditorToolbarAction[];
  onUploadImage?: (file: File) => Promise<string> | string;
  outputFormat?: "markdown" | "text";
  /** Modos disponíveis. 'markdown' sempre inclui 'preview' automaticamente */
  availableModes?: ("rich" | "markdown")[];
}

export const TextEditor = React.forwardRef<HTMLDivElement, TextEditorProps>(
  (
    {
      className,
      value: controlledValue,
      defaultValue,
      onChange,
      placeholder = "Escreva algo...",
      editable = true,
      mode: controlledMode,
      onModeChange,
      toolbar = true,
      allowedActions = DEFAULT_ACTIONS,
      onUploadImage,
      outputFormat = "markdown",
      availableModes = ["rich", "markdown"],
      ...props
    },
    ref
  ) => {
    const initial = controlledValue ?? defaultValue ?? "";
    const {
      value: internalMarkdown,
      setValue: setInternalMarkdown,
      isControlled,
    } = useMarkdownState(controlledValue, initial);

    // Expandir modos: se markdown está presente, adicionar preview automaticamente
    const effectiveModes = React.useMemo<TextEditorMode[]>(() => {
      const unique = availableModes.filter((m, i, arr) => arr.indexOf(m) === i);
      const expanded: TextEditorMode[] = [];

      if (unique.includes("rich")) expanded.push("rich");
      if (unique.includes("markdown")) {
        expanded.push("markdown");
        expanded.push("preview"); // markdown sempre vem com preview
      }

      return expanded.length > 0 ? expanded : ["rich"];
    }, [availableModes]);

    const [mode, setMode] = React.useState<TextEditorMode>(
      controlledMode && effectiveModes.includes(controlledMode) ? controlledMode : effectiveModes[0]
    );
    const setModeSafe = React.useCallback(
      (m: TextEditorMode) => {
        if (!effectiveModes.includes(m)) return;
        setMode(m);
        onModeChange?.(m);
      },
      [effectiveModes, onModeChange]
    );

    const editor = useEditor({
      editable,
      extensions: [
        Markdown.configure({ html: false, transformPastedText: true, transformCopiedText: true }),
        StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
        TextStyle,
        Color,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Placeholder.configure({ placeholder }),
        Image,
      ],
      content: internalMarkdown ? undefined : "",
      onUpdate: ({ editor }) => {
        try {
          // Acesso ao storage markdown da extensão tiptap-markdown
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const md: string = (editor?.storage as any)?.markdown?.getMarkdown?.() ?? "";
          if (typeof md === "string") {
            if (!isControlled) setInternalMarkdown(md);
            if (outputFormat === "text") {
              onChange?.(editor.getText());
            } else {
              onChange?.(md);
            }
          }
        } catch {
          /* silencioso */
        }
      },
    });

    React.useEffect(() => {
      if (!editor) return;
      if (controlledValue === undefined) return;
      const nextMarkdown = controlledValue; // já é markdown ou texto; se texto não temos conversão -> usar direto
      // @ts-expect-error comando da extensão markdown
      if (editor.commands?.setMarkdown) {
        // @ts-expect-error
        editor.commands.setMarkdown(nextMarkdown);
      } else {
        editor.commands.setContent(nextMarkdown);
      }
    }, [editor, controlledValue]);

    const handleImageInsert = React.useCallback(async () => {
      if (!editor) return;
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        const url = onUploadImage ? await onUploadImage(file) : URL.createObjectURL(file);
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      };
      input.click();
    }, [editor, onUploadImage]);

    const Toolbar = React.useMemo(() => {
      if (!toolbar) return null;
      const e = editor as Editor | null;
      const run = (cb: (ed: Editor) => void) => () => e && cb(e);
      return (
        <div className="flex flex-wrap items-center gap-1 rounded-md border bg-muted/40 p-1">
          {allowedActions.includes("bold") && (
            <ToolbarButton
              label="Negrito"
              active={e?.isActive("bold")}
              onClick={run((ed) => ed.chain().focus().toggleBold().run())}
            >
              <Bold size={14} />
            </ToolbarButton>
          )}
          {allowedActions.includes("italic") && (
            <ToolbarButton
              label="Itálico"
              active={e?.isActive("italic")}
              onClick={run((ed) => ed.chain().focus().toggleItalic().run())}
            >
              <Italic size={14} />
            </ToolbarButton>
          )}
          {allowedActions.includes("strike") && (
            <ToolbarButton
              label="Tachado"
              active={e?.isActive("strike")}
              onClick={run((ed) => ed.chain().focus().toggleStrike().run())}
            >
              <Strikethrough size={14} />
            </ToolbarButton>
          )}
          {allowedActions.includes("code") && (
            <ToolbarButton
              label="Código inline"
              active={e?.isActive("code")}
              onClick={run((ed) => ed.chain().focus().toggleCode().run())}
            >
              <Code size={14} />
            </ToolbarButton>
          )}
          <Separator orientation="vertical" className="mx-1 h-6" />
          {allowedActions.includes("h1") && (
            <ToolbarButton
              label="Título H1"
              active={e?.isActive("heading", { level: 1 })}
              onClick={run((ed) => ed.chain().focus().toggleHeading({ level: 1 }).run())}
            >
              <Heading1 size={14} />
            </ToolbarButton>
          )}
          {allowedActions.includes("h2") && (
            <ToolbarButton
              label="Título H2"
              active={e?.isActive("heading", { level: 2 })}
              onClick={run((ed) => ed.chain().focus().toggleHeading({ level: 2 }).run())}
            >
              <Heading2 size={14} />
            </ToolbarButton>
          )}
          {allowedActions.includes("h3") && (
            <ToolbarButton
              label="Título H3"
              active={e?.isActive("heading", { level: 3 })}
              onClick={run((ed) => ed.chain().focus().toggleHeading({ level: 3 }).run())}
            >
              <Heading3 size={14} />
            </ToolbarButton>
          )}
          <Separator orientation="vertical" className="mx-1 h-6" />
          {allowedActions.includes("bulletList") && (
            <ToolbarButton
              label="Lista não ordenada"
              active={e?.isActive("bulletList")}
              onClick={run((ed) => ed.chain().focus().toggleBulletList().run())}
            >
              <ListIcon size={14} />
            </ToolbarButton>
          )}
          {allowedActions.includes("orderedList") && (
            <ToolbarButton
              label="Lista ordenada"
              active={e?.isActive("orderedList")}
              onClick={run((ed) => ed.chain().focus().toggleOrderedList().run())}
            >
              <ListOrdered size={14} />
            </ToolbarButton>
          )}
          {allowedActions.includes("blockquote") && (
            <ToolbarButton
              label="Citação"
              active={e?.isActive("blockquote")}
              onClick={run((ed) => ed.chain().focus().toggleBlockquote().run())}
            >
              <Quote size={14} />
            </ToolbarButton>
          )}
          <Separator orientation="vertical" className="mx-1 h-6" />
          {allowedActions.includes("alignLeft") && (
            <ToolbarButton
              label="Alinhar à esquerda"
              active={e?.isActive({ textAlign: "left" })}
              onClick={run((ed) => ed.chain().focus().setTextAlign("left").run())}
            >
              <AlignLeft size={14} />
            </ToolbarButton>
          )}
          {allowedActions.includes("alignCenter") && (
            <ToolbarButton
              label="Centralizar"
              active={e?.isActive({ textAlign: "center" })}
              onClick={run((ed) => ed.chain().focus().setTextAlign("center").run())}
            >
              <AlignCenter size={14} />
            </ToolbarButton>
          )}
          {allowedActions.includes("alignRight") && (
            <ToolbarButton
              label="Alinhar à direita"
              active={e?.isActive({ textAlign: "right" })}
              onClick={run((ed) => ed.chain().focus().setTextAlign("right").run())}
            >
              <AlignRight size={14} />
            </ToolbarButton>
          )}
          <Separator orientation="vertical" className="mx-1 h-6" />
          {allowedActions.includes("textColor") && (
            <Popover>
              <TooltipProvider delayDuration={300} skipDelayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Palette size={14} />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={4}>Cor do texto</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <PopoverContent className="w-auto p-2">
                <div className="grid grid-cols-6 gap-1">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => e?.chain().focus().setColor(color.value).run()}
                      className="size-6 rounded border border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => e?.chain().focus().unsetColor().run()}
                    className="size-6 rounded border border-border hover:scale-110 transition-transform bg-background flex items-center justify-center text-xs"
                    title="Remover cor"
                  >
                    ✕
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          )}
          <Separator orientation="vertical" className="mx-1 h-6" />
          {allowedActions.includes("image") && (
            <ToolbarButton label="Inserir imagem" onClick={handleImageInsert}>
              <ImageIcon size={14} />
            </ToolbarButton>
          )}
        </div>
      );
    }, [editor, toolbar, allowedActions, handleImageInsert]);

    const richView = (
      <div className="grid gap-2">
        {Toolbar}
        <div
          className={cn(
            "prose dark:prose-invert prose-sm max-w-none rounded-md border bg-background p-3",
            "focus-within:ring-ring/50 focus-within:ring-[3px]"
          )}
        >
          <EditorContent editor={editor} className="min-h-40" />
        </div>
      </div>
    );

    const markdownEditor = (
      <Textarea
        className="font-mono text-sm"
        rows={14}
        value={internalMarkdown}
        onChange={(e) => {
          const next = e.target.value;
          setInternalMarkdown(next);
          if (outputFormat === "text") {
            onChange?.(stripMarkdown(next));
          } else {
            onChange?.(next);
          }
        }}
        placeholder={placeholder}
      />
    );

    const previewView = (
      <div className="rounded-md border bg-background p-3">
        <Streamdown>{internalMarkdown}</Streamdown>
      </div>
    );

    // Renderização sem abas (apenas rich sozinho)
    if (effectiveModes.length === 1 && effectiveModes[0] === "rich") {
      return (
        <div ref={ref} className={cn("grid gap-2", className)} {...props}>
          {richView}
        </div>
      );
    }

    // Com abas (markdown sempre inclui preview automaticamente)
    return (
      <div ref={ref} className={cn("grid gap-2", className)} {...props}>
        <Tabs value={mode} onValueChange={(v) => setModeSafe(v as TextEditorMode)}>
          <TabsList className="w-fit">
            {effectiveModes.includes("rich") && (
              <TabsTrigger value="rich">
                <span className="flex items-center gap-2">
                  <Eye className="size-3.5" /> Rich
                </span>
              </TabsTrigger>
            )}
            {effectiveModes.includes("markdown") && (
              <TabsTrigger value="markdown">
                <span className="flex items-center gap-2">
                  <FileText className="size-3.5" /> Markdown
                </span>
              </TabsTrigger>
            )}
            {effectiveModes.includes("preview") && (
              <TabsTrigger value="preview">
                <span className="flex items-center gap-2">
                  <Eye className="size-3.5" /> Preview
                </span>
              </TabsTrigger>
            )}
          </TabsList>

          {effectiveModes.includes("rich") && (
            <TabsContent value="rich" className="mt-2">
              {richView}
            </TabsContent>
          )}
          {effectiveModes.includes("markdown") && (
            <TabsContent value="markdown" className="mt-2">
              {markdownEditor}
            </TabsContent>
          )}
          {effectiveModes.includes("preview") && (
            <TabsContent value="preview" className="mt-2">
              {previewView}
            </TabsContent>
          )}
        </Tabs>
      </div>
    );
  }
);

TextEditor.displayName = "TextEditor";

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
}

function ToolbarButton({ label, active, className, children, ...rest }: ToolbarButtonProps) {
  return (
    <TooltipProvider delayDuration={300} skipDelayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn("h-7 w-7 p-0", active && "bg-accent text-accent-foreground", className)}
            {...rest}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent sideOffset={4}>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export { DEFAULT_ACTIONS };
