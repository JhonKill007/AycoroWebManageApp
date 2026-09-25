import { Route } from "react-router-dom";
import AppLayout from "../Layout/AppLayout";
import AccountAdmin from "../Views/AccountAdmin";
import Analytics from "../Views/Analytics";
import Audit from "../Views/Audit";
import CaseDetails from "../Views/CaseDetails";
import Dashboard from "../Views/Dashboard";
import OnlineUsers from "../Views/OnlineUsers";
import Login from "../Views/Login";
import Logs from "../Views/Logs";
import Moderation from "../Views/Moderation";
import Publications from "../Views/Publications";
import PublicationDetail from "../Views/PublicationDetail";
import Reports from "../Views/Reports";
import ReportDetail from "../Views/ReportDetail";
import Requests from "../Views/Requests";
import SessionLogs from "../Views/SessionLogs";
import Settings from "../Views/Settings";
import Stories from "../Views/Stories";
import StoryDetail from "../Views/StoryDetail";
import Audios from "../Views/Audios";
import Comments from "../Views/Comments";
import Trends from "../Views/Trends";
import Suspenciones from "../Views/Suspenciones";
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
          <Route element={<PermissionRoute anyOf={[Permissions.VIEW_DASHBOARD]} />}>
            <Route index element={<Dashboard />} />
            <Route path="/online" element={<OnlineUsers />} />
          </Route>
          <Route element={<PermissionRoute anyOf={[Permissions.VIEW_MODERATION]} />}>
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/:id" element={<ReportDetail />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/moderation" element={<Moderation />} />
            <Route path="/moderation/:id" element={<CaseDetails />} />
          </Route>
          <Route element={<PermissionRoute anyOf={[Permissions.VIEW_ANALYTICS]} />}><Route path="/analytics" element={<Analytics />} /></Route>
          <Route element={<PermissionRoute anyOf={[Permissions.VIEW_TRENDS]} />}>
            <Route path="/trends" element={<Trends />} />
          </Route>
          <Route element={<PermissionRoute anyOf={[Permissions.VIEW_USERS]} />}>
            <Route path="/users" element={<Users />} />
            <Route path="users/:username" element={<UserDetail />} />
            <Route path="/suspenciones" element={<Suspenciones />} />
          </Route>
          <Route element={<PermissionRoute anyOf={[Permissions.VIEW_POSTS]} />}>
            <Route path="/publications" element={<Publications />} />
          </Route>
          <Route
            element={
              <PermissionRoute
                anyOf={[
                  Permissions.VIEW_POSTS,
                  Permissions.VIEW_USERS,
                  Permissions.VIEW_DASHBOARD,
                  Permissions.VIEW_COMMENTS,
                  Permissions.VIEW_TRENDS,
                ]}
              />
            }
          >
            <Route path="/publications/:id" element={<PublicationDetail />} />
          </Route>
          <Route element={<PermissionRoute anyOf={[Permissions.VIEW_STORIES]} />}>
            <Route path="/stories" element={<Stories />} />
          </Route>
          <Route
            element={
              <PermissionRoute
                anyOf={[
                  Permissions.VIEW_STORIES,
                  Permissions.VIEW_USERS,
                  Permissions.VIEW_DASHBOARD,
                ]}
              />
            }
          >
            <Route path="/stories/:id" element={<StoryDetail />} />
          </Route>
          <Route element={<PermissionRoute anyOf={[Permissions.VIEW_AUDIOS]} />}>
            <Route path="/audios" element={<Audios />} />
          </Route>
          <Route element={<PermissionRoute anyOf={[Permissions.VIEW_COMMENTS]} />}>
            <Route path="/comments" element={<Comments />} />
          </Route>
          <Route element={<PermissionRoute anyOf={[Permissions.MANAGE_SETTINGS, Permissions.MANAGE_ADMINS, Permissions.DANGER_ZONE]} />}><Route path="/settings" element={<Settings />} /></Route>
          <Route element={<PermissionRoute anyOf={[Permissions.VIEW_ERROR_LOGS, Permissions.MANAGE_ADMINS]} />}><Route path="/audit" element={<Audit />} /></Route>
          <Route element={<PermissionRoute anyOf={[Permissions.VIEW_ERROR_LOGS]} />}><Route path="/logs" element={<Logs />} /></Route>
          <Route element={<PermissionRoute anyOf={[Permissions.VIEW_SESSION_LOGS]} />}><Route path="/session" element={<SessionLogs />} /></Route>
          <Route path="/account" element={<AccountAdmin />} />
        </Route>
      </Route>
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/login" element={<Login />} />
    </CustomRoutes>
  );
};

export default DashboardRoutes;
