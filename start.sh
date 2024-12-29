#!/bin/bash

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