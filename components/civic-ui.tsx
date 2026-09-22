import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ComponentProps, ReactNode } from "react";

import { useColors } from "@/hooks/use-colors";

export type IconName = ComponentProps<typeof MaterialIcons>["name"];

type ButtonProps = {
  label: string;
  icon?: IconName;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "quiet";
  compact?: boolean;
};

export function CivicMark({ compact = false }: { compact?: boolean }) {
  return (
    <View className={compact ? "h-9 w-9 items-center justify-center rounded-2xl bg-primary" : "h-11 w-11 items-center justify-center rounded-2xl bg-primary"}>
      <MaterialIcons name="visibility" size={compact ? 18 : 22} color="#FFFFFF" />
    </View>
  );
}

export function ActionButton({ label, icon, onPress, variant = "primary", compact = false }: ButtonProps) {
  const colors = useColors();
  const textColor = variant === "primary" ? "#FFFFFF" : colors.foreground;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
      <View className={variant === "primary" ? "flex-row items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3" : variant === "secondary" ? "flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3" : "flex-row items-center justify-center gap-2 rounded-2xl px-3 py-2"}>
        {icon ? <MaterialIcons name={icon} size={compact ? 17 : 18} color={textColor} /> : null}
        <Text style={{ color: textColor }} className={compact ? "text-xs font-bold" : "text-sm font-bold"}>{label}</Text>
      </View>
    </Pressable>
  );
}

export function Chip({ label, active = false, onPress, tone = "neutral" }: { label: string; active?: boolean; onPress?: () => void; tone?: "neutral" | "success" | "warning" | "info" | "community" }) {
  const colors = useColors();
  const toneClass = tone === "success" ? "bg-[#E8F7EE]" : tone === "warning" ? "bg-[#FFF4D8]" : tone === "info" ? "bg-[#E9F2FF]" : tone === "community" ? "bg-[#FFF4D8]" : "bg-surface";
  const toneText = tone === "success" ? colors.success : tone === "warning" || tone === "community" ? colors.warning : tone === "info" ? colors.primary : colors.muted;
  const body = <View className={active ? "rounded-full bg-primary px-3 py-2" : `rounded-full border border-border px-3 py-2 ${toneClass}`}><Text style={{ color: active ? "#FFFFFF" : toneText }} className="text-xs font-bold">{label}</Text></View>;
  if (!onPress) return body;
  return <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>{body}</Pressable>;
}

export function SectionHeader({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) {
  return (
    <View className="mb-3 flex-row items-end justify-between">
      <View className="flex-1">
        {eyebrow ? <Text className="mb-1 text-[11px] font-extrabold uppercase tracking-[1.5px] text-primary">{eyebrow}</Text> : null}
        <Text className="text-xl font-extrabold leading-7 text-foreground">{title}</Text>
      </View>
      {action ? <Pressable onPress={onAction} style={({ pressed }) => pressed && styles.pressed}><Text className="text-xs font-bold text-primary">{action}</Text></Pressable> : null}
    </View>
  );
}

export function SourceBadge({ label = "Official", tone = "official" }: { label?: string; tone?: "official" | "civic" | "community" | "needs" }) {
  const bg = tone === "official" ? "bg-[#E8F7EE]" : tone === "civic" ? "bg-[#E9F2FF]" : tone === "community" ? "bg-[#FFF4D8]" : "bg-[#FDECEC]";
  const color = tone === "official" ? "#1C7A43" : tone === "civic" ? "#1769FF" : tone === "community" ? "#9A6B00" : "#B84444";
  return <View className={`self-start flex-row items-center gap-1 rounded-full px-2.5 py-1 ${bg}`}><View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} /><Text style={{ color }} className="text-[10px] font-extrabold uppercase tracking-[0.6px]">{label}</Text></View>;
}

export function InfoCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <View className={`rounded-3xl border border-border bg-surface p-4 ${className}`}>{children}</View>;
}

export function IconTile({ icon, color = "#1769FF", size = "normal" }: { icon: IconName; color?: string; size?: "normal" | "small" }) {
  return <View className={size === "small" ? "h-9 w-9 items-center justify-center rounded-2xl" : "h-11 w-11 items-center justify-center rounded-2xl"} style={{ backgroundColor: `${color}18` }}><MaterialIcons name={icon} size={size === "small" ? 18 : 21} color={color} /></View>;
}

export function EmptyState({ icon, title, detail, action }: { icon: IconName; title: string; detail: string; action?: ReactNode }) {
  return <View className="items-center rounded-3xl border border-dashed border-border bg-surface px-6 py-10"><IconTile icon={icon} /><Text className="mt-4 text-center text-lg font-extrabold text-foreground">{title}</Text><Text className="mt-2 text-center text-sm leading-5 text-muted">{detail}</Text>{action ? <View className="mt-5">{action}</View> : null}</View>;
}

const styles = StyleSheet.create({
  pressable: { borderRadius: 16 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
