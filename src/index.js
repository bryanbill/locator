import { init, filterTool } from "./ol";

let isMenuOpen = false;

const menuControl = () => {
    const menuBtn = document.getElementById("menu");
    const controls = document.getElementById("controls");

    const icon = menuBtn.children[0];

    menuBtn.addEventListener("click", (e) => {
        e.preventDefault();
        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            controls.classList.remove("hidden");
            controls.classList.remove("animate-out");
            icon.classList.remove("fa-bars");
            icon.classList.add("fa-times");
        } else {
            controls.classList.add("animate-out");
            setTimeout(() => {
                controls.classList.add("hidden");
                icon.classList.remove("fa-times");
                icon.classList.add("fa-bars");
            }, 500);
        }
    });
}

window.onload = () => {
    init();
    filterTool();
    menuControl();
}
