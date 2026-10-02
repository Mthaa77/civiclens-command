import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Image } from "expo-image";
import { Linking, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { ActionButton, Chip, IconTile, InfoCard, SectionHeader, SourceBadge, SyncBadge, TrustStrip } from "@/components/civic-ui";
import { ScreenContainer } from "@/components/screen-container";
import { categoryById, governmentContacts, issueCategories, todayLabel } from "@/lib/civic-data";
import { useCivic } from "@/lib/civic-store";

const steps = ["Issue", "Location", "Evidence", "Report", "Save"];

export default function ReportScreen() {
  const { syncCaseToCloud, selectedLocation } = useCivic();
  const [step, setStep] = useState(0);
  const [selectedId, setSelectedId] = useState("streetlight");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState(`${selectedLocation.name}, ${selectedLocation.province}`);
  const [landmark, setLandmark] = useState("");
  const [reference, setReference] = useState("");
  const [evidenceAdded, setEvidenceAdded] = useState(false);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [evidenceName, setEvidenceName] = useState<string | null>(null);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);

  const chooseEvidence = () => {
    setEvidenceError(null);
    if (Platform.OS !== "web") {
      setEvidenceError("Photo capture is coming to the mobile app next. For now, CivicLens supports image selection in the web app.");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.setAttribute("capture", "environment");
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        setEvidenceError("Please choose an image smaller than 5 MB.");
        return;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setEvidenceError("Please choose a JPG, PNG or WebP image.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") return;
        setEvidencePreview(reader.result);
        setEvidenceName(file.name);
        setEvidenceAdded(true);
      };
      reader.onerror = () => setEvidenceError("We could not read that image. Please try again.");
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const removeEvidence = () => {
    setEvidenceAdded(false);
    setEvidencePreview(null);
    setEvidenceName(null);
    setEvidenceError(null);
  };
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const category = useMemo(() => categoryById(selectedId), [selectedId]);

  const next = () => {
    if (step === 0 && notes.trim().length < 8) { setSaveError("Add a little more detail so the case has a useful starting record."); return; }
    setSaveError(null); setStep((current) => Math.min(current + 1, steps.length - 1));
  };
  const back = () => setStep((current) => Math.max(current - 1, 0));

  const saveCase = async () => {
    setSaving(true); setSaveError(null);
    try {
    const created = await syncCaseToCloud({
      issueType: category.id,
      title: `${category.label} reported near ${landmark || location}`,
      municipality: selectedLocation.name,
      ward: selectedLocation.wardNumber ? `Ward ${selectedLocation.wardNumber}` : "Ward not selected",
      status: reference.trim() ? "Government reference recorded" : "Ready to report",
      statusTone: reference.trim() ? "success" : "warning",
      createdAt: todayLabel(),
      reference: reference.trim() || "Not added yet",
      evidenceCount: evidenceAdded ? 1 : 0,
      location: `${location} · private location`,
      visibility: "Private",
      events: [
        { date: todayLabel().replace(" 2026", ""), label: "Problem documented", detail: notes || "Issue details captured in CivicLens" },
        ...(reference.trim() ? [{ date: todayLabel().replace(" 2026", ""), label: "Reference number added", detail: reference.trim() }] : []),
      ],
    });
    setSavedId(created.id);
    setStep(4);
  };

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="flex-row items-center justify-between py-4"><View><Text className="font-display text-2xl font-extrabold text-foreground">Start a civic report</Text><Text className="mt-1 text-sm text-muted">Turn what you see into a clear next step.</Text></View><View className="h-10 w-10 items-center justify-center rounded-full bg-[#E9F2FF]"><MaterialIcons name="add-a-photo" size={20} color="#1769FF" /></View></View>

        <View className="mb-3 flex-row items-center justify-between rounded-2xl border border-border bg-surface px-3 py-3"><SyncBadge label="Private case flow"/><Text className="text-[10px] font-semibold text-muted">No public posting</Text></View><View className="mb-5 flex-row items-center justify-between rounded-2xl border border-border bg-surface px-3 py-3">{steps.map((label, index) => <View key={label} className="items-center"><View className={index <= step ? "h-7 w-7 items-center justify-center rounded-full bg-primary" : "h-7 w-7 items-center justify-center rounded-full bg-[#E8EDF2]"}><Text className={index <= step ? "text-xs font-extrabold text-white" : "text-xs font-extrabold text-muted"}>{index + 1}</Text></View><Text className={index <= step ? "mt-1 text-[10px] font-extrabold text-primary" : "mt-1 text-[10px] font-semibold text-muted"}>{label}</Text></View>)}</View>

        {step === 0 ? <>
          <SectionHeader eyebrow="Step 1 of 5" title="Start with what you can see" />
          <Text className="mb-3 text-sm leading-5 text-muted">Describe the issue in plain language. We will help work out the likely route.</Text>
          <TextInput value={notes} onChangeText={setNotes} placeholder="Describe the problem in your own words" placeholderTextColor="#97A3AF" multiline className="min-h-[94px] rounded-2xl border border-border bg-surface px-4 py-3 text-sm leading-5 text-foreground" />
          <Text className="mb-3 mt-6 text-sm font-extrabold text-foreground">Or choose a common issue</Text>
          <View className="gap-2">{issueCategories.slice(0, 8).map((item) => <Pressable key={item.id} onPress={() => setSelectedId(item.id)} style={({ pressed }) => pressed && { opacity: 0.72 }}><View className={item.id === selectedId ? "flex-row items-center gap-3 rounded-2xl border-2 border-primary bg-[#F2F7FF] p-3" : "flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-3"}><IconTile icon={item.icon} color={item.accent} size="small" /><View className="flex-1"><Text className="text-sm font-extrabold text-foreground">{item.label}</Text><Text className="mt-0.5 text-xs text-muted">{item.hint}</Text></View>{item.id === selectedId ? <MaterialIcons name="check-circle" size={22} color="#1769FF" /> : <MaterialIcons name="radio-button-unchecked" size={22} color="#C1CAD4" />}</View></Pressable>)}</View>
        </> : null}

        {step === 1 ? <>
          <SectionHeader eyebrow="Step 2 of 5" title="Where is it happening?" />
          <Text className="mb-4 text-sm leading-5 text-muted">Use an area or landmark for routing. Your exact location stays private by default.</Text>
          <InfoCard><View className="h-36 overflow-hidden rounded-2xl bg-[#DDE7EE]"><View className="absolute left-0 right-0 top-8 h-3 rotate-[18deg] bg-[#F7FBFD]" /><View className="absolute -left-6 right-0 top-20 h-2 -rotate-[12deg] bg-[#F7FBFD]" /><View className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary/20"><View className="h-4 w-4 rounded-full border-2 border-white bg-primary" /></View><Text className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-[#52677C]">Private location preview</Text></View><View className="mt-3 flex-row items-center gap-2"><MaterialIcons name="location-on" size={18} color="#1769FF" /><Text className="text-sm font-extrabold text-foreground">{location}</Text></View></InfoCard>
          <Text className="mb-2 mt-5 text-sm font-extrabold text-foreground">Area or suburb</Text><TextInput value={location} onChangeText={setLocation} placeholder="e.g. Soshanguve" placeholderTextColor="#97A3AF" className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground" />
          <Text className="mb-2 mt-5 text-sm font-extrabold text-foreground">Nearest landmark <Text className="font-normal text-muted">(optional)</Text></Text><TextInput value={landmark} onChangeText={setLandmark} placeholder="e.g. outside the library" placeholderTextColor="#97A3AF" className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground" />
          <View className="mt-4 flex-row items-center gap-2"><MaterialIcons name="info-outline" size={17} color="#1769FF" /><Text className="flex-1 text-xs leading-4 text-muted">CivicLens will confirm the municipality before you submit a case.</Text></View>
        </> : null}

        {step === 2 ? <>
          <SectionHeader eyebrow="Step 3 of 5" title="Add useful evidence" />
          <Text className="mb-4 text-sm leading-5 text-muted">Good evidence helps the right office act faster. Only collect what you need, and keep it private.</Text>
          <Pressable onPress={chooseEvidence} style={({ pressed }) => pressed && { opacity: 0.72 }}><InfoCard className={evidenceAdded ? "border-primary" : ""}><View className="flex-row items-center gap-3"><IconTile icon="photo-camera" color="#1769FF" /><View className="flex-1"><Text className="text-sm font-extrabold text-foreground">{evidenceAdded ? "Photo attached" : "Add a photo of the issue"}</Text><Text className="mt-1 text-xs leading-4 text-muted">{evidenceAdded ? evidenceName ?? "1 image selected" : "Choose a clear JPG, PNG or WebP image (max 5 MB)"}</Text></View><MaterialIcons name={evidenceAdded ? "check-circle" : "add-circle-outline"} size={24} color={evidenceAdded ? "#27AE60" : "#1769FF"} /></View></InfoCard></Pressable>
          {evidencePreview ? <View className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface"><Image source={{ uri: evidencePreview }} contentFit="cover" style={{ width: "100%", height: 220 }} /><View className="flex-row items-center justify-between p-3"><Text className="flex-1 pr-3 text-xs font-semibold text-muted">Preview only for now — permanent private storage will use R2 when enabled.</Text><Pressable onPress={removeEvidence}><Text className="text-xs font-extrabold text-red-600">Remove</Text></Pressable></View></View> : null}
          {evidenceError ? <View className="mt-3 rounded-2xl bg-[#FFF1F1] p-3"><Text className="text-xs leading-4 text-red-700">{evidenceError}</Text></View> : null}
          <View className="mt-3 gap-3"><View className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4"><IconTile icon="schedule" color="#F1B84B" size="small" /><View className="flex-1"><Text className="text-sm font-extrabold text-foreground">When did you notice it?</Text><Text className="mt-1 text-xs text-muted">Today · add a more precise time later if useful</Text></View></View><View className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4"><IconTile icon="place" color="#7B61FF" size="small" /><View className="flex-1"><Text className="text-sm font-extrabold text-foreground">Nearby landmark</Text><Text className="mt-1 text-xs text-muted">{landmark || "Not added yet"}</Text></View></View></View>
          <View className="mt-5 rounded-2xl bg-[#FFF8E8] p-4"><View className="flex-row gap-2"><MaterialIcons name="lock-outline" size={18} color="#9A6B00" /><Text className="flex-1 text-xs leading-4 text-[#785B16]">Your evidence is private by default. A public map uses an area-level location, not your exact address.</Text></View></View>
        </> : null}

        {step === 3 ? <>
          <SectionHeader eyebrow="Step 4 of 5" title="Who is likely responsible?" />
          <Text className="mb-4 text-sm leading-5 text-muted">Based on your issue and location, the first documented route is municipal service support.</Text>
          <InfoCard><View className="flex-row items-start gap-3"><IconTile icon="account-balance" color="#1769FF" /><View className="flex-1"><SourceBadge label="Likely responsible body" tone="official" /><Text className="mt-3 text-lg font-extrabold text-foreground">{selectedLocation.name}</Text><Text className="mt-1 text-sm leading-5 text-muted">{category.label} is normally handled at municipal level in {selectedLocation.province}. The municipality can route the case to the relevant service team.</Text></View></View><View className="mt-4 border-t border-border pt-3"><Text className="text-xs leading-4 text-muted">CivicLens does not replace the official municipal process. Use the current official channel and save the reference number.</Text></View></InfoCard>
          <Text className="mb-2 mt-6 text-sm font-extrabold text-foreground">Verified reporting options</Text>
          {selectedLocation.code === "TSH" ? governmentContacts.slice(0, 2).map((contact) => <Pressable key={contact.value} onPress={() => Linking.openURL(`tel:${contact.value.replaceAll(" ", "")}`)} style={({ pressed }) => pressed && { opacity: 0.72 }}><View className="mb-2 flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-3"><IconTile icon={contact.icon} color="#27AE60" size="small" /><View className="flex-1"><Text className="text-sm font-extrabold text-foreground">{contact.label}</Text><Text className="mt-1 text-xs text-muted">{contact.value} · {contact.helper}</Text></View><MaterialIcons name="call" size={18} color="#27AE60" /></View></Pressable>) : <Pressable onPress={() => Linking.openURL("https://www.gov.za/about-government/contact-directory")}><View className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4"><IconTile icon="public" color="#1769FF" size="small" /><View className="flex-1"><Text className="text-sm font-extrabold text-foreground">Find the official local contact</Text><Text className="mt-1 text-xs leading-4 text-muted">Open the South African Government contact directory for {selectedLocation.name}.</Text></View><MaterialIcons name="open-in-new" size={18} color="#1769FF" /></View></Pressable>}
          <View className="mt-4 flex-row flex-wrap gap-2"><Chip label="Official source" tone="success" /><Chip label="Last checked 22 Sep 2026" tone="info" /></View>
        </> : null}

        {step === 4 && !savedId ? <>
          <SectionHeader eyebrow="Step 5 of 5" title="Save your private case" />
          <Text className="mb-4 text-sm leading-5 text-muted">A CivicLens case helps you keep the timeline, evidence and next step together.</Text>
          <InfoCard><View className="flex-row items-start gap-3"><IconTile icon="folder-special" color="#1769FF" /><View className="flex-1"><Text className="text-base font-extrabold text-foreground">{category.label} near {landmark || location}</Text><Text className="mt-1 text-sm text-muted">{selectedLocation.name}{selectedLocation.wardNumber ? ` · Ward ${selectedLocation.wardNumber}` : ""} · Private case</Text></View></View><View className="mt-4 border-t border-border pt-3"><Text className="text-xs font-extrabold uppercase tracking-[1px] text-muted">Government reference number</Text><TextInput value={reference} onChangeText={setReference} placeholder="Add after you report (optional now)" placeholderTextColor="#97A3AF" className="mt-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground" /></View></InfoCard>
          <View className="mt-4 rounded-2xl bg-[#F1F7F3] p-4"><View className="flex-row gap-2"><MaterialIcons name="check-circle" size={18} color="#27AE60" /><Text className="flex-1 text-xs leading-4 text-[#23613B]">You can set a follow-up reminder later. Any reminder is a planning aid, not a legal deadline.</Text></View></View>
          {saveError ? <View className="mb-3 rounded-2xl border border-[#F2CACA] bg-[#FFF1F1] p-3"><View className="flex-row gap-2"><MaterialIcons name="error-outline" size={18} color="#B84444"/><Text className="flex-1 text-xs leading-4 text-[#8E3636]">{saveError}</Text></View></View> : null}<View className="mt-6"><ActionButton disabled={saving} label={saving ? "Saving securely…" : "Save case privately"} icon={saving ? "sync" : "lock"} onPress={() => { void saveCase(); }} /></View>
        </> : null}

        {savedId ? <View className="items-center rounded-[28px] border border-[#CDE9D7] bg-[#F1F9F3] px-5 py-8"><View className="h-16 w-16 items-center justify-center rounded-full bg-[#D9F2E1]"><MaterialIcons name="check" size={34} color="#27AE60" /></View><Text className="mt-4 text-center text-2xl font-extrabold text-foreground">Case saved</Text><Text className="mt-2 text-center text-sm leading-5 text-muted">Your private CivicLens case {savedId} is stored in CivicLens Cloud for this browser/device and ready for follow-up.</Text><View className="mt-5 w-full rounded-2xl bg-white/70 p-4"><Text className="text-xs font-extrabold uppercase tracking-[1px] text-muted">Next documented step</Text><Text className="mt-2 text-sm font-extrabold text-foreground">Report through the official municipal channel, then add the reference number here.</Text></View><View className="mt-5 w-full gap-2"><ActionButton label="View my cases" icon="folder-open" onPress={() => router.push("/(tabs)/cases" as never)} /><ActionButton label="Start another report" icon="add" variant="secondary" onPress={() => { setSavedId(null); setStep(0); setReference(""); setNotes(""); }} /></View></View> : null}

        {!savedId ? <View className="mt-6"><TrustStrip compact/></View><View className="mt-7 flex-row justify-between"><Pressable disabled={step === 0} onPress={back} style={({ pressed }) => pressed && { opacity: 0.6 }}><Text className={step === 0 ? "text-sm font-bold text-[#C5CBD2]" : "text-sm font-bold text-muted"}>← Back</Text></Pressable>{step < 4 ? <ActionButton label={step === 3 ? "Review case" : "Continue"} icon="arrow-forward" onPress={next} /> : null}</View> : null}
        <View className="mt-6 flex-row items-center gap-2"><MaterialIcons name="verified-user" size={15} color="#1769FF" /><Text className="text-[11px] leading-4 text-muted">Sources used: MDB Wards 2026 · reviewed {todayLabel()}</Text></View>
      </ScrollView>
    </ScreenContainer>
  );
}
