import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import { ActionButton, CivicContextBar, CivicMetric, SectionHeader, StatusPill, TrustStrip } from "@/components/civic-ui";
import { ScreenContainer } from "@/components/screen-container";
import { fetchCivicCheckHistory, fetchLatestCivicCheck, type CivicCheckLatest, type CivicCheckRun } from "@/lib/civic-check-client";
import { useCivic } from "@/lib/civic-store";

const SERVICES = [
  { id: "water", label: "Water", icon: "water-drop" as const },
  { id: "electricity", label: "Electricity", icon: "bolt" as const },
  { id: "roads", label: "Roads", icon: "alt-route" as const },
  { id: "refuse", label: "Refuse", icon: "delete-sweep" as const },
];

function timeLabel(value: string | null | undefined) {
  if (!value) return "Waiting for first run";
  return new Date(value).toLocaleString("en-ZA", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
}

function statusTone(status: string) {
  if (status === "completed") return "official" as const;
  if (status === "degraded") return "warning" as const;
  return "neutral" as const;
}

export default function CivicPulseScreen() {
  const { selectedLocation } = useCivic();
  const [latest, setLatest] = useState<CivicCheckLatest>();
  const [history, setHistory] = useState<CivicCheckRun[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const [nextLatest, nextHistory] = await Promise.all([fetchLatestCivicCheck(), fetchCivicCheckHistory()]);
    setLatest(nextLatest);
    setHistory(nextHistory?.runs ?? []);
  };

  useEffect(() => { load(); }, []);

  const healthy = useMemo(
    () => latest?.results.filter((result) => result.source_reachable === 1).length ?? 0,
    [latest],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 145 }}
      >
        <View className="pt-4 pb-6">
          <CivicContextBar municipality={selectedLocation.name} ward={selectedLocation.wardNumber} updated="Hourly intelligence" />
          <View className="mt-5 flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-[10px] font-extrabold uppercase tracking-[1.8px] text-primary">Civic Pulse</Text>
              <Text className="mt-1 font-display text-3xl font-extrabold leading-9 tracking-[-0.8px] text-foreground">The civic situation, checked hourly.</Text>
              <Text className="mt-3 text-sm leading-5 text-muted">CivicLens checks connected official service sources every hour and records what was reachable, what changed, and what still needs verification.</Text>
            </View>
            <View className="ml-3 h-12 w-12 items-center justify-center rounded-[17px] bg-foreground">
              <MaterialIcons name="sync" size={23} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <View className="rounded-[28px] bg-foreground p-5">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#AFC0CD]">Latest scheduled check</Text>
              <Text className="mt-1 font-display text-2xl font-extrabold text-white">{timeLabel(latest?.run?.completed_at ?? latest?.run?.started_at)}</Text>
            </View>
            <StatusPill label={latest?.run ? latest.run.status.toUpperCase() : "WAITING"} tone={statusTone(latest?.run?.status ?? "waiting")} compact />
          </View>
          <View className="mt-5 flex-row gap-3">
            <CivicMetric label="Sources healthy" value={String(healthy)} hint="of 4 services" />
            <CivicMetric label="Notices found" value={String(latest?.results.reduce((sum, result) => sum + result.notice_count, 0) ?? 0)} hint="in latest check" />
          </View>
        </View>

        <View className="mt-8">
          <SectionHeader eyebrow="Hourly checks" title="What CivicLens is watching" />
          <View className="mt-4 gap-3">
            {SERVICES.map((service) => {
              const result = latest?.results.find((item) => item.service === service.id);
              const reachable = result?.source_reachable === 1;
              return (
                <View key={service.id} className="rounded-[22px] border border-border bg-surface p-4">
                  <View className="flex-row items-center">
                    <View className="h-11 w-11 items-center justify-center rounded-[15px] bg-[#EAF2FF]">
                      <MaterialIcons name={service.icon} size={22} color="#1F5EFF" />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="font-display text-base font-extrabold text-foreground">{service.label}</Text>
                      <Text className="mt-1 text-xs text-muted">
                        {result ? `${result.notice_count} official notice${result.notice_count === 1 ? "" : "s"} found` : "No hourly result yet"}
                      </Text>
                    </View>
                    <StatusPill label={reachable ? "CONNECTED" : result ? "DEGRADED" : "PENDING"} tone={reachable ? "official" : result ? "warning" : "neutral"} compact />
                  </View>
                  {result?.planned_summary ? (
                    <Text className="mt-3 border-t border-border pt-3 text-xs leading-4 text-muted">{result.planned_summary}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        <View className="mt-8">
          <SectionHeader eyebrow="Run history" title="Last 24 hourly checks" />
          <View className="mt-4 rounded-[24px] border border-border bg-surface overflow-hidden">
            {history.length === 0 ? (
              <View className="p-5">
                <Text className="font-display text-base font-extrabold text-foreground">The first scheduled run is pending.</Text>
                <Text className="mt-2 text-sm leading-5 text-muted">Cron is configured for minute 00 of every hour. The first result will appear after the next scheduled execution.</Text>
              </View>
            ) : history.map((run, index) => (
              <View key={run.id} className="border-b border-border px-4 py-4" style={{ borderBottomWidth: index === history.length - 1 ? 0 : 1 }}>
                <View className="flex-row items-center">
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-[#EAF2FF]">
                    <MaterialIcons name="schedule" size={18} color="#1F5EFF" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-bold text-foreground">{timeLabel(run.started_at)}</Text>
                    <Text className="mt-1 text-xs text-muted">{run.services_ok}/{run.services_checked} sources healthy</Text>
                  </View>
                  <StatusPill label={run.status.toUpperCase()} tone={statusTone(run.status)} compact />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-8">
          <TrustStrip items={["OFFICIAL SOURCES", "HOURLY CHECKS", "NO ASSUMED OUTAGES"]} />
        </View>

        <View className="mt-5">
          <ActionButton label="Back to Civic OS" icon="arrow-back" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
