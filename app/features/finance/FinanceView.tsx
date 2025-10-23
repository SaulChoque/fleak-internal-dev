"use client";

import { useEffect, useState } from "react";
import { FinanceController } from "@/app/controllers/financeController";
import { FinanceActivity, FinanceBalance } from "@/app/types/finance";
import { FinanceSummaryCard } from "@/app/components/cards/FinanceSummaryCard";
import styles from "./FinanceView.module.css";

export function FinanceView() {
  const [balance, setBalance] = useState<FinanceBalance | undefined>();
  const [activity, setActivity] = useState<FinanceActivity[]>([]);

  useEffect(() => {
    FinanceController.getBalance().then(setBalance);
    FinanceController.getActivity().then(setActivity);
  }, []);

  return (
    <div className={styles.wrapper}>
      {balance ? <FinanceSummaryCard balance={balance} activity={activity} /> : null}
      <section className={styles.history}>
        <h2>Recent activity</h2>
        <ul>
          {activity.map((item) => (
            <li key={item.id}>
              <span>{item.title}</span>
              <span>{item.timestamp}</span>
              <span>{item.amount}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
