# 远程浏览器脚本使用教程

这是一个可以在VPS上运行Chrome浏览器的脚本，支持代理和远程访问。

## 作者信息
- 作者: 小林
- Twitter: [@YOYOMYOYOA](https://twitter.com/YOYOMYOYOA)

## 功能特点
- 在VPS上运行Chrome浏览器
- 支持代理服务器
- 可以远程查看和控制浏览器
- 自动安装所需环境
- 支持VPS重启后自动运行
- 进程守护和错误自动重启

## 安装步骤（Ubuntu/Debian系统）

1. 安装Node.js：
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
```

2. 安装Chrome：
```bash
sudo apt update
sudo apt install -y google-chrome-stable
```

3. 安装项目依赖：
```bash
# 进入项目目录
cd browser-automation

# 安装依赖
npm install
```

## 使用方法（两种方式）

### 代理配置
脚本启动时会提示您配置代理服务器：
1. 首次运行时，需要输入以下信息：
   - 代理服务器地址（格式：ip:port）
   - 代理服务器用户名
   - 代理服务器密码

2. 配置会被保存在 `proxy-config.json` 文件中
3. 下次运行时可以选择使用已保存的配置
4. 如果要修改代理，选择不使用已保存配置即可重新输入

示例：
```bash
=== 代理服务器配置 ===
请输入代理服务器地址(例如: 127.0.0.1:8080): 11.22.33.44:8080
请输入代理用户名: myuser
请输入代理密码: mypass
是否保存此配置？(y/n) y
代理配置已保存
```

### 方式一：使用screen运行（临时）
1. 启动脚本：
```bash
# 安装screen（用于保持脚本运行）
sudo apt install -y screen

# 创建新的screen会话
screen -S browser

# 运行脚本
VPS=true node browser.js

# 按 Ctrl+A+D 分离会话（脚本会继续在后台运行）
```

2. 管理screen会话：
```bash
# 查看运行中的screen会话
screen -ls

# 恢复到browser会话
screen -r browser

# 停止所有相关进程
pkill chrome
pkill node
pkill Xvfb
```

### 方式二：使用pm2运行（永久，推荐）
1. 安装pm2：
```bash
# 安装pm2
sudo npm install -g pm2

# 启用pm2开机自启
pm2 startup

# 确保pm2命令可用
source ~/.bashrc
```

2. 启动脚本：
```bash
# 进入项目目录
cd browser-automation

# 启动脚本（带自动重启）
pm2 start browser.js --name "browser" --env VPS=true --max-memory-restart 1G --restart-delay 3000

# 保存pm2配置（确保重启后自动运行）
pm2 save
```

3. 管理脚本：
```bash
# 查看运行状态
pm2 status

# 查看日志
pm2 logs browser

# 查看详细信息
pm2 show browser

# 重启脚本
pm2 restart browser

# 停止脚本
pm2 stop browser

# 删除脚本
pm2 delete browser
```

4. pm2高级配置：
```bash
# 设置自动重启条件
pm2 start browser.js --name "browser" --env VPS=true \
  --max-memory-restart 1G \  # 内存超过1G时自动重启
  --restart-delay 3000 \     # 重启延迟3秒
  --max-restarts 10 \       # 最大重启次数
  --cron-restart "0 4 * * *" # 每天凌晨4点重启

# 监控CPU和内存使用
pm2 monit

# 设置日志轮转
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 远程访问
- 在本地浏览器中访问：`http://你的VPS-IP:9222`
- 点击链接即可看到远程浏览器窗口
- 建议使用SSH隧道进行安全访问：
```bash
# 在本地电脑运行
ssh -L 9222:localhost:9222 user@你的VPS-IP
# 然后访问：http://localhost:9222
```

## 常见问题

1. 如果无法访问远程浏览器：
```bash
# 检查端口是否开放
sudo ufw allow 9222

# 确保VPS防火墙允许9222端口
sudo iptables -A INPUT -p tcp --dport 9222 -j ACCEPT

# 检查Chrome是否正在运行
ps aux | grep chrome

# 检查9222端口是否在监听
netstat -tulpn | grep 9222
```

2. 如果脚本启动失败：
```bash
# 清理旧进程
sudo pkill -9 -f "Xvfb :99"
sudo pkill -9 -f chrome
sudo pkill -9 -f node
sudo rm -f /tmp/.X99-lock
sudo rm -f /tmp/.X11-unix/X99

# 检查系统资源
free -h
df -h
top

# 检查pm2日志
pm2 logs browser --lines 100

# 重新运行脚本
pm2 restart browser
```

3. 如果VPS重启后脚本没有自动运行：
```bash
# 重新配置pm2开机自启
pm2 unstartup
pm2 startup
pm2 save

# 检查pm2服务状态
systemctl status pm2-root
```

## 注意事项
1. VPS至少需要2GB内存
2. 确保VPS有足够的磁盘空间（至少1GB）
3. 建议使用Ubuntu 20.04或更新版本
4. 保持VPS网络稳定
5. 使用pm2运行时，重启VPS后脚本会自动启动
6. 建议定期检查pm2状态确保脚本正常运行
7. 定期清理Chrome缓存和日志文件：
```bash
# 清理Chrome缓存
rm -rf chrome-user-data/Default/Cache/*

# 清理pm2日志
pm2 flush
```
8. 为了安全，建议：
   - 使用SSH隧道访问远程浏览器
   - 定期更新系统和依赖包
   - 监控VPS资源使用情况
   - 设置pm2的自动重启策略 

## 高级使用技巧

### 1. 自动化配置脚本
创建一个 `setup-vps.sh` 文件来自动化配置环境：
```bash
#!/bin/bash

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础依赖
sudo apt install -y curl wget git build-essential

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# 安装Chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install -y ./google-chrome-stable_current_amd64.deb
rm google-chrome-stable_current_amd64.deb

# 安装pm2
sudo npm install -g pm2

# 克隆项目（如果需要）
git clone https://github.com/yourusername/browser-automation.git
cd browser-automation

# 安装项目依赖
npm install

# 配置pm2开机自启
pm2 startup
source ~/.bashrc

# 启动脚本
pm2 start browser.js --name "browser" --env VPS=true \
  --max-memory-restart 1G \
  --restart-delay 3000 \
  --max-restarts 10 \
  --cron-restart "0 4 * * *"

# 保存pm2配置
pm2 save

# 配置防火墙
sudo ufw allow 9222
sudo ufw allow 22

# 创建维护脚本
cat > maintenance.sh << 'EOF'
#!/bin/bash

# 清理Chrome缓存
rm -rf chrome-user-data/Default/Cache/*

# 清理pm2日志
pm2 flush

# 更新系统和依赖
sudo apt update && sudo apt upgrade -y
sudo npm update -g

# 重启服务
pm2 restart browser

# 检查服务状态
pm2 status
EOF

chmod +x maintenance.sh
```

### 2. 使用Docker部署
创建 `Dockerfile`:
```dockerfile
FROM ubuntu:20.04

# 避免交互式提示
ENV DEBIAN_FRONTEND=noninteractive

# 设置时区
ENV TZ=Asia/Shanghai

# 安装依赖
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    xvfb \
    nodejs \
    npm \
    google-chrome-stable

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY . .

# 安装项目依赖
RUN npm install

# 安装pm2
RUN npm install -g pm2

# 暴露端口
EXPOSE 9222

# 启动命令
CMD ["pm2-runtime", "browser.js", "--env", "VPS=true"]
```

创建 `docker-compose.yml`:
```yaml
version: '3'
services:
  browser:
    build: .
    ports:
      - "9222:9222"
    restart: always
    volumes:
      - ./chrome-user-data:/app/chrome-user-data
```

### 3. 监控和告警配置
1. 使用pm2-slack实现Slack通知：
```bash
# 安装pm2-slack
pm2 install pm2-slack

# 配置Slack Webhook
pm2 set pm2-slack:webhook https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

2. 使用pm2-telegram实现Telegram通知：
```bash
# 安装pm2-telegram
pm2 install pm2-telegram

# 配置Telegram Bot
pm2 set pm2-telegram:bot_token YOUR_BOT_TOKEN
pm2 set pm2-telegram:chat_id YOUR_CHAT_ID
```

3. 设置资源监控告警：
```bash
# 安装pm2-server-monit
pm2 install pm2-server-monit

# 配置告警阈值
pm2 set pm2-server-monit:cpu 80
pm2 set pm2-server-monit:memory 80
```

### 4. 自动备份配置
创建 `backup.sh`:
```bash
#!/bin/bash

# 设置备份目录
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# 备份Chrome用户数据
tar -czf $BACKUP_DIR/chrome-data-$(date +%Y%m%d).tar.gz chrome-user-data/

# 备份pm2配置
pm2 save
cp ~/.pm2/dump.pm2 $BACKUP_DIR/pm2-dump-$(date +%Y%m%d).pm2

# 保留最近7天的备份
find $BACKUP_DIR -type f -mtime +7 -delete
```

添加到crontab：
```bash
# 每天凌晨3点执行备份
0 3 * * * /path/to/backup.sh
```

### 5. 性能优化建议
1. 内存优化：
```bash
# 限制Chrome内存使用
export NODE_OPTIONS="--max-old-space-size=1024"

# 配置Chrome启动参数
--js-flags="--max-old-space-size=1024"
--memory-pressure-off
```

2. 磁盘优化：
```bash
# 设置日志轮转更激进的策略
pm2 set pm2-logrotate:max_size 5M
pm2 set pm2-logrotate:retain 3
pm2 set pm2-logrotate:compress true

# 定期清理系统日志
sudo journalctl --vacuum-time=3d
```

## 安全加固建议

1. 系统层面：
```bash
# 禁用密码登录，只允许密钥登录
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# 配置防火墙规则
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 9222/tcp
sudo ufw enable
```

2. 应用层面：
```bash
# 设置Chrome沙箱
--no-sandbox
--disable-dev-shm-usage

# 限制Chrome权限
--disable-gpu
--disable-software-rasterizer
```

3. 网络层面：
```bash
# 配置反向代理（Nginx）
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:9222;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # 基本认证
        auth_basic "Restricted Access";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }
}
```

## 常见错误代码和解决方案

| 错误代码 | 描述 | 解决方案 |
|---------|------|---------|
| ECONNREFUSED | 连接被拒绝 | 检查9222端口是否开放，Chrome是否运行 |
| ENOSPC | 磁盘空间不足 | 清理日志和缓存，扩展磁盘空间 |
| Error: Server terminated early | Xvfb异常退出 | 清理Xvfb进程和锁文件后重试 |
| Failed to launch browser | Chrome启动失败 | 检查Chrome安装和依赖是否完整 |

## 更新日志

### v1.0.0 (2024-01-20)
- 初始版本发布
- 支持基本的远程浏览器功能
- 添加pm2进程管理

### v1.1.0 (2024-01-21)
- 添加Docker支持
- 优化启动参数
- 增加监控告警功能

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件 