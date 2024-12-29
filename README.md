# 浏览器自动化脚本使用教程

这是一个支持代理和插件的浏览器自动化脚本，可以在本地或VPS上运行。脚本会自动下载和配置Chrome浏览器。

## 作者信息

- 作者: 小林
- Twitter: [@YOYOMYOYOA](https://x.com/YOYOMYOYOA)

## 功能特点

- 支持代理服务器
- 支持Chrome插件安装和使用
- 自动错误恢复和重启
- 支持远程调试
- 可在VPS上长期运行
- 自动下载和配置Chrome浏览器

## 安装步骤

### 1. 本地运行

需要安装以下软件：
- Node.js (建议版本 14+)
- unzip (用于解压Chrome)

```bash
# 克隆项目后进入目录
cd browser-automation

# 安装依赖
npm install
```

### 2. VPS运行

在Ubuntu/Debian系统上：

```bash
# 更新系统
sudo apt update

# 安装 Node.js 和 npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# 安装unzip（用于解压Chrome）
sudo apt install -y unzip

# 安装项目依赖
cd browser-automation
npm install
```

## 使用方法

### 1. 本地运行

```bash
# 直接运行
node browser.js
```

### 2. VPS运行

```bash
# 方法1：使用 screen（推荐）
sudo apt install screen
screen -S browser
VPS=true node browser.js
# 按 Ctrl+A+D 分离会话

# 方法2：使用 pm2
npm install -g pm2
pm2 start browser.js --name "browser-automation" --env VPS=true
```

### 3. 远程访问（VPS模式）

1. 确保VPS的9222端口已开放
2. 在本地浏览器访问：`http://你的VPS-IP:9222`
3. 点击页面上的链接即可远程控制浏览器

## 自动Chrome下载说明

- 首次运行时，脚本会自动下载Chrome浏览器（约100MB）
- Chrome会被下载到脚本目录下的 `chrome-linux` 文件夹中
- 下载完成后会自动解压并设置正确的权限
- 后续运行时会复用已下载的Chrome，不会重复下载

## 常用命令

```bash
# Screen 相关命令
screen -ls                    # 查看所有会话
screen -r browser            # 恢复到 browser 会话
screen -X -S browser quit    # 终止 browser 会话

# PM2 相关命令
pm2 status                   # 查看运行状态
pm2 logs browser-automation  # 查看日志
pm2 stop browser-automation  # 停止程序
pm2 restart browser-automation # 重启程序
```

## 配置说明

1. 代理设置：
   - 在 `browser.js` 中修改 `proxyServer` 变量
   - 格式：`http://IP:端口`
   - 如需认证，修改 `username` 和 `password`

2. VPS模式：
   - Chrome会自动下载和配置
   - 使用 `VPS=true` 环境变量启动

## 注意事项

1. VPS使用注意：
   - 确保有足够的磁盘空间（至少200MB用于Chrome）
   - 建议使用防火墙限制9222端口访问
   - 确保VPS内存至少2GB以上
   - 定期检查日志确保运行状态

2. 安全建议：
   - 不要将代理认证信息提交到代码仓库
   - 建议使用环境变量管理敏感信息
   - 定期更新依赖包

## 故障排除

1. 如果Chrome下载失败：
   - 检查网络连接
   - 确保有足够的磁盘空间
   - 检查 `chrome-linux` 目录权限

2. 如果代理连接失败：
   - 验证代理服务器是否可用
   - 检查代理认证信息是否正确
   - 确认代理服务器支持HTTPS

3. 远程访问问题：
   - 检查9222端口是否开放
   - 确认VPS防火墙设置
   - 验证VPS模式是否正确启用

## 更新日志

- 2023.11.xx：初始版本发布
  - 添加代理支持
  - 添加自动重启功能
  - 添加远程调试支持
  - 添加Chrome自动下载功能 