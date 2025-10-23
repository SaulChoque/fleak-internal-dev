"use client";

import styles from "./ConfirmModal.module.css";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <p className={styles.title}>{title}</p>
        {description ? <p className={styles.description}>{description}</p> : null}
        <div className={styles.actions}>
          <button
            className={`${styles.actionButton} ${styles.cancel}`}
            type="button"
            onClick={onCancel}
            aria-label={cancelLabel}
          >
            <span className="material-symbols-rounded">close</span>
          </button>
          <button
            className={`${styles.actionButton} ${styles.confirm}`}
            type="button"
            onClick={onConfirm}
            aria-label={confirmLabel}
          >
            <span className="material-symbols-rounded">check</span>
          </button>
        </div>
      </div>
    </div>
  );
}
