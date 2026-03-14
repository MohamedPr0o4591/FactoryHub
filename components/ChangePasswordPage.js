import axios from "axios";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { BASE_URL } from "../services/api";

export default function ChangePasswordPage({ data, onLogout }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = async () => {
    if (currentPassword !== data?.userData?.u_pass) {
      Alert.alert("كلمة المرور الحالية خاطئة");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("لا يوجد تطابق في كلمة المرور الجديد");
      return;
    }

    try {
      const userId = data?.userData?.id;
      const formData = new FormData();
      formData.append(`u_pass`, newPassword);
      formData.append(`id`, userId);

      await axios.post(`${BASE_URL}/factoryhub/auth/update.php`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("تم تحديث كلمة المرور بنجاح");

      onLogout();
    } catch (err) {
      Alert.alert("فشل الاتصال بالخادم أو حدث خطأ آخر");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 تغيير كلمة السر</Text>
      <View style={styles.formBox}>
        <Text style={styles.label}>كلمة السر الحالية</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="ادخل كلمة السر الحالية"
          placeholderTextColor="rgba(255,255,255,0.3)"
          secureTextEntry
        />
        <Text style={styles.label}>كلمة السر الجديدة</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="ادخل كلمة السر الجديدة"
          placeholderTextColor="rgba(255,255,255,0.3)"
          secureTextEntry
        />
        <Text style={styles.label}>تأكيد كلمة السر الجديدة</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="اعد كتابة كلمة السر الجديدة"
          placeholderTextColor="rgba(255,255,255,0.3)"
          secureTextEntry
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>💾 حفظ التغيير</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "right",
  },
  formBox: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  label: { color: "#fff", marginBottom: 8, marginTop: 12, textAlign: "right" },
  input: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    color: "#fff",
    paddingHorizontal: 14,
    textAlign: "right",
  },
  saveBtn: {
    marginTop: 20,
    backgroundColor: "rgba(59,130,246,0.2)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.3)",
    borderRadius: 12,
    padding: 14,
  },
  saveText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
