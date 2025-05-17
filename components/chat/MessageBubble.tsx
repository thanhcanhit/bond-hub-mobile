import React, { useState, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  Text as RNText,
  Alert,
  Pressable,
  Clipboard,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Heart,
  Forward,
  HeartOff,
  X,
  Check,
  ClipboardCheck,
  RotateCcw,
} from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";
import { ImageViewer } from "@/components/chat/ImageViewer";
import { VideoMessage } from "@/components/chat/VideoMessage";
import { DocumentPreview } from "@/components/chat/DocumentPreview";
import AudioMessage from "@/components/chat/AudioMessage";
import { Message, ReactionType } from "@/types";
import clsx from "clsx";
import { MediaGrid } from "@/components/chat/MediaGrid";
import { HStack } from "../ui/hstack";
import { MessageActions } from "./MessageActions";
import { MessageForwardModal } from "./MessageForwardModal";
import { aiService } from "@/services/ai-service";

interface MessageBubbleProps {
  message: Message;
  profilePictureUrl?: string;
  senderName?: string; // Add sender name for group chats
  isGroupChat?: boolean; // Flag to indicate if this is a group chat
  onReaction: (messageId: string, type: ReactionType) => void;
  onRecall: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onUnReaction: (messageId: string) => void;
  isLastMessageOfUser: boolean;
}

interface ReactionOption {
  type: ReactionType;
  emoji: string;
}

