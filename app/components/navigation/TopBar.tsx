"use client";

import Image from "next/image";
import styles from "./TopBar.module.css";

interface TopBarAction {
  icon: string;
  ariaLabel: string;
}

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: TopBarAction[];
}

const defaultActions: TopBarAction[] = [
  { icon: "help", ariaLabel: "Open help" },
  { icon: "notifications", ariaLabel: "Open notifications" },
];

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  const renderedActions = actions && actions.length > 0 ? actions : defaultActions;

  return (
    <header className={styles.header}>
      <div className={styles.branding}>
        <Image src="/logos/logotext.png" width={120} height={32} alt="Fleak" priority />
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        <h1 className={styles.title}>{title}</h1>
      </div>
      <div className={styles.actions}>
        {renderedActions.map((action) => (
          <button key={action.icon} className={styles.iconButton} aria-label={action.ariaLabel} type="button">
            <span className="material-symbols-rounded">{action.icon}</span>
          </button>
        ))}
      </div>
    </header>
  );
}
