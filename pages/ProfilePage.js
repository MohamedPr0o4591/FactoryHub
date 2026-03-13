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
import {
  deleteImageFromStrapi,
  updateUserImage,
  uploadImageToStrapi,
} from "../services/api";

export default function ProfilePage({
  data,
  onOpenRequests,
  onOpenChangePassword,
  onLogout,
  refetchAuths,
}) {
  const [profileImage, setProfileImage] = useState(null);

  const handleUploadImage = async (uri) => {
    try {
      const oldImageId = data?.userData?.u_img?.id;
      const userId = data?.userData?.documentId; // ✅ ID المستخدم الرقمي

      // 1. نحذف القديمة (لو موجودة)
      if (oldImageId) {
        try {
          await deleteImageFromStrapi(oldImageId);
        } catch (err) {
          if (err.response?.status !== 404) throw err;
          console.log("ℹ️ الصورة القديمة مش موجودة");
        }
      }

      // 2. نرفع الجديدة
      const uploadedFile = await uploadImageToStrapi(uri);

      // 3. ✅ نربط الصورة بالمستخدم (Form Data)
      await updateUserImage(userId, uploadedFile.id);

      // 4. ✅ نحدث الـ State محلياً (عشان الصورة تتغير فوراً بدون ما تخرج وتيجي)
      data.setUserData({
        ...data?.userData,
        u_img: uploadedFile, // نحط الـ object الجديد
      });

      // 5. نعمل Refetch عشان الـ Cache يتحدث
      await refetchAuths();

      setProfileImage(uri);
    } catch (error) {
      console.error("❌ Error:", error);
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
                data?.userData?.u_img
                  ? {
                      uri: `${data.api}${data.userData.u_img.url}`,
                      profileImage,
                    }
                  : img
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