const reactionOptions: ReactionOption[] = [
  { type: "LIKE", emoji: "👍" },
  { type: "LOVE", emoji: "❤️" },
  { type: "HAHA", emoji: "😆" },
  { type: "WOW", emoji: "😮" },
  { type: "SAD", emoji: "😢" },
  { type: "ANGRY", emoji: "😠" },
];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  profilePictureUrl,
  senderName,
  isGroupChat = false,
  onReaction,
  onRecall,
  onDelete,
  onUnReaction,
  isLastMessageOfUser,
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLongPressReaction, setShowLongPressReaction] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showSummarizeModal, setShowSummarizeModal] = useState(false);
  const [summarizedText, setSummarizedText] = useState("");
  const [isLoadingSummarize, setIsLoadingSummarize] = useState(false);
  const { user } = useAuthStore();
  const isMyMessage = message.senderId === user?.userId;
  const mediaItems = message.content.media || [];

  // Check if message should be hidden (deleted for current user)
  if (message.deletedBy?.includes(user?.userId || "")) {
    return null;
  }

  // Kiểm tra xem người dùng hiện tại đã thả reaction cho tin nhắn này chưa
  const userReaction = useMemo(() => {
    if (!message.reactions) return null;
    return message.reactions.find((r) => r.userId === user?.userId) || null;
  }, [message.reactions, user?.userId]);

  const hasReacted = !!userReaction;
  const hasReactions = message.reactions && message.reactions.length > 0;
  const shouldShowReactionButton =
    isLastMessageOfUser || hasReactions || showLongPressReaction;

  // Reactions are already grouped by type with count in the new data structure
  const groupedReactions = useMemo(() => {
    if (!message.reactions) return [];

    // Map the reactions to the format expected by the UI
    return message.reactions.map((reaction) => ({
      type: reaction.reaction as ReactionType,
      count: reaction.count || 1,
      userId: reaction.userId,
    }));
  }, [message.reactions]);

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
            <DocumentPreview
              key={`doc-${index}`}
              url={media.url}
              fileName={media.fileName || ""}
            />
          ))}

        {/* Render audio messages */}
        {mediaItems
          .filter((media) => media.type === "AUDIO")
          .map((media, index) => (
            <AudioMessage key={`audio-${index}`} url={media.url} />
          ))}
      </>
    );
  };

  const handleRecall = () => {
    Alert.alert(
      "Thu hồi tin nhắn",
      "Bạn có chắc chắn muốn thu hồi tin nhắn này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Thu hồi",
          style: "destructive",
          onPress: () => onRecall(message.id),
        },
      ],
    );
  };
  const handleUnReaction = () => {
    onUnReaction(message.id);
  };

  const handleDelete = () => {
    Alert.alert(
      "Xóa tin nhắn",
      "Bạn có chắc chắn muốn xóa tin nhắn này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => onDelete(message.id),
        },
      ],
    );
  };

  const handleLongPress = () => {
    if (message.recalled) return;
    setShowActions(true);
  };

  const handleForward = () => {
    setShowActions(false);
    setShowForwardModal(true);
  };

  const handleCloseActions = () => {
    setShowActions(false);
  };

  const handleCloseReactionPicker = () => {
    setShowReactionPicker(false);
    setShowLongPressReaction(false);
  };

  // Đóng reaction picker sau khi đã chọn reaction
  const handleReactionSelect = (type: ReactionType) => {
    onReaction(message.id, type);
    setShowReactionPicker(false);
    setShowLongPressReaction(false);
  };

  // Copy message to clipboard
  const handleCopyMessage = () => {
    // Handle different types of content
    if (message.content && message.content.text) {
      Clipboard.setString(message.content.text);
      Alert.alert("Thông báo", "Đã sao chép tin nhắn vào clipboard");
    } else if (message.content && typeof message.content === "string") {
      Clipboard.setString(message.content);
      Alert.alert("Thông báo", "Đã sao chép tin nhắn vào clipboard");
    }
  };

  const handleSummarize = async () => {
    if (!message.content.text) return;

    try {
      setIsLoadingSummarize(true);
      const result = await aiService.summarizeText(message.content.text, 100);
      setSummarizedText(result);
      setShowSummarizeModal(true);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tóm tắt tin nhắn. Vui lòng thử lại sau.");
    } finally {
      setIsLoadingSummarize(false);
    }
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert("Thông báo", "Đã sao chép vào clipboard");
  };

  return (
    <>
      <View
        className={clsx(
          "flex-row mb-3 w-full relative",
          isMyMessage ? "justify-end" : "justify-start",
          shouldShowReactionButton ? "mb-6" : "mb-0.5",
        )}
      >
        {!isMyMessage && (
          <View className="mr-2">
            <Avatar size="sm">
              <AvatarImage source={{ uri: profilePictureUrl }} />
              {!profilePictureUrl && (
                <AvatarFallbackText>
                  {message.senderId.slice(0, 2).toUpperCase()}
                </AvatarFallbackText>
              )}
            </Avatar>
          </View>
        )}

        <TouchableOpacity
          onLongPress={handleLongPress}
          activeOpacity={0.8}
          className={clsx(
            "rounded-2xl max-w-[80%] relative",
            isMyMessage ? "bg-blue-100" : "bg-white",
          )}
        >
          <View className="p-2.5 px-4">
            {message.recalled ? (
              <RNText className="text-typography-500 italic">
                Tin nhắn đã thu hồi
              </RNText>
            ) : (
              <>
                {/* Forwarded message indicator */}
                {message.forwardedFrom && (
                  <View className="flex-row items-center mb-1">
                    <Forward size={14} color="#6B7280" />
                    <RNText className="text-xs text-gray-500 ml-1">
                      Tin nhắn được chuyển tiếp
                    </RNText>
                  </View>
                )}

                {/* Sender name for group chats */}
                {!isMyMessage && isGroupChat && senderName && (
                  <RNText className="text-[8px] font-medium text-blue-500 mb-1">
                    {senderName}
                  </RNText>
                )}

                {/* Text content */}
                {message.content.text && (
                  <RNText
                    className={clsx(
                      "text-base",
                      isMyMessage ? "text-gray-700" : "text-typography-900",
                    )}
                  >
                    {message.content.text}
                  </RNText>
                )}

                {/* Media content */}
                {renderMediaContent()}

                {/* Timestamp */}
                <RNText
                  className={clsx(
                    "text-xs mt-1",
                    isMyMessage ? "text-gray-500" : "text-typography-500",
                  )}
                >
                  {new Date(message.createdAt || "").toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </RNText>
              </>
            )}
          </View>
          <MessageActions
            isVisible={showActions}
            isMyMessage={isMyMessage}
            onReaction={() => {
              setShowActions(false);
              setShowLongPressReaction(true);
            }}
            onRecall={() => {
              setShowActions(false);
              handleRecall();
            }}
            onDelete={() => {
              setShowActions(false);
              handleDelete();
            }}
            onForward={handleForward}
            onCopy={handleCopyMessage}
            onSummarize={handleSummarize}
            onClose={handleCloseActions}
          />

          {/* Chỉ hiển thị reaction picker và nút reaction khi thỏa điều kiện */}
          {shouldShowReactionButton && !message.recalled && (
            <>
              {(showReactionPicker || showLongPressReaction) && (
                <>
                  {/* Overlay để xử lý click outside */}
                  <Pressable
                    onPress={handleCloseReactionPicker}
                    className="absolute inset-0 w-full h-screen z-10"
                  />

                  <View
                    className={clsx(
                      "absolute -bottom-0 bg-white rounded-full shadow-md py-2 px-3 z-20 flex-row items-center",
                      isMyMessage ? "right-0" : "left-0",
                    )}
                  >
                    <View>
                      <HStack space="sm">
                        {reactionOptions.map((reaction) => (
                          <TouchableOpacity
                            key={reaction.type}
                            onPress={() => handleReactionSelect(reaction.type)}
                            className="px-1"
                          >
                            <RNText className="text-xl">
                              {reaction.emoji}
                            </RNText>
                          </TouchableOpacity>
                        ))}
                      </HStack>
                    </View>
                    {hasReacted && (
                      <TouchableOpacity
                        onPress={() => {
                          handleUnReaction();
                          handleCloseReactionPicker();
                        }}
                        className="ml-2"
                      >
                        <HeartOff size={20} color="#c4c4c4" />
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}

              <TouchableOpacity
                onPress={() => setShowReactionPicker(!showReactionPicker)}
                className={clsx(
                  "absolute -bottom-5 bg-white rounded-full shadow-sm p-1.5 right-1 z-20",
                )}
              >
                {groupedReactions.length > 0 ? (
                  <HStack space="xs">
                    {groupedReactions.map((reaction, index) => {
                      const emoji = reactionOptions.find(
                        (opt) => opt.type === reaction.type,
                      )?.emoji;

                      return (
                        <View
                          key={index}
                          className={`flex-row items-center px-1  rounded-full ${reaction.userId === user?.userId ? "bg-blue-50" : "bg-gray-100"}`}
                        >
                          <RNText className="text-xs">{emoji}</RNText>
                          <RNText className="text-xs text-gray-500 ">
                            {reaction.count}
                          </RNText>
                        </View>
                      );
                    })}
                  </HStack>
                ) : (
                  <Heart size={12} color="#c4c4c4" strokeWidth={1.5} />
                )}
              </TouchableOpacity>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Image viewer */}
      <ImageViewer
        images={mediaItems
          .filter((media) => media.type === "IMAGE")
          .map((media) => media.url)}
        visible={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        initialIndex={selectedImageIndex}
      />

      {/* MessageForwardModal */}
      <MessageForwardModal
        isOpen={showForwardModal}
        onClose={() => setShowForwardModal(false)}
        messageId={message.id}
        currentRecipientId={
          !isMyMessage && message.messageType === "USER"
            ? message.senderId
            : message.receiverId
        }
        currentGroupId={
          message.messageType === "GROUP" ? message.groupId : undefined
        }
      />

      {/* Summarize Modal */}
      <Modal
        visible={showSummarizeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSummarizeModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "white",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: 20,
              maxHeight: "80%",
            }}
          >
            <View className="pt-4 pb-2 items-center relative">
              <View className="w-16 h-1 bg-gray-300 rounded-full mb-4" />
              <RNText className="text-lg font-semibold mb-2">
                Tóm tắt tin nhắn
              </RNText>
              <TouchableOpacity
                style={{ position: "absolute", right: 16, top: 16 }}
                onPress={() => setShowSummarizeModal(false)}
              >
                <X size={22} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-6 py-2">
              <View className="flex-row justify-between mb-2 items-center">
                <RNText className="text-gray-500 font-medium">
                  Kết quả tóm tắt:
                </RNText>
                {summarizedText && (
                  <TouchableOpacity
                    onPress={() => setSummarizedText("")}
                    className="flex-row items-center"
                  >
                    <RotateCcw size={16} color="#666" className="mr-1" />
                    <RNText className="text-gray-500 text-sm">Làm mới</RNText>
                  </TouchableOpacity>
                )}
              </View>
              <View className="bg-amber-50 rounded-lg p-3 mb-6 min-h-[100px] border border-amber-200">
                {isLoadingSummarize ? (
                  <View className="items-center justify-center h-[100px]">
                    <ActivityIndicator size="small" color="#F59E0B" />
                    <RNText className="text-amber-500 mt-2">
                      Đang tóm tắt...
                    </RNText>
                  </View>
                ) : (
                  <RNText className="text-gray-700">{summarizedText}</RNText>
                )}
              </View>

              <View className="flex-row justify-end space-x-3 mt-2 mb-4">
                <TouchableOpacity
                  className="bg-gray-100 px-4 py-2.5 rounded-2xl flex-row items-center border border-gray-200"
                  onPress={() => copyToClipboard(summarizedText)}
                  disabled={isLoadingSummarize || !summarizedText}
                >
                  <ClipboardCheck
                    size={18}
                    color={
                      isLoadingSummarize || !summarizedText ? "#ccc" : "#666"
                    }
                    className="mr-2"
                  />
                  <RNText
                    className={`font-medium pl-1 ${isLoadingSummarize || !summarizedText ? "text-gray-400" : "text-gray-700"}`}
                  >
                    Sao chép
                  </RNText>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`px-4 py-2.5 ml-2 rounded-2xl flex-row items-center ${isLoadingSummarize || !summarizedText ? "bg-amber-200" : "bg-amber-500"}`}
                  onPress={() => {
                    setShowSummarizeModal(false);
                  }}
                  disabled={isLoadingSummarize || !summarizedText}
                >
                  <Check size={18} color="white" className="mr-2" />
                  <RNText className="text-white pl-1 font-medium">Đóng</RNText>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default MessageBubble;
