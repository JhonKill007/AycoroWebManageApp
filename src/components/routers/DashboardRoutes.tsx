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
import SessionLogs from "../Views/SessionLogs";
import Settings from "../Views/Settings";
import UserDetail from "../Views/UserDetail";
import Users from "../Views/Users";
import Unauthorized from "../Views/Unauthorized";
import { Permissions } from "../constants/Permissions";
import CustomRoutes from "./CustomRoutes";
import { PermissionRoute } from "./PermissionRoute";
import { PrivateRoute } from "./PrivateRoute";

const DashboardRoutes = () => {
  return (
    <CustomRoutes>
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<PermissionRoute anyOf={[Permissions.VIEW_DASHBOARD]} />}><Route index element={<Dashboard />} /></Route>
          <Route element={<PermissionRoute anyOf={[Permissions.VIEW_MODERATION]} />}>
            <Route path="/reports" element={<Reports />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/moderation" element={<Moderation />} />
            <Route path="/moderation/:id" element={<CaseDetails />} />
          </Route>
          <Route element={<PermissionRoute anyOf={[Permissions.VIEW_ANALYTICS]} />}><Route path="/analytics" element={<Analytics />} /></Route>
          <Route element={<PermissionRoute anyOf={[Permissions.VIEW_USERS]} />}>
            <Route path="/users" element={<Users />} />
            <Route path="users/:username" element={<UserDetail />} />
          </Route>
          <Route element={<PermissionRoute anyOf={[Permissions.VIEW_POSTS]} />}><Route path="/publications" element={<Publications />} /></Route>
          <Route element={<PermissionRoute anyOf={[Permissions.MANAGE_SETTINGS, Permissions.MANAGE_ADMINS, Permissions.DANGER_ZONE]} />}><Route path="/settings" element={<Settings />} /></Route>
          <Route element={<PermissionRoute anyOf={[Permissions.MANAGE_SETTINGS]} />}><Route path="/security" element={<Security />} /></Route>
          <Route element={<PermissionRoute anyOf={[Permissions.VIEW_ERROR_LOGS]} />}><Route path="/logs" element={<Logs />} /></Route>
          <Route element={<PermissionRoute anyOf={[Permissions.VIEW_SESSION_LOGS]} />}><Route path="/session" element={<SessionLogs />} /></Route>
          <Route path="/account" element={<AccountAdmin />} />
        </Route>
      </Route>
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/login" element={<Login />} />
      {/* <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} /> */}
      {/* <Route path="/comunity/*" element={<ComunityRoutes />} /> */}
      {/* <Route path="/recovery" element={<AccountRecovery />} /> */}
    </CustomRoutes>
  );
};

export default DashboardRoutes;
