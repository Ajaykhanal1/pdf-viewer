import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../theme";

interface Props {
  message: string;
  tone: "error" | "success";
}

export default function MessageBanner({ message, tone }: Props) {
  const color = tone === "error" ? colors.danger : colors.success;
  return (
    <View
      style={[styles.banner, { borderLeftColor: color }]}
      accessibilityLiveRegion="polite"
    >
      <Text style={[styles.text, { color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 2,
    borderRadius: radius.control,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  text: { fontSize: 14, lineHeight: 20 },
});
