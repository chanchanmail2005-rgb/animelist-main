import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing, typography } from "@/src/theme";
import { useSession } from "@/src/contexts/session";
import { useToast } from "@/src/components/Toast";

export default function SignIn() {
  const { signIn } = useSession();
  const { show } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      show("Lengkapi email dan password", "error");
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (e: any) {
      show(e?.message || "Login gagal", "error");
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
        <ImageBackground
          source={{
            uri: "https://images.pexels.com/photos/31729749/pexels-photo-31729749.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          }}
          style={styles.hero}
          imageStyle={{ borderRadius: radius.lg }}
        >
          <LinearGradient
            colors={["transparent", "rgba(10,10,12,0.95)"]}
            style={StyleSheet.absoluteFillObject as any}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.brand}>OTAKU TRACKER</Text>
            <Text style={styles.heroTitle}>Catat semua{"\n"}anime & donghuamu.</Text>
          </View>
        </ImageBackground>

        <View style={styles.form}>
          <Text style={styles.kicker}>Masuk</Text>
          <Text style={styles.title}>Selamat datang kembali</Text>

          <Field
            testID="signin-email"
            placeholder="Email"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            testID="signin-password"
            placeholder="Password"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPw}
            right={
              <TouchableOpacity onPress={() => setShowPw((v) => !v)} hitSlop={8}>
                <Ionicons
                  name={showPw ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            }
          />

          <TouchableOpacity
            testID="signin-submit"
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
            style={[styles.primaryBtn, submitting && { opacity: 0.6 }]}
          >
            {submitting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.primaryBtnText}>Masuk</Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Belum punya akun? </Text>
            <Link href="/register" asChild>
              <TouchableOpacity testID="goto-register" hitSlop={8}>
                <Text style={styles.link}>Daftar</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const Field: React.FC<{
  value: string;
  onChangeText: (s: string) => void;
  placeholder: string;
  icon: any;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  testID?: string;
  right?: React.ReactNode;
}> = ({ value, onChangeText, placeholder, icon, secureTextEntry, keyboardType, autoCapitalize, testID, right }) => (
  <View style={styles.field}>
    <Ionicons name={icon} size={18} color={colors.text.secondary} />
    <TextInput
      testID={testID}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.text.muted}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      style={styles.input}
    />
    {right}
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, paddingHorizontal: spacing.md, paddingBottom: spacing.lg, gap: spacing.lg },
  hero: { height: 220, marginTop: spacing.md, justifyContent: "flex-end", overflow: "hidden", borderRadius: radius.lg },
  heroOverlay: { padding: spacing.md, gap: 6 },
  brand: { ...typography.caption, color: colors.primary },
  heroTitle: { ...typography.h1, color: "#fff", fontSize: 28 },
  form: { gap: spacing.md },
  kicker: { ...typography.caption, color: colors.primary },
  title: { ...typography.h2, color: colors.text.primary, marginBottom: 8 },
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
  bottomRow: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  bottomText: { color: colors.text.secondary, fontSize: 14 },
  link: { color: colors.primary, fontWeight: "800", fontSize: 14 },
});
