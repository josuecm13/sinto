import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Dialog } from '../components/Dialog';
import type { DialogConfig, DialogInstance } from '../components/Dialog';

export type { DialogConfig };

interface DialogContextValue {
  openDialog: (config: DialogConfig) => string;
  closeDialog: (id: string) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return ctx;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialogs, setDialogs] = useState<DialogInstance[]>([]);

  function openDialog(config: DialogConfig): string {
    const id = crypto.randomUUID();
    setDialogs((prev) => [...prev, { ...config, id }]);
    return id;
  }

  function closeDialog(id: string): void {
    setDialogs((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      <Dialog dialogs={dialogs} closeDialog={closeDialog} />
    </DialogContext.Provider>
  );
}
