import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  Animated,
  PanResponder,
  Pressable,
  Text,
  Dimensions,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const H_MARGIN = 24;

export default function ImageViewer({ imageUri, visible, onClose }) {
  const [showViewer, setShowViewer] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0.5)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [zoomed, setZoomed] = useState(false);
  const lastTap = useRef(0);

  useEffect(() => {
    if (visible) {
      setShowViewer(true);
      setZoomed(false);
      translateX.setValue(0);
      translateY.setValue(0);
      imageScale.setValue(0.5);
      imageOpacity.setValue(0);
      overlayOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.spring(imageScale, {
          toValue: 1,
          useNativeDriver: false,
          friction: 6,
        }),
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(imageScale, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(imageOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start(() => setShowViewer(false));
    }
  }, [visible]);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (zoomed) {
        Animated.parallel([
          Animated.spring(imageScale, {
            toValue: 1,
            useNativeDriver: false,
            friction: 6,
          }),
          Animated.spring(translateX, { toValue: 0, useNativeDriver: false }),
          Animated.spring(translateY, { toValue: 0, useNativeDriver: false }),
        ]).start();
        setZoomed(false);
      } else {
        Animated.spring(imageScale, {
          toValue: 2.5,
          useNativeDriver: false,
          friction: 6,
        }).start();
        setZoomed(true);
      }
    }
    lastTap.current = now;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5,
      onPanResponderGrant: () => handleDoubleTap(),
      onPanResponderMove: (_, g) => {
        if (zoomed) {
          translateX.setValue(g.dx);
          translateY.setValue(g.dy);
        }
      },
      onPanResponderRelease: (_, g) => {
        if (!zoomed) {
          if (g.dy > 100) onClose && onClose();
        } else {
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: false,
              friction: 7,
            }),
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: false,
              friction: 7,
            }),
          ]).start();
        }
      },
    })
  ).current;

  if (!showViewer) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <View style={styles.header}>
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
        <Text style={styles.hint}>
          {zoomed
            ? "اسحب للتحريك • دوس مرتين للتصغير"
            : "دوس مرتين للتكبير • اسحب لتحت للإغلاق"}
        </Text>
      </View>
      <View style={styles.imageContainer} {...panResponder.panHandlers}>
        <Animated.Image
          source={{ uri: imageUri }}
          style={[
            styles.image,
            {
              opacity: imageOpacity,
              transform: [
                { scale: imageScale },
                { translateX },
                { translateY },
              ],
            },
          ]}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.95)",
    zIndex: 999,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: { color: "#fff", fontSize: 18 },
  hint: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    flex: 1,
    textAlign: "center",
  },
  imageContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.7 },
});
