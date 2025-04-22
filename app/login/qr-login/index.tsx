import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ArrowLeft, Users } from "lucide-react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/select/select-actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import { groupService } from "@/services/group-service";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function QRLoginScreen() {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showGroupJoinConfirmation, setShowGroupJoinConfirmation] =
    useState(false);
  const [groupInfo, setGroupInfo] = useState<{
    id: string;
    name: string;
    memberCount: number;
    avatarUrl?: string;
  } | null>(null);
  const [scannedData, setScannedData] = useState<{
    type: string;
    data: string;
  } | null>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const insets = useSafeAreaInsets();

  // Animation for scanning effect
  const scanAnimation = useRef(new Animated.Value(0)).current;

  // Start scanning animation
  const startScanAnimation = () => {
    scanAnimation.setValue(0);
    Animated.loop(
      Animated.timing(scanAnimation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  };

  // Effect to initialize camera and request permissions if needed
  useEffect(() => {
    // Automatically request camera permission if not granted
    if (permission && !permission.granted) {
      requestPermission();
    }

    // Set a shorter timeout for camera initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [permission]);

  const handleBarCodeScanned = async ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    setCameraActive(false);
    setScannedData({ type, data });

    console.log("Scanned data:", data);

    // Kiểm tra nếu là mã QR nhóm (format: group-{groupId})
    if (data.startsWith("group-")) {
      try {
        const groupId = data.replace("group-", "");
        console.log("Detected group QR code with ID:", groupId);

        // Lấy thông tin nhóm
        const groupInfoData = await groupService.getPublicGroupInfo(groupId);
        setGroupInfo(groupInfoData);

        // Hiển thị xác nhận tham gia nhóm
        setShowGroupJoinConfirmation(true);
      } catch (error) {
        console.error("Error processing group QR code:", error);
        Alert.alert("Lỗi", "Không thể lấy thông tin nhóm. Vui lòng thử lại.", [
          {
            text: "OK",
            onPress: () => {
              setScanned(false);
              setCameraActive(true);
            },
          },
        ]);
      }
    } else {
      // Xử lý mã QR đăng nhập như bình thường
      try {
        await axiosInstance.post(`${API_URL}/qrcode/scan`, {
          qrToken: data,
        });

        // Navigate to submitLogin page with the scanned QR data
        router.push({
          pathname: "/login/qr-login/submitLogin",
          params: { qrToken: data },
        });
      } catch (error) {
        console.error("Error processing login QR code:", error);
        Alert.alert("Lỗi", "Mã QR không hợp lệ hoặc đã hết hạn.", [
          {
            text: "OK",
            onPress: () => {
              setScanned(false);
              setCameraActive(true);
            },
          },
        ]);
      }
    }
  };

  const handleConfirmLogin = async () => {
    if (!scannedData?.data) {
      return;
    }
    const result = await axiosInstance.post(`${API_URL}/qrcode/confirm`, {
      qrToken: scannedData?.data,
    });

    console.log(result.data);
    setShowConfirmation(false);
    // Navigate back or to the next screen after successful login
    router.back();
  };

  const handleCancelLogin = async () => {
    if (!scannedData?.data) {
      return;
    }

    setShowConfirmation(false);
    setScanned(false);
    setCameraActive(true);
    const result = await axiosInstance.post(`${API_URL}/qrcode/cancel`, {
      qrToken: scannedData?.data,
    });

    console.log(result.data);
  };

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View className="items-center justify-center flex-1 bg-black">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-lg text-white">
          Đang kiểm tra quyền truy cập camera...
        </Text>
        <TouchableOpacity
          className="px-8 py-4 mt-6 bg-blue-500 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-base font-bold text-white">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View className="items-center justify-center flex-1 p-4 bg-black">
        <Text className="mb-5 text-lg text-center text-white">
          Ứng dụng cần quyền truy cập camera để quét mã QR
        </Text>
        <TouchableOpacity
          className="px-8 py-4 mb-3 bg-blue-500 rounded-full"
          onPress={requestPermission}
        >
          <Text className="text-base font-bold text-white">
            Cấp quyền truy cập
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="px-8 py-4 mt-3 bg-blue-500 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-base font-bold text-white">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {isLoading ? (
        <View className="items-center justify-center flex-1 bg-black">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-lg text-white">
            Đang khởi tạo camera...
          </Text>
        </View>
      ) : (
        <CameraView
          className="flex-1"
          facing="back"
          active={cameraActive}
          style={{ flex: 1, minHeight: "100%", width: "100%" }}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          onCameraReady={() => {
            console.log("Camera ready");
            // Ensure animation starts when camera is ready
            startScanAnimation();
          }}
          onMountError={(error) => {
            console.error("Camera error:", error);
            Alert.alert(
              "Lỗi camera",
              "Không thể khởi tạo camera. Vui lòng thử lại.",
            );
          }}
        >
          <View
            className="flex-1 bg-transparent"
            style={{
              paddingTop: insets.top,
              paddingLeft: insets.left,
              paddingRight: insets.right,
            }}
          >
            {/* Removed back button from here as it's now outside the camera view */}

            {/* Scan frame decoration - only corners with thicker edges */}
            <View
              className="absolute top-1/2 left-1/2 w-[280px] h-[280px]"
              style={{ marginLeft: -140, marginTop: -140 }}
            >
              {/* Top-left corner */}
              <View className="absolute top-0 left-0 flex-row">
                <View className="w-[50px] h-[8px] bg-gray-500 rounded-full" />
                <View className="w-[8px] h-[50px] bg-gray-500 rounded-full absolute top-0 left-0" />
              </View>

              {/* Top-right corner */}
              <View className="absolute top-0 right-0 flex-row">
                <View className="w-[50px] h-[8px] bg-gray-500 rounded-full absolute right-0" />
                <View className="w-[8px] h-[50px] bg-gray-500 rounded-full absolute top-0 right-0" />
              </View>

              {/* Bottom-left corner */}
              <View className="absolute bottom-0 left-0 flex-row">
                <View className="w-[50px] h-[8px] bg-gray-500 rounded-full absolute bottom-0" />
                <View className="w-[8px] h-[50px] bg-gray-500 rounded-full absolute bottom-0 left-0" />
              </View>

              {/* Bottom-right corner */}
              <View className="absolute bottom-0 right-0 flex-row">
                <View className="w-[50px] h-[8px] bg-gray-500 rounded-full absolute bottom-0 right-0" />
                <View className="w-[8px] h-[50px] bg-gray-500 rounded-full absolute bottom-0 right-0" />
              </View>

              {/* Scanning animation line */}
              <Animated.View
                style={{
                  position: "absolute",
                  left: 10,
                  right: 10,
                  height: 3,
                  backgroundColor: "#9ca3af",
                  transform: [
                    {
                      translateY: scanAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 280],
                      }),
                    },
                  ],
                }}
              />
            </View>

            {/* Scan instruction */}
            <View className="absolute bottom-[100px] left-0 right-0 items-center">
              <View className="flex-row items-center bg-black/70 px-5 py-2.5 rounded-full">
                <Text className="text-base font-bold text-center text-white">
                  Đặt mã QR vào khung để quét
                </Text>
              </View>
            </View>
            {/* Scanning indicator */}
            <View className="absolute top-10 right-5 flex-row items-center bg-black/70 px-4 py-2 rounded-full">
              <Animated.View
                style={{
                  width: 10,
                  height: 10,
                  marginRight: 8,
                  backgroundColor: "#22c55e",
                  borderRadius: 5,
                  opacity: scanAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 0.3, 1],
                  }),
                }}
              />
              <Text className="text-sm font-medium text-white">Đang quét</Text>
            </View>
          </View>
        </CameraView>
      )}

      {/* Back button that's always visible, even during loading */}
      <TouchableOpacity
        className="absolute z-20 items-center justify-center w-12 h-12 rounded-full top-12 left-5 bg-black/60"
        onPress={() => router.back()}
        style={{ top: insets.top + 10 }}
      >
        <ArrowLeft size={26} color="white" />
      </TouchableOpacity>

      {/* Confirmation ActionSheet */}
      <Actionsheet isOpen={showConfirmation} onClose={handleCancelLogin}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="px-4 pb-6">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <View className="items-center w-full mt-2 mb-6">
            <Text className="mb-4 text-xl font-bold text-center">
              Xác nhận đăng nhập
            </Text>
            <Text className="mb-6 text-base text-center text-gray-600">
              Bạn có muốn đăng nhập vào thiết bị này không?
            </Text>

            <View className="flex-row justify-between w-full gap-4">
              <Button
                action="negative"
                variant="outline"
                onPress={handleCancelLogin}
                className="flex-1 rounded-full"
              >
                <ButtonText className="text-red-500">Huỷ bỏ</ButtonText>
              </Button>
              <Button
                action="primary"
                onPress={handleConfirmLogin}
                className="flex-1 bg-blue-500 rounded-full"
              >
                <ButtonText>Xác nhận</ButtonText>
              </Button>
            </View>
          </View>
        </ActionsheetContent>
      </Actionsheet>

      {/* Group Join Confirmation ActionSheet */}
      <Actionsheet
        isOpen={showGroupJoinConfirmation}
        onClose={() => {
          setShowGroupJoinConfirmation(false);
          setScanned(false);
          setCameraActive(true);
        }}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent className="px-4 pb-6">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <View className="items-center w-full mt-2 mb-6">
            <Text className="mb-4 text-xl font-bold text-center">
              Tham gia nhóm
            </Text>

            {groupInfo && (
              <View className="items-center mb-4">
                <View className="items-center justify-center w-16 h-16 mb-2 bg-blue-100 rounded-full">
                  {groupInfo.avatarUrl ? (
                    <Image
                      source={{ uri: groupInfo.avatarUrl }}
                      style={{ width: 64, height: 64, borderRadius: 32 }}
                    />
                  ) : (
                    <Users size={32} color="#3b82f6" />
                  )}
                </View>
                <Text className="text-lg font-bold">{groupInfo.name}</Text>
                <Text className="text-sm text-gray-500">
                  {groupInfo.memberCount} thành viên
                </Text>
              </View>
            )}

            <Text className="mb-6 text-base text-center text-gray-600">
              Bạn có muốn tham gia vào nhóm này không?
            </Text>

            <View className="flex-row justify-between w-full gap-4">
              <Button
                action="negative"
                variant="outline"
                onPress={() => {
                  setShowGroupJoinConfirmation(false);
                  setScanned(false);
                  setCameraActive(true);
                }}
                className="flex-1 rounded-full"
              >
                <ButtonText className="text-red-500">Huỷ bỏ</ButtonText>
              </Button>
              <Button
                action="primary"
                onPress={async () => {
                  try {
                    if (groupInfo) {
                      await groupService.joinGroup(groupInfo.id);
                      setShowGroupJoinConfirmation(false);

                      // Hiển thị thông báo thành công
                      Alert.alert(
                        "Thành công",
                        `Bạn đã tham gia nhóm ${groupInfo.name}`,
                        [
                          {
                            text: "OK",
                            onPress: () => {
                              // Chuyển hướng đến màn hình chat của nhóm
                              router.push({
                                pathname: "../chat/[id]",
                                params: {
                                  id: groupInfo.id,
                                  type: "GROUP",
                                  name: groupInfo.name,
                                  avatarUrl: groupInfo.avatarUrl || undefined,
                                },
                              });
                            },
                          },
                        ],
                      );
                    }
                  } catch (error) {
                    console.error("Error joining group:", error);
                    Alert.alert(
                      "Lỗi",
                      "Không thể tham gia nhóm. Vui lòng thử lại.",
                      [
                        {
                          text: "OK",
                          onPress: () => {
                            setShowGroupJoinConfirmation(false);
                            setScanned(false);
                            setCameraActive(true);
                          },
                        },
                      ],
                    );
                  }
                }}
                className="flex-1 bg-blue-500 rounded-full"
              >
                <ButtonText>Tham gia</ButtonText>
              </Button>
            </View>
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
}
