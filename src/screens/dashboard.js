// IMPORTS
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Dimensions, Pressable, StatusBar, StyleSheet, View } from "react-native";
import Icon from "@react-native-vector-icons/fontawesome6";
import { useEffect, useState } from "react";
import Home from "./Dashboard/home";
import Transfers from "./Dashboard/transfers";
import Histories from "./Dashboard/histories";
import Users from "./Dashboard/users";
import DashboardProfile from "./Dashboard/dashboardProfile";
import DashboardHistory from "./Dashboard/dashboardHistory";
import MyLoading from "../components/myLoading";
import colors from "../colors/colors";

import { get, del } from "../services";

// INIT
const Tab = createBottomTabNavigator();
const screenWidth = Dimensions.get("screen").width;
const iconSize = 21;

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch user profile
  const getProfile = async () => {
    try {
      setLoading(true);
      const response = await get("/profile");
      setData(response.data);
    } catch (error) {
      console.log("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Optional deleteUser example
  const deleteUser = async () => {
    if (!data?.id) return;
    try {
      await del(`/user/${data.id}`);
    } catch (error) {
      console.log("Error deleting user:", error);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  // While loading or data belum ready
  if (loading || !data?.role) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.primaryLight }}>
        <MyLoading isVisible={true} color={colors.primary} type={"Wave"} size={80} />
      </View>
    );
  }

  // Custom tab bar button
  const tabScreenOptions = {
    headerShown: false,
    animation: "shift",
    tabBarShowLabel: false,
    tabBarStyle: {
      backgroundColor: colors.background,
      borderRadius: screenWidth / 10,
      margin: 10,
      elevation: 2,
      borderWidth: 0,
    },
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.placeholder,
    tabBarIconStyle: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    tabBarButton: ({ children, onPress }) => (
      <Pressable style={({ pressed }) => [style.btn, pressed && style.press]} onPress={onPress}>
        {children}
      </Pressable>
    ),
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.primaryLight }}>
      <MyLoading isVisible={loading} color={colors.primary} type={"Wave"} size={80} />
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      <Tab.Navigator screenOptions={tabScreenOptions}>
        {data.role === "user" ? (
          <>
            <Tab.Screen
              name="Home"
              component={Home}
              options={{
                tabBarIcon: ({ color }) => (
                  <Icon name="house-user" color={color} size={iconSize} iconStyle="solid" />
                ),
              }}
            />
            <Tab.Screen
              name="Transfer"
              component={Transfers}
              options={{
                tabBarIcon: ({ color }) => (
                  <Icon name="wallet" color={color} size={iconSize} iconStyle="solid" />
                ),
              }}
            />
            <Tab.Screen
              name="Histories"
              component={Histories}
              options={{
                tabBarIcon: ({ color }) => (
                  <Icon name="clock-rotate-left" color={color} size={iconSize} iconStyle="solid" />
                ),
              }}
            />
          </>
        ) : (
          <>
            <Tab.Screen
              name="Users"
              component={Users}
              options={{
                tabBarIcon: ({ color }) => (
                  <Icon name="users" color={color} size={iconSize} iconStyle="solid" />
                ),
              }}
            />
            <Tab.Screen
              name="DashboardProfile"
              component={DashboardProfile}
              options={{
                tabBarIcon: ({ color }) => (
                  <Icon name="circle-user" color={color} size={iconSize} iconStyle="solid" />
                ),
              }}
            />
            <Tab.Screen
              name="DashboardHistory"
              component={DashboardHistory}
              options={{
                tabBarIcon: ({ color }) => (
                  <Icon name="clock-rotate-left" color={color} size={iconSize} iconStyle="solid" />
                ),
              }}
            />
          </>
        )}
      </Tab.Navigator>
    </View>
  );
}

const style = StyleSheet.create({
  btn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  press: {
    transform: [{ scale: 0.9 }],
  },
});
