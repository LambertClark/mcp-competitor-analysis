# Dynatrace MCP Server 架构与使用限制分析

## 一、架构设计特点

### 1.1 架构理念

**单体模块化设计**

- **设计模式**: 采用单体应用架构，通过模块化方式组织功能，而非微服务或插件化架构
- **理由**:
  - MCP 服务器定位为轻量级本地工具，无需复杂的分布式架构
  - 单进程模型简化部署和运维，降低资源消耗
  - 通过清晰的目录结构（`capabilities/`, `authentication/`, `utils/`）实现模块化隔离
  - 适合与 AI 助手（VS Code, Claude, Cursor 等）的 stdio/HTTP 集成模式

### 1.2 核心依赖

**主要依赖库及版本要求**

| 依赖包 | 版本 | 用途 |
|-------|------|------|
| `@modelcontextprotocol/sdk` | ^1.8.0 | MCP 协议实现（stdio/HTTP 传输层） |
| `@dynatrace-sdk/client-*` | ^1.x - ^5.x | Dynatrace API 客户端集合 |
| `@dynatrace/openkit-js` | ^4.1.0 | 使用情况遥测追踪 |
| `dt-app` | ^0.148.1 | Dynatrace 应用框架（SSO 认证） |
| `commander` | ^14.0.0 | CLI 参数解析 |
| `dotenv` | ^17.2.1 | 环境变量管理 |

**运行时要求**:
- Node.js: 22.17.1+ (Dockerfile 基于 Alpine 3.21)
- TypeScript: ^5.6.2 (编译时依赖)
- 编译目标: ESNext with CommonJS modules

### 1.3 扩展机制

**有限扩展能力**

- **工具扩展**: 采用**声明式工具注册**模式，通过 `tool()` 辅助函数添加新能力
  - 位置: `src/index.ts` 中的工具定义区域
  - 扩展方式: 需修改源代码添加新工具，无运行时插件系统
  - 示例: `list_vulnerabilities`, `execute_dql`, `chat_with_davis_copilot` 等 15+ 内置工具

- **认证扩展**: 支持三种认证方式，通过策略模式实现可扩展认证
  - Platform Token（最简单）
  - OAuth Client Credentials Flow（非交互式）
  - OAuth Authorization Code Flow（交互式 SSO）

- **传输层扩展**: 支持 stdio 和 HTTP 两种传输模式
  - stdio: 适用于本地 MCP 客户端（默认）
  - HTTP: 支持远程部署和 Web 客户端集成（通过 `--http` 标志）

**限制**:
- 无热加载机制，添加工具需重启服务
- 无第三方插件系统，扩展需要 fork 仓库或提交 PR
- 未提供工具扩展 SDK 或 API

### 1.4 版本兼容性策略

**向后兼容优先**

- **MCP SDK 兼容**: 基于 `@modelcontextprotocol/sdk` ^1.8.0，遵循 MCP 规范
- **API 版本管理**:
  - 依赖 Dynatrace API v1 和 v2（通过 SDK 抽象层）
  - 认证范围（scopes）变更记录明确：v0.12.0 废弃 `app-engine:functions:run`
- **环境变量向后兼容**: 保持旧版配置项支持（如 `OAUTH_CLIENT_ID` vs. `DT_PLATFORM_TOKEN`）
- **破坏性变更策略**: 在 README 中明确标注版本迁移说明

**向前兼容**:
- 依赖 Dynatrace 平台 API 稳定性，不保证未来 Dynatrace 变更的兼容性
- Davis CoPilot 功能标记为 Preview，API 可能变更

### 1.5 代码组织方式

**三层分层结构**

```
src/
├── index.ts                    # 主入口（服务器初始化、工具注册）
├── authentication/             # 认证层
│   ├── dynatrace-clients.ts    # HTTP 客户端工厂
│   ├── dynatrace-oauth-*.ts    # OAuth 流程实现
│   └── token-cache.ts          # 令牌缓存管理
├── capabilities/               # 能力层（业务逻辑）
│   ├── execute-dql.ts          # DQL 查询执行
│   ├── list-problems.ts        # 问题列表
│   ├── davis-copilot.ts        # AI 助手集成
│   └── ...                     # 15+ 能力模块
└── utils/                      # 工具层
    ├── grail-budget-tracker.ts # Grail 查询成本跟踪
    ├── telemetry-openkit.ts    # 遥测数据收集
    ├── proxy-config.ts         # 代理配置
    └── user-agent.ts           # User-Agent 管理
```

