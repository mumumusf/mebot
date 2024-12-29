#!/bin/bash

echo "开始安装浏览器自动化环境..."

# 更新系统
echo "正在更新系统..."
sudo apt update
sudo apt install -y curl wget git unzip

# 安装 Node.js
echo "正在安装 Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# 安装必要的系统依赖
echo "正在安装系统依赖..."
sudo apt install -y \
    xvfb \
    x11vnc \
    xauth \
    dbus-x11 \
    libgtk-3-0 \
    libgbm1 \
    libnss3 \
    libasound2 \
    libxss1 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    libgtk2.0-0 \
    libgdk-pixbuf2.0-0

# 创建工作目录
echo "正在创建工作目录..."
WORK_DIR="$HOME/mebot"
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

# 清理旧的安装（如果存在）
echo "清理旧的安装..."
rm -rf package.json package-lock.json node_modules

# 初始化新的npm项目
echo "初始化新的npm项目..."
npm init -y

# 修改package.json
echo "配置package.json..."
node -e "
const pkg = require('./package.json');
pkg.name = 'mebot';
pkg.version = '1.0.0';
pkg.description = '浏览器自动化脚本';
pkg.main = 'browser.js';
pkg.author = '小林';
pkg.license = 'MIT';
require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2))
"

# 安装项目依赖
echo "安装项目依赖..."
npm install puppeteer-extra puppeteer-extra-plugin-stealth https-proxy-agent

# 创建browser.js文件
echo "创建browser.js文件..."
cat > "$WORK_DIR/browser.js" << 'EOL'
/**
 * 浏览器自动化脚本
 * 
 * 作者: 小林
 * Twitter: @YOYOMYOYOA (https://x.com/YOYOMYOYOA)
 * 版本: v1.0
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

[... 这里需要完整的browser.js内容 ...]
EOL

# 创建启动脚本
echo "创建启动脚本..."
cat > "$WORK_DIR/start.sh" << 'EOL'
#!/bin/bash

cd "$(dirname "$0")"  # 确保在脚本所在目录

# 停止现有进程
pkill chrome
pkill node
pkill Xvfb

# 清理旧的数据
rm -rf chrome-linux
rm -rf chrome-user-data

# 设置显示变量
export DISPLAY=:99

# 启动Xvfb
Xvfb :99 -screen 0 1920x1080x24 > /dev/null 2>&1 &

# 等待Xvfb启动
sleep 2

# 启动dbus
if [ ! -e /var/run/dbus/system_bus_socket ]; then
    dbus-daemon --system --fork
fi

# 启动程序
VPS=true node browser.js
EOL

chmod +x "$WORK_DIR/start.sh"

# 安装screen
echo "安装screen..."
sudo apt install -y screen

# 创建快捷命令
echo "创建快捷命令..."
cat > "$HOME/.mebot_aliases" << EOL
alias startbot="cd $WORK_DIR && ./start.sh"
alias stopbot="pkill chrome; pkill node; pkill Xvfb"
alias restartbot="stopbot && sleep 2 && startbot"
EOL

# 添加到 .bashrc
if ! grep -q "source ~/.mebot_aliases" "$HOME/.bashrc"; then
    echo "source ~/.mebot_aliases" >> "$HOME/.bashrc"
fi

# 使别名立即生效
source "$HOME/.mebot_aliases"

echo "安装完成！"
echo "==================================="
echo "工作目录: $WORK_DIR"
echo "使用以下命令控制程序："
echo "  startbot   - 启动程序"
echo "  stopbot    - 停止程序"
echo "  restartbot - 重启程序"
echo ""
echo "提示："
echo "1. 使用screen运行（推荐）："
echo "   screen -S bot"
echo "   startbot"
echo "   (按Ctrl+A+D分离会话)"
echo ""
echo "2. 查看screen会话："
echo "   screen -ls"
echo ""
echo "3. 恢复screen会话："
echo "   screen -r bot"
echo "===================================" 