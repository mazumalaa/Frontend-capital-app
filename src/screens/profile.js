// IMPORTS...
import { Dimensions, Image, ScrollView, StatusBar, StyleSheet, Text, ToastAndroid, View, } from "react-native";
import colors from "../colors/colors";
import Icon from "@react-native-vector-icons/feather";
import Inputs from "../components/inputs";
import Buttons from "../components/buttons";
import { useCallback, useEffect, useState } from "react";
import { get, post, put, update, upload } from "../services";
import MyLoading from "../components/myLoading";
import AppAlert from "../components/appAlert";
import { library } from "../libs/imagePicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearToken } from "../libs/tokenStorage";

const width = Dimensions.get("screen").width;

export default function Profile({ navigation , route }) {
     const {message} = route?.params || "";
     const [data, setData] = useState({});
     const [loading, setLoading] = useState(false);
     const [photo, setPhoto] = useState();
     const [edit, setEdit] = useState(false);
     const [pin, setPin] = useState();
     const [alert, setAlert] = useState({ visible: false });
     const getProfile = useCallback(async () => {
          try {
               if (message) {
                    ToastAndroid.showWithGravity(message, ToastAndroid.CENTER, ToastAndroid.LONG);
               }
               setLoading(true);
               const res = await get("/profile");
               const res2 = await get("/profile/photo");
               setPhoto(res2?.data?.url || null);
               setData({ ...res.data, pin: res.data.has_pin ? true : null });
          } catch (err) {
               console.log(err);
          } finally {
               setLoading(false);
          }
     }, [message]);

     async function updateProfile() {
          try {
               setLoading(true);
               const res = await put(`/profile/${data._id}`, data);
               console.log(res);
               getProfile();
          } catch (err) {
               console.log(err);
          } finally {
               setLoading(false);
          }
     }

     async function handlePhotoUpload(isUpdate) {
          try {
               setLoading(true);
               const selectedImage = await library();
               if (!selectedImage) return;
               if (selectedImage.fileSize > 2 * 1024 * 1024) {
                    setAlert({
                         visible: true,
                         type: "error",
                         title: "Ukuran foto terlalu besar",
                         message: "Pilih foto dengan ukuran maksimal 2 MB, lalu coba lagi.",
                    });
                    return;
               }
               const response = isUpdate
                    ? await update("/profile/photo", selectedImage)
                    : await upload("/profile/photo", selectedImage);
               if (response?.code !== "200") {
                    throw new Error(response?.message || "Foto tidak dapat diunggah. Silakan coba lagi.");
               }
               await getProfile();
               setAlert({
                    visible: true,
                    type: "success",
                    title: isUpdate ? "Foto profil diperbarui" : "Foto profil diunggah",
                    message: "Foto profil Anda berhasil disimpan.",
               });
          } catch (err) {
               setAlert({
                    visible: true,
                    type: "error",
                    title: "Foto gagal diunggah",
                    message: err?.message || "Terjadi kendala saat menyimpan foto. Coba pilih foto lain.",
               });
          } finally {
               setLoading(false);
          }
     }

     async function editEmail() {
          try {
               setLoading(true);
               const res = await post("/profile/email/otp", { email: data.email });
               console.log(res);
               if (res.code == '200') {
                    navigation.replace("EditEmail");
               }
          } catch (err) {
               console.log(err);
          } finally {
               setLoading(false)
          }
     }

     async function updatePin() {
          try {
               setLoading(true);
               const res = await post("/profile/email/otp", { email: data.email });
               console.log(res);
               if (res.code == '200') {
                    navigation.replace("UpdatePin");
               }
          } catch (err) {
               console.log(err);
          } finally {
               setLoading(false)
          }
     }

     async function logout(){
          await AsyncStorage.clear();
          await clearToken();
          navigation.replace("Login");
     }

     useEffect(() => {
          getProfile();
     }, [getProfile]);
     return (
          <View style={{ flex: 1, backgroundColor: colors.primaryLight }}>
               <StatusBar backgroundColor={colors.primary} />

               {/* HEADER */}
               <View style={style.header}>
                    <Icon
                         onPress={() => navigation.goBack()}
                         color={colors.background}
                         size={25}
                         name="arrow-left"
                    />
                    <Text style={style.headerTitle}>Profile</Text>
               </View>

               {/* FOTO PROFIL */}
               <View style={style.header2}>
                    {photo != null ? <Image style={style.img} source={{ uri: photo }} /> :
                         <Image style={style.img} source={require("../assets/images/avatar.jpg")} />}
                    <Icon onPress={() => handlePhotoUpload(photo != null)} size={20} style={style.photo} name="camera" />
               </View>

               {/* FORM */}
               <ScrollView
                    contentContainerStyle={{ paddingVertical: 20, gap: 10 }}
                    showsVerticalScrollIndicator={false}>
                    <View style={style.bioData}>
                         <Text style={style.title}>Username & Phone</Text>
                         <Inputs editable={edit} value={data.username} onChangeText={
                              (e) => setData(prev => ({ ...prev, username: e }))
                         } icon="user" placeholder="Create your username..." />
                         <Inputs editable={edit} value={data.phone} onChangeText={(e) =>
                              setData(prev => ({ ...prev, phone: e }))
                         } icon="phone" type="numeric" placeholder="Enter your phone number..." />
                         <Inputs editable={false} value={data.role} icon="check-circle"/>
                         <View style={{ flexDirection: "row" }}>
                              <Buttons disabled={edit} onpress={() => setEdit(!edit)} styling={[style.btn, { backgroundColor: edit ? colors.buttonDisabled : colors.primary }]}>
                                   <Text style={style.btnt}>Edit</Text>
                              </Buttons>
                              <Buttons disabled={!edit} onpress={() => {
                                   updateProfile();
                                   setEdit(!edit)
                              }
                              } styling={[style.btn, { backgroundColor: !edit ? colors.buttonDisabled : colors.primary }]}>
                                   <Text style={style.btnt}>Save</Text>
                              </Buttons>
                         </View>
                    </View>

                    <View style={style.bioData}>
                         <Text style={style.title}>Email</Text>
                         <Inputs editable={false} value={data.email} icon="mail" placeholder="Enter your email..." />
                         <View style={{ flexDirection: "row" }}>
                              <Buttons onpress={() => editEmail()} styling={style.btn}>
                                   <Text style={style.btnt}>Edit Email</Text>
                              </Buttons>
                         </View>
                    </View>

                    <View style={style.bioData}>
                         <Text style={style.title}>Pin</Text>
                         <Inputs password={true} editable={false} value={data.pin ? '123456' : null} icon="lock" placeholder="Create pin..." />
                         <View style={{ flexDirection: "row" }}>
                              <Buttons onpress={() => updatePin()} styling={style.btn}>
                                   <Text style={style.btnt}>{data.pin != null ? 'Edit Pin' : 'Create Pin'}</Text>
                              </Buttons>
                         </View>
                    </View>
                    <Buttons onpress={() => logout()} styling={[style.btn , {marginHorizontal:"5%" , backgroundColor:colors.error}]}>
                         <Text style={style.btnt}>Logout</Text>
                    </Buttons>
               </ScrollView>
               <MyLoading isVisible={loading} color={colors.primary} type={"Wave"} size={80} />
               <AppAlert
                    visible={alert.visible}
                    type={alert.type}
                    title={alert.title}
                    message={alert.message}
                    onClose={() => setAlert(current => ({ ...current, visible: false }))}
               />
          </View>
     );
}

