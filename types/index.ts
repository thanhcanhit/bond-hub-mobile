// Common interfaces used across the application

export interface User {
  userId: string;
  email: string | null;
  phoneNumber: string | null;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInfo {
  id: string;
  fullName?: string;
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
// export interface ChatItemData {
//   id: string;
//   name: string;
//   lastMessage?: string;
//   lastMessageTime: string;
//   avatarUrl?: string;
//   isGroup?: boolean;
//   isMuted?: boolean;
//   unreadCount: number;
// }
export interface ChatItemData {
  friendshipId: string;
  friend: {
    id: string;
    email: string;
    phoneNumber: string;
    userInfo: {
      fullName: string;
      profilePictureUrl: string;
      statusMessage: string;
      lastSeen: string;
    };
  };
  since: string;
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

export interface MediaItem {
  type: "IMAGE" | "VIDEO" | "DOCUMENT";
  url: string;
  name?: string;
  loading?: boolean;
  width?: number;
  height?: number;
}
export interface UpdateBasicInfoData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  bio: string;
}
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export type ReactionType = "LIKE" | "LOVE" | "HAHA" | "WOW" | "SAD" | "ANGRY";

export interface MessageMedia {
  url: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT";
  fileId?: string;
  fileName?: string;
  thumbnailUrl?: string;
  metadata?: {
    path: string;
    size: number;
    mimeType: string;
    extension: string;
    bucketName: string;
    uploadedAt: string;
    sizeFormatted: string;
  };
}

export interface MessageReaction {
  count: number;
  userId: string;
  reaction: ReactionType;
}

export interface Message {
  id: string;
  content: {
    text?: string;
    image?: string;
    video?: string;
    media?: MessageMedia[];
  };
  senderId: string;
  receiverId: string;
  groupId?: string;
  recalled?: boolean;
  deletedBy?: string[];
  repliedTo?: string | null;
  reactions?: MessageReaction[];
  readBy?: string[];
  createdAt?: string;
  updatedAt?: string;
  messageType: "USER" | "GROUP";
  forwardedFrom?: string | null;
  isMe?: boolean;
}

export interface SendMessageRequest {
  receiverId: string;
  content: {
    text?: string;
  };
}

export interface SendMediaMessageRequest {
  receiverId: string;
  text?: string;
  files: MediaUploadFile[];
}

export interface MediaUploadFile {
  uri: string;
  type: string;
  name?: string;
  mediaType: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "OTHER";
}

// Thêm các interfaces mới
export interface ChatHeaderProps {
  chatId: string;
  name: string;
  avatarUrl?: string;
  isGroup?: boolean;
  onBack: () => void;
}

export interface MessageBubbleProps {
  message: Message;
  onReaction: (messageId: string, type: string) => void;
  onRecall: (messageId: string) => void;
  onDelete: (messageId: string) => void;
}

export interface ImageViewerProps {
  images: string[];
  visible: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export interface VideoMessageProps {
  url: string;
}

export interface DocumentPreviewProps {
  url: string;
  fileName: string;
}
