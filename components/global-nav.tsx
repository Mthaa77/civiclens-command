import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, usePathname } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ITEMS = [
  { label: "Home", icon: "home-filled" as const, path: "/(tabs)" },
  { label: "Report", icon: "add-circle-outline" as const, path: "/(tabs)/report" },
  { label: "Learn", icon: "school" as const, path: "/(tabs)/learn" },
  { label: "Government", icon: "account-balance" as const, path: "/(tabs)/government" },
  { label: "Cases", icon: "folder-open" as const, path: "/(tabs)/cases" },
];

export function GlobalNav() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingBottom: Math.max(insets.bottom, 8), paddingHorizontal: 12 }}>
      <View style={{ height: 68, borderRadius: 24, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DCE4EC", flexDirection: "row", alignItems: "center", paddingHorizontal: 6, shadowColor: "#0D1F2D", shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: -5 }, elevation: 14 }}>
        {ITEMS.map((item) => {
          const active = item.path === "/(tabs)" ? pathname === "/" || pathname === "/(tabs)" : pathname === item.path || pathname.startsWith(item.path);
          return <Pressable key={item.label} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => router.push(item.path as never)} style={({ pressed }) => [{ flex: 1, height: 56, alignItems: "center", justifyContent: "center", borderRadius: 18, opacity: pressed ? 0.7 : 1 }, active && { backgroundColor: "#EAF2FF" }]}>
            <MaterialIcons name={item.icon} size={21} color={active ? "#1F5EFF" : "#718092"} />
            <Text style={{ marginTop: 3, fontSize: 9, fontWeight: "800", color: active ? "#1F5EFF" : "#718092" }}>{item.label}</Text>
          </Pressable>;
        })}
      </View>
    </View>
  );
}
