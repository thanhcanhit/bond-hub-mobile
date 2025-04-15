import { create } from "zustand";

type UserStatus = "online" | "offline" | "typing";

interface UserStatusState {
  userStatuses: Map<string, { status: UserStatus; timestamp: Date }>;
  setUserStatus: (userId: string, status: UserStatus, timestamp: Date) => void;
  getUserStatus: (
    userId: string,
  ) => { status: UserStatus; timestamp: Date } | undefined;
  isUserOnline: (userId: string) => boolean;
  isUserTyping: (userId: string) => boolean;
}

export const useUserStatusStore = create<UserStatusState>((set, get) => ({
  userStatuses: new Map(),

  setUserStatus: (userId, status, timestamp) => {
    set((state) => ({
      userStatuses: new Map(state.userStatuses).set(userId, {
        status,
        timestamp,
      }),
    }));
  },

  getUserStatus: (userId) => {
    return get().userStatuses.get(userId);
  },

  isUserOnline: (userId) => {
    const status = get().userStatuses.get(userId);
    return status?.status === "online" || status?.status === "typing";
  },

  isUserTyping: (userId) => {
    const status = get().userStatuses.get(userId);
    return status?.status === "typing";
  },
}));
