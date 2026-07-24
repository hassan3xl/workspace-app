"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
};

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
}) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        className={cn(
          "overflow-hidden flex flex-col max-h-[90vh] p-0 gap-0 border border-border/50 shadow-2xl bg-card text-card-foreground rounded-xl",
          sizeClasses[size]
        )}
      >
        {(title || description) && (
          <DialogHeader className="p-6 pb-4 border-b border-border/40 space-y-1 text-left">
            {title && (
              <DialogTitle className="text-xl font-semibold tracking-tight leading-none">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-sm text-muted-foreground">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BaseModal;
