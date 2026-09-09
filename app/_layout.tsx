import "../global.css";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, createTRPCClient } from "@/lib/trpc";
import { ThemeProvider } from "@/lib/theme-provider";
import { StudyProvider } from "@/lib/study-store";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

function AuthGate() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "login" || segments[0] === "oauth";
    if (!isAuthenticated && !inAuth) router.replace("/login");
  }, [loading, isAuthenticated, segments]);
  return <Stack screenOptions={{ headerShown: false }}><Stack.Screen name="login" /><Stack.Screen name="(tabs)" /><Stack.Screen name="oauth/callback" /></Stack>;
}
export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => createTRPCClient());
  return <ThemeProvider><SafeAreaProvider><GestureHandlerRootView style={{ flex: 1 }}><trpc.Provider client={trpcClient} queryClient={queryClient}><QueryClientProvider client={queryClient}><StudyProvider><AuthGate /></StudyProvider></QueryClientProvider></trpc.Provider><StatusBar style="auto" /></GestureHandlerRootView></SafeAreaProvider></ThemeProvider>;
}
