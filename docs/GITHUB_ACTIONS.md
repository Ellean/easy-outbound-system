# GitHub Actions 部署配置

## 所需的 GitHub Secrets

为了使 GitHub Actions 工作流能够正常部署到服务器，需要在 GitHub 仓库中配置以下 Secrets：

### 必需的 Secrets

#### Docker Hub 相关（用于推送镜像）
- **DOCKER_HUB_USERNAME**: Docker Hub 用户名
- **DOCKER_HUB_TOKEN**: Docker Hub 访问令牌（在 Docker Hub 个人设置中生成）

#### 服务器部署相关
- **DEPLOY_HOST**: 部署服务器的 IP 地址或域名（例如：`192.168.1.100` 或 `server.example.com`）
- **DEPLOY_USER**: SSH 登录用户名（例如：`root` 或 `ubuntu`）
- **DEPLOY_SSH_KEY**: SSH 私钥（用于免密登录服务器）
- **DEPLOY_PORT**: SSH 端口（可选，默认 22）
- **DEPLOY_PATH**: 项目在服务器上的部署路径（可选，默认 `/opt/easy-outbound-system`）

#### 服务器环境变量（必需）
- **DB_PASSWORD**: 数据库密码（必需，强密码）
- **DB_HOST**: 数据库主机（可选，默认 `postgres`）
- **DB_PORT**: 数据库端口（可选，默认 `5432`）
- **DB_NAME**: 数据库名称（可选，默认 `outbound_system`）
- **DB_USER**: 数据库用户（可选，默认 `postgres`）
- **SERVER_PORT**: 服务器端口（可选，默认 `3000`）
- **NODE_ENV**: 运行环境（可选，默认 `production`）
- **CORS_ORIGIN**: CORS 来源（可选，默认 `*`）
- **LOG_LEVEL**: 日志级别（可选，默认 `info`）

## 配置步骤

### 1. 生成 SSH 密钥对

如果还没有 SSH 密钥对，在本地生成：

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/deploy_key
```

这将生成两个文件：
- `~/.ssh/deploy_key` - 私钥（保存到 GitHub Secrets）
- `~/.ssh/deploy_key.pub` - 公钥（添加到服务器）

### 2. 在服务器上配置公钥

将公钥添加到服务器的 `~/.ssh/authorized_keys`：

```bash
# 在服务器上执行
mkdir -p ~/.ssh
chmod 700 ~/.ssh
cat >> ~/.ssh/authorized_keys << 'EOF'
# 粘贴 deploy_key.pub 的内容
EOF
chmod 600 ~/.ssh/authorized_keys
```

### 3. 在 GitHub 中配置 Secrets

1. 打开 GitHub 仓库页面
2. 进入 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加以下 Secrets：

**DEPLOY_HOST**
```
192.168.1.100
```

**DEPLOY_USER**
```
root
```

**DEPLOY_SSH_KEY**
```
-----BEGIN OPENSSH PRIVATE KEY-----
# 粘贴 deploy_key 文件的完整内容
-----END OPENSSH PRIVATE KEY-----
```

**DEPLOY_PORT**（可选）
```
22
```

**DEPLOY_PATH**（可选）
```
/opt/easy-outbound-system
```

**DOCKER_HUB_USERNAME**
```
your_dockerhub_username
```

**DOCKER_HUB_TOKEN**
```
dckr_pat_xxxxxxxxxxxxxxxxxxxxx
```

**DB_PASSWORD**（必需）
```
your_strong_database_password_here
```

**DB_HOST**（可选）
```
postgres
```

**DB_PORT**（可选）
```
5432
```

**DB_NAME**（可选）
```
outbound_system
```

**DB_USER**（可选）
```
postgres
```

**SERVER_PORT**（可选）
```
3000
```

**NODE_ENV**（可选）
```
production
```

**CORS_ORIGIN**（可选）
```
*
```

**LOG_LEVEL**（可选）
```
info
```

**重要提示**：
- `DB_PASSWORD` 是必需的，必须设置强密码
- 其他环境变量都有默认值，可以不设置
- 生产环境建议设置 `CORS_ORIGIN` 为具体的域名而不是 `*`

### 4. 服务器环境准备

#### 必需的软件安装

确保服务器已安装 Docker 和 Git：

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装 Docker Compose V2（如果未包含）
sudo apt-get update
sudo apt-get install docker-compose-plugin

# 验证安装
docker --version
docker compose version
git --version
```

#### 首次部署准备（可选）

**注意**：GitHub Actions 工作流会自动处理所有部署步骤，无需手动准备。

如果您想手动准备（不推荐）：

```bash
# 手动克隆项目（可选，工作流会自动处理）
sudo mkdir -p /opt/easy-outbound-system
sudo chown $USER:$USER /opt/easy-outbound-system
cd /opt/easy-outbound-system
git clone https://github.com/Ellean/easy-outbound-system.git .

# 环境变量文件会由 GitHub Actions 自动生成，无需手动配置
# 如果手动部署，可以复制示例文件：
# cp server/.env.example server/.env
# nano server/.env

# 首次启动（可选，工作流会自动启动）
docker compose up -d
```

