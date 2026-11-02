import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import Button from "../components/Button";
import FormField from "../components/FormField";
import MessageBanner from "../components/MessageBanner";
import { createAdmin, hasAdminAccount, verifyAdmin } from "../storage/admin";
import type { RootStackParamList } from "../types";
import { colors, spacing } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "AdminAccess">;

export default function AdminAccessScreen({ navigation }: Props) {
  const [setup, setSetup] = React.useState<boolean | null>(null);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [banner, setBanner] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    hasAdminAccount().then(exists => setSetup(!exists));
  }, []);

  const submit = async () => {
    if (!username.trim() || password.length < 8) {
      setBanner("Enter a username and a password with at least 8 characters.");
      return;
    }
    setBusy(true);
    setBanner(null);
    try {
      if (setup) {
        await createAdmin(username.trim(), password);
      } else if (!(await verifyAdmin(username.trim(), password))) {
        setBanner("The username or password is incorrect.");
        return;
      }
      navigation.replace("Manage");
    } catch {
      setBanner("Admin information could not be saved on this device.");
    } finally {
      setBusy(false);
    }
  };

  if (setup === null) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {setup ? "Create admin account" : "Admin access"}
      </Text>
      <Text style={styles.description}>
        {setup
          ? "Set up the local admin account for managing PDFs on this device."
          : "Sign in to manage PDFs stored on this device."}
      </Text>
      {banner ? <MessageBanner message={banner} tone="error" /> : null}
      <FormField
        label="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoComplete="username"
        editable={!busy}
      />
      <FormField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete={setup ? "new-password" : "current-password"}
        editable={!busy}
      />
      <Button
        label={setup ? "Create account" : "Log in"}
        onPress={submit}
        loading={busy}
        style={styles.submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  heading: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  submit: { marginTop: spacing.xs },
});
