import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/src/theme";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 80 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : Platform.OS === "android" ? 8 : 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size - 2} color={color} />,
          tabBarTestID: "tab-home",
        }}
      />
      <Tabs.Screen
        name="anime"
        options={{
          title: "Anime",
          tabBarIcon: ({ color, size }) => <Ionicons name="film" size={size - 2} color={color} />,
          tabBarTestID: "tab-anime",
        }}
      />
      <Tabs.Screen
        name="donghua"
        options={{
          title: "Donghua",
          tabBarIcon: ({ color, size }) => <Ionicons name="planet" size={size - 2} color={color} />,
          tabBarTestID: "tab-donghua",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size - 2} color={color} />
          ),
          tabBarTestID: "tab-profile",
        }}
      />
    </Tabs>
  );
}
