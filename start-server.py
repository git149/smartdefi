#!/usr/bin/env python3
"""
Web3 DApp 启动器
简单的HTTP服务器，用于运行token-creator.html

使用方法:
    python start-server.py

然后在浏览器中访问: http://localhost:8000/token-creator.html
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

# 配置
PORT = 8000
HTML_FILE = "token-creator.html"

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """自定义HTTP请求处理器，添加CORS头部"""
    
    def end_headers(self):
        # 添加CORS头部，确保Web3功能正常工作
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f"📡 {self.address_string()} - {format % args}")

def check_html_file():
    """检查HTML文件是否存在"""
    if not os.path.exists(HTML_FILE):
        print(f"❌ 错误: 找不到 {HTML_FILE} 文件")
        print(f"📁 当前目录: {os.getcwd()}")
        print(f"📋 目录内容: {list(os.listdir('.'))}")
        
        # 尝试在frontend目录中查找
        frontend_path = os.path.join("frontend", HTML_FILE)
        if os.path.exists(frontend_path):
            print(f"✅ 在frontend目录中找到文件: {frontend_path}")
            return frontend_path
        
        print("\n💡 解决方案:")
        print("1. 确保token-creator.html文件在当前目录")
        print("2. 或者将此脚本放在包含HTML文件的目录中")
        print("3. 或者修改HTML_FILE变量指向正确路径")
        sys.exit(1)
    
    return HTML_FILE

def main():
    """主函数"""
    print("🚀 Web3 DApp 启动器")
    print("=" * 50)
    
    # 检查HTML文件
    html_path = check_html_file()
    
    # 获取当前目录
    current_dir = os.getcwd()
    print(f"📁 服务目录: {current_dir}")
    print(f"📄 HTML文件: {html_path}")
    
    # 创建服务器
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            print(f"🌐 服务器启动成功!")
            print(f"📍 本地地址: http://localhost:{PORT}")
            print(f"🎯 DApp地址: http://localhost:{PORT}/{html_path}")
            print("=" * 50)
            print("📖 使用说明:")
            print("1. 确保已安装MetaMask钱包扩展")
            print("2. 在浏览器中访问上述DApp地址")
            print("3. 连接钱包并开始使用")
            print("4. 按 Ctrl+C 停止服务器")
            print("=" * 50)
            
            # 自动打开浏览器
            try:
                dapp_url = f"http://localhost:{PORT}/{html_path}"
                print(f"🔗 正在打开浏览器: {dapp_url}")
                webbrowser.open(dapp_url)
            except Exception as e:
                print(f"⚠️ 无法自动打开浏览器: {e}")
                print(f"请手动访问: http://localhost:{PORT}/{html_path}")
            
            print(f"\n✅ 服务器运行在端口 {PORT}")
            print("等待连接...")
            
            # 启动服务器
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ 端口 {PORT} 已被占用")
            print("💡 解决方案:")
            print(f"1. 更改端口号 (修改脚本中的PORT变量)")
            print(f"2. 或者停止占用端口 {PORT} 的其他程序")
            print(f"3. 或者等待几分钟后重试")
        else:
            print(f"❌ 服务器启动失败: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")
        print("感谢使用 Web3 DApp!")
    except Exception as e:
        print(f"❌ 意外错误: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
