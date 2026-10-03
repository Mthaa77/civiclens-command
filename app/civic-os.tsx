import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useMemo, useState } from "react";

import { ActionButton, Chip, IconTile, InfoCard, SectionHeader, SourceBadge, TrustStrip } from "@/components/civic-ui";
import { ScreenContainer } from "@/components/screen-container";
import { issueCategories, lessons } from "@/lib/civic-data";

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
  const issue = useMemo(() => issueCategories.find((item) => item.id === selected) ?? issueCategories[0], [selected]);
  const route = RESPONSIBILITY[selected] ?? RESPONSIBILITY.streetlight;
  const lesson = lessons.find((item) => item.id === route.lessonId);

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
