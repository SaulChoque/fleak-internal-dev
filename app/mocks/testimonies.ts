import { Testimony } from "@/app/types/testimony";

export const testimoniesMock: Testimony[] = [
  {
    id: "testimony-1",
    title: "Read the homework",
    subtitle: "Pending of revision",
    location: "At home",
    status: "review",
    dueDate: "15/09",
    dueTime: "15:41",
    requester: "Noemi",
    category: "Homework",
    referenceCode: "REV-1098",
    lastUpdate: "Any update on the homework?",
    timeline: [
      {
        id: "tl-1",
        label: "Time of recording",
        description: "15:41",
        time: "15:41",
      },
      {
        id: "tl-2",
        label: "Proof received",
        description: "2 images, 2 videos",
        time: "15:41",
      },
      {
        id: "tl-3",
        label: "Confirm pending",
        description: "",
        time: "",
      },
    ],
    contactOptions: [
      { id: "call", type: "call", label: "Call" },
      { id: "video", type: "video", label: "Video" },
      { id: "chat", type: "chat", label: "Chat" },
    ],
  },
  {
    id: "testimony-2",
    title: "Do the dishes",
    subtitle: "3 hours ago",
    location: "At home",
    status: "pending",
    dueDate: "15/09",
    dueTime: "17:41",
    requester: "Yobel",
    category: "Chores",
    referenceCode: "REV-2076",
    lastUpdate: "Do the dishes at home",
    timeline: [
      {
        id: "tl-4",
        label: "Time of recording",
        description: "15:41",
        time: "15:41",
      },
      {
        id: "tl-5",
        label: "Proof received",
        description: "2 videos",
        time: "15:41",
      },
      {
        id: "tl-6",
        label: "Confirm pending",
        description: "Awaiting",
        time: "",
      },
    ],
    contactOptions: [
      { id: "call", type: "call", label: "Call" },
      { id: "video", type: "video", label: "Video" },
    ],
  },
  {
    id: "testimony-3",
    title: "Major vs LDU",
    subtitle: "Stadium",
    location: "Casla, Arequipa",
    status: "completed",
    dueDate: "15/09",
    dueTime: "",
    requester: "Barco",
    category: "Sports",
    referenceCode: "REV-3010",
    lastUpdate: "Confirm being inside",
    timeline: [
      {
        id: "tl-7",
        label: "Ticket guarantee",
        description: "Section A4",
        time: "",
      },
    ],
    contactOptions: [
      { id: "chat", type: "chat", label: "Chat" },
    ],
  },
];
