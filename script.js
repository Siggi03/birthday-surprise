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

window.addEventListener("load", () => {
    document.body.classList.add("loaded");
});

const shouldSkip = sessionStorage.getItem("skipSlideshow");

window.selectGift = async function (gift) {

    const cards = document.querySelectorAll(".gift-card");

    try {
        await addDoc(collection(db, "giftSelections"), {
            selectedGift: gift,
            timestamp: new Date()
        });

        localStorage.setItem("selectedGift", gift);

        // Find clicked card
        let clickedCard = null;
        cards.forEach(card => {
            if (card.getAttribute("onclick").includes(gift)) {
                clickedCard = card;
            }
        });

        if (!clickedCard) return;

        // Find center position BEFORE changing to fixed
        const rect = clickedCard.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Explosion hearts
        for (let i = 0; i < 30; i++) {
            const heart = document.createElement("div");
            heart.classList.add("explosion-heart");
            heart.innerText = "❤";

            heart.style.left = centerX + "px";
            heart.style.top = centerY + "px";

            const angle = Math.random() * 2 * Math.PI;
            const distance = 150 + Math.random() * 200;

            const x = Math.cos(angle) * distance + "px";
            const y = Math.sin(angle) * distance + "px";

            heart.style.setProperty("--x", x);
            heart.style.setProperty("--y", y);

            document.body.appendChild(heart);

            setTimeout(() => heart.remove(), 1200);
        }

        // Explode card
        clickedCard.classList.add("exploding");

        setTimeout(() => {
            window.location.href = "success.html";
        }, 1600);

    } catch (error) {
        console.error("Error saving gift:", error);
    }
}
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

/* ===== GENERATE FLOATING HEARTS ===== */

const heartsContainer = document.querySelector(".hearts");

if (heartsContainer) {
    for (let i = 0; i < 20; i++) {
        const heart = document.createElement("div");
        heart.classList.add("heart");
        heart.innerText = "❤";

        heart.style.left = Math.random() * 100 + "vw";
        heart.style.fontSize = 15 + Math.random() * 20 + "px";
        heart.style.animationDuration = 8 + Math.random() * 8 + "s";
        heart.style.animationDelay = Math.random() * 5 + "s";

        heartsContainer.appendChild(heart);
    }
}

/* ============================= */
/* CLEAN TYPEWRITER SYSTEM */
/* ============================= */

function typeWriter(element, text, speed = 30) {
    return new Promise(resolve => {

        element.style.visibility = "visible";
        element.innerHTML = "";

        let i = 0;

        function typing() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(typing, speed);
            } else {
                resolve();
            }
        }

        typing();
    });
}

async function animateCardsText() {

    const cards = document.querySelectorAll(".gift-card");

    for (const card of cards) {

        const titleEl = card.querySelector("h3");
        const descEl = card.querySelector("p");

        const titleText = titleEl.textContent;
        const descText = descEl.textContent;

        // CLEAR BEFORE ANYTHING BECOMES VISIBLE
        titleEl.textContent = "";
        descEl.textContent = "";

        await typeWriter(titleEl, titleText, 100);
        await new Promise(r => setTimeout(r, 200));
        await typeWriter(descEl, descText, 70);

        await new Promise(r => setTimeout(r, 300));
    }

    // When all done, remove typing-mode completely
    document.body.classList.remove("typing-mode");
}

// Start typewriter automatically when page loads
window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        if (typeof animateCardsText === "function") {
            animateCardsText();
        }
    }, 300);
});

// Auto-load if on admin page
if (document.getElementById("adminPanel")) {
    loadSelections();
}

/* ============================= */
/* HANDLE BACK BUTTON (bfcache) */
/* ============================= */

window.addEventListener("pageshow", function (event) {

    // If page was loaded from cache
    if (event.persisted) {
        location.reload();
    }

});