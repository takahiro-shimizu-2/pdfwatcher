const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配布に必要なファイル・フォルダ
const filesToInclude = [
  'manifest.json',
  'popup.html',
  'dist/background.js',
  'dist/content.js',
  'dist/popup.js',
  'assets/icon-16.png',
  'assets/icon-48.png',
  'assets/icon-128.png'
];

async function createDistribution() {
  const distDir = 'pdfwatcher-extension';
  const zipFile = 'pdfwatcher-extension.zip';

  // 既存のディレクトリを削除
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }

  // 配布用ディレクトリを作成
  fs.mkdirSync(distDir);
  fs.mkdirSync(path.join(distDir, 'dist'));
  fs.mkdirSync(path.join(distDir, 'assets'));

  // ファイルをコピー
  for (const file of filesToInclude) {
    const src = file;
    const dest = path.join(distDir, file);
    
    try {
      fs.copyFileSync(src, dest);
      console.log(`Copied: ${file}`);
    } catch (error) {
      console.error(`Failed to copy ${file}:`, error.message);
    }
  }

  // zipファイルを作成（ディレクトリ内から直接圧縮）
  try {
    execSync(`cd ${distDir} && zip -r ../${zipFile} .`);
    console.log(`\nCreated ${zipFile} successfully!`);
    
    // 配布用ディレクトリを削除（zipのみ残す）
    fs.rmSync(distDir, { recursive: true, force: true });
    
    console.log('\n配布方法:');
    console.log('1. pdfwatcher-extension.zip を関係者に送付');
    console.log('2. 受け取った人は zip を解凍');
    console.log('3. Chrome で chrome://extensions/ を開く');
    console.log('4. 開発者モードをONにする');
    console.log('5. 「パッケージ化されていない拡張機能を読み込む」をクリック');
    console.log('6. 解凍したフォルダを選択');
  } catch (error) {
    console.error('Failed to create zip:', error.message);
  }
}

// ビルドしてから配布ファイルを作成
console.log('Building extension...');
execSync('npm run build', { stdio: 'inherit' });

console.log('\nCreating distribution package...');
createDistribution();