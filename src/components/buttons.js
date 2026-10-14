// IMPORTS...
import { Dimensions, Pressable, StyleSheet } from "react-native";
import colors from "../colors/colors";
const width = Dimensions.get("window").width;

// BUILD-IN-FUNCTIONS...
export default function Buttons({children, styling, onpress, disabled}) {
     return (
          <Pressable disabled={disabled} onPress={onpress} style={({pressed})=> [style.container , styling , pressed && style.press]}>
               {children}
          </Pressable>
     )
}

// STYLING...
const style = StyleSheet.create({
     container:{
          backgroundColor:colors.background,
          padding:"3%",
          margin:5,
          borderRadius:width / 2,
          elevation:5,
     },
     press:{
          transform:[{scale:0.95}],
     }
})