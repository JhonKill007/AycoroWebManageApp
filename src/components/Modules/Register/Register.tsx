// import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Colors } from "../../constants/Colors";
// import { useAuthenticateContext } from "../../context/AuthenticateContext";
// import { useThemeContext } from "../../context/ThemeContext";
// import { useUserContext } from "../../context/UserContext";
// import useLanguage from "../../hooks/useLanguage";
// import { UserCreateModel } from "../../Models/User/UserCreateModel";
// import { UserPerfilModel } from "../../Models/User/UserPerfilModel";
// import Data from "../../Services/Data/Data";
// import userService from "../../Services/User/UserService";

// export const Register = ({
//   name,
//   username,
//   email,
//   password,
//   birthday,
//   gender,
//   validateAge,
//   steps,
//   setSteps,
// }: {
//   name: string;
//   username: string;
//   email: string;
//   password: string;
//   birthday: Date;
//   gender: string;
//   validateAge: boolean;
//   steps: number;
//   setSteps: (step: number) => void;
// }) => {
//   const navigate = useNavigate();
//   const { theme } = useThemeContext();
//   const { getLabel } = useLanguage();
//   const { setAuthenticate } = useAuthenticateContext();
//   const { saveUser, setToken } = useUserContext();
//   const [checking, setChecking] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");

//   const [parentalConsent, setParentalConsent] = useState<boolean>(false);

//   const formatBirthday = (date: Date) => {
//     if (!date) return "";

//     const year = date.getUTCFullYear();
//     const month = String(date.getUTCMonth() + 1).padStart(2, "0");
//     const day = String(date.getUTCDate()).padStart(2, "0");

//     return `${year}-${month}-${day}T00:00:00.000Z`;
//   };

//   const SaveUser = () => {
//     setChecking(true);
//     let data: UserCreateModel = {
//       Id: "",
//       Name: name,
//       Username: username!.toLowerCase(),
//       Phone: "",
//       Email: email!.toLowerCase(),
//       Password: password,
//       Birthday: formatBirthday(birthday),
//       Gender: gender,
//       CreateDate: Data._Today,
//     };

//     userService
//       .Create(data)
//       .then((res: any) => {
//         if (res.data.code == 200) {
//           const user_result: UserPerfilModel = {
//             user: {
//               id: res.data.id,
//               name: res.data.name,
//               username: res.data.username,
//               email: res.data.email,
//               password: undefined,
//               phone: res.data.phone,
//               birthday: res.data.birthday,
//               gender: res.data.gender,
//               status: res.data.status,
//               verify: res.data.verify,
//               validate: res.data.validate,
//               perfilData: {
//                 presentation: res.data.perfilData.presentation,
//                 idMediaDataProfile: res.data.perfilData.idMediaDataProfile,
//               },
//               createDate: new Date(res.data.createDate),
//             },
//             isFollow: res.data.isFollow,
//             profilePhoto: res.data.profilePhoto,
//             followings: res.data.followings,
//             followers: res.data.followers,
//             post: res.data.post,
//           };

//           setToken(res.data.token);
//           saveUser(user_result);
//           setAuthenticate();
//           window.location.href = "/";
//         } else if (res.status === 204) {
//           setChecking(false);
//           setError(res.data);
//         }
//       })
//       .catch((e: any) => {
//         console.log(e);
//         setChecking(false);
//         setError(e);
//       });
//   };

//   return (
//     <div>
//       {!validateAge && (
//         <div
//           style={{
//             backgroundColor:
//               theme === "light"
//                 ? Colors.light.colors.background
//                 : Colors.dark.colors.background,
//             border: `1px solid ${
//               theme === "light"
//                 ? Colors.light.colors.border
//                 : Colors.dark.colors.border
//             }`,
//             borderRadius: "8px",
//             padding: "20px",
//             marginBottom: "20px",
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               alignItems: "flex-start",
//               gap: "12px",
//               marginBottom: "16px",
//             }}
//           >
//             <FontAwesomeIcon
//               icon={faExclamationTriangle}
//               style={{
//                 color: "#dc2626",
//                 fontSize: "18px",
//                 marginTop: "2px",
//               }}
//             />
//             <div>
//               <h4
//                 style={{
//                   margin: "0 0 8px 0",
//                   fontSize: "16px",
//                   fontWeight: "600",
//                   color: "#dc2626",
//                 }}
//               >
//                 {getLabel("concentimiento_parental")}
//               </h4>
//               <p
//                 style={{
//                   margin: 0,
//                   fontSize: "14px",
//                   color: "#7f1d1d",
//                   lineHeight: "1.4",
//                 }}
//               >
//                 {getLabel("terminos_edad")}
//               </p>
//             </div>
//           </div>

//           <div style={{ marginBottom: "16px" }}>
//             <label
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "10px",
//                 fontSize: "14px",
//                 fontWeight: "600",
//                 color: "#8e8e8e",
//                 cursor: "pointer",
//               }}
//             >
//               <input
//                 type="checkbox"
//                 checked={parentalConsent}
//                 onChange={(e) => setParentalConsent(e.target.checked)}
//                 style={{
//                   width: "18px",
//                   height: "18px",
//                   cursor: "pointer",
//                 }}
//               />
//               {getLabel("concentimiento_tutor")}
//             </label>
//           </div>

//           <div
//             style={{
//               fontSize: "12px",
//               color: "#7f1d1d",
//               marginTop: "12px",
//               lineHeight: "1.4",
//             }}
//           >
//             <strong>{getLabel("responsabilidad")}:</strong>{" "}
//             {getLabel("desvinculacion_responsabilidad")}
//           </div>
//         </div>
//       )}

//       <div style={{ display: "flex", justifyContent: "space-between" }}>
//         <button
//           onClick={() => {
//             setSteps(steps - 1);
//           }}
//           style={{
//             width: "45%",
//             padding: "14px 20px",
//             backgroundColor: "#8e8e8e",
//             color: "white",
//             border: "none",
//             borderRadius: "8px",
//             fontSize: "16px",
//             fontWeight: "600",
//             cursor: "pointer",
//             transition: "background-color 0.2s",
//             marginBottom: "20px",
//           }}
//         >
//           {getLabel("anterior")}
//         </button>
//         <button
//           onClick={async () => SaveUser()}
//           disabled={!validateAge && !parentalConsent ? true : false}
//           style={{
//             width: "45%",
//             padding: "14px 20px",
//             backgroundColor:
//               !validateAge && !parentalConsent ? "#bad0deff" : "#0095f6",
//             color: "white",
//             border: "none",
//             borderRadius: "8px",
//             fontSize: "16px",
//             fontWeight: "600",
//             cursor: "pointer",
//             transition: "background-color 0.2s",
//             marginBottom: "20px",
//           }}
//         >
//           {getLabel("registrate")}
//         </button>
//       </div>
//     </div>
//   );
// };


const Register = () => {
  return (
    <div>
      
    </div>
  )
}

export default Register