**推荐方式（完全自动化）**：
1. 仅在服务器上安装 Docker 和 Git
2. 配置 SSH 密钥
3. 在 GitHub 中配置所有 Secrets（包括环境变量）
4. 推送代码或手动触发工作流
5. GitHub Actions 自动完成所有部署步骤（包括 .env 文件生成）

## 工作流程说明

### deploy-server.yml 工作流

该工作流在以下情况下触发：
- 推送到 `main` 分支且修改了 `server/**`、`database/**` 或 `docker-compose.yml`
- 手动触发（workflow_dispatch）

工作流包含 4 个作业：

1. **build-and-test**: 代码检查和构建
   - 类型检查
   - 代码检查（lint）
   - 构建 TypeScript

2. **docker-build**: 构建 Docker 镜像
   - 构建镜像并推送到 Docker Hub
   - 使用缓存加速构建

3. **deploy**: 部署到服务器
   - 通过 SSH 连接到服务器
   - 克隆或拉取最新代码
   - **自动生成 .env 文件**（从 GitHub Secrets）
   - 拉取最新 Docker 镜像
   - 重启服务
   - 清理旧镜像

4. **notify**: 部署状态通知
   - 显示各个步骤的执行结果
   - 如果任何步骤失败则报错

## 部署脚本说明

部署脚本会在服务器上执行以下操作：

```bash
# 1. 设置部署路径
DEPLOY_PATH="/opt/easy-outbound-system"

# 2. 检查并创建目录（首次部署）
if [ ! -d "$DEPLOY_PATH" ]; then
  echo "首次部署：创建目录"
  sudo mkdir -p "$DEPLOY_PATH"
  sudo chown $USER:$USER "$DEPLOY_PATH"
fi

# 3. 进入项目目录
cd "$DEPLOY_PATH"

# 4. 克隆或更新代码仓库
if [ ! -d ".git" ]; then
  echo "首次部署：克隆代码仓库"
  git clone https://github.com/Ellean/easy-outbound-system.git .
else
  echo "更新代码仓库"
  git pull origin main
fi

# 5. 创建服务器环境变量文件（从 GitHub Secrets）
echo "配置服务器环境变量"
cat > server/.env << 'EOF'
# 数据库配置
DB_HOST=postgres
DB_PORT=5432
DB_NAME=outbound_system
DB_USER=postgres
DB_PASSWORD=<从 secrets.DB_PASSWORD 读取>

# 服务器配置
PORT=3000
NODE_ENV=production

# CORS 配置
CORS_ORIGIN=*

# 日志级别
LOG_LEVEL=info
EOF

# 6. 拉取最新的 Docker 镜像
docker compose pull server

# 7. 重启服务（仅重启 server，不影响数据库）
docker compose up -d --no-deps server

# 8. 清理旧的 Docker 镜像释放空间
docker image prune -f

# 9. 显示服务状态
docker compose ps
```

**首次部署支持**：
- 自动检测并创建部署目录
- 自动克隆代码仓库（首次）或拉取更新（后续）
- **自动生成 .env 文件**（从 GitHub Secrets，无需手动配置）
- 无需手动准备项目目录

**环境变量管理**：
- 所有敏感配置（如数据库密码）都通过 GitHub Secrets 管理
- 每次部署自动更新 .env 文件
- 不会将敏感信息提交到代码仓库

## 安全建议

1. **SSH 私钥安全**
   - 私钥仅存储在 GitHub Secrets 中，不要提交到代码库
   - 定期轮换密钥
   - 使用 Ed25519 算法（更安全、更快）

2. **最小权限原则**
   - 为部署创建专用用户，不要使用 root
   - 配置 sudo 权限仅允许必要的 Docker 命令

3. **防火墙配置**
   - 限制 SSH 端口仅允许 GitHub Actions IP 访问
   - 使用非标准 SSH 端口

4. **备份**
   - 部署前自动备份数据库
   - 保留多个版本的备份

## 故障排查

### SSH 连接失败

检查以下项：
- SSH 密钥格式正确（包含 BEGIN 和 END 行）
- 服务器防火墙允许 SSH 连接
- authorized_keys 文件权限正确（600）
- SSH 服务正在运行

### Docker 命令权限错误

确保部署用户在 docker 组中：
```bash
sudo usermod -aG docker $DEPLOY_USER
```

### 服务启动失败

查看日志：
```bash
docker compose logs server
```

## 手动触发部署

1. 进入 GitHub 仓库
2. 点击 **Actions** 标签
3. 选择 **Deploy Server** 工作流
4. 点击 **Run workflow** 按钮
5. 选择分支（通常是 main）
6. 点击 **Run workflow** 确认

## 回滚到之前的版本

如果部署出现问题，可以快速回滚：

```bash
# 在服务器上执行
cd /opt/easy-outbound-system

# 查看可用的镜像版本
docker images | grep easy-outbound-server

# 回滚到特定版本（使用 commit sha）
docker compose down server
docker tag username/easy-outbound-server:SHA username/easy-outbound-server:latest
docker compose up -d server
```

或者直接使用之前的 commit：

```bash
# 回退代码到之前的版本
git checkout <previous-commit-sha>
docker compose up -d --force-recreate server
```
