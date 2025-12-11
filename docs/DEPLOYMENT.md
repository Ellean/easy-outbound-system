# 部署文档

## 使用 Docker Compose 部署（推荐）

### 前置要求

- Docker Engine 20.10+
- Docker Compose 2.0+

### 快速部署

1. **克隆项目**

```bash
git clone https://github.com/Ellean/easy-outbound-system.git
cd easy-outbound-system
```

2. **配置环境变量**

复制并编辑 server/.env.example：

```bash
cp server/.env.example server/.env
# ⚠️ 重要：修改 server/.env 中的数据库密码和其他敏感配置
# 生产环境必须使用强密码！
```

**安全提示**：
- 修改 `DB_PASSWORD` 为强密码（至少16位，包含大小写字母、数字和特殊字符）
- 修改 docker-compose.yml 中的 `POSTGRES_PASSWORD` 为相同的强密码
- 不要将 `.env` 文件提交到版本控制系统

3. **启动服务**

```bash
docker-compose up -d
```

4. **验证部署**

```bash
# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs -f server

# 测试 API
curl http://localhost:3000/health
```

5. **初始化数据（可选）**

```bash
# 导入测试数据
docker-compose exec postgres psql -U postgres -d outbound_system -f /docker-entrypoint-initdb.d/seeds/sample_data.sql
```

### 停止服务

```bash
# 停止服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止并删除所有数据（谨慎使用）
docker-compose down -v
```

## 手动部署

### 后端服务

1. **安装依赖**

```bash
cd server
npm install
```

2. **配置环境变量**

```bash
cp .env.example .env
# 编辑 .env 文件
```

3. **构建**

```bash
npm run build
```

4. **启动**

```bash
npm start
```

### 数据库

1. **安装 PostgreSQL**

```bash
# Ubuntu/Debian
sudo apt-get install postgresql-16

# macOS
brew install postgresql@16
```

2. **创建数据库**

```bash
createdb outbound_system
psql outbound_system < database/migrations/001_initial_schema.sql
```

### 前端客户端

1. **安装依赖**

```bash
cd client
npm install
```

2. **开发模式**

```bash
npm run tauri:dev
```

3. **构建安装包**

```bash
npm run tauri:build
```

构建产物位于 `client/src-tauri/target/release/bundle/`

## 环境变量说明

### 服务器环境变量 (server/.env)

```env
# 数据库配置
DB_HOST=localhost          # 数据库主机
DB_PORT=5432              # 数据库端口
DB_NAME=outbound_system   # 数据库名称
DB_USER=postgres          # 数据库用户
DB_PASSWORD=your_password # 数据库密码

# 服务器配置
PORT=3000                 # 服务器端口
NODE_ENV=production       # 运行环境 (development/production)

# CORS 配置
CORS_ORIGIN=*             # 允许的跨域来源

# 日志配置
LOG_LEVEL=info            # 日志级别 (debug/info/warn/error)
```

### 客户端环境变量 (client/.env)

```env
VITE_API_BASE_URL=http://localhost:3000  # API 服务器地址
```

## 生产环境配置建议

### 1. 安全配置

```env
# 使用强密码
DB_PASSWORD=<strong-random-password>

# 限制 CORS
CORS_ORIGIN=https://your-domain.com

# 启用 HTTPS
```

### 2. 性能优化

```env
# 数据库连接池
DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=30000

# 日志级别
LOG_LEVEL=warn  # 生产环境使用 warn 或 error
```

### 3. 监控和日志

建议配置：
- 使用 PM2 管理 Node.js 进程
- 配置日志收集（如 ELK Stack）
- 设置健康检查和告警

```bash
# 使用 PM2 启动
npm install -g pm2
pm2 start dist/index.js --name outbound-server
pm2 save
pm2 startup
```

## 故障排查

### 1. 数据库连接失败

**症状**：服务器启动时报 "数据库连接失败"

**解决方案**：
- 检查数据库是否运行：`docker-compose ps postgres` 或 `pg_isready`
- 检查环境变量配置是否正确
- 检查防火墙设置
- 查看数据库日志：`docker-compose logs postgres`

### 2. API 请求失败

**症状**：客户端无法连接到服务器

**解决方案**：
- 检查服务器是否运行：`curl http://localhost:3000/health`
- 检查 `VITE_API_BASE_URL` 配置
- 检查 CORS 配置
- 查看服务器日志：`docker-compose logs server`

### 3. 端口冲突

**症状**：服务启动失败，提示端口被占用

**解决方案**：
```bash
# 查看端口占用
lsof -i:3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# 修改端口配置
# 编辑 docker-compose.yml 或 .env 文件
```

### 4. 数据库初始化失败

**症状**：数据库表未创建

**解决方案**：
```bash
# 手动执行迁移脚本
docker-compose exec postgres psql -U postgres -d outbound_system -f /docker-entrypoint-initdb.d/migrations/001_initial_schema.sql
```

## 备份和恢复

### 备份

```bash
# 备份数据库
docker-compose exec postgres pg_dump -U postgres outbound_system > backup_$(date +%Y%m%d).sql

# 备份 Docker 卷
docker run --rm -v outbound_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_data_backup.tar.gz /data
```

### 恢复

```bash
# 恢复数据库
cat backup.sql | docker-compose exec -T postgres psql -U postgres -d outbound_system

# 恢复 Docker 卷
docker run --rm -v outbound_postgres_data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/postgres_data_backup.tar.gz --strip 1"
```

## 更新和升级

### 更新应用

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose build
docker-compose up -d

# 查看日志确认
docker-compose logs -f server
```

### 数据库迁移

```bash
# 执行新的迁移脚本
docker-compose exec postgres psql -U postgres -d outbound_system -f /path/to/new_migration.sql
```

## 监控

### 健康检查

```bash
# 服务器健康检查
curl http://localhost:3000/health

# 数据库健康检查
docker-compose exec postgres pg_isready -U postgres
```

### 日志查看

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs server
docker-compose logs postgres

# 实时日志
docker-compose logs -f server
```

## 性能调优

### 数据库优化

```sql
-- 分析表
ANALYZE products;
ANALYZE outbound_orders;
ANALYZE outbound_items;

-- 重建索引
REINDEX TABLE products;
REINDEX TABLE outbound_orders;
```

### 应用优化

- 使用连接池
- 启用 Gzip 压缩
- 配置缓存（Redis）
- 使用 CDN 加速静态资源

## 安全加固

1. **使用 HTTPS**：配置 SSL/TLS 证书
2. **更改默认端口**：避免使用默认端口
3. **限制访问**：配置防火墙规则
4. **定期更新**：及时更新依赖包
5. **备份**：定期备份数据
6. **监控**：配置入侵检测和日志监控
