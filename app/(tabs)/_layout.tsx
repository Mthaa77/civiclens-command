import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarButton: HapticTab,
        tabBarStyle: { height: 68 + bottomPadding, paddingTop: 8, paddingBottom: bottomPadding, paddingHorizontal: 8, backgroundColor: "#FFFFFF", borderTopColor: "#DCE4EC", borderTopWidth: 0.5, shadowColor: "#0D1F2D", shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: -6 }, elevation: 10 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700", marginTop: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <MaterialIcons name="home-filled" color={color} size={size} /> }} />
      <Tabs.Screen name="report" options={{ title: "Report", tabBarIcon: ({ color, size }) => <MaterialIcons name="add-circle-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="government" options={{ title: "My govt", tabBarIcon: ({ color, size }) => <MaterialIcons name="account-balance" color={color} size={size} /> }} />
      <Tabs.Screen name="community" options={{ title: "Community", tabBarIcon: ({ color, size }) => <MaterialIcons name="map" color={color} size={size} /> }} />
      <Tabs.Screen name="cases" options={{ title: "My cases", tabBarIcon: ({ color, size }) => <MaterialIcons name="folder-open" color={color} size={size} /> }} />
      <Tabs.Screen name="learn" options={{ href: null, title: "Learn", tabBarIcon: ({ color, size }) => <MaterialIcons name="menu-book" color={color} size={size} /> }} />
    </Tabs>
  );
}
