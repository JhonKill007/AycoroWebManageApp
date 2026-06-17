import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Icon from "../../assets/icon.png";
import Logo from "../../assets/logo_cap.png";
import { useAuthenticateContext } from "../../context/AuthenticateContext";
import { useUserContext } from "../../context/UserContext";
import getUserDataHook from "../../hooks/getUserDataHook";

// const InsideProviders = ({ children }: any) => (
//   <HubsProvider>
//     <BanksProvider>
//       <PublicationHandleProvider>
//         <HistoryProvider>{children}</HistoryProvider>
//       </PublicationHandleProvider>
//     </BanksProvider>
//   </HubsProvider>
// );

export default function ScreenICon() {
  const { Authenticate } = useAuthenticateContext();
  const { userData } = useUserContext();
  const getUserData = getUserDataHook();

  useEffect(() => {
    const initializeUser = async () => {
      await getUserData();
    };
    initializeUser();
  }, []);

  return (
    // <InsideProviders>
    <>
      {Authenticate && !userData ? (
        <div
          style={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            margin: 0,
            padding: 0,
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              maxWidth: "70px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <img
              style={{
                width: "100%",
                objectFit: "contain",
                display: "block",
              }}
              src={Icon}
              alt="Icon"
            />

            <img
              style={{
                width: "100%",
                objectFit: "contain",
                display: "block",
              }}
              src={Logo}
              alt="Logo"
            />
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </>
    // </InsideProviders>
  );
}
