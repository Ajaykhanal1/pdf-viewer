import AsyncStorage from "@react-native-async-storage/async-storage";

const ADMIN_KEY = "pdf_viewer_local_admin";

export async function hasAdminAccount(): Promise<boolean> {
  return (await AsyncStorage.getItem(ADMIN_KEY)) !== null;
}

export async function createAdmin(username: string, password: string): Promise<void> {
  await AsyncStorage.setItem(ADMIN_KEY, JSON.stringify({ username, password }));
}

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  const raw = await AsyncStorage.getItem(ADMIN_KEY);
  if (!raw) return false;
  const account: { username: string; password: string } = JSON.parse(raw);
  return account.username === username && account.password === password;
}
