"use client";

import { TestimonyVoteOption } from "@/app/types/testimony";
import styles from "./VoteModal.module.css";

interface VoteModalProps {
  isOpen: boolean;
  title: string;
  options: TestimonyVoteOption[];
  onSelect: (option: TestimonyVoteOption) => void;
  onClose: () => void;
}

export function VoteModal({ isOpen, title, options, onSelect, onClose }: VoteModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <p className={styles.title}>{title}</p>
        <div className={styles.optionList}>
          {options.map((option) => (
            <button
              key={option.id}
              className={styles.optionButton}
              type="button"
              onClick={() => onSelect(option)}
            >
              <span className={`material-symbols-rounded ${styles.optionIcon}`}>{option.icon}</span>
              <span className={styles.optionLabel}>{option.label}</span>
            </button>
          ))}
        </div>
        <button className={styles.closeButton} type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