**设计优势**:
- 清晰的关注点分离（认证 vs. 业务逻辑 vs. 工具函数）
- 每个能力模块独立可测试（覆盖单元测试和集成测试）
- 工具层提供横切关注点（日志、成本追踪、代理）

---

## 二、使用限制与约束

### 2.1 速率限制

| 限制项 | 数值 | 说明 |
|--------|------|------|
| **QPS上限** | 依赖 Dynatrace 平台限制 | 未在 MCP 服务器层实施速率限制，受 Dynatrace API 配额约束 |
| **并发连接数** | 1 (stdio 模式) / 无限制 (HTTP 模式) | stdio 模式为单连接；HTTP 模式无连接数限制，但受 Node.js 事件循环和内存约束 |
| **OAuth 令牌刷新** | 自动 | 令牌过期时自动刷新（Auth Code Flow），无需手动干预 |

### 2.2 单次请求限制

| 限制项 | 数值 | 说明 |
|--------|------|------|
| **DQL 查询记录数** | 默认 100 条 (可配置到 5000) | `execute_dql` 工具的 `recordLimit` 参数 |
| **DQL 查询响应大小** | 默认 1 MB (可配置) | `recordSizeLimitMB` 参数，防止 OOM |
| **超时时间** | 未硬性限制 | DQL 查询使用轮询机制（2秒间隔），最长等待时间取决于 Dynatrace API |
| **邮件收件人数量** | 最多 10 人 (TO + CC + BCC) | `send_email` 工具限制 |
| **漏洞列表显示数** | 默认显示 25 条 | `maxVulnerabilitiesToDisplay` 参数 |

### 2.3 资源配额限制

| 限制项 | 数值 | 说明 |
|--------|------|------|
| **Grail 查询预算** | 默认 1000 GB/会话 (可配置) | `DT_GRAIL_QUERY_BUDGET_GB` 环境变量控制 |
| **Grail 预算追踪** | 80% 警告，100% 阻止 | 内置预算追踪器，超预算后拒绝新查询 |
| **内存限制** | 无硬性限制 | 依赖 Node.js 堆限制，建议生产环境设置 `--max-old-space-size` |
| **存储配额** | 无持久化存储 | 令牌缓存仅存在于内存，重启后需重新认证 |

**成本警告机制**:
```
- 5 GB+: 中等数据使用量 💡
- 50 GB+: 高数据使用量 ⚠️
- 500 GB+: 极高数据使用量 ⚠️
```

### 2.4 批量操作限制

| 限制项 | 数值 | 说明 |
|--------|------|------|
| **批量实体查询** | 无明确限制 | `find_entity_by_name` 支持多实体名称数组 |
| **批量所有权查询** | 逗号分隔列表 | `get_ownership` 支持多个 entityId |
| **单批最大 DQL 查询数** | 1 | 每次工具调用执行 1 条 DQL 语句 |

### 2.5 地区/环境限制

| 限制项 | 说明 |
|--------|------|
| **Dynatrace 环境** | 仅支持 Dynatrace Platform URL (`https://*.apps.dynatrace.com`)，不支持 Classic URL (`*.live.dynatrace.com`) |
| **代理支持** | 支持 `https_proxy`/`http_proxy` 环境变量（注意：`no_proxy` 仅用于日志记录） |
| **地区限制** | 无地理限制，取决于 Dynatrace 租户所在区域 |
| **SSO 限制** | 依赖 `https://sso.dynatrace.com` 的可访问性 |

### 2.6 功能限制

| 功能 | 限制 | 说明 |
|------|------|------|
| **Platform Token 限制** | 不支持 `environment-api:entities:read` | 某些所有权查询功能无法使用 |
| **Davis CoPilot** | Preview API | 功能可能变更，需在 Dynatrace 环境中启用 |
| **Slack 集成** | 需配置 `SLACK_CONNECTION_ID` | 依赖 Dynatrace Workflow Slack Connector |
| **邮件发送** | 发送方固定为 `no-reply@apps.dynatrace.com` | 无法自定义发件人 |

---

## 三、部署与运维

### 3.1 部署方式

**混合部署模式**

