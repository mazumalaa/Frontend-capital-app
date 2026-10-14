// IMPORTS...
import { Alert, Dimensions, Image, ScrollView, StatusBar, StyleSheet, Text, ToastAndroid, View } from "react-native";
import colors from "../colors/colors";
import Inputs from "../components/inputs";
import Buttons from "../components/buttons";
import { useState } from "react";
import { post } from "../services";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setToken } from "../libs/tokenStorage";
import MyLoading from "../components/myLoading";
const width = Dimensions.get("screen").width;

// BUILD-IN-FUNCTIONS...
export default function Register({ navigation }) {
     const [loading, setLoading] = useState(false)
     const [form, setForm] = useState({});
     const inputs = (property, event) => { setForm(form => ({ ...form, [property]: event })) };
     async function signup() {
          try {
               setLoading(true)
               const res = await post("/auth/register", form);
               if (!res || res.code != '200') {
                    ToastAndroid.showWithGravity(
                         res?.message || "Registration failed. Please try again.",
                         ToastAndroid.CENTER,
                         ToastAndroid.LONG
                    );
                    return;
               }
               await AsyncStorage.clear();
               await setToken(res?.data?.token);
               await AsyncStorage.setItem("is_verified", "false");
               navigation.replace("OtpScreen", {
                    emailRecipient: res?.data?.emailRecipient || "",
               });
          } catch (err) {
               ToastAndroid.showWithGravity(
                    err?.message || "Could not reach the server. Please try again.",
                    ToastAndroid.CENTER,
                    ToastAndroid.LONG
               );
          } finally {
               setLoading(false);
          }
     }
     return (
          <View style={style.container}>
               <StatusBar backgroundColor={colors.primary} />
               <View style={style.form}>
                    <Image style={style.logo} source={require("../assets/images/logo2.png")} />
                    <ScrollView>
                         <View style={style.formInputContainer}>
                              <Inputs value={form.username} onChangeText={e => inputs("username", e)} icon={"user"} placeholder={"create your username..."} />
                              <Inputs value={form.phone} onChangeText={e => inputs("phone", e)} icon={"phone"} type={"numeric"} placeholder={"Enter your number phone..."} />
                              <Inputs value={form.email} onChangeText={e => inputs("email", e)} icon={"mail"} placeholder={"Enter your email..."} />
                              <Inputs value={form.password} onChangeText={e => inputs("password", e)} eyes={true} icon={"lock"} password={true} placeholder={"create your password..."} />
                              <Inputs value={form.confirmPassword} onChangeText={e => inputs("confirmPassword", e)} eyes={true} icon={"lock"} password={true} placeholder={"confirm your password..."} />
                              <Buttons disabled={loading} onpress={() => signup()} styling={style.btn}>
                                   <Text style={style.textBtn}>Register</Text>
                              </Buttons>

                              <View style={style.signup}>
                                   <Text style={style.textSignup}>Already have an account ?</Text>
                                   <Text onPress={() => navigation.replace("Login")} style={[style.textSignup, { fontFamily: "Poppins-Medium", color: colors.primary }]}>Signin</Text>
                              </View>
                         </View>
                    </ScrollView>
               </View>
               <MyLoading isVisible={loading} color={colors.primary} type={"Wave"} size={80} />
          </View>
     )
}

// STYLING...
const style = StyleSheet.create({
     container: {
          flex: 1,
          backgroundColor: colors.primary,
     },
     form: {
          position: "absolute",
          bottom: 0,
          height: "70%",
          width: "100%",
          borderTopEndRadius: width / 8,
          borderTopStartRadius: width / 8,
          backgroundColor: colors.background,
     },
     formInputContainer: {
          flex: 1,
          padding: "7%",
     },
     logo: {
          position: "absolute",
          top: "-45%",
          alignSelf: "center",
          width: "65%",
          height: "65%",
     },
     btn: {
          backgroundColor: colors.primary,
          padding: "4%",
          justifyContent: "center",
          alignItems: "center",
          elevation: 0,
     },
     textBtn: {
          fontFamily: "Poppins-Medium",
          color: colors.background,
          fontSize: 17,
          textAlign: "center",
     },
     signup: {
          marginVertical: 5,
          gap: 5,
          flexDirection: "row",
          justifyContent: "center",
     },
     textSignup: {
          fontFamily: "Poppins-Regular",
          color: colors.text,
     }
})