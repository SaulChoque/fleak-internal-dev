"use client";

import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { Friend } from "@/app/types/friend";
import { FriendController } from "@/app/controllers/friendController";

interface AddFriendViewProps {
  onClose: () => void;
}

export function AddFriendView({ onClose }: AddFriendViewProps) {
  const [suggestions, setSuggestions] = useState<Friend[]>([]);

  useEffect(() => {
    FriendController.getSuggestions().then(setSuggestions);
  }, []);

  return (
    <>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 700 }}>
        <IconButton onClick={onClose} edge="start">
          <span className="material-symbols-rounded">arrow_back</span>
        </IconButton>
        Add new friend
      </DialogTitle>
      <DialogContent dividers sx={{ px: 3, py: 2.5 }}>
        <Stack spacing={2.5}>
          <div>
            <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" letterSpacing={1.2}>
              People you may know
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Suggestions are based on testimonies and shared contacts.
            </Typography>
          </div>
          <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {suggestions.map((item) => (
              <ListItem
                key={item.id}
                disableGutters
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
                secondaryAction={
                  <Button variant="contained" size="small" sx={{ textTransform: "none", borderRadius: 2 }}>
                    Add
                  </Button>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "primary.main", color: "common.white", fontWeight: 700 }}>
                    {item.displayName.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primaryTypographyProps={{ variant: "subtitle2", fontWeight: 600 }}
                  secondaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                  primary={item.displayName}
                  secondary={item.username}
                />
              </ListItem>
            ))}
          </List>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Close
        </Button>
      </DialogActions>
    </>
  );
}
