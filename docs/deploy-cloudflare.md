# Cloudflare Workers + Turso 部署指南

SelfRegScience 使用 **OpenNext** 部署到 Cloudflare Workers，数据库使用 **Turso（libSQL）**。

## 架构

```
git push → Cloudflare Workers Builds → OpenNext build → *.workers.dev
                                              ↓
                                    Turso (libsql://…)
```

本地开发仍用 SQLite 文件（`file:./dev.db`）；生产环境 `DATABASE_URL` 以 `libsql://` 开头时，自动启用 `@prisma/adapter-libsql/web`。

## 前置条件

- [Cloudflare](https://dash.cloudflare.com/) 账号
- [Turso](https://turso.tech/) 数据库已创建
- GitHub 仓库：`lantean600/SelfRegScience`
- Node.js 20+

## 1. Turso 凭证

数据库 URL（已创建）：

```
libsql://selfregscience-lantean.aws-ap-northeast-1.turso.io
```

生成访问 Token（本地终端，需安装 [Turso CLI](https://docs.turso.tech/cli/installation)）：

```bash
turso db tokens create selfregscience-lantean
```

保存输出的 Token，**不要提交到 Git**。

## 2. 推送数据库 Schema（首次 /  schema 变更后）

在本地执行一次，把 Prisma schema 同步到 Turso：

**PowerShell：**

```powershell
$env:DATABASE_URL="libsql://selfregscience-lantean.aws-ap-northeast-1.turso.io"
$env:DATABASE_AUTH_TOKEN="<你的 token>"
npx prisma db push
```

**bash：**

```bash
DATABASE_URL="libsql://selfregscience-lantean.aws-ap-northeast-1.turso.io" \
DATABASE_AUTH_TOKEN="<你的 token>" \
npx prisma db push
```

可选：写入种子数据

```bash
npm run db:seed
```

## 3. Cloudflare 环境变量

在 Cloudflare Dashboard → **Workers & Pages** → 你的 Worker → **Settings** → **Variables** 中添加：

| 变量 | 值 |
|------|-----|
| `DATABASE_URL` | `libsql://selfregscience-lantean.aws-ap-northeast-1.turso.io` |
| `DATABASE_AUTH_TOKEN` | Turso token（Encrypt）**仅 ASCII**，从 Turso 控制台复制 JWT，不要带中文说明或 `Bearer ` 前缀 |
| `SESSION_SECRET` | 随机长字符串（Encrypt）**仅 ASCII**（字母/数字/符号） |

## 4. 连接 GitHub 自动部署

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Workers**
2. 选择 **Connect to Git** → 授权 GitHub → 选择 `SelfRegScience`
3. 构建设置：

| 项 | 值 |
|----|-----|
| Production branch | `main` |
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx opennextjs-cloudflare deploy` |
| Node.js version | 20 |

4. 保存并触发首次部署。

之后每次 `git push` 到 `main` 会自动构建并上线。

## 5. 本地命令

| 命令 | 用途 |
|------|------|
| `npm run dev` | 本地 Next.js 开发（SQLite，**不要**设 `OPEN_NEXT_CLOUDFLARE_DEV`） |
| `npm run build:local` | 本地完整构建（含 prisma generate） |
| `npm run preview:cf` | 在 Wrangler 运行时本地预览 Cloudflare 构建 |
| `npm run deploy:cf` | 命令行直接部署到 Cloudflare（需 `wrangler login`） |

本地预览 Cloudflare 构建时，复制 `.dev.vars.example` 为 `.dev.vars` 并填入 Turso 变量：

```
NEXTJS_ENV=development
DATABASE_URL=libsql://selfregscience-lantean.aws-ap-northeast-1.turso.io
DATABASE_AUTH_TOKEN=<token>
SESSION_SECRET=local-dev-secret
```

## 6. 部署后自检

1. 打开 `https://<worker-name>.workers.dev/register` 注册账号
2. 登录后访问 `/ctdp`，创建节点并刷新，数据应保留
3. `/guide` 可正常访问

## 故障排查

| 现象 | 可能原因 |
|------|----------|
| 500 / 数据库错误 | `DATABASE_AUTH_TOKEN` 未设置或过期 |
| `DATABASE_AUTH_TOKEN is required` | 生产环境缺少 Token 环境变量 |
| `must contain only ASCII characters` | 环境变量里混入了中文或弯引号；在 Cloudflare 里重新粘贴纯 JWT/secret |
| 构建失败 | Node 版本低于 20；检查 Cloudflare 构建日志 |
| 注册成功但数据丢失 | Schema 未 `db push` 到 Turso |

## 相关文件

- `wrangler.jsonc` — Worker 名称与兼容标志
- `open-next.config.ts` — OpenNext Cloudflare 适配
- `src/lib/db.ts` — 本地 SQLite / Turso 自动切换
- `.env.example` — 环境变量模板
