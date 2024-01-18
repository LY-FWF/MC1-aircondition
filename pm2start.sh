#!/bin/bash

# 项目：system-information
# 名称：高速磁浮系统信息

# PM2运行端口
PORT=10001

# PM2运行名称
NAME="$PORT:系统信息"

# PM2运行脚本
pm2 serve ./dist --port "$PORT" --spa --name "$NAME"