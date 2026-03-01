// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBjapiEXFJDnGEvE6pACzmMIb9B415WsU4",
    authDomain: "lykke-overraskelse.firebaseapp.com",
    projectId: "lykke-overraskelse",
    storageBucket: "lykke-overraskelse.firebasestorage.app",
    messagingSenderId: "867548081414",
    appId: "1:867548081414:web:5d82a0035dcc53b3d60287",
    measurementId: "G-PF6YN230YP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


window.selectGift = async function (gift) {
    try {
        await addDoc(collection(db, "giftSelections"), {
            selectedGift: gift,
            timestamp: new Date()
        });

        // Save locally
        localStorage.setItem("selectedGift", gift);

        // Redirect
        window.location.href = "success.html";

    } catch (error) {
        console.error("Error saving gift:", error);
    }
};

// SLIDESHOW LOGIC
const slides = document.querySelectorAll(".slide");
let currentSlide = 0;

function showNextSlide() {
    slides[currentSlide].classList.remove("active");
    currentSlide++;

    if (currentSlide >= slides.length) {
        endSlideshow();
        return;
    }

    slides[currentSlide].classList.add("active");
}

// Change image every 3 seconds
setInterval(showNextSlide, 2000);

// End slideshow and show main content
function endSlideshow() {
    const slideshow = document.getElementById("slideshow");
    const mainContent = document.getElementById("mainContent");

    slideshow.style.opacity = "0";
    slideshow.style.transition = "opacity 2s ease";

    setTimeout(() => {
        slideshow.style.display = "none";
        mainContent.classList.remove("hidden");
    }, 2000);
}

// ===== ADMIN LOGIN =====

const ADMIN_PASSWORD = "123"; // 👈 change this

window.checkPassword = async function () {
    const input = document.getElementById("adminPassword").value;
    const message = document.getElementById("loginMessage");

    if (input === ADMIN_PASSWORD) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("adminPanel").classList.remove("hidden");
        loadSelections();
    } else {
        message.innerText = "Wrong password 😅";
    }
};

// ===== LOAD DATA =====

async function loadSelections() {
    const resultsDiv = document.getElementById("results");
    const totalCount = document.getElementById("totalCount");
    const sortOrder = document.getElementById("sortSelect").value;

    resultsDiv.innerHTML = "";

    const q = query(
        collection(db, "giftSelections"),
        orderBy("timestamp", sortOrder)
    );

    const querySnapshot = await getDocs(q);

    totalCount.innerText = "Total: " + querySnapshot.size;

    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const entry = document.createElement("div");
        entry.classList.add("entry");

        const text = document.createElement("div");
        text.innerHTML = `
            <strong>${data.selectedGift}</strong><br>
            <small>${new Date(data.timestamp.seconds * 1000).toLocaleString()}</small>
        `;

        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Slet";
        deleteBtn.classList.add("delete-btn");

        deleteBtn.onclick = async () => {
            await deleteDoc(doc(db, "giftSelections", docSnap.id));
            loadSelections();
        };

        entry.appendChild(text);
        entry.appendChild(deleteBtn);

        resultsDiv.appendChild(entry);
    });
}
