import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import img from "../assets/my-logo.png";
import { BASE_URL } from "../services/api";
import axios from "axios";

export default function ProfilePage({
  data,
  onOpenRequests,
  onOpenChangePassword,
  onLogout,
  refetchAuths,
}) {
  const [profileImage, setProfileImage] = useState(
    data?.userData?.u_img
      ? `${BASE_URL}/factoryhub/upload/${data.userData.u_img}`
      : null
  );

  const handleUploadImage = async (uri) => {
    try {
      // ✅ خزن الصورة فوراً عشان تتعرض
      setProfileImage(uri);

      const formData = new FormData();

      const fileName = uri.split("/").pop();
      const fileExtension = fileName.split(".").pop().toLowerCase();

      const mimeTypes = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
      };

      const mimeType = mimeTypes[fileExtension] || "image/jpeg";

      formData.append("id", data?.userData?.id);
      formData.append("u_img", {
        uri,
        name: fileName,
        type: mimeType,
      });

      const response = await axios.post(
        `${BASE_URL}/factoryhub/auth/update.php`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ الصورة اتخزنت:", response.data.u_img);

      // ✅ تحديث الـ State بالصورة الجديدة
      const updatedUserData = {
        ...data?.userData,
        u_img: response.data.u_img,
      };

      data.setUserData(updatedUserData);

      // ✅ IMPORTANT: انتظر قليل ثم اعمل refetch
      setTimeout(() => {
        if (refetchAuths) {
          console.log("🔄 جاري تحديث البيانات...");
          refetchAuths();
        }
      }, 500); // نصف ثانية تأخير

      Alert.alert("✅ تم", "تم تحديث الصورة بنجاح!");
    } catch (error) {
      console.error("❌ Error:", error);
      Alert.alert("❌ خطأ", error.message || "حصلت مشكلة في رفع الصورة");
      setProfileImage(null);
    }
  };

  const pickFromGallery = async () => {
    const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!p.granted) {
      Alert.alert("تنبيه", "لازم تسمح بالوصول للمعرض");
      return;
    }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!r.canceled) {
      await handleUploadImage(r.assets[0].uri); // ✅ نرفعها على طول
    }
  };

  const pickFromCamera = async () => {
    const p = await ImagePicker.requestCameraPermissionsAsync();
    if (!p.granted) {
      Alert.alert("تنبيه", "لازم تسمح باستخدام الكاميرا");
      return;
    }
    const r = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!r.canceled) {
      await handleUploadImage(r.assets[0].uri); // ✅ نرفعها على طول
    }
  };

  const handleChangeImage = () => {
    Alert.alert("تغيير الصورة", "اختر مصدر الصورة", [
      { text: "الكاميرا", onPress: pickFromCamera },
      { text: "المعرض", onPress: pickFromGallery },
      { text: "إلغاء", style: "cancel" },
    ]);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollBody}
    >
      <View style={styles.profComponent}>
        <Text style={styles.profTitle}>👤 حسابي</Text>
        <View style={styles.profileTop}>
          <View style={styles.imgBox}>
            <Image
              style={styles.img}
              source={
                profileImage
                  ? { uri: profileImage } // ✅ لو عندنا صورة محلية
                  : data?.userData?.u_img
                  ? {
                      uri: `${data.api}/factoryhub/upload/${data.userData.u_img}`,
                    } // ✅ من الـ server
                  : img // ✅ الصورة الافتراضية
              }
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.edit} onPress={handleChangeImage}>
              <Text style={styles.editText}>📷</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{data?.userData?.f_name}</Text>
          <View style={styles.details}>
            <Text style={styles.detail}>{data?.userData?.e_mail}</Text>
            <Text style={styles.detail}>{data?.userData?.u_phone}</Text>
          </View>
        </View>
      </View>

      <View style={styles.profComponent}>
        <Text style={styles.profTitle}>🟢 حالة الحساب</Text>
        {data?.userData?.u_status === "active" ? (
          <View style={[styles.statusBox, styles.statusActive]}>
            <Text style={styles.profDetail}>✅ مفعل</Text>
          </View>
        ) : data?.userData?.u_status === "pending" ? (
          <View style={[styles.statusBox, styles.statusPending]}>
            <Text style={styles.profDetail}>⏳ في الانتظار ..</Text>
          </View>
        ) : data?.userData?.u_status === "inactive" ? (
          <View style={[styles.statusBox, styles.statusInactive]}>
            <Text style={styles.profDetail}>🔴 موقوف</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.profComponent}>
        <Text style={styles.profTitle}>🔑 الصلاحيات</Text>
        {data?.userData?.role === "manager" ? (
          <View style={styles.roleManager}>
            <Text style={styles.profDetail}>👑 مدير</Text>
          </View>
        ) : (
          <View style={styles.roleUser}>
            <Text style={styles.profDetail}>👤 مستخدم عادي</Text>
          </View>
        )}
      </View>

      <View style={styles.profComponent}>
        <Text style={styles.profTitle}>📊 إحصائيات</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>عدد العملاء</Text>
            <Text style={styles.statValue}>
              {data?.clientsData?.length || 0}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>آخر تعديل</Text>
            <Text style={styles.statValue}>
              {data?.clientsData?.length > 0
                ? new Date(
                    data.clientsData[data.clientsData.length - 1].updatedAt
                  ).toLocaleDateString("ar-EG") +
                  " " +
                  new Date(
                    data.clientsData[data.clientsData.length - 1].updatedAt
                  ).toLocaleTimeString("ar-EG")
                : "لا يوجد"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.profComponent}>
        <View style={styles.actionsColumn}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onOpenChangePassword}
          >
            <Text style={styles.btnSettings}>🔐 تغيير كلمة السر</Text>
          </TouchableOpacity>
          {data?.userData?.role === "manager" && (
            <TouchableOpacity style={styles.actionBtn} onPress={onOpenRequests}>
              <Text style={styles.btnRequest}>📋 طلبات</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionBtn} onPress={onLogout}>
            <Text style={styles.btnLogout}>🚪 تسجيل خروج</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollBody: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 50, paddingBottom: 120 },
  profComponent: {
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  profTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#fff",
    textAlign: "right",
  },
  profileTop: { alignItems: "center" },
  imgBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  img: { width: "100%", height: "100%" },
  edit: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1d1d1d",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  editText: { fontSize: 14 },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#fff",
    textAlign: "center",
  },
  details: { alignItems: "center", gap: 6 },
  detail: { fontSize: 14, color: "rgba(255,255,255,0.7)", textAlign: "center" },
  statusBox: { padding: 12, borderRadius: 12 },
  statusActive: {
    backgroundColor: "rgba(34,197,94,0.12)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.25)",
  },
  statusPending: {
    backgroundColor: "rgba(255, 208, 0, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 208, 0, 0.25)",
  },
  statusInactive: {
    backgroundColor: "rgba(255, 0, 0, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 0, 0, 0.25)",
  },
  roleManager: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 208, 0, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 208, 0, 0.25)",
  },
  roleUser: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(59,130,246,0.12)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.25)",
  },
  profDetail: { fontSize: 14, color: "#fff", textAlign: "right" },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },
  statLabel: { fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 8 },
  statValue: { fontSize: 18, color: "#fff", fontWeight: "bold" },
  actionsColumn: { gap: 12 },
  actionBtn: { width: "100%" },
  btnSettings: {
    fontSize: 14,
    color: "rgba(59,130,246,1)",
    textAlign: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(59,130,246,0.15)",
  },
  btnRequest: {
    fontSize: 14,
    color: "rgba(238,143,0,1)",
    textAlign: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(238,143,0,0.15)",
  },
  btnLogout: {
    fontSize: 14,
    color: "rgba(238,0,0,1)",
    textAlign: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(238,0,0,0.15)",
  },
});
