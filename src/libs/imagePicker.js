// IMPORTS...
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

async function library() {
     const data = await launchImageLibrary({mediaType:'photo'});
     if (data.didCancel) return null;
     if (data.errorCode) {
          throw new Error(data.errorMessage || "Foto tidak dapat dibuka. Silakan coba lagi.");
     }
     if (!data.assets?.[0]) {
          throw new Error("Foto tidak dapat dipilih. Silakan coba lagi.");
     }
     return data.assets[0];
}

export {library}