| 部署方式 | 适用场景 | 命令 |
|----------|----------|------|
| **本地 npx 运行** | 开发测试、个人使用 | `npx -y @dynatrace-oss/dynatrace-mcp-server` |
| **Docker 容器** | 生产环境、隔离部署 | `docker build -t dynatrace-mcp . && docker run dynatrace-mcp --http` |
| **全局安装** | 系统级服务 | `npm install -g @dynatrace-oss/dynatrace-mcp-server` |
| **源码部署** | 自定义扩展 | `git clone && npm ci && npm run build` |

**传输模式**:
- **stdio** (默认): 本地 MCP 客户端（VS Code, Claude Desktop, Cursor）
- **HTTP Server**: 远程访问、Web 客户端、负载均衡场景

### 3.2 部署复杂度

**中等复杂度** ★★★☆☆

**简化因素**:
- 单二进制部署（Node.js 应用）
- 依赖管理简单（npm package）
- 支持 Docker 容器化（多阶段构建）
- 无数据库依赖（无状态服务）

**复杂性来源**:
- **认证配置**: 需在 Dynatrace 平台创建 OAuth Client 或 Platform Token
- **权限范围**: 15+ scopes 需手动配置，配置错误导致功能受限
- **网络要求**: 企业环境需配置代理、防火墙规则
- **环境变量管理**: 至少 2 个必需变量（`DT_ENVIRONMENT` + 认证凭证）

### 3.3 SLA 承诺

**无正式 SLA（非官方产品）**

> Note: This product is not officially supported by Dynatrace.

- **社区支持**: 通过 GitHub Issues 提供帮助
- **稳定性**: 依赖 Dynatrace Platform API 的稳定性（Dynatrace 官方 SLA）
- **可用性目标**: 无明确承诺，建议自行监控
- **数据一致性**: 无状态设计，无数据丢失风险

### 3.4 故障恢复机制

**自动恢复能力**

| 故障类型 | 恢复机制 |
|----------|----------|
| **OAuth 令牌过期** | 自动刷新令牌（Auth Code Flow） |
| **网络临时故障** | 依赖 HTTP 客户端重试逻辑（Dynatrace SDK） |
| **DQL 查询超时** | 轮询机制（2秒间隔检查状态） |
| **进程崩溃** | 需外部进程管理器（systemd, pm2, Docker restart policy） |
| **预算超限** | 提供 `reset_grail_budget` 工具手动重置 |

**手动干预场景**:
- 认证凭证失效（需更新环境变量）
- Dynatrace API 变更（需升级 MCP 服务器版本）
- 配置错误（需检查 scopes 和环境变量）

### 3.5 监控告警能力

**内置监控指标**

**遥测数据收集** (基于 Dynatrace OpenKit):
- 服务器启动事件
- 工具调用统计（工具名称、成功/失败、执行时长）
- 错误追踪（错误消息、堆栈跟踪）

**日志级别**: 仅 stderr 输出（`console.error`）

**成本监控**:
- Grail 查询字节追踪（实时显示扫描量）
- 预算警告（80% 和 100% 阈值）
- 成本查询 DQL:
  ```dql
  fetch dt.system.events
  | filter event.kind == "QUERY_EXECUTION_EVENT"
    and contains(client.client_context, "dynatrace-mcp")
  | fields timestamp, scanned_bytes, user.email
  | maketimeSeries sum(scanned_bytes), by: { user.email }
  ```

**外部监控集成**:
- 支持发送数据到 Dynatrace（通过 OpenKit 遥测）
- 可通过 User-Agent 追踪 API 调用来源

### 3.6 滚动升级支持

**否**

- **无状态设计**: 支持快速重启升级，但无会话保持
- **升级方式**:
  - stdio 模式：需重启 MCP 客户端
  - HTTP 模式：需重启进程（令牌缓存丢失，需重新认证）
- **蓝绿部署**: HTTP 模式下可通过负载均衡器实现
- **版本切换**: `@latest` 标签自动获取最新版本

---

## 四、开发者体验

### 4.1 认证流程

**复杂度**: ★★★☆☆ (中等)

**三种认证方式**:

| 认证方式 | 步骤数 | 复杂度 | 适用场景 |
|----------|--------|--------|----------|
| **Platform Token** | 2 步 | ★☆☆☆☆ | 快速测试、个人使用 |
| **OAuth Client Credentials** | 3 步 | ★★☆☆☆ | 自动化脚本、CI/CD |
| **OAuth Auth Code Flow** | 1 步 (自动) | ★★★★☆ | 交互式开发、SSO 环境 |

