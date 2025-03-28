import { Tabs } from "expo-router";
import React, { useState } from "react";
import clsx from "clsx";
import { Text, View, Platform, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Contact from "@/assets/svgs/contacts.svg";
import Discovery from "@/assets/svgs/discovery.svg";
import Messages from "@/assets/svgs/message.svg";
import Info from "@/assets/svgs/user.svg";
import TimeLine from "@/assets/svgs/timeline.svg";
import SearchHeader from "@/components/ui/search-header/SearchHeader";
import { Colors } from "@/constants/Colors";

export default function TabLayout() {
  const [activeTab, setActiveTab] = useState("index");
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        header: ({ route }) => {
          return (
            <SearchHeader
              screenName={route.name as any}
              onActionPress={() => {}}
              onSearch={() => {}}
            />
          );
        },
        tabBarActiveTintColor: Colors.light.PRIMARY_BLUE,
        tabBarInactiveTintColor: "#ccc",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 500,
          display: "none",
        },
        tabBarStyle: {
          backgroundColor: "white",
          height: Platform.select({
            ios: 55 + insets.bottom,
            android: 60,
          }),
          paddingTop: 10,
          paddingBottom: Platform.select({
            ios: 10,
            android: 10,
          }),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        listeners={{
          tabPress: () => setActiveTab("index"),
        }}
        options={{
          title: "Tin nhắn",
          tabBarIcon: ({ color, focused }) => (
            <View className={clsx("items-center", focused ? "" : "")}>
              <Messages
                width={25}
                height={25}
                stroke={focused ? Colors.light.PRIMARY_BLUE : color}
                strokeWidth={1.5}
              />
              {focused && (
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.light.PRIMARY_BLUE,
                    fontWeight: 600,
                  }}
                  className="w-20 text-center "
                >
                  Tin nhắn
                </Text>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        listeners={{
          tabPress: () => setActiveTab("contacts"),
        }}
        options={{
          title: "Danh bạ",
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              <Contact
                width={25}
                height={25}
                stroke={focused ? Colors.light.PRIMARY_BLUE : color}
                strokeWidth={1.5}
              />
              {focused && (
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.light.PRIMARY_BLUE,
                    fontWeight: 600,
                  }}
                  className="w-20 text-center  "
                >
                  Danh bạ
                </Text>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="discovery"
        listeners={{
          tabPress: () => setActiveTab("discovery"),
        }}
        options={{
          title: "Khám phá",
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              <Discovery
                width={25}
                height={25}
                stroke={focused ? Colors.light.PRIMARY_BLUE : color}
                strokeWidth={1.5}
              />
              {focused && (
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.light.PRIMARY_BLUE,
                    fontWeight: 600,
                  }}
                  className="w-20 text-center "
                >
                  Khám phá
                </Text>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="timeline"
        listeners={{
          tabPress: () => setActiveTab("timeline"),
        }}
        options={{
          title: "Nhật ký",
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              <TimeLine
                width={25}
                height={25}
                stroke={focused ? Colors.light.PRIMARY_BLUE : color}
                strokeWidth={1.5}
              />
              {focused && (
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.light.PRIMARY_BLUE,
                    fontWeight: 600,
                  }}
                  className="w-20 text-center "
                >
                  Nhật ký
                </Text>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="info"
        listeners={{
          tabPress: () => setActiveTab("info"),
        }}
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              <Info
                width={25}
                height={25}
                stroke={focused ? Colors.light.PRIMARY_BLUE : color}
                strokeWidth={1.5}
              />
              {focused && (
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.light.PRIMARY_BLUE,
                    fontWeight: 600,
                  }}
                  className="w-20 text-center "
                >
                  Cá nhân
                </Text>
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
