import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";

import { colors, radius, spacing, typography } from "@/src/theme";
import { useSession } from "@/src/contexts/session";
import { apiExportCSV, apiImportCSV, EntryType } from "@/src/lib/api";
import { useToast } from "@/src/components/Toast";

export default function ProfileScreen() {
  const { user } = useSession();
  const { show } = useToast();

  const handleExport = async (type: EntryType) => {
    try {
      const csv = await apiExportCSV(type);
      const fileName = `export_${type}_${new Date().getTime()}.csv`;

      if (Platform.OS === "web") {
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        show(`Ekspor ${type} berhasil didownload`, "success");
      } else {
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: "utf8" });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert("Error", "Sharing tidak tersedia di perangkat ini");
        }
      }
    } catch (e: any) {
      show(`Gagal ekspor ${type}: ` + e.message, "error");
    }
  };

  const handleImport = async (type: EntryType) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/comma-separated-values", "text/csv"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets) return;

      const asset = result.assets[0];
      let content = "";

      if (Platform.OS === "web") {
        const response = await fetch(asset.uri);
        content = await response.text();
      } else {
        content = await FileSystem.readAsStringAsync(asset.uri, { encoding: "utf8" });
      }

      const count = await apiImportCSV(content, type);
      show(`Berhasil mengimpor ${count} data ${type}`, "success");
    } catch (e: any) {
      show(`Gagal impor ${type}: ` + e.message, "error");
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
        <Text style={styles.kicker}>PROFIL</Text>
        <Text style={styles.title}>Offline Mode</Text>

        <View style={styles.card}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.name} numberOfLines={1}>
              {user?.name || "Offline User"}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {user?.email || "No Account Needed"}
            </Text>
          </View>
        </View>

        {/* ANIME SECTION */}
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <Text style={styles.sectionLabel}>CADANGAN DATA ANIME (CSV)</Text>

          <View style={styles.rowBtn}>
            <TouchableOpacity style={[styles.actionBtn, { flex: 1 }]} onPress={() => handleExport("anime")}>
              <Ionicons name="cloud-download-outline" size={18} color={colors.primary} />
              <Text style={styles.actionText}>Ekspor Anime</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { flex: 1 }]} onPress={() => handleImport("anime")}>
              <Ionicons name="cloud-upload-outline" size={18} color={colors.status.Complete} />
              <Text style={styles.actionText}>Impor Anime</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DONGHUA SECTION */}
        <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
          <Text style={styles.sectionLabel}>CADANGAN DATA DONGHUA (CSV)</Text>

          <View style={styles.rowBtn}>
            <TouchableOpacity style={[styles.actionBtn, { flex: 1 }]} onPress={() => handleExport("donghua")}>
              <Ionicons name="cloud-download-outline" size={18} color="#7C5CFF" />
              <Text style={styles.actionText}>Ekspor Donghua</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { flex: 1 }]} onPress={() => handleImport("donghua")}>
              <Ionicons name="cloud-upload-outline" size={18} color={colors.status.Complete} />
              <Text style={styles.actionText}>Impor Donghua</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>Otaku Tracker · v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  kicker: { ...typography.caption, color: colors.primary },
  title: { ...typography.h1, color: colors.text.primary, fontSize: 28, marginBottom: 8 },
  sectionLabel: { ...typography.caption, color: colors.text.muted, marginBottom: 4 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}22`,
    borderWidth: 1,
    borderColor: `${colors.primary}55`,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { ...typography.h3, color: colors.text.primary },
  email: { color: colors.text.secondary, fontSize: 13 },
  rowBtn: { flexDirection: "row", gap: spacing.sm },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: { color: colors.text.primary, fontWeight: "600", fontSize: 13 },
  footer: { color: colors.text.muted, fontSize: 11, textAlign: "center", marginTop: 24 },
});
