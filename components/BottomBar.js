import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const H_MARGIN = 24;
const BAR_WIDTH = SCREEN_WIDTH - H_MARGIN * 2;
const BAR_HEIGHT = 64;
const LENS_SIZE = 78;

export default function BottomBar({ current = "search", onNavigate }) {
  const items = useMemo(
    () => [
      { key: "search", icon: "🔍", label: "بحث" },
      { key: "add", icon: "➕", label: "إضافة" },
      { key: "edit", icon: "✏️", label: "تعديل" },
      { key: "profile", icon: "👤", label: "حسابي" },
    ],
    []
  );

  const itemWidth = BAR_WIDTH / items.length;

  const lensX = useRef(new Animated.Value(0)).current;
  const lensScale = useRef(new Animated.Value(1)).current;
  const lensOpacity = useRef(new Animated.Value(0.7)).current;
  const barScale = useRef(new Animated.Value(1)).current;

  const activeRef = useRef(0);
  const [, forceRender] = useState(0);

  const getIndexFromPageX = (pageX) => {
    let relativeX = pageX - H_MARGIN;
    if (relativeX < 0) relativeX = 0;
    if (relativeX > BAR_WIDTH) relativeX = BAR_WIDTH;
    return Math.min(
      items.length - 1,
      Math.max(0, Math.floor(relativeX / itemWidth))
    );
  };

  const getCenterX = (index) => {
    return index * itemWidth + itemWidth / 2 - LENS_SIZE / 2;
  };

  const animateLensTo = (index) => {
    const targetX = getCenterX(index);
    Animated.parallel([
      Animated.spring(lensX, {
        toValue: targetX,
        useNativeDriver: false,
        friction: 6,
        tension: 80,
      }),
      Animated.sequence([
        Animated.timing(lensScale, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.spring(lensScale, {
          toValue: 1,
          useNativeDriver: false,
          friction: 4,
        }),
      ]),
      Animated.sequence([
        Animated.timing(lensOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(lensOpacity, {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: false,
        }),
      ]),
      Animated.sequence([
        Animated.timing(barScale, {
          toValue: 1.03,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.spring(barScale, {
          toValue: 1,
          useNativeDriver: false,
          friction: 5,
        }),
      ]),
    ]).start();
  };

  useEffect(() => {
    const idx = Math.max(
      0,
      items.findIndex((i) => i.key === current)
    );
    activeRef.current = idx;
    lensX.setValue(getCenterX(idx));
  }, []);

  useEffect(() => {
    const idx = items.findIndex((i) => i.key === current);
    if (idx < 0) return;
    if (idx === activeRef.current) return;
    activeRef.current = idx;
    animateLensTo(idx);
    forceRender((n) => n + 1);
  }, [current]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const index = getIndexFromPageX(e.nativeEvent.pageX);
        if (index !== activeRef.current) {
          activeRef.current = index;
          animateLensTo(index);
          forceRender((n) => n + 1);
        }
      },
      onPanResponderMove: (e) => {
        const index = getIndexFromPageX(e.nativeEvent.pageX);
        if (index !== activeRef.current) {
          activeRef.current = index;
          animateLensTo(index);
          forceRender((n) => n + 1);
        }
      },
      onPanResponderRelease: () => {
        const selected = items[activeRef.current];
        if (selected && onNavigate) onNavigate(selected.key);
      },
      onPanResponderTerminate: () => {
        const selected = items[activeRef.current];
        if (selected && onNavigate) onNavigate(selected.key);
      },
    })
  ).current;

  const currentActiveIndex = activeRef.current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.bar, { transform: [{ scale: barScale }] }]}
    >
      <Animated.View
        style={[
          styles.lens,
          {
            opacity: lensOpacity,
            transform: [{ translateX: lensX }, { scale: lensScale }],
          },
        ]}
      />
      {items.map((item, i) => {
        const isActive = i === currentActiveIndex;
        return (
          <Pressable
            key={item.key}
            style={styles.navItem}
            onPress={() => {
              if (i !== activeRef.current) {
                activeRef.current = i;
                animateLensTo(i);
                forceRender((n) => n + 1);
              }
              onNavigate && onNavigate(item.key);
            }}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>
              {item.icon}
            </Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: H_MARGIN,
    right: H_MARGIN,
    bottom: 12,
    height: BAR_HEIGHT,
    borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 14,
    zIndex: 10,
  },
  lens: {
    position: "absolute",
    top: -7,
    left: 0,
    width: LENS_SIZE,
    height: LENS_SIZE,
    borderRadius: LENS_SIZE / 2,
    backgroundColor: "rgba(255,255,255,0.24)",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  icon: { fontSize: 18, opacity: 0.45 },
  iconActive: { fontSize: 21, opacity: 1 },
  label: { marginTop: 2, fontSize: 9, color: "rgba(255,255,255,0.5)" },
  labelActive: { color: "#fff", fontSize: 11 },
});
