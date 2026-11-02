export interface PDFDocument {
  id: string;
  title: string;
  description: string;
  addedAt: string;
  /** bundle-assets:// for shipped papers, file:// for imported ones. */
  uri: string;
  builtIn: boolean;
}

export type RootStackParamList = {
  Home: undefined;
  PDFViewer: { id: string; title: string };
  AdminAccess: undefined;
  Manage: undefined;
};
