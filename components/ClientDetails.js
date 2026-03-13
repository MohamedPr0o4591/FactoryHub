import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Animated,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

import ImageViewer from "./ImageViewer";
import { BASE_URL, deleteClient, deleteImageFromStrapi } from "../services/api";

export default function ClientDetails({
  client,
  visible,
  onClose,
  onEdit,
  onDelete, // ✅ أضف ده
  data,
}) {
  const [showModal, setShowModal] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [deleting, setDeleting] = useState(false); // ✅ حالة التحميل
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      slideAnim.setValue(SCREEN_HEIGHT);
      overlayOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: false,
          friction: 8,
          tension: 65,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setShowModal(false);
        setImageViewerVisible(false);
      });
    }
  }, [visible]);

  // ✅ Function الحذف
  const handleDelete = () => {
    Alert.alert("⚠️ حذف العميل", `هل أنت متأكد من حذف "${client?.c_name}"؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            setDeleting(true);

            // 1. حذف صورة العميل (لو موجودة)
            if (client?.c_img?.id) {
              try {
                await deleteImageFromStrapi(client.c_img.id);
                console.log("🗑️ تم حذف صورة العميل");
              } catch (err) {
                if (err.response?.status !== 404) throw err;
                console.log("ℹ️ الصورة مش موجودة");
              }
            }

            // 2. حذف العميل (استخدم documentId)
            await deleteClient(client.documentId);
            console.log("✅ تم حذف العميل");

            // 3. Refetch
            if (data?.refetchClients) {
              await data.refetchClients();
            }

            // 4. إغلاق الـ Modal و تنفيذ onDelete
            onClose();
            Alert.alert("✅ تم", "تم حذف العميل بنجاح!");
            onDelete && onDelete();
          } catch (error) {
            console.error("❌ Error:", error);
            Alert.alert("❌ خطأ", "حصلت مشكلة في الحذف");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (!showModal) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <Pressable style={styles.overlayBg} onPress={onClose} />
      <Animated.View
        style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.handle} />
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>

        <ScrollView showsVerticalScrollIndicator={false}>
          {client && (
            <>
              <View style={styles.imageSection}>
                {client.c_img ? (
                  <Pressable onPress={() => setImageViewerVisible(true)}>
                    <Image
                      source={{ uri: `${BASE_URL}${client.c_img.url}` }}
                      style={styles.sampleImage}
                      resizeMode="cover"
                    />
                    <View style={styles.zoomHint}>
                      <Text style={styles.zoomHintText}>🔍 اضغط للتكبير</Text>
                    </View>
                  </Pressable>
                ) : (
                  <View style={styles.noImage}>
                    <Text style={styles.noImageIcon}>📷</Text>
                    <Text style={styles.noImageText}>لا توجد صورة عينة</Text>
                  </View>
                )}
              </View>

              <View style={styles.nameSection}>
                <Text style={styles.clientName}>{client.c_name}</Text>
                <View style={styles.idTag}>
                  <Text style={styles.idTagText}>#{client.id}</Text>
                </View>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoCard}>
                  <View style={[styles.infoIconBox, styles.blueBox]}>
                    <Text style={styles.infoIcon}>🔢</Text>
                  </View>
                  <Text style={styles.infoLabel}>الرقم التسلسلي</Text>
                  <Text style={styles.infoValue}>{client.id}</Text>
                </View>
                <View style={styles.infoCard}>
                  <View style={[styles.infoIconBox, styles.purpleBox]}>
                    <Text style={styles.infoIcon}>📐</Text>
                  </View>
                  <Text style={styles.infoLabel}>المقاس</Text>
                  <Text style={styles.infoValue}>{client.c_size}</Text>
                </View>
                <View style={styles.infoCard}>
                  <View style={[styles.infoIconBox, styles.greenBox]}>
                    <Text style={styles.infoIcon}>📅</Text>
                  </View>
                  <Text style={styles.infoLabel}>السنة</Text>
                  <Text style={styles.infoValue}>
                    {client.c_year || "غير محدد"}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <View style={[styles.infoIconBox, styles.orangeBox]}>
                    <Text style={styles.infoIcon}>📞</Text>
                  </View>
                  <Text style={styles.infoLabel}>الهاتف</Text>
                  <Text style={styles.infoValue}>
                    {client.c_phone || "غير محدد"}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.detailsTitle}>📝 تفاصيل إضافية</Text>
                <View style={styles.detailsBox}>
                  <Text style={styles.detailsText}>
                    {client.c_additional_options || "لا توجد تفاصيل إضافية"}
                  </Text>
                </View>
              </View>

              {data?.userData?.u_status === "active" && (
                <View style={styles.actionsRow}>
                  <Pressable
                    style={[styles.actionBtn, styles.editBtn]}
                    onPress={() => {
                      onClose();
                      onEdit && onEdit(client);
                    }}
                  >
                    <Text style={styles.actionIcon}>✏️</Text>
                    <Text style={styles.actionText}>تعديل</Text>
                  </Pressable>

                  {/* ✅ زرار الحذف */}
                  <Pressable
                    style={[
                      styles.actionBtn,
                      styles.deleteBtn,
                      deleting && styles.disabledBtn,
                    ]}
                    onPress={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <ActivityIndicator color="#ef4444" size="small" />
                    ) : (
                      <>
                        <Text style={styles.actionIcon}>🗑️</Text>
                        <Text style={styles.actionText}>حذف</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              )}
              <View style={{ height: 40 }} />
            </>
          )}
        </ScrollView>

        {client?.c_img ? (
          <ImageViewer
            imageUri={`${BASE_URL}${client.c_img.url}`}
            visible={imageViewerVisible}
            onClose={() => setImageViewerVisible(false)}
          />
        ) : null}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // ... كل الـ styles زي ما هي

  // ✅ أضف ده
  disabledBtn: {
    opacity: 0.5,
  },

  // ... باقي الـ styles
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
  },
  overlayBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.85,
    backgroundColor: "#141428",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginBottom: 16,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    left: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeBtnText: { color: "rgba(255,255,255,0.6)", fontSize: 16 },
  imageSection: { alignItems: "center", marginBottom: 20, marginTop: 10 },
  sampleImage: {
    width: SCREEN_WIDTH - 80,
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  zoomHint: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  zoomHintText: { color: "#fff", fontSize: 11 },
  noImage: {
    width: SCREEN_WIDTH - 80,
    height: 160,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  noImageIcon: { fontSize: 40, opacity: 0.3, marginBottom: 8 },
  noImageText: { color: "rgba(255,255,255,0.2)", fontSize: 13 },
  nameSection: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 24,
  },
  clientName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "right",
  },
  idTag: {
    backgroundColor: "rgba(59,130,246,0.2)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.3)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  idTagText: { color: "#3b82f6", fontSize: 13, fontWeight: "bold" },
  infoGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap-reverse",
    gap: 10,
    marginBottom: 20,
  },
  infoCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
    alignItems: "flex-end",
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  blueBox: { backgroundColor: "rgba(59,130,246,0.2)" },
  purpleBox: { backgroundColor: "rgba(168,85,247,0.2)" },
  greenBox: { backgroundColor: "rgba(34,197,94,0.2)" },
  orangeBox: { backgroundColor: "rgba(249,115,22,0.2)" },
  infoIcon: { fontSize: 18 },
  infoLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    marginBottom: 4,
    textAlign: "right",
  },
  infoValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
  detailsSection: { marginBottom: 20, alignItems: "flex-end" },
  detailsTitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "right",
    alignSelf: "flex-end",
  },
  detailsBox: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 16,
    minHeight: 80,
    width: "100%",
  },
  detailsText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "right",
  },
  actionsRow: { flexDirection: "row-reverse", gap: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
  },
  editBtn: {
    backgroundColor: "rgba(59,130,246,0.15)",
    borderColor: "rgba(59,130,246,0.3)",
  },
  deleteBtn: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderColor: "rgba(239,68,68,0.3)",
  },
  actionIcon: { fontSize: 16 },
  actionText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
});
