// IMPORTS...
import { Dimensions, Pressable, StyleSheet, Text } from "react-native";
import colors from "../colors/colors";
const width = Dimensions.get("screen").width;

// BUILD-IN-FUNCTION...
export default function Keyboard({onpress , text, styling}) {
     return (
          <Pressable style={({pressed})=> [style.container , pressed && style.press , styling]} onPress={onpress}>
               <Text style={style.text}>{text}</Text>
          </Pressable>
     )
}

// STYLING...
const style = StyleSheet.create({
     container:{
          // borderWidth:2,
          flex:1,
          padding:"2%",
          borderRadius:width / 2,
          justifyContent:"center",
          alignItems:"center",
          margin:"1.5%",
          backgroundColor:colors.placeholder,
          // borderColor:colors.placeholder,
     },
     text:{
          color:colors.background,
          fontSize:28,
     },
     press:{
          transform:[{scale:0.90}],
     }
})