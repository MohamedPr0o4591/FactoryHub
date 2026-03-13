// services/api.js
import axios from "axios";

const YOUR_PC_IP = "192.168.1.7";

// export const BASE_URL = `http://${YOUR_PC_IP}:1337`;
export const BASE_URL = `https://reliable-animal-2d80273808.strapiapp.com`;

export const getAuths = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/auths`, {
      params: { populate: "*" },
      timeout: 5000,
    });

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
    const response = await axios.get(`${BASE_URL}/api/clirents`, {
      params: { populate: "*" },
      timeout: 5000,
    });

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

    formData.append("data[f_name]", userData.f_name);
    formData.append("data[e_mail]", userData.e_mail);
    formData.append("data[u_phone]", userData.u_phone);
    formData.append("data[u_pass]", userData.u_pass);

    const response = await axios.post(`${BASE_URL}/api/auths`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 5000,
    });

    return response.data;
  } catch (error) {
    console.error("خطأ في إنشاء الحساب:", error.message);
    throw error;
  }
};

export const deleteImageFromStrapi = async (imageId) => {
  try {
    const { data } = await axios.delete(
      `${BASE_URL}/api/upload/files/${imageId}`
    );

    console.log("🗑️ تم حذف الصورة القديمة:", imageId);
    return data;
  } catch (error) {
    console.log(
      "❌ Error deleting image:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const uploadImageToStrapi = async (imageUri) => {
  try {
    const formData = new FormData();

    const fileName = imageUri.split("/").pop();
    const fileExtension = fileName.split(".").pop().toLowerCase();

    const mimeTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    };

    const mimeType = mimeTypes[fileExtension] || "image/jpeg";

    formData.append("files", {
      uri: imageUri,
      name: fileName,
      type: mimeType,
    });

    const { data } = await axios.post(`${BASE_URL}/api/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ تم رفع الصورة:", data[0]);
    return data[0];
  } catch (error) {
    console.log(
      "❌ Error uploading image:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ تحديث صورة المستخدم باستخدام FormData
export const updateUserImage = async (userId, imageId) => {
  try {
    const formData = new FormData();

    // المفتاح والقيمة زي ما طلبت
    formData.append("data[u_img]", imageId);

    const { data } = await axios.put(
      `${BASE_URL}/api/auths/${userId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("✅ تم تحديث بيانات المستخدم:", data);
    return data;
  } catch (error) {
    console.error(
      "❌ Error updating user image:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateUserStatus = async (documentId, status) => {
  try {
    const formData = new FormData();

    // Format: data["u_status"]
    formData.append("data[u_status]", status);

    const { data } = await axios.put(
      `${BASE_URL}/api/auths/${documentId}`,
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

    formData.append("data[c_name]", clientData.c_name);
    formData.append("data[c_phone]", clientData.c_phone);
    formData.append("data[c_size]", clientData.c_size);
    formData.append("data[c_year]", clientData.c_year);
    formData.append(
      "data[c_additional_options]",
      clientData.c_additional_options
    );

    const { data } = await axios.put(
      `${BASE_URL}/api/clirents/${clientId}`,
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

// ✅ تحديث صورة العميل (منفصلة)
export const updateClientImage = async (clientId, imageId) => {
  try {
    const formData = new FormData();

    // لو imageId = null يعني نحذف الصورة
    formData.append("data[c_img]", imageId);

    const { data } = await axios.put(
      `${BASE_URL}/api/clirents/${clientId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("✅ تم تحديث صورة العميل:", data);
    return data;
  } catch (error) {
    console.error(
      "❌ Error updating client image:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ حذف العميل
export const deleteClient = async (clientId) => {
  try {
    const { data } = await axios.delete(`${BASE_URL}/api/clirents/${clientId}`);

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

    formData.append("data[c_name]", clientData.c_name);
    formData.append("data[c_phone]", clientData.c_phone || "");
    formData.append("data[c_size]", clientData.c_size || "");
    formData.append("data[c_year]", clientData.c_year || "");
    formData.append(
      "data[c_additional_options]",
      clientData.c_additional_options || ""
    );

    // لو فيه صورة
    if (clientData.c_img) {
      formData.append("data[c_img]", clientData.c_img);
    }

    const { data } = await axios.post(`${BASE_URL}/api/clirents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

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
