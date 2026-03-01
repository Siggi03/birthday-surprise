const gift = localStorage.getItem("selectedGift");

document.getElementById("chosenGift").innerText = gift;

window.addEventListener("load", () => {
    document.body.classList.add("loaded");
});
// Confetti explosion
confetti({
    particleCount: 200,
    spread: 100,
    origin: { y: 0.6 }
});

// Extra burst
setTimeout(() => {
    confetti({
        particleCount: 150,
        spread: 120,
        origin: { y: 0.5 }
    });
}, 600);