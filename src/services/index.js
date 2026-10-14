import { getToken } from "../libs/tokenStorage";

const isDevelopment = typeof __DEV__ !== "undefined" && __DEV__;
const DEFAULT_API_BASE_URL = isDevelopment ? "http://192.168.1.2:3000/api/v1" : "";

async function request(path, { method = "GET", body, multipart = false } = {}) {
     const configuredBaseUrl = global.CAPITAL_API_BASE_URL || DEFAULT_API_BASE_URL;
     if (!configuredBaseUrl) {
          throw new Error("Configure the HTTPS API URL before creating a production build.");
     }
     if (!isDevelopment && !/^https:\/\//i.test(configuredBaseUrl)) {
          throw new Error("Production API connections must use HTTPS.");
     }
     const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, "");
     const token = await getToken();
     const headers = {};

     if (token) headers.authorization = `Bearer ${token}`;
     if (!multipart && body !== undefined) headers["Content-Type"] = "application/json";

     let response;
     try {
          response = await fetch(`${API_BASE_URL}/${path.replace(/^\/+/, "")}`, {
               method,
               headers,
               body: body === undefined
                    ? undefined
                    : multipart
                         ? body
                         : JSON.stringify(body),
          });
     } catch {
          throw new Error("Tidak dapat terhubung ke server. Periksa koneksi dan alamat API.");
     }

     let result;
     try {
          result = await response.json();
     } catch {
          throw new Error("Server mengirim respons yang tidak valid.");
     }

     if (!response.ok) {
          const error = new Error(result?.message || `Permintaan gagal (${response.status}).`);
          error.status = response.status;
          throw error;
     }

     return result;
}

function multipartBody(form) {
     if (!form?.uri || !form?.type) {
          throw new Error("Foto yang dipilih tidak valid.");
     }
     const data = new FormData();
     data.append("photo", {
          uri: form.uri,
          name: form.fileName || "profile-image",
          type: form.type,
     });
     return data;
}

const get = path => request(path);
const post = (path, form) => request(path, { method: "POST", body: form });
const del = path => request(path, { method: "DELETE" });
const put = (path, form) => request(path, { method: "PUT", body: form });
const upload = (path, form) => request(path, {
     method: "POST",
     body: multipartBody(form),
     multipart: true,
});
const update = (path, form) => request(path, {
     method: "PUT",
     body: multipartBody(form),
     multipart: true,
});

export { get, post, put, upload, update, del };
