"use client";

import { FriendRequest } from "@/app/types/friend";
import styles from "./FriendRequestCard.module.css";

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function FriendRequestCard({ request, onAccept, onReject }: FriendRequestCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.info}>
        <span className={styles.avatar}>{request.displayName.charAt(0)}</span>
        <div>
          <p className={styles.name}>{request.displayName}</p>
          <p className={styles.reason}>{request.reason}</p>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={styles.secondary} type="button" onClick={() => onReject?.(request.id)}>
          Later
        </button>
        <button className={styles.primary} type="button" onClick={() => onAccept?.(request.id)}>
          Accept
        </button>
      </div>
    </article>
  );
}
