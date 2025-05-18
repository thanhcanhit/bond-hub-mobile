import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  FlatList,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  Text,
  Modal,
  ListRenderItem,
  TextInput as RNTextInput,
  ScrollView,
  Clipboard,
} from "react-native";
import EmojiPicker, { type EmojiType } from "rn-emoji-keyboard";
import {
  Image as ImageIcon,
  Mic,
  Ellipsis,
  SendHorizonal,
  FileText,
  Sparkles,
  MessageSquare,
  FileUp,
  Copy,
  Wand2,
  ScanText,
  X,
  ClipboardCheck,
  Check,
  Trash,
  RotateCcw,
  SkipBack,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Sticker from "@/assets/svgs/sticker.svg";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import { Message, GroupMember } from "@/types";
import { useConversationsStore } from "@/store/conversationsStore";
import { groupService } from "@/services/group-service";
import * as ImagePicker from "expo-image-picker";
import { MediaTypeOptions } from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { ChatHeader } from "@/components/chat/ChatHeader";
import MessageBubble from "@/components/chat/MessageBubble";
import { MediaPreview } from "@/components/chat/MediaPreview";
import VoiceRecorder from "@/components/chat/VoiceRecorder";
import { useChatStore } from "@/store/chatStore";
import { debounce } from "lodash";
import { callService, Call } from "@/services/call/callService";
import { aiService } from "@/services/ai-service";

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

  const flatListRef = useRef<FlatList>(null);
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showAiEnhanceModal, setShowAiEnhanceModal] = useState(false);
  const [showAiGenerateModal, setShowAiGenerateModal] = useState(false);
  const [showAiSummarizeModal, setShowAiSummarizeModal] = useState(false);
  const [enhancedMessage, setEnhancedMessage] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [textToSummarize, setTextToSummarize] = useState("");
  const [summarizedText, setSummarizedText] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState("");
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const router = useRouter();
  const { id: chatId, name, avatarUrl, type } = useLocalSearchParams();
  const isGroupChat = type === "GROUP";

  useEffect(() => {
    if (chatId) {
      const chatType = type === "GROUP" ? "GROUP" : "USER";
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
        fetchGroupMembers(chatId as string);
      }
    }

    return () => {
      useChatStore.getState().setCurrentChat(null);
      useChatStore.getState().setCurrentChatType(null);
    };
  }, [chatId, name, avatarUrl, type]);

  useEffect(() => {
    if (chatId) {
      console.log(`Initializing chat screen for ${chatId}`);
      loadMessages(chatId as string);
      const conversationsStore = useConversationsStore.getState();
      conversationsStore.markAsRead(chatId as string, type as "USER" | "GROUP");
    } else {
      console.error("Cannot load messages: No chat ID provided");
    }
  }, [chatId, type]);

  const isLoadingMore = useRef(false);

  useEffect(() => {
    if (!isFirstLoad && messages.length > 0 && !isLoadingMore.current) {
      scrollToBottom();
    }
    if (isFirstLoad && messages.length > 0) {
      setIsFirstLoad(false);
      scrollToBottom(false);
    }
  }, [messages, isFirstLoad]);

  const scrollToBottom = (animated = true) => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToIndex({
        index: 0,
        animated,
        viewPosition: 1,
      });
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
      isLoadingMore.current = true;
      await loadMessages(chatId as string, page + 1);
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setTimeout(() => {
        isLoadingMore.current = false;
      }, 500);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !user) return;
    await sendMessage(chatId as string, message, user.userId);
    setMessage("");
    setTimeout(() => scrollToBottom(), 100);
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
    setTimeout(() => scrollToBottom(), 100);
  };

  const handleDocumentPick = async () => {
    if (!user) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/msword", "text/plain"],
        multiple: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
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
        mediaTypes: MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });
      if (!result.canceled && result.assets.length > 0) {
        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        const invalidFiles = result.assets.filter(
          (asset) => asset.fileSize && asset.fileSize > MAX_FILE_SIZE,
        );
        if (invalidFiles.length > 0) {
          Alert.alert("File quá lớn", "Ảnh hoặc video phải nhỏ hơn 10MB.");
          return;
        }
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

  const renderItem: ListRenderItem<Message> = ({ item: msg, index }) => {
    const senderInfo = getSenderInfo(msg.senderId);
    return (
      <MessageBubble
        key={msg.id}
        message={msg}
        profilePictureUrl={senderInfo.profilePic}
        senderName={senderInfo.name}
        isGroupChat={isGroupChat}
        onReaction={handleReaction}
        onRecall={handleRecall}
        onDelete={handleDelete}
        onUnReaction={handleUnReaction}
        isLastMessageOfUser={getIsLastMessageOfUser(msg, index)}
      />
    );
  };

  const handleEndReached = () => {
    if (hasMore && !loading) {
      handleLoadMore();
    }
  };

  const fetchGroupMembers = async (groupId: string) => {
    try {
      const groupDetails = await groupService.getGroupDetails(groupId);
      if (groupDetails && groupDetails.members) {
        setGroupMembers(groupDetails.members);
      }
    } catch (error) {
      console.error("Error fetching group members:", error);
    }
  };

  const getSenderInfo = (senderId: string) => {
    if (!isGroupChat)
      return { name: undefined, profilePic: avatarUrl as string };
    const member = groupMembers.find((member) => member.userId === senderId);
    if (member) {
      const memberAny = member as any;
      return {
        name: memberAny.user?.fullName || memberAny.fullName,
        profilePic:
          memberAny.user?.profilePictureUrl || memberAny.profilePictureUrl,
      };
    }
    return { name: undefined, profilePic: undefined };
  };

  const getIsLastMessageOfUser = (message: Message, index: number) => {
    if (index === messages.length - 1) return true;
    const nextMessage = messages[index + 1];
    return message.senderId !== nextMessage.senderId;
  };

  const renderTypingIndicator = () => {
    const typingUsersMap = new Map(typingUsers);
    if (user?.userId) {
      typingUsersMap.delete(user.userId);
    }
    const typingUsersArray = Array.from(typingUsersMap.entries()).map(
      ([userId, data]) => ({ userId, ...data }),
    );
    if (typingUsersArray.length > 0) {
      if (isGroupChat) {
        const typingNames = typingUsersArray.map((typingUser) => {
          const member = groupMembers.find(
            (m) => m.userId === typingUser.userId,
          );
          if (!member) return "Someone";
          const memberAny = member as any;
          return memberAny.user?.fullName || memberAny.fullName || "Someone";
        });
        let typingText = "";
        if (typingNames.length === 1) {
          typingText = `${typingNames[0]} đang soạn tin ...`;
        } else if (typingNames.length === 2) {
          typingText = `${typingNames[0]} và ${typingNames[1]} đang soạn tin ...`;
        } else if (typingNames.length > 2) {
          typingText = `${typingNames[0]} và ${typingNames.length - 1} người khác đang soạn tin ...`;
        }
        return (
          <Text className="text-blue-300 py-0.5 px-2 text-sm bg-transparent">
            {typingText}
          </Text>
        );
      } else {
        return (
          <Text className="text-gray-500 text-sm p-2 bg-none">
            đang soạn tin...
          </Text>
        );
      }
    }
    return null;
  };

  const debouncedTyping = useCallback(
    debounce((isTyping: boolean) => {
      try {
        console.log("Typing...", isTyping);
        useChatStore.getState().handleTypingStatus(isTyping);
      } catch (error) {
        console.error("Error sending typing indicator:", error);
      }
    }, 500),
    [],
  );

  const handleStartCall = async (isVideo: boolean) => {
    if (!user || !chatId) return;
    try {
      // 1. Gọi API tạo cuộc gọi
      const call = await callService.createCall(
        user.userId,
        chatId as string,
        isVideo ? "VIDEO" : "AUDIO",
      );
      setCurrentCall(call);
      setIsVideoEnabled(isVideo);
      setShowCallScreen(true);
      // 2. Kết nối socket /call
      const socket = await callService.connectSocket();
      // 3. Gửi joinRoom
      socket?.emit("joinRoom", { roomId: call.roomId });
      // (Có thể lắng nghe các sự kiện khác ở đây)
    } catch (err) {
      Alert.alert("Không thể bắt đầu cuộc gọi", "Vui lòng thử lại sau.");
      setShowCallScreen(false);
      setCurrentCall(null);
    }
  };

  const handleEndCall = async () => {
    if (currentCall && user) {
      try {
        await callService.endCall(currentCall.id, user.userId);
      } catch (err) {
        // ignore
      }
    }
    setShowCallScreen(false);
    setIsMuted(false);
    setIsVideoEnabled(false);
    setCurrentCall(null);
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // AI feature handlers
  const handleEnhanceMessage = async () => {
    if (!message.trim()) return;

    try {
      setIsLoadingAi(true);

      // Get last 5 messages for context
      const recentMessages = messages
        .slice(0, 5)
        .map((msg) => ({
          content: msg.content.text || "",
          type: "user",
          senderId: msg.senderId,
          senderName: getSenderInfo(msg.senderId).name || "Unknown",
        }))
        .reverse();

      const result = await aiService.enhanceMessage(message, recentMessages);
      console.log("result", result);
      setEnhancedMessage(result);
      setShowAiEnhanceModal(true);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cải thiện tin nhắn. Vui lòng thử lại sau.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleGenerateResponse = async () => {
    if (!generatePrompt.trim()) return;

    try {
      setIsLoadingAi(true);
      const result = await aiService.generateResponse(generatePrompt);
      setGeneratedMessage(result);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo phản hồi. Vui lòng thử lại sau.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSummarizeText = async () => {
    if (!textToSummarize.trim()) return;

    try {
      setIsLoadingAi(true);

      // Get last 5 messages for context
      const recentMessages = messages
        .slice(0, 5)
        .map((msg) => ({
          content: msg.content.text || "",
          type: "user",
          senderId: msg.senderId,
          senderName: getSenderInfo(msg.senderId).name || "Unknown",
        }))
        .reverse();

      const result = await aiService.summarizeText(
        textToSummarize,
        100,
        recentMessages,
      );
      setSummarizedText(result);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tóm tắt nội dung. Vui lòng thử lại sau.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (Platform.OS === "web") {
      navigator.clipboard.writeText(text);
    } else {
      Clipboard.setString(text);
    }
    Alert.alert("Thông báo", "Đã sao chép vào clipboard");
  };

  return (
    <View className="flex-1 bg-gray-100">
      <>
        <ChatHeader
          chatId={chatId as string}
          name={name as string}
          avatarUrl={avatarUrl as string}
          isGroup={type === "GROUP"}
          onBack={() => router.back()}
          onStartCall={handleStartCall}
        />
        <FlatList
          ref={flatListRef}
          data={[...messages].reverse()}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
          inverted={true}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.2}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={
            loading ? <ActivityIndicator className="py-4" /> : null
          }
          initialNumToRender={20}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
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
                const updatedMedia = selectedMedia.filter(
                  (_, i) => i !== index,
                );
                setSelectedMedia(updatedMedia);
              }}
            />
          )}
          <View
            className="flex-row justify-center items-center bg-white px-4 pt-2"
            style={{ paddingBottom: Platform.OS === "ios" ? 20 : 8 }}
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
              style={{ minHeight: 40, maxHeight: 70 }}
            />
            {!message.trim() && selectedMedia.length === 0 ? (
              <View className="flex-row relative">
                <TouchableOpacity
                  className="mx-2"
                  disabled={isLoadingMedia}
                  onPress={() => setShowVoiceRecorder(true)}
                >
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
                  onPress={() => setShowOptionsModal(true)}
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
              <View className="flex-row items-center">
                {message.trim() && (
                  <TouchableOpacity
                    className="mr-4"
                    onPress={handleEnhanceMessage}
                    disabled={isLoadingAi || isLoadingMedia}
                  >
                    <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center">
                      <Sparkles size={24} color="#8B5CF6" />
                    </View>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={
                    selectedMedia.length > 0
                      ? handleSendMediaMessage
                      : handleSend
                  }
                  disabled={
                    (!message.trim() && selectedMedia.length === 0) ||
                    isLoadingMedia
                  }
                >
                  <SendHorizonal
                    size={28}
                    color={Colors.light.PRIMARY_BLUE}
                    fill={Colors.light.PRIMARY_BLUE}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
        <Modal
          visible={showVoiceRecorder}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowVoiceRecorder(false)}
        >
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <VoiceRecorder
              onClose={() => setShowVoiceRecorder(false)}
              onSend={(uri) => {
                if (user) {
                  const voiceMedia = [
                    {
                      uri,
                      type: "AUDIO" as const,
                      name: `voice_message_${Date.now()}.m4a`,
                      mediaType: "AUDIO",
                    },
                  ];
                  console.log("---- voice: ", voiceMedia);
                  sendMediaMessage(
                    chatId as string,
                    "",
                    user.userId,
                    voiceMedia,
                  );
                  setShowVoiceRecorder(false);
                }
              }}
            />
          </View>
        </Modal>

        {/* Options Modal */}
        <Modal
          visible={showOptionsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowOptionsModal(false)}
        >
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
            activeOpacity={1}
            onPress={() => setShowOptionsModal(false)}
          >
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: "white",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
              }}
            >
              <View className="pt-4 pb-2 items-center">
                <View className="w-16 h-1 bg-gray-300 rounded-full mb-4" />
                <Text className="text-lg font-medium mb-2">Tùy chọn</Text>
              </View>

              <TouchableOpacity
                className="flex-row items-center px-6 py-4 border-t border-gray-100"
                onPress={() => {
                  setShowOptionsModal(false);
                  handleDocumentPick();
                }}
              >
                <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-4">
                  <FileText size={24} color={Colors.light.PRIMARY_BLUE} />
                </View>
                <Text className="text-base">Tải lên tài liệu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center px-6 py-4 border-t border-gray-100"
                onPress={() => {
                  setShowOptionsModal(false);
                  setShowAiGenerateModal(true);
                }}
              >
                <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mr-4">
                  <Wand2 size={24} color="#10B981" />
                </View>
                <Text className="text-base">Tạo tin nhắn bằng AI</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center px-6 py-4 border-t border-gray-100"
                onPress={() => {
                  setShowOptionsModal(false);
                  setShowAiSummarizeModal(true);
                }}
              >
                <View className="w-10 h-10 bg-amber-50 rounded-full items-center justify-center mr-4">
                  <ScanText size={24} color="#F59E0B" />
                </View>
                <Text className="text-base">Tóm tắt nội dung</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* AI Enhance Modal */}
        <Modal
          visible={showAiEnhanceModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAiEnhanceModal(false)}
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
                paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
                maxHeight: "80%",
              }}
            >
              <View className="pt-4 pb-2 items-center relative">
                <View className="w-16 h-1 bg-gray-300 rounded-full mb-4" />
                <Text className="text-lg font-semibold mb-2">
                  Cải thiện tin nhắn
                </Text>
                <TouchableOpacity
                  style={{ position: "absolute", right: 16, top: 16 }}
                  onPress={() => setShowAiEnhanceModal(false)}
                >
                  <X size={22} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView className="px-6 py-2">
                <View className="flex-row justify-between mb-2 items-center">
                  <Text className="text-gray-500 font-medium">
                    Tin nhắn gốc:
                  </Text>
                  <TouchableOpacity
                    onPress={() => setMessage("")}
                    className="flex-row items-center"
                  >
                    <Trash size={18} color="#EF4444" className="mr-1" />
                    <Text className="text-red-500 text-sm">Xóa trắng</Text>
                  </TouchableOpacity>
                </View>
                <View className="bg-gray-100 rounded-lg p-3 mb-5 border border-gray-200">
                  <Text className="text-gray-700">{message}</Text>
                </View>

                <View className="flex-row justify-between mb-2 items-center">
                  <Text className="text-gray-500 font-medium">
                    Tin nhắn đã cải thiện:
                  </Text>
                  {enhancedMessage && (
                    <TouchableOpacity
                      onPress={() => setEnhancedMessage("")}
                      className="flex-row items-center"
                    >
                      <RotateCcw size={16} color="#666" className="mr-1" />
                      <Text className="text-gray-500 text-sm">Làm mới</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View className="bg-purple-50 rounded-lg p-3 mb-6 min-h-[100px] border border-purple-200">
                  {isLoadingAi ? (
                    <View className="items-center justify-center h-[100px]">
                      <ActivityIndicator size="small" color="#8B5CF6" />
                      <Text className="text-purple-500 mt-2">
                        Đang cải thiện...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-gray-700">{enhancedMessage}</Text>
                  )}
                </View>

                <View className="flex-row justify-end space-x-3 mt-2 mb-4">
                  <TouchableOpacity
                    className="bg-gray-100 px-4 py-2.5 rounded-2xl flex-row items-center border border-gray-200 "
                    onPress={() => copyToClipboard(enhancedMessage)}
                    disabled={isLoadingAi || !enhancedMessage}
                  >
                    <ClipboardCheck
                      size={18}
                      color={isLoadingAi || !enhancedMessage ? "#ccc" : "#666"}
                      className="mr-2"
                    />
                    <Text
                      className={`font-medium pl-1 ${isLoadingAi || !enhancedMessage ? "text-gray-400" : "text-gray-700"}`}
                    >
                      Sao chép
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`px-4 ml-2 py-2.5 rounded-2xl flex-row items-center ${isLoadingAi || !enhancedMessage ? "bg-purple-200" : "bg-purple-500"}`}
                    onPress={() => {
                      setMessage(enhancedMessage);
                      setShowAiEnhanceModal(false);
                    }}
                    disabled={isLoadingAi || !enhancedMessage}
                  >
                    <Check size={18} color="white" className="mr-2" />
                    <Text className="text-white font-medium pl-1">Sử dụng</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* AI Generate Modal */}
        <Modal
          visible={showAiGenerateModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAiGenerateModal(false)}
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
                paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
                maxHeight: "80%",
              }}
            >
              <View className="pt-4 pb-2 items-center relative">
                <View className="w-16 h-1 bg-gray-300 rounded-full mb-4" />
                <Text className="text-lg font-semibold mb-2">
                  Tạo tin nhắn với AI
                </Text>
                <TouchableOpacity
                  style={{ position: "absolute", right: 16, top: 16 }}
                  onPress={() => setShowAiGenerateModal(false)}
                >
                  <X size={22} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView className="px-6 py-2">
                <View className="flex-row justify-between mb-2 items-center">
                  <Text className="text-gray-500 font-medium">
                    Nhập yêu cầu của bạn:
                  </Text>
                  <TouchableOpacity
                    onPress={() => setGeneratePrompt("")}
                    className="flex-row items-center"
                  >
                    <Trash size={18} color="#EF4444" className="mr-1" />
                    <Text className="text-red-500 text-sm">Xóa trắng</Text>
                  </TouchableOpacity>
                </View>
                <View className="bg-gray-100 rounded-lg mb-4 border border-gray-200">
                  <TextInput
                    className="p-3 text-gray-700 min-h-[80px]"
                    multiline
                    placeholder="Ví dụ: Viết một email xin nghỉ phép với sếp..."
                    value={generatePrompt}
                    onChangeText={setGeneratePrompt}
                    style={{ textAlignVertical: "top" }}
                  />
                </View>

                <TouchableOpacity
                  className={`flex-row py-3 rounded-lg items-center justify-center mb-5 ${isLoadingAi || !generatePrompt.trim() ? "bg-green-200" : "bg-green-500"}`}
                  onPress={handleGenerateResponse}
                  disabled={isLoadingAi || !generatePrompt.trim()}
                >
                  <Sparkles size={20} color="white" className="mr-2" />
                  <Text className="text-white font-medium">Tạo tin nhắn</Text>
                </TouchableOpacity>

                {(isLoadingAi || generatedMessage) && (
                  <>
                    <View className="flex-row justify-between mb-2 items-center">
                      <Text className="text-gray-500 font-medium">
                        Kết quả:
                      </Text>
                      {generatedMessage && (
                        <TouchableOpacity
                          onPress={() => setGeneratedMessage("")}
                          className="flex-row items-center"
                        >
                          <RotateCcw size={16} color="#666" className="mr-1" />
                          <Text className="text-gray-500 text-sm">Làm mới</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View className="bg-green-50 rounded-lg p-3 mb-5 min-h-[120px] border border-green-200">
                      {isLoadingAi ? (
                        <View className="items-center justify-center h-[120px]">
                          <ActivityIndicator size="small" color="#10B981" />
                          <Text className="text-green-500 mt-2">
                            Đang tạo tin nhắn...
                          </Text>
                        </View>
                      ) : (
                        <Text className="text-gray-700">
                          {generatedMessage}
                        </Text>
                      )}
                    </View>

                    <View className="flex-row justify-end space-x-3 mt-2 mb-4">
                      <TouchableOpacity
                        className="bg-gray-100 px-4 py-2.5 rounded-2xl flex-row items-center border border-gray-200"
                        onPress={() => copyToClipboard(generatedMessage)}
                        disabled={isLoadingAi || !generatedMessage}
                      >
                        <ClipboardCheck
                          size={18}
                          color={
                            isLoadingAi || !generatedMessage ? "#ccc" : "#666"
                          }
                          className="mr-2"
                        />
                        <Text
                          className={`font-medium pl-1 ${isLoadingAi || !generatedMessage ? "text-gray-400" : "text-gray-700"}`}
                        >
                          Sao chép
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className={`px-4 ml-2 py-2.5 rounded-2xl flex-row items-center ${isLoadingAi || !generatedMessage ? "bg-green-200" : "bg-green-500"}`}
                        onPress={() => {
                          setMessage(generatedMessage);
                          setShowAiGenerateModal(false);
                        }}
                        disabled={isLoadingAi || !generatedMessage}
                      >
                        <Check size={18} color="white" className="mr-2" />
                        <Text className="text-white pl-1 font-medium">
                          Sử dụng
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* AI Summarize Modal */}
        <Modal
          visible={showAiSummarizeModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAiSummarizeModal(false)}
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
                paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
                maxHeight: "80%",
              }}
            >
              <View className="pt-4 pb-2 items-center relative">
                <View className="w-16 h-1 bg-gray-300 rounded-full mb-4" />
                <Text className="text-lg font-semibold mb-2">
                  Tóm tắt nội dung
                </Text>
                <TouchableOpacity
                  style={{ position: "absolute", right: 16, top: 16 }}
                  onPress={() => setShowAiSummarizeModal(false)}
                >
                  <X size={22} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView className="px-6 py-2">
                <View className="flex-row justify-between mb-2 items-center">
                  <Text className="text-gray-500 font-medium">
                    Nhập nội dung cần tóm tắt:
                  </Text>
                  <TouchableOpacity
                    onPress={() => setTextToSummarize("")}
                    className="flex-row items-center"
                  >
                    <Trash size={18} color="#EF4444" className="mr-1" />
                    <Text className="text-red-500 text-sm">Xóa trắng</Text>
                  </TouchableOpacity>
                </View>
                <View className="bg-gray-100 rounded-lg mb-4 border border-gray-200">
                  <TextInput
                    className="p-3 text-gray-700 min-h-[120px]"
                    multiline
                    placeholder="Dán nội dung cần tóm tắt vào đây..."
                    value={textToSummarize}
                    onChangeText={setTextToSummarize}
                    style={{ textAlignVertical: "top" }}
                  />
                </View>

                <TouchableOpacity
                  className={`flex-row py-3 rounded-lg items-center justify-center mb-5 ${isLoadingAi || !textToSummarize.trim() ? "bg-amber-200" : "bg-amber-500"}`}
                  onPress={handleSummarizeText}
                  disabled={isLoadingAi || !textToSummarize.trim()}
                >
                  <ScanText size={20} color="white" className="mr-2" />
                  <Text className="text-white font-medium">Tóm tắt</Text>
                </TouchableOpacity>

                {(isLoadingAi || summarizedText) && (
                  <>
                    <View className="flex-row justify-between mb-2 items-center">
                      <Text className="text-gray-500 font-medium">
                        Kết quả tóm tắt:
                      </Text>
                      {summarizedText && (
                        <TouchableOpacity
                          onPress={() => setSummarizedText("")}
                          className="flex-row items-center"
                        >
                          <RotateCcw size={16} color="#666" className="mr-1" />
                          <Text className="text-gray-500 text-sm">Làm mới</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View className="bg-amber-50 rounded-lg p-3 mb-5 min-h-[100px] border border-amber-200">
                      {isLoadingAi ? (
                        <View className="items-center justify-center h-[100px]">
                          <ActivityIndicator size="small" color="#F59E0B" />
                          <Text className="text-amber-500 mt-2">
                            Đang tóm tắt...
                          </Text>
                        </View>
                      ) : (
                        <Text className="text-gray-700">{summarizedText}</Text>
                      )}
                    </View>

                    <View className="flex-row justify-end space-x-3 mt-2 mb-4">
                      <TouchableOpacity
                        className="bg-gray-100 px-4 py-2.5 rounded-2xl flex-row items-center border border-gray-200"
                        onPress={() => copyToClipboard(summarizedText)}
                        disabled={isLoadingAi || !summarizedText}
                      >
                        <ClipboardCheck
                          size={18}
                          color={
                            isLoadingAi || !summarizedText ? "#ccc" : "#666"
                          }
                          className="mr-2"
                        />
                        <Text
                          className={`font-medium pl-1 ${isLoadingAi || !summarizedText ? "text-gray-400" : "text-gray-700"}`}
                        >
                          Sao chép
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className={`px-4 py-2.5 ml-2 rounded-2xl flex-row items-center ${isLoadingAi || !summarizedText ? "bg-amber-200" : "bg-amber-500"}`}
                        onPress={() => {
                          setMessage(summarizedText);
                          setShowAiSummarizeModal(false);
                        }}
                        disabled={isLoadingAi || !summarizedText}
                      >
                        <Check size={18} color="white" className="mr-2" />
                        <Text className="text-white pl-1 font-medium">
                          Sử dụng
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </>
    </View>
  );
};

export default ChatScreen;
