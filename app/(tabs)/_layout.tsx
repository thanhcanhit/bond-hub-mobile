import { Tabs } from "expo-router";
import React, { useState } from "react";
import {
  BookUser,
  Clock7,
  MessageSquareText,
  Shapes,
  User,
} from "lucide-react-native";
import { Text, View } from "react-native";

export default function TabLayout() {
  const [activeTab, setActiveTab] = useState("index");
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#297eff",
        tabBarInactiveTintColor: "#ccc",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 500,
          display: "none",
        },
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "white",
          height: 60,
          paddingTop: 10,
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
            <View className="items-center">
              <MessageSquareText
                size={28}
                color={focused ? "#297eff" : color}
              />
              {focused && (
                <Text
                  style={{ fontSize: 12, color: "#297eff", fontWeight: 600 }}
                  className="w-20 text-center pt-1"
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
              <BookUser size={28} color={focused ? "#297eff" : color} />
              {focused && (
                <Text
                  style={{ fontSize: 12, color: "#297eff", fontWeight: 600 }}
                  className="w-20 text-center pt-1 "
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
              <Shapes
                size={28}
                stroke={focused ? "#297eff" : color}
                fill={focused ? "#297eff" : "white"}
              />
              {focused && (
                <Text
                  style={{ fontSize: 12, color: "#297eff", fontWeight: 600 }}
                  className="w-20 text-center pt-1 "
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
              <Clock7
                size={focused ? 32 : 28}
                stroke={focused ? "white" : color}
                fill={focused ? "#297eff" : "white"}
              />
              {focused && (
                <Text
                  style={{ fontSize: 12, color: "#297eff", fontWeight: 600 }}
                  className="w-20 text-center pt-1 "
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
              <User
                size={28}
                stroke={focused ? "#297eff" : color}
                fill={focused ? "#297eff" : "white"}
              />
              {focused && (
                <Text
                  style={{ fontSize: 12, color: "#297eff", fontWeight: 600 }}
                  className="w-20 text-center pt-1 "
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
