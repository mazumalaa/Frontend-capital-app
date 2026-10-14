// IMPORTS...
import { Dimensions, FlatList, Image, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, ToastAndroid, View } from "react-native";
import colors from "../../colors/colors";
import Inputs from "../../components/inputs";
import Buttons from "../../components/buttons";
import { useCallback, useEffect, useState } from "react";
import { del, get, post, put } from "../../services";
import Icon from "@react-native-vector-icons/feather";
import MyLoading from "../../components/myLoading";
import Rupiah from "../../libs/formatRupiah";
import PinModal from "../../components/pin";
const width = Dimensions.get("screen").width;

// BUILD-IN-FUNCTIONS...
export default function Transfers({ navigation }) {
  const [active, setActive] = useState("transfer");
  const [showPin, setShowPin] = useState(false);  const [edit, setEdit] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [receiver, setReceiver] = useState({});
  const [form, setForm] = useState({});
  const [back, setBack] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ modal1: false, modal2: false, modal3: false });
  const [contact, setContact] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ visible: false, id: null });

  function activeButton(data) {
    setActive(data);
  }

  function InputData(field, data) {
    setForm((prev) => ({ ...prev, [field]: data }));
  }

  const getContacts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await get("/contact");
      setContact(response.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false)
    }
  }, []);

  async function getReceiver() {
    try {
      setLoading(true);
      if (!form.phone) {
        ToastAndroid.showWithGravity('Phone is required', ToastAndroid.CENTER, ToastAndroid.LONG);
        return;
      }
      const response = await get(`/receiver?phone=${form.phone}`);
      if (response && response.code === '200') {
        const photo = await get(`/receiver/photo?user_id=${response.data._id}`);
        setReceiver({ ...response.data, url: photo?.data?.url || "" });
        setForm(prev => ({ ...prev, alias: "" }));
        setModal((prev) => ({ ...prev, modal2: true }));
        setModal((prev) => ({ ...prev, modal3: false }));
      } else {
        ToastAndroid.showWithGravity(response.message || 'Receiver not found', ToastAndroid.CENTER, ToastAndroid.LONG);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTransfer(pin) {
  try {
    setLoading(true);
    const response = await post("/transfer", {
      phone: form.phone,
      amount: Number(form.amount),
      pin,
    });

    if (!response || response.code !== "200") {
      ToastAndroid.showWithGravity(response?.message || "Transfer gagal", ToastAndroid.LONG, ToastAndroid.CENTER);
      return;
    }

    setModal((prev) => ({ ...prev, modal1: true }));
  } catch (err) {
    console.log(err);
    ToastAndroid.showWithGravity("Terjadi kesalahan saat transfer", ToastAndroid.LONG, ToastAndroid.CENTER);
  } finally {
    setLoading(false);
    setReceiver({});
    setShowPin(false); // Tutup modal PIN setelah proses transfer
  }
}


  async function updateContact() {
    try {
      setLoading(true);
      const response = await put(`/contact/update/${selectedContactId}`, {
        alias: form.alias,
      });

      if (response && response.code === '200') {
        ToastAndroid.showWithGravity('Kontak berhasil ditambahkan', ToastAndroid.CENTER, ToastAndroid.LONG);

        // Tutup modal, kosongkan form, dan refresh list kontak
        setModal((prev) => ({ ...prev, modal2: false }));
        setForm({});
        await getContacts(); // <--- FIX: load ulang kontak
      } else {
        ToastAndroid.showWithGravity(response?.message || 'Gagal menambahkan kontak', ToastAndroid.CENTER, ToastAndroid.LONG);
      }
    } catch (err) {
      console.log(err);
      ToastAndroid.showWithGravity('Terjadi kesalahan server', ToastAndroid.CENTER, ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  }

  async function addContact() {
    try {
      setLoading(true);
      const response = await post("/contact", {
        alias: form.alias,
        phone: form.phone,
      });

      if (response && response.code === '200') {
        ToastAndroid.showWithGravity('Kontak berhasil ditambahkan', ToastAndroid.CENTER, ToastAndroid.LONG);

        // Tutup modal, kosongkan form, dan refresh list kontak
        setModal((prev) => ({ ...prev, modal2: false }));
        setForm({});
        await getContacts(); // <--- FIX: load ulang kontak
      } else {
        ToastAndroid.showWithGravity(response?.message || 'Gagal menambahkan kontak', ToastAndroid.CENTER, ToastAndroid.LONG);
      }
    } catch (err) {
      console.log(err);
      ToastAndroid.showWithGravity('Terjadi kesalahan server', ToastAndroid.CENTER, ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  }

  async function deleteContact(id) {
    try {
      setLoading(true);
      const response = await del(`/contact/${id}`); // pastikan endpoint dan key-nya sesuai backend-mu
      console.log(id)
      if (response && response.code === "200") {
        ToastAndroid.showWithGravity("Kontak berhasil dihapus", ToastAndroid.CENTER, ToastAndroid.LONG);
        await getContacts(); // refresh list
      } else {
        ToastAndroid.showWithGravity(response?.message || "Gagal menghapus kontak", ToastAndroid.CENTER, ToastAndroid.LONG);
      }
    } catch (err) {
      console.log(err);
      ToastAndroid.showWithGravity("Terjadi kesalahan server", ToastAndroid.CENTER, ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  }

  const loadData = useCallback(async () => {
    try {
      setRefresh(true);
      await getContacts();
    } catch (err) {
      console.log(err);
    } finally {
      setRefresh(false);
    }
  }, [getContacts]);

  useEffect(() => {
    if (back) {
      navigation.goBack();
      setBack(false);
    }
  }, [back, navigation])

  useEffect(() => {
    loadData();
  }, [loadData]);
  return (
    <>
      <PinModal
        visible={showPin}
        onClose={() => setShowPin(false)}
        onSuccess={(pin) => handleTransfer(pin)}
      />

      <ScrollView refreshControl={
        <RefreshControl refreshing={refresh} onRefresh={loadData} />
      }>
        <View style={style.container}>
          <View style={style.header}>
            <Buttons onpress={() => activeButton("transfer")} styling={[style.btn, { backgroundColor: active === 'transfer' ? colors.primaryDark : colors.background }]}>
              <Text style={[style.btnText, { color: active === 'transfer' ? colors.background : colors.primary }]}>Transfer</Text>
            </Buttons>
            <Buttons onpress={() => activeButton("contact")} styling={[style.btn, { backgroundColor: active === 'contact' ? colors.primaryDark : colors.background }]}>
              <Text style={[style.btnText, { color: active === 'contact' ? colors.background : colors.primary }]}>Contact</Text>
            </Buttons>
          </View>

          {/* transfer data */}
          {active === 'transfer' && (
            <View style={style.form}>
              <Inputs value={form.phone} onChangeText={e => InputData("phone", e)} type={'numeric'} icon={'phone'} placeholder={"Enter number phone..."} />
              <Buttons onpress={getReceiver} styling={[style.btn, { backgroundColor: colors.primary }]}>
                <Text style={[style.btnText, { fontSize: 15, color: colors.background }]}>Search</Text>
              </Buttons>
            </View>
          )}

          {/* modal data receiver */}
          {modal.modal2 && (
            <Modal animationType="fade" visible={modal.modal2} onRequestClose={() => {
              setEdit(false);
              setForm({});
              setReceiver({});
              setModal((prev) => ({ ...prev, modal2: false }))
            }}
              transparent={true}
              statusBarTranslucent={true}>
              <Pressable onPress={() => {
                setModal((prev) => ({ ...prev, modal2: false }));
                setReceiver({});
              }} style={style.modalView}>
                <Pressable onPress={() => {
                  setModal(prev => ({ ...prev, modal2: true }))
                }} style={[style.modalPlace, { height: "70%" }]}>
                  {receiver.url ? (
                    <Image style={style.image} source={{ uri: receiver.url }} />
                  ) : (
                    <Image style={style.image} source={require("../../assets/images/avatar.jpg")} />
                  )}
                  {active === 'transfer' ? <Inputs value={form.amount} onChangeText={e => InputData("amount", e)} type={'numeric'} icon={'dollar-sign'} placeholder={"Enter amount..."} /> : null}
                  <Inputs value={active === "transfer" ? receiver.username : form.alias} placeholder={"Enter alias..."} icon={"user"} editable={active === 'transfer' ? false : true} onChangeText={(e) => InputData("alias", e)} />
                  <Inputs value={receiver.phone || 'Not found'} icon={"phone"} editable={false} />
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Buttons onpress={() => {
                      setModal((prev) => ({ ...prev, modal2: false }))
                      setForm({});
                      setReceiver({});
                    }} styling={{ backgroundColor: colors.error, elevation: 0, flex: 1 }}>
                      <Text style={[style.btnText, { fontSize: 15, color: colors.background }]}>Close</Text>
                    </Buttons>
                    {active === "transfer" ? <Buttons onpress={() => { 
                      setShowPin(true);
                      setModal((prev) => ({ ...prev, modal2: false })); setReceiver({}) }} styling={{ backgroundColor: colors.primary, elevation: 0, flex: 1 }}>
                      <Text style={[style.btnText, { fontSize: 15, color: colors.background }]}>Transfer</Text>
                    </Buttons> : <Buttons onpress={() => { edit ? updateContact() : addContact(); setModal((prev) => ({ ...prev, modal2: false })); }} styling={{ backgroundColor: colors.primary, elevation: 0, flex: 1 }}>
                      <Text style={[style.btnText, { fontSize: 15, color: colors.background }]}>{edit ? 'Edit' : 'Add'}</Text>
                    </Buttons>}
                  </View>
                </Pressable>
              </Pressable>
            </Modal>
          )}


          {/* success modal */}
          <Modal animationType="fade" visible={modal.modal1} onRequestClose={() => { setModal(prev => ({ ...prev, modal1: false })); setForm({}); setReceiver({}); }} transparent={true} statusBarTranslucent={true}>
            <Pressable onPress={() => { setModal(prev => ({ ...prev, modal1: false })); setForm({}); setReceiver({}); }} style={style.modalView}>
              <View style={style.modalPlace}>
                <Icon style={style.success} name="check" />
                <Text style={[style.textSuccess, { fontSize: 25, color: colors.primaryDark }]}>{Rupiah(form.amount)}</Text>
                <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: width / 30, padding: '5%' }}>
                  <Text style={style.textSuccess}>Transfer success</Text>
                  <Text style={[style.textSuccess, { color: colors.placeholder, fontSize: 15 }]}>{new Date(Date.now()).toLocaleDateString()}</Text>
                </View>
                <Buttons onpress={() => {
                  setModal(prev => ({ ...prev, modal1: false }))
                  setForm({});
                }} styling={{ backgroundColor: colors.error, elevation: 0, position: 'absolute', bottom: '2%', alignSelf: 'center', width: "70%" }}>
                  <Text style={[style.btnText, { fontSize: 15, color: colors.background }]}>Close</Text>
                </Buttons>
              </View>
            </Pressable>
          </Modal>

          {confirmDelete.visible && (
            <Modal transparent statusBarTranslucent animationType="fade" visible={confirmDelete.visible}>
              <Pressable onPress={() => setConfirmDelete({ visible: false, id: null })} style={style.modalView}>
                <View style={[style.modalPlace, { height: "30%" }]}>
                  <Icon size={40} name="info" style={{ color: colors.primary, alignSelf: 'center' }} />
                  <Text style={[style.textSuccess, { fontSize: 18 }]}>Are you sure you want to delete this contact?</Text>
                  <View style={{ flexDirection: 'row', marginTop: 20 }}>
                    <Buttons
                      onpress={() => setConfirmDelete({ visible: false, id: null })}
                      styling={{ backgroundColor: colors.placeholder, flex: 1, elevation: 0 }}
                    >
                      <Text style={[style.btnText, { color: colors.background }]}>Batal</Text>
                    </Buttons>
                    <Buttons
                      onpress={() => {
                        deleteContact(confirmDelete.id);
                        setConfirmDelete({ visible: false, id: null });
                      }}
                      styling={{ backgroundColor: colors.error, flex: 1, elevation: 0 }}
                    >
                      <Text style={[style.btnText, { color: colors.background }]}>Hapus</Text>
                    </Buttons>
                  </View>
                </View>
              </Pressable>
            </Modal>
          )}

          {/* add-contact-modal */}
          {modal.modal3 && (
            <Modal visible={modal.modal3} transparent={true} statusBarTranslucent={true}>
              <Pressable onPress={() => setModal(prev => ({ ...prev, modal3: false }))} style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                alignItems: 'center',
                flex: 1,
              }}>
                <Pressable onPress={() => setModal(prev => ({ ...prev, modal3: true }))} style={{
                  backgroundColor: colors.background,
                  width: '80%',
                  marginTop: "50%",
                  borderRadius: width / 30,
                  elevation: 5,
                  padding: '3%',
                  paddingVertical: "5%",
                }}>
                  <Inputs onChangeText={(e) => InputData("phone", e)} type={'numeric'} icon={'phone'} placeholder={"Enter number phone..."} />
                  <Buttons onpress={() => getReceiver()} styling={{
                    backgroundColor: colors.primary,
                    elevation: 0,
                  }}>
                    <Text style={{
                      color: colors.background,
                      textAlign: 'center',
                      fontFamily: 'Poppins-Medium',
                    }}>Search</Text>
                  </Buttons>
                </Pressable>
              </Pressable>
            </Modal>
          )}
        </View>

        {/* contact-list */}
        <ScrollView style={{ padding: '5%' }}>
          {contact.length > 0 ? <Text style={{ fontSize: 20, fontFamily: 'Poppins-Medium', color: colors.primary, margin: '3%' }}>{active === 'contact' ? 'Management contact' : 'Your contacts'}</Text> : null}
          {(contact.length > 0 ? (
            contact.map((item, index) => (
              <View key={item._id || index} style={{
                backgroundColor: colors.background,
                borderRadius: width / 40,
                elevation: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottomWidth: 4,
                borderColor: colors.primary,
                margin: '2%',
                padding: '5%',
              }}>
                <View>
                  <Text style={{ color: colors.primary, fontFamily: 'Poppins-Medium' }}>{item.alias}</Text>
                  <Text style={{ color: colors.placeholder, fontFamily: 'Poppins-Regular' }}>{item.contact_user_id?.phone}</Text>
                </View>
                {active === 'contact' ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Icon onPress={async () => {
                    setEdit(true);
                    setSelectedContactId(item._id);
                    const photo = await get(`/receiver/photo?user_id=${item.contact_user_id?._id}`);
                    setForm({
                      alias: item.alias,
                      phone: item.phone,
                    });
                    setReceiver({
                      username: item.contact_user_id?.username || 'Not found',
                      phone: item.contact_user_id?.phone || 'Not found',
                      url: photo?.data?.url || "",
                    })
                    setModal(prev => ({ ...prev, modal2: true }));
                  }}
                    style={style.btnContact} name="edit-2" />
                  <Icon onPress={() => setConfirmDelete({ visible: true, id: item._id })}
                    style={[style.btnContact, { backgroundColor: colors.error }]} name="trash" />
                </View>
                  :
                  <View>
                    <Icon onPress={async () => {
                      const photo = await get(`/receiver/photo?user_id=${item.contact_user_id?._id}`);
                      setReceiver({
                        username: item.contact_user_id?.username || 'Not found',
                        phone: item.contact_user_id?.phone || 'Not found',
                        url: photo?.data?.url || "",
                      })
                      setForm({
                        username: item.contact_user_id?.username || 'Not found',
                        phone: item.contact_user_id?.phone || 'Not found',
                      })
                      setModal(prev => ({ ...prev, modal2: true }));
                    }} style={style.btnContact} name="plus" />
                  </View>}
              </View>
            ))
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textSecondary, fontFamily: 'Poppins-Medium' }}>No contacts found</Text>
          )
          )}
        </ScrollView>
        <MyLoading isVisible={loading} color={colors.primary} type={"Wave"} size={80} />
      </ScrollView>
      {active === 'contact' ? <Icon onPress={() => {
        setEdit(false);
        setForm({})
        setReceiver({});
        setModal(prev => ({ ...prev, modal3: true }))
      }} style={style.icons} name="plus" /> : null}
    </>
  );
}

// STYLING...
const style = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: '5%',
    borderBottomEndRadius: width / 10,
    borderBottomStartRadius: width / 10,
    elevation: 5,
  },
  btn: {
    flex: 1,
    height: width / 9,
    padding: "3%",
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0,
  },
  btnText: {
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
  },
  form: {
    backgroundColor: colors.background,
    padding: '5%',
    borderRadius: width / 20,
    margin: "5%",
    elevation: 3,
  },
  modalView: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
  },
  modalPlace: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: colors.background,
    padding: "5%",
    width: '100%',
    height: '40%',
    borderTopEndRadius: width / 10,
    borderTopStartRadius: width / 10,
    gap: 10,
    elevation: 5,
  },
  success: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    fontSize: 30,
    padding: '3%',
    borderRadius: width / 2,
    color: colors.background,
  },
  textSuccess: {
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
    color: colors.primary
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: width / 2,
    alignSelf: 'center',
  },
  icons: {
    backgroundColor: colors.primary,
    color: colors.background,
    position: 'absolute',
    right: '4%',
    fontSize: 30,
    bottom: '1%',
    padding: '3%',
    elevation: 1,
    borderRadius: width / 2,
  },
  contact: {
    padding: '3%',
  },
  btnContact: {
    backgroundColor: colors.primary,
    color: colors.background,
    fontSize: 20,
    borderRadius: width / 100,
    elevation: 1,
    padding: '2%',
  }
});