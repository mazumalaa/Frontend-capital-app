// IMPORTS...
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable, StatusBar, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { useRef } from "react";
import WebView from "react-native-webview";
import { post } from "../services";

//BUILD-IN-FUNCTIONS...
export default function Midtrans({ navigation, route }) {
     const { snapURL, orderId } = route.params;
     const isSyncing = useRef(false);
     const syncPayment = async () => {
          if (isSyncing.current) return;
          isSyncing.current = true;
          try {
               if (!orderId) throw new Error("Missing top-up order ID. Please contact support.");
               const result = await post(`/topup/${encodeURIComponent(orderId)}/sync`);
               if (result?.code !== "200") {
                    throw new Error(result?.message || "Could not verify the top-up payment.");
               }
               if (result.data?.credited !== true) {
                    const status = result.data?.status || "unknown";
                    throw new Error(
                         `Midtrans status is "${status}". Balance will update only after payment is confirmed.`
                    );
               }
               await AsyncStorage.removeItem("url");
               await AsyncStorage.setItem("payment", "false");
               navigation.replace("Dashboard", { screen: "Home" });
          } catch (error) {
               ToastAndroid.showWithGravity(
                    error?.message || "Could not verify the payment. Please try again.",
                    ToastAndroid.CENTER,
                    ToastAndroid.LONG
               );
          } finally {
               isSyncing.current = false;
          }
     };

     const handleChange = async (link) => {
          const { url } = link;
          if (url.includes("transaction_status=settlement") ||
               url.includes("transaction_status=capture") ||
               url.includes("status=success")) {
               await syncPayment();
               return false;
          }

          if (url.includes("action=back") || url.includes("transaction_status=cancel")) {
                await AsyncStorage.setItem("url", snapURL);
                navigation.replace("Dashboard", {screen:"Home"});
                await AsyncStorage.setItem("payment", "false");
                return false;
          }
     }
     return (
          <View style={{ flex: 1 }}>
               <StatusBar backgroundColor={'#092148'} barStyle={"light-content"} />
               <WebView source={{ uri: snapURL }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    onNavigationStateChange={handleChange}
                    injectedJavaScriptBeforeContentLoaded={`
                    window.onbeforeunload = null;
                    `}
               />
               <Pressable style={styles.checkPayment} onPress={syncPayment}>
                    <Text style={styles.checkPaymentText}>Saya sudah bayar — periksa status</Text>
               </Pressable>
          </View>
     )
}

const styles = StyleSheet.create({
     checkPayment: {
          position: "absolute",
          bottom: 16,
          alignSelf: "center",
          backgroundColor: "#092148",
          paddingHorizontal: 18,
          paddingVertical: 12,
          borderRadius: 24,
     },
     checkPaymentText: {
          color: "#FFFFFF",
          fontWeight: "600",
     },
});
