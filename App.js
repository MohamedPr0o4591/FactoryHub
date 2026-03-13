// App.js
import React, { useState, useEffect } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import * as SplashScreenExpo from "expo-splash-screen";
import * as NavigationBar from "expo-navigation-bar";
import SplashScreen from "./pages/SplashScreen";
import SearchPage from "./pages/SearchPage";
import AddScreen from "./pages/AddScreen";
import EditScreen from "./pages/EditScreen";
import ProfilePage from "./pages/ProfilePage";
import RequestsPage from "./pages/RequestsPage";
import ChangePasswordPage from "./components/ChangePasswordPage";
import BottomBar from "./components/BottomBar";
import AuthScreen from "./pages/AuthScreen";
import ForgotPasswordScreen from "./pages/ForgotPasswordScreen";
import { BASE_URL, getAuths, getClients } from "./services/api";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
    </QueryClientProvider>
  );
}

function MainApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("search");
  const [editingClient, setEditingClient] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [userData, setUserData] = useState(null);

  // ✅ React Query - جلب المستخدمين
  const { data: authData, refetch: refetchAuths } = useQuery({
    queryKey: ["auths"],
    queryFn: getAuths,
  });

  // ✅ React Query - جلب العملاء
  const { data: clientsData, refetch: refetchClients } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  // ✅ استخدم clientsData مباشرة من React Query
  const clients = clientsData || [];

  // ✅ الـ data object اللي بنبعته لكل الصفحات
  const data = {
    authData: authData || [],
    userData,
    setUserData,
    api: BASE_URL,
    clientsData: clients,
    refetchAuths,
    refetchClients,
  };

  useEffect(() => {
    setup();
    loadUser();
  }, []);

  const setup = async () => {
    try {
      await SplashScreenExpo.hideAsync();
    } catch (e) {}
    try {
      await NavigationBar.setVisibilityAsync("hidden");
    } catch (e) {}
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setPage("search");
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setUser(null);
    setIsLoggedIn(false);
    setShowForgotPassword(false);
  };

  const loadUser = async () => {
    const email = await AsyncStorage.getItem("userEmail");
    const password = await AsyncStorage.getItem("userPassword");
    const user = await AsyncStorage.getItem("userData");

    if (email && password && user) {
      const parsedUser = JSON.parse(user);
      setUserData(parsedUser);
      handleLogin(parsedUser);
    }
  };

  if (isLoading) {
    return <SplashScreen onFinish={() => setIsLoading(false)} />;
  }

  if (showForgotPassword) {
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <ForgotPasswordScreen
          onBack={() => setShowForgotPassword(false)}
          data={data}
        />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <AuthScreen
          data={data}
          onLogin={handleLogin}
          setShowForgotPassword={setShowForgotPassword}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      {page === "search" && (
        <SearchPage
          clients={clients}
          onEditClient={(c) => {
            setEditingClient(c);
            setPage("edit");
          }}
          data={data}
        />
      )}

      {page === "add" && (
        <AddScreen
          onAdd={async () => {
            await refetchClients();
            setPage("search");
          }}
          onCancel={() => setPage("search")}
          data={data}
        />
      )}

      {page === "edit" && (
        <EditScreen
          client={editingClient}
          onSave={async () => {
            await refetchClients();
            setEditingClient(null);
            setPage("search");
          }}
          onDelete={async () => {
            await refetchClients();
            setEditingClient(null);
            setPage("search");
          }}
          onCancel={() => {
            setEditingClient(null);
            setPage("search");
          }}
          data={data}
        />
      )}

      {page === "profile" && (
        <ProfilePage
          data={data}
          user={user}
          onOpenRequests={() => setPage("requests")}
          onOpenChangePassword={() => setPage("change-password")}
          onLogout={handleLogout}
          refetchAuths={refetchAuths}
        />
      )}

      {page === "requests" && (
        <RequestsPage data={data} refetchAuths={refetchAuths} />
      )}

      {page === "change-password" && (
        <ChangePasswordPage data={data} onLogout={handleLogout} />
      )}

      <BottomBar current={page} onNavigate={setPage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1020" },
});
