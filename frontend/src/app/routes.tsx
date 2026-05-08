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
import AuthCallback from "./pages/AuthCallback";
import { RequireAuth } from "../lib/auth";

export const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/login", Component: Login },
  { path: "/auth/callback", Component: AuthCallback },
  {
    path: "/student",
    element: (
      <RequireAuth role="candidato">
        <StudentDashboard />
      </RequireAuth>
    ),
  },
  {
    path: "/profile-setup",
    element: (
      <RequireAuth role="candidato">
        <ProfileCreation />
      </RequireAuth>
    ),
  },
  {
    path: "/employer",
    element: (
      <RequireAuth role="reclutador">
        <EmployerDashboard />
      </RequireAuth>
    ),
  },
  {
    path: "/employer/create-job",
    element: (
      <RequireAuth role="reclutador">
        <CreateJobPosting />
      </RequireAuth>
    ),
  },
  {
    path: "/employer/vacancy/:vacancyId",
    element: (
      <RequireAuth role="reclutador">
        <VacancyDetails />
      </RequireAuth>
    ),
  },
  {
    path: "/employer/vacancy/:vacancyId/candidates",
    element: (
      <RequireAuth role="reclutador">
        <VacancyCandidates />
      </RequireAuth>
    ),
  },
  {
    path: "/employer/vacancy/:vacancyId/edit",
    element: (
      <RequireAuth role="reclutador">
        <EditVacancy />
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
