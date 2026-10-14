// IMPORT...
import { Dimensions, StyleSheet, Text, View } from "react-native";
import colors from "../colors/colors";
const width = Dimensions.get("screen").width;

// BUILD-IN-FUNCTIONS...
export default function Columns({text}) {
     return (
          <View style={style.container}>
               <Text style={style.text}>{text}</Text>
          </View>
     )
}

// STYLING...
const style = StyleSheet.create({
     container:{
          width:width / 6,
          height:width / 6,
          justifyContent:"center",
          alignItems:"center",
          borderRadius:width / 20,
          borderColor:colors.primary,
          borderWidth:2.4,
          backgroundColor:colors.background,
     },
     text:{
          color:colors.primary,
          fontSize:32,
     }
})