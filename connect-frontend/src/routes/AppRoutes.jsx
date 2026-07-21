import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";


import Landing from "../pages/Landing";
// Auth Pages
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

// Student Pages
import Feed from "../pages/student/Dashboard/Feed";
import Networking from "../pages/student/Dashboard/Networking";
import StudentConnections from "../pages/student/Dashboard/Connections";
import Academics from "../pages/student/Dashboard/Academics";
import Messages from "../pages/student/Dashboard/Messages";
import StudentProfile from "../pages/student/Profile";
import AlumniProfile from "../pages/student/AlumniProfile";
import CourseDetail from "../pages/student/CourseDetails";
import SessionWorkshopDetails from "../pages/student/SessionWorkshopDetails";
import MyLearning from "../pages/student/MyLearning";
import MembershipAlumni from "../pages/student/MembershipAlumni";
import AlumniItemDetail from "../pages/alumni/Dashboard/ItemDetail";
import CareerPath from "../pages/student/Dashboard/CareerPath";
import P2PDashboard from "../pages/student/P2PDashboard";

// Alumni Pages
import AlumniFeed from "../pages/alumni/Dashboard/Feed";
import AlumniMessages from "../pages/alumni/Dashboard/Messages";
import MyPosts from "../pages/alumni/Dashboard/MyPosts";
import ConnectionRequests from "../pages/alumni/Dashboard/ConnectionRequests";
import AlumniConnections from "../pages/alumni/Dashboard/Connections";
import Sessions from "../pages/alumni/Dashboard/Sessions";
import Earnings from "../pages/alumni/Dashboard/Earnings";
import AlumniMembershipPage from "../pages/alumni/Dashboard/Membership";
import AlumniProfilePage from "../pages/alumni/Profile";

// Admin Pages
import AdminDashboard from "../pages/admin/Dashboard";
import Users from "../pages/admin/Users";
import Courses from "../pages/admin/Courses";
import SessionsAdmin from "../pages/admin/Sessions";
import Analytics from "../pages/admin/Analytics";
import AdminProfile from "../pages/admin/Profile";
import SkillGapDashboard from "../pages/SkillGapDashboard"

// Live Class
import LiveClass from "../pages/common/LiveClass";

// 404
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <Routes>
      {/* 🔓 Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* 🔐 Student Routes */}
      <Route
        path="/skill-gap"
        element={
          <ProtectedRoute>
            <SkillGapDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/career-path"
        element={
          <ProtectedRoute>
            <CareerPath />
          </ProtectedRoute>
        }
      />

      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        }
      />

      <Route
        path="/networking"
        element={
          <ProtectedRoute>
            <Networking />
          </ProtectedRoute>
        }
      />

      <Route
        path="/connections"
        element={
          <ProtectedRoute>
            <StudentConnections />
          </ProtectedRoute>
        }
      />

      <Route
        path="/academics"
        element={
          <ProtectedRoute>
            <Academics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <StudentProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/alumni-profile"
        element={
          <ProtectedRoute>
            <AlumniProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/course-detail"
        element={
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/session-workshop-detail"
        element={
          <ProtectedRoute>
            <SessionWorkshopDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-learning"
        element={
          <ProtectedRoute>
            <MyLearning />
          </ProtectedRoute>
        }
      />

      <Route
        path="/p2p-dashboard"
        element={
          <ProtectedRoute>
            <P2PDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/membership-alumni"
        element={
          <ProtectedRoute>
            <MembershipAlumni />
          </ProtectedRoute>
        }
      />

      <Route
        path="/alumni/dashboard/item-detail"
        element={
          <ProtectedRoute>
            <AlumniItemDetail />
          </ProtectedRoute>
        }
      />

      {/* Alumni */}
      <Route
        path="/alumni/dashboard/feed"
        element={
          <ProtectedRoute>
            <AlumniFeed />
          </ProtectedRoute>
        }
      />

      <Route
        path="/alumni/dashboard/my-posts"
        element={
          <ProtectedRoute>
            <MyPosts />
          </ProtectedRoute>
        }
      />

      <Route
        path="/alumni/dashboard/messages"
        element={
          <ProtectedRoute>
            <AlumniMessages />
          </ProtectedRoute>
        }
      />

      <Route
        path="/alumni/dashboard/connection-requests"
        element={
          <ProtectedRoute>
            <ConnectionRequests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/alumni/dashboard/connections"
        element={
          <ProtectedRoute>
            <AlumniConnections />
          </ProtectedRoute>
        }
      />

      <Route
        path="/alumni/dashboard/sessions"
        element={
          <ProtectedRoute>
            <Sessions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/alumni/dashboard/earnings"
        element={
          <ProtectedRoute>
            <Earnings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/alumni/dashboard/membership"
        element={
          <ProtectedRoute>
            <AlumniMembershipPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/alumni/profile"
        element={
          <ProtectedRoute>
            <AlumniProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/admin/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
      <Route path="/admin/sessions" element={<ProtectedRoute><SessionsAdmin /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />

      {/* Live Class */}
      <Route
        path="/live/:id"
        element={
          <ProtectedRoute>
            <LiveClass />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;