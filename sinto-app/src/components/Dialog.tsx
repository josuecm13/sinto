import ReactDOM from 'react-dom';
import type { ReactNode } from 'react';
import styles from './Dialog.module.css';

export interface DialogConfig {
  title?: string;
  message?: string;
  content?: ReactNode;
  onClose?: () => void;
}

export interface DialogInstance extends DialogConfig {
  id: string;
}

interface DialogProps {
  dialogs: DialogInstance[];
  closeDialog: (id: string) => void;
}

export function Dialog({ dialogs, closeDialog }: DialogProps) {
  if (dialogs.length === 0) return null;

  return ReactDOM.createPortal(
    <>
      {dialogs.map((dialog, index) => {
        const zBase = 1000 + index * 10;

        function handleDismiss() {
          dialog.onClose?.();
          closeDialog(dialog.id);
        }

        function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
          if (e.target === e.currentTarget) {
            handleDismiss();
          }
        }

        return (
          <div
            key={dialog.id}
            className={styles.backdrop}
            style={{ zIndex: zBase }}
            onClick={handleBackdropClick}
          >
            <div
              className={styles.panel}
              style={{ zIndex: zBase + 1 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialog.title ? `dialog-title-${dialog.id}` : undefined}
            >
              <button
                className={styles.closeButton}
                aria-label="Close dialog"
                onClick={handleDismiss}
              >
                ×
              </button>

              {dialog.title && (
                <h2 id={`dialog-title-${dialog.id}`} className={styles.title}>
                  {dialog.title}
                </h2>
              )}

              {dialog.content ? (
                <div className={styles.content}>{dialog.content}</div>
              ) : dialog.message ? (
                <p className={styles.message}>{dialog.message}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </>,
    document.body,
  );
}
