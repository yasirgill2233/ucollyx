import { Routes, Route } from "react-router";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Verify from "../pages/auth/Verify";
import WorkspaceSelection from "../pages/auth/WorkspaceSelection";
import WorkspaceSetup from "../pages/auth/WorkspaceSetup";
import JoinWorkspaceFlow from "../pages/auth/JoinWorkspaceFlow";
import RequestSuccessful from "../pages/auth/RequestSuccessful";
import NotFound from "../pages/illustrations/NotFound";
import SignOutModal from "../pages/auth/SingnOutModal";
import SignedOutSuccess from "../pages/auth/SignedOutSuccess";
import Dashboard from "../pages/dashboards/developer/Dashboard";
import IDEBody from "../pages/shared/cloudeide/IDEBody";
import DevChat from "../pages/shared/centralchatt/DevChatt";
import KanbanBoard from "../pages/dashboards/developer/board/KanbanBoard";
import MyProject from "../pages/dashboards/developer/project/MyProject";
import IssuesDashboard from "../pages/dashboards/developer/project/IssuesDashboard";
import MeetingsPage from "../pages/shared/meeting/MeetingsPage";
import Main from "../components/layout/Main";
import ProjectsPage from "../pages/dashboards/developer/project/ProjectsPage";
import ManagerPortfolio from "../pages/dashboards/manager/ManagerPortfolio";
import ProjectDetailView from "../pages/dashboards/manager/ProjectDetailView";
import TeamActivity from "../pages/dashboards/manager/TeamActivity/TeamActivity";
import ProjectTasksView from "../pages/dashboards/manager/Tasks/ProjectTasksView";
import MainDashboard from "../pages/dashboards/qualityassurance/MainDashboard";
import RedCardsAlerts from "../pages/dashboards/qualityassurance/RedCardAlerts";
import ReportBugForm from "../pages/dashboards/qualityassurance/ReportBugForm";
import VerificationPage from "../pages/dashboards/qualityassurance/VerificationPage";
import OrganizationDashboard from "../pages/dashboards/orgadmin/OrganizationDashboard";
import AdminProjectsView from "../pages/dashboards/orgadmin/AdminProjectsView";
import UsersManagement from "../pages/dashboards/orgadmin/UserManagement";
import AdminDashboard from "../pages/dashboards/superadmin/AdminDashboard";
import OrganizationsScreen from "../pages/dashboards/superadmin/OrganizationsScreen";
import MembersAndRoles from "../pages/dashboards/superadmin/MembersAndRoles";
import PageLoader from "../components/ui/PageLoader";
import { Suspense, lazy } from "react";
import SetPassword from "../pages/auth/SetPassword";
import JoinWorkspace from "../pages/auth/JoinWorkspace";
import SelectWorkspace from "../pages/auth/SelectWorkspace";
import ProtectedRoute from "./ProtectedRoute";
import AccessDenied from "../pages/auth/AccessDenied";
import AwaitingRole from "../pages/auth/AwaitingRole";
import Unauthorized from "../pages/illustrations/Unauthorized";
import Forbidden from "../pages/illustrations/Forbidden";
import RoleAccessManager from "../pages/dashboards/orgadmin/RoleAccessManager";
import LandingPage from "../components/layout/LandingPage";

// const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* --- PUBLIC / AUTH ROUTES --- */}
        <Route path="/">
          <Route index element={<LandingPage />} />
          <Route path="login" element={<Login />} />
          <Route path="unauthorized" element={<Unauthorized />} />
          <Route path="forbidden" element={<Forbidden />} />
          <Route path="register" element={<Register />} />
          <Route path="verify" element={<Verify />} />
          <Route path="set-password" element={<SetPassword />} />
          <Route path="join-space" element={<JoinWorkspace />} />

          <Route
            path="workspace-selection"
            element={
              <ProtectedRoute>
                <WorkspaceSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="workspace-setup"
            element={
              <ProtectedRoute>
                <WorkspaceSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="join-workspace"
            element={
              <ProtectedRoute>
                <JoinWorkspaceFlow />
              </ProtectedRoute>
            }
          />
          <Route
            path="request-pending"
            element={
              <ProtectedRoute>
                <RequestSuccessful />
              </ProtectedRoute>
            }
          />
           <Route
            path="request-rejected"
            element={
              <ProtectedRoute>
                <AccessDenied />
              </ProtectedRoute>
            }
          />
          <Route
            path="awaiting-role"
            element={
              <ProtectedRoute>
                <AwaitingRole />
              </ProtectedRoute>
            }
          />
           <Route
            path="sign-out"
            element={
              <ProtectedRoute>
                <SignOutModal />
              </ProtectedRoute>
            }
          />
          <Route
            path="signed-out-success"
            element={
              <ProtectedRoute>
                <SignedOutSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="select-workspace"
            element={
              <ProtectedRoute>
                <SelectWorkspace />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          {/* --- PROTECTED APP ROUTES (Inside Layout) --- */}
          <Route element={<Main />}>
            {/* Developer Group */}
            <Route
              path="dev"
              element={<ProtectedRoute allowedRoles={["dev"]} />}
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="my-projects" element={<MyProject />} />
              <Route path="issues" element={<IssuesDashboard />} />
              <Route path="board" element={<KanbanBoard />} />
              <Route path="ide/:projectId?" element={<IDEBody />} />
              <Route path="projects-dir" element={<ProjectsPage />} />
              <Route path="chat" element={<DevChat />} />
              <Route path="meetings" element={<MeetingsPage />} />
            </Route>

            {/* Manager Group */}
            <Route
              path="manager"
              element={<ProtectedRoute allowedRoles={["manager"]} />}
            >
              <Route path="portfolio" element={<ManagerPortfolio />} />
              <Route path="activity" element={<TeamActivity />} />
              <Route path="tasks" element={<ProjectTasksView />} />
              <Route path="details" element={<ProjectDetailView />} />

              <Route path="ide/:projectId?" element={<IDEBody />} />
              <Route path="chat" element={<DevChat />} />
              <Route path="projects-dir" element={<ProjectsPage />} />

              <Route path="meetings" element={<MeetingsPage />} />
            </Route>

            {/* QA Group */}
            <Route path="qa" element={<ProtectedRoute allowedRoles={["qa"]} />}>
              <Route path="dashboard" element={<MainDashboard />} />
              <Route path="alerts" element={<RedCardsAlerts />} />
              <Route path="report-bug" element={<ReportBugForm />} />
              <Route path="verify-task" element={<VerificationPage />} />

              <Route path="board" element={<KanbanBoard />} />
              <Route path="chat" element={<DevChat />} />
              <Route path="projects-dir" element={<ProjectsPage />} />

              <Route path="meetings" element={<MeetingsPage />} />
            </Route>

            {/* Organization Admin Group */}
            <Route
              path="org-admin"
              element={<ProtectedRoute allowedRoles={["org_admin"]} />}
            >
              <Route path="dashboard" element={<OrganizationDashboard />} />
              <Route path="projects" element={<AdminProjectsView />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="chat" element={<DevChat />} />
              <Route path="meetings" element={<MeetingsPage />} />
              <Route path="permissions" element={<RoleAccessManager />} />
            </Route>

            {/* Super Admin Group */}
            <Route
              path="super-admin"
              element={<ProtectedRoute allowedRoles={["super_admin"]} />}
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="orgs" element={<OrganizationsScreen />} />
              <Route path="roles" element={<MembersAndRoles />} />
              <Route path="roles/:orgId" element={<MembersAndRoles />} />
            </Route>
          </Route>
        </Route>

        {/* 404 - Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
} 

export default AppRoutes;
