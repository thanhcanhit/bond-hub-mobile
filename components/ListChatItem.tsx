import React from "react";
import { FlatList, ListRenderItem, View } from "react-native";
import ChatItem from "./ChatItem";
import { ChatItemData } from "@/types";

interface ListChatItemProps {
  data: ChatItemData[];
  onChatPress?: (chatId: string) => void;
}

const ListChatItem: React.FC<ListChatItemProps> = ({ data, onChatPress }) => {
  const renderItem: ListRenderItem<ChatItemData> = ({ item }) => (
    <ChatItem
      id={item.id}
      email={item.email}
      phoneNumber={item.phoneNumber}
      createdAt={item.createdAt}
      updatedAt={item.updatedAt}
      infoId={item.infoId}
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
