"use client";

import { MouseEvent } from "react";
import { Testimony } from "@/app/types/testimony";
import styles from "./TestimonyCard.module.css";

interface TestimonyCardProps {
  testimony: Testimony;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onOpenActions?: (id: string) => void;
}

export function TestimonyCard({
  testimony,
  isSelected = false,
  onSelect,
  onOpenActions,
}: TestimonyCardProps) {
  return (
    <article
      className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
      onClick={() => onSelect?.(testimony.id)}
    >
      <div className={styles.header}>
        <div>
          <p className={styles.subtitle}>{testimony.subtitle}</p>
          <h3 className={styles.title}>{testimony.title}</h3>
        </div>
        <button
          className={styles.moreButton}
          aria-label="Open testimony actions"
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            onOpenActions?.(testimony.id);
          }}
        >
          •••
        </button>
      </div>
      <div className={styles.metaRow}>
        <span className={styles.metaItem}>{testimony.dueTime}</span>
        <span className={styles.metaDivider}>|</span>
        <span className={styles.metaItem}>{testimony.location}</span>
        <span className={styles.metaDivider}>|</span>
        <span className={styles.metaItem}>{testimony.dueDate}</span>
      </div>
      <footer className={styles.footer}>
        <span className={styles.badge}>{testimony.status}</span>
        <span className={styles.requester}>{testimony.requester}</span>
      </footer>
    </article>
  );
}
