import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { ActionButton, CaseStatusRail, Chip, IconTile, InfoCard, SectionHeader, SourceBadge, SyncBadge, TrustStrip } from "@/components/civic-ui";
import { ScreenContainer } from "@/components/screen-container";
import { categoryById } from "@/lib/civic-data";
import { useCivic } from "@/lib/civic-store";

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cases, updateCase, updateCaseInCloud } = useCivic();
  const item = useMemo(() => cases.find((entry) => entry.id === id), [cases, id]);
  const [reference, setReference] = useState(item?.reference === "Not added yet" ? "" : item?.reference ?? "");
  if (!item) return <ScreenContainer className="px-5"><Text className="mt-8 text-xl font-extrabold text-foreground">Case not found</Text><ActionButton label="Back to cases" onPress={() => router.back()} /></ScreenContainer>;
  const category = categoryById(item.issueType);
  const saveReference = async () => {
    const value = reference.trim();
    if (!value) {
      updateCase(item.id, { reference: "Not added yet" });
      return;
    }
    try {
      await updateCaseInCloud(item.id, { status: "submitted", reference: value, detail: "Reference number saved to this private case." });
    } catch {
      updateCase(item.id, { reference: value, status: "Government reference recorded", statusTone: "success" });
    }
  };
  const markResolved = async () => {
    try {
      await updateCaseInCloud(item.id, { status: "resolved", detail: "You marked this case resolved. This does not claim municipal resolution." });
    } catch {
      updateCase(item.id, { status: "Resolved", statusTone: "success" });
    }
  };

  return <ScreenContainer className="px-5" containerClassName="bg-background"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
    <View className="flex-row items-center gap-3 py-4"><Pressable onPress={() => router.back()} style={({ pressed }) => pressed && { opacity: 0.6 }}><MaterialIcons name="arrow-back" size={22} color="#59636E" /></Pressable><View className="flex-1"><Text className="text-[11px] font-extrabold uppercase tracking-[1.5px] text-primary">Case {item.id}</Text><Text className="mt-1 text-xl font-extrabold text-foreground">Case details</Text></View><SourceBadge label={item.status} tone={item.statusTone === "success" ? "official" : "community"} /></View>
    <View className="mb-3 flex-row items-center justify-between rounded-2xl bg-[#F5F9FF] px-3 py-2"><SyncBadge label="Cloud-backed case" /><Text className="text-[10px] font-semibold text-muted">Private</Text></View><InfoCard><View className="flex-row items-start gap-3"><IconTile icon={category.icon} color={category.accent} /><View className="flex-1"><Text className="text-lg font-extrabold text-foreground">{item.title}</Text><Text className="mt-1 text-sm text-muted">{item.municipality} · {item.location}</Text></View></View><View className="mt-4 flex-row flex-wrap gap-2"><Chip label={item.visibility} /><Chip label={`${item.evidenceCount} evidence item${item.evidenceCount === 1 ? "" : "s"}`} tone="info" /><Chip label="Private by default" tone="success" /></View></InfoCard>
    <View className="mt-7"><SectionHeader eyebrow="Evidence locker" title="Keep the record together" /></View>
    <View className="flex-row gap-2"><View className="flex-1 items-center rounded-2xl border border-border bg-surface p-4"><IconTile icon="photo-library" color="#1769FF" size="small" /><Text className="mt-2 text-xs font-extrabold text-foreground">Photos</Text><Text className="mt-1 text-[10px] text-muted">{item.evidenceCount} saved</Text></View><View className="flex-1 items-center rounded-2xl border border-border bg-surface p-4"><IconTile icon="description" color="#7B61FF" size="small" /><Text className="mt-2 text-xs font-extrabold text-foreground">Notes</Text><Text className="mt-1 text-[10px] text-muted">Private</Text></View><View className="flex-1 items-center rounded-2xl border border-border bg-surface p-4"><IconTile icon="alternate-email" color="#27AE60" size="small" /><Text className="mt-2 text-xs font-extrabold text-foreground">Messages</Text><Text className="mt-1 text-[10px] text-muted">Private</Text></View></View>
    <View className="mt-7"><SectionHeader eyebrow="Government reference" title="Track your official report" /></View>
    <InfoCard><Text className="text-sm leading-5 text-muted">After reporting through the municipality, add the reference number so every follow-up connects back to the original case.</Text><TextInput value={reference} onChangeText={setReference} placeholder="e.g. TSH-2026-0917" placeholderTextColor="#97A3AF" className="mt-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground" /><View className="mt-3"><ActionButton label="Save reference" icon="save" onPress={saveReference} compact /></View></InfoCard>
    <View className="mt-7"><SectionHeader eyebrow="Case lifecycle" title="Where this case stands" /></View>
    <CaseStatusRail status={item.status} />
    <View className="mt-4 rounded-3xl border border-border bg-surface p-4">{item.events.map((event, index) => <View key={`${event.date}-${event.label}`} className="flex-row"><View className="mr-3 items-center"><View className={index === 0 ? "h-3 w-3 rounded-full bg-primary" : "h-3 w-3 rounded-full border-2 border-primary bg-surface"} />{index < item.events.length - 1 ? <View className="my-1 w-px flex-1 bg-[#C9D7E5]" /> : null}</View><View className="flex-1 pb-5"><Text className="text-[11px] font-extrabold uppercase tracking-[1px] text-primary">{event.date}</Text><Text className="mt-1 text-sm font-extrabold text-foreground">{event.label}</Text>{event.detail ? <Text className="mt-1 text-xs leading-4 text-muted">{event.detail}</Text> : null}</View></View>)}</View>
    <View className="mt-5"><TrustStrip/></View><View className="mt-7 rounded-3xl border border-[#D8E5F5] bg-[#F5F9FF] p-4"><View className="flex-row gap-3"><IconTile icon="forward" color="#1769FF" /><View className="flex-1"><Text className="text-sm font-extrabold text-[#11243B]">Next documented step</Text><Text className="mt-1 text-xs leading-4 text-[#5B7084]">Use the official municipal channel first. If the published municipal process gives a next stage, CivicLens will show it here with its source and last verified date.</Text></View></View></View>
    {item.status !== "Resolved" && item.status !== "resolved" ? <View className="mt-5"><ActionButton label="Mark as resolved" icon="check-circle" variant="secondary" onPress={markResolved} /></View> : <View className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl bg-[#E8F7EE] px-4 py-3"><MaterialIcons name="check-circle" size={18} color="#27AE60" /><Text className="text-sm font-extrabold text-[#1C7A43]">Marked resolved by you</Text></View>}
  </ScrollView></ScreenContainer>;
}
