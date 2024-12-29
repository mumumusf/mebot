/**
 * 浏览器自动化脚本
 * 
 * 作者: 小林
 * Twitter: @YOYOMYOYOA (https://x.com/YOYOMYOYOA)
 * 版本: v1.0
 * 
 * 功能:
 * - 支持代理服务器
 * - 支持Chrome插件安装和使用
 * - 自动错误恢复和重启
 * - 支持远程调试
 * - 可在VPS上长期运行
 * - 自动下载和配置Chrome浏览器
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { HttpsProxyAgent } = require('https-proxy-agent');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

// 使用 Stealth 插件来避免被检测
puppeteer.use(StealthPlugin());

// 状态提示函数
function showStatus(message, isError = false) {
    const timestamp = new Date().toLocaleString();
    const prefix = isError ? '❌ 错误' : '✅ 信息';
    console.log(`[${timestamp}] ${prefix}: ${message}`);
}

// Chrome下载和安装
async function setupChrome() {
    const chromePath = path.join(__dirname, 'chrome-linux');
    const chromeExecutable = path.join(chromePath, 'chrome');

    // 如果Chrome已经存在，直接返回路径
    if (fs.existsSync(chromeExecutable)) {
        showStatus('Chrome已存在，跳过下载');
        return chromeExecutable;
    }

    showStatus('开始下载Chrome浏览器...');
    
    // 下载Chrome
    const downloadUrl = 'https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/1002410/chrome-linux.zip';
    const zipPath = path.join(__dirname, 'chrome-linux.zip');

    try {
        await new Promise((resolve, reject) => {
            const file = fs.createWriteStream(zipPath);
            let downloadedBytes = 0;
            
            https.get(downloadUrl, (response) => {
                const totalBytes = parseInt(response.headers['content-length'], 10);
                
                response.on('data', (chunk) => {
                    downloadedBytes += chunk.length;
                    const progress = ((downloadedBytes / totalBytes) * 100).toFixed(2);
                    process.stdout.write(`\r下载进度: ${progress}% (${(downloadedBytes/1024/1024).toFixed(2)}MB/${(totalBytes/1024/1024).toFixed(2)}MB)`);
                });
                
                response.pipe(file);
                file.on('finish', () => {
                    process.stdout.write('\n');
                    file.close();
                    resolve();
                });
            }).on('error', reject);
        });

        showStatus('Chrome下载完成，开始解压...');
        execSync(`unzip -o ${zipPath} -d ${__dirname}`);
        showStatus('Chrome解压完成');
        
        // 设置执行权限
        execSync(`chmod +x ${chromeExecutable}`);
        showStatus('Chrome权限设置完成');
        
        // 清理zip文件
        fs.unlinkSync(zipPath);
        showStatus('清理临时文件完成');

        return chromeExecutable;
    } catch (error) {
        showStatus(`Chrome安装失败: ${error.message}`, true);
        throw error;
    }
}

async function createBrowser(proxyServer = '') {
    showStatus('正在初始化浏览器配置...');
    
    const options = {
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--window-size=1920,1080',
            '--start-maximized',
            '--enable-extensions',
            '--disable-extensions-http-throttling',
            '--remote-debugging-port=9222',
            '--remote-debugging-address=0.0.0.0',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--single-process'
        ],
        ignoreDefaultArgs: ['--enable-automation']
    };

    // VPS模式配置
    if (process.env.VPS === 'true') {
        showStatus('VPS模式已启用');
        options.headless = 'new';
        try {
            const chromePath = await setupChrome();
            options.executablePath = chromePath;
            showStatus(`Chrome路径配置完成: ${chromePath}`);
        } catch (error) {
            showStatus('Chrome配置失败', true);
            throw error;
        }
    }

    // 代理服务器配置
    if (proxyServer) {
        showStatus(`正在配置代理服务器: ${proxyServer}`);
        options.args.push(`--proxy-server=${proxyServer}`);
    }

    try {
        showStatus('正在启动浏览器...');
        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();

        // 设置代理认证
        if (proxyServer) {
            await page.authenticate({
                username: 'OR873990528',
                password: '3de1fa1'
            });
            showStatus('代理认证配置完成');
        }

        // 设置视窗大小
        await page.setViewport({
            width: 1920,
            height: 1080
        });
        showStatus('浏览器视窗配置完成');

        // 监听浏览器事件
        browser.on('disconnected', () => {
            showStatus('浏览器已断开连接，准备重启...', true);
            setTimeout(startBrowser, 5000);
        });

        page.on('load', () => {
            showStatus(`页面加载完成: ${page.url()}`);
        });

        return { browser, page };
    } catch (error) {
        showStatus(`浏览器启动失败: ${error.message}`, true);
        throw error;
    }
}

async function startBrowser() {
    try {
        showStatus('启动自动化浏览器程序...');
        const proxyServer = 'http://208.196.127.126:6544';
        const { browser, page } = await createBrowser(proxyServer);
        
        showStatus('浏览器启动成功！');
        
        if (process.env.VPS === 'true') {
            showStatus('VPS远程访问信息：');
            showStatus('1. 在本地浏览器访问 http://your-vps-ip:9222');
            showStatus('2. 点击页面上的链接即可远程控制浏览器');
        } else {
            showStatus('本地模式运行中');
        }
        
        showStatus('正在打开Chrome网上应用店...');
        await page.goto('https://chrome.google.com/webstore/category/extensions');
        
        // 监控页面错误
        page.on('error', async (err) => {
            showStatus(`页面发生错误: ${err.message}`, true);
            await browser.close();
        });
        
        // 监控页面崩溃
        page.on('crash', async () => {
            showStatus('页面崩溃，准备重启...', true);
            await browser.close();
        });

        // 监控网络状态
        page.on('requestfailed', request => {
            showStatus(`请求失败: ${request.url()}`, true);
        });
        
    } catch (error) {
        showStatus(`启动失败: ${error.message}，5秒后重试`, true);
        setTimeout(startBrowser, 5000);
    }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    showStatus(`未捕获的异常: ${error.message}`, true);
    setTimeout(startBrowser, 5000);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason) => {
    showStatus(`未处理的Promise拒绝: ${reason}`, true);
    setTimeout(startBrowser, 5000);
});

// 处理进程退出
process.on('SIGINT', () => {
    showStatus('收到退出信号，正在关闭程序...');
    process.exit(0);
});

// 启动程序
showStatus('==================================');
showStatus('       浏览器自动化程序 v1.0      ');
showStatus('         作者: 小林              ');
showStatus('  Twitter: @YOYOMYOYOA          ');
showStatus('==================================');
startBrowser(); 