"use client";

import styles from "./BottomNav.module.css";

export type BottomNavKey = "testimonies" | "friends" | "home" | "finance" | "account";

interface BottomNavProps {
  active: BottomNavKey;
  onChange: (key: BottomNavKey) => void;
}

const ITEMS: { key: BottomNavKey; label: string; icon: string }[] = [
  { key: "testimonies", label: "Testimonies", icon: "person_raised_hand" },
  { key: "friends", label: "Friends", icon: "diversity_3" },
  { key: "home", label: "Home", icon: "home" },
  { key: "finance", label: "Finance", icon: "account_balance_wallet" },
  { key: "account", label: "Account", icon: "person" },
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
            <span className={`material-symbols-rounded ${styles.icon}`}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
