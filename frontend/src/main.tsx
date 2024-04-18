import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import App from "./App";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { HashRouter, Route, Routes } from "react-router-dom";
import AppProvider from "./context/AppContext";

const container = document.getElementById("root");

const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <AppProvider>
      <HashRouter basename={"/"}>
        <Routes>
          <Route path="/" element={<App />} />
          {/* more... */}
        </Routes>
      </HashRouter>
    </AppProvider>
  </React.StrictMode>
);
