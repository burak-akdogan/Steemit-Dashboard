const { spawn, exec } = require('child_process');

// Helper to run a script and stream output
function runScript(label, script) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [script]);

    proc.stdout.on('data', data => process.stdout.write(`[${label}] ${data}`));
    proc.stderr.on('data', data => process.stderr.write(`[${label} ERROR] ${data}`));

    proc.on('close', code => {
      if (code === 0) {
        console.log(`[${label}] ✅ Done.\n`);
        resolve();
      } else {
        reject(new Error(`[${label}] ❌ Exited with code ${code}`));
      }
    });
  });
}

// Main execution flow
(async () => {
  try {
    console.log('🚀 Running data collection...\n');

    await runScript('Top_Transfers', 'Top_Transfers.js');
    await runScript('WhaleReport', 'whalereport.js');

    console.log('📡 Starting server...\n');

    const serverProcess = spawn('node', ['server.js']);
    serverProcess.stdout.on('data', data => process.stdout.write(`[Server] ${data}`));
    serverProcess.stderr.on('data', data => process.stderr.write(`[Server ERROR] ${data}`));

    setTimeout(async () => {
      const open = (await import('open')).default;
      open('http://localhost:3000');
    }, 2000);

  } catch (err) {
    console.error('❌ Startup failed:', err.message);
  }
})();
