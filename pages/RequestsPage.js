import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
// ✅ استدعاء الـ function الجديدة
import { updateUserStatus } from "../services/api";

export default function RequestsPage({ data, refetchAuths }) {
  // ✅ نستخدم البيانات جاهزة من الـ prop
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (data.authData) {
      setRequests(data.authData);
    }
  }, [data.authData]);

  // ✅ Function موحد للتحديث
  const updateStatus = async (item, newStatus) => {
    try {
      // 1. نحدث في السيرفر
      await updateUserStatus(item.id, newStatus);

      // 2. نحدث محلياً في الـ State (عشان الـ UI يتغير فوراً)
      setRequests((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, u_status: newStatus } : r))
      );

      // 3. نحدث الـ Global Data (اختياري لكن مفيد)
      if (refetchAuths) refetchAuths();
    } catch (error) {
      Alert.alert("❌ خطأ", "حصلت مشكلة في التحديث");
    }
  };

  const handleApprove = (item) => {
    Alert.alert("تأكيد الموافقة", "هل أنت متأكد؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "موافقة",
        onPress: () => updateStatus(item, "active"),
      },
    ]);
  };

  const handleReject = (item) => {
    Alert.alert("تأكيد الرفض", "هل أنت متأكد؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "رفض",
        style: "destructive",
        onPress: () => updateStatus(item, "inactive"),
      },
    ]);
  };

  const handleReset = (item) => {
    Alert.alert("إعادة الطلب", "هل تريد إعادته للانتظار؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "إعادة",
        onPress: () => updateStatus(item, "pending"),
      },
    ]);
  };

  const pending = requests.filter((r) => r.u_status === "pending");
  const approved = requests.filter(
    (r) => r.u_status === "active" && r.e_mail !== data?.userData?.e_mail
  );
  const rejected = requests.filter((r) => r.u_status === "inactive");

  const renderRequest = (item) => (
    <View key={item.id} style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{item.f_name.charAt(0)}</Text>
        </View>
        <View style={styles.requestDetails}>
          <Text style={styles.requestName}>{item.f_name}</Text>
          <Text style={styles.requestPhone}>📞 {item.u_phone}</Text>
        </View>
      </View>
      {item.u_status === "pending" ? (
        <View style={styles.decisionRow}>
          <TouchableOpacity
            style={styles.approveBtn}
            onPress={() => handleApprove(item)} // ✅ نبعت الـ item كامل
          >
            <Text style={styles.approveBtnText}>✅ موافقة</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => handleReject(item)} // ✅
          >
            <Text style={styles.rejectBtnText}>❌ رفض</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={() => handleReset(item)} // ✅
        >
          <Text style={styles.resetBtnText}>🔄 إعادة للانتظار</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 إدارة الطلبات</Text>
      <View style={styles.statsRow}>
        <View style={[styles.statBox, styles.statPending]}>
          <Text style={styles.statNumber}>{pending.length}</Text>
          <Text style={styles.statLabel}>انتظار</Text>
        </View>
        <View style={[styles.statBox, styles.statApproved]}>
          <Text style={styles.statNumber}>{approved.length}</Text>
          <Text style={styles.statLabel}>موافق</Text>
        </View>
        <View style={[styles.statBox, styles.statRejected]}>
          <Text style={styles.statNumber}>{rejected.length}</Text>
          <Text style={styles.statLabel}>مرفوض</Text>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {pending.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>⏳ في الانتظار</Text>
            {pending.map(renderRequest)}
          </>
        )}
        {approved.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>✅ تمت الموافقة</Text>
            {approved.map(renderRequest)}
          </>
        )}
        {rejected.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>❌ مرفوضة</Text>
            {rejected.map(renderRequest)}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// Styles (مفيش تغيير)
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "right",
  },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  statPending: {
    backgroundColor: "rgba(249,115,22,0.1)",
    borderColor: "rgba(249,115,22,0.25)",
  },
  statApproved: {
    backgroundColor: "rgba(34,197,94,0.1)",
    borderColor: "rgba(34,197,94,0.25)",
  },
  statRejected: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderColor: "rgba(239,68,68,0.25)",
  },
  statNumber: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  statLabel: { color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 4 },
  scrollContent: { paddingBottom: 120 },
  sectionTitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 8,
    textAlign: "right",
  },
  requestCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  requestHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(59,130,246,0.2)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#3b82f6", fontSize: 18, fontWeight: "bold" },
  requestDetails: { flex: 1, alignItems: "flex-end" },
  requestName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
  requestPhone: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },
  decisionRow: { flexDirection: "row-reverse", gap: 10 },
  approveBtn: {
    flex: 1,
    backgroundColor: "rgba(34,197,94,0.15)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.3)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  approveBtnText: { color: "#22c55e", fontWeight: "bold", fontSize: 14 },
  rejectBtn: {
    flex: 1,
    backgroundColor: "rgba(239,68,68,0.15)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  rejectBtnText: { color: "#ef4444", fontWeight: "bold", fontSize: 14 },
  resetBtn: {
    backgroundColor: "rgba(59,130,246,0.15)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.3)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  resetBtnText: { color: "#3b82f6", fontWeight: "bold", fontSize: 14 },
});
