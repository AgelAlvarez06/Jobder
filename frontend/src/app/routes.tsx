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
    Component: StudentDashboard,
  },
  {
    path: "/employer",
    Component: EmployerDashboard,
  },
  {
    path: "/employer/create-job",
    Component: CreateJobPosting,
  },
  {
    path: "/employer/vacancy/:vacancyId",
    Component: VacancyDetails,
  },
  {
    path: "/employer/vacancy/:vacancyId/candidates",
    Component: VacancyCandidates,
  },
  {
    path: "/employer/vacancy/:vacancyId/edit",
    Component: EditVacancy,
  },
  {
    path: "/profile-setup",
    Component: ProfileCreation,
  },
  {
    path: "/chat/:matchId",
    Component: ChatInterface,
  },
]);