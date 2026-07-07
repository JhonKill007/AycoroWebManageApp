import axios from "axios";
import { useCallback } from "react";
import { useEmailValidateContext } from "../context/EmailValidateContext";
import { useImageBankContext } from "../context/ImageBankContext";
import { useUserContext } from "../context/UserContext";
import initializeService from "../Services/Initialize/InitializeService";

const systemLoginKey = process.env.REACT_APP_SYSTEM_LOGIN_KEY;
const systemLoginPassword = process.env.REACT_APP_SYSTEM_LOGIN_PASSWORD;

const useGetUserData = () => {
  const { saveUser } = useUserContext();
  const { searchImage } = useImageBankContext();
  const { saveEmailWarning } = useEmailValidateContext();

  const getUserData = useCallback(async () => {
    try {
      const AycoroAuthSystem = axios.create({
        baseURL: process.env.REACT_APP_API_URL,
        headers: {
          "Content-Type": "application/json",
        },
      });
      const token = localStorage.getItem("aycoroAuthToken");
      const response = await AycoroAuthSystem.get(`/api/AuthSystem/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const authorization = await initializeService.initialize(response.data.id);
        if (!systemLoginKey || !systemLoginPassword) {
          throw new Error("System login credentials are not configured");
        }

        const aycoroDataResponse = await AycoroAuthSystem.post("/api/Login", {
          Key: systemLoginKey,
          Password: systemLoginPassword,
        });
        const { token } = aycoroDataResponse.data;
        localStorage.setItem("systemToken", token);
        saveUser({
          user: {
            id: response.data.id,
            name: response.data.name,
            username: response.data.username,
            email: response.data.email,
            password: undefined,
            phone: response.data.phone,
            birthday: response.data.birthday,
            gender: response.data.gender,
            role: authorization.data.role,
            roleName: authorization.data.roleName,
            permissions: authorization.data.permissions,
            status: response.data.status,
            verify: response.data.verify,
            validate: response.data.validate,
            perfilData: {
              presentation: response.data.perfilData.presentation,
              idMediaDataProfile: response.data.perfilData.idMediaDataProfile,
            },
            createDate: new Date(response.data.createDate),
          },
          isFollow: response.data.isFollow,
          profilePhoto: response.data.profilePhoto,
          followings: response.data.followings,
          followers: response.data.followers,
          post: response.data.post,
        });

        if (!response.data.validate) {
          saveEmailWarning(true);
        }
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("internalToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("aycoroAuthToken");
        window.location.href = "/login";
      } else {
        console.error("Error fetching user data:", err);
      }
    }
  }, [searchImage, saveUser]);

  return getUserData;
};

export default useGetUserData;
