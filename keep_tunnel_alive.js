const { spawn } = require('child_process');
const http = require('http');
const https = require('https');

const port = 2785;
const subdomain = 'campus-bites-wa-akash';
const url = `https://${subdomain}.loca.lt`;

let ltProcess = null;

function startTunnel() {
    console.log(`Starting localtunnel on port ${port} with subdomain ${subdomain}...`);
    ltProcess = spawn('npx', ['lt', '--port', port.toString(), '--subdomain', subdomain], { shell: true });

    ltProcess.stdout.on('data', (data) => {
        console.log(`[localtunnel] stdout: ${data.toString().trim()}`);
    });

    ltProcess.stderr.on('data', (data) => {
        console.error(`[localtunnel] stderr: ${data.toString().trim()}`);
    });

    ltProcess.on('close', (code) => {
        console.log(`[localtunnel] process exited with code ${code}. Restarting in 5 seconds...`);
        setTimeout(startTunnel, 5000);
    });
}

// Ping the tunnel every 30 seconds to keep it active
setInterval(() => {
    https.get(url, (res) => {
        // Just consume the response
        res.resume();
        console.log(`[keep-alive] Pinged tunnel: ${res.statusCode}`);
    }).on('error', (err) => {
        console.log(`[keep-alive] Ping failed: ${err.message}`);
    });
}, 30000);

startTunnel();
