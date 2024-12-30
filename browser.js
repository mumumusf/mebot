/**
 * 浏览器自动化脚本
 * 作者: 小林 - @YOYOMYOYOA
 */

const puppeteer = require('puppeteer');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 代理配置文件路径
const PROXY_CONFIG_PATH = path.join(__dirname, 'proxy-config.json');

// 读取代理配置
function loadProxyConfig() {
    try {
        if (fs.existsSync(PROXY_CONFIG_PATH)) {
            const config = JSON.parse(fs.readFileSync(PROXY_CONFIG_PATH, 'utf8'));
            return config;
        }
    } catch (error) {
        console.error('读取代理配置失败:', error);
    }
    return null;
}

// 保存代理配置
function saveProxyConfig(config) {
    try {
        fs.writeFileSync(PROXY_CONFIG_PATH, JSON.stringify(config, null, 2));
        console.log('代理配置已保存');
    } catch (error) {
        console.error('保存代理配置失败:', error);
    }
}

// 交互式配置代理
async function configureProxy() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    try {
        console.log('\n=== 代理服务器配置 ===');
        
        // 检查是否有保存的配置
        const savedConfig = loadProxyConfig();
        if (savedConfig) {
            const useExisting = await question('检测到已保存的代理配置，是否使用？(y/n) ');
            if (useExisting.toLowerCase() === 'y') {
                rl.close();
                return savedConfig;
            }
        }

        const config = {
            server: await question('请输入代理服务器地址(例如: 127.0.0.1:8080): '),
            username: await question('请输入代理用户名: '),
            password: await question('请输入代理密码: ')
        };

        const save = await question('是否保存此配置？(y/n) ');
        if (save.toLowerCase() === 'y') {
            saveProxyConfig(config);
        }

        rl.close();
        return config;
    } catch (error) {
        rl.close();
        throw error;
    }
}

// 启动Xvfb
function startXvfb() {
    console.log('启动虚拟显示服务...');
    
    // 检查Xvfb是否已安装
    try {
        execSync('which Xvfb');
    } catch (error) {
        console.log('安装Xvfb和依赖...');
        execSync('sudo apt-get update && sudo apt-get install -y xvfb x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic x11-apps');
    }
    
    // 确保没有其他Xvfb实例在运行
    try {
        execSync('pkill -f "Xvfb :99"');
        execSync('rm -f /tmp/.X99-lock');
    } catch (error) {
        // 忽略错误
    }
    
    const xvfb = spawn('Xvfb', [
        ':99',
        '-screen', '0', '1920x1080x24',
        '-ac'
    ]);

    xvfb.stdout.on('data', (data) => {
        console.log(`Xvfb输出: ${data}`);
    });

    xvfb.stderr.on('data', (data) => {
        console.error(`Xvfb错误: ${data}`);
    });

    // 设置DISPLAY环境变量
    process.env.DISPLAY = ':99';
    
    return xvfb;
}

async function createBrowser(proxyConfig) {
    const userDataDir = path.join(__dirname, 'chrome-user-data');
    
    // 创建用户数据目录
    if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
    }

    const options = {
        headless: false,
        userDataDir: userDataDir,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--start-maximized',
            '--disable-infobars',
            '--window-size=1920,1080',
            '--disable-gpu',
            '--remote-debugging-port=9222',
            '--remote-debugging-address=0.0.0.0',
            '--disable-web-security'
        ],
        defaultViewport: null
    };

    // 添加代理服务器配置
    if (proxyConfig && proxyConfig.server) {
        options.args.push(`--proxy-server=http://${proxyConfig.server}`);
        console.log('已配置代理服务器:', proxyConfig.server);
    }

    // VPS环境使用系统Chrome
    if (process.env.VPS === 'true') {
        options.executablePath = '/usr/bin/google-chrome';
        console.log('使用系统Chrome');
    }

    console.log('启动Chrome浏览器...');
    const browser = await puppeteer.launch(options);
    console.log('Chrome浏览器启动成功');
    
    const page = await browser.newPage();
    console.log('创建新页面成功');

    // 设置代理认证
    if (proxyConfig && proxyConfig.username && proxyConfig.password) {
        await page.authenticate({
            username: proxyConfig.username,
            password: proxyConfig.password
        });
        console.log('设置代理认证完成');
    }

    // 设置用户代理
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // 打开Chrome商店
    console.log('正在打开Chrome商店...');
    try {
        await page.goto('https://chrome.google.com/webstore/category/extensions', {
            waitUntil: 'networkidle0',
            timeout: 60000
        });
        console.log('Chrome商店打开成功');
    } catch (error) {
        console.error('打开Chrome商店失败:', error);
    }
    
    return browser;
}

async function main() {
    let xvfbProcess = null;
    
    try {
        // 配置代理
        const proxyConfig = await configureProxy();
        
        // 在VPS环境下启动Xvfb
        if (process.env.VPS === 'true') {
            xvfbProcess = startXvfb();
            console.log('等待Xvfb启动...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        const browser = await createBrowser(proxyConfig);
        
        if (process.env.VPS === 'true') {
            console.log('\n远程访问说明:');
            console.log('1. 在本地浏览器访问 http://your-vps-ip:9222');
            console.log('2. 可以看到远程浏览器窗口\n');
        }
        
        // 保持程序运行
        await new Promise(() => {});
        
    } catch (error) {
        console.error('发生错误:', error);
        // 清理进程
        if (xvfbProcess) {
            xvfbProcess.kill();
        }
        // 5秒后重试
        setTimeout(main, 5000);
    }
}

// 启动程序
main(); 