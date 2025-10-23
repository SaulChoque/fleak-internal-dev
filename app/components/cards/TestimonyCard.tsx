"use client";

import { MouseEvent } from "react";
import { Testimony } from "@/app/types/testimony";
import styles from "./TestimonyCard.module.css";

interface TestimonyCardProps {
  testimony: Testimony;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onAction?: (testimony: Testimony, actionId: string) => void;
}

export function TestimonyCard({ testimony, isExpanded, onToggle, onAction }: TestimonyCardProps) {
  const handleActionClick = (event: MouseEvent<HTMLButtonElement>, actionId: string) => {
    event.stopPropagation();
    onAction?.(testimony, actionId);
  };

  return (
    <article
      className={`${styles.card} ${isExpanded ? styles.expanded : ""}`}
      onClick={() => onToggle(testimony.id)}
    >
      <header className={styles.header}>
        <div className={styles.iconColumn}>
          <span className={`material-symbols-rounded ${styles.leadingIcon}`}>task_alt</span>
          <span className={`material-symbols-rounded ${styles.trailingIcon}`}>group</span>
        </div>
        <div className={styles.headerContent}>
          <span className={styles.status}>{testimony.statusLabel}</span>
          <h3 className={styles.title}>{testimony.title}</h3>
          <span className={styles.amount}>{testimony.amount}</span>
        </div>
        <span className={styles.schedule}>{testimony.scheduleLabel}</span>
      </header>
      {isExpanded ? (
        <div className={styles.details}>
          {testimony.details.map((detail) => {
            const actionId = detail.actionId;
            return (
              <div key={detail.id} className={styles.detailRow}>
                <span className={`material-symbols-rounded ${styles.detailIcon}`}>{detail.icon}</span>
                <div className={styles.detailCopy}>
                  <p className={styles.detailLabel}>{detail.label}</p>
                  {detail.value ? <p className={styles.detailValue}>{detail.value}</p> : null}
                </div>
                {actionId ? (
                  <button
                    className={styles.detailAction}
                    type="button"
                    onClick={(event) => handleActionClick(event, actionId)}
                  >
                    {detail.actionLabel ?? "Open"}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}
