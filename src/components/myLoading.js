import React, { useEffect } from 'react';
import { Dimensions, Modal, StatusBar, View } from 'react-native';
import Spinner from 'react-native-spinkit';
const width = Dimensions.get("screen").width;

const MyLoading = ({ isVisible, type, color, size }) => {
  return (
    <Modal animationType='fade' visible={isVisible} transparent={true}  statusBarTranslucent={true}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "rgba(0,0,0,0.5)" }}>
        <View style={{
          backgroundColor:"rgba(255,253,248, 0.9)" , 
          width:"60%" , 
          height:"25%",
          justifyContent:"center" , 
          alignItems:"center",
          borderRadius:width / 20,
          elevation:5,
          }}>
          <Spinner
            isVisible={isVisible}
            size={size}
            type={type} // Jenis spinner, banyak pilihan
            color={color}
          />
        </View>
      </View>
    </Modal>
  );
};

export default MyLoading;
