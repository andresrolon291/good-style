const { spawn } = require('child_process');
const net = require('net');

function findAvailablePort(startPort, maxAttempts = 20) {
  return new Promise((resolve, reject) => {
    const tryPort = (port, attempt) => {
      const server = net.createServer();
      server.once('error', (error) => {
        if (error.code === 'EADDRINUSE' && attempt < maxAttempts) {
          tryPort(port + 1, attempt + 1);
        } else {
          reject(error);
        }
      });

      server.once('listening', () => {
        server.close(() => resolve(port));
      });

      server.listen(port, '0.0.0.0');
    };

    tryPort(startPort, 1);
  });
}

async function main() {
  const mode = process.argv[2] === 'start' ? 'start' : 'dev';
  const preferredPort = Number(process.env.PORT || 3002);
  const port = await findAvailablePort(preferredPort);
  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const args = ['next', mode, '--hostname', '0.0.0.0', '--port', String(port)];

  console.log(`Starting Next.js in ${mode} mode on port ${port}`);

  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
  });

  child.on('exit', (code) => process.exit(code ?? 0));
}

main().catch((error) => {
  console.error('Unable to start Next.js:', error);
  process.exit(1);
});
