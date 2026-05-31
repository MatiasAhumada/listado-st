"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cancel01Icon } from "hugeicons-react";

interface GenericModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE_CLASSES = {
  sm: "max-w-xl",
  md: "max-w-2xl",
  lg: "max-w-3xl",
  xl: "max-w-4xl",
};

export function GenericModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
}: GenericModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className={`bg-dark border border-lavender/10 rounded-xl shadow-2xl ${SIZE_CLASSES[size]} w-full max-h-[90vh] overflow-y-auto pointer-events-auto`}
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-lavender/10">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-lavender">{title}</h2>
                  {description && <p className="text-xs sm:text-sm text-lavender/60 mt-1">{description}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="text-lavender/60 hover:text-lavender hover:bg-lavender/10 flex-shrink-0"
                >
                  <Cancel01Icon size={20} />
                </Button>
              </div>
              <div className="text-lavender">{children}</div>
              {footer && (
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 p-4 sm:p-6 border-t border-lavender/10">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  loading = false,
}: ConfirmModalProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={loading}
            className="hover:bg-lavender/10 text-lavender border border-lavender/20"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={loading}
            className={
              variant === "destructive"
                ? "bg-destructive hover:bg-destructive/90 text-white font-bold"
                : "bg-lime hover:bg-green text-dark font-bold"
            }
          >
            {loading ? "Procesando..." : confirmText}
          </Button>
        </>
      }
    >
      <div className="px-4 sm:px-6 pb-2" />
    </GenericModal>
  );
}
