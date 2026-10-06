import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useEffect, useMemo, useState } from "react";

import { ActionButton, CivicContextBar, CivicStepper, CivicToast, IconTile, SourceBadge, SourceDrawer, StatusPill, TrustStrip } from "@/components/civic-ui";
import { ScreenContainer } from "@/components/screen-container";
import { issueCategories, lessons } from "@/lib/civic-data";
import { useCivic } from "@/lib/civic-store";
import { fetchOfficialMunicipalContact, getWardOfficeContact, type OfficialMunicipalContact } from "@/lib/official-directory";
import { fetchKnownProblems, fetchServiceIntelligence, type KnownProblemIntelligence, type ServiceIntelligence } from "@/lib/service-intelligence-client";

const RESPONSIBILITY: Record<string, { level: string; office: string; detail: string; lessonId: string; next: string; icon: "account-balance" | "bolt" | "business" }> = {
  streetlight: { level: "Local government", office: "Municipality / public lighting service", detail: "Start with the municipality's official service channel. A ward councillor may help follow up, but does not personally perform the repair.", lessonId: "lesson-1", next: "Document the location, describe the fault, then submit an official service report.", icon: "account-balance" },
  water: { level: "Local government", office: "Municipal water services", detail: "Water interruptions and municipal distribution faults are generally handled through the municipality serving your area.", lessonId: "lesson-1", next: "Check the latest official notice, then report the fault if it is not already recorded.", icon: "account-balance" },
  pothole: { level: "Local government", office: "Municipal roads / infrastructure", detail: "For a municipal road defect, the municipality is normally the first service channel. Keep the exact road and nearby landmark clear.", lessonId: "lesson-1", next: "Capture the location and describe the hazard without putting yourself in danger.", icon: "account-balance" },
  electricity: { level: "Depends on provider", office: "Municipality or electricity distributor", detail: "Responsibility can depend on who supplies the area. CivicLens should identify the service provider before you submit.", lessonId: "lesson-1", next: "Confirm the provider, then use its official fault-reporting channel.", icon: "bolt" },
  sewage: { level: "Local government", office: "Municipal water / sanitation services", detail: "Municipal wastewater faults should be documented and reported through the relevant official service channel.", lessonId: "lesson-1", next: "Keep people away from unsafe wastewater and submit the location and evidence through the official route.", icon: "account-balance" },
  refuse: { level: "Local government", office: "Municipal waste management", detail: "Missed collection and illegal dumping concerns can be routed through the municipality's waste-management channels.", lessonId: "lesson-1", next: "Record the affected street or collection point and the date of the missed service.", icon: "account-balance" },
  traffic: { level: "Local government", office: "Municipal traffic / roads or signal maintenance", detail: "Traffic-signal faults should be reported quickly because they can create a safety risk.", lessonId: "lesson-1", next: "Use a safe position to document the intersection and submit an urgent service report.", icon: "account-balance" },
  facility: { level: "Depends on facility", office: "Responsible department or institution", detail: "Schools, clinics and public buildings can fall under different spheres or institutions. Identify the facility first.", lessonId: "lesson-2", next: "Confirm the facility and responsible authority before reporting.", icon: "business" },
  flooding: { level: "Local government", office: "Municipal stormwater / roads services", detail: "Flooded municipal roads and stormwater failures should be routed to the municipality, while immediate danger should be treated as an emergency.", lessonId: "lesson-1", next: "Stay safe first. Then document the affected area from a safe location.", icon: "account-balance" },
  billing: { level: "Local government", office: "Municipal revenue / customer care", detail: "Municipal account questions normally begin with the municipality's customer-care or revenue channel.", lessonId: "lesson-3", next: "Keep your account details private and ask for a traceable reference number.", icon: "account-balance" },
};

const SERVICE_FOR: Record<string, string> = { electricity: "electricity", water: "water", pothole: "roads", traffic: "roads", flooding: "roads", refuse: "refuse" };

