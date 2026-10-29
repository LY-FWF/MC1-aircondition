# 高速磁浮空调状态诊断模块

## 配置

开发调试 或打包 之前，请先新建 /.env.local 文件，可参考 .env.production，配置如下参数：

```
# WebSocket 服务 URL
VITE_WEBSOCKET_URL=192.168.1.152:10001

# WebSocket 错误重连时间
VITE_WEBSOCKET_RECONNECT_TIME=2000

# API 请求地址 URL 前缀
VITE_API_BASE_URL=http://192.168.1.142:13000/api/v1
```

根据实际需要使用到的参数配置，使用不到的参数可以不配置。

如 VITE_API_BASE_URL，有的项目是没有 API 请求的，可以不配置。

## 打包

打包之前请根据生产环境配置 .env.production 文件，再运行 `npm run build`

## 部署运行

将打包后的项目拷贝到服务器上，进入项目文件夹后，运行 `./pm2start.sh`