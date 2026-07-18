import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, radius, spacing, typography } from "@/src/theme";

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog: React.FC<Props> = ({
  visible,
  title,
  message,
  confirmLabel = "OK",
  cancelLabel = "Batal",
  destructive,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet} testID="confirm-dialog">
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <TouchableOpacity
              testID="confirm-cancel"
              style={[styles.btn, styles.cancelBtn]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelLabel}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="confirm-ok"
              style={[
                styles.btn,
                { backgroundColor: destructive ? colors.status.Hiatus : colors.primary },
              ]}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmLabel}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { ...typography.h3, color: colors.text.primary, marginBottom: 8 },
  message: { color: colors.text.secondary, fontSize: 14, lineHeight: 20, marginBottom: 20 },
  actions: { flexDirection: "row", gap: 12, justifyContent: "flex-end" },
  btn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radius.md,
    minWidth: 96,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelLabel: { color: colors.text.primary, fontWeight: "700" },
  confirmLabel: { color: "#0A0A0C", fontWeight: "800" },
});
