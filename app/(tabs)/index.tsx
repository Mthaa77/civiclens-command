import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import {
  ActionButton,
  CivicContextBar,
  CivicDataPulse,
  CivicMetric,
  IconTile,
  SectionHeader,
  SignalCard,
  SourceBadge,
  StatusPill,
  TrustStrip,
} from "@/components/civic-ui";
import { LiveRibbon, MotionPressable, OrbitBackdrop, Reveal, SignalBeacon } from "@/components/premium-motion";
import { ScreenContainer } from "@/components/screen-container";
import { issueCategories } from "@/lib/civic-data";
import { serviceStateLabel } from "@/lib/service-intelligence";
import { useCivic } from "@/lib/civic-store";
import { trpc } from "@/lib/trpc";

export default function HomeScreen() {
  const { cases, selectedLocation } = useCivic();
  const pulse = trpc.civic.servicePulse.useQuery(undefined, { staleTime: 60_000, retry: 1 });
  const openCases = cases.filter((item) => !["Resolved", "Closed"].includes(item.status)).length;
  const latestCase = cases[0];
  const feeds = pulse.data?.feeds ?? [];
  const connectedSources = pulse.data?.sourceChecks.filter((source) => source.connected).length ?? 0;
  const go = (path: string) => router.push(path as never);

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 132 }}>
        <Reveal>
          <View className="flex-row items-center justify-between py-4">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-[15px] bg-primary" style={{ shadowColor: "#1F5EFF", shadowOpacity: 0.24, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4 }}>
                <MaterialIcons name="visibility" size={19} color="#FFFFFF" />
              </View>
              <View>
                <Text className="font-display text-lg font-extrabold tracking-tight text-foreground">CivicLens</Text>
                <Text className="text-[9px] font-bold uppercase tracking-[1.5px] text-muted">Your civic command centre</Text>
              </View>
            </View>
            <CivicDataPulse compact />
          </View>
        </Reveal>

        <Reveal delay={70}>
          <CivicContextBar municipality={selectedLocation.name} ward={selectedLocation.wardNumber} updated="Official location profile" />
        </Reveal>

        <Reveal delay={130}>
          <View className="mt-3"><LiveRibbon /></View>
        </Reveal>

        <Reveal delay={190}>
          <View className="mt-3 overflow-hidden rounded-[32px] bg-foreground px-5 py-6" style={{ shadowColor: "#0D1F2D", shadowOpacity: 0.17, shadowRadius: 28, shadowOffset: { width: 0, height: 14 }, elevation: 6 }}>
            <OrbitBackdrop />
            <View className="relative z-10">
              <Text className="mb-2 text-[10px] font-extrabold uppercase tracking-[1.9px] text-[#9DBEFF]">CIVIC COMMAND CENTRE</Text>
              <Text className="max-w-[350px] font-display text-[31px] font-extrabold leading-9 tracking-[-1px] text-white">Something wrong in your community?</Text>
              <Text className="mt-3 max-w-[390px] text-sm leading-5 text-[#C9D5DF]">Start with the problem. CivicLens helps you understand who is likely responsible, check official signals and choose a documented next step.</Text>

              <View className="mt-5 flex-row gap-2">
                <View className="flex-1"><ActionButton label="I have a problem" icon="add-circle-outline" onPress={() => go("/civic-os")} /></View>
                <View className="flex-1"><ActionButton label="My cases" icon="folder-open" variant="secondary" onPress={() => go("/(tabs)/cases")} /></View>
              </View>

              <View className="mt-5 flex-row items-center gap-2">
                <View className="h-7 w-7 items-center justify-center rounded-full bg-white/10"><SignalBeacon /></View>
                <Text className="flex-1 text-[10px] leading-4 text-[#AFC0CD]">Official sources first · no assumed outages · your case stays private</Text>
              </View>
            </View>
          </View>
        </Reveal>

        <Reveal delay={260}>
          <View className="mt-3 flex-row gap-2">
            <CivicMetric value={openCases} label="Open cases" tone={openCases ? "warning" : "official"} />
            <CivicMetric value={pulse.isLoading ? "—" : `${connectedSources}/3`} label="Sources live" tone={connectedSources === 3 ? "official" : "warning"} />
            <CivicMetric value={feeds.length || 4} label="Service areas" tone="civic" />
          </View>
        </Reveal>

        <Reveal delay={330}>
          <View className="mt-8">
            <View className="mb-3 flex-row items-center"><View className="h-1.5 w-1.5 rounded-full bg-primary" /><Text className="ml-2 text-[10px] font-extrabold uppercase tracking-[1.6px] text-primary">Start with what you can see</Text><Text className="ml-auto text-[10px] text-muted">Swipe →</Text></View>
            <SectionHeader eyebrow="Fast route" title="What is happening?" action="See all" onAction={() => go("/civic-os")} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 20 }}>
              {issueCategories.slice(0, 7).map((item, index) => (
                <MotionPressable
                  key={item.id}
                  onPress={() => go(`/civic-os?issue=${encodeURIComponent(item.id)}`)}
                  style={{ width: index === 0 ? 164 : 142 }}
                >
                  <View className="min-h-[126px] overflow-hidden rounded-[24px] border border-border bg-surface p-4" style={{ shadowColor: item.accent, shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { width: 0, height: 7 }, elevation: 2 }}>
                    <View className="flex-row items-center justify-between">
                      <IconTile icon={item.icon} color={item.accent} size="small" />
                      <MaterialIcons name="arrow-forward" size={16} color="#9AA6B2" />
                    </View>
                    <Text className="mt-4 text-[13px] font-extrabold leading-4 text-foreground">{item.label}</Text>
                    <Text className="mt-1 text-[10px] leading-3.5 text-muted" numberOfLines={2}>{item.hint}</Text>
                  </View>
                </MotionPressable>
              ))}
            </ScrollView>
          </View>
        </Reveal>

        <Reveal delay={390}>
          <View className="mt-8">
            <View className="mb-4 flex-row items-end justify-between">
              <View className="flex-1">
                <Text className="mb-1 text-[10px] font-extrabold uppercase tracking-[1.6px] text-primary">Live civic picture</Text>
                <Text className="font-display text-[23px] font-extrabold leading-7 tracking-[-0.5px] text-foreground">What do the sources say?</Text>
              </View>
              <MotionPressable onPress={() => go("/intelligence")}>
                <View className="rounded-full bg-[#EAF2FF] px-3 py-2"><Text className="text-[10px] font-extrabold text-primary">OPEN PULSE</Text></View>
              </MotionPressable>
            </View>

            <MotionPressable onPress={() => go("/intelligence")}>
              <View className="overflow-hidden rounded-[26px] border border-[#D8E5F5] bg-[#F5F9FF] p-4">
                <View className="flex-row items-center">
                  <View className="h-11 w-11 items-center justify-center rounded-[15px] bg-[#DCE9FF]"><MaterialIcons name="radar" size={22} color="#1F5EFF" /></View>
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-extrabold text-foreground">Connected civic signals</Text>
                    <Text className="mt-1 text-[11px] leading-4 text-muted">
                      {pulse.isLoading ? "Checking connected sources…" : pulse.data?.sourceReachable ? "Official service information is reachable. Ward-level impact still needs verification." : "The municipal service source could not be verified right now."}
                    </Text>
                  </View>
                  <StatusPill label={pulse.isLoading ? "CHECKING" : pulse.data?.sourceReachable ? "VERIFIED" : "UNAVAILABLE"} tone={pulse.isLoading ? "warning" : pulse.data?.sourceReachable ? "official" : "error"} compact />
                </View>
              </View>
            </MotionPressable>

            <View className="mt-2.5 gap-2">
              {feeds.slice(0, 3).map((feed) => (
                <MotionPressable key={feed.id} onPress={() => go("/intelligence")}>
                  <SignalCard
                    icon={feed.icon}
                    title={feed.label}
                    detail={feed.headline}
                    status={serviceStateLabel(feed.state)}
                    tone={feed.state === "unknown" ? "error" : feed.state === "stable" ? "official" : "warning"}
                  />
                </MotionPressable>
              ))}
            </View>

            {!feeds.length && !pulse.isLoading ? (
              <View className="mt-2.5 rounded-[22px] border border-dashed border-border bg-surface p-4">
                <Text className="text-sm font-extrabold text-foreground">No live service signal yet</Text>
                <Text className="mt-1 text-xs leading-4 text-muted">You can still report a problem or retry the connected sources from Civic Intelligence.</Text>
              </View>
            ) : null}
          </View>
        </Reveal>

        <Reveal delay={450}>
          <View className="mt-8">
            <SectionHeader eyebrow="Your civic record" title="Keep the thread" action="View cases" onAction={() => go("/(tabs)/cases")} />
            {latestCase ? (
              <MotionPressable onPress={() => go(`/case/${latestCase.id}`)}>
                <View className="overflow-hidden rounded-[26px] border border-border bg-surface p-4" style={{ shadowColor: "#10202B", shadowOpacity: 0.06, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 2 }}>
                  <View className="flex-row items-start">
                    <IconTile icon="folder-open" color="#1F5EFF" />
                    <View className="ml-3 flex-1">
                      <View className="flex-row items-start justify-between gap-2">
                        <Text className="flex-1 text-sm font-extrabold text-foreground">{latestCase.title}</Text>
                        <StatusPill label={latestCase.status === "Follow-up due" ? "FOLLOW-UP" : latestCase.status.toUpperCase()} tone={latestCase.statusTone === "success" ? "official" : "warning"} compact />
                      </View>
                      <Text className="mt-2 text-xs text-muted">{latestCase.municipality} · {latestCase.ward}</Text>
                      <View className="mt-3 flex-row items-center gap-2">
                        <SourceBadge label={latestCase.visibility === "Private" ? "PRIVATE" : "COMMUNITY"} tone={latestCase.visibility === "Private" ? "civic" : "community"} />
                        <Text className="text-[10px] text-muted">{latestCase.evidenceCount} evidence item{latestCase.evidenceCount === 1 ? "" : "s"}</Text>
                        <Text className="ml-auto text-[10px] font-extrabold text-primary">Open case →</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </MotionPressable>
            ) : (
              <MotionPressable onPress={() => go("/civic-os")}>
                <View className="rounded-[26px] border border-dashed border-border bg-surface p-5">
                  <View className="flex-row items-center">
                    <View className="h-11 w-11 items-center justify-center rounded-[15px] bg-[#EAF2FF]"><MaterialIcons name="history-edu" size={21} color="#1F5EFF" /></View>
                    <View className="ml-3 flex-1"><Text className="text-base font-extrabold text-foreground">Your civic record starts here.</Text><Text className="mt-1 text-[11px] leading-4 text-muted">Report once, keep the thread and return when you need to follow up.</Text></View>
                    <MaterialIcons name="arrow-forward" size={19} color="#1F5EFF" />
                  </View>
                </View>
              </MotionPressable>
            )}
          </View>
        </Reveal>

        <Reveal delay={510}>
          <View className="mt-8">
            <SectionHeader eyebrow="Know before you act" title="Government, explained simply" action="Learn" onAction={() => go("/(tabs)/learn")} />
            <MotionPressable onPress={() => go("/(tabs)/learn")}>
              <View className="overflow-hidden rounded-[28px] border border-border bg-surface p-5">
                <View className="flex-row items-start">
                  <View className="flex-1">
                    <SourceBadge label="CIVICLENS EXPLAINER" tone="civic" />
                    <Text className="mt-3 font-display text-xl font-extrabold leading-6 text-foreground">Who is actually responsible for this?</Text>
                    <Text className="mt-2 text-sm leading-5 text-muted">Understand the difference between a municipality, ward councillor, province and national government before you escalate.</Text>
                  </View>
                  <View className="ml-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF2FF]"><MaterialIcons name="school" size={23} color="#1F5EFF" /></View>
                </View>
                <View className="mt-4 flex-row items-center"><Text className="text-xs font-extrabold text-primary">Learn → act</Text><View className="ml-3 h-px flex-1 bg-[#DDE6E4]" /><Text className="text-[10px] text-muted">Plain language</Text></View>
              </View>
            </MotionPressable>
          </View>
        </Reveal>

        <Reveal delay={570}>
          <View className="mt-8">
            <TrustStrip />
            <View className="mt-3 rounded-[22px] border border-border bg-surface p-4">
              <View className="flex-row items-center">
                <MaterialIcons name="verified-user" size={19} color="#237A4B" />
                <Text className="ml-2 flex-1 text-xs font-extrabold text-foreground">Evidence before certainty</Text>
                <StatusPill label="SOURCE-AWARE" tone="official" compact />
              </View>
              <Text className="mt-2 text-[11px] leading-4 text-muted">CivicLens distinguishes official records, CivicLens explanations, community signals and information that still needs verification.</Text>
            </View>
          </View>
        </Reveal>
      </ScrollView>
    </ScreenContainer>
  );
}
