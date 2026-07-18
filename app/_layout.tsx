import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Platform, View, StyleSheet } from "react-native";

import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { SessionProvider, useSession } from "@/src/contexts/session";
import { ToastProvider } from "@/src/components/Toast";
import { colors } from "@/src/theme";

SplashScreen.preventAutoHideAsync();

function RootContent() {
  return (
    <View style={styles.webContainer}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "fade",
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useIconFonts();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <SessionProvider>
            <ToastProvider>
              <StatusBar style="dark" />
              <RootContent />
            </ToastProvider>
          </SessionProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 450 : "100%",
    alignSelf: "center",
    backgroundColor: colors.background,
    // Add shadow/border on web to make it look like a floating mobile app
    ...(Platform.OS === "web" && {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: "#eee",
    }),
  },
});
