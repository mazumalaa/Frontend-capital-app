import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "@react-native-vector-icons/feather";
import colors from "../colors/colors";

const alertIcons = {
     info: "info",
     success: "check-circle",
     error: "alert-circle",
};

const alertColors = {
     info: colors.info,
     success: colors.success,
     error: colors.error,
};

export default function AppAlert({
     visible,
     title,
     message,
     type = "info",
     buttonText = "Mengerti",
     onClose,
}) {
     const accent = alertColors[type] || alertColors.info;
     const iconName = alertIcons[type] || alertIcons.info;

     return (
          <Modal
               visible={visible}
               transparent
               animationType="fade"
               statusBarTranslucent
               onRequestClose={onClose}
          >
               <View style={styles.backdrop}>
                    <View style={styles.card}>
                         <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
                              <Icon name={iconName} size={30} color={accent} />
                         </View>
                         <Text style={styles.title}>{title}</Text>
                         <Text style={styles.message}>{message}</Text>
                         <Pressable
                              accessibilityRole="button"
                              onPress={onClose}
                              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                         >
                              <Text style={styles.buttonText}>{buttonText}</Text>
                         </Pressable>
                    </View>
               </View>
          </Modal>
     );
}

const styles = StyleSheet.create({
     backdrop: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          backgroundColor: "rgba(25, 42, 40, 0.55)",
     },
     card: {
          width: "100%",
          maxWidth: 380,
          alignItems: "center",
          padding: 24,
          borderRadius: 22,
          backgroundColor: colors.background,
          elevation: 10,
     },
     iconWrap: {
          width: 64,
          height: 64,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 32,
          marginBottom: 16,
     },
     title: {
          color: colors.text,
          fontSize: 20,
          fontFamily: "Poppins-Medium",
          textAlign: "center",
          marginBottom: 8,
     },
     message: {
          color: colors.textSecondary,
          fontSize: 14,
          lineHeight: 21,
          fontFamily: "Poppins-Regular",
          textAlign: "center",
          marginBottom: 22,
     },
     button: {
          width: "100%",
          alignItems: "center",
          paddingVertical: 13,
          borderRadius: 14,
          backgroundColor: colors.primary,
     },
     buttonPressed: {
          backgroundColor: colors.primaryDark,
     },
     buttonText: {
          color: colors.buttonText,
          fontSize: 15,
          fontFamily: "Poppins-Medium",
     },
});
