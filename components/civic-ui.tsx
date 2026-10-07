import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { ComponentProps, ReactNode } from "react";

import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

export type IconName = ComponentProps<typeof MaterialIcons>["name"];
export type StatusTone = "official" | "civic" | "community" | "warning" | "error" | "neutral";

const STATUS = {
  official: { bg: "#E8F7EE", text: "#176A3D", dot: "#237A4B" },
  civic: { bg: "#EAF2FF", text: "#1557C0", dot: "#1F5EFF" },
  community: { bg: "#FFF5D9", text: "#8A6100", dot: "#A96D00" },
  warning: { bg: "#FFF5D9", text: "#8A6100", dot: "#A96D00" },
  error: { bg: "#FDECEC", text: "#A83F3F", dot: "#C94E4E" },
  neutral: { bg: "#EEF2F3", text: "#5F6E79", dot: "#718092" },
} as const;

type ButtonProps = { label: string; icon?: IconName; onPress?: () => void; variant?: "primary" | "secondary" | "quiet"; compact?: boolean; disabled?: boolean };

export function CivicMark({ compact = false }: { compact?: boolean }) {
  return <View className={compact ? "h-9 w-9 items-center justify-center rounded-[14px] bg-primary" : "h-11 w-11 items-center justify-center rounded-[16px] bg-primary"} style={styles.markShadow}><MaterialIcons name="visibility" size={compact ? 18 : 22} color="#FFFFFF" /></View>;
}

export function CivicHero({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: ReactNode }) {
  return <View className="overflow-hidden rounded-[30px] bg-foreground px-5 py-6" style={styles.heroShadow}>
    <View pointerEvents="none" style={styles.heroGlow} />
    {eyebrow ? <Text style={{ fontFamily: "Inter_700Bold" }} className="mb-2 text-[10px] uppercase tracking-[1.8px] text-[#9DBEFF]">{eyebrow}</Text> : null}
    <Text style={{ fontFamily: "SpaceGrotesk_700Bold" }} className="max-w-[340px] text-[30px] leading-9 tracking-[-0.8px] text-white">{title}</Text>
    {detail ? <Text className="mt-3 max-w-[390px] text-sm leading-5 text-[#C9D5DF]">{detail}</Text> : null}
    {action ? <View className="mt-5">{action}</View> : null}
  </View>;
}

export function CivicContextBar({ municipality = "Tshwane", ward, updated = "Official profile" }: { municipality?: string; ward?: string; updated?: string }) {
  return <View className="flex-row items-center rounded-[18px] border border-border bg-surface px-3 py-2.5">
    <View className="h-8 w-8 items-center justify-center rounded-[11px] bg-[#EAF2FF]"><MaterialIcons name="location-city" size={17} color="#1F5EFF" /></View>
    <View className="ml-2 flex-1"><Text style={{ fontFamily: "Inter_700Bold" }} className="text-[11px] uppercase tracking-[0.8px] text-foreground">{municipality}{ward ? " · Ward " + ward : ""}</Text><Text className="mt-0.5 text-[10px] text-muted">{updated}</Text></View>
    <StatusPill label="OFFICIAL" tone="official" />
  </View>;
}

export function StatusPill({ label, tone = "neutral", compact = false }: { label: string; tone?: StatusTone; compact?: boolean }) {
  const s = STATUS[tone];
  return <View className={"self-start flex-row items-center rounded-full " + (compact ? "px-2 py-1" : "px-2.5 py-1.5")} style={{ backgroundColor: s.bg }}><View className={compact ? "mr-1.5 h-1.5 w-1.5 rounded-full" : "mr-1.5 h-2 w-2 rounded-full"} style={{ backgroundColor: s.dot }} /><Text style={{ color: s.text, fontFamily: "Inter_700Bold" }} className={compact ? "text-[9px] tracking-[0.5px]" : "text-[10px] tracking-[0.7px]"}>{label}</Text></View>;
}

export function SignalCard({ icon, title, detail, status, tone = "neutral", onPress }: { icon: IconName; title: string; detail?: string; status?: string; tone?: StatusTone; onPress?: () => void }) {
  const content = <View className="flex-row items-center rounded-[20px] border border-border bg-surface p-3.5"><IconTile icon={icon} color={STATUS[tone].dot} size="small" /><View className="ml-3 flex-1"><Text style={{ fontFamily: "Inter_700Bold" }} className="text-sm text-foreground">{title}</Text>{detail ? <Text className="mt-1 text-[11px] leading-4 text-muted">{detail}</Text> : null}</View>{status ? <StatusPill label={status} tone={tone} compact /> : null}{onPress ? <MaterialIcons name="chevron-right" size={20} color="#718092" /> : null}</View>;
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>{content}</Pressable> : content;
}

