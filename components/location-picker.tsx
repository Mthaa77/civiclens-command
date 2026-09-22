import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";

import { ActionButton, SourceBadge } from "@/components/civic-ui";
import { fetchMunicipalities, fetchWards, MDB_SOURCE_DATE, MDB_SOURCE_LABEL, type DirectorySelection, type Municipality, type Ward } from "@/lib/municipal-directory";

export function LocationPicker({ value, onChange }: { value: DirectorySelection; onChange: (location: DirectorySelection) => void }) {
  const [visible, setVisible] = useState(false);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [municipality, setMunicipality] = useState<Municipality | null>(null);
  const [search, setSearch] = useState("");
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || municipalities.length > 0) return;
    setLoadingMunicipalities(true);
    fetchMunicipalities()
      .then((items) => {
        setMunicipalities(items);
        const current = items.find((item) => item.code === value.code || item.name === value.name);
        if (current) setMunicipality(current);
      })
      .catch(() => setError("The official directory could not be reached. Check your connection and try again."))
      .finally(() => setLoadingMunicipalities(false));
  }, [municipalities.length, value.code, value.name, visible]);

  useEffect(() => {
    if (!visible || !municipality) return;
    setLoadingWards(true);
    setError(null);
    fetchWards(municipality.code)
      .then(setWards)
      .catch(() => setError("Ward data is temporarily unavailable. You can still save the municipality and resolve the ward later."))
      .finally(() => setLoadingWards(false));
  }, [municipality, visible]);

  const filteredMunicipalities = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return municipalities;
    return municipalities.filter((item) => `${item.name} ${item.province} ${item.district}`.toLowerCase().includes(query));
  }, [municipalities, search]);

  const selectMunicipality = (item: Municipality) => {
    setMunicipality(item);
    setWards([]);
    onChange(item);
  };

  const selectWard = (ward: Ward) => {
    if (!municipality) return;
    onChange({ ...municipality, wardId: ward.id, wardNumber: ward.number });
    setVisible(false);
  };

  const clearWard = () => {
    if (municipality) onChange(municipality);
    setVisible(false);
  };

  return (
    <>
      <Pressable onPress={() => setVisible(true)} style={({ pressed }) => pressed && { opacity: 0.75 }}>
        <View className="flex-row items-center gap-3 rounded-[22px] border border-[#CFE0FF] bg-[#F4F8FF] p-4">
          <View className="h-11 w-11 items-center justify-center rounded-[15px] bg-[#DCE9FF]"><MaterialIcons name="location-on" size={22} color="#1F5EFF" /></View>
          <View className="flex-1"><Text className="text-[10px] font-bold uppercase tracking-[1.3px] text-primary">Your civic location</Text><Text className="mt-1 text-base font-extrabold text-foreground">{value.name}</Text><Text className="mt-0.5 text-xs text-muted">{value.wardNumber ? `Ward ${value.wardNumber}` : "Select a ward for more precise routing"} · {value.province}</Text></View>
          <MaterialIcons name="edit" size={18} color="#1F5EFF" />
        </View>
      </Pressable>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setVisible(false)}>
        <View className="flex-1 bg-background px-5 pt-5">
          <View className="flex-row items-center justify-between"><View><Text className="font-display text-2xl font-extrabold text-foreground">Choose your area</Text><Text className="mt-1 text-sm text-muted">Municipality first, ward when you know it.</Text></View><Pressable onPress={() => setVisible(false)} accessibilityLabel="Close location picker"><View className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface"><MaterialIcons name="close" size={20} color="#52677C" /></View></Pressable></View>
          <View className="mt-5 flex-row items-center gap-2 rounded-2xl border border-border bg-surface px-3"><MaterialIcons name="search" size={19} color="#7B8794" /><TextInput value={search} onChangeText={setSearch} placeholder="Search municipality, province or district" placeholderTextColor="#97A3AF" className="flex-1 py-3 text-sm text-foreground" autoFocus /></View>
          <View className="mt-4 flex-1">
            {loadingMunicipalities ? <View className="items-center py-12"><ActivityIndicator color="#1F5EFF" /><Text className="mt-3 text-sm text-muted">Loading the official municipality directory…</Text></View> : <FlatList data={filteredMunicipalities} keyExtractor={(item) => item.code} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8, paddingBottom: 24 }} renderItem={({ item }) => { const active = municipality?.code === item.code; return <Pressable onPress={() => selectMunicipality(item)} style={({ pressed }) => pressed && { opacity: 0.72 }}><View className={active ? "rounded-2xl border-2 border-primary bg-[#F2F7FF] p-4" : "rounded-2xl border border-border bg-surface p-4"}><View className="flex-row items-start gap-3"><View className="h-9 w-9 items-center justify-center rounded-[13px] bg-[#E9F2FF]"><MaterialIcons name="account-balance" size={18} color="#1F5EFF" /></View><View className="flex-1"><Text className="text-sm font-extrabold text-foreground">{item.name}</Text><Text className="mt-1 text-xs text-muted">{item.province} · {item.district}</Text><Text className="mt-1 text-[11px] text-muted">{item.code} · {item.officialName}</Text></View>{active ? <MaterialIcons name="check-circle" size={21} color="#1F5EFF" /> : null}</View>{active ? <View className="mt-4 border-t border-[#DCE8FF] pt-3">{loadingWards ? <View className="flex-row items-center gap-2"><ActivityIndicator size="small" color="#1F5EFF" /><Text className="text-xs text-muted">Loading wards…</Text></View> : wards.length > 0 ? <><Text className="mb-2 text-xs font-extrabold text-foreground">Select a ward</Text><View className="flex-row flex-wrap gap-2">{wards.map((ward) => <Pressable key={ward.id} onPress={() => selectWard(ward)} style={({ pressed }) => pressed && { opacity: 0.65 }}><View className={value.wardId === ward.id ? "rounded-full bg-primary px-3 py-2" : "rounded-full border border-border bg-surface px-3 py-2"}><Text className={value.wardId === ward.id ? "text-xs font-bold text-white" : "text-xs font-bold text-foreground"}>Ward {ward.number}</Text></View></Pressable>)}</View><Pressable onPress={clearWard} className="mt-3"><Text className="text-xs font-bold text-primary">Use municipality only for now</Text></Pressable></> : <Text className="text-xs leading-4 text-muted">Ward data is not available for this selection yet. You can continue with the municipality.</Text>}</View> : null}</View></Pressable>; }} ListEmptyComponent={<View className="items-center py-12"><MaterialIcons name="search-off" size={30} color="#9AA5B1" /><Text className="mt-3 text-sm font-bold text-foreground">No municipalities found</Text><Text className="mt-1 text-center text-xs text-muted">Try a province, district, or municipality name.</Text></View>} />}
          </View>
          {error ? <View className="mb-3 rounded-2xl bg-[#FFF4D8] p-3"><Text className="text-xs leading-4 text-[#785B16]">{error}</Text></View> : null}
          <View className="border-t border-border py-4"><View className="flex-row items-center gap-2"><SourceBadge label="Official MDB data" tone="official" /><Text className="text-[10px] text-muted">{MDB_SOURCE_DATE}</Text></View><Text className="mt-2 text-[10px] leading-4 text-muted">{MDB_SOURCE_LABEL}. CivicLens caches the directory for faster repeat use; your location choice stays on this device.</Text><View className="mt-3"><ActionButton label="Done" icon="check" variant="secondary" onPress={() => setVisible(false)} /></View></View>
        </View>
      </Modal>
    </>
  );
}
