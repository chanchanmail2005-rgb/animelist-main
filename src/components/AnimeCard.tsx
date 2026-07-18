import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/src/theme";
import { StatusPill } from "./StatusPill";
import type { Anime } from "@/src/lib/api";

type Props = {
  item: Anime;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPress?: () => void;
};

export const AnimeCard: React.FC<Props> = ({
  item,
  onPrev,
  onNext,
  onFinish,
  onEdit,
  onDelete,
  onPress,
}) => {
  const isComplete = item.status === "Complete";
  return (
    <TouchableOpacity
      testID={`anime-card-${item.id}`}
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.imageWrap}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={28} color={colors.text.muted} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={{ gap: 6 }}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>S{item.season}</Text>
            <Text style={styles.metaDivider}>•</Text>
            <Text style={styles.metaText}>EP {item.episode}</Text>
            {item.genre ? (
              <>
                <Text style={styles.metaDivider}>•</Text>
                <Text style={styles.metaText} numberOfLines={1}>
                  {item.genre}
                </Text>
              </>
            ) : null}
          </View>
          <StatusPill status={item.status} testID={`anime-status-${item.id}`} />
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.epActions}>
            <TouchableOpacity
              testID={`anime-prev-${item.id}`}
              onPress={onPrev}
              style={[styles.iconBtn, isComplete && styles.iconBtnDisabled]}
              disabled={isComplete}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Ionicons name="remove" size={16} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              testID={`anime-next-${item.id}`}
              onPress={onNext}
              style={[styles.iconBtn, isComplete && styles.iconBtnDisabled]}
              disabled={isComplete}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Ionicons name="add" size={16} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              testID={`anime-finish-${item.id}`}
              onPress={onFinish}
              style={[
                styles.iconBtn,
                styles.finishBtn,
                isComplete && styles.iconBtnDisabled,
              ]}
              disabled={isComplete}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Ionicons name="checkmark" size={16} color={colors.background} />
            </TouchableOpacity>
          </View>
          <View style={styles.crudActions}>
            <TouchableOpacity
              testID={`anime-edit-${item.id}`}
              onPress={onEdit}
              activeOpacity={0.7}
              hitSlop={8}
              style={styles.ghostIcon}
            >
              <Ionicons name="create-outline" size={18} color={colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              testID={`anime-delete-${item.id}`}
              onPress={onDelete}
              activeOpacity={0.7}
              hitSlop={8}
              style={styles.ghostIcon}
            >
              <Ionicons name="trash-outline" size={18} color={colors.status.Hiatus} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm + 2,
    gap: spacing.md - 4,
  },
  imageWrap: {
    width: 90,
    height: 120,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  info: { flex: 1, justifyContent: "space-between" },
  title: { ...typography.h3, color: colors.text.primary, fontSize: 16 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  metaText: { color: colors.text.secondary, fontSize: 12, fontWeight: "600" },
  metaDivider: { color: colors.text.muted, fontSize: 12 },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  epActions: { flexDirection: "row", gap: 6, alignItems: "center" },
  crudActions: { flexDirection: "row", gap: 4 },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBtnDisabled: { opacity: 0.35 },
  finishBtn: { backgroundColor: colors.status.Complete, borderColor: colors.status.Complete },
  ghostIcon: { padding: 6, borderRadius: radius.sm },
});
