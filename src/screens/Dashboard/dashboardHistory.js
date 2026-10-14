import { Dimensions, FlatList, Image, Modal, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import colors from "../../colors/colors";
import Inputs from "../../components/inputs";
import Icon from "@react-native-vector-icons/fontawesome6";
import Icon2 from "@react-native-vector-icons/feather";
import { del, get, put } from "../../services";
import { useEffect, useState } from "react";
import MyLoading from "../../components/myLoading";
import debounce from "lodash.debounce";
import Rupiah from "../../libs/formatRupiah";
import Buttons from "../../components/buttons";

const width = Dimensions.get("screen").width;

export default function DashboardHistory() {
     const [loading, setLoading] = useState(false);
     const [ID, setID] = useState("");
     const [modal, setModal] = useState(false);
     const [data, setData] = useState([]);
     const [photo, setPhoto] = useState({});
     const [refresh, setRefresh] = useState(false);
     const [searchText, setSearchText] = useState("");
     const [confirmModal, setConfirmModal] = useState(false);
     const [selectedItem, setSelectedItem] = useState(null);

     // Fungsi Umum Fetch Histories
     async function fetchHistories(params = {}) {
          try {
               setLoading(true);
               const query = new URLSearchParams({ limit: 1000, ...params }).toString();
               const response = await get(`/histories?${query}`);
               const photoData = {};

               await Promise.all(response.data.map(async (item) => {
                    const getPhoto = await get(`/receiver/photo?user_id=${item.user_id}`);
                    photoData[item.user_id] = getPhoto?.data?.url || "";
               }));

               setData(response.data);
               setPhoto(photoData);
          } catch (err) {
               console.log(err);
          } finally {
               setLoading(false);
          }
     }

     async function loadData() {
          try {
               setRefresh(true);
               await fetchHistories();
          } catch (err) {
               console.log(err);
          } finally {
               setRefresh(false);
          }
     }

     const handleDelete = async (historyID) => {
          try {
               await del(`/history/${historyID}`);
               fetchHistories();
          } catch (err) {
               console.log(err);
          } finally {
               setConfirmModal(false);
          }
     };

     const handleOpenView = (item) => {
          try {
               setLoading(true)
               setSelectedItem(item);
               setID(item._id);
               setTimeout(() => setModal(true), 0);
          } catch (err) {
               console.log(err);
          } finally {
               setLoading(false)
          }
     };

     // Pencarian realtime berdasarkan searchText
     useEffect(() => {
          const delayed = debounce(() => {
               const param = searchText.trim() !== "" ? { keyword: searchText } : {};
               fetchHistories(param);
          }, 500);
          delayed();
          return delayed.cancel;
     }, [searchText]);

     // Pertama kali render
     useEffect(() => {
          fetchHistories();
     }, []);

     return (
          <>
               <View style={style.header}></View>
               <View style={style.search}>
                    <Inputs value={searchText} onChangeText={text => setSearchText(text)} icon="search" placeholder="Search keyword..." />
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
                                        source={photo[item.user_id] ? { uri: photo[item.user_id] } : require("../../assets/images/avatar.jpg")}
                                   />
                                   <View>
                                        <Text style={{ color: colors.primary, fontFamily: "Poppins-Medium", textTransform: "capitalize", fontSize: 16 }}>{item.type}</Text>
                                        <Text style={{ color: colors.textSecondary, fontFamily: "Poppins-Regular", textTransform: "capitalize", fontSize: 13 }}>{Rupiah(item.amount)}</Text>
                                   </View>
                              </View>
                              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
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

               {/* MODAL DETAIL */}
               <Modal animationType="fade" visible={modal} onRequestClose={() => {
                    setModal(false)
               }} transparent={true} statusBarTranslucent={true}>
                    <Pressable onPress={() => {
                         setModal(false)
                    }} style={style.modal}>
                         <Pressable style={style.placeItem}>
                              <Icon color={colors.background} style={{ alignSelf: "center", backgroundColor: colors.primary, padding: "2%", borderRadius: width / 2 }} size={25} name="check" iconStyle="solid" />
                              <Text style={{ color: colors.primaryDark, textAlign: "center", fontSize: 20, fontFamily: "poppins-Medium" }}>{Rupiah(selectedItem?.amount ?? "0")}</Text>
                              <View style={{ borderWidth: 2, borderColor: colors.border, borderRadius: width / 50, padding: "2%" }}>
                                   <Text style={{ color: colors.placeholder, textAlign: "center", textTransform: "capitalize" }}>{selectedItem?.type}</Text>
                                   <Text style={{ color: colors.placeholder, textAlign: "center" }}>{new Date(selectedItem?.updatedAt).toDateString()}</Text>
                              </View>
                         </Pressable>
                    </Pressable>
               </Modal>

               {/* MODAL KONFIRMASI DELETE */}
               <Modal statusBarTranslucent={true} animationType="fade" visible={confirmModal} onRequestClose={() => setConfirmModal(false)} transparent={true}>
                    <Pressable onPress={() => setConfirmModal(false)} style={style.modal}>
                         <View style={style.confirmationModal}>
                              <Icon color={colors.primary} style={{ marginVertical: "2%" }} size={30} name="circle-info" iconStyle="solid" />
                              <Text style={style.confirmationText}>Are you sure ?</Text>
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
          height: "30%",
          gap: 10,
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
