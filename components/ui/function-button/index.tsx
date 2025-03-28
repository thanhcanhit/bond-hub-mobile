import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";

type FunctionButtonProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  isExternalLink?: boolean;
  onPress: () => void;
  height?: number;
  avatar?: React.ReactNode;
  rightButton?: React.ReactNode;
  showTopBorder?: boolean;
  showBottomBorder?: boolean;
};

export const FunctionButton = ({
  icon,
  title,
  description,
  isExternalLink = false,
  onPress,
  height = 24,
  avatar,
  rightButton,
  showTopBorder = false,
  showBottomBorder = false,
}: FunctionButtonProps) => {
  const borderClasses = `${showTopBorder ? "border-t-[0.5px]" : ""} ${showBottomBorder ? "border-b-[0.5px]" : ""}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center h-${height} px-4  bg-white`}
    >
      <View className="mr-4">{avatar || icon}</View>
      <View
        className={`flex-1 h-full justify-between ${borderClasses} border-gray-300 flex-row items-center`}
      >
        <View className="">
          <Text className="text-lg font-medium text-gray-800">{title}</Text>
          {description && (
            <Text className="text-md text-gray-500">{description}</Text>
          )}
        </View>
        {rightButton ||
          (!isExternalLink && (
            <ChevronRight size={20} color="#9CA3AF" className="ml-2" />
          ))}
      </View>
    </TouchableOpacity>
  );
};
