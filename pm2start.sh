#!/bin/bash

# 项目：air-conditioner-diagnosis
# 名称：高速磁浮空调状态诊断系统

# PM2运行端口
PORT=10001

# PM2运行名称
NAME="10001:空调状态诊断"

# PM2运行脚本
pm2 serve ./dist --port "$PORT" --spa --name "$NAME"