import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useEffect, useMemo, useState } from "react";

import { ActionButton, Chip, IconTile, InfoCard, SectionHeader, SourceBadge, TrustStrip } from "@/components/civic-ui";
import { ScreenContainer } from "@/components/screen-container";
import { issueCategories, lessons } from "@/lib/civic-data";
import { useCivic } from "@/lib/civic-store";
import { fetchOfficialMunicipalContact, getWardOfficeContact, type OfficialMunicipalContact } from "@/lib/official-directory";
import { fetchKnownProblems, type KnownProblemIntelligence, fetchServiceIntelligence, type ServiceIntelligence } from "@/lib/service-intelligence-client";

const RESPONSIBILITY: Record<string, { level: string; office: string; detail: string; lessonId: string; next: string }> = {
  streetlight: { level: "Local government", office: "Municipality / electricity or public lighting service", detail: "Start with the municipality's official service channel. A ward councillor may help follow up, but does not personally perform the repair.", lessonId: "lesson-1", next: "Document the location, describe the fault, then submit an official service report." },
  water: { level: "Local government", office: "Municipal water services", detail: "Water interruptions and municipal distribution faults are generally handled through the municipality serving your area.", lessonId: "lesson-1", next: "Check the latest official notice, then report the fault if it is not already recorded." },
  pothole: { level: "Local government", office: "Municipal roads / infrastructure", detail: "For a municipal road defect, the municipality is normally the first service channel. Keep the exact road and nearby landmark clear.", lessonId: "lesson-1", next: "Capture the location and describe the hazard without putting yourself in danger." },
  electricity: { level: "Depends on provider", office: "Municipality or electricity distributor", detail: "Responsibility can depend on who supplies the area. CivicLens should identify the service provider before you submit.", lessonId: "lesson-1", next: "Confirm the provider, then use its official fault-reporting channel." },
  sewage: { level: "Local government", office: "Municipal water / sanitation services", detail: "Municipal wastewater faults should be documented and reported through the relevant official service channel.", lessonId: "lesson-1", next: "Keep people away from unsafe wastewater and submit the location and evidence through the official route." },
  refuse: { level: "Local government", office: "Municipal waste management", detail: "Missed collection and illegal dumping concerns can be routed through the municipality's waste-management channels.", lessonId: "lesson-1", next: "Record the affected street or collection point and the date of the missed service." },
  traffic: { level: "Local government", office: "Municipal traffic / roads or signal maintenance", detail: "Traffic-signal faults should be reported quickly because they can create a safety risk.", lessonId: "lesson-1", next: "Use a safe position to document the intersection and submit an urgent service report." },
  facility: { level: "Depends on facility", office: "Responsible department or institution", detail: "Schools, clinics and public buildings can fall under different spheres or institutions. Identify the facility first.", lessonId: "lesson-2", next: "Confirm the facility and responsible authority before reporting." },
  flooding: { level: "Local government", office: "Municipal stormwater / roads services", detail: "Flooded municipal roads and stormwater failures should be routed to the municipality, while immediate danger should be treated as an emergency.", lessonId: "lesson-1", next: "Stay safe first. Then document the affected area from a safe location." },
  billing: { level: "Local government", office: "Municipal revenue / customer care", detail: "Municipal account questions normally begin with the municipality's customer-care or revenue channel.", lessonId: "lesson-3", next: "Keep your account details private and ask for a traceable reference number." },
};

