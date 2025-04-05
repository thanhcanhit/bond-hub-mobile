import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ArrowLeft } from "lucide-react-native";
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

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function QRLoginScreen() {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
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

    console.log(data);
    await axiosInstance.post(`${API_URL}/qrcode/scan`, {
      qrToken: data,
    });

    // Navigate to submitLogin page with the scanned QR data
    router.push({
      pathname: "/login/qr-login/submitLogin",
      params: { qrToken: data },
    });
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

            {/* Scan frame decoration - only corners */}
            <View
              className="absolute top-1/2 left-1/2 w-[280px] h-[280px]"
              style={{ marginLeft: -140, marginTop: -140 }}
            >
              {/* Top-left corner */}
              <View className="absolute top-0 left-0 flex-row">
                <View className="w-[50px] h-[6px] bg-gray-400 rounded-full" />
                <View className="w-[6px] h-[50px] bg-gray-400 rounded-full absolute top-0 left-0" />
              </View>

              {/* Top-right corner */}
              <View className="absolute top-0 right-0 flex-row">
                <View className="w-[50px] h-[6px] bg-gray-400 rounded-full absolute right-0" />
                <View className="w-[6px] h-[50px] bg-gray-400 rounded-full absolute top-0 right-0" />
              </View>

              {/* Bottom-left corner */}
              <View className="absolute bottom-0 left-0 flex-row">
                <View className="w-[50px] h-[6px] bg-gray-400 rounded-full absolute bottom-0" />
                <View className="w-[6px] h-[50px] bg-gray-400 rounded-full absolute bottom-0 left-0" />
              </View>

              {/* Bottom-right corner */}
              <View className="absolute bottom-0 right-0 flex-row">
                <View className="w-[50px] h-[6px] bg-gray-400 rounded-full absolute bottom-0 right-0" />
                <View className="w-[6px] h-[50px] bg-gray-400 rounded-full absolute bottom-0 right-0" />
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
            <View className="absolute top-10 right-5 flex-row items-center bg-black/70 px-3 py-1.5 rounded-full">
              <Animated.View
                style={{
                  width: 8,
                  height: 8,
                  marginRight: 8,
                  backgroundColor: "#22c55e",
                  borderRadius: 4,
                  opacity: scanAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 0.3, 1],
                  }),
                }}
              />
              <Text className="text-xs text-white">Đang quét</Text>
            </View>
          </View>
        </CameraView>
      )}

      {/* Back button that's always visible, even during loading */}
      <TouchableOpacity
        className="absolute z-20 items-center justify-center w-10 h-10 rounded-full top-12 left-5 bg-black/50"
        onPress={() => router.back()}
        style={{ top: insets.top + 10 }}
      >
        <ArrowLeft size={24} color="white" />
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
    </View>
  );
}
