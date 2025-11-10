/**
 * ImageDropzone - Componente Molecule
 *
 * Componente para upload de imagens com drag & drop, preview e validação.
 * Segue a filosofia Atomic Design do Design System.
 *
 * Características:
 * - Drag & drop nativo (sem dependências externas)
 * - Preview de imagem
 * - Validação de tipo e tamanho
 * - Acessibilidade completa
 * - Integração com design tokens
 */

"use client";

import { Image as ImageIcon, Upload, X } from "lucide-react";
import { type ChangeEvent, type DragEvent, useEffect, useRef, useState } from "react";
import { cn } from "../../../lib/utils";
import { Button } from "../../atoms/button/button";

export interface ImageDropzoneProps {
  /**
   * Valor atual (File, URL string ou null)
   */
  value?: File | string | null;

  /**
   * Callback quando o arquivo muda
   */
  onChange?: (file: File | null) => void;

  /**
   * Tamanho máximo em bytes (padrão: 5MB)
   */
  maxSize?: number;

  /**
   * Tipos de arquivo aceitos (padrão: 'image/*')
   */
  accept?: string;

  /**
   * Se o componente está desabilitado
   */
  disabled?: boolean;

  /**
   * Classe CSS adicional
   */
  className?: string;

  /**
   * Texto do botão quando não há imagem
   */
  selectButtonText?: string;

  /**
   * Texto do botão quando há imagem
   */
  changeButtonText?: string;

  /**
   * Texto do botão de remover
   */
  removeButtonText?: string;

  /**
   * Texto de ajuda
   */
  helperText?: string;

  /**
   * Mensagem de erro
   */
  error?: string;
}

/**
 * Converte bytes para formato legível
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
};

/**
 * Valida se o arquivo é uma imagem válida
 */
const validateImageFile = (file: File, maxSize: number, accept: string): string | null => {
  // Validar tipo
  if (!file.type.startsWith("image/")) {
    return "O arquivo deve ser uma imagem";
  }

  // Validar tamanho
  if (file.size > maxSize) {
    return `O arquivo deve ter no máximo ${formatFileSize(maxSize)}`;
  }

  // Validar accept pattern
  if (accept && accept !== "image/*") {
    const acceptedTypes = accept.split(",").map((t) => t.trim());
    const isValidType = acceptedTypes.some((type) => {
      if (type.endsWith("/*")) {
        const baseType = type.split("/")[0];
        return file.type.startsWith(`${baseType}/`);
      }
      return file.type === type;
    });
    if (!isValidType) {
      return `Tipo de arquivo não aceito. Aceitos: ${accept}`;
    }
  }

  return null;
};

export const ImageDropzone = ({
  value,
  onChange,
  maxSize = 5 * 1024 * 1024, // 5MB padrão
  accept = "image/*",
  disabled = false,
  className,
  selectButtonText = "Selecionar imagem",
  changeButtonText = "Alterar imagem",
  removeButtonText = "Remover",
  helperText,
  error,
}: ImageDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualizar preview quando value mudar
  useEffect(() => {
    if (value instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(value);
    } else if (typeof value === "string") {
      setPreview(value);
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleFile = (file: File) => {
    const validation = validateImageFile(file, maxSize, accept);
    if (validation) {
      setValidationError(validation);
      return;
    }

    setValidationError(null);
    onChange?.(file);
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    setValidationError(null);
    onChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayError = error || validationError;

  return (
    <div className={cn("space-y-2", className)}>
      <section
        aria-label="Dropzone de upload de arquivos"
        tabIndex={disabled ? -1 : 0}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          isDragging && !disabled ? "border-primary bg-primary/5" : "border-border bg-background",
          disabled && "opacity-50 cursor-not-allowed",
          displayError && "border-destructive"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
          aria-label="Selecionar imagem"
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img src={preview} alt="Preview" className="max-w-full max-h-48 rounded-lg" />
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1 hover:bg-destructive/90 transition-colors"
                aria-label={removeButtonText}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectClick}
                disabled={disabled}
              >
                {changeButtonText}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
              >
                {removeButtonText}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="rounded-full bg-muted p-4">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Arraste uma imagem aqui ou{" "}
                <button
                  type="button"
                  onClick={handleSelectClick}
                  disabled={disabled}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  selecione um arquivo
                </button>
              </p>
              {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectClick}
              disabled={disabled}
            >
              <Upload className="w-4 h-4 mr-2" />
              {selectButtonText}
            </Button>
          </div>
        )}
      </section>

      {displayError && <p className="text-sm text-destructive">{displayError}</p>}
    </div>
  );
};
