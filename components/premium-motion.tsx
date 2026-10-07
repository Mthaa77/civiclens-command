import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Easing, Pressable, View } from "react-native";

export function Reveal({ children, delay = 0, distance = 16 }: { children: ReactNode; delay?: number; distance?: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.timing(progress, { toValue: 1, duration: 560, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [delay, progress]);
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] });
  return <Animated.View style={{ opacity: progress, transform: [{ translateY }, { scale }] }}>{children}</Animated.View>;
}

export function MotionPressable({ children, onPress, style }: { children: ReactNode; onPress?: () => void; style?: any }) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = (toValue: number) => Animated.spring(scale, { toValue, useNativeDriver: true, speed: 32, bounciness: 3 }).start();
  return <Pressable onPress={onPress} onPressIn={() => press(0.982)} onPressOut={() => press(1)} accessibilityRole="button"><Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View></Pressable>;
}

export function OrbitBackdrop() {
  const drift = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(drift, { toValue: 1, duration: 14000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [drift]);
  const translateX = drift.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-16, 14, -16] });
  const translateY = drift.interpolate({ inputRange: [0, 0.5, 1], outputRange: [8, -12, 8] });
  const rotate = drift.interpolate({ inputRange: [0, 0.5, 1], outputRange: ["-4deg", "4deg", "-4deg"] });
  return (
    <Animated.View pointerEvents="none" style={{ position: "absolute", right: -82, top: -108, width: 270, height: 270, transform: [{ translateX }, { translateY }, { rotate }] }}>
      {[0, 1, 2, 3].map((ring) => (
        <View key={ring} style={{ position: "absolute", inset: ring * 25, borderRadius: 150, borderWidth: 1, borderColor: "rgba(157,190,255," + (0.26 - ring * 0.045) + ")" }} />
      ))}
      <View style={{ position: "absolute", width: 94, height: 94, right: 72, top: 78, borderRadius: 50, backgroundColor: "rgba(31,94,255,0.18)" }} />
      <View style={{ position: "absolute", width: 7, height: 7, right: 39, top: 74, borderRadius: 5, backgroundColor: "#9DBEFF" }} />
    </Animated.View>
  );
}

export function LiveRibbon({ label = "CIVIC PULSE", detail = "Official-source signals" }: { label?: string; detail?: string }) {
  const pulse = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.45, duration: 1100, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return <View style={{ height: 38, borderRadius: 19, borderWidth: 1, borderColor: "#DDE6E4", backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 12 }}>
    <Animated.View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#237A4B", opacity: pulse }} />
    <View style={{ marginLeft: 8, flex: 1 }}><Animated.Text style={{ fontSize: 9, fontWeight: "800", letterSpacing: 1, color: "#176A3D" }}>{label}</Animated.Text></View>
    <Animated.Text style={{ fontSize: 9, color: "#718092" }}>{detail}</Animated.Text>
  </View>;
}

export function SignalBeacon({ active = true }: { active?: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(scale, { toValue: 1.18, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [active, scale]);
  return <Animated.View style={{ width: 10, height: 10, borderRadius: 6, backgroundColor: "#237A4B", transform: [{ scale }], shadowColor: "#237A4B", shadowOpacity: 0.35, shadowRadius: 8, elevation: 2 }} />;
}
