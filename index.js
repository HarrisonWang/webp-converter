import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// 输入目录路径
const inputDir = "E:/Projects/ruby/voxsay.com/img";
// 输出目录路径
const outputDir = "E:/Projects/ruby/voxsay.com/img";

// 确定实际的输出目录
const actualOutputDir = outputDir.trim() === '' ? inputDir : outputDir;

// 确保输出目录存在
if (!fs.existsSync(actualOutputDir)) {
  fs.mkdirSync(actualOutputDir, { recursive: true });
}

// 读取目录中的所有文件
fs.readdir(inputDir, (err, files) => {
  if (err) {
    return console.error('无法读取目录:', err);
  }

  // 过滤出 JPG 和 PNG 文件
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ext === '.jpg' || ext === '.jpeg' || ext === '.png';
  });

  // 遍历并将每个文件转换为 WebP
  imageFiles.forEach(file => {
    const inputFilePath = path.join(inputDir, file);
    const outputFileName = path.basename(file, path.extname(file)) + '.webp';
    const outputFilePath = path.join(actualOutputDir, outputFileName);

    // 处理 PNG 和 JPG 文件的不同情况
    const ext = path.extname(file).toLowerCase();
    if (ext === '.png') {
      // 如果是 PNG 文件，保留透明度
      sharp(inputFilePath)
        .webp({ lossless: true })  // 保留透明背景，使用无损压缩
        .toFile(outputFilePath)
        .then(info => {
          console.log(`${file} (PNG) 转换成功为 ${outputFileName}`);
        })
        .catch(err => {
          console.error(`转换 PNG 文件 ${file} 时出错:`, err);
        });
    } else if (ext === '.jpg' || ext === '.jpeg') {
      // 对于 JPG 文件，正常转换
      sharp(inputFilePath)
        .webp({ quality: 80 })  // 使用有损压缩，设置质量
        .toFile(outputFilePath)
        .then(info => {
          console.log(`${file} (JPG) 转换成功为 ${outputFileName}`);
        })
        .catch(err => {
          console.error(`转换 JPG 文件 ${file} 时出错:`, err);
        });
    }
  });
});
