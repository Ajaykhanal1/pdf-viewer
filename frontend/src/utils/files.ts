/** Keeps imported file names safe for a flat on-device library folder. */
export function safeFileName(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, "_")
    .replace(/^\.+/, "");

  if (!cleaned) {
    return "document.pdf";
  }
  return cleaned.toLowerCase().endsWith(".pdf") ? cleaned : `${cleaned}.pdf`;
}
