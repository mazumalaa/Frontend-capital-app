// IMPORTS...
import { Dimensions, Image, StatusBar, StyleSheet, Text, View, ToastAndroid, ScrollView } from "react-native";
import colors from "../colors/colors";
import Inputs from "../components/inputs";
import Buttons from "../components/buttons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setToken } from "../libs/tokenStorage";
import { useState } from "react";
import { post } from "../services";
import MyLoading from "../components/myLoading";
const width = Dimensions.get("screen").width;

// BUILD-IN-FUNCTIONS...
export default function Login({ navigation }) {
     const [loading, setLoading] = useState(false)
     const [form, setForm] = useState({});
     const inputs = (property, event) => { setForm(form => ({ ...form, [property]: event })) };

     async function signin() {
          try {
               setLoading(true)
               const res = await post("/auth/login", form);
               if (!res || res.code != '200') {
                    ToastAndroid.showWithGravity(res.message, ToastAndroid.CENTER, ToastAndroid.LONG);
                    return;
               }
               await AsyncStorage.clear();
               await setToken(res?.data);
               await AsyncStorage.setItem("is_verified", "true");
               await AsyncStorage.setItem("payment", "false")
               navigation.replace("Dashboard");
          } catch (err) {
               ToastAndroid.showWithGravity(err?.message || "Tidak dapat masuk. Coba lagi.", ToastAndroid.CENTER, ToastAndroid.LONG);
          } finally {
               setLoading(false)
          }
     }
     return (
          <View style={style.container}>
               <StatusBar backgroundColor={colors.primary} />
               <View style={style.form}>
                    <Image style={style.logo} source={require("../assets/images/logo2.png")} />
                    <ScrollView>
                         <View style={style.formInputContainer}>
                              <Inputs value={form.email} onChangeText={e => inputs("email", e)} icon={"mail"} placeholder={"Enter your email..."} />
                              <Inputs value={form.password} onChangeText={e => inputs("password", e)} eyes={true} icon={"lock"} password={true} placeholder={"Enter your password..."} />

                              <View style={[style.signup, { justifyContent: "flex-start", marginVertical: 10, }]}>
                                   <Text onPress={() => navigation.navigate("InputFP")} style={[style.textSignup, { color: colors.primary }]}>Forgot password</Text>
                              </View>

                              <Buttons disabled={loading} onpress={() => signin()} styling={style.btn}>
                                   <Text style={style.textBtn}>Login</Text>
                              </Buttons>

                              <View style={style.signup}>
                                   <Text style={style.textSignup}>You don't have an'account ?</Text>
                                   <Text onPress={() => navigation.replace("Register")} style={[style.textSignup, { fontFamily: "Poppins-Medium", color: colors.primary }]}>Signup</Text>
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
          height: "60%",
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