"use client";

import { Testimony } from "@/app/types/testimony";
import styles from "./TestimonyDetail.module.css";

interface TestimonyDetailProps {
  testimony?: Testimony;
  onOpenActions: () => void;
}

export function TestimonyDetail({ testimony, onOpenActions }: TestimonyDetailProps) {
  if (!testimony) {
    return (
      <section className={styles.emptyState}>
        <p>Select a testimony to review its details.</p>
      </section>
    );
  }

  return (
    <section className={styles.detail}>
      <header className={styles.header}>
        <div>
          <p className={styles.subtitle}>{testimony.category}</p>
          <h2 className={styles.title}>{testimony.title}</h2>
          <p className={styles.location}>{testimony.location}</p>
        </div>
        <button className={styles.actionButton} type="button" onClick={onOpenActions}>
          Actions
        </button>
      </header>
      <dl className={styles.meta}>
        <div>
          <dt>Due date</dt>
          <dd>{testimony.dueDate}</dd>
        </div>
        <div>
          <dt>Due time</dt>
          <dd>{testimony.dueTime}</dd>
        </div>
        <div>
          <dt>Requester</dt>
          <dd>{testimony.requester}</dd>
        </div>
        {testimony.referenceCode ? (
          <div>
            <dt>Reference</dt>
            <dd>{testimony.referenceCode}</dd>
          </div>
        ) : null}
      </dl>
      {testimony.timeline && testimony.timeline.length > 0 && (
        <section className={styles.timeline}>
          <p className={styles.timelineTitle}>Recent activity</p>
          <ul>
            {testimony.timeline.map((item) => (
              <li key={item.id}>
                <span className={styles.timelineLabel}>{item.label}</span>
                <span className={styles.timelineDesc}>{item.description}</span>
                <span className={styles.timelineTime}>{item.time}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
