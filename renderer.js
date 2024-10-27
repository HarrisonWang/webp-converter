// 不需要使用 import 或 require

const inputDirButton = document.getElementById('inputDir');
const outputDirButton = document.getElementById('outputDir');
const convertBtn = document.getElementById('convertBtn');
const resultDiv = document.getElementById('result');
const inputDirPath = document.getElementById('inputDirPath');
const outputDirPath = document.getElementById('outputDirPath');

let inputDir = '';
let outputDir = '';

inputDirButton.addEventListener('click', async () => {
  inputDir = await window.electronAPI.selectDirectory();
  inputDirPath.value = inputDir || '';
});

outputDirButton.addEventListener('click', async () => {
  outputDir = await window.electronAPI.selectDirectory();
  outputDirPath.value = outputDir || '';
});

convertBtn.addEventListener('click', () => {
  if (!inputDir) {
    alert('请先选择输入目录！');
    return;
  }

  resultDiv.textContent = '转换中...';

  window.electronAPI.convertImages({ inputDir, outputDir });
});

window.electronAPI.onConversionProgress((event, { current, total }) => {
  resultDiv.textContent = `正在转换：${current}/${total}`;
});

window.electronAPI.onConversionComplete((event, message) => {
  resultDiv.textContent = message;
});

window.electronAPI.onConversionError((event, error) => {
  resultDiv.textContent = `错误：${error}`;
});
