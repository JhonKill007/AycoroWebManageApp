// import {
//   faArrowLeft,
//   faCheckCircle,
//   faEye,
//   faEyeSlash,
// } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Select from "react-select";
// import IconLogo from "../../assets/img/icon.png";
// import Logo from "../../assets/img/Logo.png";
// import { useAuthenticateContext } from "../../context/AuthenticateContext";
// import { useUserContext } from "../../context/UserContext";
// import useLanguage from "../../hooks/useLanguage";
// import { UserCreateModel } from "../../Models/User/UserCreateModel";
// import { UserPerfilModel } from "../../Models/User/UserPerfilModel";
// import Data from "../../Services/Data/Data";
// import User from "../../Services/User/UserService";
// import Validate from "../../Services/Validate/ValidateService";
// import ChargerSlice from "../ChargerSlice/ChargerSlice";
// import FooterBlog from "../FooterBlog/FooterBlog";
// import "./SignForm.css";

// const SignForm = () => {
//   const navigate = useNavigate();
//   const { getLabel } = useLanguage();
//   const { setAuthenticate } = useAuthenticateContext();
//   const { saveUser, setToken } = useUserContext();
//   const [checking, setChecking] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");
//   const [errorIsActive, setErrorIsActive] = useState<boolean>(false);
//   const [signsteps, setSignSteps] = useState<number>(0);

//   const [name, setName] = useState<string | undefined>(undefined);
//   const [username, setUsername] = useState<string | undefined>(undefined);
//   const [email, setEmail] = useState<string | undefined>(undefined);
//   const [day, setDay] = useState<string | undefined>(undefined);
//   const [month, setMonth] = useState<string | undefined>(undefined);
//   const [monthLabel, setMonthLabel] = useState<string | undefined>(undefined);
//   const [year, setYear] = useState<string | undefined>(undefined);
//   const [gender, setGender] = useState<string | undefined>(undefined);

//   const [NewPassword, setNewPassword] = useState<string | undefined>(undefined);
//   const [ReplyNewpPassword, setReplyNewpPassword] = useState<
//     string | undefined
//   >(undefined);

//   const [VisibleNewPassword, setVisibleNewPassword] = useState<boolean>(false);
//   const [VisibleReplyNewpPassword, setVisibleReplyNewpPassword] =
//     useState<boolean>(false);

//   const [validateEmail, setValidateEmail] = useState<boolean>(false);
//   const [validateUsername, setValidateUsername] = useState<boolean>(false);

//   useEffect(() => {
//     document.title = ` ${getLabel("registrate")}`;

//     const metaDescription: any = document.querySelector(
//       'meta[name="description"]'
//     );

//     metaDescription.setAttribute(
//       "content",
//       `${getLabel("descripcion_registro")}`
//     );

//     return () => {
//       document.title = `${process.env.REACT_APP_TITTLE_BASE}`;
//     };
//   }, []);

//   const añoActual: number = new Date().getFullYear();
//   const listaDeAños: { label: string }[] = Array.from(
//     { length: añoActual - 1900 },
//     (_, index) => ({
//       label: (1901 + index).toString(),
//     })
//   ).reverse();

//   const days = Array.from({ length: 31 }, (_, i) => ({
//     value: i + 1,
//     label: (i + 1).toString(),
//   }));

//   const monthOptions: any = [
//     { value: 1, label: getLabel("enero") },
//     { value: 2, label: getLabel("febrero") },
//     { value: 3, label: getLabel("marzo") },
//     { value: 4, label: getLabel("abril") },
//     { value: 5, label: getLabel("mayo") },
//     { value: 6, label: getLabel("junio") },
//     { value: 7, label: getLabel("julio") },
//     { value: 8, label: getLabel("agosto") },
//     { value: 9, label: getLabel("septiembre") },
//     { value: 10, label: getLabel("octubre") },
//     { value: 11, label: getLabel("noviembre") },
//     { value: 12, label: getLabel("diciembre") },
//   ];

//   const toggleVisibleNewPassword = () => {
//     setVisibleNewPassword(!VisibleNewPassword);
//   };

//   const toggleVisibleReplyNewpPassword = () => {
//     setVisibleReplyNewpPassword(!VisibleReplyNewpPassword);
//   };

