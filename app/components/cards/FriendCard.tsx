"use client";

import { Friend } from "@/app/types/friend";
import styles from "./FriendCard.module.css";

interface FriendCardProps {
  friend: Friend;
  onPress?: (friend: Friend) => void;
}

export function FriendCard({ friend, onPress }: FriendCardProps) {
  return (
    <button className={styles.card} type="button" onClick={() => onPress?.(friend)}>
      <span className={styles.avatar}>{friend.displayName.charAt(0)}</span>
      <div className={styles.info}>
        <p className={styles.name}>{friend.displayName}</p>
        <span className={styles.username}>{friend.username}</span>
      </div>
      <div className={styles.meta}>
        <span className={styles.status}>{friend.lastSeen}</span>
        <span className={styles.count}>{friend.mutualTestimonies} testimonies</span>
      </div>
    </button>
  );
}
