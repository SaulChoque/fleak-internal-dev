"use client";

import { TestimonyContactOption } from "@/app/types/testimony";
import styles from "./ContactActionsModal.module.css";

interface ContactActionsModalProps {
  isOpen: boolean;
  options: TestimonyContactOption[];
  title: string;
  onSelect: (option: TestimonyContactOption) => void;
  onClose: () => void;
}

export function ContactActionsModal({
  isOpen,
  options,
  title,
  onSelect,
  onClose,
}: ContactActionsModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <p className={styles.title}>{title}</p>
        <div className={styles.actions}>
          {options.map((option) => (
            <button
              key={option.id}
              className={`${styles.actionButton} ${styles[`action-${option.type}`]}`}
              onClick={() => onSelect(option)}
              type="button"
            >
              <span className={styles.icon} />
              {option.label}
            </button>
          ))}
        </div>
        <button className={styles.closeButton} type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
