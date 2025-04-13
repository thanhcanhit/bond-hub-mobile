import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Modal } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { X } from "lucide-react-native";
import type { VideoMessageProps } from "@/types";

export const VideoMessage: React.FC<VideoMessageProps> = ({ url }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const player = useVideoPlayer(url, (player) => {
    player.loop = false;
  });

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setIsFullscreen(true)}
      >
        <VideoView player={player} style={styles.video} />
      </TouchableOpacity>

      <Modal
        visible={isFullscreen}
        animationType="fade"
        onRequestClose={() => setIsFullscreen(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsFullscreen(false)}
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>

          <VideoView
            player={player}
            style={styles.fullscreenVideo}
            allowsFullscreen
            allowsPictureInPicture
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 4,
    width: "100%",
  },
  video: {
    aspectRatio: 16 / 9,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  fullscreenVideo: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
});
