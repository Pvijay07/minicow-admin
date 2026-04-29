import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getMessaging, onBackgroundMessage } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";

const app = initializeApp({
  apiKey: "AIzaSyBG-sX-I3LMqhcvkbeuCRgZ3e6sYAGFc0c",
  authDomain: "petsfolio-2204f.firebaseapp.com",
  projectId: "petsfolio-2204f",
  messagingSenderId: "941943976685",
  appId: "1:941943976685:android:192ab6431be79e222812e4",
});

const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log("Background message received:", payload);
  
  const { title, body } = payload.notification || {};
  self.registration.showNotification(
    title || "Support Message", 
    {
      body: body || "You received a new message in your support ticket.",
      icon: "/favicon.ico",
      tag: 'support-chat'
    }
  );
});