//   const ValidateData = () => {
//     if (gender === undefined) {
//       setError(getLabel("debes_seleccionar_genero"));
//       setErrorIsActive(true);
//     } else if (day === undefined) {
//       setError(getLabel("completar_dia_nacimiento"));
//       setErrorIsActive(true);
//     } else if (month === undefined) {
//       setError(getLabel("completar_mes_nacimiento"));
//       setErrorIsActive(true);
//     } else if (year === undefined) {
//       setError(getLabel("completar_ano_nacimiento"));
//       setErrorIsActive(true);
//     } else {
//       setChecking(true);
//       let edad = getEdad(`${year}/${month}/${day} 00:00:00`);
//       if (edad < 10) {
//         nextStep();
//         setChecking(false);
//       } else {
//         SaveUser();
//       }
//     }
//   };

//   const SaveUser = () => {
//     setChecking(true);
//     let data: UserCreateModel = {
//       Id: "",
//       Name: name,
//       Username: username!.toLowerCase(),
//       Phone: "",
//       Email: email!.toLowerCase(),
//       Password: NewPassword,
//       Birthday: `${year}-${month}-${day}T00:00:00.000Z`,
//       Gender: gender,
//       CreateDate: Data._Today,
//     };

//     User.Create(data)
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
//           setErrorIsActive(!errorIsActive);
//         }
//       })
//       .catch((e: any) => {
//         console.log(e);
//         setChecking(false);
//         setError(e);
//         setErrorIsActive(!errorIsActive);
//       });
//   };

//   function getEdad(dateString: string) {
//     let hoy = new Date();
//     let fechaNacimiento = new Date(dateString);
//     let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
//     let diferenciaMeses = hoy.getMonth() - fechaNacimiento.getMonth();
//     if (
//       diferenciaMeses < 0 ||
//       (diferenciaMeses === 0 && hoy.getDate() < fechaNacimiento.getDate())
//     ) {
//       edad--;
//     }
//     return edad;
//   }

//   const nextStep = () => {
//     setSignSteps(signsteps + 1);
//   };

//   const ValidateEmail = () => {
//     if (email !== undefined && email !== "") {
//       Validate.validateEmail(email.toLowerCase())
//         .then((res: any) => {
//           if (res.data) {
//             setValidateEmail(true);
//             setErrorIsActive(false);
//           } else {
//             setValidateEmail(false);
//             setError(getLabel("correo_no_disponible"));
//             setErrorIsActive(true);
//           }
//         })
//         .catch((res: any) => {});
//     } else {
//       setValidateUsername(false);
//     }
//   };

//   const VerifyUsername = () => {
//     if (username !== undefined && username !== "") {
//       if (ValidateUsername(username)) {
//         Validate.validateUsername(username.toLowerCase())
//           .then((res: any) => {
//             if (res.data) {
//               setValidateUsername(true);
//               setErrorIsActive(false);
//             } else {
//               setValidateUsername(false);
//               setError(getLabel("usuario_no_disponible"));
//               setErrorIsActive(true);
//             }
//           })
//           .catch((err: any) => {
//             console.error(err);
//           });
//       }
//     } else {
//       setValidateUsername(false);
//     }
//   };

//   const ValidateUsername = (username: string) => {
//     if (username.length < 7 || username.length > 30) {
//       setValidateUsername(false);
//       setError(getLabel("usuario_maximo_30"));
//       setErrorIsActive(true);
//       return false;
//     }

//     if (/^\d+$/.test(username)) {
//       setValidateUsername(false);
//       setError(getLabel("usuario_solo_numeros"));
//       setErrorIsActive(true);
//       return false;
//     }

//     if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
//       setValidateUsername(false);
//       setError(getLabel("usuario_no_caracteres_especiales"));
//       setErrorIsActive(true);
//       return false;
//     }

//     setValidateUsername(true);
//     setErrorIsActive(false);
//     return true;
//   };

//   const validarContrasena = (contrasena: string) => {
//     if (contrasena.length < 6) {
//       setError(getLabel("contrasena_minimo_6"));
//       setErrorIsActive(true);
//       return false;
//     }

//     const regex = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!$@%])[0-9a-zA-Z!$@%]+$/;
//     if (!regex.test(contrasena)) {
//       setError(getLabel("contrasena_compleja"));
//       setErrorIsActive(true);
//       return false;
//     }
//     setErrorIsActive(false);
//     return true;
//   };

//   const GenderList: any[] = [
//     { value: "male", label: getLabel("masculino") },
//     { value: "female", label: getLabel("femenino") },
//     { value: "custom", label: getLabel("personalizado") },
//   ];

