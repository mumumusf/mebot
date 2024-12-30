# 远程浏览器代理自动化脚本

一个支持代理设置的远程浏览器自动化工具，可以在VPS上运行并通过noVNC远程访问。

作者: 小林  
推特: [@YOYOMYOYOA](https://x.com/YOYOMYOYOA)

## 功能特点

- ✨ 支持默认代理和自定义代理
- 🌐 通过noVNC实现远程浏览器访问
- 🔄 自动检测和安装Chrome依赖
- 🖥️ 支持Linux和Windows系统
- 🔒 支持代理认证
- 📊 详细的运行状态日志
- 🧩 支持安装任意Chrome插件

## 浏览器插件功能

远程浏览器完整支持Chrome插件生态系统，你可以：

- ✅ 安装任何Chrome网上应用店的插件
- ✅ 安装第三方.crx格式插件
- ✅ 加载本地开发的插件
- ✅ 使用所有插件功能，无任何限制

### 插件安装方法

1. 通过Chrome网上应用店安装：
   - 在远程浏览器中访问 [Chrome网上应用店](https://chrome.google.com/webstore/category/extensions)
   - 选择所需插件并点击"添加至Chrome"
   - 按照提示完成安装

2. 通过CRX文件安装：
   - 在远程浏览器中访问 `chrome://extensions/`
   - 开启右上角的"开发者模式"
   - 将CRX文件拖放到浏览器窗口中
   - 点击"添加扩展程序"确认安装

3. 通过解压的插件文件夹安装：
   - 在远程浏览器中访问 `chrome://extensions/`
   - 开启右上角的"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择插件文件夹完成安装

### 实用插件推荐

1. 代理管理类：
   - Proxy SwitchyOmega - 高级代理切换工具
   - FoxyProxy - 灵活的代理管理器

2. 自动化辅助类：
   - Tampermonkey - 强大的用户脚本管理器
   - iMacros - 网页自动化录制回放
   - Auto Refresh - 页面自动刷新

3. 隐私安全类：
   - uBlock Origin - 高效的广告拦截器
   - Privacy Badger - 追踪器拦截
   - HTTPS Everywhere - 强制HTTPS连接

4. 工具类：
   - EditThisCookie - Cookie管理工具
   - JSON Viewer - JSON格式化工具
   - Wappalyzer - 网站技术栈检测

5. 开发调试类：
   - Vue.js devtools - Vue开发工具
   - React Developer Tools - React开发工具
   - XPath Helper - XPath提取工具

### 插件使用建议

1. 性能优化：
   - 安装插件数量建议控制在10个以内
   - 及时关闭不需要的插件
   - 定期清理插件缓存数据
   - 避免同时运行多个高资源占用的插件

2. 安全注意：
   - 优先从Chrome官方商店安装插件
   - 使用第三方插件前先验证来源
   - 定期检查和更新已安装插件
   - 注意审查插件权限请求

3. 使用技巧：
   - 使用插件组管理不同场景
   - 为常用插件设置快捷键
   - 善用插件的配置同步功能
   - 重要插件配置定期备份

## 系统要求

### Linux系统 (Ubuntu/Debian)
- Node.js 18+
- 支持的包管理器：apt 或 yum
- 系统内存：建议2GB以上
- 磁盘空间：至少1GB可用空间

### Windows系统
- Node.js 18+
- 已安装Chrome浏览器
- 系统内存：建议2GB以上
- 磁盘空间：至少1GB可用空间

## 快速开始

### 1. 安装基础环境

对于 Ubuntu/Debian 系统：
```bash
# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 Git
sudo apt-get install -y git

# 安装 VNC 服务器
sudo apt-get install -y x11vnc xvfb
```

对于 CentOS/RHEL 系统：
```bash
# 安装 Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 安装 Git
sudo yum install -y git

# 安装 VNC 服务器
sudo yum install -y x11vnc xorg-x11-server-Xvfb
```

### 2. 下载和安装

```bash
# 克隆项目
git clone <项目地址>
cd <项目目录>

# 安装依赖
npm install
```

### 3. 运行脚本

```bash
node browser-proxy.js
```

### 4. 访问远程浏览器

1. 打开浏览器，访问：
```
http://YOUR_VPS_IP:6080/vnc.html
```
将 `YOUR_VPS_IP` 替换为你的VPS IP地址

2. 连接到VNC服务器后，你将看到远程浏览器窗口

## 代理设置

脚本支持两种代理设置方式：

1. 默认代理：
   - 直接选择选项 1
   - 使用预设的代理服务器

2. 自定义代理：
   - 选择选项 2
   - 输入代理信息，格式为：
   ```
   ip:port:username:password
   ```

## 常见问题

1. **Q: VPS上无法启动Chrome？**
   - A: 脚本会自动检测和安装所需依赖，如果仍有问题，请确保系统内存足够（建议2GB以上）

2. **Q: 无法访问noVNC页面？**
   - A: 检查VPS的6080端口是否开放
   - 确保防火墙允许该端口访问

3. **Q: 代理连接失败？**
   - A: 检查代理服务器信息是否正确
   - 确认代理服务器是否在线
   - 验证用户名和密码是否正确

## 注意事项

1. 安全建议：
   - 建议在VPS上设置防火墙规则
   - 限制noVNC访问IP
   - 定期更新系统和依赖包

2. 性能建议：
   - VPS配置建议2核4G以上
   - 保持足够的磁盘空间
   - 定期清理浏览器缓存

3. 使用建议：
   - 使用稳定的代理服务器
   - 保持网络连接稳定
   - 定期检查日志信息

## 更新日志

### v1.0.0
- 初始版本发布
- 支持代理设置
- 添加noVNC远程访问
- 自动依赖检测和安装

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎通过以下方式联系：
- 推特：[@YOYOMYOYOA](https://x.com/YOYOMYOYOA)

## 致谢

感谢以下开源项目：
- [Puppeteer](https://pptr.dev/)
- [noVNC](https://novnc.com/)
- [Node.js](https://nodejs.org/) 

## 浏览器插件安装

远程浏览器支持安装任何Chrome插件，安装方法：

1. 通过Chrome网上应用店安装：
   - 在远程浏览器中访问 [Chrome网上应用店](https://chrome.google.com/webstore/category/extensions)
   - 选择所需插件并点击"添加至Chrome"
   - 按照提示完成安装

2. 通过CRX文件安装：
   - 在远程浏览器中访问 `chrome://extensions/`
   - 开启右上角的"开发者模式"
   - 将CRX文件拖放到浏览器窗口中
   - 点击"添加扩展程序"确认安装

3. 通过解压的插件文件夹安装：
   - 在远程浏览器中访问 `chrome://extensions/`
   - 开启右上角的"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择插件文件夹完成安装

### 插件使用建议

1. 性能注意事项：
   - 安装插件数量建议控制在10个以内
   - 避免同时运行多个高资源占用的插件
   - 定期清理未使用的插件

2. 安全建议：
   - 仅从官方商店或可信来源安装插件
   - 注意检查插件权限请求
   - 定期更新已安装的插件

3. 常用插件推荐：
   - 广告拦截器
   - 脚本管理器
   - 代理切换器
   - 截图工具
   - 密码管理器 