import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBG-sX-I3LMqhcvkbeuCRgZ3e6sYAGFc0c",
  authDomain: "petsfolio-2204f.firebaseapp.com",
  projectId: "petsfolio-2204f",
  messagingSenderId: "941943976685",
  appId: "1:941943976685:android:192ab6431be79e222812e4",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async (registration?: ServiceWorkerRegistration) => {
  try {
    const currentToken = await getToken(messaging, { 
      vapidKey: 'BM3u_0lH_7-O1W7uY8P7x0I5r9v9m9R6X4l2S4e9p3v5u8_S0-Jv4K0B',
      serviceWorkerRegistration: registration
    });
    if (currentToken) {
      console.log('FCM Token:', currentToken);
      // Send this token to your server to save it
      localStorage.setItem('fcmToken', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      resolve(payload);
    });
  });
