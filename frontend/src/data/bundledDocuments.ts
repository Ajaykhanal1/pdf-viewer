import type { PDFDocument } from "../types";

function paper(
  id: string,
  title: string,
  description: string,
  addedAt: string,
  file: string,
): PDFDocument {
  return {
    id,
    title,
    description,
    addedAt,
    uri: `bundle-assets://${file}`,
    builtIn: true,
  };
}

const DESCRIPTION =
  "Past-year end semester question paper for BCA Semester VI. " +
  "Section A (15 marks), Section B (40 marks), Section C (20 marks). Total 75 marks, 3 hours.";

/** Papers shipped inside the app binary; they work with no network at all. */
export const BUNDLED_DOCUMENTS: PDFDocument[] = [
  paper(
    "bca-601",
    "BCA-601 Computer Networks - May 2024",
    DESCRIPTION,
    "2024-05-20T09:00:00Z",
    "bca-601.pdf",
  ),
  paper(
    "bca-602",
    "BCA-602 Web Technologies - December 2023",
    DESCRIPTION,
    "2023-12-18T09:00:00Z",
    "bca-602.pdf",
  ),
  paper(
    "bca-603",
    "BCA-603 Software Engineering - May 2024",
    DESCRIPTION,
    "2024-05-20T09:00:00Z",
    "bca-603.pdf",
  ),
  paper(
    "bca-604",
    "BCA-604 Operating Systems - December 2023",
    DESCRIPTION,
    "2023-12-18T09:00:00Z",
    "bca-604.pdf",
  ),
  paper(
    "bca-605",
    "BCA-605 Computer Graphics and Multimedia - May 2024",
    DESCRIPTION,
    "2024-05-20T09:00:00Z",
    "bca-605.pdf",
  ),
  paper(
    "bca-606",
    "BCA-606 Data Mining and Warehousing - December 2023",
    DESCRIPTION,
    "2023-12-18T09:00:00Z",
    "bca-606.pdf",
  ),
  paper(
    "bca-607",
    "BCA-607 Mobile Application Development - May 2024",
    DESCRIPTION,
    "2024-05-20T09:00:00Z",
    "bca-607.pdf",
  ),
  paper(
    "bca-608",
    "BCA-608 Cloud Computing - December 2023",
    DESCRIPTION,
    "2023-12-18T09:00:00Z",
    "bca-608.pdf",
  ),
  paper(
    "bca-609",
    "BCA-609 Python Programming and Data Science - May 2024",
    DESCRIPTION,
    "2024-05-20T09:00:00Z",
    "bca-609.pdf",
  ),
  paper(
    "bca-610",
    "BCA-610 Artificial Intelligence and Machine Learning - December 2023",
    DESCRIPTION,
    "2023-12-18T09:00:00Z",
    "bca-610.pdf",
  ),
];
