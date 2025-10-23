"use client";

import { useState } from "react";
import { AccountAction, AccountInfo } from "@/app/types/account";
import styles from "./AccountInfoCard.module.css";

interface AccountInfoCardProps {
  info: AccountInfo;
  actions: AccountAction[];
  onAction: (action: AccountAction) => void;
}

export function AccountInfoCard({ info, actions, onAction }: AccountInfoCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      className={`${styles.card} ${expanded ? styles.expanded : ""}`}
      onClick={() => setExpanded((state) => !state)}
    >
      <header className={styles.header}>
        <div className={styles.profileHeader}>
          <span className={styles.avatar}>{info.displayName.charAt(0)}</span>
          <div className={styles.profileText}>
            <h2 className={styles.name}>{info.displayName}</h2>
            <p className={styles.username}>{info.username}</p>
          </div>
        </div>
        <span className={`material-symbols-rounded ${styles.chevron}`}>
          {expanded ? "expand_less" : "expand_more"}
        </span>
      </header>
      {expanded ? (
        <>
          <dl className={styles.details}>
            <div className={styles.detailRow}>
              <dt>Email</dt>
              <dd>{info.email}</dd>
            </div>
            <div className={styles.detailRow}>
              <dt>Location</dt>
              <dd>{info.location}</dd>
            </div>
            <div className={styles.detailRow}>
              <dt>Joined</dt>
              <dd>{info.createdAt}</dd>
            </div>
            <div className={styles.detailRow}>
              <dt>Phone</dt>
              <dd>{info.phone}</dd>
            </div>
            <div className={styles.detailRow}>
              <dt>Favorites</dt>
              <dd>{info.favoriteFriends.join(", ")}</dd>
            </div>
            <div className={styles.detailRow}>
              <dt>Recent testimonies</dt>
              <dd>{info.recentTestimonies}</dd>
            </div>
          </dl>
          <div className={styles.actions}>
            {actions.map((action) => (
              <button
                key={action.id}
                className={`${styles.actionButton} ${action.variant === "danger" ? styles.danger : ""}`}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onAction(action);
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
