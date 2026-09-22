import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Linking, Pressable, Text, TextInput, View } from "react-native";

import { GpsLocationButton } from "@/components/gps-location-button";
import { ScreenContainer } from "@/components/screen-container";
import { SourceBadge } from "@/components/civic-ui";
import { GOVERNMENT_DIRECTORY_URL, TREASURY_SOURCE_LABEL, TREASURY_SOURCE_UPDATED, fetchOfficialMunicipalContacts, type OfficialMunicipalContact } from "@/lib/official-directory";
import { useCivic } from "@/lib/civic-store";

export default function DirectoryScreen() {
  const { selectedLocation, setSelectedLocation } = useCivic();
  const [contacts, setContacts] = useState<OfficialMunicipalContact[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<OfficialMunicipalContact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficialMunicipalContacts().then(setContacts).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const active = contacts.find((contact) => contact.code === selectedLocation.code);
    if (active) setSelected(active);
  }, [contacts, selectedLocation.code]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter((contact) => `${contact.name} ${contact.longName} ${contact.province} ${contact.code}`.toLowerCase().includes(query));
  }, [contacts, search]);

  const choose = (contact: OfficialMunicipalContact) => {
    setSelected(contact);
    setSelectedLocation({
      code: contact.code,
      name: contact.name,
      officialName: contact.longName,
      province: contact.province,
      district: contact.longName,
      districtCode: contact.provinceCode,
    });
  };

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <View className="flex-1">
        <View className="flex-row items-start justify-between py-4"><View className="flex-1"><Text className="font-display text-2xl font-extrabold text-foreground">Official civic directory</Text><Text className="mt-1 text-sm leading-5 text-muted">Find the right municipal office, then call or visit its verified source.</Text></View><View className="ml-3 h-11 w-11 items-center justify-center rounded-2xl bg-[#E9F2FF]"><MaterialIcons name="verified" size={22} color="#1F5EFF" /></View></View>
        <GpsLocationButton compact />
        <View className="mt-3 flex-row items-center gap-2 rounded-2xl border border-border bg-surface px-3"><MaterialIcons name="search" size={19} color="#7B8794" /><TextInput value={search} onChangeText={setSearch} placeholder="Search municipality or code" placeholderTextColor="#97A3AF" className="flex-1 py-3 text-sm text-foreground" /></View>

        {selected ? <View className="mt-4 rounded-[24px] border border-[#CFE0FF] bg-[#F4F8FF] p-4"><View className="flex-row items-start justify-between"><View className="flex-1"><SourceBadge label="Selected municipality" tone="official" /><Text className="mt-3 text-lg font-extrabold text-foreground">{selected.name}</Text><Text className="mt-1 text-xs text-muted">{selected.longName} · {selected.code}</Text></View><Pressable onPress={() => setSelected(null)} style={({ pressed }) => pressed && { opacity: 0.6 }}><MaterialIcons name="close" size={18} color="#52677C" /></Pressable></View><View className="mt-4 flex-row gap-2"><Pressable onPress={() => selected.phone && Linking.openURL(`tel:${selected.phone.replaceAll(" ", "")}`)} disabled={!selected.phone} style={({ pressed }) => [pressed && { opacity: 0.7 }, !selected.phone && { opacity: 0.45 }]}><View className="flex-row items-center gap-2 rounded-full bg-primary px-4 py-2.5"><MaterialIcons name="call" size={16} color="#FFFFFF" /><Text className="text-xs font-extrabold text-white">{selected.phone ? "Call municipality" : "No phone listed"}</Text></View></Pressable>{selected.website ? <Pressable onPress={() => Linking.openURL(selected.website!)} style={({ pressed }) => pressed && { opacity: 0.7 }}><View className="flex-row items-center gap-2 rounded-full border border-[#CFE0FF] bg-white px-4 py-2.5"><MaterialIcons name="language" size={16} color="#1F5EFF" /><Text className="text-xs font-extrabold text-primary">Website</Text></View></Pressable> : null}</View><Text className="mt-3 text-[10px] leading-4 text-muted">{selected.streetAddress.length ? selected.streetAddress.join(" · ") : "Street address not published in the Treasury record."}</Text></View> : null}

        <View className="mt-5 flex-1">{loading ? <View className="items-center py-12"><ActivityIndicator color="#1F5EFF" /><Text className="mt-3 text-sm text-muted">Loading official municipal contacts…</Text></View> : <FlatList data={filtered} keyExtractor={(item) => item.code} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8, paddingBottom: 26 }} renderItem={({ item }) => { const active = selected?.code === item.code; return <Pressable onPress={() => choose(item)} style={({ pressed }) => pressed && { opacity: 0.74 }}><View className={active ? "rounded-2xl border-2 border-primary bg-[#F2F7FF] p-4" : "rounded-2xl border border-border bg-surface p-4"}><View className="flex-row items-start gap-3"><View className="h-10 w-10 items-center justify-center rounded-[14px] bg-[#E9F2FF]"><MaterialIcons name="account-balance" size={19} color="#1F5EFF" /></View><View className="flex-1"><View className="flex-row items-center gap-2"><Text className="flex-1 text-sm font-extrabold text-foreground">{item.name}</Text><Text className="text-[10px] font-extrabold text-primary">{item.code}</Text></View><Text className="mt-1 text-xs text-muted">{item.province} · {item.category === "A" ? "Metropolitan municipality" : "Municipality"}</Text><View className="mt-2 flex-row items-center gap-3"><View className="flex-row items-center gap-1"><MaterialIcons name="phone" size={13} color="#27AE60" /><Text className="text-[11px] text-muted">{item.phone ?? "Phone not listed"}</Text></View>{item.website ? <MaterialIcons name="language" size={14} color="#1F5EFF" /> : null}</View></View><MaterialIcons name={active ? "expand-less" : "chevron-right"} size={20} color="#9AA5B1" /></View></View></Pressable>; }} ListEmptyComponent={<View className="items-center py-12"><MaterialIcons name="search-off" size={30} color="#9AA5B1" /><Text className="mt-3 text-sm font-bold text-foreground">No municipality matched</Text><Text className="mt-1 text-center text-xs text-muted">Try the municipality name, code, or province.</Text></View>} />}</View>
        <View className="border-t border-border py-4"><View className="flex-row items-center gap-2"><SourceBadge label="Official Treasury data" tone="official" /><Text className="text-[10px] text-muted">{TREASURY_SOURCE_UPDATED}</Text></View><Text className="mt-2 text-[10px] leading-4 text-muted">{TREASURY_SOURCE_LABEL}. For directory profiles, use the official government directory.</Text><Pressable onPress={() => Linking.openURL(GOVERNMENT_DIRECTORY_URL)} style={({ pressed }) => pressed && { opacity: 0.7 }}><Text className="mt-2 text-xs font-extrabold text-primary">Open South African Government directory →</Text></Pressable></View>
      </View>
    </ScreenContainer>
  );
}
