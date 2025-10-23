"use client";

import { useState } from "react";
import { FinanceActivity, FinanceBalance } from "@/app/types/finance";
import styles from "./FinanceSummaryCard.module.css";

interface FinanceSummaryCardProps {
  balance: FinanceBalance;
  activity: FinanceActivity[];
}

export function FinanceSummaryCard({ balance, activity }: FinanceSummaryCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      className={`${styles.card} ${expanded ? styles.expanded : ""}`}
      onClick={() => setExpanded((state) => !state)}
    >
      <header className={styles.header}>
        <div>
          <p className={styles.title}>My finances</p>
          <span className={styles.subtitle}>{balance.currency}</span>
        </div>
        <span className={`material-symbols-rounded ${styles.chevron}`}>
          {expanded ? "expand_less" : "expand_more"}
        </span>
      </header>
      <p className={styles.balance}>{balance.formatted}</p>
      <div className={styles.actions}>
        <button
          className={styles.withdrawButton}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          Withdraw
        </button>
        <button
          className={styles.depositButton}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          Deposit
        </button>
      </div>
      {expanded ? (
        <div className={styles.activityList}>
          {activity.map((item) => (
            <div key={item.id} className={styles.activityRow}>
              <div className={styles.activityInfo}>
                <span className={`material-symbols-rounded ${styles.activityIcon}`}>
                  {item.type === "credit" ? "trending_up" : "trending_down"}
                </span>
                <div>
                  <p className={styles.activityTitle}>{item.title}</p>
                  <span className={styles.activityTimestamp}>{item.timestamp}</span>
                </div>
              </div>
              <span className={`${styles.activityAmount} ${item.type === "credit" ? styles.credit : styles.debit}`}>
                {item.amount}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
