import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import {
  PhoneOff,
  Mic,
  MicOff,
  FlipHorizontal,
  VideoOff,
  Video,
  Settings2,
} from "lucide-react-native";
import { Avatar, AvatarFallbackText, AvatarImage } from "../ui/avatar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Call } from "@/services/call/callService";

interface CallScreenProps {
  callerName: string;
  callerAvatar?: string;
  onEndCall: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  isVideoEnabled: boolean;
  call?: Call | null;
}

const CallScreen = ({
  callerName,
  callerAvatar,
  onEndCall,
  onToggleMute,
  isMuted,
  isVideoEnabled: initialVideoEnabled = false,
  call,
}: CallScreenProps) => {
  const [isVideoOn, setIsVideoOn] = useState(initialVideoEnabled);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    setIsVideoOn(initialVideoEnabled);
  }, [initialVideoEnabled]);

  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const pulseAnim = new Animated.Value(1);

  Animated.loop(
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.3,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]),
  ).start();

  return (
    <View
      className="flex-1 bg-[#0E1C36] relative"
      style={{ paddingTop: insets.top }}
    >
      {/* Dynamic Background */}
      <View className="absolute inset-0 bg-[#297eff]/10 opacity-30" />

      {isVideoOn ? (
        <>
          {/* Remote Video Stream */}
          <View className="flex-1 bg-[#1A2D4A] justify-center items-center">
            <Animated.View
              className="absolute top-5 px-4 py-2 bg-black/50 rounded-full"
              // style={{ transform: [{ scale: pulseAnim }] }}
            >
              <Text className="text-white text-sm font-medium">
                {callerName}
              </Text>
            </Animated.View>
          </View>

          {/* Local Video Preview */}
          <View className="absolute top-20 right-3 w-36 h-52 bg-[#142A47] rounded-xl border-2 border-[#297eff] overflow-hidden justify-center items-center">
            {isFrontCamera ? (
              <View className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full" />
            ) : (
              <Avatar size="md" className="border border-[#297eff]">
                <AvatarFallbackText>{callerName}</AvatarFallbackText>
              </Avatar>
            )}
          </View>
        </>
      ) : (
        <View className="flex-1 justify-center items-center">
          {/* Animated Caller Card */}
          <Animated.View
            className="p-8 rounded-2xl items-center"
            style={{
              backgroundColor: "#142A47",
              transform: [{ scale: pulseAnim }],
              shadowColor: "#297eff",
              shadowRadius: 20,
              shadowOpacity: 0.4,
            }}
          >
            <Avatar size="xl" className="border-4 border-[#297eff]">
              <AvatarFallbackText>{callerName}</AvatarFallbackText>
              {callerAvatar && <AvatarImage source={{ uri: callerAvatar }} />}
            </Avatar>
            <Text className="text-white text-2xl font-bold mt-6">
              {callerName}
            </Text>
            <Text className="text-[#297eff] mt-2">Đang kết nối...</Text>
          </Animated.View>

          {/* Connection Quality Indicator */}
          <View className="flex-row mt-12 space-x-2">
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                className={`w-2 mx-0.5 h-6 rounded-full ${i === 1 ? "bg-[#297eff]" : "bg-white/20"}`}
                style={{ opacity: 0.3 + i * 0.2 }}
              />
            ))}
          </View>
        </View>
      )}

      {/* Floating Control Panel */}
      <View className="absolute bottom-8 left-0 right-0 px-6">
        <View className="bg-[#142A47]/90 rounded-3xl p-4 shadow-lg shadow-[#297eff]/20">
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity
              onPress={onToggleMute}
              className={`p-4 rounded-full ${isMuted ? "bg-[#297eff]" : "bg-white/10"}`}
            >
              {isMuted ? (
                <MicOff size={24} color="white" />
              ) : (
                <Mic size={24} color="#A0C4FF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsVideoOn(!isVideoOn)}
              className={`p-4 rounded-full ${isVideoOn ? "bg-[#297eff]" : "bg-white/10"}`}
            >
              {isVideoOn ? (
                <Video size={24} color="white" />
              ) : (
                <VideoOff size={24} color="#A0C4FF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onEndCall}
              className="p-4 bg-red-500 rounded-full shadow-md shadow-red-500/50"
            >
              <PhoneOff size={24} color="white" />
            </TouchableOpacity>

            {isVideoOn && (
              <TouchableOpacity
                onPress={() => setIsFrontCamera(!isFrontCamera)}
                className="p-4 bg-white/10 rounded-full"
              >
                <FlipHorizontal size={24} color="#A0C4FF" />
              </TouchableOpacity>
            )}

            <TouchableOpacity className="p-4 bg-white/10 rounded-full">
              <Settings2 size={24} color="#A0C4FF" />
            </TouchableOpacity>
          </View>

          {/* Status Bar */}
          <View className="flex-row justify-between items-center px-2">
            <Text className="text-[#A0C4FF] text-xs">04:32</Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-1" />
              <Text className="text-[#A0C4FF] text-xs">Tốt</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CallScreen;
