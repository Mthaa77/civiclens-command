import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Easing, Pressable, View } from "react-native";

export function Reveal({ children, delay = 0, distance = 18 }: { children: ReactNode; delay?: number; distance?: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 650,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [delay, progress]);
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] });
  return <Animated.View style={{ opacity: progress, transform: [{ translateY }] }}>{children}</Animated.View>;
}

export function MotionPressable({
  children,
  onPress,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: any;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = (toValue: number) => Animated.spring(scale, { toValue, useNativeDriver: true, speed: 28, bounciness: 5 }).start();
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => press(0.975)}
      onPressOut={() => press(1)}
      accessibilityRole="button"
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

export function OrbitBackdrop() {
  const drift = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(drift, {
        toValue: 1,
        duration: 12000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ).start();
  }, [drift]);
  const translateX = drift.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-18, 16, -18] });
  const translateY = drift.interpolate({ inputRange: [0, 0.5, 1], outputRange: [10, -14, 10] });
  return (
    <Animated.View pointerEvents="none" style={{ position: "absolute", right: -74, top: -94, width: 245, height: 245, transform: [{ translateX }, { translateY }] }}>
      <View style={{ position: "absolute", inset: 0, borderRadius: 130, borderWidth: 1, borderColor: "rgba(157,190,255,0.30)" }} />
      <View style={{ position: "absolute", inset: 24, borderRadius: 110, borderWidth: 1, borderColor: "rgba(157,190,255,0.22)" }} />
      <View style={{ position: "absolute", inset: 50, borderRadius: 90, borderWidth: 1, borderColor: "rgba(157,190,255,0.16)" }} />
      <View style={{ position: "absolute", width: 88, height: 88, right: 62, top: 58, borderRadius: 50, backgroundColor: "rgba(31,94,255,0.20)" }} />
    </Animated.View>
  );
}

export function LiveRibbon({ label = "CIVIC PULSE", detail = "Official-source signals" }: { label?: string; detail?: string }) {
  const pulse = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 900, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);
  return (
    <View style={{ height: 38, borderRadius: 19, borderWidth: 1, borderColor: "#DDE6E4", backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 12 }}>
      <Animated.View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#237A4B", opacity: pulse }} />
      <View style={{ marginLeft: 8, flex: 1 }}>
        <Animated.Text style={{ fontSize: 9, fontWeight: "800", letterSpacing: 1, color: "#176A3D" }}>{label}</Animated.Text>
      </View>
      <Animated.Text style={{ fontSize: 9, color: "#718092" }}>{detail}</Animated.Text>
    </View>
  );
}
