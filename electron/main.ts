import { app, BrowserWindow, screen, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';

const isDev = !app.isPackaged;

// --- Window State Management ---
const settingsPath = path.join(app.getPath('userData'), 'jeypass-settings.json');

interface StoreType {
  windowBounds?: { width: number; height: number; x?: number; y?: number };
}

function readWindowBounds(): StoreType['windowBounds'] {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf-8');
      const settings: StoreType = JSON.parse(data);
      return settings.windowBounds;
    }
  } catch (error) {
    console.error('Failed to read window bounds:', error);
  }
  return undefined;
}

function saveWindowBounds(bounds: { width: number; height: number; x: number; y: number }): void {
  try {
    const settings: StoreType = { windowBounds: bounds };
    fs.writeFileSync(settingsPath, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save window bounds:', error);
  }
}

let mainWindow: BrowserWindow | null = null;

const createWindow = (): void => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: displayWidth, height: displayHeight } = primaryDisplay.workAreaSize;

  const defaultSize = {
    width: 1200,
    height: 800,
  };

  let savedBounds: { width: number; height: number; x?: number; y?: number } | undefined = readWindowBounds();
  
  if (!savedBounds) {
    savedBounds = defaultSize;
  }

  // Center the window on the screen if it's the first launch
  let finalBounds: { width: number; height: number; x?: number; y?: number } = savedBounds;
  if (!finalBounds.x || !finalBounds.y) {
    finalBounds.x = Math.floor((displayWidth - finalBounds.width) / 2);
    finalBounds.y = Math.floor((displayHeight - finalBounds.height) / 2);
  }

  mainWindow = new BrowserWindow({
    ...finalBounds,
    minWidth: 800,
    minHeight: 600,
    frame: false, // Important for custom title bar
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, isDev ? '../../public/icons/icon.png' : '../public/icons/icon.png'),
    show: false, // Don't show the window until it's ready
  });

  // Gracefully show the window when it's ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });


  // Save window bounds on resize and move
  const handleBoundsChange = () => {
    if (mainWindow && !mainWindow.isMinimized()) {
      saveWindowBounds(mainWindow.getBounds());
    }
  };

  mainWindow.on('resize', handleBoundsChange);
  mainWindow.on('move', handleBoundsChange);


  const appUrl = isDev 
    ? 'http://localhost:9002' 
    : `file://${path.join(__dirname, '../index.html')}`;
  
  mainWindow.loadURL(appUrl);

  mainWindow.setMenu(null);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', (): void => {
    mainWindow = null;
  });

  // IPC listeners for window controls
  ipcMain.on('minimize-window', () => {
    mainWindow?.minimize();
  });

  ipcMain.on('maximize-window', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.on('close-window', () => {
    mainWindow?.close();
  });

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-maximized');
  });
  
  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-unmaximized');
  });

};

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    mainWindow?.show();
  }
});
