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
export default function EditEmail({ navigation }) {
     const [loading, setLoading] = useState(false);
     const [form, setForm] = useState({});

     const inputs = (property, event) => setForm(form => ({ ...form, [property]: event }));

     async function editEmail() {
          try {
               setLoading(true);
               const res = await put("/profile/email", form);
               console.log(res)
               if (res && res.code == '200') {
                    navigation.replace("Profile");
               } else {
                    ToastAndroid.showWithGravity(res.message, ToastAndroid.CENTER, ToastAndroid.LONG);
                    return;
               }
          } catch (err) {
               console.log(err);
          } finally {
               setLoading(false)
               setForm({});
          }
     }

     return (
          <View style={style.container}>
               <StatusBar backgroundColor={colors.primary} barStyle={"light-content"} />
               <View style={style.box}>
                    {/* <Image style={style.img} source={require("../../assets/images/vector-2.png")} /> */}
                    <Inputs onChangeText={(e) => inputs("otp", e)} type={"numeric"} icon={"shield"} placeholder={"OTP verification..."} />
                    <Inputs onChangeText={(e) => inputs("email", e)} icon={"mail"} placeholder={"Create your new Email..."} />
                    <Inputs onChangeText={(e) => inputs("confirmEmail", e)} icon={"mail"} placeholder={"Confirm your Email..."} />
                   <View style={{flexDirection:"row"}}>
                     <Buttons onpress={() => navigation.replace("Profile")} disabled={loading} styling={[style.btn , {backgroundColor:colors.error}]}>
                         <Text style={style.btnText}>Back</Text>
                    </Buttons>
                     <Buttons onpress={() => editEmail()} disabled={loading} styling={style.btn}>
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
