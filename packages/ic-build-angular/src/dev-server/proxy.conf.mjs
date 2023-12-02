import { promisify } from 'node:util';
import { exec } from 'node:child_process';

const execPromise = promisify(exec);

async function getWebServerPort() {
  const { stdout } = await execPromise('dfx info webserver-port');
  return stdout.trim();
}

const webServerPort = await getWebServerPort();

const proxyConfig = {
  '/api': {
    target: `http://127.0.0.1:${webServerPort}`,
    secure: false,
  },
};

export default proxyConfig;
