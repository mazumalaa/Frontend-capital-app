// IMPORTS...
import { Dimensions, Image, StatusBar, StyleSheet, Text, ToastAndroid, View } from "react-native";
import colors from "../../colors/colors";
import Inputs from "../../components/inputs";
import Buttons from "../../components/buttons";
import MyLoading from "../../components/myLoading";
import { useState } from "react";
import { post } from "../../services";
const width = Dimensions.get("screen").width;

// BUILD-IN-FUNCTIONS...
export default function InputFP({navigation}) {
     const [loading , setLoading] = useState(false);
     const [email, setEmail] = useState("");

     async function sendOTP() {
          try {
               setLoading(true);
               if(!email) {
                    ToastAndroid.showWithGravity("This column required" , ToastAndroid.CENTER , ToastAndroid.LONG);
                    return
               }
               const res = await post("/forgot/otp" , {email});
               if(res && res.code == '200'){
                    navigation.replace("ForgotPassword", { email });
               } else {
                    ToastAndroid.showWithGravity(res.message , ToastAndroid.CENTER , ToastAndroid.LONG);
                    return;
               }
          }catch(err){
               ToastAndroid.showWithGravity(err?.message || "Tidak dapat mengirim email. Coba lagi.", ToastAndroid.CENTER, ToastAndroid.LONG);
          }finally{
               setLoading(false)
          }
     }
     return (
          <View style={style.container}>
               <StatusBar backgroundColor={colors.primary} barStyle={"light-content"} />
               <View style={style.box}>
                    {/* <Image style={style.img} source={require("../../assets/images/vector-1.png")} /> */}
                    <Inputs value={email} onChangeText={(e)=> setEmail(e)} icon={"mail"} placeholder={"Enter your email..."} />
                   <View style={{flexDirection:"row"}}>
                     <Buttons onpress={()=> navigation.goBack()} disabled={loading} styling={[style.btn , {backgroundColor:colors.error}]}>
                         <Text style={style.btnText}>Back</Text>
                    </Buttons>
                     <Buttons onpress={()=> sendOTP()} disabled={loading} styling={style.btn}>
                         <Text style={style.btnText}>Send email</Text>
                    </Buttons>
                   </View>
               </View>
               <MyLoading color={colors.primary} type={"Wave"} size={60} isVisible={loading} />
          </View>
     )
}

// STYLIING...
const style = StyleSheet.create({
     container:{
          flex:1,
          backgroundColor:colors.primary,
          justifyContent:"center",
          alignItems:"center",
     },
     box:{
          backgroundColor:colors.background,
          width:"95%",
          elevation:5,
          padding:"5%",
          paddingHorizontal:"8%",
          borderRadius:width/ 20,
          alignItems:"center",
     },
     img:{
          width:"70%",
          height:"50%"
     },
     btnText:{
          fontFamily:"Poppins-Medium",
          color:colors.background,
          textAlign:"center",
          fontSize:15,
     },
     btn :{
          backgroundColor:colors.primary,
          padding:"3%",
          paddingHorizontal:"10%",
          justifyContent:"center",
          alignItems:"center",
          elevation:0,
     }
})
