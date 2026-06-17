import { AuthenticateProvider } from "./components/context/AuthenticateContext";
import { EmailValidateProvider } from "./components/context/EmailValidateContext";
import { HubsProvider } from "./components/context/HubsContext";
import { ImageBankProvider } from "./components/context/ImageBankContext";
import { ThemeProvider } from "./components/context/ThemeContext";
import { ToastProvider } from "./components/context/ToastContext";
import { UserProvider } from "./components/context/UserContext";
import RouterManager from "./components/routers/RouterManager";

const AppProviders = ({ children }: any) => (
  <ThemeProvider>
    <AuthenticateProvider>
      <UserProvider>
        <HubsProvider>
          <EmailValidateProvider>
            <ImageBankProvider>
              <ToastProvider>{children}</ToastProvider>
            </ImageBankProvider>
          </EmailValidateProvider>
        </HubsProvider>
      </UserProvider>
    </AuthenticateProvider>
  </ThemeProvider>
);

export default function App() {
  return (
    <AppProviders>
      <RouterManager />
    </AppProviders>
  );
}