const style = StyleSheet.create({
     header: {
          padding: "4%",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: colors.primary,
          zIndex: 2,
     },
     headerTitle: {
          fontSize: 20,
          fontFamily: "Poppins-Medium",
          color: colors.background,
     },
     header2: {
          elevation: 3,
          backgroundColor: colors.primary,
          alignItems: "center",
          paddingVertical: 20,
          borderBottomLeftRadius: width / 10,
          borderBottomRightRadius: width / 10,
          zIndex: 1,
     },
     img: {
          width: 110,
          height: 110,
          backgroundColor: "#333",
          borderRadius: 55,
          borderWidth: 4,
          borderColor: colors.background,
     },
     photo: {
          position: "absolute",
          bottom: 15,
          alignSelf: "center",
          backgroundColor: colors.background,
          color: colors.primary,
          borderRadius: 999,
          padding: 6,
          elevation: 3,
     },
     bioData: {
          alignSelf: "center",
          width: "90%",
          borderRadius: 12,
          backgroundColor: colors.background,
          padding: "3%",
          paddingHorizontal: "5%",
          elevation: 2,
     },
     btn: {
          elevation: 0,
          padding: "2.5%",
          backgroundColor: colors.primary,
          paddingHorizontal: "10%",
          justifyContent: "center",
          alignItems: "center",
     },
     btnt: {
          fontFamily: "Poppins-Medium",
          color: colors.background,
     },
     title: {
          fontFamily: "Poppins-Medium",
          fontSize: 16,
          color: colors.primary,
     }
});
