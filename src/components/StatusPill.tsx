import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius, typography } from "@/src/theme";
import type { AnimeStatus } from "@/src/lib/api";

export const StatusPill: React.FC<{ status: AnimeStatus; testID?: string }> = ({ status, testID }) => {
  const color = colors.status[status];
  return (
    <View
      testID={testID}
      style={[styles.pill, { borderColor: color, backgroundColor: `${color}1A` }]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    gap: 6,
    alignSelf: "flex-start",
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { ...typography.caption, fontSize: 10 },
});
