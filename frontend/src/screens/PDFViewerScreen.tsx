import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Pdf, { type PdfRef } from "react-native-pdf";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import StateMessage from "../components/StateMessage";
import { findDocument } from "../storage/library";
import type { RootStackParamList } from "../types";
import { colors, spacing } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "PDFViewer">;

export default function PDFViewerScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const pdfRef = useRef<PdfRef>(null);
  const insets = useSafeAreaInsets();
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    findDocument(id)
      .then(document => {
        if (!active) {
          return;
        }
        if (!document) {
          setError("This document is no longer on this device.");
          return;
        }
        setUri(document.uri);
      })
      .catch(() => setError("This document could not be opened."));
    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <View style={styles.container}>
        <StateMessage
          title="Unable to open PDF"
          message={error}
          actionLabel="Back to library"
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  if (!uri) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Opening PDF...</Text>
      </View>
    );
  }

  const goTo = (next: number) => {
    if (next < 1 || next > totalPages) {
      return;
    }
    pdfRef.current?.setPage(next);
  };

  return (
    <View
      style={[styles.reader, totalPages === 0 && { paddingBottom: insets.bottom }]}
    >
      <Pdf
        ref={pdfRef}
        source={{ uri, cache: false }}
        style={styles.pdf}
        fitPolicy={0}
        minScale={0.5}
        maxScale={5}
        spacing={12}
        enableDoubleTapZoom
        enableAnnotationRendering={false}
        onLoadComplete={numberOfPages => {
          setTotalPages(numberOfPages);
          setLoading(false);
        }}
        onLoadProgress={percent => setProgress(percent)}
        onPageChanged={(current, total) => {
          setPage(current);
          setTotalPages(total);
        }}
        onError={() => {
          setLoading(false);
          setError("This PDF could not be read. It may be damaged.");
        }}
      />
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>
            Loading PDF{progress > 0 ? ` ${Math.round(progress * 100)}%` : ""}
          </Text>
        </View>
      ) : null}
      {totalPages > 0 ? (
        <View
          style={[
            styles.toolbar,
            { paddingBottom: insets.bottom + spacing.xs },
          ]}
        >
          <ToolbarButton
            label="Previous"
            disabled={page <= 1}
            onPress={() => goTo(page - 1)}
          />
          <Text style={styles.pageCount}>
            Page {page} of {totalPages}
          </Text>
          <ToolbarButton
            label="Next"
            disabled={page >= totalPages}
            onPress={() => goTo(page + 1)}
          />
        </View>
      ) : null}
    </View>
  );
}

function ToolbarButton({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.toolbarButton, pressed && styles.pressed]}
    >
      <Text style={[styles.toolbarLabel, disabled && styles.disabledLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  reader: { flex: 1, backgroundColor: colors.pdfCanvas },
  pdf: { flex: 1, width: "100%", backgroundColor: colors.pdfCanvas },
  loading: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.pdfCanvas,
  },
  loadingText: { color: colors.textMuted, fontSize: 13 },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 44,
    backgroundColor: colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toolbarButton: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: 7,
  },
  pressed: { backgroundColor: colors.surfaceHover },
  toolbarLabel: { color: colors.accent, fontSize: 13, fontWeight: "600" },
  disabledLabel: { color: colors.textSubtle },
  pageCount: {
    color: colors.textMuted,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
});