//   return (
//     <div className="cont">
//       {!checking && (
//         <>
//           <div className="col-md-4 m-auto">
//             <br />
//             <br />
//             <br />
//             <br />
//             <Link to="/login">
//               <div style={{ width: "60px", height: "60px", margin: "auto" }}>
//                 <img
//                   style={{ width: "100%", height: "100%" }}
//                   src={IconLogo}
//                   alt=""
//                 />
//               </div>
//               <div style={{ width: "150px", margin: "auto" }}>
//                 <img style={{ width: "100%" }} src={Logo} alt="" />
//               </div>
//             </Link>
//             <br />
//             {signsteps > 0 && (
//               <FontAwesomeIcon
//                 className="searchIcon"
//                 style={{ cursor: "pointer" }}
//                 icon={faArrowLeft}
//                 onClick={() => {
//                   setSignSteps(signsteps - 1);
//                   setErrorIsActive(false);
//                   setNewPassword(undefined);
//                   setReplyNewpPassword(undefined);
//                 }}
//               />
//             )}
//             {signsteps === 0 && (
//               <>
//                 <h2> {getLabel("unete_a_aycoro")}</h2>
//                 <span>{getLabel("empieza_a_compartir")}</span>
//                 <br />
//                 <br />
//                 <h5>{getLabel("nombre")}</h5>
//                 <span>{getLabel("usa_el_nombre")}</span>
//                 <div className="input-div-signup col-sm-10 m-auto mb-1 mt-4">
//                   <input
//                     className="form-control"
//                     type="text"
//                     placeholder={getLabel("nombre")}
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                   />
//                 </div>
//                 <div className="col-sm-10 m-auto mb-1 ErrorLegensDiv">
//                   {errorIsActive && (
//                     <span className="ErrorLegens">{error}</span>
//                   )}
//                 </div>
//                 <button
//                   className="form-control btn btn-primary"
//                   style={{ marginBottom: "10px", marginTop: "10px" }}
//                   onClick={() => {
//                     if (name === undefined || name === "") {
//                       setError(getLabel("completar_nombre"));
//                       setErrorIsActive(true);
//                     } else {
//                       setSignSteps(signsteps + 1);
//                       setErrorIsActive(false);
//                     }
//                   }}
//                 >
//                   {getLabel("siguiente")}
//                 </button>
//               </>
//             )}

//             {signsteps === 1 && (
//               <>
//                 <h4>{getLabel("usuario")}</h4>
//                 <span>{getLabel("como_te_encontramos")}</span>
//                 <br />
//                 <br />
//                 <div className="input-div-signup col-sm-10 m-auto InputDiv">
//                   <input
//                     className="form-control"
//                     type="text"
//                     placeholder={getLabel("usuario")}
//                     onChange={(e) => {
//                       if (/\s/.test(e.target.value)) {
//                         setError(getLabel("usuario_sin_espacios"));
//                         setErrorIsActive(true);
//                       } else {
//                         setUsername(e.target.value);
//                       }
//                     }}
//                     onBlur={VerifyUsername}
//                     value={username}
//                   />
//                   <FontAwesomeIcon
//                     className="IconValidation"
//                     style={{ color: validateUsername ? "green" : "#e75e69" }}
//                     icon={faCheckCircle}
//                   />
//                 </div>
//                 <div
//                   className="col-sm-10 m-auto mb-1 ErrorLegensDiv"
//                   style={{ height: 55 }}
//                 >
//                   {errorIsActive && (
//                     <span className="ErrorLegens">{error}</span>
//                   )}
//                 </div>
//                 <span style={{ fontSize: 12 }}>
//                   {getLabel("usuario_maximo_30")}
//                 </span>
//                 <button
//                   className="form-control btn btn-primary"
//                   style={{ marginBottom: "10px", marginTop: "10px" }}
//                   onClick={() => {
//                     if (username === undefined || username === "") {
//                       setError(getLabel("debes_completar_usuario"));
//                       setErrorIsActive(true);
//                     } else {
//                       VerifyUsername();
//                       if (validateUsername) {
//                         setSignSteps(signsteps + 1);
//                         setErrorIsActive(false);
//                       }
//                     }
//                   }}
//                 >
//                   {getLabel("siguiente")}
//                 </button>
//               </>
//             )}

