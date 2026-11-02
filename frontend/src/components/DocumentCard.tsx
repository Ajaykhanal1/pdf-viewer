import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { PDFDocument } from "../types";
import { colors, spacing } from "../theme";

import PDFIcon from "./PDFIcon";

interface Props {
  document: PDFDocument;
  onView: () => void;
}

export default function DocumentCard({ document, onView }: Props) {
  const added = new Date(document.addedAt);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Read ${document.title}`}
      onPress={onView}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <PDFIcon />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {document.title}
        </Text>
        {document.description ? (
          <Text style={styles.description} numberOfLines={1}>
            {document.description}
          </Text>
        ) : null}
        <Text style={styles.meta}>
          {added.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Text>
      </View>
      <Text style={styles.action}>Read</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 7,
  },
  pressed: { backgroundColor: colors.surfaceHover },
  content: { flex: 1, gap: 2 },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  meta: {
    color: colors.textSubtle,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
  action: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "600",
  },
});
