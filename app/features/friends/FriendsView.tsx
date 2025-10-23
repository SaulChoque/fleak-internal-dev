"use client";

import { useEffect, useState } from "react";
import { FriendController } from "@/app/controllers/friendController";
import { Friend, FriendRequest } from "@/app/types/friend";
import { FriendCard } from "@/app/components/cards/FriendCard";
import { FriendRequestCard } from "@/app/components/cards/FriendRequestCard";
import styles from "./FriendsView.module.css";
import { AddFriendView } from "./AddFriendView";

export function FriendsView() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    FriendController.getFriends().then(setFriends);
    FriendController.getRequests().then(setRequests);
  }, []);

  return (
    <div className={styles.wrapper}>
      <section className={styles.requestSection}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionTitle}>Pending requests</p>
          <span className={styles.sectionSubtitle}>Recent activity</span>
        </header>
        <div className={styles.requestList}>
          {requests.map((request) => (
            <FriendRequestCard
              key={request.id}
              request={request}
              onAccept={() => undefined}
              onReject={() => undefined}
            />
          ))}
        </div>
      </section>
      <section className={styles.friendsSection}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionTitle}>My friends</p>
          <button className={styles.addButton} type="button" onClick={() => setShowAdd(true)}>
            +
          </button>
        </header>
        <div className={styles.friendList}>
          {friends.map((friend) => (
            <FriendCard key={friend.id} friend={friend} />
          ))}
        </div>
      </section>
      {showAdd ? (
        <div className={styles.overlay}>
          <div className={styles.sheet}>
            <AddFriendView onClose={() => setShowAdd(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
