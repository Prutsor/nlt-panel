const { app, BrowserWindow } = require('electron');
const path = require('path');

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			// preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	mainWindow.webContents.openDevTools();
	mainWindow.maximize();

	mainWindow.loadFile(path.join(__dirname, 'index.html'));
};

app.whenReady().then(() => {
	const window = createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
