import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Location from "expo-location";
import { useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, Text, View } from "react-native";

import { useCivic } from "@/lib/civic-store";
import { resolveGpsToWard } from "@/lib/official-directory";

export function GpsLocationButton({ compact = false }: { compact?: boolean }) {
  const { setSelectedLocation } = useCivic();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const detect = async () => {
    setLoading(true);
    setMessage(null);
    try {
      if (Platform.OS === "web" && typeof navigator !== "undefined" && !navigator.geolocation) {
        throw new Error("This browser does not support location services.");
      }
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) throw new Error("Location services are turned off. Turn them on, then try again.");
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") throw new Error("CivicLens needs foreground location access only while you use this feature.");
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const match = await resolveGpsToWard(current.coords.latitude, current.coords.longitude);
      if (!match) {
        setMessage("Your point is outside the published MDB 2026 ward coverage. Choose a municipality manually instead.");
        return;
      }
      setSelectedLocation(match.municipality);
      setMessage(`Detected ${match.municipality.name} · Ward ${match.ward.number}`);
    } catch (error) {
      const text = error instanceof Error ? error.message : "We could not determine your civic area right now.";
      setMessage(text);
      if (Platform.OS !== "web") Alert.alert("Location not available", text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Pressable onPress={detect} disabled={loading} style={({ pressed }) => [pressed && { opacity: 0.72 }, loading && { opacity: 0.6 }]}>
        <View className={compact ? "flex-row items-center gap-2 rounded-full border border-[#CFE0FF] bg-[#F4F8FF] px-3 py-2" : "flex-row items-center gap-3 rounded-2xl border border-[#CFE0FF] bg-[#F4F8FF] p-4"}>
          <View className={compact ? "h-7 w-7 items-center justify-center rounded-full bg-[#DCE9FF]" : "h-10 w-10 items-center justify-center rounded-[14px] bg-[#DCE9FF]"}>{loading ? <ActivityIndicator size="small" color="#1F5EFF" /> : <MaterialIcons name="my-location" size={compact ? 16 : 20} color="#1F5EFF" />}</View>
          <View className="flex-1"><Text className={compact ? "text-xs font-extrabold text-primary" : "text-sm font-extrabold text-primary"}>{loading ? "Finding your civic area…" : "Use my current location"}</Text>{!compact ? <Text className="mt-1 text-xs leading-4 text-muted">Foreground location only. Your exact coordinates are not saved.</Text> : null}</View>
          {!loading && !compact ? <MaterialIcons name="arrow-forward" size={18} color="#1F5EFF" /> : null}
        </View>
      </Pressable>
      {message ? <View className="mt-2 rounded-xl bg-[#F4F8FF] px-3 py-2"><Text className="text-xs leading-4 text-[#35506C]">{message}</Text></View> : null}
    </View>
  );
}
