// IMPORTS...
import { Dimensions, FlatList, Image, Pressable, RefreshControl, StatusBar, StyleSheet, Text, ToastAndroid, View } from "react-native";
import colors from "../../colors/colors";
import Buttons from "../../components/buttons";
import { useCallback, useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import Icon from "@react-native-vector-icons/fontawesome6";
import Icons from "@react-native-vector-icons/feather";
import { get } from "../../services";
import MyLoading from "../../components/myLoading";
import Rupiah from "../../libs/formatRupiah";
import { Jakarta } from "../../libs/formatIndonesia";
import AsyncStorage from "@react-native-async-storage/async-storage";
const width = Dimensions.get("screen").width;

// BUILD-IN-FUNCTIONS...
export default function Home({ navigation }) {
     const [refresh, setRefresh] = useState(false);
     const [loading, setLoading] = useState(false);
     const [data, setData] = useState({});
     const [profileLoaded, setProfileLoaded] = useState(false);
     const [history, setHistory] = useState([]);
     const isFocused = useIsFocused();

     const loadData = useCallback(async () => {
          try {
               if (!profileLoaded) setLoading(true);
               setRefresh(true);
               const resProfile = await get("/profile");
               if (resProfile?.code !== "200" || !resProfile.data) {
                    throw new Error(resProfile?.message || "Could not load your profile.");
               }
               setData(resProfile.data);
               setProfileLoaded(true);

               const resHistory = await get("/history");
               setHistory(resHistory.data);
          } catch (err) {
               console.error("Failed to refresh dashboard data:", err);
               ToastAndroid.showWithGravity(
                    err?.message || "Could not load your account. Pull down to retry.",
                    ToastAndroid.CENTER,
                    ToastAndroid.LONG
               );
          } finally {
               setRefresh(false);
               setLoading(false);
          }
     }, [profileLoaded]);

     useEffect(() => {
          if (isFocused) loadData();
     }, [isFocused, loadData])
     return (
          <View style={style.container}>
               <StatusBar backgroundColor={colors.primary} />

               {/* profile */}
               <View style={style.profile}>
                    <Pressable>
                         <Image style={style.img} source={require("../../assets/images/logo2.png")} />
                    </Pressable>
                    <Pressable onPress={() => navigation.navigate("Profile")}>
                         <Icon name="user" style={{ marginHorizontal: "2%" }} iconStyle="solid" size={22} color={colors.background} />
                    </Pressable>
               </View>

               {/* header */}
               <View style={style.header}></View>

               {/* card */}
               <View style={style.card}>
                    <View>
                         <Text style={{ color: colors.textSecondary, fontFamily: "Poppins-Regular" }}>Your balance</Text>
                         <Text style={{ color: colors.textSecondary, fontSize: 20, fontFamily: "Poppins-Medium" }}>{Rupiah(data.balance)}</Text>
                    </View>
               </View>

               <View style={style.cta}>
                    <Buttons onpress={() => {
                         if (!profileLoaded) {
                              ToastAndroid.showWithGravity("Account details are still loading. Please try again.", ToastAndroid.CENTER, ToastAndroid.SHORT);
                         } else if(!data.has_pin) {
                              navigation.navigate("Profile" , {message:"please create a pin first"});
                         }else {
                                navigation.navigate("Transfer")}
                         }} styling={style.ctab}>
                         <Icon color={colors.background} size={20} name="money-bill-transfer" iconStyle="solid" />
                         <Text style={style.ctabt}>Transaction</Text>
                    </Buttons>
                    <Buttons onpress={async () => {
                         if (!profileLoaded) {
                              ToastAndroid.showWithGravity("Account details are still loading. Please try again.", ToastAndroid.CENTER, ToastAndroid.SHORT);
                         } else if(!data.has_pin) {
                              navigation.navigate("Profile" , {message:"please create a pin first"});
                         }else {
                              if (await AsyncStorage.getItem("payment") == 'true') {
                              navigation.navigate("Midtrans", { snapURL: await AsyncStorage.getItem("url") });
                         } else {
                              navigation.navigate("Nominal");
                         }
                         }}} styling={style.ctab}>
                         <Icon color={colors.background} size={20} name="money-bill" iconStyle="solid" />
                         <Text style={style.ctabt}>Top up</Text>
                    </Buttons>
               </View>

               <Text style={style.historyText}>Transaction History</Text>
               <View style={{ flex: 1 }}>
                    <FlatList refreshControl={
                         <RefreshControl refreshing={refresh} onRefresh={loadData} />
                    } contentContainerStyle={style.history} data={history} renderItem={({ item }) => {
                         return (
                              <Pressable onPress={() => navigation.navigate("Histories")} style={[style.placeItem, { borderBottomColor: item.flow == 'out' ? colors.error : colors.primary }]}>
                                   <View>
                                        <Text style={[style.amountHistory, { color: item.flow == 'out' ? colors.error : colors.textSecondary }]}>{item.flow == 'out' ? `-${Rupiah(item.amount)}` : Rupiah(item.amount)}</Text>
                                        <Text style={style.typeHistory}>{Jakarta(item.updatedAt)}</Text>
                                   </View>
                                   <Icons color={item.flow == 'out' ? colors.error : colors.primary} style={style.flowHistory} name={item.flow == 'in' ? 'arrow-down-left' : 'arrow-up-right'} />
                              </Pressable>
                         )
                    }} />
               </View>

               <MyLoading isVisible={loading} color={colors.primary} type={"Wave"} size={80} />
          </View>
     )
}

// STYLING...
const style = StyleSheet.create({
     container: {
          flex: 1,
          backgroundColor: colors.primaryLight
     },
     header: {
          backgroundColor: colors.primary,
          height: "25%",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          borderBottomEndRadius: width / 12,
          borderBottomStartRadius: width / 12,
     },
     card: {
          backgroundColor: colors.background,
          borderRadius: width / 20,
          width: "85%",
          position: "absolute",
          padding: "5%",
          alignSelf: "center",
          top: "15%",
          elevation: 5,
          borderBottomColor: colors.primary,
          borderBottomWidth: 4,
     },
     img: {
          width: 150,
          height: 50,
     },
     profile: {
          position: "absolute",
          top: "2%",
          zIndex: 999,
          width: "100%",
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          overflow: "hidden",
     },
     imgp: {
          marginHorizontal: "4%",
          borderWidth: 2,
          borderColor: colors.background,
          borderRadius: width / 2,
          width: 40,
          height: 40,
     },
     cta: {
          position: "absolute",
          top: "31%",
          flexDirection: "row",
          alignSelf: "center",
     },
     ctab: {
          backgroundColor: colors.primary,
          padding: "3%",
          flexDirection: "row",
          gap: 10,
          paddingHorizontal: "6%",
          justifyContent: "space-between",
          alignItems: "center",
          elevation: 2,
     },
     ctabt: {
          color: colors.background,
          fontFamily: "Poppins-Medium",
          fontSize: 17
     },
     history: {
          padding: '2%',
          paddingHorizontal: '6%',
          gap: 10,
     },
     historyText: {
          color: colors.primary,
          marginTop: "75%",
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

     }
})