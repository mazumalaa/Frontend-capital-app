// IMPORTS
import { Dimensions, FlatList, Image, KeyboardAvoidingView, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import colors from "../../colors/colors";
import Inputs from "../../components/inputs";
import Icon from "@react-native-vector-icons/fontawesome6";
import Icon2 from "@react-native-vector-icons/feather";
import { del, get, put } from "../../services";
import { useCallback, useEffect, useState } from "react";
import MyLoading from "../../components/myLoading";
import debounce from "lodash.debounce";
import Rupiah from "../../libs/formatRupiah";
import Buttons from "../../components/buttons";

const width = Dimensions.get("screen").width;

export default function Users() {
     const [loading, setLoading] = useState(false);
     const [ID, setID] = useState("");
     const [modal, setModal] = useState(false);
     const [data, setData] = useState([]);
     const [photo, setPhoto] = useState({});
     const [refresh, setRefresh] = useState(false);
     const [searchText, setSearchText] = useState("");
     const [confirmModal, setConfirmModal] = useState(false);
     const [selectedItem, setSelectedItem] = useState(null);
     const [edit, setEdit] = useState(false);

     // Fetch data
     const getUsers = useCallback(async () => {
          try {
               setLoading(true);
               const response = await get("/users");
               const photoData = {};
               await Promise.all(response.data.map(async (item) => {
                    const getPhoto = await get(`/receiver/photo?user_id=${item._id}`);
                    photoData[item._id] = getPhoto?.data?.url || "";
               }));
               setData(response.data);
               setPhoto(photoData);
          } catch (err) {
               console.log(err);
          } finally {
               setLoading(false);
          }
     }, []);

     async function loadData() {
          try {
               setRefresh(true);
               await getUsers();
          } catch (err) {
               console.log(err);
          } finally {
               setRefresh(false);
          }
     }

     const search = useCallback(async () => {
          try {
               setLoading(true);
               const response = await get(`/users?keyword=${searchText}`);
               const photoData = {};
               await Promise.all(response.data.map(async (item) => {
                    const getPhoto = await get(`/receiver/photo?user_id=${item._id}`);
                    photoData[item._id] = getPhoto?.data?.url || "";
               }));
               setData(response.data);
               setPhoto(photoData);
          } catch (err) {
               console.log(err);
          } finally {
               setLoading(false);
          }
     }, [searchText]);

     const handleUpdate = async () => {
          try {
               setLoading(true);
               await put(`/user/${selectedItem._id}`, selectedItem);
               setEdit(false);
               setModal(false);
               getUsers();
          } catch (err) {
               console.log(err);
          } finally {
               setLoading(false);
          }
     };

     const handleDelete = async (userID) => {
          try {
               await del(`/user/${userID}`);
               getUsers();
          } catch (err) {
               console.log(err);
          } finally {
               setConfirmModal(false);
          }
     };

     const handleOpenEdit = (item) => {
          setSelectedItem(item);
          setID(item._id);
          setEdit(true);
          setTimeout(() => setModal(true), 0); // ensure state is updated first
     };

     const handleOpenView = (item) => {
          setSelectedItem(item);
          setID(item._id);
          setEdit(false);
          setTimeout(() => setModal(true), 0);
     };

     useEffect(() => {
          const delayedSearch = debounce(() => {
               if (searchText.trim() === "") {
                    getUsers();
               } else {
                    search();
               }
          }, 500);
          delayedSearch();
          return delayedSearch.cancel;
     }, [searchText, getUsers, search]);

     useEffect(() => {
          getUsers();
     }, [getUsers]);

     return (
          <>
               <View style={style.header}></View>
               <View style={style.search}>
                    <Inputs value={searchText} onChangeText={text => setSearchText(text)} icon="search" placeholder="Search..." />
               </View>

               <FlatList
                    refreshControl={<RefreshControl refreshing={refresh} onRefresh={loadData} />}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={style.flatList}
                    data={data}
                    renderItem={({ item }) => (
                         <Pressable onPress={() => handleOpenView(item)} style={style.place}>
                              <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
                                   <Image
                                        style={style.image}
                                        source={photo[item._id] ? { uri: photo[item._id] } : require("../../assets/images/avatar.jpg")}
                                   />
                                   <View>
                                        <Text style={{ color: colors.primary, fontFamily: "Poppins-Medium", textTransform: "capitalize", fontSize: 13 }}>{item.username}</Text>
                                        <Text style={{ color: colors.textDisabled, fontFamily: "Poppins-Regular" }}>{item.role}</Text>
                                   </View>
                              </View>
                              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                   <Icon2 onPress={() => handleOpenEdit(item)} style={style.icons} name="edit-2" />
                                   <Pressable onPress={() => {
                                        setSelectedItem(item);
                                        setConfirmModal(true);
                                   }}>
                                        <Icon2 style={[style.icons, { backgroundColor: colors.error }]} name="trash" />
                                   </Pressable>
                              </View>
                         </Pressable>
                    )}
               />

               <MyLoading isVisible={loading} color={colors.primary} type="Wave" size={80} />

               {/* Modal Detail / Edit */}
               <Modal
                    animationType="fade"
                    visible={modal}
                    onRequestClose={() => {
                         setModal(false);
                         setEdit(false);}}
                    transparent={true}
                    statusBarTranslucent={true}>
                    <Pressable
                         onPress={() => {
                              setModal(false);
                              setEdit(false);
                         }}
                         style={style.modal}>
                         <Pressable style={style.placeItem}>
                                   <ScrollView
                                        contentContainerStyle={{ paddingBottom: "100%" }}
                                        showsVerticalScrollIndicator={false}>
                                        <Image
                                             style={style.imageModal}
                                             source={photo[ID] ? { uri: photo[ID] } : require("../../assets/images/avatar.jpg")}/>
                                        <View>
                                             <Inputs
                                                  icon="dollar-sign"
                                                  value={Rupiah((selectedItem?.balance ?? 0).toString())}
                                                  editable={false}
                                                  placeholder="Balance"/>
                                             <Inputs
                                                  icon="user"
                                                  value={selectedItem?.username || ""}
                                                  editable={edit}
                                                  onChangeText={(val) => setSelectedItem(prev => ({ ...prev, username: val }))}
                                                  placeholder="Username"/>
                                             <Inputs
                                                  icon="mail"
                                                  value={selectedItem?.email || ""}
                                                  editable={edit}
                                                  onChangeText={(val) => setSelectedItem(prev => ({ ...prev, email: val }))}
                                                  placeholder="Email"/>
                                             <Inputs
                                                  icon="phone"
                                                  value={selectedItem?.phone || ""}
                                                  editable={edit}
                                                  onChangeText={(val) => setSelectedItem(prev => ({ ...prev, phone: val }))}
                                                  placeholder="Phone"/>
                                             <Inputs
                                                  icon="check-circle"
                                                  value={selectedItem?.role || ""}
                                                  editable={edit}
                                                  onChangeText={(val) => setSelectedItem(prev => ({ ...prev, role: val }))}
                                                  placeholder="Role"/>
                                        </View>

                                        {edit && (
                                             <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
                                                  <Buttons
                                                       onpress={() => {
                                                            setEdit(false);
                                                            setModal(false);
                                                       }} styling={{ backgroundColor: colors.error, paddingHorizontal: "10%", elevation: 0 }}>
                                                       <Text style={{ color: colors.background, fontFamily: "Poppins-Medium" }}>Cancel</Text>
                                                  </Buttons>
                                                  <Buttons
                                                       onpress={handleUpdate}
                                                       styling={{ backgroundColor: colors.primary, paddingHorizontal: "10%", marginLeft: 10, elevation: 0 }}>
                                                       <Text style={{ color: colors.background, fontFamily: "Poppins-Medium" }}>Update</Text>
                                                  </Buttons>
                                             </View>
                                        )}
                                   </ScrollView>
                         </Pressable>
                    </Pressable>
               </Modal>

               {/* Modal Konfirmasi Hapus */}
               <Modal statusBarTranslucent={true} animationType="fade" visible={confirmModal} onRequestClose={() => setConfirmModal(false)} transparent={true}>
                    <Pressable onPress={() => setConfirmModal(false)} style={style.modal}>
                         <View style={style.confirmationModal}>
                              <Icon color={colors.primary} style={{ marginVertical: "2%" }} size={30} name="circle-info" iconStyle="solid" />
                              <Text style={style.confirmationText}>Are You Sure ?</Text>
                              <View style={style.modalButtons}>
                                   <Pressable onPress={() => setConfirmModal(false)} style={style.modalButtonCancel}>
                                        <Text style={style.modalButtonText}>cancle</Text>
                                   </Pressable>
                                   <Pressable onPress={() => handleDelete(selectedItem?._id)} style={style.modalButtonConfirm}>
                                        <Text style={style.modalButtonText}>delete</Text>
                                   </Pressable>
                              </View>
                         </View>
                    </Pressable>
               </Modal>
          </>
     );
}

// STYLING...
const style = StyleSheet.create({
     header: {
          backgroundColor: colors.primary,
          height: "10%",
          paddingHorizontal: "4%",
          elevation: 5,
          borderEndEndRadius: width / 8,
          borderStartEndRadius: width / 8,
     },
     search: {
          zIndex: 99,
          marginVertical: "4%",
          alignSelf: "center",
          paddingHorizontal: "8%",
     },
     flatList: {
          gap: 10,
          paddingHorizontal: "4%",
     },
     logo: {
          fontSize: 25,
          marginTop: "5%",
          color: colors.background,
          alignSelf: "center"
     },
     image: {
          width: 50,
          height: 50,
          borderRadius: width / 2,
     },
     imageModal: {
          width: 100,
          height: 100,
          alignSelf: "center",
          borderRadius: width / 2,
     },
     place: {
          elevation: 1,
          justifyContent: "space-between",
          padding: "3%",
          borderRadius: width / 35,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: colors.background,
     },
     icons: {
          backgroundColor: colors.primary,
          color: colors.background,
          padding: "1%",
          fontSize: 20,
          borderRadius: width / 100,
     },
     modal: {
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
     },
     placeItem: {
          backgroundColor: colors.background,
          height: "70%",
          position: "absolute",
          bottom: 0,
          width: "100%",
          borderStartStartRadius: width / 8,
          padding: "5%",
          borderEndStartRadius: width / 8,
     },
     confirmationModal: {
          backgroundColor: colors.background,
          padding: "5%",
          borderRadius: width / 20,
          marginTop: "10%",
          marginHorizontal: "5%",
          alignItems: "center",
     },
     confirmationText: {
          fontSize: 16,
          textAlign: "center",
          fontFamily: "Poppins-Regular",
          marginBottom: 20,
          color: colors.primary,
     },
     modalButtons: {
          flexDirection: "row",
          gap: 10,
     },
     modalButtonCancel: {
          backgroundColor: colors.textDisabled,
          padding: "3%",
          paddingHorizontal: "10%",
          borderRadius: width / 2,
     },
     modalButtonConfirm: {
          backgroundColor: colors.error,
          padding: "3%",
          paddingHorizontal: "10%",
          borderRadius: width / 2,
     },
     modalButtonText: {
          color: colors.background,
          fontWeight: "bold",
     }
})
