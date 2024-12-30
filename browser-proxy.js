const puppeteer = require('puppeteer');
const readline = require('readline');
const { spawn } = require('child_process');
const setupChrome = require('./setup-chrome');

// 脚本信息
const SCRIPT_INFO = {
    author: '小林',
    twitter: '@YOYOMYOYOA',
    twitter_url: 'https://x.com/YOYOMYOYOA',
    version: '1.0.0'
};

// 打印启动信息
function printBanner() {
    console.log('\n=================================================');
    console.log('   远程浏览器代理自动化脚本');
    console.log(`   作者: ${SCRIPT_INFO.author}`);
    console.log(`   推特: ${SCRIPT_INFO.twitter}`);
    console.log(`   版本: ${SCRIPT_INFO.version}`);
    console.log('=================================================\n');
}

const DEFAULT_PROXY = '208.196.127.126:6544:OR873990528:3de1fa1';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function askForProxy() {
    console.log('\n[代理设置] 请选择代理模式:');
    return new Promise((resolve) => {
        rl.question('1. 使用默认代理\n2. 输入新代理\n请选择 (1/2): ', (answer) => {
            if (answer === '1') {
                console.log(`[代理设置] 使用默认代理: ${DEFAULT_PROXY}`);
                resolve(DEFAULT_PROXY);
            } else {
                rl.question('[代理设置] 请输入代理地址 (格式: ip:port:username:password): ', (proxy) => {
                    console.log(`[代理设置] 使用自定义代理: ${proxy}`);
                    resolve(proxy);
                });
            }
        });
    });
}

async function startBrowser(proxyString) {
    console.log('\n[浏览器] 正在启动Chrome浏览器...');
    const [host, port, username, password] = proxyString.split(':');
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
            `--proxy-server=${host}:${port}`,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--start-maximized'
        ]
    });

    console.log('[浏览器] Chrome启动成功');
    const page = await browser.newPage();

    console.log('[代理] 正在配置代理认证...');
    await page.authenticate({
        username: username,
        password: password
    });

    console.log('[代理] 正在测试代理连接...');
    try {
        await page.goto('https://api.ipify.org?format=json');
        const content = await page.content();
        console.log('[代理] 代理测试成功，当前IP地址:', content);
    } catch (error) {
        console.error('[错误] 代理连接失败:', error);
        await browser.close();
        process.exit(1);
    }

    return { browser, page };
}

async function startVNCServer() {
    console.log('\n[VNC] 正在启动VNC服务器...');
    require('./vnc-server');
    console.log('[VNC] VNC服务器启动成功');
}

async function main() {
    try {
        printBanner();
        
        console.log('[系统] 正在检查系统环境...');
        await setupChrome();
        
        await startVNCServer();
        console.log('[VNC] 远程访问地址: http://YOUR_SERVER_IP:6080/vnc.html');
        
        const proxyString = await askForProxy();
        
        const { browser, page } = await startBrowser(proxyString);
        
        console.log('\n[系统] 初始化完成，浏览器已准备就绪');
        console.log('[系统] 按 Ctrl+C 可以安全退出程序\n');
        
        process.on('SIGINT', async () => {
            console.log('\n[系统] 正在关闭浏览器...');
            await browser.close();
            console.log('[系统] 浏览器已关闭');
            console.log('[系统] 感谢使用！');
            process.exit();
        });
    } catch (error) {
        console.error('\n[错误] 发生严重错误:', error);
        process.exit(1);
    }
}

main(); 