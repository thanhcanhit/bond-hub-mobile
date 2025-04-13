import React, { useState, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text as RNText,
} from "react-native";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { HStack } from "@/components/ui/hstack";
import { ThumbsUp, RotateCcw, Trash2 } from "lucide-react-native";
import { Image } from "expo-image";
import { useAuthStore } from "@/store/authStore";
import { ImageViewer } from "@/components/chat/ImageViewer";
import { VideoMessage } from "@/components/chat/VideoMessage";
import { DocumentPreview } from "@/components/chat/DocumentPreview";
import { Message } from "@/types";
import clsx from "clsx";
import { MediaGrid } from "@/components/chat/MediaGrid";

const { width: screenWidth } = Dimensions.get("window");

interface MessageBubbleProps {
  message: Message;
  onReaction: (messageId: string, type: string) => void;
  onRecall: (messageId: string) => void;
  onDelete: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onReaction,
  onRecall,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const isMyMessage = message.senderId === useAuthStore.getState().user?.userId;
  const mediaItems = message.content.media || [];

  // Memoize image URLs to avoid recalculating
  const imageUrls = useMemo(
    () =>
      mediaItems
        .filter((media) => media.type === "IMAGE")
        .map((media) => media.url),
    [mediaItems],
  );

  // Render media content (images, videos, documents)
  const renderMediaContent = () => {
    if (mediaItems.length === 0) return null;

    return (
      <>
        {/* Render images */}
        <MediaGrid
          mediaItems={mediaItems}
          onImagePress={(index) => {
            setSelectedImageIndex(index);
            setShowImageViewer(true);
          }}
        />

        {/* Render videos */}
        {mediaItems
          .filter((media) => media.type === "VIDEO")
          .map((media, index) => (
            <VideoMessage key={`video-${index}`} url={media.url} />
          ))}

        {/* Render documents */}
        {mediaItems
          .filter((media) => media.type === "DOCUMENT")
          .map((media, index) => (
            <DocumentPreview key={`doc-${index}`} url={media.url} />
          ))}
      </>
    );
  };

  return (
    <>
      <View
        className={clsx(
          "flex-row mb-2.5 w-full",
          isMyMessage ? "justify-end" : "justify-start",
        )}
      >
        {/* Avatar for other user's message */}
        {!isMyMessage && (
          <Avatar size="sm" style={styles.avatar}>
            <AvatarFallbackText>
              {message.senderId.slice(0, 2).toUpperCase()}
            </AvatarFallbackText>
          </Avatar>
        )}

        {/* Message content */}
        <TouchableOpacity
          onLongPress={() => setShowActions(true)}
          onPress={() => setShowActions(false)}
          activeOpacity={0.8}
          style={[
            styles.bubble,
            isMyMessage ? styles.myBubble : styles.otherBubble,
            { minWidth: mediaItems.length > 0 ? 200 : 100 },
          ]}
        >
          <View className="p-2.5 px-4">
            {message.recalled ? (
              <RNText style={styles.recalledText}>Tin nhắn đã thu hồi</RNText>
            ) : (
              <>
                {/* Text content */}
                {message.content.text && (
                  <RNText
                    style={[
                      styles.messageText,
                      isMyMessage ? styles.myText : styles.otherText,
                    ]}
                  >
                    {message.content.text}
                  </RNText>
                )}

                {/* Media content */}
                {renderMediaContent()}

                {/* Timestamp */}
                <RNText
                  style={[
                    styles.timestamp,
                    isMyMessage ? styles.myTimestamp : styles.otherTimestamp,
                  ]}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </RNText>
              </>
            )}
          </View>

          {/* Action menu */}
          {showActions && (
            <View style={styles.actionMenu}>
              <HStack space="lg">
                <TouchableOpacity
                  onPress={() => {
                    onReaction(message.id, "LIKE");
                    setShowActions(false);
                  }}
                  style={styles.actionButton}
                >
                  <ThumbsUp size={20} color="#4B5563" />
                </TouchableOpacity>

                {isMyMessage && (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        onRecall(message.id);
                        setShowActions(false);
                      }}
                      style={styles.actionButton}
                    >
                      <RotateCcw size={20} color="#4B5563" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        onDelete(message.id);
                        setShowActions(false);
                      }}
                      style={styles.actionButton}
                    >
                      <Trash2 size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </>
                )}
              </HStack>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Image viewer */}
      <ImageViewer
        images={imageUrls}
        visible={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        initialIndex={selectedImageIndex}
      />
    </>
  );
};

const styles = StyleSheet.create({
  myMessage: {
    justifyContent: "flex-end",
  },
  otherMessage: {
    justifyContent: "flex-start",
  },
  avatar: {
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  myBubble: {
    backgroundColor: "#DBEAFE",
    borderTopRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recalledText: {
    color: "#6B7280",
    fontSize: 13,
    fontStyle: "italic",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myText: {
    color: "#1E3A8A",
  },
  otherText: {
    color: "#111827",
  },
  timestamp: {
    fontSize: 10,
    marginTop: 6,
    textAlign: "left",
  },
  myTimestamp: {
    color: "#1E40AF",
  },
  otherTimestamp: {
    color: "#6B7280",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    justifyContent: "flex-start",
  },
  gridItemContainer: {
    position: "relative",
    overflow: "hidden",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  actionMenu: {
    position: "absolute",
    bottom: "100%",
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 8,
  },
  actionButton: {
    padding: 4,
  },
});

export default MessageBubble;