export default function CivicOSScreen() {
  const params = useLocalSearchParams<{ issue?: string }>();
  const initialIssue = typeof params.issue === "string" && RESPONSIBILITY[params.issue] ? params.issue : "streetlight";
  const [selected, setSelected] = useState(initialIssue);
  const { selectedLocation } = useCivic();
  const [municipalContact, setMunicipalContact] = useState<OfficialMunicipalContact | undefined>();
  const [serviceIntel, setServiceIntel] = useState<ServiceIntelligence | undefined>();
  const [knownProblems, setKnownProblems] = useState<KnownProblemIntelligence | undefined>();
  const issue = useMemo(() => issueCategories.find((item) => item.id === selected) ?? issueCategories[0], [selected]);
  const route = RESPONSIBILITY[selected] ?? RESPONSIBILITY.streetlight;
  const lesson = lessons.find((item) => item.id === route.lessonId);
  const wardOffice = getWardOfficeContact(selectedLocation.code, selectedLocation.wardNumber);
  const service = SERVICE_FOR[selected] ?? "water";

  useEffect(() => {
    let active = true;
    setServiceIntel(undefined);
    setKnownProblems(undefined);
    fetchOfficialMunicipalContact(selectedLocation.code).then((contact) => { if (active) setMunicipalContact(contact); });
    fetchServiceIntelligence(service).then((data) => { if (active) setServiceIntel(data); });
    fetchKnownProblems(service).then((data) => { if (active) setKnownProblems(data); });
    return () => { active = false; };
  }, [selectedLocation.code, service]);

  const reportPath = "/(tabs)/report?issue=" + encodeURIComponent(selected);

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 145 }}>
        <View className="pt-4 pb-5">
          <CivicContextBar municipality={selectedLocation.name} ward={selectedLocation.wardNumber} updated="Official location profile" />
          <View className="mt-5 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-[10px] font-extrabold uppercase tracking-[1.8px] text-primary">Civic OS</Text>
              <Text className="mt-1 font-display text-3xl font-extrabold leading-9 tracking-[-0.8px] text-foreground">Turn a problem into a plan.</Text>
            </View>
            <View className="ml-3 h-11 w-11 items-center justify-center rounded-[16px] bg-[#10202B]"><MaterialIcons name="near-me" size={22} color="#FFFFFF" /></View>
          </View>
          <Text className="mt-3 text-sm leading-5 text-muted">Four clear moves: identify the issue, understand responsibility, check official evidence, then act.</Text>
          <View className="mt-4">
            <ActionButton label="Open Civic Pulse" icon="insights" variant="secondary" onPress={() => router.push("/civic-pulse")} />
          </View>
        </View>

        <View className="rounded-[24px] border border-border bg-surface p-4">
          <CivicStepper steps={["Problem", "Responsibility", "Check", "Act"]} current={1} />
        </View>

        <View className="mt-5 rounded-[30px] bg-foreground p-5" style={{ shadowColor: "#10202B", shadowOpacity: 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 5 }}>
          <View className="flex-row items-start">
            <View className="h-14 w-14 items-center justify-center rounded-[19px] bg-[#1F5EFF]"><MaterialIcons name={issue.icon} size={27} color="#FFFFFF" /></View>
            <View className="ml-4 flex-1">
              <Text className="text-[10px] font-extrabold uppercase tracking-[1.6px] text-[#9DBEFF]">Selected problem</Text>
              <Text className="mt-1 font-display text-2xl font-extrabold leading-7 text-white">{issue.label}</Text>
              <Text className="mt-1 text-xs leading-4 text-[#C9D5DF]">{issue.hint}</Text>
            </View>
          </View>
          <View className="mt-5 flex-row items-center border-t border-white/10 pt-4">
            <StatusPill label="CIVICLENS GUIDE" tone="civic" compact />
            <Text className="ml-2 flex-1 text-[10px] text-[#AFC0CD]">Routing is guidance, not proof of responsibility.</Text>
          </View>
        </View>

        <View className="mt-8">
          <Text className="text-[10px] font-extrabold uppercase tracking-[1.7px] text-primary">1 · Identify</Text>
          <Text className="mt-1 font-display text-[22px] font-extrabold text-foreground">What is happening?</Text>
          <Text className="mt-1 text-xs leading-4 text-muted">Pick the closest description. You can refine the details when you report.</Text>
          <View className="mt-4 flex-row flex-wrap gap-2">
            {issueCategories.map((item) => (
              <Pressable key={item.id} onPress={() => setSelected(item.id)} accessibilityRole="button" accessibilityState={{ selected: selected === item.id }}>
                <View className={selected === item.id ? "flex-row items-center rounded-full bg-primary px-3 py-2.5" : "flex-row items-center rounded-full border border-border bg-surface px-3 py-2.5"}>
                  <MaterialIcons name={item.icon} size={15} color={selected === item.id ? "#FFFFFF" : item.accent} />
                  <Text className={selected === item.id ? "ml-1.5 text-xs font-extrabold text-white" : "ml-1.5 text-xs font-semibold text-foreground"}>{item.label}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-8">
          <Text className="text-[10px] font-extrabold uppercase tracking-[1.7px] text-primary">2 · Understand</Text>
          <Text className="mt-1 font-display text-[22px] font-extrabold text-foreground">Who likely handles it?</Text>
          <View className="mt-4 overflow-hidden rounded-[26px] border border-[#CFE0FF] bg-[#F4F8FF]">
            <View className="p-5">
              <View className="flex-row items-start">
                <IconTile icon={route.icon} color="#1F5EFF" />
                <View className="ml-3 flex-1">
                  <SourceBadge label="CIVICLENS ROUTING GUIDE" tone="civic" />
                  <Text className="mt-3 text-[10px] font-extrabold uppercase tracking-[1.2px] text-primary">{route.level}</Text>
                  <Text className="mt-1 text-xl font-extrabold leading-6 text-foreground">{route.office}</Text>
                  <Text className="mt-2 text-sm leading-5 text-muted">{route.detail}</Text>
                </View>
              </View>
            </View>
            <View className="border-t border-[#D8E5F5] bg-white/60 px-5 py-3.5">
              <View className="flex-row items-center">
                <MaterialIcons name="location-on" size={17} color="#1F5EFF" />
                <Text className="ml-2 flex-1 text-xs font-extrabold text-foreground">{selectedLocation.name}{selectedLocation.wardNumber ? " · Ward " + selectedLocation.wardNumber : ""}</Text>
                <Text className="text-[10px] font-bold text-muted">{selectedLocation.province}</Text>
              </View>
            </View>
          </View>
          <View className="mt-3">
            <SourceDrawer detail="Your municipality and ward profile help choose the starting office. They do not prove that every service fault belongs to that office." source={municipalContact?.website ? "Open official municipal website →" : undefined} onPress={municipalContact?.website ? () => Linking.openURL(municipalContact.website!) : undefined} />
          </View>
        </View>

        <View className="mt-8">
          <View className="flex-row items-end">
            <View className="flex-1">
              <Text className="text-[10px] font-extrabold uppercase tracking-[1.7px] text-primary">3 · Check</Text>
              <Text className="mt-1 font-display text-[22px] font-extrabold text-foreground">Could this already be known?</Text>
              <Text className="mt-1 text-xs leading-4 text-muted">Check connected official signals before creating a duplicate report.</Text>
            </View>
            <StatusPill label={serviceIntel ? "LIVE CHECK" : "CHECKING"} tone={serviceIntel ? "official" : "warning"} compact />
          </View>

          <View className="mt-4 gap-3">
            <View className="rounded-[24px] border border-border bg-surface p-4">
              <View className="flex-row items-center">
                <IconTile icon="fact-check" color="#237A4B" size="small" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-extrabold text-foreground">Official service notices</Text>
                  <Text className="mt-1 text-[11px] leading-4 text-muted">{serviceIntel ? (serviceIntel.notices.length ? serviceIntel.notices.length + " relevant notice(s) detected." : "No matching notice detected.") : "Checking the connected official feed…"}</Text>
                </View>
                <SourceBadge label="OFFICIAL" tone="official" />
              </View>
              {serviceIntel?.notices.slice(0, 2).map((notice) => (
                <Pressable key={notice.title} onPress={() => Linking.openURL(notice.source)} className="mt-3 rounded-[18px] border border-border bg-background p-3">
                  <Text className="text-xs font-extrabold leading-4 text-foreground">{notice.title}</Text>
                  <Text className="mt-1 text-[10px] font-extrabold text-primary">Open source →</Text>
                </Pressable>
              ))}
              {serviceIntel ? <Text className="mt-3 text-[10px] leading-4 text-muted">Checked {new Date(serviceIntel.checkedAt).toLocaleString("en-ZA")}. Official-source availability does not prove your street or property is affected.</Text> : null}
            </View>

            <View className={knownProblems?.hasPotentialKnownProblem ? "rounded-[24px] border border-[#F0D5AF] bg-[#FFF9F1] p-4" : "rounded-[24px] border border-border bg-surface p-4"}>
              <View className="flex-row items-start">
                <IconTile icon="manage-search" color="#A96D00" size="small" />
                <View className="ml-3 flex-1">
                  <View className="flex-row items-center">
                    <Text className="flex-1 text-sm font-extrabold text-foreground">Possible known problem</Text>
                    <StatusPill label={knownProblems?.hasPotentialKnownProblem ? "POSSIBLE MATCH" : "NO MATCH"} tone={knownProblems?.hasPotentialKnownProblem ? "warning" : "neutral"} compact />
                  </View>
                  <Text className="mt-1 text-[11px] leading-4 text-muted">{knownProblems?.hasPotentialKnownProblem ? "Official information may relate to this service. It is not proof that your exact location is affected." : knownProblems ? "No potential known problem was detected in the connected official sources." : "Checking official known-problem signals…"}</Text>
                  {knownProblems?.knownProblems.slice(0, 2).map((problem) => (
                    <Pressable key={problem.title} onPress={() => Linking.openURL(problem.source)} className="mt-3 rounded-[18px] border border-[#EAD7BD] bg-white/70 p-3">
                      <Text className="text-xs font-extrabold text-foreground">{problem.title}</Text>
                      <Text className="mt-1 text-[10px] leading-4 text-muted">{problem.scope}</Text>
                      <Text className="mt-2 text-[10px] font-extrabold text-primary">Check official problem →</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {knownProblems?.hasPotentialKnownProblem ? <View className="mt-3"><CivicToast icon="info-outline" tone="warning" message="If the official source does not cover your location, you can still report a new CivicLens case." /></View> : null}
        </View>

        <View className="mt-8">
          <Text className="text-[10px] font-extrabold uppercase tracking-[1.7px] text-primary">4 · Act</Text>
          <Text className="mt-1 font-display text-[22px] font-extrabold text-foreground">Choose the next move</Text>
          <View className="mt-4 rounded-[26px] border border-[#CDE9D7] bg-[#F1F9F3] p-5">
            <View className="flex-row items-start">
              <View className="h-11 w-11 items-center justify-center rounded-[15px] bg-[#DDF2E4]"><MaterialIcons name="task-alt" size={22} color="#237A4B" /></View>
              <View className="ml-3 flex-1">
                <Text className="text-[10px] font-extrabold uppercase tracking-[1.2px] text-[#237A4B]">Recommended next step</Text>
                <Text className="mt-1 text-base font-extrabold leading-5 text-[#245D3A]">{route.next}</Text>
              </View>
            </View>
            <View className="mt-4 border-t border-[#D7EBDD] pt-4"><Text className="text-[11px] leading-4 text-[#5A7563]">CivicLens can document your case and help you keep a timeline. It does not claim that a government office received, acknowledged or resolved a report unless that status is evidenced.</Text></View>
          </View>

          {lesson ? (
            <Pressable onPress={() => router.push("/(tabs)/learn" as never)} className="mt-3">
              <View className="flex-row items-center rounded-[22px] border border-border bg-surface p-4">
                <IconTile icon={lesson.icon} color="#1F5EFF" size="small" />
                <View className="ml-3 flex-1">
                  <Text className="text-[10px] font-extrabold uppercase tracking-[1px] text-muted">Recommended lesson · {lesson.length}</Text>
                  <Text className="mt-1 text-sm font-extrabold text-foreground">{lesson.title}</Text>
                  <Text className="mt-1 text-[11px] leading-4 text-muted">{lesson.summary}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={21} color="#718092" />
              </View>
            </Pressable>
          ) : null}
        </View>

        <View className="mt-6 rounded-[24px] border border-border bg-surface p-4">
          <View className="flex-row items-center">
            <MaterialIcons name="phone" size={17} color="#1F5EFF" />
            <View className="ml-3 flex-1">
              <Text className="text-xs font-extrabold text-foreground">Official contact path</Text>
              <Text className="mt-1 text-[10px] leading-4 text-muted">{municipalContact?.phone || "Use the official municipality profile for the current contact channel."}</Text>
            </View>
            {municipalContact?.phone ? <Pressable onPress={() => Linking.openURL("tel:" + municipalContact.phone!.replaceAll(" ", ""))} className="rounded-full bg-[#EAF2FF] px-3 py-2"><Text className="text-[10px] font-extrabold text-primary">CALL</Text></Pressable> : null}
          </View>
          {wardOffice?.whatsapp ? <Text className="mt-3 text-[10px] leading-4 text-muted">Published ward-office channel: {wardOffice.whatsapp} · {wardOffice.checkedLabel}</Text> : null}
        </View>

        <View className="mt-5 gap-2">
          <ActionButton label={knownProblems?.hasPotentialKnownProblem ? "Report anyway" : "Report this " + issue.label.toLowerCase()} icon="add-circle-outline" onPress={() => router.push(reportPath as never)} />
          <ActionButton label="Open my government profile" icon="account-balance" variant="secondary" onPress={() => router.push("/(tabs)/government" as never)} />
        </View>

        <View className="mt-5"><TrustStrip compact /></View>
      </ScrollView>
    </ScreenContainer>
  );
}
