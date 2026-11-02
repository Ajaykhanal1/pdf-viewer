import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius } from "../theme";

const ICON_SIZE = 36;

export default function PDFIcon() {
  return (
    <View
      style={styles.icon}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={styles.label}>PDF</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: colors.textSubtle,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
