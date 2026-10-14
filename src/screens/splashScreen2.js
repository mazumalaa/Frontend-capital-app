// IMPORT...
import { Dimensions, Image, ImageBackground, StatusBar, StyleSheet, Text, View } from "react-native";
import colors from "../colors/colors";
import LinearGradient from "react-native-linear-gradient";
import Buttons from "../components/buttons";
const width = Dimensions.get("window").width;

// BUILD-IN-FUNCTION...
export default function SplashScreen2({navigation}) {
     return (
          <ImageBackground style={style.container} source={require("../assets/images/money.jpeg")}>
               <LinearGradient colors={[colors.primary, "rgba(0,0,0,0.5)"]} style={style.pattern}>
                    <StatusBar backgroundColor={colors.primary} />
                    <View style={style.logo}>
                         <Image style={style.img} source={require("../assets/images/logo2.png")} />
                    </View>
               </LinearGradient>

               <View style={style.containerBtn}>
                    <Buttons onpress={()=> navigation.replace("Login")} styling={style.btn}>
                         <Text style={style.textBtn}>Login</Text>
                    </Buttons>
                    <Buttons onpress={()=> navigation.replace("Register")} styling={style.btn}>
                         <Text style={style.textBtn}>Register</Text>
                    </Buttons>
               </View>
          </ImageBackground>
     )
}

// STYLING...
const style = StyleSheet.create({
     container: {
          flex: 1,
     },
     logo: {
          width: width / 1,
          height: width / 1,
     },
     img: {
          width: "100%",
          height: "100%",
     },
     pattern: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
     },
     containerBtn: {
          position: "absolute",
          width:"100%",
          bottom: 5,
     },
     btn: {
          width: "90%",
          alignSelf: "center",
     },
     textBtn: {
          textAlign:"center",
          fontSize:18,
          fontFamily:"Poppins-Medium",
          color: colors.primary
     }
})