**Platform Token 流程** (最简单):
1. 在 Dynatrace UI 创建 Platform Token
2. 配置环境变量 `DT_PLATFORM_TOKEN`

**OAuth Client Credentials 流程**:
1. 在 Dynatrace 创建 OAuth Client（获取 Client ID 和 Secret）
2. 配置 15+ scopes 权限
3. 设置环境变量 `OAUTH_CLIENT_ID` 和 `OAUTH_CLIENT_SECRET`

**OAuth Auth Code Flow** (最用户友好):
1. 仅设置 `DT_ENVIRONMENT`，服务器自动打开浏览器完成 SSO 登录

**痛点**:
- scopes 配置复杂（15+ scopes，文档长达 50+ 行）
- Platform Token 缺少部分权限（`environment-api:entities:read`）
- 错误消息不够明确（需根据 issueId 排查）

### 4.2 本地开发支持

**良好** ★★★★☆

**开发工具**:
- **TypeScript 支持**: 完整类型定义
- **热重载**: 通过 `npm run watch` 支持
- **测试框架**: Jest (单元测试 + 集成测试)
- **代码格式化**: Prettier + Husky pre-commit hooks

**本地测试**:
- 集成测试覆盖核心功能（需真实 Dynatrace 环境）
- 单元测试覆盖工具层和认证层
- Mock 支持有限（部分测试依赖真实 API）

**环境隔离**:
- 支持 `.env` 文件配置
- 支持多 Dynatrace 环境切换（通过 `DT_ENVIRONMENT`）

### 4.3 调试工具

**基础** ★★☆☆☆

**CLI 工具**:
```bash
dynatrace-mcp-server --help     # 帮助信息
dynatrace-mcp-server --version  # 版本信息
dynatrace-mcp-server --http     # HTTP 模式
```

**内置调试能力**:
- 详细的 stderr 日志输出（连接状态、认证流程、查询元数据）
- Grail 查询成本实时显示
- DQL 验证工具 (`verify_dql`)

**缺失功能**:
- 无交互式 REPL 调试模式
- 无可视化工具（如 DQL 查询构建器）
- 无性能分析工具（profiling）
- 无请求重放功能

**第三方工具**:
- 可通过 Dynatrace Notebooks 验证 DQL 查询
- 可通过 Dynatrace UI 查看 API 调用追踪

### 4.4 文档质量

**优秀** ★★★★★

**完整性**:
- ✅ 详细的 README（600+ 行）
- ✅ 配置示例（VS Code, Claude, Cursor, Amazon Q, Gemini CLI）
- ✅ 30+ 示例 Prompt（基础查询、安全分析、DevOps 自动化）
- ✅ 认证故障排查指南
- ✅ 成本管理指南（Grail 预算追踪）
- ✅ 环境变量完整说明

**示例丰富度**:
- ✅ 基础用例（查找实体、查看日志）
- ✅ 高级用例（多阶段事件调查、跨服务故障分析）
- ✅ 安全合规监控示例
- ✅ DQL 查询示例（嵌入在工具响应中）

**不足**:
- ❌ 缺少架构设计文档
- ❌ 缺少贡献者指南
- ❌ 缺少 API 参考文档（需阅读源码）
- ❌ 缺少视频教程

### 4.5 社区活跃度

**中等活跃** ★★★☆☆

**GitHub 指标** (2025年数据):
- ⭐ Stars: 152
- 🍴 Forks: 45
- 📦 NPM 下载: 约 3k/周（总计 34.6k）
- 📅 首次发布: 2025年5月4日

**社区互动**:
- ✅ GitHub Issues 作为主要支持渠道
- ✅ 定期更新（v0.12.0 在 2025 年发布）
- ✅ Dynatrace 官方背书（加入 GitHub MCP Registry）
- ❌ 无 Discord/Slack 社区
- ❌ 问题响应速度未知（无公开 SLA）

**贡献者**:
- 多位贡献者（根据 GitHub 数据）
- Dynatrace OSS 组织维护

### 4.6 快速上手评分

