"use client";

import { FinanceActivity, FinanceBalance } from "@/app/types/finance";
import styles from "./FinanceSummaryCard.module.css";

interface FinanceSummaryCardProps {
  balance: FinanceBalance;
  activity: FinanceActivity[];
}

export function FinanceSummaryCard({ balance, activity }: FinanceSummaryCardProps) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <p className={styles.title}>My finances</p>
        <button className={styles.withdrawButton} type="button">
          Withdraw
        </button>
      </div>
      <p className={styles.balance}>{balance.formatted}</p>
      <div className={styles.activityList}>
        {activity.map((item) => (
          <div key={item.id} className={styles.activityRow}>
            <span className={styles.activityTitle}>{item.title}</span>
            <span className={styles.activityTimestamp}>{item.timestamp}</span>
            <span className={`${styles.activityAmount} ${item.type === "credit" ? styles.credit : styles.debit}`}>
              {item.amount}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
