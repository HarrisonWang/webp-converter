const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const iconv = require('iconv-lite');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  win.setMenu(null);  // 添加这一行来移除菜单栏

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 处理图像转换
ipcMain.on('convert-images', async (event, { inputDir, outputDir }) => {
  try {
    const actualOutputDir = outputDir || inputDir;

    if (!fs.existsSync(actualOutputDir)) {
      fs.mkdirSync(actualOutputDir, { recursive: true });
    }

    const files = await fs.promises.readdir(inputDir);

    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.jpg' || ext === '.jpeg' || ext === '.png';
    });

    let convertedCount = 0;

    for (const file of imageFiles) {
      const inputFilePath = path.join(inputDir, file);
      const outputFileName = path.basename(file, path.extname(file)) + '.webp';
      const outputFilePath = path.join(actualOutputDir, outputFileName);

      const ext = path.extname(file).toLowerCase();
      if (ext === '.png') {
        await sharp(inputFilePath)
          .webp({ lossless: true })
          .toFile(outputFilePath);
        console.log(iconv.decode(Buffer.from(`${file} (PNG) converted successfully to ${outputFileName}`), 'utf8'));
      } else if (ext === '.jpg' || ext === '.jpeg') {
        await sharp(inputFilePath)
          .webp({ quality: 80 })
          .toFile(outputFilePath);
        console.log(iconv.decode(Buffer.from(`${file} (JPG) converted successfully to ${outputFileName}`), 'utf8'));
      }

      convertedCount++;
      event.reply('conversion-progress', {
        current: convertedCount,
        total: imageFiles.length
      });
    }

    event.reply('conversion-complete', '图像转换完成');
  } catch (err) {
    console.error('转换过程中出错:', err);
    event.reply('conversion-error', err.message);
  }
});

// 处理选择目录
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});