| 评估维度 | 评分 | 说明 |
|----------|------|------|
| **上手难度** | ★★★☆☆ | 需理解 Dynatrace 概念（Grail, DQL, Entity）和认证配置 |
| **文档质量** | ★★★★★ | 文档详尽，示例丰富，覆盖多种 MCP 客户端 |
| **工具完备性** | ★★★★☆ | 功能强大（15+ 工具），但缺少可视化调试工具 |
| **社区支持** | ★★★☆☆ | 中等活跃，依赖 GitHub Issues，无实时聊天支持 |
| **稳定性** | ★★★★☆ | 依赖 Dynatrace 平台稳定性，社区产品无正式 SLA |

**推荐学习路径**:
1. **第1天**: 使用 Platform Token 快速启动，尝试 `get_environment_info` 工具
2. **第2天**: 学习 DQL 基础，运行示例 Prompt（如 `Show me error logs`）
3. **第3天**: 配置 OAuth，探索高级功能（Davis CoPilot, 漏洞分析）
4. **第4天**: 集成到日常工作流（VS Code, Claude Desktop）
5. **第5天**: 优化成本（使用 Grail 预算追踪，优化查询）

---

## 五、技术亮点

### 5.1 创新设计

1. **Grail 成本追踪器**: 首个内置查询成本管理的 MCP 服务器
   - 实时追踪字节扫描量
   - 预算超限自动阻止查询
   - 多级成本警告

2. **多认证策略**: 灵活支持 Platform Token、OAuth Client Credentials、OAuth Auth Code Flow
   - 自动令牌刷新
   - 内存令牌缓存

3. **人工审批机制**: 敏感操作（邮件发送、Slack 消息、工作流创建）需用户确认
   - 通过 MCP Elicitation API 实现
   - 防止误操作和数据泄露

4. **AI 助手集成**: 集成 Davis CoPilot (Preview)
   - 自然语言转 DQL
   - DQL 解释
   - 对话式问答

### 5.2 架构优势

- **无状态设计**: 易于水平扩展（HTTP 模式）
- **清晰分层**: 认证、业务逻辑、工具层分离
- **测试覆盖**: 单元测试 + 集成测试
- **可观测性**: 内置遥测（OpenKit）和成本追踪

### 5.3 技术债务

- **令牌缓存非持久化**: 每次重启需重新认证（Auth Code Flow）
- **HTTP 模式无会话管理**: 每个请求创建新连接和服务器实例
- **代理配置不完整**: `no_proxy` 环境变量未完全实施
- **缺少速率限制**: 未在 MCP 层实施 QPS 限制

---

## 六、适用场景分析

### 6.1 最佳实践场景

✅ **推荐使用**:
- 在 IDE 中实时查询生产环境日志、指标、问题
- 安全漏洞调查（CVE 分析、风险评估）
- DevOps 自动化（部署健康检查、SLO 验证）
- 多阶段事件调查（问题 → Span → 日志关联）
- 通过自然语言查询 Dynatrace 数据（无需学习 DQL）

### 6.2 不适用场景

❌ **不推荐使用**:
- 大规模批量数据导出（受 Grail 成本限制）
- 实时监控告警（建议使用 Dynatrace Workflows）
- 长期数据存储（MCP 服务器无持久化）
- 高频 API 调用场景（无速率限制保护）
- 需要正式 SLA 保障的生产环境

---

## 七、与其他 MCP 服务器对比

| 维度 | Dynatrace MCP | Anthropic MCP (参考) | Google MCP (假设) |
|------|---------------|----------------------|-------------------|
| **架构模式** | 单体模块化 | 插件化 | 微服务 |
| **部署方式** | 本地/Docker | 云端 SaaS | 混合 |
| **认证复杂度** | 中等（3种方式） | 低（API Key） | 高（OAuth 2.0） |
| **成本管理** | ✅ 内置预算追踪 | ❌ 无 | ⚠️ 外部工具 |
| **AI 集成** | ✅ Davis CoPilot | ✅ Claude | ✅ Gemini |
| **社区支持** | GitHub Issues | 官方论坛 | Stack Overflow |
| **SLA 保障** | ❌ 无 | ✅ 99.9% | ✅ 99.95% |

---

## 八、改进建议

### 8.1 短期优化（1-3 个月）

1. **令牌持久化**: 将 OAuth 令牌缓存到磁盘（加密存储）
2. **速率限制**: 实施客户端 QPS 限制（防止误操作）
3. **日志分级**: 支持 DEBUG/INFO/WARN/ERROR 日志级别
4. **健康检查端点**: HTTP 模式下添加 `/health` 和 `/metrics` 端点

