"use client";

import { useState } from "react";
import { Friend } from "@/app/types/friend";
import styles from "./FriendCard.module.css";

interface FriendCardProps {
  friend: Friend;
  onPress?: (friend: Friend) => void;
}

export function FriendCard({ friend, onPress }: FriendCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    setExpanded((current) => !current);
    onPress?.(friend);
  };

  return (
    <button
      className={`${styles.card} ${expanded ? styles.expanded : ""}`}
      type="button"
      onClick={handleToggle}
    >
      <div className={styles.header}>
        <span className={styles.avatar}>{friend.displayName.charAt(0)}</span>
        <div className={styles.info}>
          <p className={styles.name}>{friend.displayName}</p>
          <span className={styles.username}>{friend.username}</span>
        </div>
        <span className={`material-symbols-rounded ${styles.chevron}`}>
          {expanded ? "expand_less" : "expand_more"}
        </span>
      </div>
      {expanded ? (
        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={`material-symbols-rounded ${styles.detailIcon}`}>schedule</span>
            <p className={styles.detailLabel}>Last seen</p>
            <span className={styles.detailValue}>{friend.lastSeen}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={`material-symbols-rounded ${styles.detailIcon}`}>diversity_3</span>
            <p className={styles.detailLabel}>Mutual testimonies</p>
            <span className={styles.detailValue}>{friend.mutualTestimonies}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={`material-symbols-rounded ${styles.detailIcon}`}>check_circle</span>
            <p className={styles.detailLabel}>Status</p>
            <span className={styles.detailValue}>{friend.status}</span>
          </div>
          <div className={styles.actions}>
            <span className={styles.helper}>Quick actions</span>
            <div className={styles.actionButtons}>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onPress?.(friend);
                }}
              >
                Message
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onPress?.(friend);
                }}
              >
                Start testimony
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </button>
  );
}
