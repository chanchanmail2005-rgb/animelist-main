import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radius, spacing, typography, STATUS_OPTIONS } from "@/src/theme";
import {
  apiDelete,
  apiFinish,
  apiGenres,
  apiListAnime,
  apiNext,
  apiPrevious,
  apiUpdateAnime,
  Anime,
  AnimeStatus,
  EntryType,
} from "@/src/lib/api";
import { AnimeCard } from "@/src/components/AnimeCard";
import { useToast } from "@/src/components/Toast";
import { ConfirmDialog } from "@/src/components/ConfirmDialog";

type Props = { type: EntryType; title: string; subtitle: string };

export const AnimeListScreen: React.FC<Props> = ({ type, title, subtitle }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { show } = useToast();
  const [items, setItems] = useState<Anime[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<string | undefined>();
  const [status, setStatus] = useState<AnimeStatus | undefined>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Anime | null>(null);

  const fetchAll = useCallback(
    async (showSpinner = false) => {
      if (showSpinner) setLoading(true);
      try {
        const [list, g] = await Promise.all([
          apiListAnime({ type, search: search || undefined, genre, status }),
          apiGenres(type),
        ]);
        setItems(list);
        setGenres(g);
      } catch (e: any) {
        show(e?.message || "Gagal memuat data", "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [type, search, genre, status, show],
  );

  useFocusEffect(
    useCallback(() => {
      fetchAll(true);
    }, [fetchAll]),
  );

  // refetch on search debounce
  useEffect(() => {
    const t = setTimeout(() => fetchAll(false), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, genre, status]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAll(false);
  }, [fetchAll]);

  const optimisticUpdate = (id: string, updater: (a: Anime) => Anime) => {
    setItems((cur) => cur.map((a) => (a.id === id ? updater(a) : a)));
  };

  const handleNext = async (item: Anime) => {
    optimisticUpdate(item.id, (a) => ({ ...a, episode: a.episode + 1 }));
    try {
      const updated = await apiNext(item.id);
      setItems((cur) => cur.map((a) => (a.id === item.id ? updated : a)));
    } catch (e: any) {
      show(e?.message || "Gagal +1 episode", "error");
      fetchAll(false);
    }
  };

  const handlePrev = async (item: Anime) => {
    if (item.episode <= 0) return;
    optimisticUpdate(item.id, (a) => ({ ...a, episode: Math.max(0, a.episode - 1) }));
    try {
      const updated = await apiPrevious(item.id);
      setItems((cur) => cur.map((a) => (a.id === item.id ? updated : a)));
    } catch (e: any) {
      show(e?.message || "Gagal -1 episode", "error");
      fetchAll(false);
    }
  };

  const handleFinish = async (item: Anime) => {
    optimisticUpdate(item.id, (a) => ({ ...a, status: "Complete" }));
    try {
      const updated = await apiFinish(item.id);
      setItems((cur) => cur.map((a) => (a.id === item.id ? updated : a)));
      show(`${item.title} ditandai Complete`, "success");
    } catch (e: any) {
      show(e?.message || "Gagal menandai selesai", "error");
      fetchAll(false);
    }
  };

  const handleEdit = (item: Anime) => {
    router.push({ pathname: "/(app)/form", params: { id: item.id, type } });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const t = deleteTarget;
    setDeleteTarget(null);
    setItems((cur) => cur.filter((a) => a.id !== t.id));
    try {
      await apiDelete(t.id);
      show("Berhasil dihapus", "success");
    } catch (e: any) {
      show(e?.message || "Gagal menghapus", "error");
      fetchAll(false);
    }
  };

  const headerHeight = useMemo(() => 0, []);

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <View style={styles.headerBlock}>
        <Text style={styles.kicker}>{subtitle}</Text>
        <Text style={styles.title} testID={`list-title-${type}`}>
          {title}
        </Text>

        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={colors.text.secondary} />
          <TextInput
            testID={`search-input-${type}`}
            value={search}
            onChangeText={setSearch}
            placeholder="Cari judul..."
            placeholderTextColor={colors.text.muted}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={colors.text.muted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View testID="status-chip-row" style={styles.chipRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipScrollContent}
          >
            <Chip
              testID={`status-chip-all`}
              label="Semua"
              active={!status}
              onPress={() => setStatus(undefined)}
            />
            {STATUS_OPTIONS.map((s) => (
              <Chip
                key={s}
                testID={`status-chip-${s}`}
                label={s}
                active={status === s}
                color={colors.status[s]}
                onPress={() => setStatus(status === s ? undefined : s)}
              />
            ))}
          </ScrollView>
        </View>

        {genres.length > 0 ? (
          <View testID="genre-chip-row" style={styles.chipRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScrollContent}
            >
              <Chip
                testID="genre-chip-all"
                label="Semua Genre"
                active={!genre}
                onPress={() => setGenre(undefined)}
              />
              {genres.map((g) => (
                <Chip
                  key={g}
                  testID={`genre-chip-${g}`}
                  label={g}
                  active={genre === g}
                  onPress={() => setGenre(genre === g ? undefined : g)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="film-outline" size={48} color={colors.text.muted} />
          <Text style={styles.emptyTitle}>Belum ada {type === "anime" ? "anime" : "donghua"}</Text>
          <Text style={styles.emptyDesc}>
            Tap tombol + untuk menambahkan {type === "anime" ? "anime" : "donghua"} pertamamu.
          </Text>
        </View>
      ) : (
        <FlatList
          testID={`list-${type}`}
          data={items}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{
            padding: spacing.md,
            paddingTop: headerHeight,
            paddingBottom: 120 + insets.bottom,
            gap: spacing.sm + 4,
          }}
          ItemSeparatorComponent={null}
          renderItem={({ item }) => (
            <AnimeCard
              item={item}
              onPrev={() => handlePrev(item)}
              onNext={() => handleNext(item)}
              onFinish={() => handleFinish(item)}
              onEdit={() => handleEdit(item)}
              onDelete={() => setDeleteTarget(item)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}

      <TouchableOpacity
        testID={`fab-add-${type}`}
        style={[styles.fab, { bottom: 24 + insets.bottom }]}
        onPress={() => router.push({ pathname: "/(app)/form", params: { type } })}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={colors.background} />
      </TouchableOpacity>

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Hapus dari daftar?"
        message={
          deleteTarget
            ? `"${deleteTarget.title}" akan dihapus permanen dari daftar.`
            : undefined
        }
        confirmLabel="Hapus"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeAreaView>
  );
};

const Chip: React.FC<{
  label: string;
  active: boolean;
  color?: string;
  onPress: () => void;
  testID?: string;
}> = ({ label, active, color, onPress, testID }) => (
  <TouchableOpacity
    testID={testID}
    onPress={onPress}
    activeOpacity={0.7}
    style={[
      styles.chip,
      active && { backgroundColor: color || colors.primary, borderColor: color || colors.primary },
    ]}
  >
    <Text
      style={[
        styles.chipText,
        active && { color: "#0A0A0C", fontWeight: "800" },
      ]}
      numberOfLines={1}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  headerBlock: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: 10,
  },
  kicker: { ...typography.caption, color: colors.primary },
  title: { ...typography.h1, color: colors.text.primary, fontSize: 28 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    marginTop: 4,
  },
  searchInput: { flex: 1, color: colors.text.primary, fontSize: 14 },
  chipRow: { height: 40 },
  chipScrollContent: { gap: 8, paddingRight: spacing.md, alignItems: "center" },
  chip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  chipText: { color: colors.text.secondary, fontSize: 12, fontWeight: "600" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, gap: 8 },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginTop: 12 },
  emptyDesc: { color: colors.text.secondary, fontSize: 13, textAlign: "center" },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
