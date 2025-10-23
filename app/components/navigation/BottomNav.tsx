"use client";

import styles from "./BottomNav.module.css";

export type BottomNavKey = "testimonies" | "friends" | "home" | "finance" | "account";

interface BottomNavProps {
  active: BottomNavKey;
  onChange: (key: BottomNavKey) => void;
}

const ITEMS: { key: BottomNavKey; label: string; icon: string }[] = [
  { key: "testimonies", label: "Testimonies", icon: "home" },
  { key: "friends", label: "Friends", icon: "users" },
  { key: "home", label: "Home", icon: "home" },
  { key: "finance", label: "Finance", icon: "wallet" },
  { key: "account", label: "Account", icon: "user" },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className={styles.nav}>
      {ITEMS.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            className={`${styles.button} ${isActive ? styles.buttonActive : ""}`}
            onClick={() => onChange(item.key)}
            type="button"
          >
            <span className={`${styles.icon} ${styles[`icon-${item.icon}`]}`} />
            <span className={styles.label}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
