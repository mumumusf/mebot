const { execSync, spawn } = require('child_process');
const os = require('os');

// 检查系统类型和包管理器
function getSystemInfo() {
    const platform = os.platform();
    let packageManager = '';
    let isRoot = process.getuid && process.getuid() === 0;

    if (platform === 'linux') {
        try {
            // 检查是否有apt
            execSync('which apt', { stdio: 'ignore' });
            packageManager = 'apt';
        } catch {
            try {
                // 检查是否有yum
                execSync('which yum', { stdio: 'ignore' });
                packageManager = 'yum';
            } catch {
                console.error('[错误] 不支持的Linux发行版，目前只支持基于Debian和RHEL的系统');
                process.exit(1);
            }
        }
    } else if (platform === 'win32') {
        console.log('[系统] Windows系统不需要安装额外的Chrome依赖');
        return null;
    } else {
        console.error('[错误] 不支持的操作系统');
        process.exit(1);
    }

    return { packageManager, isRoot };
}

// 定义不同包管理器的依赖列表
const dependencies = {
    apt: [
        'ca-certificates',
        'fonts-liberation',
        'libasound2',
        'libatk-bridge2.0-0',
        'libatk1.0-0',
        'libatspi2.0-0',
        'libc6',
        'libcairo2',
        'libcups2',
        'libdbus-1-3',
        'libdrm2',
        'libexpat1',
        'libgbm1',
        'libglib2.0-0',
        'libnspr4',
        'libnss3',
        'libpango-1.0-0',
        'libpangocairo-1.0-0',
        'libx11-6',
        'libx11-xcb1',
        'libxcb1',
        'libxcomposite1',
        'libxdamage1',
        'libxext6',
        'libxfixes3',
        'libxkbcommon0',
        'libxrandr2',
        'wget',
        'xdg-utils'
    ],
    yum: [
        'ca-certificates',
        'liberation-fonts',
        'alsa-lib',
        'at-spi2-atk',
        'at-spi2-core',
        'atk',
        'cups-libs',
        'dbus-libs',
        'expat',
        'mesa-libgbm',
        'glib2',
        'nspr',
        'nss',
        'pango',
        'xorg-x11-libs',
        'libX11',
        'libXcomposite',
        'libXdamage',
        'libXext',
        'libXfixes',
        'libXrandr',
        'wget',
        'xdg-utils'
    ]
};

// 检查依赖是否已安装
function checkDependency(dep, packageManager) {
    try {
        if (packageManager === 'apt') {
            execSync(`dpkg -l ${dep} | grep -E '^ii'`, { stdio: 'ignore' });
        } else if (packageManager === 'yum') {
            execSync(`rpm -q ${dep}`, { stdio: 'ignore' });
        }
        return true;
    } catch {
        return false;
    }
}

// 安装缺失的依赖
async function installDependencies(packageManager, isRoot) {
    console.log('[依赖] 正在检查Chrome依赖...');
    
    const missingDeps = dependencies[packageManager].filter(
        dep => !checkDependency(dep, packageManager)
    );

    if (missingDeps.length === 0) {
        console.log('[依赖] 所有Chrome依赖已安装完成');
        return;
    }

    console.log('[依赖] 需要安装以下组件:', missingDeps.join(', '));

    const sudo = isRoot ? '' : 'sudo';
    const updateCmd = packageManager === 'apt' ? 'apt-get update' : 'yum check-update';
    const installCmd = packageManager === 'apt' ? 'apt-get install -y' : 'yum install -y';

    try {
        // 更新包管理器
        console.log('[系统] 正在更新系统包管理器...');
        execSync(`${sudo} ${updateCmd}`, { stdio: 'inherit' });

        // 安装依赖
        console.log('[依赖] 正在安装缺失组件...');
        execSync(`${sudo} ${installCmd} ${missingDeps.join(' ')}`, { stdio: 'inherit' });

        console.log('[依赖] Chrome依赖安装完成');
    } catch (error) {
        console.error('[错误] 安装依赖时出错:', error.message);
        process.exit(1);
    }
}

// 主函数
async function main() {
    const systemInfo = getSystemInfo();
    if (systemInfo) {
        await installDependencies(systemInfo.packageManager, systemInfo.isRoot);
    }
}

module.exports = main;

// 如果直接运行此文件
if (require.main === module) {
    main(); 