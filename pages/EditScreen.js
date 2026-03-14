import React, { useState, useEffect } from "react";
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
import {
  BASE_URL,
  uploadImageToStrapi,
  deleteImageFromStrapi,
  updateClient,
  updateClientImage,
  deleteClient,
} from "../services/api";

export default function EditScreen({
  data,
  client,
  onSave,
  onDelete,
  onCancel,
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [size, setSize] = useState("");
  const [year, setYear] = useState("");
  const [details, setDetails] = useState("");
  const [sampleImage, setSampleImage] = useState(null);
  const [loading, setLoading] = useState(false); // ✅ حالة التحميل

  useEffect(() => {
    if (client) {
      setName(client.c_name || "");
      setPhone(client.c_phone || "");
      setSize(client.c_size || "");
      setYear(client.c_year || "");
      setDetails(client.c_additional_options || "");
      setSampleImage(
        client.c_img ? `${BASE_URL}/factoryhub/upload/${client.c_img}` : null
      );
    }
  }, [client]);

  const handleChangeImage = () => {
    Alert.alert("تغيير صورة العينة", "اختر مصدر الصورة", [
      { text: "📷 الكاميرا", onPress: pickFromCamera },
      { text: "🖼️ المعرض", onPress: pickFromGallery },
      {
        text: "🗑️ حذف الصورة",
        onPress: () => {
          setSampleImage(null);
        },
        style: "destructive",
      },
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
    if (!r.canceled) {
      setSampleImage(r.assets[0].uri);
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
      quality: 0.8,
    });
    if (!r.canceled) {
      setSampleImage(r.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("تنبيه", "اسم العميل مطلوب");
      return;
    }
    if (!size.trim()) {
      Alert.alert("تنبيه", "المقاس مطلوب");
      return;
    }

    Alert.alert("حفظ التعديلات", "هل أنت متأكد؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حفظ",
        onPress: async () => {
          try {
            setLoading(true);

            const clientDocId = client.id;

            let imageFile = null;
            if (sampleImage) {
              const fileName = sampleImage.split("/").pop();
              const fileExtension = fileName.split(".").pop().toLowerCase();

              const mimeTypes = {
                jpg: "image/jpeg",
                jpeg: "image/jpeg",
                png: "image/png",
                gif: "image/gif",
                webp: "image/webp",
              };

              imageFile = {
                uri: sampleImage,
                name: fileName,
                type: mimeTypes[fileExtension] || "image/jpeg",
              };
            }

            await updateClient(clientDocId, {
              c_name: name.trim(),
              c_phone: phone.trim(),
              c_size: size.trim(),
              c_year: year.trim(),
              c_additional_options: details.trim(),
              c_img: imageFile,
              id: clientDocId,
            });

            if (data?.refetchClients) {
              await data.refetchClients();
            }

            Alert.alert("✅ تم", "تم حفظ التعديلات بنجاح!");
            onSave && onSave();
          } catch (error) {
            console.error("❌ Error:", error);
            Alert.alert("❌ خطأ", "حصلت مشكلة، حاول تاني");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert("⚠️ حذف العميل", `هل أنت متأكد من حذف "${client?.c_name}"؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);

            // ✅ استخدم documentId
            const clientDocId = client.id;

            // ✅ clientDocId بدل client.id
            await deleteClient(clientDocId);

            if (data?.refetchClients) {
              await data.refetchClients();
            }

            Alert.alert("✅ تم", "تم حذف العميل بنجاح!");
            onDelete && onDelete();
          } catch (error) {
            console.error("❌ Error:", error);
            Alert.alert("❌ خطأ", "حصلت مشكلة في الحذف");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (!client) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>✏️</Text>
        <Text style={styles.emptyText}>اختر عميل من القائمة للتعديل</Text>
        <Text style={styles.emptyHint}>
          اذهب لصفحة البحث → اضغط على عميل → اضغط تعديل
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>✏️ تعديل العميل</Text>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>✕ إلغاء</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.idBadge}>
          <Text style={styles.idText}>العميل #{client.id}</Text>
        </View>

        {/* ✅ الصورة */}
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
          <View style={styles.changeImageHint}>
            <Text style={styles.changeImageText}>
              {sampleImage ? "📷 تغيير الصورة" : "📷 إضافة صورة"}
            </Text>
          </View>
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
            <Text style={styles.label}>📐 المقاس *</Text>
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

        <View style={styles.buttonsSection}>
          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.disabledBtn]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#22c55e" />
            ) : (
              <Text style={styles.saveBtnText}>💾 حفظ التعديلات</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteBtn, loading && styles.disabledBtn]}
            onPress={handleDelete}
            disabled={loading}
          >
            <Text style={styles.deleteBtnText}>🗑️ حذف العميل</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {data?.userData?.u_status !== "active" && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>لا يمكن تعديل العميل</Text>
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
  idBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(59,130,246,0.15)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.3)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  idText: { color: "#3b82f6", fontSize: 13, fontWeight: "bold" },
  imageBox: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  sampleImage: { width: "100%", height: "100%" },
  noImage: { flex: 1, alignItems: "center", justifyContent: "center" },
  noImageIcon: { fontSize: 40, opacity: 0.3, marginBottom: 8 },
  noImageText: { color: "rgba(255,255,255,0.25)", fontSize: 13 },
  changeImageHint: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    alignItems: "center",
  },
  changeImageText: { color: "#fff", fontSize: 12 },
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
  buttonsSection: { gap: 12 },
  saveBtn: {
    backgroundColor: "rgba(34,197,94,0.2)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.3)",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  saveBtnText: { color: "#22c55e", fontSize: 16, fontWeight: "bold" },
  deleteBtn: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  deleteBtnText: { color: "#ef4444", fontSize: 16, fontWeight: "bold" },
  disabledBtn: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: { fontSize: 60, marginBottom: 16, opacity: 0.3 },
  emptyText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyHint: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
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
