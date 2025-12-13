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

### 4. 服务器环境准备

确保服务器已安装必要的软件：

```bash
# 安装 Docker 和 Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# 克隆项目（首次部署）
cd /opt
git clone https://github.com/Ellean/easy-outbound-system.git
cd easy-outbound-system

# 配置环境变量
cp server/.env.example server/.env
# 编辑 server/.env，设置数据库密码等

# 首次启动
docker-compose up -d
```

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
   - 拉取最新代码
   - 拉取最新 Docker 镜像
   - 重启服务
   - 清理旧镜像

4. **notify**: 部署状态通知
   - 显示各个步骤的执行结果
   - 如果任何步骤失败则报错

## 部署脚本说明

部署脚本会在服务器上执行以下操作：

```bash
# 1. 进入项目目录
cd /opt/easy-outbound-system

# 2. 拉取最新代码（包含 docker-compose.yml 等配置）
git pull origin main

# 3. 拉取最新的 Docker 镜像
docker-compose pull server

# 4. 重启服务（仅重启 server，不影响数据库）
docker-compose up -d --no-deps server

# 5. 清理旧的 Docker 镜像释放空间
docker image prune -f

# 6. 显示服务状态
docker-compose ps
```

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
docker-compose logs server
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
docker-compose down server
docker tag username/easy-outbound-server:SHA username/easy-outbound-server:latest
docker-compose up -d server
```

或者直接使用之前的 commit：

```bash
# 回退代码到之前的版本
git checkout <previous-commit-sha>
docker-compose up -d --force-recreate server
```
