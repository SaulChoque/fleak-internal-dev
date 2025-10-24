"use client";

import { useEffect, useState } from "react";
import { Box, Button, Dialog, Stack, Typography } from "@mui/material";
import { FriendController } from "@/app/controllers/friendController";
import { Friend, FriendRequest } from "@/app/types/friend";
import { FriendCard } from "@/app/components/cards/FriendCard";
import { AddFriendView } from "./AddFriendView";
import { FriendRequestsView } from "./FriendRequestsView";

export function FriendsView() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showRequests, setShowRequests] = useState(false);

  useEffect(() => {
    FriendController.getFriends().then(setFriends);
    FriendController.getRequests().then(setRequests);
  }, []);

  const pendingCount = requests.length;

  const handleAcceptRequest = (id: string) => {
    setRequests((current) => current.filter((request) => request.id !== id));
  };

  const handleRejectRequest = (id: string) => {
    setRequests((current) => current.filter((request) => request.id !== id));
  };

  useEffect(() => {
    if (!requests.length) {
      setShowRequests(false);
    }
  }, [requests]);

  return (
    <Stack spacing={4} sx={{ width: "100%", maxWidth: 720, mx: "auto", py: 2 }}>
      <Stack spacing={2.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
          <div>
            <Typography variant="h6" fontWeight={700}>
              Pending requests
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Recent activity
            </Typography>
          </div>
        </Stack>
        {pendingCount ? (
          <Stack
            role="button"
            onClick={() => setShowRequests(true)}
            sx={{
              borderRadius: 3,
              bgcolor: "background.paper",
              border: "1px solid rgba(17,17,17,0.08)",
              px: 2.5,
              py: 2,
              boxShadow: "0px 18px 48px rgba(15, 23, 42, 0.12)",
              gap: 1.5,
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0px 22px 56px rgba(0, 0, 0, 0.18)",
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: "rgba(17,17,17,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span className="material-symbols-rounded">notifications_active</span>
              </Box>
              <Stack spacing={0.25}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Pending requests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You have {pendingCount} pending request{pendingCount > 1 ? "s" : ""}.
                </Typography>
              </Stack>
            </Stack>
            <Button
              variant="contained"
              size="small"
              sx={{ alignSelf: "flex-start", borderRadius: 999, textTransform: "none", gap: 0.5 }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
                open_in_new
              </span>
              Review now
            </Button>
          </Stack>
        ) : (
          <Box sx={{ py: 4, borderRadius: 3, textAlign: "center", bgcolor: (theme) => theme.palette.action.hover }}>
            <Typography variant="body2" color="text.secondary">
              You&apos;re all caught up for now.
            </Typography>
          </Box>
        )}
      </Stack>

      <Stack spacing={2.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            My friends
          </Typography>
          <Button
            variant="contained"
            size="small"
            sx={{ textTransform: "none", borderRadius: 999 }}
            onClick={() => setShowAdd(true)}
          >
            Add friend
          </Button>
        </Stack>
        <Stack spacing={2}>
          {friends.map((friend) => (
            <FriendCard key={friend.id} friend={friend} />
          ))}
        </Stack>
      </Stack>

      <Dialog open={showAdd} onClose={() => setShowAdd(false)} fullScreen>
        <AddFriendView
          onClose={() => setShowAdd(false)}
          selectedUsernames={friends.map((friend) => friend.username)}
        />
      </Dialog>

      <Dialog open={showRequests} onClose={() => setShowRequests(false)} fullScreen>
        <FriendRequestsView
          requests={requests}
          onClose={() => setShowRequests(false)}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
        />
      </Dialog>
    </Stack>
  );
}
