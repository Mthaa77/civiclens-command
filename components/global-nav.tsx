import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, usePathname } from "expo-router";
import { Animated, Pressable, Text, View } from "react-native";
import { useEffect, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ITEMS = [
  { label: "Home", icon: "home-filled" as const, path: "/(tabs)" },
  { label: "Report", icon: "add-circle-outline" as const, path: "/(tabs)/report" },
  { label: "Learn", icon: "school" as const, path: "/(tabs)/learn" },
  { label: "Government", icon: "account-balance" as const, path: "/(tabs)/government" },
  { label: "Cases", icon: "folder-open" as const, path: "/(tabs)/cases" },
];

function NavItem({ item, active, onPress }: { item: (typeof ITEMS)[number]; active: boolean; onPress: () => void }) {
  const progress = useRef(new Animated.Value(active ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(progress, { toValue: active ? 1 : 0, useNativeDriver: true, speed: 22, bounciness: 4 }).start();
  }, [active, progress]);
  const backgroundOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] });
  return (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={onPress} style={{ flex: 1, height: 58, alignItems: "center", justifyContent: "center", borderRadius: 18 }}>
      <Animated.View style={{ position: "absolute", inset: 2, borderRadius: 17, backgroundColor: "#EAF2FF", opacity: backgroundOpacity }} />
      <Animated.View style={{ alignItems: "center", transform: [{ scale }] }}>
        <MaterialIcons name={item.icon} size={21} color={active ? "#1F5EFF" : "#718092"} />
        <Text style={{ marginTop: 3, fontSize: 9, fontWeight: "800", color: active ? "#1557C0" : "#718092" }}>{item.label}</Text>
      </Animated.View>
    </Pressable>
  );
}

export function GlobalNav() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingBottom: Math.max(insets.bottom, 8), paddingHorizontal: 12 }}>
      <View style={{ height: 70, borderRadius: 25, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DDE6E4", flexDirection: "row", alignItems: "center", paddingHorizontal: 6, shadowColor: "#0D1F2D", shadowOpacity: 0.13, shadowRadius: 22, shadowOffset: { width: 0, height: -6 }, elevation: 14 }}>
        {ITEMS.map((item) => {
          const active = item.path === "/(tabs)" ? pathname === "/" || pathname === "/(tabs)" : pathname === item.path || pathname.startsWith(item.path);
          return <NavItem key={item.label} item={item} active={active} onPress={() => router.push(item.path as never)} />;
        })}
      </View>
    </View>
  );
}
