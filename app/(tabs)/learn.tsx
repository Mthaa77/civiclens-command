import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";

import { ActionButton, Chip, IconTile, InfoCard, SectionHeader, SourceBadge } from "@/components/civic-ui";
import { ScreenContainer } from "@/components/screen-container";
import { lessons, sources } from "@/lib/civic-data";

export default function LearnScreen() {
  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="py-4"><Text className="font-display text-2xl font-extrabold text-foreground">Learn government</Text><Text className="mt-1 text-sm leading-5 text-muted">Plain-language explainers for the moments that matter.</Text></View>
        <View className="rounded-[28px] p-5" style={{ backgroundColor: "#5144B5" }}><View className="flex-row items-start justify-between"><View className="flex-1"><SourceBadge label="60-second explainers" tone="civic" /><Text style={{ color: "#FFFFFF", fontFamily: "SpaceGrotesk_700Bold" }} className="mt-4 text-2xl font-extrabold">Understand the system. Use it with confidence.</Text><Text style={{ color: "#E3DFFF" }} className="mt-2 text-sm leading-5">No jargon. No party politics. Just the context you need to take the next civic step.</Text></View><View className="ml-3 h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "#6A5DC5" }}><MaterialIcons name="menu-book" size={28} color="#FFFFFF" /></View></View><View className="mt-5"><ActionButton label="Ask CivicLens" icon="question-answer" variant="secondary" onPress={() => router.push("/(tabs)/report" as never)} /></View></View>
        <View className="mt-6 flex-row gap-2"><Chip label="Government basics" active /><Chip label="Rights" /><Chip label="Money" /></View>
        <View className="mt-7"><SectionHeader eyebrow="Build your civic vocabulary" title="Useful in one minute" /></View>
        <FlatList data={lessons} scrollEnabled={false} keyExtractor={(item) => item.id} contentContainerStyle={{ gap: 9 }} renderItem={({ item }) => <Pressable style={({ pressed }) => pressed && { opacity: 0.72 }}><InfoCard><View className="flex-row items-start gap-3"><IconTile icon={item.icon} color="#7B61FF" /><View className="flex-1"><View className="flex-row items-center justify-between"><Text className="text-[10px] font-extrabold uppercase tracking-[1px] text-[#7B61FF]">{item.category}</Text><Text className="text-[11px] font-semibold text-muted">{item.length}</Text></View><Text className="mt-2 text-base font-extrabold text-foreground">{item.title}</Text><Text className="mt-1 text-sm leading-5 text-muted">{item.summary}</Text><Text className="mt-3 text-xs font-extrabold text-primary">Read explainer →</Text></View></View></InfoCard></Pressable>} />
        <View className="mt-7"><SectionHeader eyebrow="Ask CivicLens" title="Start with a question" /></View>
        <InfoCard><Text className="text-base font-extrabold text-foreground">“Who do I call about water?”</Text><Text className="mt-2 text-sm leading-5 text-muted">CivicLens uses your location, an issue playbook and authoritative sources to suggest a practical next step.</Text><View className="mt-4 flex-row flex-wrap gap-2"><Chip label="Who is responsible?" tone="info" /><Chip label="What evidence?" tone="info" /><Chip label="How do I follow up?" tone="info" /></View></InfoCard>
        <View className="mt-7"><SectionHeader eyebrow="Trust layer" title="Every answer shows its sources" /></View>
        <View className="rounded-3xl border border-border bg-surface p-4"><View className="flex-row items-start gap-3"><IconTile icon="verified" color="#27AE60" /><View className="flex-1"><Text className="text-sm font-extrabold text-foreground">Official facts stay official</Text><Text className="mt-1 text-xs leading-4 text-muted">Community reports never overwrite source-backed government facts. Time-sensitive records carry a last-checked date.</Text></View></View>{sources.slice(0, 2).map((source) => <View key={source.title} className="mt-3 flex-row items-center gap-2 border-t border-border pt-3"><MaterialIcons name="link" size={15} color="#1769FF" /><Text className="flex-1 text-xs font-semibold text-foreground">{source.title}</Text><Text className="text-[10px] font-bold text-muted">{source.checked.replace("Last checked ", "")}</Text></View>)}</View>
      </ScrollView>
    </ScreenContainer>
  );
}
