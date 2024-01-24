import $ from "jquery";
import { set } from "ol/transform";

let isMenuOpen = false;

const menuControl = () => {
    $("#menu").on("click", (e) => {
        e.preventDefault();
        isMenuOpen = !isMenuOpen;

        if (!isMenuOpen) {
            setTimeout(() => {
                $("#controls").toggleClass("hidden");
            }, 500);
        } else {
            $("#controls").toggleClass("hidden");
        }

        $("#controls").toggleClass("animate-slide-out");
        $("#menu i").toggleClass("fa-bars");
        $("#menu i").toggleClass("fa-times");
    });

   
}

const dialog = (title, content) => {
    $("#title").html(title);
    $("#content").html(content);

    const dialog = $("#dialog");
    dialog.removeClass("hidden");
    dialog.removeClass("animate-pop-out");
    dialog.addClass("animate-pop-in");

    const close = $("#close");
    close.on("click", (e) => {
        e.preventDefault();
        dialog.removeClass("animate-pop-in");
        dialog.addClass("animate-pop-out");
        setTimeout(() => {
            dialog.addClass("hidden");
        }, 500);
    });
};

export { menuControl, dialog };