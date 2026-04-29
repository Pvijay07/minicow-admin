import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { requestForToken } from "./lib/firebase";

function Root() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('./firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
          requestForToken(registration);
        })
        .catch((err) => {
          console.error('Service Worker registration failed:', err);
          requestForToken(); // Fallback
        });
    } else {
      requestForToken();
    }
  }, []);

  return (
    <BrowserRouter basename="/admin.punganur">
      <StrictMode>
        <App />
      </StrictMode>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
