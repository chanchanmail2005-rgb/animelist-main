import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing, typography } from "@/src/theme";
import { useSession } from "@/src/contexts/session";
import { useToast } from "@/src/components/Toast";

export default function Register() {
  const { signUp } = useSession();
  const { show } = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      show("Lengkapi email dan password", "error");
      return;
    }
    if (password.length < 6) {
      show("Password minimal 6 karakter", "error");
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email, password, name.trim() || undefined);
    } catch (e: any) {
      show(e?.message || "Pendaftaran gagal", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <View style={styles.header}>
          <TouchableOpacity
            testID="register-back"
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={10}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.kicker}>Daftar</Text>
        <Text style={styles.title}>Buat akun baru</Text>
        <Text style={styles.sub}>Mulai catat anime & donghua kamu hari ini.</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Ionicons name="person-outline" size={18} color={colors.text.secondary} />
            <TextInput
              testID="register-name"
              value={name}
              onChangeText={setName}
              placeholder="Nama (opsional)"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Ionicons name="mail-outline" size={18} color={colors.text.secondary} />
            <TextInput
              testID="register-email"
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={colors.text.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.text.secondary} />
            <TextInput
              testID="register-password"
              value={password}
              onChangeText={setPassword}
              placeholder="Password (min. 6)"
              placeholderTextColor={colors.text.muted}
              secureTextEntry={!showPw}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setShowPw((v) => !v)} hitSlop={8}>
              <Ionicons
                name={showPw ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            testID="register-submit"
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
            style={[styles.primaryBtn, submitting && { opacity: 0.6 }]}
          >
            {submitting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.primaryBtnText}>Daftar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Sudah punya akun? </Text>
            <Link href="/sign-in" asChild>
              <TouchableOpacity testID="goto-signin" hitSlop={8}>
                <Text style={styles.link}>Masuk</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.md, gap: 12 },
  header: { marginBottom: 8 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  kicker: { ...typography.caption, color: colors.primary },
  title: { ...typography.h1, color: colors.text.primary, fontSize: 30 },
  sub: { color: colors.text.secondary, marginBottom: 16, fontSize: 14 },
  form: { gap: 12 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 15,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: { color: "#0A0A0C", fontWeight: "800", fontSize: 16 },
  bottomRow: { flexDirection: "row", justifyContent: "center", marginTop: 12 },
  bottomText: { color: colors.text.secondary, fontSize: 14 },
  link: { color: colors.primary, fontWeight: "800", fontSize: 14 },
});
