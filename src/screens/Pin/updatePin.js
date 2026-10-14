// IMPORTS...
import { Dimensions, Image, StatusBar, StyleSheet, Text, ToastAndroid, View } from "react-native";
import colors from "../../colors/colors";
import Inputs from "../../components/inputs";
import Buttons from "../../components/buttons";
import MyLoading from "../../components/myLoading";
import { useState } from "react";
import { put } from "../../services";
const width = Dimensions.get("screen").width;

// BUILD-IN-FUNCTIONS...
export default function UpdatePin({ navigation }) {
     const [loading, setLoading] = useState(false);
     const [form, setForm] = useState({});

     const inputs = (property, value) => {
          const digits = value.replace(/\D/g, "").slice(0, 6);
          setForm(current => ({ ...current, [property]: digits }));
     };

     async function update() {
          if (!/^\d{6}$/.test(form.otp || "")) {
               ToastAndroid.showWithGravity("Masukkan OTP 6 digit yang masih berlaku.", ToastAndroid.CENTER, ToastAndroid.LONG);
               return;
          }
          if (!/^\d{6}$/.test(form.pin || "")) {
               ToastAndroid.showWithGravity("PIN harus terdiri dari 6 digit.", ToastAndroid.CENTER, ToastAndroid.LONG);
               return;
          }
          if (form.pin !== form.confirmPin) {
               ToastAndroid.showWithGravity("Konfirmasi PIN tidak cocok.", ToastAndroid.CENTER, ToastAndroid.LONG);
               return;
          }

          try {
               setLoading(true);
               const res = await put("/profile/pin", form);
               if (res?.code !== "200") {
                    throw new Error(res?.message || "PIN gagal disimpan. Silakan coba lagi.");
               }
               setForm({});
               navigation.replace("Profile");
          } catch (err) {
               ToastAndroid.showWithGravity(
                    err?.message || "PIN gagal disimpan. Periksa OTP lalu coba lagi.",
                    ToastAndroid.CENTER,
                    ToastAndroid.LONG
               );
          } finally {
               setLoading(false);
          }
     }

     return (
          <View style={style.container}>
               <StatusBar backgroundColor={colors.primary} barStyle={"light-content"} />
               <View style={style.box}>
                    {/* <Image style={style.img} source={require("../../assets/images/vector-2.png")} /> */}
                    <Inputs value={form.otp || ''} onChangeText={(e) => inputs("otp", e)} type={"numeric"} icon={"shield"} placeholder={"OTP verification..."} />
                    <Inputs value={form.pin || ''} onChangeText={(e) => inputs("pin", e)} type={"numeric"} icon={"key"} placeholder={"Create your new pin..."} />
                    <Inputs value={form.confirmPin || ''} onChangeText={(e) => inputs("confirmPin", e)} type={"numeric"} icon={"key"} placeholder={"Confirm your pin..."} />
                   <View style={{flexDirection:"row"}}>
                     <Buttons onpress={() => navigation.replace("Profile")} disabled={loading} styling={[style.btn , {backgroundColor:colors.error}]}>
                         <Text style={style.btnText}>Back</Text>
                    </Buttons>
                     <Buttons onpress={() => update()} disabled={loading} styling={style.btn}>
                         <Text style={style.btnText}>Save</Text>
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
          height: "40%"
     },
     btnText: {
          fontFamily: "Poppins-Medium",
          color: colors.background,
          textAlign: "center",
          fontSize: 16,
     },
     btn: {
          backgroundColor: colors.primary,
          elevation: 0,
          justifyContent:"center",
          alignItems:"center",
          padding:"5%",
          paddingHorizontal:"10%",
     },
     resend: {
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 5,
     },
     resendText: {
          color: colors.placeholder,
          fontFamily: "Poppins-Regular",
     },
})
