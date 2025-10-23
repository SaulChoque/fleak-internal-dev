"use client";

import { useEffect, useMemo, useState } from "react";
import { TestimonyController } from "@/app/controllers/testimonyController";
import {
  TestimoniesDataset,
  Testimony,
  TestimonyHighlightCard,
  TestimonyVoteOption,
} from "@/app/types/testimony";
import { TestimonyCard } from "@/app/components/cards/TestimonyCard";
import { VoteModal } from "@/app/components/modals/VoteModal";
import { ConfirmModal } from "@/app/components/modals/ConfirmModal";
import styles from "./TestimoniesView.module.css";

type TestimonyScreen = "overview" | "manage";

interface ConfirmContext {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
}

interface VoteContext {
  testimony: Testimony;
  options: TestimonyVoteOption[];
}

export function TestimoniesView() {
  const [dataset, setDataset] = useState<TestimoniesDataset | null>(null);
  const [screen, setScreen] = useState<TestimonyScreen>("overview");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [confirmContext, setConfirmContext] = useState<ConfirmContext | null>(null);
  const [voteContext, setVoteContext] = useState<VoteContext | null>(null);
  const [pendingVoteOption, setPendingVoteOption] = useState<TestimonyVoteOption | null>(null);

  useEffect(() => {
    TestimonyController.getDataset().then((data) => {
      setDataset(data);
    });
  }, []);

  const toggleCard = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const openVoteModal = (testimony: Testimony) => {
    if (!testimony.voteOptions?.length) return;
    setVoteContext({ testimony, options: testimony.voteOptions });
  };

  const handleAction = (testimony: Testimony, actionId: string) => {
    if (actionId === "vote") {
      openVoteModal(testimony);
      return;
    }

    if (actionId === "confirmJudge") {
      setConfirmContext({
        message: "Do you wanna be the judge?",
        onConfirm: () => {
          setConfirmContext(null);
        },
      });
    }
  };

  const handleVoteSelection = (option: TestimonyVoteOption) => {
    setPendingVoteOption(option);
    setConfirmContext({
      message: "Are you sure of the selection?",
      onConfirm: () => {
        setConfirmContext(null);
        setVoteContext(null);
        setPendingVoteOption(null);
      },
    });
  };

  const dismissConfirm = () => {
    setConfirmContext(null);
    setPendingVoteOption(null);
  };

  const highlightCard: TestimonyHighlightCard | undefined = useMemo(() => {
    if (!dataset) return undefined;
    const hasPending = dataset.pendingReview.length > 0 || dataset.invitations.length > 0;
    if (!hasPending) return undefined;
    return dataset.highlightCard;
  }, [dataset]);

  if (!dataset) {
    return <div className={styles.loadingState}>Loading testimonies…</div>;
  }

  const renderSection = (title: string, items: Testimony[]) => (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <p className={styles.sectionTitle}>{title}</p>
      </header>
      {items.length ? (
        <div className={styles.list}>
          {items.map((testimony) => (
            <TestimonyCard
              key={testimony.id}
              testimony={testimony}
              isExpanded={expandedIds.has(testimony.id)}
              onToggle={toggleCard}
              onAction={handleAction}
            />
          ))}
        </div>
      ) : (
        <p className={styles.emptyList}>Nothing to show right now.</p>
      )}
    </section>
  );

  return (
    <div className={styles.wrapper}>
      {screen === "overview" ? (
        <>
          <input className={styles.searchInput} type="search" placeholder="Search for anyone" />
          {highlightCard ? (
            <button className={styles.highlightCard} type="button" onClick={() => setScreen("manage")}>
              <span className={`material-symbols-rounded ${styles.highlightIcon}`}>
                {highlightCard.icon}
              </span>
              <div className={styles.highlightContent}>
                <p className={styles.highlightTitle}>{highlightCard.title}</p>
                <p className={styles.highlightDescription}>{highlightCard.description}</p>
              </div>
              <span className={`material-symbols-rounded ${styles.highlightChevron}`}>chevron_right</span>
            </button>
          ) : null}
          {renderSection("Recent activity", dataset.recentActivity)}
        </>
      ) : (
        <>
          <button className={styles.backButton} type="button" onClick={() => setScreen("overview")}>
            <span className="material-symbols-rounded">arrow_back</span>
            Back
          </button>
          {renderSection("Pending of revision", dataset.pendingReview)}
          {renderSection("Invitations", dataset.invitations)}
        </>
      )}
      <VoteModal
        isOpen={Boolean(voteContext)}
        title="Who won"
        options={voteContext?.options ?? []}
        onSelect={handleVoteSelection}
        onClose={() => {
          setVoteContext(null);
          setPendingVoteOption(null);
        }}
      />
      <ConfirmModal
        isOpen={Boolean(confirmContext)}
        title={confirmContext?.message ?? ""}
        description={pendingVoteOption ? pendingVoteOption.label : undefined}
        confirmLabel={confirmContext?.confirmLabel}
        cancelLabel={confirmContext?.cancelLabel}
        onConfirm={() => {
          confirmContext?.onConfirm();
        }}
        onCancel={dismissConfirm}
      />
    </div>
  );

    }
