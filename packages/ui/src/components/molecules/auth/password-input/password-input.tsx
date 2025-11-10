import { Eye, EyeOff } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { inputVariants } from "../../../atoms/input/input";

export interface PasswordInputProps {
  id: string;
  label: string;
  placeholder?: string;
  error?: string;
  variant?: "default" | "error" | "success";
  size?: "default" | "sm" | "lg";
  autoComplete?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
  register?: {
    name: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    ref: (instance: HTMLInputElement | null) => void;
  }; // Para react-hook-form
}

export const PasswordInput = ({
  id,
  label,
  placeholder = "••••••••",
  error,
  variant = "default",
  size = "lg",
  autoComplete = "new-password",
  value,
  onChange,
  onFocus,
  onBlur,
  className = "",
  required = false,
  register,
}: PasswordInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isManuallyVisible, setIsManuallyVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // A senha é visível se estiver em foco OU se o usuário clicou no botão de mostrar
  const isPasswordVisible = isFocused || isManuallyVisible;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay para permitir clique no botão antes de esconder
    setTimeout(() => {
      // Se o elemento ativo não for o input nem o botão, remove o foco
      const activeElement = document.activeElement;
      const buttonElement = activeElement?.closest('button[type="button"]');

      if (activeElement !== inputRef.current && !buttonElement) {
        setIsFocused(false);
        // Se não estava manualmente visível, a senha já será escondida
        // porque isPasswordVisible = isFocused || isManuallyVisible
      }
    }, 150);
    onBlur?.(e);
  };

  const toggleVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsManuallyVisible(!isManuallyVisible);
    // Manter foco no input se estiver focado
    if (document.activeElement === inputRef.current || isFocused) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  // Separar props do input HTML das props customizadas
  const baseInputProps = register
    ? {
        ...register,
        id,
        type: isPasswordVisible ? "text" : "password",
        autoComplete,
        placeholder,
        required,
        onFocus: handleFocus,
        onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
          register.onBlur(e);
          handleBlur(e);
        },
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          register.onChange(e);
        },
        ref: (e: HTMLInputElement | null) => {
          inputRef.current = e;
          if (register?.ref) {
            register.ref(e);
          }
        },
      }
    : {
        id,
        name: id,
        type: isPasswordVisible ? "text" : "password",
        autoComplete,
        placeholder,
        required,
        value,
        onChange,
        onFocus: handleFocus,
        onBlur: handleBlur,
        ref: inputRef,
      };

  const inputClassName = cn(
    inputVariants({ size, variant: error ? "error" : variant }),
    className,
    "pr-16"
  );

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input {...baseInputProps} className={inputClassName} />
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center bg-transparent border-0 p-0 cursor-pointer z-10 hover:opacity-70 transition-opacity"
          aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
          tabIndex={-1}
          onMouseDown={(e) => {
            // Prevenir que o blur seja acionado antes do clique
            e.preventDefault();
          }}
        >
          {isPasswordVisible ? (
            <EyeOff className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Eye className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