export function CivicMetric({ value, label, tone = "civic" }: { value: string | number; label: string; tone?: StatusTone }) {
  return <View className="min-w-[96px] flex-1 rounded-[20px] border border-border bg-surface p-4"><Text style={{ fontFamily: "SpaceGrotesk_700Bold", color: STATUS[tone].dot }} className="text-2xl tracking-[-0.5px]">{value}</Text><Text style={{ fontFamily: "Inter_700Bold" }} className="mt-1 text-[10px] uppercase tracking-[0.8px] text-muted">{label}</Text></View>;
}

export function CivicStepper({ steps, current = 0 }: { steps: string[]; current?: number }) {
  return <View className="flex-row items-center">{steps.map((step, index) => { const done = index < current; const active = index === current; return <View key={step} className="flex-1 flex-row items-center"><View className="items-center"><View className="h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: done || active ? "#1F5EFF" : "#E5EBEF" }}>{done ? <MaterialIcons name="check" size={15} color="#FFFFFF" /> : <Text style={{ fontFamily: "Inter_700Bold", color: active ? "#FFFFFF" : "#718092" }} className="text-[10px]">{index + 1}</Text>}</View><Text numberOfLines={1} style={{ fontFamily: "Inter_700Bold", color: active ? "#1F5EFF" : "#718092" }} className="mt-1.5 max-w-[72px] text-center text-[8px] uppercase tracking-[0.4px]">{step}</Text></View>{index < steps.length - 1 ? <View className="mx-1 mt-[-16px] h-px flex-1" style={{ backgroundColor: index < current ? "#1F5EFF" : "#DCE4EC" }} /> : null}</View>; })}</View>;
}

export function SourceDrawer({ title = "About this source", detail, source, onPress }: { title?: string; detail: string; source?: string; onPress?: () => void }) {
  return <View className="rounded-[20px] border border-border bg-[#F8FAFB] p-3.5"><View className="flex-row items-center"><MaterialIcons name="verified-user" size={17} color="#1F5EFF" /><Text style={{ fontFamily: "Inter_700Bold" }} className="ml-2 flex-1 text-xs text-foreground">{title}</Text>{source ? <StatusPill label="SOURCE" tone="civic" compact /> : null}</View><Text className="mt-2 text-[11px] leading-4 text-muted">{detail}</Text>{source && onPress ? <Pressable accessibilityRole="link" onPress={onPress} className="mt-2 flex-row items-center"><Text style={{ fontFamily: "Inter_700Bold" }} className="text-[11px] text-primary">{source}</Text><MaterialIcons name="open-in-new" size={14} color="#1F5EFF" style={{ marginLeft: 4 }} /></Pressable> : null}</View>;
}

export function ActionDock({ primary, secondary }: { primary: ReactNode; secondary?: ReactNode }) {
  return <View className="rounded-[22px] border border-border bg-surface p-3" style={styles.dockShadow}><View className="flex-row gap-2">{primary ? <View className="flex-1">{primary}</View> : null}{secondary ? <View className="flex-1">{secondary}</View> : null}</View></View>;
}

export function CivicToast({ icon = "info-outline", message, tone = "civic" }: { icon?: IconName; message: string; tone?: StatusTone }) {
  return <View className="flex-row items-center rounded-[18px] border border-border bg-surface px-3.5 py-3" style={styles.toastShadow}><IconTile icon={icon} color={STATUS[tone].dot} size="small" /><Text className="ml-3 flex-1 text-xs leading-4 text-foreground">{message}</Text></View>;
}

export function ActionButton({ label, icon, onPress, variant = "primary", compact = false, disabled = false }: ButtonProps) {
  const colors = useColors(); const textColor = variant === "primary" ? "#FFFFFF" : colors.foreground;
  return <Pressable disabled={disabled} onPress={onPress} accessibilityRole="button" accessibilityState={{ disabled }} style={({ pressed }) => [styles.pressable, pressed && !disabled && styles.pressed, disabled && styles.disabled]}><View className={variant === "primary" ? "flex-row items-center justify-center gap-2 rounded-[17px] bg-primary px-4 py-3" : variant === "secondary" ? "flex-row items-center justify-center gap-2 rounded-[17px] border border-border bg-surface px-4 py-3" : "flex-row items-center justify-center gap-2 rounded-[17px] px-3 py-2"} style={variant === "primary" ? styles.buttonShadow : undefined}>{icon ? <MaterialIcons name={icon} size={compact ? 17 : 18} color={textColor} /> : null}<Text style={{ color: textColor, fontFamily: compact ? "Inter_600SemiBold" : "Inter_700Bold" }} className={compact ? "text-xs" : "text-sm"}>{label}</Text></View></Pressable>;
}

export function Chip({ label, active = false, onPress, tone = "neutral" }: { label: string; active?: boolean; onPress?: () => void; tone?: "neutral" | "success" | "warning" | "info" | "community" }) {
  const colors = useColors(); const toneClass = tone === "success" ? "bg-[#E8F7EE]" : tone === "warning" ? "bg-[#FFF4D8]" : tone === "info" ? "bg-[#E9F2FF]" : tone === "community" ? "bg-[#FFF4D8]" : "bg-surface"; const toneText = tone === "success" ? colors.success : tone === "warning" || tone === "community" ? colors.warning : tone === "info" ? colors.primary : colors.muted;
  const body = <View className={active ? "rounded-full bg-primary px-3 py-2" : "rounded-full border border-border px-3 py-2 " + toneClass}><Text style={{ color: active ? "#FFFFFF" : toneText, fontFamily: "Inter_600SemiBold" }} className="text-xs">{label}</Text></View>;
  if (!onPress) return body; return <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => pressed && styles.pressed}>{body}</Pressable>;
}

export function SectionHeader({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) {
  return <View className="mb-4 flex-row items-end justify-between"><View className="flex-1">{eyebrow ? <Text style={{ fontFamily: "Inter_700Bold" }} className="mb-1 text-[10px] uppercase tracking-[1.6px] text-primary">{eyebrow}</Text> : null}<Text style={{ fontFamily: "SpaceGrotesk_700Bold" }} className="text-[22px] leading-7 tracking-[-0.4px] text-foreground">{title}</Text></View>{action ? <Pressable accessibilityRole="button" onPress={onAction} style={({ pressed }) => pressed && styles.pressed}><Text style={{ fontFamily: "Inter_700Bold" }} className="text-xs text-primary">{action}</Text></Pressable> : null}</View>;
}

export function SourceBadge({ label = "Official", tone = "official" }: { label?: string; tone?: "official" | "civic" | "community" | "needs" }) {
  const mapped: StatusTone = tone === "needs" ? "error" : tone; return <StatusPill label={label} tone={mapped} compact />;
}

export function CivicDataPulse({ compact = false }: { compact?: boolean }) {
  const { data, isLoading } = trpc.civic.status.useQuery(undefined, { staleTime: 60_000, retry: 1 }); const connected = data?.status === "connected"; const tone: StatusTone = isLoading ? "warning" : connected ? "official" : "error"; const label = compact ? (isLoading ? "Connecting" : connected ? "Connected" : "Offline") : (isLoading ? "Connecting civic data" : connected ? "Live civic data connected" : "Civic data needs attention");
  return <View className={compact ? "flex-row items-center gap-2" : "flex-row items-center gap-2 rounded-[18px] border border-border bg-surface px-3 py-2.5"}><View className={compact ? "h-2 w-2 rounded-full" : "h-2.5 w-2.5 rounded-full"} style={{ backgroundColor: STATUS[tone].dot }} />{isLoading ? <ActivityIndicator size="small" color={STATUS.warning.dot} /> : null}<Text style={{ fontFamily: "Inter_700Bold", color: STATUS[tone].text }} className={compact ? "text-[10px] uppercase tracking-[0.7px]" : "text-xs"}>{label}</Text>{!compact && data?.sources ? <Text className="ml-auto text-[10px] text-muted">{data.sources.filter((source) => source.status === "connected").length}/{data.sources.length} sources</Text> : null}</View>;
}

export function InfoCard({ children, className = "" }: { children: ReactNode; className?: string }) { return <View className={"rounded-[24px] border border-border bg-surface p-4 " + className} style={styles.cardShadow}>{children}</View>; }
export function IconTile({ icon, color = "#1F5EFF", size = "normal" }: { icon: IconName; color?: string; size?: "normal" | "small" }) { return <View className={size === "small" ? "h-9 w-9 items-center justify-center rounded-[13px]" : "h-11 w-11 items-center justify-center rounded-[15px]"} style={{ backgroundColor: color + "15", borderWidth: 1, borderColor: color + "22" }}><MaterialIcons name={icon} size={size === "small" ? 18 : 21} color={color} /></View>; }
export function EmptyState({ icon, title, detail, action }: { icon: IconName; title: string; detail: string; action?: ReactNode }) { return <View className="items-center rounded-[24px] border border-dashed border-border bg-surface px-6 py-10" style={styles.cardShadow}><IconTile icon={icon} /><Text style={{ fontFamily: "SpaceGrotesk_700Bold" }} className="mt-4 text-center text-lg text-foreground">{title}</Text><Text className="mt-2 text-center text-sm leading-5 text-muted">{detail}</Text>{action ? <View className="mt-5">{action}</View> : null}</View>; }
export function SyncBadge({ label = "Saved privately", tone = "success" }: { label?: string; tone?: "success" | "info" | "warning" }) { const colors = { success: "#237A4B", info: "#1769FF", warning: "#A96D00" } as const; return <View className="flex-row items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5"><View className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[tone] }} /><Text style={{ color: colors[tone], fontFamily: "Inter_700Bold" }} className="text-[10px] uppercase tracking-[0.7px]">{label}</Text></View>; }
export function TrustStrip({ compact = false }: { compact?: boolean }) { return <View className={compact ? "rounded-[18px] border border-[#D8E5F5] bg-[#F5F9FF] px-3 py-2.5" : "rounded-[22px] border border-[#D8E5F5] bg-[#F5F9FF] p-4"}><View className="flex-row items-center gap-2"><MaterialIcons name="verified-user" size={compact ? 15 : 18} color="#1769FF" /><Text className="flex-1 text-xs font-extrabold text-[#11243B]">Official-source-first civic information</Text></View>{!compact ? <Text className="mt-2 text-[11px] leading-4 text-[#5B7084]">Official records are labelled separately from CivicLens explanations and community signals.</Text> : null}</View>; }


export function KnownProblemPanel({
  loading,
  data,
  onOpenSource,
}: {
  loading: boolean;
  data?: {
    hasPotentialKnownProblem: boolean;
    checkedAt: string;
    knownProblems: Array<{ title: string; source: string; scope: string; confidence: string }>;
  };
  onOpenSource?: (url: string) => void;
}) {
  const hasMatch = Boolean(data?.hasPotentialKnownProblem);
  const tone: StatusTone = loading ? "warning" : hasMatch ? "warning" : data ? "official" : "error";
  const label = loading ? "CHECKING" : hasMatch ? "POSSIBLE MATCH" : data ? "NO MATCH" : "UNAVAILABLE";
  const title = loading
    ? "Checking official signals"
    : hasMatch
      ? "Something may already be on record"
      : data
        ? "No known problem matched"
        : "Official check unavailable";
  const detail = loading
    ? "CivicLens is checking connected official information before you create a duplicate report."
    : hasMatch
      ? "A connected official source contains information relevant to this service. That does not prove your exact street, property or building is affected."
      : data
        ? "No potential known problem was detected in the connected official sources at the time of this check."
        : "The source could not be verified right now. You can still report the problem and keep a CivicLens case.";
  return (
    <View className={hasMatch ? "overflow-hidden rounded-[28px] border border-[#E9D2AD] bg-[#FFF9F1]" : "overflow-hidden rounded-[28px] border border-border bg-surface"}>
      <View className="p-5">
        <View className="flex-row items-start">
          <View className={hasMatch ? "h-12 w-12 items-center justify-center rounded-[16px] bg-[#FFF0D5]" : "h-12 w-12 items-center justify-center rounded-[16px] bg-[#EAF2FF]"}>
            <MaterialIcons name={hasMatch ? "manage-search" : data ? "fact-check" : "cloud-off"} size={23} color={hasMatch ? "#A96D00" : data ? "#237A4B" : "#C94E4E"} />
          </View>
          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text style={{ fontFamily: "Inter_700Bold" }} className="flex-1 text-[10px] uppercase tracking-[1.1px] text-muted">Known-problem intelligence</Text>
              <StatusPill label={label} tone={tone} compact />
            </View>
            <Text style={{ fontFamily: "SpaceGrotesk_700Bold" }} className="mt-2 text-xl leading-6 tracking-[-0.3px] text-foreground">{title}</Text>
            <Text className="mt-2 text-[12px] leading-5 text-muted">{detail}</Text>
          </View>
        </View>

        {hasMatch && data?.knownProblems?.length ? (
          <View className="mt-4 gap-2">
            {data.knownProblems.slice(0, 3).map((problem) => (
              <Pressable key={problem.title} onPress={() => onOpenSource?.(problem.source)} accessibilityRole="link" className="rounded-[20px] border border-[#EAD7BD] bg-white/80 p-4">
                <View className="flex-row items-start">
                  <View className="flex-1">
                    <Text style={{ fontFamily: "Inter_700Bold" }} className="text-sm leading-5 text-foreground">{problem.title}</Text>
                    <Text className="mt-1.5 text-[11px] leading-4 text-muted">{problem.scope}</Text>
                  </View>
                  <MaterialIcons name="open-in-new" size={17} color="#A96D00" />
                </View>
                <View className="mt-3 flex-row items-center">
                  <StatusPill label="OFFICIAL" tone="official" compact />
                  <Text className="ml-2 text-[10px] font-semibold text-muted">{problem.confidence.replaceAll("_", " ")}</Text>
                  <Text className="ml-auto text-[10px] font-extrabold text-primary">View source →</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}

        {!loading && data ? (
          <View className="mt-4 flex-row items-center border-t border-border pt-3">
            <MaterialIcons name="schedule" size={14} color="#718092" />
            <Text className="ml-2 flex-1 text-[10px] leading-4 text-muted">Checked {new Date(data.checkedAt).toLocaleString("en-ZA")}</Text>
            <Text className="text-[10px] font-extrabold text-primary">Evidence, not certainty</Text>
          </View>
        ) : null}
      </View>

      {hasMatch ? (
        <View className="flex-row items-center border-t border-[#EAD7BD] bg-[#FFF3DF] px-5 py-3.5">
          <MaterialIcons name="info-outline" size={16} color="#A96D00" />
          <Text className="ml-2 flex-1 text-[10px] leading-4 text-[#765A2A]">If the official source does not cover your exact location, report it anyway.</Text>
        </View>
      ) : null}
    </View>
  );
}


export type CaseLifecycleStatus =
  | "draft"
  | "submitted"
  | "validated"
  | "routed"
  | "acknowledged"
  | "in_progress"
  | "awaiting_authority"
  | "awaiting_user"
  | "resolved"
  | "closed";

const CASE_LIFECYCLE: Array<{ key: CaseLifecycleStatus; label: string; detail: string; tone: StatusTone }> = [
  { key: "draft", label: "Draft", detail: "Prepared but not submitted", tone: "neutral" },
  { key: "submitted", label: "Submitted", detail: "Your report was saved by CivicLens", tone: "civic" },
  { key: "validated", label: "Validated", detail: "The case information was checked", tone: "civic" },
  { key: "routed", label: "Routed", detail: "The relevant channel was identified", tone: "civic" },
  { key: "acknowledged", label: "Acknowledged", detail: "The authority has acknowledged the report", tone: "official" },
  { key: "in_progress", label: "In progress", detail: "Work is recorded as underway", tone: "official" },
  { key: "awaiting_authority", label: "Awaiting authority", detail: "A response or action is pending", tone: "warning" },
  { key: "awaiting_user", label: "Awaiting you", detail: "You may need to provide the next input", tone: "warning" },
  { key: "resolved", label: "Resolved", detail: "The case is marked resolved", tone: "official" },
  { key: "closed", label: "Closed", detail: "The case lifecycle is complete", tone: "neutral" },
];

function normalizeCaseStatus(status?: string): CaseLifecycleStatus {
  const normalized = String(status ?? "submitted").trim().toLowerCase().replace(/\s+/g, "_");
  if (normalized === "government_reference_recorded") return "submitted";
  return CASE_LIFECYCLE.some((item) => item.key === normalized) ? normalized as CaseLifecycleStatus : "submitted";
}

export function CaseStatusRail({ status, compact = false }: { status?: string; compact?: boolean }) {
  const current = normalizeCaseStatus(status);
  const currentIndex = Math.max(0, CASE_LIFECYCLE.findIndex((item) => item.key === current));
  const visible = compact
    ? CASE_LIFECYCLE.filter((item) => ["submitted", "acknowledged", "in_progress", "awaiting_authority", "awaiting_user", "resolved", "closed"].includes(item.key))
    : CASE_LIFECYCLE;

  return (
    <View className={compact ? "rounded-[22px] border border-border bg-surface p-4" : "rounded-[26px] border border-border bg-surface p-5"} style={styles.cardShadow}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text style={{ fontFamily: "Inter_700Bold" }} className="text-[10px] uppercase tracking-[1.4px] text-primary">Case status</Text>
          <Text style={{ fontFamily: "SpaceGrotesk_700Bold" }} className="mt-1 text-xl tracking-[-0.3px] text-foreground">{CASE_LIFECYCLE[currentIndex]?.label ?? "Submitted"}</Text>
          <Text className="mt-1 text-[11px] leading-4 text-muted">{CASE_LIFECYCLE[currentIndex]?.detail}</Text>
        </View>
        <StatusPill label={(CASE_LIFECYCLE[currentIndex]?.key ?? "submitted").replaceAll("_", " ").toUpperCase()} tone={CASE_LIFECYCLE[currentIndex]?.tone ?? "civic"} compact />
      </View>
      <View className="mt-5">
        {visible.map((step, index) => {
          const actualIndex = CASE_LIFECYCLE.findIndex((item) => item.key === step.key);
          const done = actualIndex < currentIndex;
          const active = actualIndex === currentIndex;
          return (
            <View key={step.key} className="flex-row">
              <View className="mr-3 items-center">
                <View className={active ? "h-7 w-7 items-center justify-center rounded-full bg-primary" : done ? "h-7 w-7 items-center justify-center rounded-full bg-[#E8F7EE]" : "h-7 w-7 items-center justify-center rounded-full bg-[#EEF2F3]"} >
                  <MaterialIcons name={done ? "check" : active ? "radio-button-checked" : "radio-button-unchecked"} size={active ? 16 : 15} color={active ? "#FFFFFF" : done ? "#237A4B" : "#8A97A3"} />
                </View>
                {index < visible.length - 1 ? <View className="my-1 w-px flex-1" style={{ backgroundColor: done ? "#B7DCC8" : "#DCE4EC" }} /> : null}
              </View>
              <View className="flex-1 pb-4">
                <View className="flex-row items-center">
                  <Text style={{ fontFamily: "Inter_700Bold" }} className={active ? "text-sm text-primary" : done ? "text-sm text-foreground" : "text-sm text-muted"}>{step.label}</Text>
                  {active ? <View className="ml-2"><StatusPill label="CURRENT" tone={step.tone} compact /></View> : null}
                </View>
                {!compact && <Text className="mt-1 text-[10px] leading-4 text-muted">{step.detail}</Text>}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function StatusLegend() {
  return (
    <View className="rounded-[20px] border border-border bg-[#F8FAFB] px-4 py-3">
      <Text style={{ fontFamily: "Inter_700Bold" }} className="text-[10px] uppercase tracking-[1.2px] text-muted">Status language</Text>
      <View className="mt-3 flex-row flex-wrap gap-2">
        <StatusPill label="OFFICIAL" tone="official" compact />
        <StatusPill label="CIVICLENS" tone="civic" compact />
        <StatusPill label="WAITING" tone="warning" compact />
        <StatusPill label="ERROR / UNKNOWN" tone="error" compact />
      </View>
      <Text className="mt-2 text-[10px] leading-4 text-muted">A CivicLens status never implies government acknowledgement unless the official record supports it.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pressable: { borderRadius: 17 }, pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  cardShadow: { shadowColor: "#10202B", shadowOpacity: 0.055, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 2 },
  heroShadow: { shadowColor: "#0D1F2D", shadowOpacity: 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 5 },
  dockShadow: { shadowColor: "#0D1F2D", shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  toastShadow: { shadowColor: "#0D1F2D", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  disabled: { opacity: 0.5 }, buttonShadow: { shadowColor: "#1F5EFF", shadowOpacity: 0.22, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  markShadow: { shadowColor: "#1F5EFF", shadowOpacity: 0.26, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  heroGlow: { position: "absolute", right: -80, top: -100, width: 230, height: 230, borderRadius: 115, backgroundColor: "rgba(31,94,255,0.28)" },
});