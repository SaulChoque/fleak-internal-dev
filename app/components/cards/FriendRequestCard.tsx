"use client";

import { useState } from "react";
import { FriendRequest } from "@/app/types/friend";
import styles from "./FriendRequestCard.module.css";

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function FriendRequestCard({ request, onAccept, onReject }: FriendRequestCardProps) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    setExpanded((current) => !current);
  };

  return (
    <article className={`${styles.card} ${expanded ? styles.expanded : ""}`} onClick={toggle}>
      <div className={styles.header}>
        <div className={styles.info}>
          <span className={styles.avatar}>{request.displayName.charAt(0)}</span>
          <div>
            <p className={styles.name}>{request.displayName}</p>
            <p className={styles.username}>{request.username}</p>
          </div>
        </div>
        <span className={`material-symbols-rounded ${styles.chevron}`}>
          {expanded ? "expand_less" : "expand_more"}
        </span>
      </div>
      {expanded ? (
        <div className={styles.body}>
          <div className={styles.detailRow}>
            <span className={`material-symbols-rounded ${styles.detailIcon}`}>chat</span>
            <p className={styles.detailLabel}>{request.reason}</p>
          </div>
          <div className={styles.detailRow}>
            <span className={`material-symbols-rounded ${styles.detailIcon}`}>schedule</span>
            <p className={styles.detailLabel}>Sent {request.sentAt}</p>
          </div>
          <div className={styles.actions}>
            <button
              className={styles.secondary}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onReject?.(request.id);
              }}
            >
              Later
            </button>
            <button
              className={styles.primary}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onAccept?.(request.id);
              }}
            >
              Accept
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
