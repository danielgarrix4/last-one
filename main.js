const { app, BrowserWindow, screen } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

const defaultBounds = { width: 1000, height: 563 };

function getWindowState(statePath) {
  try {
    const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
    const bounds = state.bounds;
    const hasValidBounds =
      bounds &&
      Number.isFinite(bounds.x) &&
      Number.isFinite(bounds.y) &&
      Number.isFinite(bounds.width) &&
      Number.isFinite(bounds.height) &&
      bounds.width > 0 &&
      bounds.height > 0;

    if (!hasValidBounds) {
      console.error("Saved window state has invalid bounds; using defaults.");
      return { bounds: defaultBounds };
    }

    return {
      bounds,
      isMaximized: state.isMaximized === true,
      isFullScreen: state.isFullScreen === true,
    };
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Unable to read saved window state:", error);
    }
    return { bounds: defaultBounds };
  }
}

function isOnConnectedDisplay(bounds) {
  return screen.getAllDisplays().some(({ workArea }) =>
    bounds.x < workArea.x + workArea.width &&
    bounds.x + bounds.width > workArea.x &&
    bounds.y < workArea.y + workArea.height &&
    bounds.y + bounds.height > workArea.y
  );
}

function createWindow() {
  const statePath = path.join(app.getPath("userData"), "window-state.json");
  const state = getWindowState(statePath);
  const bounds = { ...state.bounds };
  const shouldRestorePosition = Number.isFinite(bounds.x) &&
    Number.isFinite(bounds.y) &&
    isOnConnectedDisplay(bounds);

  const window = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    ...(shouldRestorePosition ? { x: bounds.x, y: bounds.y } : {}),
    backgroundColor: "#000000",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  let saveStateTimer;
  const persistWindowState = () => {
    const normalBounds = window.getNormalBounds();
    const savedState = {
      bounds: normalBounds,
      isMaximized: window.isMaximized(),
      isFullScreen: window.isFullScreen(),
    };

    try {
      fs.writeFileSync(statePath, JSON.stringify(savedState, null, 2));
    } catch (error) {
      console.error("Unable to save window state:", error);
    }
  };
  const scheduleStateSave = () => {
    clearTimeout(saveStateTimer);
    saveStateTimer = setTimeout(persistWindowState, 250);
  };

  ["resize", "move", "maximize", "unmaximize", "enter-full-screen", "leave-full-screen"]
    .forEach((event) => window.on(event, scheduleStateSave));
  window.on("close", () => {
    clearTimeout(saveStateTimer);
    persistWindowState();
  });

  if (state.isFullScreen) {
    window.setFullScreen(true);
  } else if (state.isMaximized) {
    window.maximize();
  }

  window.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
