import React, { useEffect, useState } from "react";
import { AppState, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AppNavigator from "./src/navigation/AppNavigator";
import { colors } from "./src/theme";

export default function App() {
  const [obscured, setObscured] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => {
      // Covers the app preview on iOS and recent-apps thumbnails.
      setObscured(state !== "active");
    });
    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <AppNavigator />
      {obscured ? (
        <View style={styles.privacyOverlay}>
          <Text style={styles.privacyText}>PDF Viewer</Text>
        </View>
      ) : null}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  privacyOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  privacyText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "500",
  },
});
