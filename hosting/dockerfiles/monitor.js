const fs = require('fs');
const http = require('http');

const AQUANODE_WEBHOOK_ENDPOINT = process.env.AQUANODE_WEBHOOK_ENDPOINT || 'http://host.docker.internal:3080/monitoring/mem';
console.log(AQUANODE_WEBHOOK_ENDPOINT);
const DEPLOYMENT_ID = process.env.DEPLOYMENT_ID || 'default';
const INTERVAL_MS = 10_000;

function readFile(path) {
  try {
    return fs.readFileSync(path, 'utf8').trim();
  } catch (err) {
    console.error(`Error reading ${path}:`, err);
    return null;
  }
}

function sendContainerStats() {
  const memoryCurrent = parseInt(readFile('/sys/fs/cgroup/memory.current'));
  const memoryMax = parseInt(readFile('/sys/fs/cgroup/memory.max'));
  const cpuStatRaw = readFile('/sys/fs/cgroup/cpu.stat');

  // if (!memoryCurrent || !memoryMax || !cpuStatRaw) return;

  const cpuStat = Object.fromEntries(
    cpuStatRaw.split('\n').map(line => {
      const [key, val] = line.split(' ');
      return [key, parseInt(val)];
    })
  );
  console.log(cpuStat);

  const payload = JSON.stringify({
    deployment_id: DEPLOYMENT_ID,
    timestamp: new Date().toISOString(),
    memory: {
      current: memoryCurrent,
      max: memoryMax
    },
    cpu: {
      usage_usec: cpuStat.usage_usec,
      user_usec: cpuStat.user_usec,
      system_usec: cpuStat.system_usec,
      throttled_usec: cpuStat.throttled_usec,
      nr_throttled: cpuStat.nr_throttled,
      nr_periods: cpuStat.nr_periods
    }
  });

  console.log(`Sending stats to ${AQUANODE_WEBHOOK_ENDPOINT}`);
  console.log('Payload:', payload);

  const req = http.request(AQUANODE_WEBHOOK_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  });

  req.on('error', (err) => console.error('Request error:', err));
  req.write(payload);
  req.end();
}

// Call immediately on start
sendContainerStats();

// Then set up interval
setInterval(sendContainerStats, INTERVAL_MS);
console.log(`✅ Container resource monitor started with ${INTERVAL_MS}ms interval...`);
