import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { ComponentProps, ReactNode } from "react";

import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

export type IconName = ComponentProps<typeof MaterialIcons>["name"];

type ButtonProps = {
  label: string;
  icon?: IconName;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "quiet";
  compact?: boolean;
  disabled?: boolean;
};

export function CivicMark({ compact = false }: { compact?: boolean }) {
  return (
    <View className={compact ? "h-9 w-9 items-center justify-center rounded-[14px] bg-primary" : "h-11 w-11 items-center justify-center rounded-[16px] bg-primary"} style={styles.markShadow}>
      <MaterialIcons name="visibility" size={compact ? 18 : 22} color="#FFFFFF" />
    </View>
  );
}

export function ActionButton({ label, icon, onPress, variant = "primary", compact = false, disabled = false }: ButtonProps) {
  const colors = useColors();
  const textColor = variant === "primary" ? "#FFFFFF" : colors.foreground;
  return (
    <Pressable disabled={disabled} onPress={onPress} accessibilityRole="button" accessibilityState={{ disabled }} style={({ pressed }) => [styles.pressable, pressed && !disabled && styles.pressed, disabled && styles.disabled]}>
      <View className={variant === "primary" ? "flex-row items-center justify-center gap-2 rounded-[16px] bg-primary px-4 py-3" : variant === "secondary" ? "flex-row items-center justify-center gap-2 rounded-[16px] border border-border bg-surface px-4 py-3" : "flex-row items-center justify-center gap-2 rounded-[16px] px-3 py-2"} style={variant === "primary" ? styles.buttonShadow : undefined}>
        {icon ? <MaterialIcons name={icon} size={compact ? 17 : 18} color={textColor} /> : null}
        <Text style={{ color: textColor, fontFamily: compact ? "Inter_600SemiBold" : "Inter_700Bold" }} className={compact ? "text-xs" : "text-sm"}>{label}</Text>
      </View>
    </Pressable>
  );
}

export function Chip({ label, active = false, onPress, tone = "neutral" }: { label: string; active?: boolean; onPress?: () => void; tone?: "neutral" | "success" | "warning" | "info" | "community" }) {
  const colors = useColors();
  const toneClass = tone === "success" ? "bg-[#E8F7EE]" : tone === "warning" ? "bg-[#FFF4D8]" : tone === "info" ? "bg-[#E9F2FF]" : tone === "community" ? "bg-[#FFF4D8]" : "bg-surface";
  const toneText = tone === "success" ? colors.success : tone === "warning" || tone === "community" ? colors.warning : tone === "info" ? colors.primary : colors.muted;
  const body = <View className={active ? "rounded-full bg-primary px-3 py-2" : `rounded-full border border-border px-3 py-2 ${toneClass}`}><Text style={{ color: active ? "#FFFFFF" : toneText, fontFamily: "Inter_600SemiBold" }} className="text-xs">{label}</Text></View>;
  if (!onPress) return body;
  return <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>{body}</Pressable>;
}

export function SectionHeader({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) {
  return (
    <View className="mb-4 flex-row items-end justify-between">
      <View className="flex-1">
        {eyebrow ? <Text style={{ fontFamily: "Inter_700Bold" }} className="mb-1 text-[10px] uppercase tracking-[1.6px] text-primary">{eyebrow}</Text> : null}
        <Text style={{ fontFamily: "SpaceGrotesk_700Bold" }} className="text-[22px] leading-7 tracking-[-0.4px] text-foreground">{title}</Text>
      </View>
      {action ? <Pressable onPress={onAction} style={({ pressed }) => pressed && styles.pressed}><Text style={{ fontFamily: "Inter_700Bold" }} className="text-xs text-primary">{action}</Text></Pressable> : null}
    </View>
  );
}

export function SourceBadge({ label = "Official", tone = "official" }: { label?: string; tone?: "official" | "civic" | "community" | "needs" }) {
  const bg = tone === "official" ? "bg-[#E8F7EE]" : tone === "civic" ? "bg-[#E9F2FF]" : tone === "community" ? "bg-[#FFF4D8]" : "bg-[#FDECEC]";
  const color = tone === "official" ? "#1C7A43" : tone === "civic" ? "#1769FF" : tone === "community" ? "#9A6B00" : "#B84444";
  return <View className={`self-start flex-row items-center gap-1 rounded-full px-2.5 py-1 ${bg}`}><View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} /><Text style={{ color, fontFamily: "Inter_700Bold" }} className="text-[10px] uppercase tracking-[0.6px]">{label}</Text></View>;
}

