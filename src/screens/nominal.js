// IMPORTS...
import { Dimensions, FlatListComponent, StatusBar, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { useEffect, useState } from "react";
import colors from "../colors/colors";
import Inputs from "../components/inputs";
import Buttons from "../components/buttons";
import MyLoading from "../components/myLoading";
import { post } from "../services";
import Rupiah from "../libs/formatRupiah";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PinModal from "../components/pin";
const width = Dimensions.get("screen").width;

// BUILD-IN-FUNCTIONS...
export default function Nominal({ navigation }) {
     const [loading, setLoading] = useState(false);
     const [showPin, setShowPin] = useState(false);  
     const [amount, setAmount] = useState("");

     async function topUp(pin) {
          try {
               setLoading(true);
               if (!amount) {
                    ToastAndroid.showWithGravity("This column required", ToastAndroid.CENTER, ToastAndroid.LONG);
                    return;
               }
               const nominal = Number(amount);
               const res = await post("/topup", { amount: nominal, pin });
               if (res && res.code == '200') {
                    navigation.replace("Midtrans", {
                         snapURL: res.redirect_url,
                         orderId: res.order_id,
                    });
                    await AsyncStorage.setItem("payment", "true");
               } else {
                    ToastAndroid.showWithGravity(res?.message || "Top-up gagal. Silakan coba lagi.", ToastAndroid.CENTER, ToastAndroid.LONG);
                    return;
               }
          } catch (err) {
               ToastAndroid.showWithGravity(err?.message || "Terjadi kesalahan saat top-up.", ToastAndroid.CENTER, ToastAndroid.LONG);
          } finally {
               setLoading(false)
               setAmount("")
          }
     }
     return (
          <View style={style.container}>
               <PinModal
                    visible={showPin}
                    onClose={() => setShowPin(false)}
                    onSuccess={(pin) => topUp(pin)}
               />
               <StatusBar backgroundColor={colors.primary} barStyle={"light-content"} />
               <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 25, color: colors.background, marginBottom: 10 }}>{Rupiah(amount)}</Text>
               <View style={style.box}>
                    {/* <Image style={style.img} source={require("../../assets/images/vector-1.png")} /> */}
                    <Inputs value={amount} onChangeText={(e) => setAmount(e)} type='numeric' icon={"dollar-sign"} placeholder={"Enter amount..."} />
                    <View style={{ flexDirection: "row" }}>
                         <Buttons onpress={() => navigation.goBack()} disabled={loading} styling={[style.btn, { backgroundColor: colors.error }]}>
                              <Text style={style.btnText}>Back</Text>
                         </Buttons>
                         <Buttons onpress={() => setShowPin(true)} disabled={loading} styling={style.btn}>
                              <Text style={style.btnText}>Top-Up</Text>
                         </Buttons>
                    </View>
               </View>
               <MyLoading color={colors.primary} type={"Wave"} size={60} isVisible={loading} />
          </View>
     )
}

// STYLIING...
const style = StyleSheet.create({
     container: {
          flex: 1,
          backgroundColor: colors.primary,
          justifyContent: "center",
          alignItems: "center",
     },
     box: {
          backgroundColor: colors.background,
          width: "95%",
          elevation: 5,
          padding: "5%",
          paddingHorizontal: "8%",
          borderRadius: width / 20,
          alignItems: "center",
     },
     img: {
          width: "70%",
          height: "50%"
     },
     btnText: {
          fontFamily: "Poppins-Medium",
          color: colors.background,
          textAlign: "center",
          fontSize: 15,
     },
     btn: {
          backgroundColor: colors.primary,
          padding: "3%",
          paddingHorizontal: "10%",
          justifyContent: "center",
          alignItems: "center",
          elevation: 0,
     }
})
