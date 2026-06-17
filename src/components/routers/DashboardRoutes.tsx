import { Route } from "react-router-dom";
import AppLayout from "../Layout/AppLayout";
import AccountAdmin from "../Views/AccountAdmin";
import Analytics from "../Views/Analytics";
import CaseDetails from "../Views/CaseDetails";
import Conversations from "../Views/Conversations";
import Dashboard from "../Views/Dashboard";
import Login from "../Views/Login";
import Logs from "../Views/Logs";
import Moderation from "../Views/Moderation";
import Publications from "../Views/Publications";
import Reports from "../Views/Reports";
import Requests from "../Views/Requests";
import Security from "../Views/Security";
import Settings from "../Views/Settings";
import UserDetail from "../Views/UserDetail";
import Users from "../Views/Users";
import CustomRoutes from "./CustomRoutes";
import { PrivateRoute } from "./PrivateRoute";

const DashboardRoutes = () => {
  return (
    <CustomRoutes>
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/users" element={<Users />} />
          <Route path="users/:username" element={<UserDetail />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="/moderation" element={<Moderation />} />
          <Route path="/moderation/:id" element={<CaseDetails />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/security" element={<Security />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/account" element={<AccountAdmin />} />
        </Route>
      </Route>
      <Route path="/login" element={<Login />} />
      {/* <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} /> */}
      {/* <Route path="/comunity/*" element={<ComunityRoutes />} /> */}
      {/* <Route path="/recovery" element={<AccountRecovery />} /> */}
    </CustomRoutes>
  );
};

export default DashboardRoutes;
