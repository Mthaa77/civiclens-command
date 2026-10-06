import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import {
  ActionButton,
  CivicContextBar,
  CivicDataPulse,
  CivicHero,
  CivicMetric,
  IconTile,
  SectionHeader,
  SignalCard,
  SourceBadge,
  StatusPill,
  TrustStrip,
} from "@/components/civic-ui";
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
  const ward = selectedLocation.wardNumber ? `Ward ${selectedLocation.wardNumber}` : undefined;
  const go = (path: string) => router.push(path as never);

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 132 }}>
        <View className="flex-row items-center justify-between py-4">
          <View className="flex-row items-center gap-3">
            <View className="h-9 w-9 items-center justify-center rounded-[14px] bg-primary">
              <MaterialIcons name="visibility" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text className="font-display text-lg font-extrabold tracking-tight text-foreground">CivicLens</Text>
              <Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted">Your civic command centre</Text>
            </View>
          </View>
          <CivicDataPulse compact />
        </View>

        <CivicContextBar municipality={selectedLocation.name} ward={selectedLocation.wardNumber} updated="Official location profile" />

        <View className="mt-4">
          <CivicHero
            eyebrow="Start here"
            title="What do you need help with?"
            detail="Tell CivicLens what is wrong. We’ll help you understand the likely responsibility, check available official signals, and choose the next documented step."
            action={
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <ActionButton label="I have a problem" icon="add-circle-outline" onPress={() => go("/civic-os")} />
                </View>
                <View className="flex-1">
                  <ActionButton label="My cases" icon="folder-open" variant="secondary" onPress={() => go("/(tabs)/cases")} />
                </View>
              </View>
            }
          />
        </View>

        <View className="mt-4 flex-row gap-2">
          <CivicMetric value={openCases} label="Open cases" tone={openCases ? "warning" : "official"} />
          <CivicMetric value={`${connectedSources}/3`} label="Sources live" tone={connectedSources === 3 ? "official" : "warning"} />
          <CivicMetric value={feeds.length || 4} label="Service areas" tone="civic" />
        </View>

        <View className="mt-8">
          <SectionHeader eyebrow="Choose a starting point" title="Common problems" action="See all" onAction={() => go("/civic-os")} />
          <View className="flex-row flex-wrap gap-2.5">
            {issueCategories.slice(0, 6).map((item) => (
              <Pressable
                key={item.id}
                onPress={() => go(`/civic-os?issue=${encodeURIComponent(item.id)}`)}
                accessibilityRole="button"
                style={({ pressed }) => [{ width: "31.8%" }, pressed && { opacity: 0.72, transform: [{ scale: 0.985 }] }]}
              >
                <View className="min-h-[108px] rounded-[22px] border border-border bg-surface p-3.5">
                  <IconTile icon={item.icon} color={item.accent} size="small" />
                  <Text className="mt-3 text-xs font-extrabold leading-4 text-foreground">{item.label}</Text>
                  <Text className="mt-1 text-[10px] leading-3.5 text-muted" numberOfLines={2}>{item.hint}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-8">
          <View className="mb-4 flex-row items-end justify-between">
            <View className="flex-1">
              <Text className="mb-1 text-[10px] font-extrabold uppercase tracking-[1.6px] text-primary">Civic situation</Text>
              <Text className="font-display text-[22px] font-extrabold leading-7 tracking-[-0.4px] text-foreground">What do the sources say?</Text>
            </View>
            <Pressable onPress={() => go("/intelligence")} accessibilityRole="button">
              <Text className="text-xs font-extrabold text-primary">Open pulse</Text>
            </Pressable>
          </View>

          <View className="rounded-[24px] border border-[#D8E5F5] bg-[#F5F9FF] p-4">
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-[#DCE9FF]">
                <MaterialIcons name="radar" size={21} color="#1F5EFF" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-extrabold text-foreground">Connected civic signals</Text>
                <Text className="mt-1 text-[11px] leading-4 text-muted">
                  {pulse.isLoading ? "Checking connected sources…" : pulse.data?.sourceReachable ? "Official service information is reachable. Ward-level impact still needs verification." : "The municipal service source could not be verified right now."}
                </Text>
              </View>
              <StatusPill label={pulse.isLoading ? "CHECKING" : pulse.data?.sourceReachable ? "VERIFIED" : "UNAVAILABLE"} tone={pulse.isLoading ? "warning" : pulse.data?.sourceReachable ? "official" : "error"} compact />
            </View>
          </View>

          <View className="mt-2.5 gap-2">
            {feeds.slice(0, 3).map((feed) => (
              <SignalCard
                key={feed.id}
                icon={feed.icon}
                title={feed.label}
                detail={feed.headline}
                status={serviceStateLabel(feed.state)}
                tone={feed.state === "unknown" ? "error" : feed.state === "stable" ? "official" : "warning"}
                onPress={() => go("/intelligence")}
              />
            ))}
          </View>

          {!feeds.length && !pulse.isLoading ? (
            <View className="mt-2.5 rounded-[20px] border border-dashed border-border bg-surface p-4">
              <Text className="text-sm font-extrabold text-foreground">No live service signal yet</Text>
              <Text className="mt-1 text-xs leading-4 text-muted">You can still report a problem or open the Civic Intelligence page to retry the connected sources.</Text>
            </View>
          ) : null}
        </View>

        <View className="mt-8">
          <SectionHeader eyebrow="Your civic record" title="Keep the thread" action="View cases" onAction={() => go("/(tabs)/cases")} />
          {latestCase ? (
            <Pressable onPress={() => go(`/case/${latestCase.id}`)} accessibilityRole="button">
              <View className="rounded-[24px] border border-border bg-surface p-4">
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
            </Pressable>
          ) : (
            <View className="rounded-[24px] border border-dashed border-border bg-surface p-5">
              <Text className="text-base font-extrabold text-foreground">Your civic record starts here.</Text>
              <Text className="mt-1 text-sm leading-5 text-muted">When you report a problem, CivicLens keeps a private timeline so you can return to the thread later.</Text>
              <View className="mt-4"><ActionButton label="Start a report" icon="add-circle-outline" compact onPress={() => go("/civic-os")} /></View>
            </View>
          )}
        </View>

        <View className="mt-8">
          <SectionHeader eyebrow="Know before you act" title="Government, explained simply" action="Learn" onAction={() => go("/(tabs)/learn")} />
          <Pressable onPress={() => go("/(tabs)/learn")} accessibilityRole="button">
            <View className="overflow-hidden rounded-[24px] border border-border bg-surface p-5">
              <View className="flex-row items-start">
                <View className="flex-1">
                  <SourceBadge label="CIVICLENS EXPLAINER" tone="civic" />
                  <Text className="mt-3 font-display text-xl font-extrabold leading-6 text-foreground">Who is actually responsible for this?</Text>
                  <Text className="mt-2 text-sm leading-5 text-muted">Understand the difference between a municipality, ward councillor, province, and national government before you escalate.</Text>
                </View>
                <View className="ml-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF2FF]"><MaterialIcons name="school" size={23} color="#1F5EFF" /></View>
              </View>
              <View className="mt-4 flex-row items-center"><Text className="text-xs font-extrabold text-primary">Learn → act</Text><View className="ml-3 h-px flex-1 bg-[#DDE6E4]" /><Text className="text-[10px] text-muted">Plain language</Text></View>
            </View>
          </Pressable>
        </View>

        <View className="mt-8">
          <TrustStrip />
          <View className="mt-3 rounded-[22px] border border-border bg-surface p-4">
            <View className="flex-row items-center">
              <MaterialIcons name="verified-user" size={19} color="#237A4B" />
              <Text className="ml-2 flex-1 text-xs font-extrabold text-foreground">Evidence before certainty</Text>
              <StatusPill label="SOURCE-AWARE" tone="official" compact />
            </View>
            <Text className="mt-2 text-[11px] leading-4 text-muted">CivicLens distinguishes official records, CivicLens explanations, community signals, and information that still needs verification.</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
