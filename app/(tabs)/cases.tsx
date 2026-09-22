import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

import { ActionButton, EmptyState, IconTile, InfoCard, SectionHeader, SourceBadge } from "@/components/civic-ui";
import { ScreenContainer } from "@/components/screen-container";
import { categoryById } from "@/lib/civic-data";
import { useCivic } from "@/lib/civic-store";

export default function CasesScreen() {
  const { cases } = useCivic();
  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <View className="flex-row items-center justify-between py-4"><View><Text className="font-display text-2xl font-extrabold text-foreground">Your civic record</Text><Text className="mt-1 text-sm leading-5 text-muted">Private cases, clear timelines, better follow-up.</Text></View><Pressable onPress={() => router.push("/(tabs)/report" as never)} style={({ pressed }) => pressed && { opacity: 0.65 }}><View className="h-10 w-10 items-center justify-center rounded-full bg-primary"><MaterialIcons name="add" size={23} color="#FFFFFF" /></View></Pressable></View>
      <View className="mb-5 flex-row gap-2"><InfoCard className="flex-1"><Text className="text-2xl font-extrabold text-foreground">{cases.length}</Text><Text className="mt-1 text-xs font-semibold text-muted">total cases</Text></InfoCard><InfoCard className="flex-1"><Text className="text-2xl font-extrabold text-foreground">{cases.filter((item) => item.statusTone === "warning").length}</Text><Text className="mt-1 text-xs font-semibold text-muted">need attention</Text></InfoCard></View>
      <SectionHeader eyebrow="Private by default" title="Keep every step together" />
      {cases.length === 0 ? <EmptyState icon="folder-open" title="No cases yet" detail="When you report a civic problem, save it here to keep your evidence, reference number and follow-up steps together." action={<ActionButton label="Report a problem" icon="add" onPress={() => router.push("/(tabs)/report" as never)} />} /> : <FlatList data={cases} keyExtractor={(item) => item.id} contentContainerStyle={{ gap: 10, paddingBottom: 22 }} renderItem={({ item }) => { const category = categoryById(item.issueType); return <Pressable onPress={() => router.push(`/case/${item.id}` as never)} style={({ pressed }) => pressed && { opacity: 0.72 }}><InfoCard><View className="flex-row items-start gap-3"><IconTile icon={category.icon} color={category.accent} /><View className="flex-1"><View className="flex-row items-start justify-between gap-2"><Text className="flex-1 text-base font-extrabold text-foreground">{item.title}</Text><SourceBadge label={item.status} tone={item.statusTone === "success" ? "official" : item.statusTone === "warning" ? "community" : "civic"} /></View><Text className="mt-2 text-xs text-muted">{item.municipality} · {item.createdAt}</Text><View className="mt-3 flex-row items-center justify-between border-t border-border pt-3"><View className="flex-row items-center gap-1"><MaterialIcons name="confirmation-number" size={14} color="#667483" /><Text className="text-xs font-semibold text-muted">{item.reference}</Text></View><Text className="text-xs font-extrabold text-primary">Open case →</Text></View></View></View></InfoCard></Pressable>; }} />}
    </ScreenContainer>
  );
}
