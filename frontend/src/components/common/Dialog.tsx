'use client';

import MuiDialog, { type DialogProps as MuiDialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { type ReactNode } from 'react';

export interface FicomDialogProps extends Omit<MuiDialogProps, 'title'> {
  title?: ReactNode;
  actions?: ReactNode;
  onClose?: () => void;
  children: ReactNode;
}

/**
 * 再利用可能なDialogコンポーネント
 */
export function FicomDialog({ title, actions, onClose, children, ...props }: FicomDialogProps) {
  return (
    <MuiDialog onClose={onClose} {...props}>
      {title && (
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {title}
          {onClose && (
            <IconButton edge="end" onClick={onClose} aria-label="close" size="small">
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}
      <DialogContent dividers>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </MuiDialog>
  );
}
