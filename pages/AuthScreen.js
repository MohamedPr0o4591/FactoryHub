// screens/AuthScreen.js
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Image,
  Dimensions,
} from "react-native";

import { getAuths, createAuth } from "../services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const H_MARGIN = 24;

export default function AuthScreen({ data, onLogin, setShowForgotPassword }) {
  const [activeTab, setActiveTab] = useState("login"); // login أو register
  const tabIndicatorX = useRef(new Animated.Value(0)).current;
  const queryClient = useQueryClient();

  // جلب بيانات المستخدمين من Strapi باستخدام React Query
  // ده هيجيب الداتا أول ما الشاشة تفتح، ويخزنها في الـ Cache
  const {
    data: authsData,
    isLoading: isAuthsLoading,
    isError: isAuthsError,
    error: authsError,
  } = useQuery({
    queryKey: ["auths"],
    queryFn: getAuths,
  });

  // حقول تسجيل الدخول
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // حقول التسجيل الجديد
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  const switchTab = (tab) => {
    setActiveTab(tab);
    Animated.spring(tabIndicatorX, {
      toValue: tab === "login" ? 0 : SCREEN_WIDTH / 2 - 40,
      useNativeDriver: false,
      friction: 8,
    }).start();
  };

  const handleLogin = async () => {
    // 1. التحقق من المدخلات
    if (!loginEmail.trim()) {
      Alert.alert("تنبيه", "ادخل البريد الإلكتروني");
      return;
    }
    if (!loginPassword.trim()) {
      Alert.alert("تنبيه", "ادخل كلمة السر");
      return;
    }

    // 2. التحقق من حالة الـ API
    if (isAuthsLoading) {
      Alert.alert("جاري التحميل", "لسة بنجيب الداتا من السيرفر، لحظة واحدة...");
      return;
    }
    if (isAuthsError) {
      Alert.alert("❌ فشل الاتصال بالداتابيز", authsError.message);
      return;
    }

    // 3. التحقق من المستخدمين الموجودين
    const filter = authsData?.filter(
      (item) => item.e_mail === loginEmail && item.u_pass === loginPassword
    );

    if (!filter || filter.length === 0) {
      Alert.alert("تنبيه", "البريد الإلكتروني أو كلمة السر غير صحيحة");
      return;
    }

    const user = filter[0];

    await AsyncStorage.setItem("userEmail", loginEmail);
    await AsyncStorage.setItem("userPassword", loginPassword);
    await AsyncStorage.setItem("userData", JSON.stringify(user));

    // نجاح تسجيل الدخول
    data.setUserData(filter[0]);
    onLogin && onLogin(filter[0]);
  };

  const handleRegister = async () => {
    if (!registerName.trim()) {
      Alert.alert("تنبيه", "ادخل اسمك");
      return;
    }
    if (!registerEmail.trim()) {
      Alert.alert("تنبيه", "ادخل البريد الإلكتروني");
      return;
    }
    if (!registerPhone.trim()) {
      Alert.alert("تنبيه", "ادخل رقم الهاتف");
      return;
    }
    if (!registerPassword.trim()) {
      Alert.alert("تنبيه", "ادخل كلمة السر");
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      Alert.alert("تنبيه", "كلمة السر غير متطابقة");
      return;
    }

    try {
      await createAuth({
        f_name: registerName,
        e_mail: registerEmail,
        u_phone: registerPhone,
        u_pass: registerPassword,
      });

      await queryClient.invalidateQueries({ queryKey: ["auths"] });

      Alert.alert("✅ تم التسجيل", "حسابك في انتظار موافقة المدير", [
        {
          text: "حسناً",
          onPress: () => switchTab("login"),
        },
      ]);
    } catch (error) {
      Alert.alert("❌ خطأ", "فشل إنشاء الحساب");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* اللوجو */}
      <View style={styles.logoSection}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🏭</Text>
        </View>
        <Text style={styles.appName}>Factory Hub</Text>
        <Text style={styles.appSlogan}>إدارة المصنع بذكاء</Text>
      </View>

      {/* التبويبات */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={styles.tab} onPress={() => switchTab("login")}>
          <Text
            style={[
              styles.tabText,
              activeTab === "login" && styles.tabTextActive,
            ]}
          >
            تسجيل دخول
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => switchTab("register")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "register" && styles.tabTextActive,
            ]}
          >
            تسجيل جديد
          </Text>
        </TouchableOpacity>

        {/* المؤشر المتحرك */}
        <Animated.View
          style={[
            styles.tabIndicator,
            { transform: [{ translateX: tabIndicatorX }] },
          ]}
        />
      </View>

      {/* فورم تسجيل الدخول */}
      {activeTab === "login" && (
        <View style={styles.formCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>📧 البريد الإلكتروني</Text>
            <TextInput
              style={styles.input}
              value={loginEmail}
              onChangeText={setLoginEmail}
              placeholder="example@email.com"
              placeholderTextColor="rgba(255,255,255,0.25)"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>🔒 كلمة السر</Text>
            <TextInput
              style={styles.input}
              value={loginPassword}
              onChangeText={setLoginPassword}
              placeholder="ادخل كلمة السر"
              placeholderTextColor="rgba(255,255,255,0.25)"
              secureTextEntry
            />
          </View>

          {/* ✅ الزرار الجديد هنا */}
          {/* <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => setShowForgotPassword(true)}
          >
            <Text style={styles.forgotText}>نسيت كلمة السر؟</Text>
          </TouchableOpacity> */}

          <TouchableOpacity style={styles.submitBtn} onPress={handleLogin}>
            <Text style={styles.submitBtnText}>🔓 دخول</Text>
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>مفيش حساب؟ </Text>
            <TouchableOpacity onPress={() => switchTab("register")}>
              <Text style={styles.switchLink}>سجل الآن</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* فورم التسجيل الجديد */}
      {activeTab === "register" && (
        <View style={styles.formCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>👤 الاسم الكامل</Text>
            <TextInput
              style={styles.input}
              value={registerName}
              onChangeText={setRegisterName}
              placeholder="ادخل اسمك"
              placeholderTextColor="rgba(255,255,255,0.25)"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>📧 البريد الإلكتروني</Text>
            <TextInput
              style={styles.input}
              value={registerEmail}
              onChangeText={setRegisterEmail}
              placeholder="example@email.com"
              placeholderTextColor="rgba(255,255,255,0.25)"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>📞 رقم الهاتف</Text>
            <TextInput
              style={styles.input}
              value={registerPhone}
              onChangeText={setRegisterPhone}
              placeholder="01xxxxxxxxx"
              placeholderTextColor="rgba(255,255,255,0.25)"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>🔒 كلمة السر</Text>
            <TextInput
              style={styles.input}
              value={registerPassword}
              onChangeText={setRegisterPassword}
              placeholder="ادخل كلمة السر"
              placeholderTextColor="rgba(255,255,255,0.25)"
              secureTextEntry
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>🔒 تأكيد كلمة السر</Text>
            <TextInput
              style={styles.input}
              value={registerConfirmPassword}
              onChangeText={setRegisterConfirmPassword}
              placeholder="اعد كتابة كلمة السر"
              placeholderTextColor="rgba(255,255,255,0.25)"
              secureTextEntry
            />
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              ⚠️ ملاحظة: حسابك سيكون في الانتظار حتى يوافق عليه المدير
            </Text>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleRegister}>
            <Text style={styles.submitBtnText}>📝 تسجيل</Text>
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>عندك حساب؟ </Text>
            <TouchableOpacity onPress={() => switchTab("login")}>
              <Text style={styles.switchLink}>سجل دخول</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1020",
  },

  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // ============ Logo ============
  logoSection: {
    alignItems: "center",
    marginBottom: 30,
  },

  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
  },

  logoEmoji: {
    fontSize: 50,
  },

  appName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 6,
  },

  appSlogan: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  },

  // ============ Tabs ============
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    position: "relative",
  },

  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    zIndex: 1,
  },

  tabText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 15,
    fontWeight: "bold",
  },

  tabTextActive: {
    color: "#fff",
  },

  tabIndicator: {
    position: "absolute",
    bottom: 4,
    left: 4,
    width: SCREEN_WIDTH / 2 - 28,
    height: "85%",
    backgroundColor: "rgba(59,130,246,0.3)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.4)",
  },

  // ============ Form ============
  formCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  fieldGroup: {
    marginBottom: 18,
  },

  label: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginBottom: 8,
    textAlign: "right",
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    color: "#fff",
    fontSize: 15,
    paddingHorizontal: 14,
    height: 50,
    textAlign: "right",
  },

  forgotBtn: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },

  forgotText: {
    color: "rgba(59,130,246,0.8)",
    fontSize: 13,
  },

  noteBox: {
    backgroundColor: "rgba(249,115,22,0.1)",
    borderWidth: 1,
    borderColor: "rgba(249,115,22,0.2)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },

  noteText: {
    color: "rgba(249,115,22,0.9)",
    fontSize: 12,
    textAlign: "right",
    lineHeight: 20,
  },

  submitBtn: {
    backgroundColor: "rgba(59,130,246,0.25)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.4)",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },

  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  switchText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
  },

  switchLink: {
    color: "#3b82f6",
    fontSize: 13,
    fontWeight: "bold",
  },
});
