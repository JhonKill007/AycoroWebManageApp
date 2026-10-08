import { useCallback } from "react";
import { useEmailValidateContext } from "../context/EmailValidateContext";
import { useUserContext } from "../context/UserContext";
import Http from "../Services/Http/HttpClient";

const useGetUserData = () => {
  const { saveUser } = useUserContext();
  const { saveEmailWarning } = useEmailValidateContext();

  const getUserData = useCallback(async () => {
    try {
      const aycoroToken = localStorage.getItem("aycoroAuthToken");
      if (!aycoroToken) {
        localStorage.removeItem("internalToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("aycoroAuthToken");
        window.location.href = "/login";
        return;
      }

      const response = await Http.get("/api/session/bootstrap", {
        headers: {
          "X-Aycoro-Token": aycoroToken,
        },
      });

      if (response.status === 200) {
        const profile = response.data.user;
        const authorization = response.data.authorization;
        localStorage.setItem("systemToken", response.data.systemToken);
        saveUser({
          user: {
            id: profile.id,
            name: profile.name,
            username: profile.username,
            email: profile.email,
            password: undefined,
            phone: profile.phone,
            birthday: profile.birthday,
            gender: profile.gender,
            role: authorization.role,
            roleName: authorization.roleName,
            roleType: authorization.roleType || "NORMAL",
            permissions: authorization.permissions,
            status: profile.status,
            verify: profile.verify,
            validate: profile.validate,
            perfilData: {
              presentation: profile.perfilData.presentation,
              idMediaDataProfile: profile.perfilData.idMediaDataProfile,
            },
            createDate: new Date(profile.createDate),
          },
          isFollow: profile.isFollow,
          profilePhoto: profile.profilePhoto,
          followings: profile.followings,
          followers: profile.followers,
          post: profile.post,
        });

        if (!profile.validate) {
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
  }, [saveUser, saveEmailWarning]);

  return getUserData;
};

export default useGetUserData;
