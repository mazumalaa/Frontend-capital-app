// IMPORTS...
import { Dimensions, StyleSheet, Text, TextInput, View } from "react-native";
import colors from "../colors/colors";
import Icon from "@react-native-vector-icons/feather";
import { useState } from "react";
const width = Dimensions.get("screen").width;

// BUILD-IN-FUNCTIONS...
export default function Inputs({onChangeText, placeholder, type, password, icon , eyes, value, editable}) {
     const [visible , setVisible] = useState(false);
     const [focus, setFocus] = useState(false);

     return(
          <View style={[style.container , {borderColor:focus ? colors.primary : colors.placeholder}]}>
               <Icon size={20} color={focus ? colors.primary : colors.placeholder} name={icon} />
               <TextInput editable={editable} value={value} onFocus={()=> setFocus(true)} onBlur={()=> setFocus(false)} secureTextEntry={visible ? false : password} keyboardType={type} style={style.input} placeholderTextColor={colors.placeholder} placeholder={placeholder} onChangeText={onChangeText} />
               {eyes ? <Icon onPress={()=> setVisible(!visible) } color={colors.placeholder} style={style.eye} size={20} name={visible ? "eye-off" : "eye"}/ > : null}
          </View>
     )
}

// STYLING....
const style = StyleSheet.create({
     container:{
          padding:"1%",
          paddingHorizontal:"5%",
          borderWidth:2,
          borderRadius:width / 2 ,
          backgroundColor:colors.background,
          marginVertical:5,
          overflow:"hidden",
          flexDirection:"row",
          paddingEnd:"12%",
          gap:5,
          alignItems:"center",
     },
     label:{
          position:"absolute",
          top:"-25%",
          left:"8%",
          backgroundColor:colors.background,
          zIndex:99,
          color:colors.placeholder,
          fontFamily:"Poppins-Medium",
          paddingHorizontal:"2%",
     },
     input:{
          fontFamily:"Poppins-Regular",
          color:colors.text,
          width:"100%",
          fontSize:14,
     },
     eye:{
          position:"absolute",
          right:"1%",
          backgroundColor:colors.background,
          padding:"5%",
     }
})