export default function CivicOSScreen() {
  const [selected, setSelected] = useState("streetlight");
  const { selectedLocation } = useCivic();
  const [municipalContact, setMunicipalContact] = useState<OfficialMunicipalContact | undefined>();
  const [serviceIntel, setServiceIntel] = useState<ServiceIntelligence | undefined>();
  const [knownProblems, setKnownProblems] = useState<KnownProblemIntelligence | undefined>();
  const issue = useMemo(() => issueCategories.find((item) => item.id === selected) ?? issueCategories[0], [selected]);
  const route = RESPONSIBILITY[selected] ?? RESPONSIBILITY.streetlight;
  const lesson = lessons.find((item) => item.id === route.lessonId);
  const wardOffice = getWardOfficeContact(selectedLocation.code, selectedLocation.wardNumber);

  useEffect(() => {
    let active = true;
    fetchOfficialMunicipalContact(selectedLocation.code).then((contact) => {
      if (active) setMunicipalContact(contact);
    });
    return () => { active = false; };
  }, [selectedLocation.code]);

  useEffect(() => {
    let active = true;
    const service = selected === "electricity" ? "electricity" : selected === "water" ? "water" : selected === "pothole" || selected === "traffic" || selected === "flooding" ? "roads" : selected === "refuse" ? "refuse" : "water";
    fetchServiceIntelligence(service).then((data) => { if (active) setServiceIntel(data); });
    fetchKnownProblems(service).then((data) => { if (active) setKnownProblems(data); });
    return () => { active = false; };
  }, [selected]);

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        <View className="py-4">
          <View className="flex-row items-center gap-2">
            <View className="rounded-full bg-[#E9F2FF] px-3 py-1.5"><Text className="text-[10px] font-extrabold uppercase tracking-[1px] text-primary">Civic OS</Text></View>
            <SourceBadge label="Neutral guide" tone="civic" />
          </View>
          <Text className="mt-4 font-display text-3xl font-extrabold leading-9 text-foreground">I have a problem.<Text className="text-primary"> What do I do next?</Text></Text>
          <Text className="mt-2 text-sm leading-5 text-muted">Tell CivicLens what is happening. We will help you understand the responsible level of government, learn the basics, and choose a documented next step.</Text>
        </View>

        <TrustStrip />

        <View className="mt-6"><SectionHeader eyebrow="1 · Identify" title="What is happening?" /></View>
        <View className="flex-row flex-wrap gap-2">
          {issueCategories.map((item) => <Chip key={item.id} label={item.label} active={selected === item.id} onPress={() => setSelected(item.id)} />)}
        </View>

        <View className="mt-6 rounded-[28px] border border-[#CFE0FF] bg-[#F4F8FF] p-5">
          <View className="flex-row items-start gap-3"><IconTile icon={issue.icon} color={issue.accent} /><View className="flex-1"><Text className="text-xs font-extrabold uppercase tracking-[1px] text-primary">Your starting point</Text><Text className="mt-1 text-xl font-extrabold text-foreground">{issue.label}</Text><Text className="mt-1 text-sm leading-5 text-muted">{issue.hint}</Text></View></View>
        </View>

        <View className="mt-7"><SectionHeader eyebrow="2 · Understand" title="Who is responsible?" /></View>
        <InfoCard><View className="flex-row items-start gap-3"><IconTile icon="account-balance" color="#1769FF" /><View className="flex-1"><SourceBadge label="CivicLens routing guide" tone="civic" /><Text className="mt-3 text-xs font-extrabold uppercase tracking-[1px] text-muted">{route.level}</Text><Text className="mt-1 text-base font-extrabold text-foreground">{route.office}</Text><Text className="mt-2 text-sm leading-5 text-muted">{route.detail}</Text></View></View></InfoCard>

        <View className="mt-7"><SectionHeader eyebrow="2.5 · Route" title="Your local service profile" /></View>
        <InfoCard>
          <View className="flex-row items-start gap-3">
            <IconTile icon="location-city" color="#1769FF" />
            <View className="flex-1">
              <SourceBadge label="Official municipality data" tone="official" />
              <Text className="mt-2 text-lg font-extrabold text-foreground">{selectedLocation.name}</Text>
              <Text className="mt-1 text-xs leading-4 text-muted">{selectedLocation.province} · {selectedLocation.district}{selectedLocation.wardNumber ? ` · Ward ${selectedLocation.wardNumber}` : ""}</Text>
              <Text className="mt-3 text-xs leading-4 text-muted">This location profile determines which municipal office CivicLens shows as the starting point. It does not by itself prove that the selected office is responsible for every issue.</Text>
              {municipalContact?.phone ? (
                <Pressable onPress={() => Linking.openURL(`tel:${municipalContact.phone!.replaceAll(" ", "")}`)} className="mt-4 flex-row items-center gap-2">
                  <MaterialIcons name="phone" size={17} color="#1769FF" />
                  <Text className="text-sm font-extrabold text-primary">Call official municipal contact · {municipalContact.phone}</Text>
                </Pressable>
              ) : null}
              {municipalContact?.website ? (
                <Pressable onPress={() => Linking.openURL(municipalContact.website!)} className="mt-3 flex-row items-center gap-2">
                  <MaterialIcons name="open-in-new" size={17} color="#1769FF" />
                  <Text className="text-sm font-extrabold text-primary">Open official municipal website</Text>
                </Pressable>
              ) : null}
              {wardOffice?.whatsapp ? (
                <Text className="mt-3 text-[11px] leading-4 text-muted">Published ward-office channel: {wardOffice.whatsapp} · {wardOffice.checkedLabel}</Text>
              ) : null}
            </View>
          </View>
        </InfoCard>

        <View className="mt-7"><SectionHeader eyebrow="2.7 · Check first" title="Service intelligence" /></View>
        <InfoCard>
          <View className="flex-row items-start gap-3">
            <IconTile icon="fact-check" color="#1769FF" />
            <View className="flex-1">
              <View className="flex-row items-center gap-2"><Text className="text-sm font-extrabold text-foreground">Check official notices before reporting</Text><SourceBadge label="Official feed" tone="official" /></View>
              {serviceIntel ? (
                <>
                  <Text className="mt-2 text-xs leading-4 text-muted">{serviceIntel.notices.length ? `${serviceIntel.notices.length} relevant published notice(s) found.` : "No matching published notice was detected in the connected official service-interruption feed."}</Text>
                  {serviceIntel.notices.slice(0, 2).map((notice) => <Pressable key={notice.title} onPress={() => Linking.openURL(notice.source)} className="mt-3 rounded-2xl border border-border bg-background p-3"><Text className="text-sm font-extrabold text-foreground">{notice.title}</Text><Text className="mt-1 text-[11px] font-semibold text-primary">Open official notice →</Text></Pressable>)}
                  <Text className="mt-3 text-xs leading-4 text-muted">{serviceIntel.planned}</Text>
                  <Text className="mt-3 text-[10px] leading-4 text-muted">Checked {new Date(serviceIntel.checkedAt).toLocaleString("en-ZA")} · source availability does not prove a local outage.</Text>
                </>
              ) : <Text className="mt-2 text-xs leading-4 text-muted">The official service feed could not be checked right now. You can still report the issue or open your municipality profile.</Text>}
            </View>
          </View>
        </InfoCard>

        <View className="mt-7"><SectionHeader eyebrow="2.8 · Known problem" title="Could this already be known?" /></View>
        <InfoCard>
          <View className="flex-row items-start gap-3">
            <IconTile icon="manage-search" color="#F08A24" />
            <View className="flex-1">
              <View className="flex-row items-center gap-2"><Text className="text-sm font-extrabold text-foreground">Check before creating a duplicate report</Text><SourceBadge label="Official evidence" tone="official" /></View>
              {knownProblems?.hasPotentialKnownProblem ? (
                <>
                  <Text className="mt-2 text-xs leading-4 text-muted">An official source has information that may relate to this service. That does not prove your specific street or property is affected.</Text>
                  {knownProblems.knownProblems.slice(0, 2).map((problem) => (
                    <View key={problem.title} className="mt-3 rounded-2xl border border-[#F2D6B5] bg-[#FFF9F1] p-3">
                      <Text className="text-sm font-extrabold text-foreground">{problem.title}</Text>
                      <Text className="mt-1 text-[11px] leading-4 text-muted">{problem.scope}</Text>
                      <Pressable onPress={() => Linking.openURL(problem.source)} className="mt-3 flex-row items-center gap-1">
                        <MaterialIcons name="open-in-new" size={15} color="#1769FF" />
                        <Text className="text-xs font-extrabold text-primary">Check official problem →</Text>
                      </Pressable>
                    </View>
                  ))}
                  <Text className="mt-3 text-[11px] leading-4 text-muted">If the official source does not cover your location, you can still submit a new CivicLens case.</Text>
                </>
              ) : (
                <Text className="mt-2 text-xs leading-4 text-muted">{knownProblems ? "No potential known problem was detected in the connected official sources. You can continue with a new report." : "Known-problem verification is temporarily unavailable. You can still continue with your report."}</Text>
              )}
            </View>
          </View>
        </InfoCard>

        <View className="mt-7"><SectionHeader eyebrow="3 · Learn" title="Know the process before you act" /></View>
        {lesson ? <Pressable onPress={() => router.push("/(tabs)/learn" as never)} style={({ pressed }) => pressed && { opacity: 0.72 }}><InfoCard><View className="flex-row items-center gap-3"><IconTile icon={lesson.icon} color="#7B61FF" /><View className="flex-1"><Text className="text-xs font-extrabold uppercase tracking-[1px] text-muted">Recommended lesson · {lesson.length}</Text><Text className="mt-1 text-base font-extrabold text-foreground">{lesson.title}</Text><Text className="mt-1 text-xs leading-4 text-muted">{lesson.summary}</Text></View><MaterialIcons name="chevron-right" size={21} color="#9AA5B1" /></View></InfoCard></Pressable> : null}

        <View className="mt-7"><SectionHeader eyebrow="4 · Act" title="Your next documented step" /></View>
        <View className="rounded-[24px] border border-[#CDE9D7] bg-[#F1F9F3] p-5"><View className="flex-row items-start gap-3"><IconTile icon="task-alt" color="#27AE60" /><Text className="flex-1 text-sm font-bold leading-5 text-[#245D3A]">{route.next}</Text></View><View className="mt-4 border-t border-[#D7EBDD] pt-4"><Text className="text-xs leading-4 text-[#5A7563]">CivicLens can help document the case. It does not claim that a municipality has received, acknowledged or resolved a report unless that status is actually evidenced.</Text></View></View>

        <View className="mt-6 gap-2">
          <ActionButton label={"Report this " + issue.label.toLowerCase()} icon="add-circle-outline" onPress={() => router.push(("/(tabs)/report?issue=" + encodeURIComponent(selected)) as never)} />
          <ActionButton label="Open my government profile" icon="account-balance" variant="secondary" onPress={() => router.push("/(tabs)/government" as never)} />
        </View>

        <View className="mt-5 flex-row items-center gap-2"><MaterialIcons name="verified-user" size={15} color="#1769FF" /><Text className="flex-1 text-[11px] leading-4 text-muted">Official sources are labelled separately from CivicLens explanations. Routing can vary by municipality, provider and service.</Text></View>
      </ScrollView>
    </ScreenContainer>
  );
}
