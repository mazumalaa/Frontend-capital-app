// PinModal.js
import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard, ToastAndroid } from "react-native";
import Icon from "@react-native-vector-icons/feather";
import colors from "../colors/colors";
import { post } from "../services"; // or import gerneric post

export default function PinModal({ visible, onClose, onSuccess }) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (pin.length !== 6) {
      ToastAndroid.show("PIN harus 6 digit", ToastAndroid.SHORT);
      return;
    }
    setLoading(true);
    try {
      const res = await post("/profile/pin/confirmation" , {pin}); // panggil route backend
      if (res?.code === "200" || res?.success) {
        onSuccess(pin);
        onClose();
      } else {
        ToastAndroid.show(res?.message || "PIN tidak valid", ToastAndroid.SHORT);
      }
    } catch (err) {
      console.log(err);
      ToastAndroid.show("Gagal verifikasi PIN", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
      setPin("");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.modal}>
        <Icon name="shield" size={40} color={colors.primary} style={styles.icon} />
        <Text style={styles.title}>Masukkan PIN</Text>
        <TextInput
          style={styles.input}
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          maxLength={6}
          secureTextEntry
          autoFocus
          onSubmitEditing={handleSubmit}
        />
        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} disabled={loading} onPress={handleSubmit}>
          <Text style={styles.btnText}>{loading ? "Memeriksa..." : "Konfirmasi PIN"}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    position: "absolute",
    top: "10%",
    alignSelf: "center",
    width: "80%",
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  icon: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    color: colors.primary,
    marginBottom: 20,
    fontFamily: "Poppins-Medium",
  },
  input: {
    width: "60%",
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 10,
    color:colors.textSecondary,
    marginBottom: 20,
    borderBottomWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 5,
  },
  btn: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    width: "100%",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: colors.background,
    textAlign: "center",
    fontFamily: "Poppins-Medium",
  },
});
