/**
 * Confirmation Component - Flowtomic UI
 *
 * Componente de confirmation dialog wrapper
 */

import type { ToolUIPart } from "ai";
import * as React from "react";
import { type ComponentProps, createContext, type ReactNode, useContext } from "react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, Button } from "../../../atoms";

type ToolUIPartApproval =
  | {
      id: string;
      approved?: never;
      reason?: never;
    }
  | {
      id: string;
      approved: boolean;
      reason?: string;
    }
  | {
      id: string;
      approved: true;
      reason?: string;
    }
  | {
      id: string;
      approved: false;
      reason?: string;
    }
  | undefined;

type ConfirmationContextValue = {
  approval: ToolUIPartApproval;
  state: ToolUIPart["state"];
};

const ConfirmationContext = createContext<ConfirmationContextValue | null>(null);

const useConfirmation = () => {
  const context = useContext(ConfirmationContext);

  if (!context) {
    throw new Error("Confirmation components must be used within Confirmation");
  }

  return context;
};

export type ConfirmationProps = ComponentProps<typeof Alert> & {
  approval?: ToolUIPartApproval;
  state: ToolUIPart["state"];
};

export const Confirmation = React.forwardRef<HTMLDivElement, ConfirmationProps>(
  ({ className, approval, state, ...props }, ref) => {
    if (!approval || state === "input-streaming" || state === "input-available") {
      return null;
    }

    return (
      <ConfirmationContext.Provider value={{ approval, state }}>
        <Alert ref={ref} className={cn("flex flex-col gap-2", className)} {...props} />
      </ConfirmationContext.Provider>
    );
  }
);
Confirmation.displayName = "Confirmation";

export type ConfirmationTitleProps = ComponentProps<typeof AlertDescription>;

export const ConfirmationTitle = React.forwardRef<HTMLParagraphElement, ConfirmationTitleProps>(
  ({ className, ...props }, ref) => (
    <AlertDescription ref={ref} className={cn("inline", className)} {...props} />
  )
);
ConfirmationTitle.displayName = "ConfirmationTitle";

export type ConfirmationRequestProps = {
  children?: ReactNode;
};

export const ConfirmationRequest = ({ children }: ConfirmationRequestProps) => {
  const { state } = useConfirmation();

  // Only show when approval is requested
  if (state !== "approval-requested") {
    return null;
  }

  return <>{children}</>;
};
ConfirmationRequest.displayName = "ConfirmationRequest";

export type ConfirmationAcceptedProps = {
  children?: ReactNode;
};

export const ConfirmationAccepted = ({ children }: ConfirmationAcceptedProps) => {
  const { approval, state } = useConfirmation();

  // Only show when approved and in response states
  if (
    !approval?.approved ||
    (state !== "approval-responded" && state !== "output-denied" && state !== "output-available")
  ) {
    return null;
  }

  return <>{children}</>;
};
ConfirmationAccepted.displayName = "ConfirmationAccepted";

export type ConfirmationRejectedProps = {
  children?: ReactNode;
};

export const ConfirmationRejected = ({ children }: ConfirmationRejectedProps) => {
  const { approval, state } = useConfirmation();

  // Only show when rejected and in response states
  if (
    approval?.approved !== false ||
    (state !== "approval-responded" && state !== "output-denied" && state !== "output-available")
  ) {
    return null;
  }

  return <>{children}</>;
};
ConfirmationRejected.displayName = "ConfirmationRejected";

export type ConfirmationActionsProps = ComponentProps<"div">;

export const ConfirmationActions = React.forwardRef<HTMLDivElement, ConfirmationActionsProps>(
  ({ className, ...props }, ref) => {
    const { state } = useConfirmation();

    // Only show when approval is requested
    if (state !== "approval-requested") {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-end gap-2 self-end", className)}
        {...props}
      />
    );
  }
);
ConfirmationActions.displayName = "ConfirmationActions";

export type ConfirmationActionProps = ComponentProps<typeof Button>;

export const ConfirmationAction = React.forwardRef<HTMLButtonElement, ConfirmationActionProps>(
  (props, ref) => <Button ref={ref} className="h-8 px-3 text-sm" type="button" {...props} />
);
ConfirmationAction.displayName = "ConfirmationAction";
