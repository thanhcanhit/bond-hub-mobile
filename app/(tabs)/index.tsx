import { View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatItem from "@/components/ChatItem";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 items-center">
      <ChatItem
        name="Tran Dinh Kien"
        lastMessage="xin chào bạn, dạo này bạn có khoẻ không? Tôi có việc đang muốn hỏi bạn về môn CNM"
        lastMessageTime="2024-05-07T14:30:00"
        avatarUrl="https://example.com/avatar1.jpg"
        isMuted={true}
        unreadCount={3}
        onPress={() => console.log("Chat selected")}
        id={""}
      />
      <ChatItem
        name="Tran Dinh Kien"
        lastMessage="xin chào bạn, dạo này bạn có khoẻ không? Tôi có việc đang muốn hỏi bạn về môn CNM"
        lastMessageTime="2024-05-07T14:30:00"
        avatarUrl="https://example.com/avatar1.jpg"
        isMuted={false}
        unreadCount={3}
        onPress={() => console.log("Chat selected")}
        id={""}
      />
      <ChatItem
        name="Tran Dinh Kien"
        lastMessage="xin chào bạn, dạo này bạn có khoẻ không? Tôi có việc đang muốn hỏi bạn về môn CNM"
        lastMessageTime="2024-05-07T14:30:00"
        avatarUrl="https://example.com/avatar1.jpg"
        isMuted={true}
        unreadCount={3}
        onPress={() => console.log("Chat selected")}
        id={""}
      />
    </View>
  );
}
