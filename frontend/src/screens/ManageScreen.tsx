import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
} from "@react-native-documents/picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Button from "../components/Button";
import FormField from "../components/FormField";
import MessageBanner from "../components/MessageBanner";
import PDFIcon from "../components/PDFIcon";
import StateMessage from "../components/StateMessage";
import {
  importDocument,
  listDocuments,
  removeDocument,
  type PickedFile,
} from "../storage/library";
import type { PDFDocument } from "../types";
import { colors, radius, spacing } from "../theme";

type Banner = { tone: "error" | "success"; text: string };

const MAX_PDF_BYTES = 25 * 1024 * 1024;

export default function ManageScreen() {
  const insets = useSafeAreaInsets();
  const [documents, setDocuments] = useState<PDFDocument[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<PickedFile | null>(null);
  const [importing, setImporting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      setListError(null);
      setDocuments(await listDocuments());
    } catch {
      setListError("The document list could not be read from this device.");
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const pickFile = async () => {
    try {
      const [picked] = await pick({ type: [types.pdf], mode: "import" });
      const name = picked.name ?? "document.pdf";
      if (!name.toLowerCase().endsWith(".pdf")) {
        setBanner({ tone: "error", text: "Please choose a PDF file." });
        return;
      }
      if (picked.size && picked.size > MAX_PDF_BYTES) {
        setBanner({ tone: "error", text: "PDF files must be 25 MB or smaller." });
        return;
      }
      setFile({ uri: picked.uri, name });
      if (!title.trim()) {
        setTitle(name.replace(/\.pdf$/i, ""));
      }
      setBanner(null);
    } catch (pickerError) {
      if (
        isErrorWithCode(pickerError) &&
        pickerError.code === errorCodes.OPERATION_CANCELED
      ) {
        return;
      }
      setBanner({
        tone: "error",
        text: "Could not open the file picker. Please try again.",
      });
    }
  };

  const submit = async () => {
    if (!file) {
      setBanner({ tone: "error", text: "Choose a PDF file first." });
      return;
    }
    if (!title.trim()) {
      setBanner({ tone: "error", text: "Enter a title for the PDF." });
      return;
    }

    setImporting(true);
    setBanner(null);
    try {
      await importDocument(file, title.trim(), description.trim());
      setTitle("");
      setDescription("");
      setFile(null);
      setBanner({ tone: "success", text: "PDF added to this device." });
      await loadDocuments();
    } catch {
      setBanner({
        tone: "error",
        text: "The PDF could not be saved on this device.",
      });
    } finally {
      setImporting(false);
    }
  };

  const confirmDelete = (document: PDFDocument) => {
    Alert.alert("Remove PDF", `Remove "${document.title}" from this device?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeImported(document),
      },
    ]);
  };

  const removeImported = async (document: PDFDocument) => {
    setDeletingId(document.id);
    setBanner(null);
    try {
      await removeDocument(document);
      setBanner({ tone: "success", text: "PDF removed." });
      await loadDocuments();
    } catch {
      setBanner({ tone: "error", text: "The PDF could not be removed." });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Upload a PDF</Text>
        <Text style={styles.subheading}>
          PDFs are saved on this phone and stay available offline. Nothing is
          uploaded anywhere.
        </Text>

        {banner ? (
          <MessageBanner message={banner.text} tone={banner.tone} />
        ) : null}

        <Text style={styles.label}>PDF file</Text>
        <View style={[styles.dropZone, file && styles.dropZoneActive]}>
          <PDFIcon />
          <Text style={styles.fileName} numberOfLines={1}>
            {file?.name ?? "No file selected"}
          </Text>
          <Text style={styles.hint}>PDF files only, up to 25 MB.</Text>
          <Button
            label={file ? "Change file" : "Choose PDF"}
            onPress={pickFile}
            variant="secondary"
            disabled={importing}
            style={styles.fileButton}
          />
        </View>

        <FormField
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. BCA-601 Computer Networks - May 2024"
          maxLength={200}
          editable={!importing}
        />
        <FormField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Optional short description"
          multiline
          numberOfLines={3}
          inputStyle={styles.descriptionInput}
          editable={!importing}
        />

        <Button
          label="Upload PDF"
          onPress={submit}
          loading={importing}
          disabled={!file || !title.trim()}
          style={styles.addButton}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Documents on this device</Text>
        {listError ? <MessageBanner message={listError} tone="error" /> : null}

        {documents === null && !listError ? (
          <ActivityIndicator
            size="small"
            color={colors.accent}
            style={styles.listLoader}
          />
        ) : null}

        {documents && documents.length === 0 ? (
          <Text style={styles.emptyText}>No PDFs on this device yet.</Text>
        ) : null}

        {documents?.map((document, index) => (
          <View
            key={document.id}
            style={[
              styles.documentRow,
              index < documents.length - 1 && styles.documentDivider,
            ]}
          >
            <PDFIcon />
            <View style={styles.documentText}>
              <Text style={styles.documentTitle} numberOfLines={2}>
                {document.title}
              </Text>
              <Text style={styles.documentMeta} numberOfLines={1}>
                {document.builtIn
                  ? "Built into the app"
                  : `Added ${new Date(document.addedAt).toLocaleDateString(
                      undefined,
                      { year: "numeric", month: "short", day: "numeric" },
                    )}`}
              </Text>
            </View>
            {document.builtIn ? (
              <Text style={styles.lockedText}>Locked</Text>
            ) : (
              <Pressable
                onPress={() => confirmDelete(document)}
                disabled={deletingId !== null}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${document.title}`}
              >
                {deletingId === document.id ? (
                  <ActivityIndicator size="small" color={colors.danger} />
                ) : (
                  <Text style={styles.deleteText}>Remove</Text>
                )}
              </Pressable>
            )}
          </View>
        ))}

        {documents === null && listError ? (
          <StateMessage
            title="Could not load documents"
            message={listError}
            actionLabel="Try again"
            onAction={loadDocuments}
          />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  heading: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  subheading: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  dropZone: {
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius.panel,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  dropZoneActive: { borderColor: colors.accent },
  fileName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
    maxWidth: "100%",
  },
  hint: { color: colors.textSubtle, fontSize: 12 },
  fileButton: { marginTop: spacing.xs },
  descriptionInput: { minHeight: 88, textAlignVertical: "top" },
  addButton: { marginTop: spacing.xs },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  listLoader: { marginVertical: spacing.md },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    paddingVertical: spacing.md,
  },
  documentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  documentDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  documentText: { flex: 1, gap: 2 },
  documentTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  documentMeta: {
    color: colors.textSubtle,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
  deleteText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "600",
  },
  lockedText: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: "500",
  },
});