### 8.2 中期优化（3-6 个月）

1. **插件系统**: 支持第三方工具扩展（通过 npm packages）
2. **配置文件支持**: 除环境变量外，支持 YAML/JSON 配置文件
3. **会话管理**: HTTP 模式下实现有状态会话
4. **可视化工具**: 提供 DQL 查询构建器和成本估算器

### 8.3 长期优化（6-12 个月）

1. **集群模式**: 支持多实例部署和负载均衡
2. **官方支持**: 纳入 Dynatrace 官方支持产品
3. **SLA 承诺**: 提供正式 SLA 保障
4. **多租户支持**: 支持单实例服务多个 Dynatrace 环境

---

## 九、总结

### 9.1 核心优势

1. ✅ **功能全面**: 15+ 工具覆盖问题管理、安全分析、日志查询、AI 助手
2. ✅ **文档优秀**: 详细的配置指南和 30+ 示例 Prompt
3. ✅ **成本透明**: 首个内置 Grail 成本追踪的 MCP 服务器
4. ✅ **易于集成**: 支持主流 AI 助手（VS Code, Claude, Cursor, Gemini）
5. ✅ **开源透明**: MIT License，代码质量高

### 9.2 核心挑战

1. ❌ **非官方产品**: 无 SLA 保障，社区支持为主
2. ❌ **认证复杂**: scopes 配置繁琐，错误排查困难
3. ❌ **成本风险**: Grail 查询可能产生高额费用（需严格控制）
4. ❌ **扩展受限**: 无插件系统，需修改源码添加工具
5. ❌ **监控有限**: 缺少可视化监控和告警

### 9.3 推荐指数

**总体评分**: ⭐⭐⭐⭐☆ (4/5)

**适合人群**:
- Dynatrace 用户（已有 Dynatrace 环境）
- DevOps/SRE 工程师（需实时查询生产数据）
- 安全工程师（漏洞管理、合规监控）
- AI 助手重度用户（VS Code, Claude Desktop）

**不适合人群**:
- 无 Dynatrace 环境的团队
- 需要正式 SLA 保障的企业
- 预算有限的团队（Grail 成本敏感）

---

## 附录

### A. 环境变量速查表

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `DT_ENVIRONMENT` | ✅ | - | Dynatrace 环境 URL |
| `DT_PLATFORM_TOKEN` | ⚠️ | - | Platform Token（3选1） |
| `OAUTH_CLIENT_ID` | ⚠️ | - | OAuth Client ID（3选1） |
| `OAUTH_CLIENT_SECRET` | ⚠️ | - | OAuth Client Secret（3选1） |
| `DT_GRAIL_QUERY_BUDGET_GB` | ❌ | 1000 | Grail 查询预算（GB） |
| `SLACK_CONNECTION_ID` | ❌ | - | Slack 连接 ID |
| `https_proxy` | ❌ | - | HTTPS 代理服务器 |
| `DT_MCP_DISABLE_TELEMETRY` | ❌ | false | 禁用遥测数据 |

### B. 工具清单

1. `get_environment_info` - 获取环境信息
2. `list_vulnerabilities` - 列出漏洞
3. `list_problems` - 列出问题
4. `find_entity_by_name` - 查找监控实体
5. `execute_dql` - 执行 DQL 查询
6. `verify_dql` - 验证 DQL 语法
7. `generate_dql_from_natural_language` - 自然语言转 DQL
8. `explain_dql_in_natural_language` - DQL 解释
9. `chat_with_davis_copilot` - Davis CoPilot 对话
10. `send_slack_message` - 发送 Slack 消息
11. `send_email` - 发送邮件
12. `create_workflow_for_notification` - 创建通知工作流
13. `make_workflow_public` - 公开工作流
14. `get_kubernetes_events` - 获取 K8s 事件
15. `get_ownership` - 获取实体所有权
16. `reset_grail_budget` - 重置 Grail 预算

### C. 参考链接

- GitHub: https://github.com/dynatrace-oss/dynatrace-mcp
- NPM: https://www.npmjs.com/package/@dynatrace-oss/dynatrace-mcp-server
- Dynatrace Docs: https://docs.dynatrace.com
- MCP Protocol: https://modelcontextprotocol.io
- Davis CoPilot: https://docs.dynatrace.com/docs/platform-modules/davis-ai/davis-copilot
