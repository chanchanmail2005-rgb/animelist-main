import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { Text, StyleSheet, Animated, Platform } from "react-native";
import { colors, radius, spacing } from "@/src/theme";

type ToastType = "success" | "error" | "info";
type ToastCtx = { show: (msg: string, type?: ToastType) => void };
const ToastContext = createContext<ToastCtx | undefined>(undefined);

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [message, setMessage] = useState<string>("");
  const [type, setType] = useState<ToastType>("info");
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (msg: string, t: ToastType = "info") => {
      if (timer.current) clearTimeout(timer.current);
      setMessage(msg);
      setType(t);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      timer.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }, 2400);
    },
    [opacity],
  );

  const bg =
    type === "success"
      ? colors.status.Complete
      : type === "error"
        ? colors.status.Hiatus
        : colors.primary;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <Animated.View
        pointerEvents="none"
        testID="toast"
        style={[
          styles.toast,
          { opacity, backgroundColor: bg },
        ]}
      >
        <Text style={styles.text} numberOfLines={2}>
          {message}
        </Text>
      </Animated.View>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 100 : 90,
    left: spacing.md,
    right: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    zIndex: 9999,
    elevation: 12,
  },
  text: { color: "#0A0A0C", fontWeight: "700", fontSize: 14 },
});
