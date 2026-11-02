import React, { useState, type ComponentProps } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextStyle,
} from "react-native";

import { colors, radius, spacing } from "../theme";

interface Props extends ComponentProps<typeof TextInput> {
  label: string;
  inputStyle?: TextStyle;
}

export default function FormField({ label, inputStyle, ...props }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={colors.textSubtle}
        selectionColor={colors.accent}
        style={[styles.input, focused && styles.inputFocused, inputStyle]}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.md },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    color: colors.text,
    fontSize: 15,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  inputFocused: { borderColor: colors.accent },
});
