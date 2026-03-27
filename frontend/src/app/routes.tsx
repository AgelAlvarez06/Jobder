import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import StudentDashboard from "./pages/StudentDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import ProfileCreation from "./pages/ProfileCreation";
import ChatInterface from "./pages/ChatInterface";
import CreateJobPosting from "./pages/CreateJobPosting";
import VacancyDetails from "./pages/VacancyDetails";
import VacancyCandidates from "./pages/VacancyCandidates";
import EditVacancy from "./pages/EditVacancy";
import Login from "./pages/Login";
import { RequireAuth}  from "../lib/route-guard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/student",
    element: (
      <RequireAuth requiredRole="candidato">
        <StudentDashboard />
      </RequireAuth>
    ),
  },
  {
    path: "/employer",
    element: (
      <RequireAuth requiredRole="reclutador">
        <EmployerDashboard />
      </RequireAuth>
    ),
  },
  {
    path: "/employer/create-job",
    element: (
      <RequireAuth requiredRole="reclutador">
        <CreateJobPosting />
      </RequireAuth>
    ),
  },
  {
    path: "/employer/vacancy/:vacancyId",
    element: (
      <RequireAuth requiredRole="reclutador">
        <VacancyDetails />
      </RequireAuth>
    ),
  },
  {
    path: "/employer/vacancy/:vacancyId/candidates",
    element: (
      <RequireAuth requiredRole="reclutador">
        <VacancyCandidates />
      </RequireAuth>
    ),
  },
  {
    path: "/employer/vacancy/:vacancyId/edit",
    element: (
      <RequireAuth requiredRole="reclutador">
        <EditVacancy />
      </RequireAuth>
    ),
  },
  {
    path: "/profile-setup",
    element: (
      <RequireAuth>
        <ProfileCreation />
      </RequireAuth>
    ),
  },
  {
    path: "/chat/:matchId",
    element: (
      <RequireAuth>
        <ChatInterface />
      </RequireAuth>
    ),
  },
]);
