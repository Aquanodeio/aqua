const fs = require('fs');
const http = require('http');
const https = require('https');

const AQUANODE_WEBHOOK_ENDPOINT = process.env.AQUANODE_WEBHOOK_ENDPOINT || 'http://host.docker.internal:8000/monitoring/mem';
const DEPLOYMENT_ID = process.env.DEPLOYMENT_ID || 'default';
const INTERVAL_MS = 10_000;

console.log('Starting container resource monitor...');
console.log('Webhook endpoint:', AQUANODE_WEBHOOK_ENDPOINT);
console.log('Deployment ID:', DEPLOYMENT_ID);
console.log('Interval:', INTERVAL_MS, 'ms');

function getProtocolModule(url) {
  return url.startsWith('https') ? https : http;
}

function readFile(path) {
  try {
    return fs.readFileSync(path, 'utf8').trim();
  } catch (err) {
    console.error(`Error reading ${path}:`, err);
    return null;
  }
}

function getCgroupVersion() {
  try {
    // Check if cgroup v2 is mounted
    fs.accessSync('/sys/fs/cgroup/cgroup.controllers');
    return 2;
  } catch (err) {
    return 1;
  }
}

function getMemoryStats(cgVersion) {
  if (cgVersion === 2) {
    const current = parseInt(readFile('/sys/fs/cgroup/memory.current'));
    const max = parseInt(readFile('/sys/fs/cgroup/memory.max'));
    return { current, max };
  } else {
    const usage = parseInt(readFile('/sys/fs/cgroup/memory/memory.usage_in_bytes'));
    const limit = parseInt(readFile('/sys/fs/cgroup/memory/memory.limit_in_bytes'));
    return { current: usage, max: limit };
  }
}

function getCpuStats(cgVersion) {
  if (cgVersion === 2) {
    const cpuStatRaw = readFile('/sys/fs/cgroup/cpu.stat');
    if (!cpuStatRaw) return null;

    return Object.fromEntries(
      cpuStatRaw.split('\n').map(line => {
        const [key, val] = line.split(' ');
        return [key, parseInt(val)];
      })
    );
  } else {
    const cpuacctUsage = parseInt(readFile('/sys/fs/cgroup/cpuacct/cpuacct.usage'));
    const cpuacctStat = readFile('/sys/fs/cgroup/cpuacct/cpuacct.stat');
    const throttlingData = readFile('/sys/fs/cgroup/cpu/cpu.stat');
    
    if (!cpuacctUsage || !cpuacctStat || !throttlingData) return null;

    const [userStr, systemStr] = cpuacctStat.split('\n');
    const userUsec = parseInt(userStr.split(' ')[1]) * 1000000;
    const systemUsec = parseInt(systemStr.split(' ')[1]) * 1000000;
    
    const throttleData = Object.fromEntries(
      throttlingData.split('\n').map(line => {
        const [key, val] = line.split(' ');
        return [key, parseInt(val)];
      })
    );

    return {
      usage_usec: cpuacctUsage / 1000,
      user_usec: userUsec,
      system_usec: systemUsec,
      nr_periods: throttleData.nr_periods,
      nr_throttled: throttleData.nr_throttled,
      throttled_usec: throttleData.throttled_time
    };
  }
}

function sendContainerStats() {
  console.log('\nCollecting container stats...');
  
  const cgVersion = getCgroupVersion();
  console.log('Detected cgroup version:', cgVersion);

  const memStats = getMemoryStats(cgVersion);
  const cpuStats = getCpuStats(cgVersion);

  if (!memStats || !cpuStats) {
    console.error('Failed to read one or more stats files');
    return;
  }

  console.log('Memory stats:', memStats);
  console.log('CPU stats:', cpuStats);

  const payload = JSON.stringify({
    deploymentId: DEPLOYMENT_ID,
    memoryCurrent: memStats.current,
    memoryMax: memStats.max,
    cpuStat: cpuStats
  });

  console.log('\nSending stats to webhook...');
  console.log('Payload:', payload);

  const urlModule = getProtocolModule(AQUANODE_WEBHOOK_ENDPOINT);
  const req = urlModule.request(AQUANODE_WEBHOOK_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    }
  }, (res) => {
    console.log('Response status:', res.statusCode);
    res.on('data', d => process.stdout.write(d));
  });

  req.on('error', (err) => {
    console.error('Request failed:', err);
  });

  req.write(payload);
  req.end();
}

// Call immediately on start
sendContainerStats();

// Then set up interval
setInterval(sendContainerStats, INTERVAL_MS);
console.log(`\n✅ Container resource monitor started with ${INTERVAL_MS}ms interval...`);
