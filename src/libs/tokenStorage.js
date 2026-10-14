import * as Keychain from "react-native-keychain";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_SERVICE = "com.capital.auth-token";

async function getToken() {
     const credentials = await Keychain.getGenericPassword({ service: TOKEN_SERVICE });
     if (credentials) return credentials.password;

     const legacyToken = await AsyncStorage.getItem("token");
     if (!legacyToken) return null;

     await Keychain.setGenericPassword("capital-api", legacyToken, { service: TOKEN_SERVICE });
     await AsyncStorage.removeItem("token");
     return legacyToken;
}

async function setToken(token) {
     if (!token) throw new Error("Cannot store an empty authentication token.");
     await Keychain.setGenericPassword("capital-api", token, { service: TOKEN_SERVICE });
     await AsyncStorage.removeItem("token");
}

async function clearToken() {
     await Keychain.resetGenericPassword({ service: TOKEN_SERVICE });
     await AsyncStorage.removeItem("token");
}

export { getToken, setToken, clearToken };
