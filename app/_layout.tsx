import "../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";

import { AppErrorBoundary } from "@/components/error-boundary";
import { GlobalNav } from "@/components/global-nav";
import { CivicProvider } from "@/lib/civic-store";
import { ThemeProvider } from "@/lib/theme-provider";
import { createTRPCClient, trpc } from "@/lib/trpc";

const queryClient = new QueryClient();
const trpcClient = createTRPCClient();

export default function RootLayout() {
  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <ThemeProvider>
            <AppErrorBoundary>
              <CivicProvider>
                <StatusBar style="dark" />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="directory" />
                  <Stack.Screen name="intelligence" />
                  <Stack.Screen name="civic-os" />
                </Stack>
                <GlobalNav />
              </CivicProvider>
            </AppErrorBoundary>
          </ThemeProvider>
        </trpc.Provider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
