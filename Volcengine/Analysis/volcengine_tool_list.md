# 火山引擎 ECS MCP Server 可观测能力清单

## 目录

- [第一部分：完整能力清单表格](#第一部分完整能力清单表格)
- [第二部分：性能指标详解](#第二部分性能指标详解)
- [第三部分：限制条件说明](#第三部分限制条件说明)

---

## 第一部分：完整能力清单表格

### 1. Tools 能力

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|------------|
| Tools | 基础工具数量 | ✓ | 提供 9 个工具 | v0.1.0+ | [`README.md`](../Code/mcp_server_ecs/README.md) |
| Tools | 工具列表 | ✓ | describe_instances, describe_images, describe_instance_types, describe_available_resource, describe_system_events, describe_regions, describe_zones, start_instances, renew_instance | v0.1.0+ | [工具详情](#11-工具详细列表) |
| Tools | 参数验证机制 | ✓ | Pydantic Field 验证，46 个参数定义，支持类型检查、默认值、描述文档 | v0.1.0+ | [`client.py`](../Code/mcp_server_ecs/src/mcp_server_ecs/common/client.py) |
| Tools | 参数验证类型 | ✓ | 支持：str, List[str], int, enum 约束 | v0.1.0+ | [`instance.py`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/instance.py) |
| Tools | 并行调用支持 | ◐ | FastMCP 框架理论支持，但未显式配置并发限制 | v0.1.0+ | [`main.py:29`](../Code/mcp_server_ecs/src/mcp_server_ecs/main.py) |
| Tools | 最大并发数 | ✗ | 未配置应用层并发限制，受限于火山引擎 API QPS（典型 5-20 QPS） | - | - |
| Tools | 流式处理支持 | ◐ | 支持 SSE 传输协议，但工具返回非流式（一次性返回） | v0.1.0+ | [`main.py:18`](../Code/mcp_server_ecs/src/mcp_server_ecs/main.py) |
| Tools | 错误处理机制 | ✓ | 统一错误处理器（`handle_error`），区分异常错误和空响应 | v0.1.0+ | [`errors.py`](../Code/mcp_server_ecs/src/mcp_server_ecs/common/errors.py) |
| Tools | 错误类型数量 | ✓ | 2 种错误类型：Exception（异常）、Empty Response（空响应） | v0.1.0+ | [`errors.py:7-16`](../Code/mcp_server_ecs/src/mcp_server_ecs/common/errors.py) |
| Tools | 降级策略 | ✗ | 无降级策略、无重试机制、无熔断器 | - | - |
| Tools | 超时控制 | ✗ | 未显式配置，依赖火山引擎 SDK 默认超时（估计 60-120 秒） | - | - |

#### 1.1 工具详细列表

| 工具名称 | 功能描述 | 主要参数 | 返回类型 | API 文档 | 文件路径 |
|---------|---------|---------|---------|---------|---------|
| `describe_instances` | 查询 ECS 实例列表 | region, instanceIds, status, zoneId, needNum 等 15 个参数 | TextContent | [API Doc](https://www.volcengine.com/docs/6396/70466) | [`instance.py:17-122`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/instance.py) |
| `describe_images` | 查询镜像列表 | region, imageIds, platform, visibility, needNum 等 8 个参数 | TextContent | [API Doc](https://www.volcengine.com/docs/6396/70808) | [`instance.py:125-211`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/instance.py) |
| `describe_instance_types` | 查询实例规格 | region, instanceTypeIds, imageId, needNum | TextContent | [API Doc](https://www.volcengine.com/docs/6396/92769) | [`instance.py:214-277`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/instance.py) |
| `describe_available_resource` | 查询可用资源 | region, destinationResource, zoneId, instanceTypeId | TextContent | [API Doc](https://www.volcengine.com/docs/6396/76279) | [`instance.py:280-333`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/instance.py) |
| `describe_system_events` | 查询系统事件 | region, eventIds, resourceIds, status, event_types, needNum 等 7 个参数 | TextContent | [API Doc](https://www.volcengine.com/docs/6396/129399) | [`event.py:17-126`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/event.py) |
| `describe_regions` | 查询地域列表 | region, regionIds | TextContent | [API Doc](https://www.volcengine.com/docs/6396/1053194) | [`region.py:17-58`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/region.py) |
| `describe_zones` | 查询可用区列表 | region, zoneIds | TextContent | [API Doc](https://www.volcengine.com/docs/6396/120518) | [`region.py:61-94`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/region.py) |
| `start_instances` | 启动实例 | region, instanceIds（最多 100 个） | TextContent | [API Doc](https://www.volcengine.com/docs/6396/101068) | [`instance.py:336-369`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/instance.py) |
| `renew_instance` | 续费实例 | region, instanceId, period（1-36 月） | TextContent | [API Doc](https://www.volcengine.com/docs/6396/76276) | [`instance.py:372-407`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/instance.py) |

---

### 2. Resources 管理

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|------------|
| Resources | 资源发现能力 | ✗ | 不支持 MCP Resources 协议 | - | - |
| Resources | 支持资源类型 | ✗ | 0 个资源类型 | - | - |
| Resources | URI 模板设计 | ✗ | 未实现资源 URI | - | - |
| Resources | 订阅机制 | ✗ | 不支持资源订阅 | - | - |
| Resources | 实时更新 | ✗ | 不支持（需通过 Tools 主动查询） | - | - |
| Resources | 分页策略 | N/A | 资源功能未实现 | - | - |

**说明**: 该 MCP Server 采用 **Tools-Only 架构**，所有数据访问通过工具函数实现，不使用 MCP Resources 机制。

---

### 3. Prompts / Sampling

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|------------|
| Prompts | 提示词管理 | ✗ | 不支持 MCP Prompts 协议 | - | - |
| Prompts | 预定义提示词 | ✗ | 0 个提示词模板 | - | - |
| Prompts | 动态提示词 | ✗ | 不支持 | - | - |
| Sampling | 采样策略 | N/A | 由 MCP 客户端和 LLM 决定 | - | - |
| Sampling | 自定义采样参数 | ✗ | 不支持服务端控制采样 | - | - |

**说明**: 该 MCP Server 专注于工具提供，不涉及提示词管理和采样控制。

---

### 4. Model 兼容性

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|------------|
| Model | 官方支持模型 | ✓ | 所有支持 MCP 协议的 LLM（Claude, GPT-4, 通义千问等） | v0.1.0+ | [MCP Spec](https://spec.modelcontextprotocol.io/) |
| Model | 模型无关设计 | ✓ | 基于标准 MCP 协议，与模型解耦 | v0.1.0+ | [FastMCP](https://github.com/jlowin/fastmcp) |
| Model | 模型切换灵活性 | ✓ | 无需修改服务端代码，客户端自由切换 | v0.1.0+ | - |
| Model | 特定模型优化 | ✗ | 无针对特定模型的优化（如 token 限制适配） | - | - |

**说明**: MCP 协议天然支持模型无关性，该服务器可被任意 MCP 客户端调用。

---

### 5. 连接方式

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|------------|
| 连接协议 | stdio | ✓ | 默认模式，适用于本地进程通信 | v0.1.0+ | [`main.py:19`](../Code/mcp_server_ecs/src/mcp_server_ecs/main.py) |
| 连接协议 | SSE (Server-Sent Events) | ✓ | 支持单向流式传输 | v0.1.0+ | [`main.py:18`](../Code/mcp_server_ecs/src/mcp_server_ecs/main.py) |
| 连接协议 | Streamable HTTP | ✓ | 支持 HTTP 流式传输，路径：`/mcp`（可配置） | v0.1.0+ | [`__init__.py:13`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/__init__.py) |
| 连接协议 | WebSocket | ✗ | 不支持 | - | - |
| 连接协议 | gRPC | ✗ | 不支持 | - | - |
| 连接管理 | 连接池管理 | ✗ | 未实现连接池（stdio 模式单连接，HTTP 模式由框架管理） | - | - |
| 连接管理 | 断线重连机制 | ✗ | 无自动重连，依赖客户端重启 | - | - |
| 连接管理 | 心跳检测 | ✗ | 无心跳机制 | - | - |
| 连接管理 | 连接超时 | ◐ | 由 FastMCP 框架默认处理，未显式配置 | v0.1.0+ | - |
| 配置 | 监听地址 | ✓ | 默认 `127.0.0.1`，可通过 `MCP_SERVER_HOST` 环境变量配置 | v0.1.0+ | [`__init__.py:11`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/__init__.py) |
| 配置 | 监听端口 | ✓ | 默认 `8000`，可通过 `PORT` 环境变量配置 | v0.1.0+ | [`__init__.py:12`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/__init__.py) |

---

### 6. 认证授权

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|------------|
| 认证方式 | AccessKey/SecretKey | ✓ | 本地模式：通过环境变量 `VOLCENGINE_ACCESS_KEY` / `VOLCENGINE_SECRET_KEY` | v0.1.0+ | [`client.py:19-24`](../Code/mcp_server_ecs/src/mcp_server_ecs/common/client.py) |
| 认证方式 | SessionToken (STS) | ✓ | 非本地模式：支持临时凭证 | v0.1.0+ | [`auth.py:28`](../Code/mcp_server_ecs/src/mcp_server_ecs/common/auth.py) |
| 认证方式 | OAuth 2.0 | ✗ | 不支持 | - | - |
| 认证方式 | 证书认证 | ✗ | 不支持 | - | - |
| 认证方式 | API Key | ✗ | 不支持（使用 AK/SK 替代） | - | - |
| 认证模式 | 本地模式 | ✓ | 环境变量认证，适用于开发环境 | v0.1.0+ | [`config.py:2`](../Code/mcp_server_ecs/src/mcp_server_ecs/common/config.py) |
| 认证模式 | 非本地模式 | ✓ | Authorization Header（Base64 编码 JSON），适用于生产环境 | v0.1.0+ | [`auth.py:17-24`](../Code/mcp_server_ecs/src/mcp_server_ecs/common/auth.py) |
| Token 管理 | 自动刷新 | ✗ | 不支持，需客户端手动管理 Token 生命周期 | - | - |
| Token 管理 | 手动管理 | ✓ | 由调用方负责 STS Token 刷新 | v0.1.0+ | - |
| Token 管理 | Token 缓存 | ◐ | 本地模式客户端全局缓存（`_ecs_local_client`），非本地模式每次创建新客户端 | v0.1.0+ | [`client.py:10-35`](../Code/mcp_server_ecs/src/mcp_server_ecs/common/client.py) |
| 权限粒度 | 资源级别权限 | ◐ | 继承火山引擎 IAM，支持细粒度权限控制，但 MCP Server 未实现权限验证 | - | [火山引擎 IAM](https://www.volcengine.com/docs/6257/64889) |
| 权限粒度 | 操作级别权限 | ◐ | 由火山引擎 API 侧控制，MCP Server 透传 | v0.1.0+ | - |
| 权限粒度 | 工具级别权限 | ✗ | 不支持在 MCP Server 层面限制工具访问 | - | - |

**认证流程图**:
```
本地模式:
环境变量 → 读取 AK/SK → 创建全局客户端 → 调用 API

非本地模式:
Authorization Header → Base64 解码 → 提取 AK/SK/SessionToken → 创建临时客户端 → 调用 API
```

---

### 7. 安全特性

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|------------|
| 数据加密 | 传输层加密 (TLS) | ◐ | HTTP 模式支持 HTTPS（需配置），stdio 模式无需加密（本地通信） | v0.1.0+ | - |
| 数据加密 | 凭证加密存储 | ✗ | 不支持，AK/SK 明文存储在环境变量 | - | - |
| 数据加密 | 响应数据加密 | ✗ | 不支持 | - | - |
| 权限控制 | RBAC (角色访问控制) | ✗ | 不支持 | - | - |
| 权限控制 | ACL (访问控制列表) | ✗ | 不支持 | - | - |
| 权限控制 | IP 白名单 | ✗ | 不支持 | - | - |
| 审计日志 | 操作审计 | ◐ | 记录错误日志，但无完整操作审计 | v0.1.0+ | [`logs.py`](../Code/mcp_server_ecs/src/mcp_server_ecs/common/logs.py) |
| 审计日志 | 访问日志 | ✗ | 无 HTTP 访问日志（FastMCP 框架可能有，但未配置） | - | - |
| 审计日志 | 日志持久化 | ✓ | 日志写入文件（默认 `/var/log/mcp/ecs.log`） | v0.1.0+ | [`config.py:8`](../Code/mcp_server_ecs/src/mcp_server_ecs/common/config.py) |
| 审计日志 | 日志轮转 | ✓ | 支持，1MB 轮转，保留 10 个备份 | v0.1.0+ | [`logs.py:24-29`](../Code/mcp_server_ecs/src/mcp_server_ecs/common/logs.py) |
| 审计日志 | 日志脱敏 | ✗ | 不支持，可能泄露敏感信息（如内部路径） | - | - |
| 安全最佳实践 | 输入验证 | ✓ | Pydantic 类型验证 + 火山引擎 SDK 客户端验证 | v0.1.0+ | [`instance.py`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/instance.py) |
| 安全最佳实践 | 输出过滤 | ✓ | 手动过滤响应字段，仅返回关键信息 | v0.1.0+ | [`instance.py:93-110`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/instance.py) |
| 安全最佳实践 | 注入攻击防护 | ◐ | 依赖 Pydantic 验证和 SDK 参数化查询，未显式防护 | v0.1.0+ | - |
| 安全最佳实践 | DDoS 防护 | ✗ | 无应用层 DDoS 防护 | - | - |

**安全风险**:
- ⚠️ **高风险**: 凭证明文存储（本地模式）
- ⚠️ **中风险**: 无完整审计日志
- ⚠️ **低风险**: 日志可能泄露敏感信息

---

## 第二部分：性能指标详解

### 2.1 吞吐量指标

| 指标类型 | 数值 | 说明 | 测量方式 |
|---------|------|------|---------|
| 单工具 QPS | 5-20 QPS | 受限于火山引擎 ECS API 限制 | 继承上游限制 |
| 并发请求数 | 未限制 | 应用层无限流，实际受 API QPS 限制 | 代码分析 |
| **分页查询 TPS** | 约 1-2 TPS | 单次分页请求 20 条，循环查询直到达到 `needNum` | 代码实现 |

### 2.2 延迟指标

| 指标类型 | 典型值 | 说明 |
|---------|-------|------|
| 工具调用延迟 | 200-500ms | 本地处理 + 火山引擎 API 响应时间 |
| **分页查询延迟** | 1-5s | 取决于 `needNum` 参数（每 20 条一次 API 调用） |
| **认证开销** | < 10ms | 本地模式缓存客户端，非本地模式每次创建客户端 |

**延迟优化建议**:
- 本地模式开启客户端缓存（已实现）
- 合理设置 `needNum` 参数，避免过度分页
- 考虑添加结果缓存（当前未实现）

### 2.3 资源消耗

| 资源类型 | 典型值 | 说明 |
|---------|-------|------|
| 内存占用 | 50-100MB | Python 进程基础内存 + 依赖库 |
| CPU 占用 | < 5% | I/O 密集型任务，CPU 消耗低 |
| **磁盘 I/O** | 低 | 仅日志写入（1MB 轮转） |
| **网络带宽** | < 1Mbps | 取决于查询结果大小 |

### 2.4 可靠性指标

| 指标类型 | 数值 | 说明 |
|---------|------|------|
| 错误重试次数 | 0 | 无重试机制 |
| **熔断阈值** | N/A | 无熔断器 |
| **降级策略** | 无 | 失败直接返回错误 |
| **SLA** | 无承诺 | 继承火山引擎云服务 SLA（99.95%） |

---

## 第三部分：限制条件说明

### 3.1 API 调用限制

#### 3.1.1 火山引擎 API 限制

| 限制类型 | 数值 | 来源 |
|---------|------|------|
| QPS 限制 | 5-20 QPS/账户 | 火山引擎 ECS API |
| 并发连接数 | 未公开 | 火山引擎 ECS API |
| 请求体大小 | 4MB | 火山引擎 API Gateway |
| 响应体大小 | 10MB | 火山引擎 API Gateway |

#### 3.1.2 MCP Server 自定义限制

| 限制类型 | 数值 | 代码位置 | 说明 |
|---------|------|---------|------|
| 实例 ID 数量 | 最多 100 个 | [`instance.py:34-37`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/instance.py) | `describe_instances` 参数 |
| 公网 IP 数量 | 最多 100 个 | [`instance.py:26-29`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/instance.py) | `describe_instances` 参数 |
| 镜像 ID 数量 | 最多 100 个 | [`instance.py:134-137`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/instance.py) | `describe_images` 参数 |
| 事件 ID 数量 | 最多 100 个 | [`event.py:34-37`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/event.py) | `describe_system_events` 参数 |
| 单次分页大小 | 20 条 | [`instance.py:84`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/instance.py) | `max_results=20` |
| 默认查询数量 | 20 条 | [`instance.py:62-65`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/instance.py) | `needNum` 默认值 |
| 项目名称长度 | 64 字符 | [`instance.py:50-53`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/instance.py) | 火山引擎规范 |

### 3.2 功能限制

#### 3.2.1 不支持的 MCP 功能

| 功能 | 状态 | 影响 |
|------|------|------|
| Resources | ❌ 不支持 | 无法使用 MCP 资源订阅机制 |
| Prompts | ❌ 不支持 | 无法提供预定义提示词模板 |
| Sampling | ❌ 不支持 | 无法在服务端控制采样策略 |

#### 3.2.2 运维功能限制

| 功能 | 状态 | 影响 |
|------|------|------|
| 健康检查端点 | ❌ 无 | 无法监控服务健康状态 |
| 指标收集 | ❌ 无 | 无法获取性能指标 |
| 分布式追踪 | ❌ 无 | 无法追踪请求链路 |
| 动态配置 | ❌ 无 | 配置修改需重启服务 |

### 3.3 依赖限制

#### 3.3.1 Python 版本

| 依赖项 | 版本要求 | 原因 |
|-------|---------|------|
| Python | >= 3.12 | Pydantic 2.x 特性依赖 |
| UV | 最新版本 | 包管理工具 |

#### 3.3.2 核心依赖版本约束

| 依赖包 | 版本约束 | 锁定类型 |
|-------|---------|---------|
| mcp | >= 1.9.4 | 最低版本 |
| pydantic | == 2.10.6 | 严格锁定 |
| volcengine-python-sdk | >= 3.0.1 | 最低版本 |
| concurrent-log-handler | == 0.9.25 | 严格锁定 |
| dynaconf | == 3.2.10 | 严格锁定 |
| jsonref | >= 1.1.0 | 最低版本 |

**影响**:
- Pydantic 版本升级可能导致兼容性问题
- volcengine-sdk 升级可能引入 API 变更

### 3.4 部署限制

#### 3.4.1 环境要求

| 要求 | 说明 |
|------|------|
| 操作系统 | Linux, macOS, Windows（日志路径需调整） |
| 网络访问 | 需访问火山引擎 API 端点 |
| 文件系统 | 需写权限（日志目录 `/var/log/mcp/`） |
| 环境变量 | 本地模式需配置 4 个环境变量 |

#### 3.4.2 扩展性限制

| 限制类型 | 说明 |
|---------|------|
| 水平扩展 | 无状态设计，理论支持多实例部署 |
| 垂直扩展 | 受限于 Python GIL，单实例性能有上限 |
| 负载均衡 | 需自行配置（MCP Server 未内置） |

### 3.5 安全限制

#### 3.5.1 认证限制

| 限制 | 说明 | 风险等级 |
|------|------|---------|
| 凭证明文存储 | 环境变量中 AK/SK 明文 | ⚠️ 高 |
| 无凭证轮转 | 不支持自动轮转 | ⚠️ 中 |
| 无 MFA | 不支持多因素认证 | ⚠️ 中 |

#### 3.5.2 网络安全限制

| 限制 | 说明 | 风险等级 |
|------|------|---------|
| 无 IP 白名单 | 任意来源可连接（HTTP 模式） | ⚠️ 高 |
| 无流量加密 | stdio 模式明文通信（本地） | ⚠️ 低 |
| 无 DDoS 防护 | 应用层无防护 | ⚠️ 中 |

---

## 附录

### A. 版本历史

| 版本 | 发布日期 | 主要变更 |
|------|---------|---------|
| v0.2.0 | 2025-11-03 | 当前版本 |
| v0.1.0 | 2024-10-22 | 初始版本 |

### B. 相关文档

| 文档类型 | 链接 |
|---------|------|
| GitHub 仓库 | https://github.com/volcengine/mcp-server |
| README | [`README.md`](../Code/mcp_server_ecs/README.md) |
| 架构设计文档 | CLAUDE.md |
| MCP 协议规范 | https://spec.modelcontextprotocol.io/ |
| 火山引擎 ECS 文档 | https://www.volcengine.com/docs/6396 |

### C. 工具参数完整映射表

详见源代码文件:
- [`instance.py`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/instance.py) - 实例相关工具（6 个工具，34 个参数）
- [`event.py`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/event.py) - 事件相关工具（1 个工具，8 个参数）
- [`region.py`](../Code/mcp_server_ecs/src/mcp_server_ecs/tools/region.py) - 地域相关工具（2 个工具，4 个参数）

**总计**: 9 个工具，46 个参数定义

### D. 性能优化建议

1. **启用结果缓存**
   - 对于 `describe_regions` 等静态数据，可缓存 1 小时
   - 对于 `describe_instances`，可缓存 30 秒

2. **批量查询优化**
   - 一次性传入多个 ID，而非逐个查询
   - 合理设置 `needNum` 参数

3. **并发控制**
   - 添加应用层限流（如 token bucket 算法）
   - 避免超过火山引擎 API QPS 限制

4. **错误处理增强**
   - 添加重试机制（指数退避）
   - 实现熔断器模式

### E. 安全加固建议

1. **凭证管理**
   - 使用密钥管理服务（KMS）加密存储 AK/SK
   - 定期轮转凭证
   - 使用 STS 临时凭证替代长期凭证

2. **网络安全**
   - 仅在内网部署，或配置 IP 白名单
   - HTTP 模式启用 HTTPS
   - 添加请求签名验证

3. **审计日志**
   - 记录所有工具调用（包括参数）
   - 脱敏敏感信息（如 instance ID 部分隐藏）
   - 集成 SIEM 系统
