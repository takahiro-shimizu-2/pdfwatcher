const esbuild = require('esbuild');

async function build() {
  try {
    // Build background script
    await esbuild.build({
      entryPoints: ['src/background.ts'],
      bundle: true,
      outfile: 'dist/background.js',
      platform: 'browser',
      target: 'chrome91',
      format: 'iife',
      sourcemap: false,
    });

    // Build content script
    await esbuild.build({
      entryPoints: ['src/content.ts'],
      bundle: true,
      outfile: 'dist/content.js',
      platform: 'browser',
      target: 'chrome91',
      format: 'iife',
      sourcemap: false,
    });

    // Build popup script
    await esbuild.build({
      entryPoints: ['src/popup.ts'],
      bundle: true,
      outfile: 'dist/popup.js',
      platform: 'browser',
      target: 'chrome91',
      format: 'iife',
      sourcemap: false,
    });

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();