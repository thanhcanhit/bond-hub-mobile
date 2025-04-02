import React from "react";
import { FlatList, ListRenderItem, View } from "react-native";
import ChatItem from "./ChatItem";

interface ChatItemData {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  avatarUrl?: string;
  isGroup?: boolean;
  isMuted?: boolean;
  unreadCount?: number;
}

interface ListChatItemProps {
  data: ChatItemData[];
  onChatPress?: (chatId: string) => void;
}

const ListChatItem: React.FC<ListChatItemProps> = ({ data, onChatPress }) => {
  const renderItem: ListRenderItem<ChatItemData> = ({ item }) => (
    <ChatItem
      id={item.id}
      name={item.name}
      lastMessage={item.lastMessage}
      lastMessageTime={item.lastMessageTime}
      avatarUrl={item.avatarUrl}
      isGroup={item.isGroup}
      isMuted={item.isMuted}
      unreadCount={item.unreadCount}
      onPress={() => onChatPress?.(item.id)}
    />
  );

  const keyExtractor = (item: ChatItemData) => item.id;

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 8 }}
      ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
    />
  );
};

export default ListChatItem;
