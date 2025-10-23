"use client";

import styles from "./TopBar.module.css";

interface TopBarProps {
  title: string;
  subtitle?: string;
  showNotifications?: boolean;
}

export function TopBar({ title, subtitle, showNotifications = true }: TopBarProps) {
  return (
    <header className={styles.header}>
      <div>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        <h1 className={styles.title}>{title}</h1>
      </div>
      <div className={styles.actions}>
        <button className={styles.iconButton} aria-label="Open help">
          ?
        </button>
        {showNotifications ? (
          <button className={styles.iconButton} aria-label="Notifications">
            !
          </button>
        ) : null}
      </div>
    </header>
  );
}
