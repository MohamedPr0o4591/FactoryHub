// screens/ForgotPasswordScreen.js
import React, { useState, useEffect } from "react"; // 👈 اضف useEffect
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { BASE_URL } from "../services/api";

export default function ForgotPasswordScreen({ onBack, data }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert("تنبيه", "ادخل البريد الإلكتروني أولاً");
      return;
    }
    if (!email.includes("@")) {
      Alert.alert("تنبيه", "البريد الإلكتروني غير صحيح");
      return;
    }

    setLoading(true);

    try {
      const newPassword = Math.random().toString(36).slice(-8);

      const filter = data?.authData?.filter((d) => d.e_mail == email);
      if (!filter || filter.length === 0) {
        Alert.alert("❌ خطأ", "البريد الإلكتروني غير موجود");
        setLoading(false);
        return;
      }

      const user = filter[0];
      const userId = user.documentId;

      // 1. تحديث الباسوورد
      const formData = new FormData();
      formData.append("data[u_pass]", newPassword);

      await fetch(`${BASE_URL}/api/auths/${userId}`, {
        method: "PUT",
        body: formData,
      });

      Alert.alert("✅ تم", "تم إرسال كلمة المرور الجديدة إلى بريدك");
    } catch (err) {
      console.log("Error sending email:", err);
      Alert.alert("❌ خطأ", "حدث خطأ أثناء إرسال البريد أو تحديث كلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* اللوجو */}
      <View style={styles.logoSection}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🔐</Text>
        </View>
        <Text style={styles.appName}>استعادة الحساب</Text>

        <Text style={styles.appSlogan}>سنرسل لك كلمة سر جديدة</Text>
      </View>

      {/* الفورم */}
      <View style={styles.formCard}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>📧 البريد الإلكتروني</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
            placeholderTextColor="rgba(255,255,255,0.25)"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSend}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? "جاري الإرسال..." : "📧 إرسال الرابط"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← العودة لتسجيل الدخول</Text>
        </TouchableOpacity>
      </View>
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
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(239,68,68,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(239,68,68,0.3)",
  },
  logoEmoji: {
    fontSize: 50,
  },
  appName: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 6,
  },
  appSlogan: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  },
  formCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  fieldGroup: {
    marginBottom: 24,
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
  submitBtn: {
    backgroundColor: "rgba(239,68,68,0.2)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.4)",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "bold",
  },
  backBtn: {
    alignItems: "center",
  },
  backBtnText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  },
});
