import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { HStack } from "../../components/ui/hstack";
import { VStack } from "../../components/ui/vstack";
import { Avatar, AvatarFallbackText } from "../../components/ui/avatar";
import { Text } from "react-native";
import {
  ArrowLeft,
  Phone,
  Video,
  Image,
  Mic,
  Heart,
  Logs,
  Search,
  Ellipsis,
  SendHorizonal,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Sticker from "@/assets/svgs/sticker.svg";
import { Colors } from "@/constants/Colors";
import { Fab } from "@/components/ui/fab";
interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName?: string;
  timestamp: string;
  isMe: boolean;
  reactions?: string[];
}

const ChatScreen = () => {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = React.useState("");
  const [isGroup] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      content: "Xin chào người 9.5 nodeJS! Dao nay ban co khoe khong",
      senderId: "1",
      timestamp: new Date().toISOString(),
      isMe: true,
    },
    {
      id: "2",
      content: "Oh queo",
      senderId: "2",
      timestamp: new Date().toISOString(),
      isMe: false,
    },
    {
      id: "3",
      content: "Chao nguoi 10d ReactNative !",
      senderId: "2",
      timestamp: new Date().toISOString(),
      isMe: false,
    },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: message,
        senderId: "1",
        timestamp: new Date().toISOString(),
        isMe: true,
      };
      setMessages([...messages, newMessage]);
      setMessage("");
    }
  };

  const MessageBubble = ({
    message,
    index,
    messages,
  }: {
    message: Message;
    index: number;
    messages: Message[];
  }) => {
    const isFirstMessageFromSender =
      index === 0 || messages[index - 1].senderId !== message.senderId;
    const isLastMessageFromSender =
      index === messages.length - 1 ||
      messages[index + 1].senderId !== message.senderId;

    return (
      <HStack
        className={`max-w-[80%] mb-2 ${message.isMe ? "self-end flex-row-reverse" : "self-start"}`}
      >
        {!message.isMe && isFirstMessageFromSender && (
          <Avatar size="sm" className="mr-2">
            <AvatarFallbackText>User</AvatarFallbackText>
          </Avatar>
        )}
        {!message.isMe && !isFirstMessageFromSender && (
          <View className="w-8 mr-2" />
        )}
        <VStack>
          {message.senderName && (
            <Text className="text-xs text-gray-500 mb-1">
              {message.senderName}
            </Text>
          )}
          <View
            className={`rounded-2xl px-4  ${message.isMe ? "bg-[#dee8fe]" : "bg-white"} border-t-[1px] border-r-[1px] border-l-[1px] border-b-[2px] border-gray-300 `}
          >
            <Text className={"text-black max-w-52 pt-2.5"}>
              {message.content}
            </Text>
            <Text className="text-xs text-gray-400 mt-1.5 pb-2">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          {isLastMessageFromSender && (
            <HStack className="absolute bottom-[-12] right-[0] bg-white rounded-full p-1 border-gray-200 border-2">
              {message.reactions?.map((reaction, index) => (
                <Text key={index} className="mr-1">
                  {reaction}
                </Text>
              ))}
              <TouchableOpacity>
                <Heart size={14} color="black" />
              </TouchableOpacity>
            </HStack>
          )}
        </VStack>
      </HStack>
    );
  };

  return (
    <View className="flex-1 bg-[#ebecf0]">
      {/* Header */}
      <LinearGradient
        start={{ x: 0.03, y: 0 }}
        end={{ x: 0.99, y: 2.5 }}
        colors={["#297eff", "#228eff", "#00d4ff"]}
      >
        <View
          className="flex-row items-center justify-between px-2.5 py-2"
          style={{
            paddingTop: Platform.OS === "ios" ? insets.top : 20,
          }}
        >
          <HStack className="items-center justify-between w-full">
            <HStack className="items-center flex-1">
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color="white" />
              </TouchableOpacity>
              <VStack className="pl-2.5">
                <Text
                  className="text-lg font-semibold text-white"
                  numberOfLines={1}
                >
                  Top 2 dev 24 skill linkedin
                </Text>
                <Text className="text-xs text-gray-200">
                  Hoạt động 2 giờ trước
                </Text>
              </VStack>
            </HStack>
            <HStack className="space-x-4">
              {!isGroup ? (
                <>
                  <TouchableOpacity className="px-2.5">
                    <Phone size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity className="px-2.5">
                    <Video size={25} color="white" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity className="px-2.5">
                    <Video size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity className="px-2.5">
                    <Search size={24} color="white" />
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity className="pl-2.5">
                <Logs size={24} color="white" />
              </TouchableOpacity>
            </HStack>
          </HStack>
        </View>
      </LinearGradient>

      {/* Messages */}
      <ScrollView className="flex-1 px-2">
        <VStack className="py-4">
          {messages.map((msg, index) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              index={index}
              messages={messages}
            />
          ))}
        </VStack>
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View className="w-full px-5 py-2.5 border-t border-gray-200 bg-white ">
          <HStack className="items-center pb-3">
            <TouchableOpacity className="mr-2">
              <Sticker width={25} height={25} />
            </TouchableOpacity>
            <TextInput
              className="flex-1 py-2.5 ml-1 text-xl"
              placeholder="Tin nhắn"
              value={message}
              onChangeText={setMessage}
              multiline
            />
            {!message.trim() ? (
              <HStack className="ml-2 space-x-2">
                <TouchableOpacity className="px-2.5">
                  <Ellipsis size={25} color="#c4c4c4" />
                </TouchableOpacity>
                <TouchableOpacity className="px-2.5">
                  <Mic size={25} color="#c4c4c4" />
                </TouchableOpacity>
                <TouchableOpacity className="pl-2.5">
                  <Image size={25} color="#c4c4c4" />
                </TouchableOpacity>
              </HStack>
            ) : (
              <TouchableOpacity
                onPress={handleSend}
                className="rounded-full w-8 h-8 items-center justify-center"
              >
                <SendHorizonal
                  size={25}
                  color={Colors.light.PRIMARY_BLUE}
                  fill={Colors.light.PRIMARY_BLUE}
                />
              </TouchableOpacity>
            )}
          </HStack>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;
