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

import { CivicProvider } from "@/lib/civic-store";
import { AppErrorBoundary } from "@/components/error-boundary";
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

  // Never block the entire app on remote font loading.
  // If a font asset is slow or unavailable, the UI renders immediately
  // and the browser/native text falls back gracefully.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <ThemeProvider>
            <CivicProvider>
              <StatusBar style="dark" />
              <AppErrorBoundary>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="directory" />
                <Stack.Screen name="intelligence" />
              </Stack>
              </AppErrorBoundary>
            </CivicProvider>
          </ThemeProvider>
        </trpc.Provider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
