import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  Dimensions,
  StyleSheet,
  Animated,
} from "react-native";
import {
  UserRoundPlus,
  Users,
  Cloud,
  Calendar,
  Video,
  MonitorSmartphone,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { Text } from "react-native";
import { router } from "expo-router";

interface PlusMenuProps {
  visible: boolean;
  onClose: () => void;
  position?: { top: number; right: number };
}

const PlusMenu: React.FC<PlusMenuProps> = ({
  visible,
  onClose,
  position = { top: 60, right: 20 },
}) => {
  const { width, height } = Dimensions.get("window");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const menuItems = [
    {
      id: "add-friend",
      icon: <UserRoundPlus size={24} color={Colors.light.PRIMARY_BLUE} />,
      title: "Thêm bạn",
      onPress: () => {
        onClose();
        // Navigate to add friend screen
      },
    },
    {
      id: "create-group",
      icon: <Users size={24} color={Colors.light.PRIMARY_BLUE} />,
      title: "Tạo nhóm",
      onPress: () => {
        onClose();
        router.push("/group/create");
      },
    },
    {
      id: "separator-1",
      isSeparator: true,
    },
    {
      id: "my-cloud",
      icon: <Cloud size={24} color={Colors.light.PRIMARY_BLUE} />,
      title: "Cloud của tôi",
      onPress: () => {
        onClose();
        // Navigate to cloud screen
      },
    },
    {
      id: "zalo-calendar",
      icon: <Calendar size={24} color={Colors.light.PRIMARY_BLUE} />,
      title: "Lịch Zalo",
      onPress: () => {
        onClose();
        // Navigate to calendar screen
      },
    },
    {
      id: "separator-2",
      isSeparator: true,
    },
    {
      id: "create-group-call",
      icon: <Video size={24} color={Colors.light.PRIMARY_BLUE} />,
      title: "Tạo cuộc gọi nhóm",
      onPress: () => {
        onClose();
        // Navigate to group call screen
      },
    },
    {
      id: "login-devices",
      icon: <MonitorSmartphone size={24} color={Colors.light.PRIMARY_BLUE} />,
      title: "Thiết bị đăng nhập",
      onPress: () => {
        onClose();
        // Navigate to login devices screen
      },
    },
  ];

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.menuContainer,
            {
              top: position.top,
              right: position.right,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {menuItems.map((item) => {
            if (item.isSeparator) {
              return <View key={item.id} style={styles.separator} />;
            }

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>{item.icon}</View>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuContainer: {
    position: "absolute",
    width: 220,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingVertical: 8,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemActive: {
    backgroundColor: "#F5F5F5",
  },
  iconContainer: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
  },
});

export default PlusMenu;
