"use client";

import { useEffect, useState } from "react";
import { Friend } from "@/app/types/friend";
import { FriendController } from "@/app/controllers/friendController";
import styles from "./AddFriendView.module.css";

interface AddFriendViewProps {
  onClose: () => void;
}

export function AddFriendView({ onClose }: AddFriendViewProps) {
  const [suggestions, setSuggestions] = useState<Friend[]>([]);

  useEffect(() => {
    FriendController.getSuggestions().then(setSuggestions);
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} type="button" onClick={onClose}>
          Back
        </button>
        <h2 className={styles.title}>Add new friend</h2>
      </header>
      <div className={styles.content}>
        <p className={styles.subtitle}>People you may know</p>
        <ul className={styles.list}>
          {suggestions.map((item) => (
            <li key={item.id} className={styles.card}>
              <span className={styles.avatar}>{item.displayName.charAt(0)}</span>
              <div className={styles.info}>
                <span className={styles.name}>{item.displayName}</span>
                <span className={styles.username}>{item.username}</span>
              </div>
              <button className={styles.addButton} type="button">
                Add
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
