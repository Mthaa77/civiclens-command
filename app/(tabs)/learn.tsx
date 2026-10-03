import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";

import { ActionButton, Chip, IconTile, InfoCard, SectionHeader, SourceBadge, TrustStrip } from "@/components/civic-ui";
import { ScreenContainer } from "@/components/screen-container";
import { lessons, sources } from "@/lib/civic-data";

const FILTERS = ["All", "Government basics", "Rights & accountability", "Money & services"];

const EXTRA_GUIDES = [
  { id: "guide-1", icon: "account-balance", title: "Who is responsible for what?", detail: "National, provincial and local government — explained with everyday examples.", action: "Open Government" },
  { id: "guide-2", icon: "record-voice-over", title: "How to make a useful complaint", detail: "What to include, what evidence helps, and how to keep a traceable record.", action: "Start a report" },
  { id: "guide-3", icon: "payments", title: "Where municipal money goes", detail: "Understand budgets, service delivery and maintenance without accounting jargon.", action: "Explore money" },
  { id: "guide-4", icon: "gavel", title: "How accountability works", detail: "Learn the difference between a service request, escalation, oversight and a formal information request.", action: "Learn accountability" },
];

export default function LearnScreen() {
  const [filter, setFilter] = useState("All");
  const [completed, setCompleted] = useState<string[]>([]);

  const filteredLessons = useMemo(
    () => filter === "All" ? lessons : lessons.filter((lesson) => lesson.category === filter),
    [filter]
  );

  const markComplete = (id: string) => {
    setCompleted((current) => current.includes(id) ? current : [...current, id]);
  };

  const progress = Math.round((completed.length / lessons.length) * 100);

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        <View className="flex-row items-end justify-between py-4">
          <View className="flex-1">
            <Text className="font-display text-2xl font-extrabold text-foreground">Learn government</Text>
            <Text className="mt-1 text-sm leading-5 text-muted">Understand how South Africa's government works — then use that knowledge when you need help.</Text>
          </View>
          <View className="ml-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF2FF]">
            <MaterialIcons name="school" size={23} color="#1769FF" />
          </View>
        </View>

        <View className="overflow-hidden rounded-[30px] p-5" style={{ backgroundColor: "#10243A" }}>
          <View className="absolute -right-8 -top-10 h-36 w-36 rounded-full border-[18px] border-[#1C3B58]" />
          <View className="flex-row items-center justify-between">
            <SourceBadge label="Civic learning hub" tone="civic" />
            <Text className="text-[10px] font-extrabold uppercase tracking-[1px] text-[#AFCBFF]">{progress}% explored</Text>
          </View>
          <Text style={{ color: "#FFFFFF", fontFamily: "SpaceGrotesk_700Bold" }} className="mt-4 text-[28px] leading-8">Government makes more sense when you see the whole picture.</Text>
          <Text style={{ color: "#B9CAD9" }} className="mt-3 text-sm leading-5">Start with the basics, understand who is responsible, and learn what to do when a service or public process goes wrong.</Text>
          <View className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <View className="h-full rounded-full bg-[#79A9FF]" style={{ width: `${Math.max(progress, 4)}%` }} />
          </View>
          <View className="mt-5 flex-row gap-2">
            <ActionButton label="Start learning" icon="play-arrow" onPress={() => router.push("#lessons" as never)} />
            <ActionButton label="Government map" icon="account-balance" variant="secondary" onPress={() => router.push("/(tabs)/government" as never)} />
          </View>
        </View>

        <View className="mt-5 flex-row gap-2">
          <View className="flex-1 rounded-[22px] border border-border bg-surface p-4">
            <Text className="text-[10px] font-extrabold uppercase tracking-[1px] text-muted">Lessons</Text>
            <Text className="mt-1 text-2xl font-extrabold text-foreground">{lessons.length}</Text>
            <Text className="mt-1 text-xs text-muted">Plain-language explainers</Text>
          </View>
          <View className="flex-1 rounded-[22px] border border-border bg-surface p-4">
            <Text className="text-[10px] font-extrabold uppercase tracking-[1px] text-muted">Completed</Text>
            <Text className="mt-1 text-2xl font-extrabold text-foreground">{completed.length}</Text>
            <Text className="mt-1 text-xs text-muted">Saved on this device</Text>
          </View>
        </View>

        <View className="mt-7">
          <SectionHeader eyebrow="Start here" title="The government map" />
          <View className="gap-2">
            {[
              ["National", "Parliament, national departments and national policy", "public"],
              ["Provincial", "Education, health and other provincial responsibilities", "map"],
              ["Local", "Municipal services such as water, roads, refuse and lighting", "location-city"],
            ].map(([label, detail, icon], index) => (
              <Pressable key={label} onPress={() => index === 2 ? router.push("/(tabs)/government" as never) : undefined} disabled={index !== 2} accessibilityRole={index === 2 ? "button" : undefined} style={({ pressed }) => pressed && { opacity: 0.72 }}>
                <View className={index === 2 ? "rounded-[22px] border-2 border-[#CFE0FF] bg-[#F4F8FF] p-4" : "rounded-[22px] border border-border bg-surface p-4"}>
                  <View className="flex-row items-center gap-3">
                    <IconTile icon={icon as any} color={index === 2 ? "#1769FF" : "#66788A"} />
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2"><Text className="text-sm font-extrabold text-foreground">{label}</Text>{index === 2 ? <SourceBadge label="Most useful locally" tone="civic" /> : null}</View>
                      <Text className="mt-1 text-xs leading-4 text-muted">{detail}</Text>
                    </View>
                    {index === 2 ? <MaterialIcons name="arrow-forward" size={19} color="#1769FF" /> : <MaterialIcons name="lock-open" size={17} color="#A0A9B3" />}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View nativeID="lessons" className="mt-8">
          <SectionHeader eyebrow="Build your civic vocabulary" title="Learn in one minute" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} className="mb-4">
            {FILTERS.map((item) => <Chip key={item} label={item} active={filter === item} onPress={() => setFilter(item)} />)}
          </ScrollView>
          <FlatList
            data={filteredLessons}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 10 }}
            renderItem={({ item }) => {
              const done = completed.includes(item.id);
              return (
                <Pressable onPress={() => markComplete(item.id)} accessibilityRole="button" accessibilityState={{ selected: done }} style={({ pressed }) => pressed && { opacity: 0.72 }}>
                  <InfoCard>
                    <View className="flex-row items-start gap-3">
                      <IconTile icon={item.icon} color={done ? "#27AE60" : "#1769FF"} />
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between gap-2">
                          <Text className="text-[10px] font-extrabold uppercase tracking-[1px] text-primary">{item.category}</Text>
                          <View className="flex-row items-center gap-2"><Text className="text-[11px] font-semibold text-muted">{item.length}</Text>{done ? <MaterialIcons name="check-circle" size={16} color="#27AE60" /> : null}</View>
                        </View>
                        <Text className="mt-2 text-base font-extrabold text-foreground">{item.title}</Text>
                        <Text className="mt-1 text-sm leading-5 text-muted">{item.summary}</Text>
                        <Text className={done ? "mt-3 text-xs font-extrabold text-[#237A4B]" : "mt-3 text-xs font-extrabold text-primary"}>{done ? "Explainer completed ✓" : "Mark as understood →"}</Text>
                      </View>
                    </View>
                  </InfoCard>
                </Pressable>
              );
            }}
          />
        </View>

        <View className="mt-8">
          <SectionHeader eyebrow="Practical guides" title="Learn → act" />
          <View className="gap-2">
            {EXTRA_GUIDES.map((guide, index) => (
              <Pressable
                key={guide.id}
                onPress={() => index === 0 ? router.push("/(tabs)/government" as never) : index === 1 ? router.push("/(tabs)/report" as never) : undefined}
                disabled={index > 1}
                accessibilityRole={index < 2 ? "button" : undefined}
                style={({ pressed }) => pressed && { opacity: 0.72 }}
              >
                <InfoCard>
                  <View className="flex-row items-center gap-3">
                    <IconTile icon={guide.icon as any} color={index < 2 ? "#1769FF" : "#7B61FF"} />
                    <View className="flex-1"><Text className="text-sm font-extrabold text-foreground">{guide.title}</Text><Text className="mt-1 text-xs leading-4 text-muted">{guide.detail}</Text><Text className="mt-2 text-[11px] font-extrabold text-primary">{index < 2 ? `${guide.action} →` : "Coming next"}</Text></View>
                    <MaterialIcons name={index < 2 ? "arrow-forward" : "lock-outline"} size={18} color={index < 2 ? "#1769FF" : "#9AA5B1"} />
                  </View>
                </InfoCard>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-8">
          <SectionHeader eyebrow="Ask CivicLens" title="Turn a question into a next step" />
          <InfoCard>
            <Text className="text-base font-extrabold text-foreground">Start with a real situation</Text>
            <Text className="mt-2 text-sm leading-5 text-muted">Instead of memorising government structures, ask what you actually need to know.</Text>
            <View className="mt-4 flex-row flex-wrap gap-2">
              <Chip label="Who is responsible?" tone="info" onPress={() => router.push("/(tabs)/government" as never)} />
              <Chip label="How do I report it?" tone="info" onPress={() => router.push("/(tabs)/report" as never)} />
              <Chip label="How do I follow up?" tone="info" onPress={() => router.push("/(tabs)/cases" as never)} />
            </View>
          </InfoCard>
        </View>

        <View className="mt-8"><TrustStrip /></View>
        <View className="mt-4 rounded-3xl border border-border bg-surface p-4">
          <View className="flex-row items-start gap-3">
            <IconTile icon="fact-check" color="#27AE60" />
            <View className="flex-1">
              <Text className="text-sm font-extrabold text-foreground">Source-aware learning</Text>
              <Text className="mt-1 text-xs leading-4 text-muted">Lessons explain concepts; official sources remain the authority for current rules, contacts and procedures.</Text>
            </View>
          </View>
          {sources.slice(0, 3).map((source) => <View key={source.title} className="mt-3 flex-row items-center gap-2 border-t border-border pt-3"><MaterialIcons name="link" size={15} color="#1769FF" /><Text className="flex-1 text-xs font-semibold text-foreground">{source.title}</Text><Text className="text-[10px] font-bold text-muted">{source.checked.replace("Last checked ", "")}</Text></View>)}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
