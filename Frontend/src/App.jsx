import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";

import { Toaster } from "react-hot-toast"; // 1. Import karein
import API from "./api/axios";

import GlobalSocketWrapper from "./components/layout/GlobalSocketWrapper";
import { AccessProvider } from "./context/AccessContext";

export default function App() {

  const currentUserId = localStorage.getItem("user")?.id; // Example extract
  const activeChat = null;

  return (
    <>
      {/* 2. Toaster ko yahan rakhein */}
      <AccessProvider>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#18181b", // Dark theme ke liye
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
        />
      <GlobalSocketWrapper currentUserId={currentUserId} activeChat={activeChat}>
        <AppRoutes />
      </GlobalSocketWrapper>
        </AccessProvider>
    </>
  );
}
