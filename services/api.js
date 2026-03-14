// changes
// url => {{url}} = http://localhost:8012/php
// auth :
// fetch all users => get => {{url}}/factoryhub/auth/login.php
// create accrount => post => {{url}}/factoryhub/auth/create.php
// update user => post => {{url}}/factoryhub/auth/update.php

// clients :
// all client => post => {{url}}/factoryhub/clients/addClient.php
// get clients => get => {{url}}/factoryhub/clients/getClients.php
// get one client => get => {{url}}/factoryhub/clients/getOneClient.php?id=1
// delete client => del => {{url}}/factoryhub/clients/deleteClient.php?id=3
// update client info => post => {{url}}/factoryhub/clients/updateClient.php

// services/api.js
import axios from "axios";

export const BASE_URL = `http://192.168.1.7:8012/php`;

// export const BASE_URL = `http://${YOUR_PC_IP}:1337`;
// export const BASE_URL = `https://reliable-animal-2d80273808.strapiapp.com`;

export const getAuths = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/factoryhub/auth/login.php`);
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.error("خطأ: الاتصال خد وقت طويل جداً (Timeout).");
      // بنرمي إيرور بنفس الاسم عشان الكود اللي في AuthScreen يفضل شغال ويفهم إنه تايم أوت
      const timeoutError = new Error("الاتصال خد وقت طويل جداً (Timeout)");
      timeoutError.name = "AbortError";
      throw timeoutError;
    }

    console.error("خطأ في الاتصال بالباك إند:", error.message);
    throw error;
  }
};

// ✅ جلب كل العملاء
export const getClients = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/factoryhub/clients/getClients.php`
    );
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.error("خطأ: الاتصال خد وقت طويل جداً (Timeout).");
      const timeoutError = new Error("الاتصال خد وقت طويل جداً (Timeout)");
      timeoutError.name = "AbortError";
      throw timeoutError;
    }

    console.error("خطأ في جلب العملاء:", error.message);
    throw error;
  }
};

export const createAuth = async (userData) => {
  try {
    const formData = new FormData();

    formData.append("f_name", userData.f_name);
    formData.append("e_mail", userData.e_mail);
    formData.append("u_phone", userData.u_phone);
    formData.append("u_pass", userData.u_pass);

    const response = await axios.post(
      `${BASE_URL}/factoryhub/auth/create.php`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 5000,
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطأ في إنشاء الحساب:", error.message);
    throw error;
  }
};

export const updateUserStatus = async (documentId, status) => {
  try {
    const formData = new FormData();

    formData.append("u_status", status);
    formData.append("id", documentId);

    const { data } = await axios.post(
      `${BASE_URL}/factoryhub/auth/update.php`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log(`✅ تم تحديث الحالة إلى: ${status}`);
    return data;
  } catch (error) {
    console.error(
      "❌ Error updating status:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateClient = async (clientId, clientData) => {
  try {
    const formData = new FormData();

    formData.append("id", clientId);
    formData.append("c_name", clientData.c_name);
    formData.append("c_phone", clientData.c_phone);
    formData.append("c_size", clientData.c_size);
    formData.append("c_year", clientData.c_year);
    formData.append("c_additional_options", clientData.c_additional_options);

    if (clientData.c_img) {
      formData.append("c_img", clientData.c_img);
    }

    const { data } = await axios.post(
      `${BASE_URL}/factoryhub/clients/updateClient.php`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("✅ تم تحديث بيانات العميل:", data);
    return data;
  } catch (error) {
    console.error(
      "❌ Error updating client:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ حذف العميل
export const deleteClient = async (clientId) => {
  try {
    const { data } = await axios.delete(
      `${BASE_URL}/factoryhub/clients/deleteClient.php?id=${clientId}`
    );

    console.log("🗑️ تم حذف العميل:", clientId);
    return data;
  } catch (error) {
    console.error(
      "❌ Error deleting client:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ إنشاء عميل جديد
export const createClient = async (clientData) => {
  try {
    const formData = new FormData();

    formData.append("c_name", clientData.c_name);
    formData.append("c_phone", clientData.c_phone || "");
    formData.append("c_size", clientData.c_size || "");
    formData.append("c_year", clientData.c_year || "");
    formData.append(
      "c_additional_options",
      clientData.c_additional_options || ""
    );

    // لو فيه صورة
    if (clientData.c_img) {
      formData.append("c_img", clientData.c_img);
    }

    const { data } = await axios.post(
      `${BASE_URL}/factoryhub/clients/addClient.php`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("✅ تم إنشاء العميل:", data);
    return data;
  } catch (error) {
    console.error(
      "❌ Error creating client:",
      error.response?.data || error.message
    );
    throw error;
  }
};
