import React from "react";
import { FlatList, ListRenderItem, View } from "react-native";
import ChatItem from "./ChatItem";
import { Friend } from "@/services/friend-service";

interface ListChatItemProps {
  data: Friend[];
  onChatPress?: (chatId: string) => void;
}

const ListChatItem: React.FC<ListChatItemProps> = ({ data, onChatPress }) => {
  const renderItem: ListRenderItem<Friend> = ({ item }) => (
    <ChatItem
      id={item.friend.id}
      email={item.friend.email}
      phoneNumber={item.friend.phoneNumber}
      fullName={item.friend.userInfo.fullName || ""}
      profilePictureUrl={item.friend.userInfo.profilePictureUrl || ""}
      statusMessage={item.friend.userInfo.statusMessage || ""}
      lastSeen={item.friend.userInfo.lastSeen || ""}
      since={item.since}
      onPress={() => onChatPress?.(item.friendshipId)}
    />
  );

  const keyExtractor = (item: Friend) => item.friend.id;

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
