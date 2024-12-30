const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const app = express();
const port = 6080;

// 设置 noVNC 客户端文件目录
app.use(express.static(path.join(__dirname, 'noVNC')));

// 下载并设置 noVNC
async function setupNoVNC() {
    if (!require('fs').existsSync(path.join(__dirname, 'noVNC'))) {
        console.log('正在下载并设置 noVNC...');
        await new Promise((resolve, reject) => {
            const git = spawn('git', ['clone', 'https://github.com/novnc/noVNC.git']);
            git.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Git clone failed with code ${code}`));
            });
        });
    }
}

// 启动 VNC 服务器
function startVNCServer() {
    // 在 Windows 上使用 TightVNC，在 Linux 上使用 x11vnc
    const isWindows = process.platform === 'win32';
    if (isWindows) {
        // 假设已安装 TightVNC
        spawn('tvnserver', ['-controlservice', 'start']);
    } else {
        // 对于 Linux，需要先安装 x11vnc
        spawn('x11vnc', ['-display', ':0', '-forever', '-shared', '-rfbport', '5900']);
    }
}

// 启动 WebSocket 代理
const wsServer = new WebSocket.Server({ port: 6081 });
wsServer.on('connection', (ws) => {
    const vncSocket = new WebSocket('ws://localhost:5900');
    
    ws.on('message', (message) => {
        vncSocket.send(message);
    });
    
    vncSocket.on('message', (message) => {
        ws.send(message);
    });
});

async function main() {
    try {
        await setupNoVNC();
        startVNCServer();
        
        app.listen(port, () => {
            console.log(`noVNC 服务器运行在 http://localhost:${port}/vnc.html`);
        });
    } catch (error) {
        console.error('启动失败:', error);
        process.exit(1);
    }
}

main(); 