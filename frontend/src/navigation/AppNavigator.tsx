import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import PDFViewerScreen from "../screens/PDFViewerScreen";
import ManageScreen from "../screens/ManageScreen";
import AdminAccessScreen from "../screens/AdminAccessScreen";
import type { RootStackParamList } from "../types";
import { colors } from "../theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          contentStyle: { backgroundColor: colors.bg },
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "600", fontSize: 16 },
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: "Library",
            headerRight: () => (
              <Pressable
                onPress={() => navigation.navigate("AdminAccess")}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Manage PDFs"
              >
                <Text style={styles.manageAction}>Manage</Text>
              </Pressable>
            ),
          })}
        />
        <Stack.Screen
          name="PDFViewer"
          component={PDFViewerScreen}
          options={({ route }) => ({ title: route.params.title })}
        />
        <Stack.Screen
          name="AdminAccess"
          component={AdminAccessScreen}
          options={{ title: "Admin" }}
        />
        <Stack.Screen
          name="Manage"
          component={ManageScreen}
          options={{ title: "Manage" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  manageAction: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "600",
  },
});
