"use client";

import { useEffect, useMemo, useState } from "react";
import { TestimonyController } from "@/app/controllers/testimonyController";
import { Testimony } from "@/app/types/testimony";
import { TestimonyCard } from "@/app/components/cards/TestimonyCard";
import { ContactActionsModal } from "@/app/components/modals/ContactActionsModal";
import { TestimonyDetail } from "./TestimonyDetail";
import styles from "./TestimoniesView.module.css";

export function TestimoniesView() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [actionsFor, setActionsFor] = useState<string | undefined>();

  useEffect(() => {
    TestimonyController.getTestimonies().then((data) => {
      setTestimonies(data);
      setSelectedId((current) => current ?? data[0]?.id);
    });
  }, []);

  const selectedTestimony = useMemo(
    () => testimonies.find((item) => item.id === selectedId),
    [testimonies, selectedId],
  );

  const actionsOptions = useMemo(() => {
    if (!actionsFor) return [];
    return testimonies.find((item) => item.id === actionsFor)?.contactOptions ?? [];
  }, [actionsFor, testimonies]);

  const actionsTestimony = useMemo(
    () => testimonies.find((item) => item.id === actionsFor),
    [actionsFor, testimonies],
  );

  return (
    <div className={styles.wrapper}>
      <section className={styles.listSection}>
        <header className={styles.sectionHeader}>
          <span className={styles.badge}>Pending testimonies</span>
          <p className={styles.caption}>Recent activity</p>
        </header>
        <div className={styles.list}>
          {testimonies.map((testimony) => (
            <TestimonyCard
              key={testimony.id}
              testimony={testimony}
              isSelected={testimony.id === selectedId}
              onSelect={setSelectedId}
              onOpenActions={(id) => setActionsFor(id)}
            />
          ))}
        </div>
      </section>
      <TestimonyDetail
        testimony={selectedTestimony}
        onOpenActions={() => selectedTestimony && setActionsFor(selectedTestimony.id)}
      />
      <ContactActionsModal
        isOpen={Boolean(actionsFor)}
        title={actionsTestimony?.lastUpdate ?? "Contact"}
        options={actionsOptions}
        onSelect={() => setActionsFor(undefined)}
        onClose={() => setActionsFor(undefined)}
      />
    </div>
  );
}
