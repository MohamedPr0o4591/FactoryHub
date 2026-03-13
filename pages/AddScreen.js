import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadImageToStrapi, createClient } from "../services/api";

export default function AddScreen({ data, onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [size, setSize] = useState("");
  const [year, setYear] = useState("");
  const [details, setDetails] = useState("");
  const [sampleImage, setSampleImage] = useState(null);
  const [loading, setLoading] = useState(false); // ✅ حالة التحميل

  const handleChangeImage = () => {
    Alert.alert("صورة العينة", "اختر مصدر الصورة", [
      { text: "📷 الكاميرا", onPress: pickFromCamera },
      { text: "🖼️ المعرض", onPress: pickFromGallery },
      { text: "إلغاء", style: "cancel" },
    ]);
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
      quality: 0.8,
    });
    if (!r.canceled) setSampleImage(r.assets[0].uri);
  };

  const pickFromCamera = async () => {
    const p = await ImagePicker.requestCameraPermissionsAsync();
    if (!p.granted) {
      Alert.alert("تنبيه", "لازم تسمح باستخدام الكاميرا");
      return;
    }
    const r = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!r.canceled) setSampleImage(r.assets[0].uri);
  };

  // ✅ الحفظ مع API
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("تنبيه", "اسم العميل مطلوب");
      return;
    }

    try {
      setLoading(true);

      let imageId = null;

      // الخطوة 1: لو فيه صورة → نرفعها على Library
      if (sampleImage) {
        console.log("📤 جاري رفع الصورة...");
        const uploadedFile = await uploadImageToStrapi(sampleImage);
        imageId = uploadedFile.id;
        console.log("✅ تم رفع الصورة، ID:", imageId);
      }

      // الخطوة 2: إنشاء العميل
      console.log("📝 جاري إنشاء العميل...");
      await createClient({
        c_name: name.trim(),
        c_phone: phone.trim(),
        c_size: size.trim(),
        c_year: year.trim(),
        c_additional_options: details.trim(),
        c_img: imageId, // ممكن يكون null لو مفيش صورة
      });
      console.log("✅ تم إنشاء العميل");

      // الخطوة 3: Refetch
      if (data?.refetchClients) {
        await data.refetchClients();
      }

      Alert.alert("✅ تم", "تم إضافة العميل بنجاح!");

      // الخطوة 4: الرجوع للصفحة الرئيسية
      onAdd && onAdd();
    } catch (error) {
      console.error("❌ Error:", error);
      Alert.alert("❌ خطأ", "حصلت مشكلة، حاول تاني");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>➕ إضافة عميل جديد</Text>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>✕ إلغاء</Text>
          </TouchableOpacity>
        </View>

        {/* الصورة */}
        <TouchableOpacity style={styles.imageBox} onPress={handleChangeImage}>
          {sampleImage ? (
            <Image
              source={{ uri: sampleImage }}
              style={styles.sampleImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImage}>
              <Text style={styles.noImageIcon}>📷</Text>
              <Text style={styles.noImageText}>اضغط لإضافة صورة العينة</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.formCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>👤 اسم العميل / الشركة *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="ادخل اسم العميل"
              placeholderTextColor="rgba(255,255,255,0.25)"
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>📞 رقم الهاتف</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="01xxxxxxxxx"
              placeholderTextColor="rgba(255,255,255,0.25)"
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>📐 المقاس</Text>
            <TextInput
              style={styles.input}
              value={size}
              onChangeText={setSize}
              placeholder="مثال: 120x80"
              placeholderTextColor="rgba(255,255,255,0.25)"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>📅 السنة</Text>
            <TextInput
              style={styles.input}
              value={year}
              onChangeText={setYear}
              placeholder="ادخل السنة"
              placeholderTextColor="rgba(255,255,255,0.25)"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>📝 تفاصيل إضافية</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={details}
              onChangeText={setDetails}
              placeholder="أي ملاحظات إضافية..."
              placeholderTextColor="rgba(255,255,255,0.25)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* ✅ زرار الحفظ مع Loading */}
        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.disabledBtn]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#22c55e" />
          ) : (
            <Text style={styles.saveBtnText}>✅ إضافة العميل</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {data?.userData?.u_status !== "active" && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>لا يمكن إضافة عميل</Text>
          <Text style={styles.overlayText}>
            يرجى التواصل مع المدير لتفعيل الحساب
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollBody: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 50, paddingBottom: 120 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  cancelBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cancelText: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
  imageBox: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.15)",
  },
  sampleImage: { width: "100%", height: "100%" },
  noImage: { flex: 1, alignItems: "center", justifyContent: "center" },
  noImageIcon: { fontSize: 40, opacity: 0.3, marginBottom: 8 },
  noImageText: { color: "rgba(255,255,255,0.25)", fontSize: 13 },
  formCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 20,
  },
  fieldGroup: { marginBottom: 18 },
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
  textArea: { height: 100, paddingTop: 12 },
  saveBtn: {
    backgroundColor: "rgba(34,197,94,0.2)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.3)",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  saveBtnText: { color: "#22c55e", fontSize: 16, fontWeight: "bold" },
  // ✅ أضف ده
  disabledBtn: {
    opacity: 0.5,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  overlayText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    width: "80%",
  },
});
