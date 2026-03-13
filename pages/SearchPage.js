import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import ClientsTable from "../components/ClientsTable";

export default function SearchPage({
  clients,
  onEditClient,
  data,
  refetchClients,
}) {
  const [searchText, setSearchText] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const dropdownOpacity = useRef(new Animated.Value(0)).current;

  const options = [
    { key: "name", label: "اسم العميل", icon: "👤" },
    { key: "id", label: "الرقم التسلسلي", icon: "🔢" },
  ];

  const toggleDropdown = () => {
    if (dropdownOpen) {
      Animated.parallel([
        Animated.timing(dropdownHeight, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(dropdownOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start(() => setDropdownOpen(false));
    } else {
      setDropdownOpen(true);
      Animated.parallel([
        Animated.spring(dropdownHeight, {
          toValue: options.length * 50,
          useNativeDriver: false,
          friction: 8,
        }),
        Animated.timing(dropdownOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const selectOption = (key) => {
    setSearchBy(key);
    setSearchText("");
    Animated.parallel([
      Animated.timing(dropdownHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(dropdownOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start(() => setDropdownOpen(false));
  };

  const currentOption = options.find((o) => o.key === searchBy);

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>🔍 البحث</Text>
      <View style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={
              searchBy === "name"
                ? "ابحث باسم العميل..."
                : "ابحث بالرقم التسلسلي..."
            }
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={searchText}
            onChangeText={setSearchText}
            keyboardType={searchBy === "id" ? "numeric" : "default"}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText("")}>
              <Text style={styles.clearBtn}>✕</Text>
            </Pressable>
          )}
        </View>
        <Pressable style={styles.dropdownBtn} onPress={toggleDropdown}>
          <Text style={styles.dropdownBtnIcon}>{currentOption.icon}</Text>
          <Text style={styles.dropdownBtnArrow}>
            {dropdownOpen ? "▲" : "▼"}
          </Text>
        </Pressable>
      </View>

      {dropdownOpen && (
        <Animated.View
          style={[
            styles.dropdownMenu,
            { height: dropdownHeight, opacity: dropdownOpacity },
          ]}
        >
          {options.map((option) => {
            const isSelected = option.key === searchBy;
            return (
              <Pressable
                key={option.key}
                style={[
                  styles.dropdownItem,
                  isSelected && styles.dropdownItemActive,
                ]}
                onPress={() => selectOption(option.key)}
              >
                <Text style={styles.dropdownItemIcon}>{option.icon}</Text>
                <Text
                  style={[
                    styles.dropdownItemText,
                    isSelected && styles.dropdownItemTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>
            );
          })}
        </Animated.View>
      )}

      <ClientsTable
        clients={clients}
        searchText={searchText}
        searchBy={searchBy}
        onEditClient={onEditClient}
        data={data}
        refetchClients={refetchClients}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  pageTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
    zIndex: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, color: "#fff", fontSize: 15 },
  clearBtn: { color: "rgba(255,255,255,0.4)", fontSize: 18, padding: 4 },
  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.25)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.4)",
    borderRadius: 16,
    width: 65,
    height: 50,
    gap: 4,
  },
  dropdownBtnIcon: { fontSize: 18 },
  dropdownBtnArrow: { color: "rgba(255,255,255,0.6)", fontSize: 10 },
  dropdownMenu: {
    position: "absolute",
    top: 130,
    right: 20,
    width: 200,
    backgroundColor: "rgba(30,30,60,0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    overflow: "hidden",
    zIndex: 100,
    elevation: 20,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  dropdownItemActive: { backgroundColor: "rgba(59,130,246,0.15)" },
  dropdownItemIcon: { fontSize: 16, marginRight: 12 },
  dropdownItemText: { flex: 1, color: "rgba(255,255,255,0.7)", fontSize: 14 },
  dropdownItemTextActive: { color: "#fff", fontWeight: "bold" },
  checkmark: { color: "#3b82f6", fontSize: 16, fontWeight: "bold" },
});