export function CivicDataPulse({ compact = false }: { compact?: boolean }) {
  const { data, isLoading } = trpc.civic.status.useQuery(undefined, { staleTime: 60_000, retry: 1 });
  const connected = data?.status === "connected";
  const label = compact ? (isLoading ? "Connecting" : connected ? "Connected" : "Offline") : (isLoading ? "Connecting civic data" : connected ? "Live civic data connected" : "Civic data needs attention");
  return <View className={compact ? "flex-row items-center gap-2" : "flex-row items-center gap-2 rounded-2xl border border-[#CDE9D7] bg-[#F1F9F3] px-3 py-2.5"}><View className={compact ? "h-2 w-2 rounded-full" : "h-2.5 w-2.5 rounded-full"} style={{ backgroundColor: isLoading ? "#A96D00" : connected ? "#237A4B" : "#C94E4E" }} />{isLoading ? <ActivityIndicator size="small" color="#A96D00" /> : null}<Text style={{ fontFamily: "Inter_700Bold", color: connected ? "#237A4B" : isLoading ? "#A96D00" : "#C94E4E" }} className={compact ? "text-[10px] uppercase tracking-[0.7px]" : "text-xs"}>{label}</Text>{!compact && data?.sources ? <Text className="ml-auto text-[10px] text-muted">{data.sources.filter((source) => source.status === "connected").length}/{data.sources.length} sources</Text> : null}</View>;
}

export function InfoCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <View className={`rounded-[24px] border border-border bg-surface p-4 ${className}`} style={styles.cardShadow}>{children}</View>;
}

export function IconTile({ icon, color = "#1F5EFF", size = "normal" }: { icon: IconName; color?: string; size?: "normal" | "small" }) {
  return <View className={size === "small" ? "h-9 w-9 items-center justify-center rounded-[13px]" : "h-11 w-11 items-center justify-center rounded-[15px]"} style={{ backgroundColor: `${color}15`, borderWidth: 1, borderColor: `${color}22` }}><MaterialIcons name={icon} size={size === "small" ? 18 : 21} color={color} /></View>;
}

export function EmptyState({ icon, title, detail, action }: { icon: IconName; title: string; detail: string; action?: ReactNode }) {
  return <View className="items-center rounded-[24px] border border-dashed border-border bg-surface px-6 py-10" style={styles.cardShadow}><IconTile icon={icon} /><Text style={{ fontFamily: "SpaceGrotesk_700Bold" }} className="mt-4 text-center text-lg text-foreground">{title}</Text><Text className="mt-2 text-center text-sm leading-5 text-muted">{detail}</Text>{action ? <View className="mt-5">{action}</View> : null}</View>;
}

export function SyncBadge({ label = "Saved privately", tone = "success" }: { label?: string; tone?: "success" | "info" | "warning" }) {
  const colors = { success: "#237A4B", info: "#1769FF", warning: "#A96D00" } as const;
  return <View className="flex-row items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5"><View className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[tone] }} /><Text style={{ color: colors[tone], fontFamily: "Inter_700Bold" }} className="text-[10px] uppercase tracking-[0.7px]">{label}</Text></View>;
}

export function TrustStrip({ compact = false }: { compact?: boolean }) {
  return <View className={compact ? "rounded-2xl border border-[#D8E5F5] bg-[#F5F9FF] px-3 py-2.5" : "rounded-[22px] border border-[#D8E5F5] bg-[#F5F9FF] p-4"}><View className="flex-row items-center gap-2"><MaterialIcons name="verified-user" size={compact ? 15 : 18} color="#1769FF" /><Text className="flex-1 text-xs font-extrabold text-[#11243B]">Official-source-first civic information</Text></View>{!compact ? <Text className="mt-2 text-[11px] leading-4 text-[#5B7084]">Official records are labelled separately from CivicLens explanations and community signals.</Text> : null}</View>;
}

const styles = StyleSheet.create({
  pressable: { borderRadius: 16 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  cardShadow: { shadowColor: "#0D1F2D", shadowOpacity: 0.06, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 2 },
  disabled: { opacity: 0.5 },
  buttonShadow: { shadowColor: "#1F5EFF", shadowOpacity: 0.22, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  markShadow: { shadowColor: "#1F5EFF", shadowOpacity: 0.26, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
});
