import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as ImagePicker from "expo-image-picker";

import { colors, radius, spacing, typography, STATUS_OPTIONS } from "@/src/theme";
import {
  apiCreateAnime,
  apiGetAnime,
  apiUpdateAnime,
  AnimePayload,
  AnimeStatus,
  EntryType,
} from "@/src/lib/api";
import { useToast } from "@/src/components/Toast";

export default function FormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; type?: EntryType }>();
  const editId = params.id;
  const isEdit = !!editId;
  const { show } = useToast();

  const [type, setType] = useState<EntryType>((params.type as EntryType) || "anime");
  const [title, setTitle] = useState("");
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("0");
  const [status, setStatus] = useState<AnimeStatus>("Ongoing");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);

  useEffect(() => {
    if (!editId) return;
    setLoading(true);
    apiGetAnime(editId)
      .then((it) => {
        setType(it.type);
        setTitle(it.title);
        setSeason(String(it.season));
        setEpisode(String(it.episode));
        setStatus(it.status);
        setImage(it.image || null);
      })
      .catch((e) => show(e?.message || "Gagal memuat data", "error"))
      .finally(() => setLoading(false));
  }, [editId, show]);

  const pickImage = async () => {
    setPickingImage(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== "granted") {
        show("Izin galeri ditolak", "error");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.6,
        base64: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const base64 = asset.base64;
      if (!base64) {
        show("Gagal memproses gambar", "error");
        return;
      }
      const mime = asset.mimeType || "image/jpeg";
      setImage(`data:${mime};base64,${base64}`);
    } catch (e: any) {
      show(e?.message || "Gagal memilih gambar", "error");
    } finally {
      setPickingImage(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      show("Judul tidak boleh kosong", "error");
      return;
    }
    const payload: AnimePayload = {
      type,
      title: title.trim(),
      image,
      season: Math.max(0, parseInt(season || "0", 10) || 0),
      episode: Math.max(0, parseInt(episode || "0", 10) || 0),
      status,
    };
    setSaving(true);
    try {
      if (isEdit && editId) {
        await apiUpdateAnime(editId, payload);
        show("Berhasil diperbarui", "success");
      } else {
        await apiCreateAnime(payload);
        show("Berhasil ditambahkan", "success");
      }
      router.back();
    } catch (e: any) {
      show(e?.message || "Gagal menyimpan", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.headerBar}>
        <TouchableOpacity
          testID="form-back-btn"
          onPress={() => router.back()}
          style={styles.iconHeaderBtn}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? "Edit" : "Tambah"} {type === "anime" ? "Anime" : "Donghua"}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        bottomOffset={80}
      >
        {/* Image picker */}
        <TouchableOpacity
          testID="form-image-picker"
          onPress={pickImage}
          activeOpacity={0.8}
          style={styles.imagePicker}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              {pickingImage ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={28} color={colors.text.secondary} />
                  <Text style={styles.imageText}>Upload poster (3:4)</Text>
                </>
              )}
            </View>
          )}
          {image ? (
            <View style={styles.changeBadge}>
              <Ionicons name="camera" size={12} color="#0A0A0C" />
              <Text style={styles.changeText}>Ubah</Text>
            </View>
          ) : null}
        </TouchableOpacity>

        {/* Type segmented */}
        <View style={styles.field}>
          <Text style={styles.label}>Kategori</Text>
          <View style={styles.segmentRow}>
            {(["anime", "donghua"] as EntryType[]).map((t) => (
              <TouchableOpacity
                key={t}
                testID={`form-type-${t}`}
                onPress={() => setType(t)}
                activeOpacity={0.85}
                style={[styles.segment, type === t && styles.segmentActive]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    type === t && { color: "#0A0A0C", fontWeight: "800" },
                  ]}
                >
                  {t === "anime" ? "Anime (JP)" : "Donghua (CN)"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Judul</Text>
          <TextInput
            testID="form-title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. A Rank Party wo Ridatsu shita Ore wa"
            placeholderTextColor={colors.text.muted}
            style={styles.input}
          />
        </View>

        {/* Season + Episode */}
        <View style={styles.row2}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Season</Text>
            <TextInput
              testID="form-season"
              value={season}
              onChangeText={(v) => setSeason(v.replace(/[^0-9]/g, ""))}
              placeholder="1"
              keyboardType="number-pad"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Episode</Text>
            <TextInput
              testID="form-episode"
              value={episode}
              onChangeText={(v) => setEpisode(v.replace(/[^0-9]/g, ""))}
              placeholder="0"
              keyboardType="number-pad"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
            />
          </View>
        </View>

        {/* Status */}
        <View style={styles.field}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.segmentRow}>
            {STATUS_OPTIONS.map((s) => {
              const active = status === s;
              const c = colors.status[s];
              return (
                <TouchableOpacity
                  key={s}
                  testID={`form-status-${s}`}
                  onPress={() => setStatus(s)}
                  activeOpacity={0.85}
                  style={[
                    styles.segment,
                    active && { backgroundColor: c, borderColor: c },
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      active && { color: "#0A0A0C", fontWeight: "800" },
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          testID="form-save"
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
        >
          {saving ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.saveText}>{isEdit ? "Simpan Perubahan" : "Tambahkan"}</Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  iconHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  body: { padding: spacing.md, gap: spacing.md, paddingBottom: 60 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  imagePicker: {
    alignSelf: "center",
    width: 180,
    height: 240,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  imagePreview: { width: "100%", height: "100%" },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: spacing.md,
  },
  imageText: { color: colors.text.secondary, fontSize: 12, fontWeight: "600", textAlign: "center" },
  changeBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  changeText: { color: "#0A0A0C", fontWeight: "800", fontSize: 11 },
  field: { gap: 8 },
  label: { ...typography.caption, color: colors.text.secondary },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    color: colors.text.primary,
    fontSize: 15,
  },
  row2: { flexDirection: "row", gap: spacing.md },
  segmentRow: { flexDirection: "row", gap: 8 },
  segment: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  segmentActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  segmentText: { color: colors.text.secondary, fontSize: 13, fontWeight: "600" },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: "center",
    marginTop: 8,
  },
  saveText: { color: "#0A0A0C", fontWeight: "800", fontSize: 16 },
});
