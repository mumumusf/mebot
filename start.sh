#!/bin/bash

cd "$(dirname "$0")"  # 确保在脚本所在目录

# 清理函数
cleanup() {
    echo "正在清理进程..."
    
    # 停止所有相关进程
    for pid in $(pgrep -f "Xvfb :99"); do
        echo "停止Xvfb进程: $pid"
        sudo kill -9 $pid 2>/dev/null
    done
    
    for pid in $(pgrep -f "chrome"); do
        echo "停止Chrome进程: $pid"
        kill -9 $pid 2>/dev/null
    done
    
    for pid in $(pgrep -f "node"); do
        echo "停止Node进程: $pid"
        kill -9 $pid 2>/dev/null
    done
    
    # 清理X服务器文件
    echo "清理X服务器文件..."
    sudo rm -f /tmp/.X*-lock
    sudo rm -f /tmp/.X11-unix/X*
    
    # 等待进程完全停止
    sleep 3
    
    # 验证清理结果
    if pgrep -f "Xvfb :99" > /dev/null; then
        echo "警告: Xvfb进程仍在运行"
        return 1
    fi
}

# 确保清理
echo "开始清理环境..."
cleanup
if [ $? -ne 0 ]; then
    echo "清理失败，请手动检查进程"
    exit 1
fi

# 清理旧的数据
echo "清理旧数据..."
rm -rf chrome-linux
rm -rf chrome-user-data

# 设置显示变量
export DISPLAY=:99

# 启动Xvfb
echo "启动Xvfb..."
sudo Xvfb :99 -screen 0 1920x1080x24 -ac > xvfb.log 2>&1 &
XVFB_PID=$!

# 等待Xvfb启动
echo "等待Xvfb启动..."
for i in {1..10}; do
    if xdpyinfo -display :99 >/dev/null 2>&1; then
        echo "Xvfb启动成功"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "Xvfb启动失败，查看日志:"
        cat xvfb.log
        cleanup
        exit 1
    fi
    sleep 1
done

# 设置权限
echo "设置权限..."
sudo chmod 1777 /tmp/.X11-unix
sudo chown root:root /tmp/.X11-unix

# 启动dbus
if [ ! -e /var/run/dbus/system_bus_socket ]; then
    echo "启动dbus..."
    sudo dbus-daemon --system --fork
fi

# 启动程序
echo "启动浏览器自动化程序..."
VPS=true node browser.js

# 如果程序退出，清理进程
cleanup 