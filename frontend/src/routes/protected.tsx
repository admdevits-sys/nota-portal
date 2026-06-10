import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
}

