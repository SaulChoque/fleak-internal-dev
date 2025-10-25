"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Friend } from "@/app/types/friend";
import { FriendController } from "@/app/controllers/friendController";

type FriendSelectorMode = "friends" | "suggestions";

export interface FriendSelectorViewProps {
  title: string;
  description?: string;
  selectedUsernames?: string[];
  mode?: FriendSelectorMode;
  onClose: () => void;
  onSelect: (friend: Friend) => void;
}

export function FriendSelectorView({
  title,
  description,
  selectedUsernames = [],
  mode = "friends",
  onClose,
  onSelect,
}: FriendSelectorViewProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetcher = mode === "suggestions" ? FriendController.getSuggestions : FriendController.getFriends;
    fetcher().then(setFriends);
  }, [mode]);

  const filteredFriends = useMemo(() => {
    if (!query) return friends;
    const lowercase = query.toLowerCase();
    return friends.filter(
      (friend) =>
        friend.displayName.toLowerCase().includes(lowercase) || friend.username.toLowerCase().includes(lowercase),
    );
  }, [friends, query]);

  return (
    <Stack sx={{ minHeight: "100dvh", bgcolor: "background.default" }}>
      <Stack direction="row" alignItems="center" spacing={1.5} px={3} py={2}>
        <IconButton onClick={onClose} edge="start">
          <span className="material-symbols-rounded">arrow_back</span>
        </IconButton>
        <Stack spacing={0.25}>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          ) : null}
        </Stack>
      </Stack>

      <Box sx={{ px: 3, pb: 2 }}>
        <TextField
          fullWidth
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for anyone"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ color: "text.secondary" }}>
                <span className="material-symbols-rounded">search</span>
              </InputAdornment>
            ),
            sx: { borderRadius: 3, gap: 1 },
          }}
        />
      </Box>

      <Stack spacing={1.5} px={3} pb={3} flexGrow={1} overflow="auto">
        <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" letterSpacing={1.2}>
          {mode === "suggestions" ? "People you may know" : "Friends list"}
        </Typography>
        <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {filteredFriends.map((friend) => {
            const isSelected = selectedUsernames.includes(friend.username);
            return (
              <ListItemButton
                key={friend.id}
                onClick={() => onSelect(friend)}
                sx={{
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  boxShadow: "0px 12px 28px rgba(15, 23, 42, 0.12)",
                  border: "1px solid rgba(17,17,17,0.08)",
                  gap: 1.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, color: "#111111" }}>
                  <span className="material-symbols-rounded">
                    {isSelected ? "check_circle" : "radio_button_unchecked"}
                  </span>
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{ variant: "subtitle1", fontWeight: 700 }}
                  secondaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                  primary={friend.displayName}
                  secondary={friend.username}
                />
                <Avatar src={friend.avatarUrl} sx={{ bgcolor: "#111111", color: "#ffffff", fontWeight: 700 }}>
                  {friend.displayName.charAt(0)}
                </Avatar>
              </ListItemButton>
            );
          })}
        </List>
      </Stack>
    </Stack>
  );
}

interface AddFriendViewProps extends Partial<Omit<FriendSelectorViewProps, "onSelect" | "selectedUsernames">> {
  onClose: () => void;
  onSelect?: (friend: Friend) => void;
  selectedUsernames?: string[];
}

export function AddFriendView({
  onClose,
  onSelect = () => undefined,
  selectedUsernames,
  title = "Add new friend",
  description = "Invite friends you trust",
}: AddFriendViewProps) {
  return (
    <FriendSelectorView
      title={title}
      description={description}
      onClose={onClose}
      onSelect={onSelect}
      selectedUsernames={selectedUsernames}
      mode="suggestions"
    />
  );
}
