import AsyncStorage from "@react-native-async-storage/async-storage";
import RNBlobUtil from "react-native-blob-util";

import { BUNDLED_DOCUMENTS } from "../data/bundledDocuments";
import type { PDFDocument } from "../types";
import { safeFileName } from "../utils/files";

const STORAGE_KEY = "pdf_viewer_imported_documents";
const LIBRARY_DIR = `${RNBlobUtil.fs.dirs.DocumentDir}/pdf-library`;

export interface PickedFile {
  uri: string;
  name: string | null;
}

function toPath(uri: string): string {
  return decodeURIComponent(uri.replace(/^file:\/\//, ""));
}

async function copyToLibrary(sourceUri: string, destination: string): Promise<void> {
  if (sourceUri.startsWith("content://")) {
    // Android scoped storage: the file picker hands back a content:// URI
    // with temporary read permission; cp() can't read it, so copy through
    // the MediaCollection native bridge instead.
    await RNBlobUtil.MediaCollection.copyToInternal(sourceUri, destination);
  } else {
    await RNBlobUtil.fs.cp(toPath(sourceUri), destination);
  }
}

async function readImported(): Promise<PDFDocument[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as PDFDocument[]) : [];
  } catch {
    return [];
  }
}

async function writeImported(documents: PDFDocument[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
}

export async function listDocuments(): Promise<PDFDocument[]> {
  const imported = await readImported();
  return [...imported, ...BUNDLED_DOCUMENTS].sort((a, b) =>
    b.addedAt.localeCompare(a.addedAt),
  );
}

export async function findDocument(id: string): Promise<PDFDocument | null> {
  const documents = await listDocuments();
  return documents.find((document) => document.id === id) ?? null;
}

export async function importDocument(
  file: PickedFile,
  title: string,
  description: string,
): Promise<PDFDocument> {
  await RNBlobUtil.fs.mkdir(LIBRARY_DIR).catch(() => undefined);

  const fileName = `${Date.now()}-${safeFileName(file.name ?? "document.pdf")}`;
  const destination = `${LIBRARY_DIR}/${fileName}`;
  await copyToLibrary(file.uri, destination);

  const document: PDFDocument = {
    id: fileName,
    title,
    description,
    addedAt: new Date().toISOString(),
    uri: `file://${destination}`,
    builtIn: false,
  };

  const imported = await readImported();
  await writeImported([document, ...imported]);
  return document;
}

export async function removeDocument(document: PDFDocument): Promise<void> {
  if (document.builtIn) {
    // Bundled papers live in the APK and only disappear with the app itself.
    return;
  }

  const imported = await readImported();
  await writeImported(imported.filter((item) => item.id !== document.id));
  await RNBlobUtil.fs.unlink(toPath(document.uri)).catch(() => undefined);
}
