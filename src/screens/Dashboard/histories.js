// IMPORTS
import Icons from "@react-native-vector-icons/feather";
import { Dimensions, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import colors from "../../colors/colors";
import { useEffect, useState } from "react";
import { get } from "../../services";
import Rupiah from "../../libs/formatRupiah";
import { Jakarta } from "../../libs/formatIndonesia";
import MyLoading from "../../components/myLoading";
import Buttons from "../../components/buttons";

const width = Dimensions.get("screen").width;

// MAIN COMPONENT
export default function Histories() {
     const [history, setHistory] = useState([]);
     const [refresh, setRefresh] = useState(false);
     const [detail, setDetail] = useState({});
     const [loading, setLoading] = useState(false);
     const [active, setActive] = useState("all");
     const [modal, setModal] = useState({ modal1: false });

     async function loadData() {
          try {
               setRefresh(true);
               let resHistory;
               if (active === 'topup') resHistory = await get("/history?limit=100&type=topup");
               else if (active === 'transfer') resHistory = await get("/history?limit=100&type=transfer");
               else resHistory = await get("/history?limit=100");
               setHistory(resHistory.data);
          } catch (err) {
               console.log(err);
          } finally {
               setRefresh(false);
          }
     }

     async function getHistory(data = "all", id = null) {
          try {
               setLoading(true);
               let res;
               if (data === "detail" && id) {
                    res = await get(`/history/${id}`);
                    console.log(res)
                    setDetail(res.data || {});
                    setModal(prev => ({ ...prev, modal1: true }));
                    return;
               } else if (data === "topup") {
                    res = await get("/history?limit=100&type=topup");
               } else if (data === "transfer") {
                    res = await get("/history?limit=100&type=transfer");
               } else {
                    res = await get("/history?limit=100");
               }
               setHistory(res.data);
          } catch (err) {
               console.log(err);
          } finally {
               setLoading(false);
          }
     }

     useEffect(() => {
          getHistory("all");
          setActive("all");
     }, []);

     return (
          <View style={{ flex: 1 }}>
               {/* BUTTON FILTER */}
               <View style={style.cta}>
                    {["all", "topup", "transfer"].map((type) => (
                         <Buttons
                              key={type}
                              onpress={() => {
                                   setActive(type);
                                   getHistory(type);
                              }}
                              styling={{
                                   elevation: 0,
                                   flex: 1,
                                   backgroundColor: active === type ? colors.primaryDark : colors.background
                              }}
                         >
                              <Text style={[
                                   style.amountHistory,
                                   {
                                        textAlign: 'center',
                                        color: active === type ? colors.background : colors.primary
                                   }
                              ]}>
                                   {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
                              </Text>
                         </Buttons>
                    ))}
               </View>

               {/* HEADER TEXT */}
               {history.length > 0 && (
                    <Text style={style.historyText}>
                         {active === 'all' && 'All Transaction History'}
                         {active === 'topup' && 'Top-up History'}
                         {active === 'transfer' && 'Transfer History'}
                    </Text>
               )}

               {/* LIST */}
               <FlatList
                    data={history}
                    refreshControl={
                         <RefreshControl refreshing={refresh} onRefresh={loadData} />
                    }
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={style.history}
                    ListEmptyComponent={
                         <Text style={{ textAlign: 'center', marginTop: 20 }}>No data available</Text>
                    }
                    renderItem={({ item }) => (
                         <Pressable
                              onPress={() => getHistory("detail", item._id)}
                              style={[style.placeItem, {
                                   borderBottomColor: item.flow === 'out' ? colors.error : colors.primary
                              }]}
                         >
                              <View>
                                   <Text style={[
                                        style.amountHistory,
                                        { color: item.flow === 'out' ? colors.error : colors.textSecondary }
                                   ]}>
                                        {item.flow === 'out'
                                             ? `-${Rupiah(item.amount)}`
                                             : Rupiah(item.amount)}
                                   </Text>
                                   <Text style={style.typeHistory}>
                                        {item.updatedAt ? Jakarta(item.updatedAt) : "-"}
                                   </Text>
                              </View>
                              <Icons
                                   name={item.flow === 'in' ? 'arrow-down-left' : 'arrow-up-right'}
                                   color={item.flow === 'out' ? colors.error : colors.primary}
                                   style={style.flowHistory}
                              />
                         </Pressable>
                    )}
               />

               {/* LOADING */}
               <MyLoading isVisible={loading} color={colors.primary} type={"Wave"} size={80} />

               {/* DETAIL MODAL */}
               <Modal animationType="fade" visible={modal.modal1} transparent statusBarTranslucent>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <View style={{
                              backgroundColor: colors.background,
                              position: 'absolute',
                              bottom: 0,
                              height: '50%',
                              padding: "8%",
                              paddingTop: '10%',
                              borderTopEndRadius: width / 12,
                              borderTopStartRadius: width / 12,
                              width: '100%'
                         }}>
                              <View style={style.data}>
                                   <Icons style={style.check} size={30} color={colors.background} name="info" />
                                   <Text style={[style.textDetail, { fontSize: 22, fontFamily: 'Poppins-Medium' }]}>
                                        {Rupiah(detail?.amount ?? 0)}
                                   </Text>
                                   <Text style={style.textDetail}>
                                        Date : {detail?.updatedAt ? new Date(detail.updatedAt).toDateString() : "-"}
                                   </Text>
                                   <Text style={style.textDetail}>Type : {detail?.type ?? "N/A"}</Text>
                                   <Text style={style.textDetail}>Description : {detail?.description ?? "N/A"}</Text>
                              </View>

                              <Buttons onpress={() => setModal(prev => ({ ...prev, modal1: false }))} styling={{
                                   position: 'absolute',
                                   bottom: "2%",
                                   backgroundColor: colors.error,
                                   alignSelf: 'center',
                                   elevation: 0,
                                   width: '80%',
                              }}>
                                   <Text style={{
                                        textAlign: 'center',
                                        fontFamily: "Poppins-Medium",
                                        fontSize: 16,
                                        color: colors.background,
                                   }}>Close</Text>
                              </Buttons>
                         </View>
                    </View>
               </Modal>
          </View>
     );
}

// STYLING
const style = StyleSheet.create({
     container: {
          flex: 1
     },
     history: {
          paddingHorizontal: '6%',
          gap: 10,
     },
     historyText: {
          color: colors.primary,
          marginVertical: "5%",
          marginHorizontal: "6%",
          fontFamily: "Poppins-Medium",
          fontSize: 23
     },
     placeItem: {
          backgroundColor: colors.background,
          padding: '3%',
          borderBottomWidth: 3,
          flexDirection: "row",
          justifyContent: 'space-between',
          borderRadius: width / 40,
          elevation: 1,
     },
     amountHistory: {
          color: colors.textSecondary,
          fontFamily: "Poppins-Medium",
          fontSize: 16
     },
     typeHistory: {
          color: colors.textDisabled,
          fontSize: 12,
     },
     flowHistory: {
          fontSize: 20,
          alignSelf: "center",
          padding: '1%',
     },
     cta: {
          justifyContent: "center",
          padding: "5%",
          borderBottomEndRadius: width / 15,
          borderBottomStartRadius: width / 15,
          backgroundColor: colors.primary,
          flexDirection: "row",
          alignItems: "center",
          elevation: 5,
     },
     data: {
          borderWidth: 1,
          marginTop: "10%",
          padding: '5%',
          gap: 5,
          borderColor: colors.border,
          borderRadius: width / 35,
     },
     textDetail: {
          fontFamily: "Poppins-Regular",
          textTransform: 'capitalize',
          color: colors.textSecondary
     },
     check: {
          backgroundColor: colors.primary,
          position: 'absolute',
          padding: '2%',
          borderRadius: width / 2,
          top: '-45%',
          elevation: 3,
          alignSelf: 'center',
     }
});
