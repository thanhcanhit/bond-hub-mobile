import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Text,
} from "react-native";
// import uuid from "react-native-uuid"; // Not needed
import { VStack } from "@/components/ui/vstack";
import EmojiPicker, { type EmojiType } from "rn-emoji-keyboard";
import {
  Image as ImageIcon,
  Mic,
  Ellipsis,
  SendHorizonal,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Sticker from "@/assets/svgs/sticker.svg";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import { Message } from "@/types";
import { useConversationsStore } from "@/store/conversationsStore";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { ChatHeader } from "@/components/chat/ChatHeader";
import MessageBubble from "@/components/chat/MessageBubble";
import { MediaPreview } from "@/components/chat/MediaPreview";
import { useChatStore } from "@/store/chatStore";
import { debounce } from "lodash";

const ChatScreen = () => {
  const {
    loading,
    messages,
    loadMessages,
    refreshing,
    typingUsers,
    page,
    hasMore,
    isLoadingMedia,
    selectedMedia,
    sendMessage,
    sendMediaMessage,
    handleReaction,
    handleUnReaction,
    handleRecall,
    handleDelete,
    setRefreshing,
    setSelectedMedia,
    setSelectedContact,
    setSelectedGroup,
  } = useChatStore();

  const scrollViewRef = useRef<ScrollView>(null);
  const shouldAutoScroll = useRef<boolean>(true);
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const router = useRouter();
  const { id: chatId, name, avatarUrl, type } = useLocalSearchParams();

  useEffect(() => {
    if (chatId) {
      const chatType = type === "GROUP" ? "GROUP" : "USER";

      // Cập nhật thông tin cuộc trò chuyện hiện tại
      useChatStore.getState().setCurrentChat({
        id: chatId as string,
        name: name as string,
        type: chatType as "USER" | "GROUP",
      });
      useChatStore.getState().setCurrentChatType(chatType as "USER" | "GROUP");

      if (chatType === "USER") {
        setSelectedContact({
          userId: chatId as string,
          fullName: name as string,
          email: null,
          phoneNumber: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        setSelectedGroup({
          id: chatId as string,
          name: name as string,
          profilePictureUrl: avatarUrl as string,
        });
      }
    }

    // Khi rời khỏi màn hình chat, xóa thông tin cuộc trò chuyện hiện tại
    return () => {
      useChatStore.getState().setCurrentChat(null);
      useChatStore.getState().setCurrentChatType(null);
    };
  }, [chatId, name, avatarUrl, type]);

  useEffect(() => {
    if (chatId) {
      console.log(`Initializing chat screen for ${chatId}`);
      loadMessages(chatId as string);

      // Mark conversation as read when entering chat
      const conversationsStore = useConversationsStore.getState();
      conversationsStore.markAsRead(chatId as string, type as "USER" | "GROUP");
    } else {
      console.error("Cannot load messages: No chat ID provided");
    }
  }, [chatId, type]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = (animated = true) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated });
    }
  };

  const handleRefresh = async () => {
    if (!chatId) {
      console.error("Cannot refresh: No chat ID provided");
      return;
    }

    setRefreshing(true);
    try {
      await loadMessages(chatId as string, 1);
    } catch (error) {
      console.error("Error refreshing messages:", error);
      Alert.alert("Error", "Could not load messages. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (!hasMore || loading) return;
    if (!chatId) {
      console.error("Cannot load more: No chat ID provided");
      return;
    }

    try {
      await loadMessages(chatId as string, page + 1);
    } catch (error) {
      console.error("Error loading more messages:", error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !user) return;
    await sendMessage(chatId as string, message, user.userId);
    setMessage("");
    scrollToBottom();
  };

  const handleSendMediaMessage = async () => {
    if (!user || selectedMedia.length === 0) return;
    await sendMediaMessage(
      chatId as string,
      message,
      user.userId,
      selectedMedia,
    );
    setMessage("");
    setSelectedMedia([]);
    scrollToBottom();
  };

  const handleDocumentPick = async () => {
    if (!user) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/msword", "text/plain"],
        multiple: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        const invalidFiles = result.assets.filter(
          (asset) => asset.size && asset.size > MAX_FILE_SIZE,
        );

        if (invalidFiles.length > 0) {
          Alert.alert("File Too Large", "Documents must be under 5MB.");
          return;
        }

        const mediaFiles = result.assets.map((asset) => ({
          uri: asset.uri,
          type: "DOCUMENT" as const,
          name: asset.name,
          mimeType: asset.mimeType,
        }));
        console.log(mediaFiles);
        await sendMediaMessage(
          chatId as string,
          message,
          user.userId,
          mediaFiles,
        );
        setMessage("");
      }
    } catch (error) {
      console.error("Document upload error:", error);
      Alert.alert("Error", "Failed to upload document. Please try again.");
    }
  };

  const handleMediaUpload = async () => {
    if (!user) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets.length > 0) {
        // Kiểm tra kích thước file
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        const invalidFiles = result.assets.filter(
          (asset) => asset.fileSize && asset.fileSize > MAX_FILE_SIZE,
        );

        if (invalidFiles.length > 0) {
          Alert.alert("File quá lớn", "Ảnh hoặc video phải nhỏ hơn 10MB.");
          return;
        }

        // Add selected media to preview
        setSelectedMedia(
          result.assets.map((asset) => ({
            uri: asset.uri,
            type: asset.type === "video" ? "VIDEO" : "IMAGE",
            width: asset.width,
            height: asset.height,
          })),
        );
      }
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể chọn file. Vui lòng thử lại.");
      console.error("Media picker error:", error);
    }
  };

  // Xử lý khi scroll manually
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    // Check if scroll is near bottom
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    shouldAutoScroll.current = isCloseToBottom;

    // Load more when scrolling up
    if (contentOffset.y <= 20 && hasMore && !loading) {
      handleLoadMore();
    }
  };

  // Hàm để xác định tin nhắn cuối cùng của mỗi người dùng
  const getIsLastMessageOfUser = (message: Message, index: number) => {
    if (index === messages.length - 1) return true;

    const nextMessage = messages[index + 1];
    return message.senderId !== nextMessage.senderId;
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    const typingUsersArray = Array.from(typingUsers.values());
    if (typingUsersArray.length > 0) {
      return (
        <Text className="text-gray-500 text-sm p-2 bg-none ">
          đang soạn tin ...
        </Text>
      );
    }
    return null;
  };

  // Add debounce function
  const debouncedTyping = useCallback(
    debounce((isTyping: boolean) => {
      try {
        console.log("Typing...", isTyping);
        // Use the chatStore function directly
        useChatStore.getState().handleTypingStatus(isTyping);
      } catch (error) {
        console.error("Error sending typing indicator:", error);
      }
    }, 500),
    [],
  );

  return (
    <View className="flex-1 bg-gray-100">
      <ChatHeader
        chatId={chatId as string}
        name={name as string}
        onBack={() => router.back()}
      />

      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {loading && <ActivityIndicator className="py-4" />}
        <VStack className="py-4">
          {messages.map((msg, index) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              profilePictureUrl={avatarUrl as string}
              onReaction={handleReaction}
              onRecall={handleRecall}
              onDelete={handleDelete}
              onUnReaction={handleUnReaction}
              isLastMessageOfUser={getIsLastMessageOfUser(msg, index)}
            />
          ))}
        </VStack>
      </ScrollView>

      {showEmoji && (
        <EmojiPicker
          onEmojiSelected={(emoji: EmojiType) =>
            setMessage(message + emoji.emoji)
          }
          categoryPosition="top"
          enableRecentlyUsed
          open={showEmoji}
          onClose={() => setShowEmoji(!showEmoji)}
        />
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        style={
          Platform.OS === "ios"
            ? { paddingBottom: 0 }
            : { paddingBottom: insets.bottom }
        }
      >
        {renderTypingIndicator()}
        {selectedMedia.length > 0 && (
          <MediaPreview
            mediaItems={selectedMedia}
            onRemove={(index) => {
              const updatedMedia = selectedMedia.filter((_, i) => i !== index);
              setSelectedMedia(updatedMedia);
            }}
          />
        )}
        <View
          className="flex-row justify-center items-center bg-white px-4 pt-4"
          style={{
            paddingBottom: Platform.OS === "ios" ? 25 : 10,
          }}
        >
          <TouchableOpacity
            className="ml-2.5"
            onPress={() => setShowEmoji(!showEmoji)}
            disabled={isLoadingMedia}
          >
            <Sticker width={24} height={24} color={"#c4c4c4"} />
          </TouchableOpacity>

          <TextInput
            className="flex-1 ml-2.5 p-1 bg-transparent justify-center text-gray-700 text-base"
            placeholder="Nhập tin nhắn..."
            value={message}
            onChangeText={(text) => {
              setMessage(text);
              debouncedTyping(text.length > 0);
            }}
            multiline
            numberOfLines={message.length > 100 ? 4 : 1}
            textAlignVertical="center"
            style={{
              minHeight: 40,
              maxHeight: 70,
            }}
          />
          {!message.trim() && selectedMedia.length === 0 ? (
            <View className="flex-row relative">
              <TouchableOpacity className="mx-2" disabled={isLoadingMedia}>
                <Mic
                  size={26}
                  color={isLoadingMedia ? "#c4c4c4" : "#c4c4c4"}
                  strokeWidth={1.5}
                />
              </TouchableOpacity>
              <TouchableOpacity
                className="mx-2"
                onPress={handleMediaUpload}
                disabled={isLoadingMedia}
              >
                <ImageIcon
                  size={26}
                  color={isLoadingMedia ? "#c4c4c4" : "#c4c4c4"}
                  strokeWidth={1.5}
                />
              </TouchableOpacity>
              <TouchableOpacity
                className="mx-2"
                onPress={handleDocumentPick}
                disabled={isLoadingMedia}
              >
                <Ellipsis
                  size={26}
                  color={isLoadingMedia ? "#c4c4c4" : "#c4c4c4"}
                  strokeWidth={1.5}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={
                selectedMedia.length > 0 ? handleSendMediaMessage : handleSend
              }
              disabled={
                (!message.trim() && selectedMedia.length === 0) ||
                isLoadingMedia
              }
            >
              <SendHorizonal size={28} fill={Colors.light.PRIMARY_BLUE} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;
