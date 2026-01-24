import React, { useState, useEffect } from "react";
import { Platform, View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { authAPI } from "./src/services/api";

import HomeScreen from "./src/screens/HomeScreen";
import CreateTicketScreen from "./src/screens/CreateTicketScreen";
import TicketDetailScreen from "./src/screens/TicketDetailScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SignUpScreen from "./src/screens/SignUpScreen";

const Stack = createNativeStackNavigator();

function HeaderBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Clean white to light blue gradient */}
      <LinearGradient
        colors={["#FFFFFF", "#F8FAFC", "#EFF6FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Subtle bottom border */}
      <View style={styles.bottomBorder} />
    </View>
  );
}

function BrandTitle({ title }) {
  return (
    <View style={styles.titleWrap}>
      <Text style={styles.subtitle} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#F8FAFC",
  },
};

export default function App() {
  // Temporarily bypass authentication - go straight to Home
  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerTintColor: "#0F172A",
          headerTitleAlign: "left",
          headerShadowVisible: false,
          headerTransparent: true,
          headerBackground: () => <HeaderBackground />,
          headerTitle: ({ children }) => <BrandTitle title={children} />,
          headerBackTitleVisible: false,
          
          headerStyle: {
            backgroundColor: "transparent",
            height: Platform.OS === "ios" ? 120 : 100,
          },
          
          headerTitleContainerStyle: {
            paddingTop: Platform.OS === "ios" ? 22 : 12,
            paddingBottom: 12,
            paddingLeft: 4,
          },
          
          contentStyle: {
            backgroundColor: "#F8FAFC",
          },
          
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "Active Requests",
            headerLargeTitle: false,
          }}
        />

        <Stack.Screen
          name="CreateTicket"
          component={CreateTicketScreen}
          options={{
            title: "New Request",
            presentation: "modal",
            animation: "slide_from_bottom",
            headerLargeTitle: false,
          }}
        />

        <Stack.Screen
          name="TicketDetail"
          component={TicketDetailScreen}
          options={{
            title: "Request Details",
            headerLargeTitle: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  bottomBorder: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(15, 23, 42, 0.06)",
  },
  
  titleWrap: {
    flexDirection: "column",
  },
  
  subtitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "600",
    maxWidth: 260,
    letterSpacing: -0.3,
  },
});