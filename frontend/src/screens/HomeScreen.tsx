import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DocumentCard from "../components/DocumentCard";
import MessageBanner from "../components/MessageBanner";
import StateMessage from "../components/StateMessage";
import { listDocuments } from "../storage/library";
import type { PDFDocument, RootStackParamList } from "../types";
import { colors, spacing } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [documents, setDocuments] = useState<PDFDocument[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      setDocuments(await listDocuments());
    } catch {
      setError("The document list could not be read from this device.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  if (documents === null) {
    return (
      <View style={styles.centered}>
        {error ? (
          <StateMessage
            title="Could not load documents"
            message={error}
            actionLabel="Try again"
            onAction={load}
          />
        ) : (
          <ActivityIndicator size="large" color={colors.accent} />
        )}
      </View>
    );
  }

  return (
    <FlatList
      data={documents}
      keyExtractor={item => item.id}
      contentContainerStyle={[
        styles.list,
        { paddingBottom: insets.bottom + spacing.xl },
        documents.length === 0 && styles.listEmpty,
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
          progressBackgroundColor={colors.surface}
        />
      }
      ItemSeparatorComponent={Separator}
      ListHeaderComponent={
        error || documents.length > 0 ? (
          <View>
            {error ? <MessageBanner message={error} tone="error" /> : null}
            {documents.length > 0 ? (
              <Text style={styles.sectionLabel}>
                {documents.length} document{documents.length === 1 ? "" : "s"}
              </Text>
            ) : null}
          </View>
        ) : undefined
      }
      ListEmptyComponent={
        <StateMessage
          title="No documents yet"
          message="Upload a PDF from the manage screen to read it here."
          actionLabel="Manage PDFs"
          onAction={() => navigation.navigate("AdminAccess")}
        />
      }
      renderItem={({ item }) => (
        <DocumentCard
          document={item}
          onView={() =>
            navigation.navigate("PDFViewer", { id: item.id, title: item.title })
          }
        />
      )}
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.bg,
  },
  list: {
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bg,
  },
  listEmpty: { flexGrow: 1, justifyContent: "center" },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  sectionLabel: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
});
