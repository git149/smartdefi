#!/usr/bin/env python3
"""
简单的HTTP服务器用于测试前端界面
使用方法: python server.py
然后访问: http://localhost:8000/token-creator.html
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

# 设置端口
PORT = 8000

# 切换到前端目录
frontend_dir = Path(__file__).parent
os.chdir(frontend_dir)

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加CORS头部以支持本地开发
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def log_message(self, format, *args):
        # 自定义日志格式
        print(f"[{self.log_date_time_string()}] {format % args}")

def main():
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"🚀 启动HTTP服务器...")
            print(f"📁 服务目录: {frontend_dir}")
            print(f"🌐 访问地址: http://localhost:{PORT}")
            print(f"🪙 代币创建器: http://localhost:{PORT}/token-creator.html")
            print(f"📖 使用说明: http://localhost:{PORT}/使用说明.md")
            print(f"⏹️  按 Ctrl+C 停止服务器")
            print("-" * 60)
            
            # 提示手动打开浏览器
            print("💡 请手动在浏览器中访问上述地址")
            
            print("-" * 60)
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 服务器已停止")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ 端口 {PORT} 已被占用，请尝试其他端口")
            print(f"💡 或者运行: python server.py {PORT + 1}")
        else:
            print(f"❌ 启动服务器失败: {e}")

if __name__ == "__main__":
    main()
