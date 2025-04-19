"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "./Navbar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="flex-grow">{children}</main>
    </AuthProvider>
  );
}
