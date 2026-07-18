import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radius, spacing, typography } from "@/src/theme";
import { apiListAnime, apiRecentAnime, Anime } from "@/src/lib/api";
import { useSession } from "@/src/contexts/session";
import { StatusPill } from "@/src/components/StatusPill";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const [recent, setRecent] = useState<Anime[]>([]);
  const [animeCount, setAnimeCount] = useState(0);
  const [donghuaCount, setDonghuaCount] = useState(0);
  const [ongoingCount, setOngoingCount] = useState(0);
  const [completeCount, setCompleteCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [recentList, animes, donghuas] = await Promise.all([
        apiRecentAnime(8),
        apiListAnime({ type: "anime" }),
        apiListAnime({ type: "donghua" }),
      ]);
      setRecent(recentList);
      setAnimeCount(animes.length);
      setDonghuaCount(donghuas.length);
      const all = [...animes, ...donghuas];
      setOngoingCount(all.filter((a) => a.status === "Ongoing").length);
      setCompleteCount(all.filter((a) => a.status === "Complete").length);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>HALO</Text>
            <Text style={styles.title} numberOfLines={1}>
              {user?.name || user?.email?.split("@")[0] || "Otaku"} 👋
            </Text>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatCard
            testID="stat-anime"
            icon="film"
            label="Anime"
            value={animeCount}
            color={colors.primary}
            onPress={() => router.push("/(app)/(tabs)/anime")}
          />
          <StatCard
            testID="stat-donghua"
            icon="planet"
            label="Donghua"
            value={donghuaCount}
            color="#7C5CFF"
            onPress={() => router.push("/(app)/(tabs)/donghua")}
          />
          <StatCard
            testID="stat-ongoing"
            icon="time"
            label="Ongoing"
            value={ongoingCount}
            color={colors.status.Ongoing}
          />
          <StatCard
            testID="stat-complete"
            icon="checkmark-circle"
            label="Complete"
            value={completeCount}
            color={colors.status.Complete}
          />
        </View>

        {/* Recent activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Aktivitas terbaru</Text>
          <Text style={styles.sectionSub}>Baru ditambah atau diedit</Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : recent.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="add-circle-outline" size={48} color={colors.text.muted} />
            <Text style={styles.emptyTitle}>Belum ada aktivitas</Text>
            <Text style={styles.emptyDesc}>
              Tambahkan anime atau donghua pertamamu lewat tab di bawah.
            </Text>
            <View style={styles.emptyCtas}>
              <TouchableOpacity
                testID="empty-add-anime"
                style={styles.emptyBtn}
                onPress={() => router.push({ pathname: "/(app)/form", params: { type: "anime" } })}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={16} color="#0A0A0C" />
                <Text style={styles.emptyBtnText}>Anime</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="empty-add-donghua"
                style={[styles.emptyBtn, { backgroundColor: "#7C5CFF" }]}
                onPress={() =>
                  router.push({ pathname: "/(app)/form", params: { type: "donghua" } })
                }
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={16} color="#0A0A0C" />
                <Text style={styles.emptyBtnText}>Donghua</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.recentList}>
            {recent.map((item) => (
              <TouchableOpacity
                key={item.id}
                testID={`recent-card-${item.id}`}
                style={styles.recentCard}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/form",
                    params: { id: item.id, type: item.type },
                  })
                }
                activeOpacity={0.85}
              >
                <View style={styles.recentImageWrap}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.recentImage} />
                  ) : (
                    <View style={[styles.recentImage, styles.recentPlaceholder]}>
                      <Ionicons name="image-outline" size={22} color={colors.text.muted} />
                    </View>
                  )}
                </View>
                <View style={{ flex: 1, justifyContent: "space-between" }}>
                  <View style={{ gap: 4 }}>
                    <Text style={styles.recentBadge}>
                      {item.type === "anime" ? "ANIME" : "DONGHUA"}
                    </Text>
                    <Text style={styles.recentTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.recentMeta}>
                      S{item.season} · EP {item.episode}
                    </Text>
                  </View>
                  <StatusPill status={item.status} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const StatCard: React.FC<{
  icon: any;
  label: string;
  value: number;
  color: string;
  onPress?: () => void;
  testID?: string;
}> = ({ icon, label, value, color, onPress, testID }) => (
  <TouchableOpacity
    testID={testID}
    activeOpacity={onPress ? 0.85 : 1}
    onPress={onPress}
    style={styles.statCard}
  >
    <View style={[styles.statIcon, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md },
  kicker: { ...typography.caption, color: colors.primary, marginBottom: 4 },
  title: { ...typography.h1, color: colors.text.primary, fontSize: 28 },
  statsGrid: {
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm + 2,
  },
  statCard: {
    flexBasis: "47.5%",
    flexGrow: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md - 2,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statValue: { ...typography.h2, color: colors.text.primary, fontSize: 22 },
  statLabel: { color: colors.text.secondary, fontSize: 12, fontWeight: "600" },
  sectionHeader: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  sectionTitle: { ...typography.h2, color: colors.text.primary, fontSize: 20 },
  sectionSub: { color: colors.text.secondary, fontSize: 12, marginTop: 2 },
  recentList: { paddingHorizontal: spacing.md, gap: 10 },
  recentCard: {
    flexDirection: "row",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentImageWrap: { width: 64, height: 86, borderRadius: radius.sm, overflow: "hidden", backgroundColor: colors.surface },
  recentImage: { width: "100%", height: "100%" },
  recentPlaceholder: { alignItems: "center", justifyContent: "center" },
  recentBadge: { ...typography.caption, color: colors.primary, fontSize: 9 },
  recentTitle: { ...typography.h3, color: colors.text.primary, fontSize: 14 },
  recentMeta: { color: colors.text.secondary, fontSize: 12 },
  center: { padding: spacing.lg, alignItems: "center", justifyContent: "center" },
  empty: { padding: spacing.lg, alignItems: "center", gap: 8 },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginTop: 8 },
  emptyDesc: { color: colors.text.secondary, fontSize: 12, textAlign: "center" },
  emptyCtas: { flexDirection: "row", gap: 10, marginTop: 12 },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  emptyBtnText: { color: "#0A0A0C", fontWeight: "800" },
});
