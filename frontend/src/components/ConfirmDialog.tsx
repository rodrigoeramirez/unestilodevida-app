import * as React from "react";
import { Dialog, Box, Button } from "@mui/material";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "error" | "secondary";
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = "¿Estás seguro?",
  description = "Esta acción no se puede deshacer.",
  onCancel,
  onConfirm,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  confirmColor = "error",
}) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <Box sx={{ p: 4, maxWidth: 380 }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            color={confirmColor}
            variant="contained"
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
