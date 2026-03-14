import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import ClientDetails from "./ClientDetails";
import { BASE_URL } from "../services/api";

const H_MARGIN = 24;

export default function ClientsTable({
  clients,
  searchText,
  searchBy,
  onEditClient,
  data,
}) {
  const [selectedClient, setSelectedClient] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const filtered = clients.filter((client) => {
    if (!searchText) return true;
    if (searchBy === "name") return client.c_name.includes(searchText);
    return String(client.id).includes(searchText);
  });

  const openDetails = (client) => {
    setSelectedClient(client);
    setDetailsVisible(true);
  };

  const closeDetails = () => {
    setDetailsVisible(false);
  };

  return (
    <View style={styles.tableContainer}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.colId]}>م</Text>
        <Text style={[styles.headerCell, styles.colName]}>اسم العميل</Text>
        <Text style={[styles.headerCell, styles.colSize]}>المقاس</Text>
        <Text style={[styles.headerCell, styles.colSample]}>العينة</Text>
      </View>

      <ScrollView
        style={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length > 0 ? (
          filtered.map((client, index) => (
            <Pressable
              key={client.id}
              style={[
                styles.row,
                index % 2 === 0 ? styles.rowEven : styles.rowOdd,
              ]}
              onPress={() => openDetails(client)}
            >
              <View style={styles.colId}>
                <View style={styles.idBadge}>
                  <Text style={styles.idText}>{client.id}</Text>
                </View>
              </View>
              <View style={styles.colName}>
                <Text style={styles.nameText} numberOfLines={1}>
                  {client.c_name}
                </Text>
              </View>
              <View style={styles.colSize}>
                <View style={styles.sizeBadge}>
                  <Text style={styles.sizeText}>
                    {client.c_size || "غير معرف"}
                  </Text>
                </View>
              </View>
              <View style={styles.colSample}>
                {client.c_img ? (
                  <Image
                    source={{
                      uri: `${BASE_URL}/factoryhub/upload/${client.c_img}`,
                    }}
                    style={styles.sampleImg}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.noImage}>
                    <Text style={styles.noImageText}>📷</Text>
                  </View>
                )}
              </View>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>مفيش نتائج</Text>
            <Text style={styles.emptyHint}>جرب كلمة بحث تانية</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {filtered.length} عميل {searchText ? `من ${clients.length}` : ""}
        </Text>
      </View>

      <ClientDetails
        client={selectedClient}
        visible={detailsVisible}
        onClose={closeDetails}
        onEdit={onEditClient}
        data={data}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tableContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    direction: "rtl",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59,130,246,0.15)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(59,130,246,0.2)",
    height: 45,
    paddingHorizontal: 8,
  },
  headerCell: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  colId: {
    width: 45,
    minWidth: 45,
    maxWidth: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  colName: { flex: 1, paddingHorizontal: 8, justifyContent: "center" },
  colSize: {
    width: 70,
    minWidth: 70,
    maxWidth: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  colSample: {
    width: 55,
    minWidth: 55,
    maxWidth: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollBody: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 60,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  rowEven: { backgroundColor: "rgba(255,255,255,0.02)" },
  rowOdd: { backgroundColor: "rgba(255,255,255,0.05)" },
  idBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(59,130,246,0.15)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  idText: { color: "#3b82f6", fontSize: 12, fontWeight: "bold" },
  nameText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  sizeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(168,85,247,0.15)",
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.25)",
  },
  sizeText: {
    color: "#a855f7",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  sampleImg: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  noImage: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: { fontSize: 18, opacity: 0.4 },
  emptyState: { padding: 40, alignItems: "center" },
  emptyIcon: { fontSize: 40, marginBottom: 12, opacity: 0.3 },
  emptyText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  emptyHint: { color: "rgba(255,255,255,0.2)", fontSize: 12 },
  footer: {
    height: 35,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  footerText: { color: "rgba(255,255,255,0.3)", fontSize: 11 },
});