//             {signsteps === 2 && (
//               <>
//                 <h4>{getLabel("correo_electronico")}</h4>
//                 <span>{getLabel("correo_recuperacion")}</span>
//                 <div className="input-div-signup col-sm-10 m-auto InputDiv">
//                   <input
//                     className="form-control"
//                     style={{ marginTop: "20px" }}
//                     type="text"
//                     placeholder={getLabel("correo_electronico")}
//                     onChange={(e) => {
//                       if (/\s/.test(e.target.value)) {
//                         setError(getLabel("correo_sin_espacios"));
//                         setErrorIsActive(true);
//                       } else {
//                         setEmail(e.target.value);
//                       }
//                     }}
//                     onBlur={ValidateEmail}
//                     value={email}
//                   />
//                   <FontAwesomeIcon
//                     className="IconValidation"
//                     style={{ color: validateEmail ? "green" : "#e75e69" }}
//                     icon={faCheckCircle}
//                   />
//                 </div>
//                 <div
//                   className="col-sm-10 m-auto mb-1 ErrorLegensDiv"
//                   style={{ height: "30px" }}
//                 >
//                   {errorIsActive && (
//                     <span className="ErrorLegens">{error}</span>
//                   )}
//                 </div>
//                 <button
//                   className="form-control btn btn-primary"
//                   style={{ marginBottom: "10px", marginTop: "10px" }}
//                   onClick={() => {
//                     if (email === undefined || email === "") {
//                       setError(getLabel("debes_completar_correo"));
//                       setErrorIsActive(true);
//                       setValidateEmail(false);
//                     } else {
//                       if (
//                         /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i.test(
//                           email
//                         )
//                       ) {
//                         ValidateEmail();
//                         if (validateEmail) {
//                           setSignSteps(signsteps + 1);
//                           setErrorIsActive(false);
//                         }
//                       } else {
//                         setError(getLabel("correo_no_valido"));
//                         setErrorIsActive(true);
//                         setValidateEmail(false);
//                       }
//                     }
//                   }}
//                 >
//                   {getLabel("siguiente")}
//                 </button>
//               </>
//             )}

//             {signsteps === 3 && (
//               <>
//                 <div className="col-sm-10 m-auto mb-1">
//                   <h4>{getLabel("contrasena")}</h4>
//                   <span>{getLabel("crea_contrasena_segura")}</span>
//                   <br />
//                   <br />
//                 </div>
//                 <div className="pass-input-div-signup col-sm-10 m-auto mb-1">
//                   <input
//                     className="form-control"
//                     type={VisibleNewPassword ? "text" : "password"}
//                     placeholder={getLabel("contrasena")}
//                     onChange={(e) => setNewPassword(e.target.value)}
//                     value={NewPassword}
//                   />
//                   {!VisibleNewPassword ? (
//                     <FontAwesomeIcon
//                       className="icon-view-pass-signup"
//                       icon={faEye}
//                       onClick={() => toggleVisibleNewPassword()}
//                     />
//                   ) : (
//                     <FontAwesomeIcon
//                       className="icon-view-pass-signup"
//                       icon={faEyeSlash}
//                       onClick={() => toggleVisibleNewPassword()}
//                     />
//                   )}
//                 </div>
//                 <div className="pass-input-div-signup col-sm-10 m-auto mb-1">
//                   <input
//                     className="form-control"
//                     type={VisibleReplyNewpPassword ? "text" : "password"}
//                     placeholder={getLabel("repite_contrasena")}
//                     onChange={(e) => setReplyNewpPassword(e.target.value)}
//                     value={ReplyNewpPassword}
//                   />
//                   {!VisibleReplyNewpPassword ? (
//                     <FontAwesomeIcon
//                       className="icon-view-pass-signup"
//                       icon={faEye}
//                       onClick={() => toggleVisibleReplyNewpPassword()}
//                     />
//                   ) : (
//                     <FontAwesomeIcon
//                       className="icon-view-pass-signup"
//                       icon={faEyeSlash}
//                       onClick={() => toggleVisibleReplyNewpPassword()}
//                     />
//                   )}
//                 </div>
//                 <div className="col-sm-10 m-auto mb-1 ErrorLegensDiv">
//                   {errorIsActive && (
//                     <span className="ErrorLegens">{error}</span>
//                   )}
//                 </div>
//                 <span style={{ fontSize: "12px" }}>
//                   {getLabel("contrasena_minumo_6")}
//                 </span>
//                 <button
//                   className="form-control btn btn-primary"
//                   style={{ marginBottom: "10px", marginTop: "10px" }}
//                   onClick={() => {
//                     if (NewPassword === undefined || NewPassword === "") {
//                       setError(getLabel("debes_completar_contrasena"));
//                       setErrorIsActive(true);
//                     } else if (NewPassword != ReplyNewpPassword) {
//                       setError(getLabel("contrasena_no_coincide"));
//                       setErrorIsActive(true);
//                     } else {
//                       if (validarContrasena(NewPassword)) {
//                         setErrorIsActive(false);
//                         setSignSteps(signsteps + 1);
//                       }
//                     }
//                   }}
//                 >
//                   {getLabel("siguiente")}
//                 </button>
//               </>
//             )}

