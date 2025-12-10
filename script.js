// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Firebase config (from you)
const firebaseConfig = {
  apiKey: "AIzaSyBX2u1bzbjfTpHUajdvkisIW2HJXx27MBA",
  authDomain: "dustxord.firebaseapp.com",
  projectId: "dustxord",
  storageBucket: "dustxord.firebasestorage.app",
  messagingSenderId: "902221984172",
  appId: "1:902221984172:web:0890430f24ff501b5e0a09",
  measurementId: "G-KQ5EBJNN7S"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ImgBB API key
const IMGBB_API_KEY = "fffd7345879fe3b11b6620fd4f6cec56";

// Elements
const authCard = document.getElementById("auth");
const appUI = document.getElementById("app");
const userBox = document.getElementById("userBox");
const logoutBtn = document.getElementById("logoutBtn");
const messagesEl = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const fileInput = document.getElementById("fileInput");
const sendBtn = document.getElementById("sendBtn");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const googleBtn = document.getElementById("googleBtn");

// Auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    authCard.style.display = "none";
    appUI.style.display = "grid";
    userBox.innerHTML = `<strong>${user.email}</strong>`;
    subscribeMessages();
  } else {
    appUI.style.display = "none";
    authCard.style.display = "block";
    messagesEl.innerHTML = "";
  }
});

// Auth actions
loginBtn.onclick = () => signInWithEmailAndPassword(auth, emailEl.value, passwordEl.value);
signupBtn.onclick = () => createUserWithEmailAndPassword(auth, emailEl.value, passwordEl.value);
googleBtn.onclick = () => signInWithPopup(auth, new GoogleAuthProvider());
logoutBtn.onclick = () => signOut(auth);

// Subscribe to messages
function subscribeMessages() {
  const q = query(collection(db, "servers", "global", "channels", "general", "messages"), orderBy("createdAt"));
  onSnapshot(q, (snap) => {
    messagesEl.innerHTML = "";
    snap.forEach((doc) => {
      const m = doc.data();
      const div = document.createElement("div");
      div.className = "msg";
      div.innerHTML = `<strong>${m.username || "User"}:</strong> ${m.content || ""}`;
      if (m.imageUrl) {
        div.innerHTML += `<br><img src="${m.imageUrl}" alt="img">`;
      }
      messagesEl.appendChild(div);
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
}

// Send message
sendBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user) return alert("Sign in first.");
  const text = msgInput.value.trim();
  const file = fileInput.files[0];

  let imageUrl = null;
  if (file) {
    imageUrl = await uploadToImgBB(file);
  }

  await addDoc(collection(db, "servers", "global", "channels", "general", "messages"), {
    userId: user.uid,
    username: user.email,
    content: text,
    imageUrl,
    createdAt: serverTimestamp()
  });

  msgInput.value = "";
  fileInput.value = "";
};

// Upload to ImgBB
async function uploadToImgBB(file) {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData
  });
  const data = await res.json();
  return data.data.url;
}
