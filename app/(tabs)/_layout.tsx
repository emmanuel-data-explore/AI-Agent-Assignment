import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
export default function TabLayout() {
  const colors = useColors(); const insets = useSafeAreaInsets(); const bottom = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarButton: HapticTab, tabBarStyle: { height: 64 + bottom, paddingBottom: bottom, paddingTop: 8, backgroundColor: colors.background, borderTopColor: colors.border } }}>
    <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} /> }} />
    <Tabs.Screen name="subjects" options={{ title: "Subjects", tabBarIcon: ({ color }) => <IconSymbol size={24} name="book.fill" color={color} /> }} />
    <Tabs.Screen name="tasks" options={{ title: "Tasks", tabBarIcon: ({ color }) => <IconSymbol size={24} name="checkmark.circle.fill" color={color} /> }} />
    <Tabs.Screen name="timer" options={{ title: "Timer", tabBarIcon: ({ color }) => <IconSymbol size={24} name="timer" color={color} /> }} />
    <Tabs.Screen name="progress" options={{ title: "Progress", tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart.bar.fill" color={color} /> }} />
  </Tabs>;
}