//             {signsteps === 4 && (
//               <>
//                 <br />
//                 <div className="col-sm-10 m-auto mb-1">
//                   <h4>{getLabel("genero")}</h4>
//                   <span>{getLabel("elige_genero")}</span>
//                 </div>
//                 <div
//                   className="col-sm-10 m-auto mb-1"
//                   style={{ color: "gray" }}
//                 >
//                   <Select
//                     options={GenderList}
//                     onChange={(e: any) => {
//                       setGender(e.value);
//                     }}
//                     placeholder={getLabel("genero")}
//                   />
//                 </div>
//                 <div className="col-sm-10 m-auto mb-1">
//                   <h4> {getLabel("fecha_nacimiento")}</h4>
//                   <span> {getLabel("edad")}</span>
//                 </div>
//                 <div className="col-sm-10 m-auto mb-1 d-flex justify-content-between">
//                   <div
//                     className="col-sm-4"
//                     style={{ paddingRight: "1px", color: "gray" }}
//                   >
//                     <Select
//                       options={days}
//                       onChange={(e: any) => setDay(e.label)}
//                       placeholder={getLabel("fecha_dia")}
//                     />
//                   </div>
//                   <div
//                     className="col-sm-4"
//                     style={{ paddingRight: "1px", color: "gray" }}
//                   >
//                     <Select
//                       options={monthOptions}
//                       onChange={(e: any) => {
//                         setMonth(e.value);
//                         setMonthLabel(e.label);
//                       }}
//                       placeholder={
//                         monthLabel ? monthLabel : getLabel("fecha_mes")
//                       }
//                     />
//                   </div>
//                   <div
//                     className="col-sm-4"
//                     style={{ paddingRight: "1px", color: "gray" }}
//                   >
//                     <Select
//                       options={listaDeAños}
//                       onChange={(e: any) => setYear(e.label)}
//                       placeholder={year ? year : getLabel("fecha_ano")}
//                     />
//                   </div>
//                 </div>
//                 <div className="col-sm-10 m-auto mb-1 ErrorLegensDiv">
//                   {errorIsActive && (
//                     <span className="ErrorLegens">{error}</span>
//                   )}
//                 </div>
//                 <button
//                   className="form-control btn-success"
//                   onClick={ValidateData}
//                   style={{ marginTop: "15px" }}
//                 >
//                   {getLabel("registrate")}
//                 </button>
//               </>
//             )}
//             {signsteps === 5 && (
//               <>
//                 <br />
//                 <div className="col-sm-10 m-auto mb-1">
//                   <p>{getLabel("limite_edad")}</p>
//                   <br />
//                 </div>
//                 <div className="col-sm-11 m-auto mb-1 d-flex justify-content-between">
//                   <div className="col-md-5">
//                     <button
//                       className="form-control btn-danger"
//                       onClick={() => {
//                         setSignSteps(signsteps - 1);
//                       }}
//                     >
//                       {getLabel("cancelar")}
//                     </button>
//                   </div>
//                   <div className="col-md-5">
//                     <button
//                       className="form-control btn-success"
//                       onClick={SaveUser}
//                     >
//                       {getLabel("aceptar")}
//                     </button>
//                   </div>
//                 </div>
//               </>
//             )}
//             {signsteps < 5 && (
//               <div className="links-log">
//                 <span>{getLabel("tengo_cuenta")} </span>
//                 <Link to="/login">
//                   <span>{getLabel("iniciar_sesion")}</span>
//                 </Link>
//                 <br />
//               </div>
//             )}
//           </div>
//           <FooterBlog />
//         </>
//       )}
//       {checking && <ChargerSlice />}
//     </div>
//   );
// };

// export default SignForm;


const SignForm = () => {
  return (
    <div>
      
    </div>
  )
}

export default SignForm
