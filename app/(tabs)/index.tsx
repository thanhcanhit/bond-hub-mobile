import { View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import ListChatItem from "@/components/ListChatItem";
const chatListData = [
  {
    id: "1",
    name: "John Doe",
    lastMessage: "Hey, how are you doing?",
    lastMessageTime: "2023-05-15T10:30:00",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    isMuted: false,
    unreadCount: 2,
  },
  {
    id: "2",
    name: "Alice Smith",
    lastMessage: "Meeting at 3 PM tomorrow",
    lastMessageTime: "2023-05-14T16:45:00",
    avatarUrl: "https://i.pravatar.cc/150?img=2",
    isGroup: false,
    unreadCount: 0,
  },
  {
    id: "3",
    name: "Tech Team",
    lastMessage: "Code review completed",
    lastMessageTime: "2023-05-14T14:20:00",
    isGroup: true,
    isMuted: true,
    unreadCount: 5,
  },
  {
    id: "4",
    name: "Emma Johnson",
    lastMessage: "Thanks for the help!",
    lastMessageTime: "2023-05-13T09:15:00",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
    unreadCount: 0,
  },
  {
    id: "5",
    name: "Family Group",
    lastMessage: "Mom: Dinner this weekend?",
    lastMessageTime: "2023-05-12T18:30:00",
    isGroup: true,
    unreadCount: 3,
  },
  {
    id: "6",
    name: "David Wilson",
    lastMessage: "Let's catch up soon",
    lastMessageTime: "2023-05-10T11:10:00",
    avatarUrl: "https://i.pravatar.cc/150?img=4",
    isMuted: false,
    unreadCount: 1,
  },
  {
    id: "7",
    name: "Marketing Team",
    lastMessage: "New campaign draft attached",
    lastMessageTime: "2023-05-09T13:25:00",
    isGroup: true,
    unreadCount: 0,
  },
  {
    id: "8",
    name: "Sophia Brown",
    lastMessage: "Did you see the news?",
    lastMessageTime: "2023-05-08T20:40:00",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    unreadCount: 0,
  },
  {
    id: "9",
    name: "Gaming Buddies",
    lastMessage: "Mike: Online tonight?",
    lastMessageTime: "2023-05-07T22:15:00",
    isGroup: true,
    isMuted: false,
    unreadCount: 7,
  },
  {
    id: "10",
    name: "Michael Taylor",
    lastMessage: "Project deadline extended",
    lastMessageTime: "2023-05-06T15:50:00",
    avatarUrl: "https://i.pravatar.cc/150?img=6",
    unreadCount: 0,
  },
];
export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 items-center bg-white">
      <ListChatItem data={chatListData} />
    </View>
  );
}
