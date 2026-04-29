/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Channels from "./pages/Channels";
import Posts from "./pages/Posts";
import PostForm from "./pages/PostForm";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import ChannelForm from "./pages/ChannelForm";
import Profile from "./pages/Profile";
import ServiceRequests from "./pages/ServiceRequests";
import Services from "./pages/Services";
import Gallery from "./pages/Gallery";
import Support from "./pages/Support";
import TicketChat from "./pages/TicketChat";
import Users from "./pages/Users";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="channels" element={<Channels />} />
        <Route path="channels/new" element={<ChannelForm />} />
        <Route path="channels/edit/:id" element={<ChannelForm />} />
        <Route path="posts" element={<Posts />} />
        <Route path="posts/new" element={<PostForm />} />
        <Route path="posts/edit/:id" element={<PostForm />} />
        <Route path="reports" element={<Reports />} />
        <Route path="services" element={<ServiceRequests />} />
        <Route path="services-config" element={<Services />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="support" element={<Support />} />
        <Route path="support/:id" element={<TicketChat />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
