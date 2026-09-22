import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";

import { ActionButton, CivicMark, Chip, IconTile, InfoCard, SectionHeader, SourceBadge } from "@/components/civic-ui";
import { ScreenContainer } from "@/components/screen-container";
import { issueCategories, lessons, locationProfile, notices } from "@/lib/civic-data";
import { useCivic } from "@/lib/civic-store";

export default function HomeScreen() {
  const { cases } = useCivic();
  const openCases = cases.filter((item) => !["Resolved", "Closed"].includes(item.status)).length;
  const go = (path: string) => router.push(path as never);

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="flex-row items-center justify-between py-4">
          <View className="flex-row items-center gap-3"><CivicMark compact /><View><Text className="text-lg font-extrabold tracking-tight text-foreground">CivicLens</Text><Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted">South Africa</Text></View></View>
          <Pressable accessibilityLabel="Notifications" style={({ pressed }) => pressed && { opacity: 0.6 }}><View className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface"><MaterialIcons name="notifications-none" size={21} color="#59636E" /></View></Pressable>
        </View>

        <View className="overflow-hidden rounded-[28px] bg-[#0C1726] p-6">
          <View className="absolute -right-7 -top-8 h-32 w-32 rounded-full border-[18px] border-[#17314D]" />
          <View className="absolute -bottom-12 -right-2 h-28 w-28 rounded-full border-[12px] border-[#16304A]" />
          <SourceBadge label="Civic navigation" tone="civic" />
          <Text className="mt-4 max-w-[280px] text-[30px] font-extrabold leading-9 text-white">Government is complicated. Getting help should not be.</Text>
          <Text className="mt-3 max-w-[300px] text-sm leading-5 text-[#B5C4D2]">Know who is responsible, what to do, and what happens next.</Text>
          <View className="mt-5 flex-row gap-3"><ActionButton label="Report a problem" icon="add" onPress={() => go("/(tabs)/report")} /><ActionButton label="My government" icon="account-balance" variant="secondary" onPress={() => go("/(tabs)/government")} /></View>
        </View>

        <View className="mt-5 flex-row gap-3">
          <InfoCard className="flex-1"><Text className="text-2xl font-extrabold text-foreground">{openCases}</Text><Text className="mt-1 text-xs font-semibold text-muted">open case{openCases === 1 ? "" : "s"}</Text><Text className="mt-3 text-[11px] font-bold text-primary">Track privately →</Text></InfoCard>
          <InfoCard className="flex-1"><Text className="text-2xl font-extrabold text-foreground">{notices.length}</Text><Text className="mt-1 text-xs font-semibold text-muted">nearby civic notices</Text><Text className="mt-3 text-[11px] font-bold text-primary">Participate →</Text></InfoCard>
        </View>

        <View className="mt-7"><SectionHeader eyebrow="Start with your situation" title="What can we help you with?" action="See all" onAction={() => go("/(tabs)/report")} />
          <FlatList data={issueCategories.slice(0, 4)} numColumns={2} scrollEnabled={false} columnWrapperStyle={{ gap: 10 }} contentContainerStyle={{ gap: 10 }} keyExtractor={(item) => item.id} renderItem={({ item }) => <Pressable onPress={() => go("/(tabs)/report")} style={({ pressed }) => [{ flex: 1 }, pressed && { opacity: 0.72 }]}><View className="rounded-2xl border border-border bg-surface p-4"><IconTile icon={item.icon} color={item.accent} size="small" /><Text className="mt-3 text-sm font-extrabold text-foreground">{item.label}</Text><Text className="mt-1 text-xs leading-4 text-muted" numberOfLines={2}>{item.hint}</Text></View></Pressable>} />
        </View>

        <View className="mt-7"><SectionHeader eyebrow="Your civic profile" title="Find your government" />
          <InfoCard><View className="flex-row items-start justify-between"><View className="flex-1"><View className="flex-row items-center gap-2"><MaterialIcons name="location-on" size={18} color="#1769FF" /><Text className="text-sm font-extrabold text-foreground">{locationProfile.suburb}</Text></View><Text className="mt-2 text-lg font-extrabold text-foreground">{locationProfile.municipality}</Text><Text className="mt-1 text-sm text-muted">{locationProfile.province} · {locationProfile.municipalityType}</Text></View><View className="h-16 w-16 items-center justify-center rounded-2xl bg-[#E9F2FF]"><MaterialIcons name="my-location" size={28} color="#1769FF" /></View></View><View className="mt-4 flex-row items-center justify-between border-t border-border pt-3"><Text className="text-xs font-semibold text-muted">{locationProfile.ward}</Text><Pressable onPress={() => go("/(tabs)/government")}><Text className="text-xs font-extrabold text-primary">View profile →</Text></Pressable></View></InfoCard>
        </View>

        <View className="mt-7"><SectionHeader eyebrow="Near you" title="What's happening around you?" action="Open map" onAction={() => go("/(tabs)/community")} />
          <View className="rounded-3xl bg-[#E9F2FF] p-4"><View className="flex-row items-start justify-between"><View className="flex-1"><Text className="text-[11px] font-extrabold uppercase tracking-[1.4px] text-primary">Soshanguve · Tshwane</Text><Text className="mt-2 text-lg font-extrabold text-[#11243B]">A clearer view of local issues</Text><Text className="mt-1 text-sm leading-5 text-[#52677C]">See community reports, projects and official notices without exposing private household locations.</Text></View><View className="ml-3 h-12 w-12 items-center justify-center rounded-2xl bg-white/70"><MaterialIcons name="map" size={23} color="#1769FF" /></View></View><View className="mt-4 flex-row gap-2"><Chip label="Community reports" tone="community" /><Chip label="Projects" tone="info" /><Chip label="Notices" tone="success" /></View></View>
        </View>

        <View className="mt-7"><SectionHeader eyebrow="Learn in plain language" title="One minute, one useful idea" action="Explore learn" onAction={() => go("/(tabs)/learn")} />
          <Pressable onPress={() => go("/(tabs)/learn")} style={({ pressed }) => pressed && { opacity: 0.75 }}><InfoCard><View className="flex-row gap-3"><IconTile icon={lessons[0].icon} color="#7B61FF" /><View className="flex-1"><View className="flex-row items-center justify-between"><Text className="text-xs font-bold text-primary">{lessons[0].category}</Text><Text className="text-xs font-semibold text-muted">{lessons[0].length}</Text></View><Text className="mt-2 text-base font-extrabold text-foreground">{lessons[0].title}</Text><Text className="mt-1 text-sm leading-5 text-muted">{lessons[0].summary}</Text></View></View></InfoCard></Pressable>
        </View>

        <View className="mt-7"><SectionHeader eyebrow="Participation" title="Upcoming near you" />
          {notices.slice(0, 2).map((notice) => <View key={notice.id} className="mb-2 flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-3"><IconTile icon={notice.icon} color="#1769FF" size="small" /><View className="flex-1"><Text className="text-sm font-extrabold text-foreground">{notice.title}</Text><Text className="mt-1 text-xs text-muted">{notice.deadline}</Text></View><MaterialIcons name="chevron-right" size={20} color="#9AA5B1" /></View>)}
        </View>

        <View className="mt-7 rounded-3xl border border-[#D8E5F5] bg-[#F5F9FF] p-4"><View className="flex-row items-start gap-3"><View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#DDEBFF]"><MaterialIcons name="verified" size={21} color="#1769FF" /></View><View className="flex-1"><Text className="text-base font-extrabold text-[#11243B]">Built for civic trust</Text><Text className="mt-1 text-sm leading-5 text-[#5B7084]">Official facts are labelled, community reports stay distinct, and every time-sensitive record shows when it was last checked.</Text><Text className="mt-3 text-xs font-extrabold text-primary">Sources & methodology →</Text></View></View></View>
      </ScrollView>
    </ScreenContainer>
  );
}
