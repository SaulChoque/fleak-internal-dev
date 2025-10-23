"use client";

import { useEffect, useState } from "react";
import { Box, Button, Dialog, Stack, Typography } from "@mui/material";
import { FriendController } from "@/app/controllers/friendController";
import { Friend, FriendRequest } from "@/app/types/friend";
import { FriendCard } from "@/app/components/cards/FriendCard";
import { FriendRequestCard } from "@/app/components/cards/FriendRequestCard";
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
        <Stack spacing={2}>
          {requests.length ? (
            requests.map((request) => (
              <FriendRequestCard
                key={request.id}
                request={request}
                onAccept={() => undefined}
                onReject={() => undefined}
              />
            ))
          ) : (
            <Box sx={{ py: 4, borderRadius: 3, textAlign: "center", bgcolor: (theme) => theme.palette.action.hover }}>
              <Typography variant="body2" color="text.secondary">
                You&apos;re all caught up for now.
              </Typography>
            </Box>
          )}
        </Stack>
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

      <Dialog open={showAdd} onClose={() => setShowAdd(false)} maxWidth="xs" fullWidth>
        <AddFriendView onClose={() => setShowAdd(false)} />
      </Dialog>
    </Stack>
  );
}
