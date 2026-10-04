/**
 * Confirmation Component - Flowtomic UI
 *
 * Componente de confirmation dialog wrapper
 */

import type { ToolUIPart } from "ai";
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

type ExtendedState =
  | ToolUIPart["state"]
  | "approval-requested"
  | "approval-responded"
  | "output-denied";

type ConfirmationContextValue = {
  approval: ToolUIPartApproval;
  state: ExtendedState;
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
  state: ExtendedState;
};

export function Confirmation({ className, approval, state, ...props }: ConfirmationProps) {
  if (!approval || state === "input-streaming" || state === "input-available") {
    return null;
  }

  return (
    <ConfirmationContext.Provider value={{ approval, state }}>
      <Alert data-slot="confirmation" className={cn("flex flex-col gap-2", className)} {...props} />
    </ConfirmationContext.Provider>
  );
}
Confirmation.displayName = "Confirmation";

export type ConfirmationTitleProps = ComponentProps<typeof AlertDescription>;

export function ConfirmationTitle({ className, ...props }: ConfirmationTitleProps) {
  return (
    <AlertDescription
      data-slot="confirmation-title"
      className={cn("inline", className)}
      {...props}
    />
  );
}
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

export function ConfirmationActions({ className, ...props }: ConfirmationActionsProps) {
  const { state } = useConfirmation();

  // Only show when approval is requested
  if (state !== "approval-requested") {
    return null;
  }

  return (
    <div
      data-slot="confirmation-actions"
      className={cn("flex items-center justify-end gap-2 self-end", className)}
      {...props}
    />
  );
}
ConfirmationActions.displayName = "ConfirmationActions";

export type ConfirmationActionProps = ComponentProps<typeof Button>;

export function ConfirmationAction({ className, ...props }: ConfirmationActionProps) {
  return (
    <Button
      data-slot="confirmation-action"
      type="button"
      className={cn("h-9 px-3.5", className)}
      {...props}
    />
  );
}
ConfirmationAction.displayName = "ConfirmationAction";
