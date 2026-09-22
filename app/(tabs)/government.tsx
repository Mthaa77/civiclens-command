import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FlatList, Linking, Pressable, ScrollView, Text, View } from "react-native";

import { Chip, IconTile, InfoCard, SectionHeader, SourceBadge } from "@/components/civic-ui";
import { LocationPicker } from "@/components/location-picker";
import { ScreenContainer } from "@/components/screen-container";
import { governmentContacts, sources, todayLabel } from "@/lib/civic-data";
import { MDB_SOURCE_LABEL } from "@/lib/municipal-directory";
import { useCivic } from "@/lib/civic-store";

export default function GovernmentScreen() {
  const { selectedLocation, setSelectedLocation } = useCivic();
  const hasTshwaneContacts = selectedLocation.code === "TSH" || selectedLocation.name === "City of Tshwane";
  const visibleSources = hasTshwaneContacts ? sources : sources.filter((item) => !item.title.startsWith("City of Tshwane"));

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="py-4"><Text className="font-display text-2xl font-extrabold text-foreground">My government</Text><Text className="mt-1 text-sm leading-5 text-muted">Turn your location into a clear civic profile.</Text></View>

        <LocationPicker value={selectedLocation} onChange={setSelectedLocation} />

        <View className="mt-4 rounded-[28px] p-5" style={{ backgroundColor: "#10243A" }}><View className="flex-row items-start justify-between"><View className="flex-1"><SourceBadge label="MDB 2026 civic profile" tone="civic" /><Text style={{ color: "#FFFFFF", fontFamily: "SpaceGrotesk_700Bold" }} className="mt-4 text-2xl font-extrabold">{selectedLocation.name}</Text><Text style={{ color: "#B7C9D9" }} className="mt-1 text-sm">{selectedLocation.province} · {selectedLocation.district}</Text></View><View className="h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "#203D5B" }}><MaterialIcons name="location-city" size={28} color="#8CB5FF" /></View></View><View className="mt-5 flex-row items-center gap-2 border-t border-[#29435D] pt-4"><MaterialIcons name="place" size={17} color="#8CB5FF" /><Text style={{ color: "#FFFFFF" }} className="text-sm font-bold">{selectedLocation.wardNumber ? `Ward ${selectedLocation.wardNumber}` : "Ward not selected"}</Text><Text style={{ color: "#B7C9D9" }} className="text-xs">· {selectedLocation.code}</Text></View></View>

        <View className="mt-6"><SectionHeader eyebrow="Your civic structure" title="Who does what?" /></View>
        <View className="gap-2"><View className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4"><IconTile icon="public" color="#7B61FF" /><View className="flex-1"><Text className="text-xs font-extrabold uppercase tracking-[1px] text-muted">National</Text><Text className="mt-1 text-sm font-extrabold text-foreground">South African Government</Text><Text className="mt-1 text-xs leading-4 text-muted">National policy, legislation and oversight.</Text></View><MaterialIcons name="chevron-right" size={20} color="#9AA5B1" /></View><View className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4"><IconTile icon="map" color="#4F8CFF" /><View className="flex-1"><Text className="text-xs font-extrabold uppercase tracking-[1px] text-muted">Provincial</Text><Text className="mt-1 text-sm font-extrabold text-foreground">{selectedLocation.province} Provincial Government</Text><Text className="mt-1 text-xs leading-4 text-muted">Provincial services such as education and health.</Text></View><MaterialIcons name="chevron-right" size={20} color="#9AA5B1" /></View><View className="flex-row items-center gap-3 rounded-2xl border-2 border-[#CFE0FF] bg-[#F4F8FF] p-4"><IconTile icon="account-balance" color="#1769FF" /><View className="flex-1"><Text className="text-xs font-extrabold uppercase tracking-[1px] text-primary">Local</Text><Text className="mt-1 text-sm font-extrabold text-foreground">{selectedLocation.name}</Text><Text className="mt-1 text-xs leading-4 text-muted">Everyday services: water, roads, refuse and street lighting.</Text></View><MaterialIcons name="check-circle" size={21} color="#1769FF" /></View></View>

        <View className="mt-7"><SectionHeader eyebrow="Verified channels" title="Start with the right office" /></View>
        {hasTshwaneContacts ? <FlatList data={governmentContacts} scrollEnabled={false} keyExtractor={(item) => item.value} contentContainerStyle={{ gap: 8 }} renderItem={({ item }) => <Pressable onPress={() => Linking.openURL(`tel:${item.value.replaceAll(" ", "")}`)} style={({ pressed }) => pressed && { opacity: 0.72 }}><View className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-3"><IconTile icon={item.icon} color="#27AE60" size="small" /><View className="flex-1"><Text className="text-sm font-extrabold text-foreground">{item.label}</Text><Text className="mt-1 text-xs text-muted">{item.value} · {item.helper}</Text></View><View className="items-end"><SourceBadge label="Official" tone="official" /><MaterialIcons name="call" size={16} color="#27AE60" /></View></View></Pressable>} /> : <Pressable onPress={() => Linking.openURL("https://www.gov.za/about-government/contact-directory")}><View className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4"><IconTile icon="public" color="#1769FF" /><View className="flex-1"><Text className="text-sm font-extrabold text-foreground">Open the official contact directory</Text><Text className="mt-1 text-xs leading-4 text-muted">Find verified contact details for {selectedLocation.name} through the South African Government directory.</Text></View><MaterialIcons name="open-in-new" size={18} color="#1769FF" /></View></Pressable>}

        <View className="mt-7"><InfoCard><View className="flex-row items-start gap-3"><IconTile icon="groups" color="#7B61FF" /><View className="flex-1"><Text className="text-base font-extrabold text-foreground">Ward support</Text><Text className="mt-1 text-sm leading-5 text-muted">Your ward councillor can help follow up with the municipality, but municipal officials handle service repairs.</Text><Text className="mt-3 text-xs font-extrabold text-primary">{selectedLocation.wardNumber ? `Ward ${selectedLocation.wardNumber} selected · MDB 2026` : "Select a ward above for more precise routing →"}</Text></View></View></InfoCard></View>

        <View className="mt-7"><SectionHeader eyebrow="How we know" title="Sources & freshness" /></View>
        <FlatList data={[{ title: MDB_SOURCE_LABEL, publisher: "Municipal Demarcation Board", checked: `Cached / checked ${todayLabel()}`, authority: "Official" }, ...visibleSources]} scrollEnabled={false} keyExtractor={(item) => item.title} contentContainerStyle={{ gap: 8 }} renderItem={({ item }) => <View className="rounded-2xl border border-border bg-surface p-3"><View className="flex-row items-start justify-between gap-3"><View className="flex-1"><Text className="text-sm font-extrabold text-foreground">{item.title}</Text><Text className="mt-1 text-xs text-muted">{item.publisher}</Text></View><SourceBadge label={item.authority} tone={item.authority === "Official" ? "official" : "civic"} /></View><Text className="mt-3 text-[11px] font-semibold text-muted">{item.checked}</Text></View>} />
        <View className="mt-4 flex-row flex-wrap gap-2"><Chip label="Official-source-first" tone="success" /><Chip label="Neutral civic utility" tone="info" /><Chip label="Private by default" /></View>
      </ScrollView>
    </ScreenContainer>
  );
}
