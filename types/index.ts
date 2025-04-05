// Common interfaces used across the application

export interface User {
  userId: string;
  email: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInfo {
  id: string;
  userId: string;
  bio?: string;
  profilePictureUrl?: string;
  coverImgUrl?: string;
  phoneNumber?: string;
  location?: string;
  dateOfBirth?: string;
  gender?: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: "PENDING" | "ACCEPTED" | "BLOCKED";
  user: User;
  friend: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSetting {
  id: string;
  userId: string;
  notificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  privacyLevel: "PUBLIC" | "PRIVATE" | "FRIENDS_ONLY";
  user: User;
  createdAt: Date;
  updatedAt: Date;
}
