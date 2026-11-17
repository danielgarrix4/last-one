const menu = document.querySelector("main");
const menuImage = document.querySelector("#menu-image");
const splashScreen = document.querySelector("#splash-screen");
const defaultMenuImage = "images/gui/menu.png";

function showMenuImage(image) {
  menuImage.src = image ? `images/gui/${image}` : defaultMenuImage;
}

function showMainMenu() {
  if (menu.dataset.screen === "menu") {
    return;
  }

  menu.dataset.screen = "menu";
}

const splashTimeout = window.setTimeout(showMainMenu, 3000);

splashScreen.addEventListener("pointerdown", () => {
  window.clearTimeout(splashTimeout);
  showMainMenu();
});

document.addEventListener("keydown", () => {
  window.clearTimeout(splashTimeout);
  showMainMenu();
}, { once: true });

menu.querySelectorAll("[data-menu-image]").forEach((option) => {
  option.addEventListener("pointerenter", () => {
    showMenuImage(option.dataset.menuImage);
  });

  option.addEventListener("focus", () => {
    showMenuImage(option.dataset.menuImage);
  });
});

menu.addEventListener("pointerleave", () => {
  showMenuImage();
});

menu.addEventListener("focusout", (event) => {
  if (!menu.contains(event.relatedTarget)) {
    showMenuImage();
  }
});
