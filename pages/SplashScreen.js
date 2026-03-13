import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  useWindowDimensions,
} from "react-native";

export default function SplashScreen({ onFinish }) {
  const { width, height } = useWindowDimensions();

  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const loadingWidth = useRef(new Animated.Value(0)).current; // يبدأ من 0
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = () => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        useNativeDriver: false,
        friction: 4,
        tension: 50,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start(() => {
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }).start(() => {
        // ✅ التحميل من 0 لـ 100% (من الشمال لليمين)
        Animated.timing(loadingWidth, {
          toValue: 1, // 1 = 100% من عرض الـ container
          duration: 2000,
          useNativeDriver: false,
        }).start(() => {
          Animated.timing(splashOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }).start(() => {
            onFinish && onFinish();
          });
        });
      });
    });
  };

  // ✅ نحسب العرض النهائي للـ container
  const containerWidth = width * 0.6; // 60% من الشاشة

  return (
    <Animated.View style={[styles.container, { opacity: splashOpacity }]}>
      <StatusBar hidden={true} />

      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <Text style={styles.logoEmoji}>🏭</Text>
      </Animated.View>

      <Animated.View style={{ opacity: textOpacity }}>
        <Text style={styles.title}>Factory Hub</Text>
        <Text style={styles.subtitle}>إدارة المصنع بذكاء</Text>
      </Animated.View>

      <Animated.View
        style={[styles.loadingContainer, { opacity: textOpacity }]}
      >
        {/* ✅ Container ثابت العرض */}
        <View style={[styles.loadingBarBg, { width: containerWidth }]}>
          {/* ✅ Fill يتمدد من 0 للعرض الكامل */}
          <Animated.View
            style={[
              styles.loadingBarFill,
              {
                width: loadingWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"], // من 0% لـ 100%
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: textOpacity }]}>
        <Text style={styles.version}>v1.0.0</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1020",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  logoEmoji: {
    fontSize: 60,
  },
  title: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    textAlign: "center",
  },
  loadingContainer: {
    marginTop: 50,
    alignItems: "center",
    width: "100%",
  },
  loadingBarBg: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 2,
    overflow: "hidden",
    // العرض هنا متغير بناءً على { width: containerWidth }
  },
  loadingBarFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 2,
  },
  loadingText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    marginTop: 12,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    alignItems: "center",
  },
  version: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
  },
});
