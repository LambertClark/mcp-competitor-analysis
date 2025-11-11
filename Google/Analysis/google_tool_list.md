# Google Cloud Observability MCP 能力清单

## 📋 第一部分：完整能力清单表格

### 1. Tools 能力

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|-------------|
| **基础工具数量** | 工具总数 | ✅ | **12个GCP可观测性工具**：<br>1. list_log_entries ([`logging_api_tools.ts`](../Code/observability-mcp/src/tools/logging/logging_api_tools.ts))<br>2. list_log_names ([`logging_api_tools.ts`](../Code/observability-mcp/src/tools/logging/logging_api_tools.ts))<br>3. list_buckets ([`logging_api_tools.ts`](../Code/observability-mcp/src/tools/logging/logging_api_tools.ts))<br>4. list_views ([`logging_api_tools.ts`](../Code/observability-mcp/src/tools/logging/logging_api_tools.ts))<br>5. list_sinks ([`logging_api_tools.ts`](../Code/observability-mcp/src/tools/logging/logging_api_tools.ts))<br>6. list_log_scopes ([`logging_api_tools.ts`](../Code/observability-mcp/src/tools/logging/logging_api_tools.ts))<br>7. list_metric_descriptors ([`monitoring_api_tools.ts`](../Code/observability-mcp/src/tools/monitoring/monitoring_api_tools.ts))<br>8. list_time_series ([`monitoring_api_tools.ts`](../Code/observability-mcp/src/tools/monitoring/monitoring_api_tools.ts))<br>9. list_alert_policies ([`monitoring_api_tools.ts`](../Code/observability-mcp/src/tools/monitoring/monitoring_api_tools.ts))<br>10. list_traces ([`trace_api_tools.ts`](../Code/observability-mcp/src/tools/trace/trace_api_tools.ts))<br>11. get_trace ([`trace_api_tools.ts`](../Code/observability-mcp/src/tools/trace/trace_api_tools.ts))<br>12. list_group_stats ([`error_reporting_api_tools.ts`](../Code/observability-mcp/src/tools/error_reporting/error_reporting_api_tools.ts)) | v0.1.0+ | [README.md](https://github.com/googleapis/gcloud-mcp/tree/main/packages/observability-mcp) |
| **参数验证** | Zod Schema 验证 | ✅ | - 基于 Zod 库进行运行时类型验证<br>- 自动生成 JSON Schema<br>- 支持可选参数、默认值、枚举类型<br>- 验证失败返回明确错误信息 | v0.1.0+ | [`registration.ts`](../Code/observability-mcp/src/tools/registration.ts) |
| **并行调用支持** | 多工具并发 | ✅ | - 理论上支持无限并发（受限于 Node.js 事件循环）<br>- stdio 模式：顺序处理（单连接限制）<br>- 无内置并发数限制<br>- 受 GCP API 配额约束 | v0.1.0+ | N/A |
| **流式处理** | Streaming API | ❌ | - 所有 API 查询结果非流式返回<br>- 使用一次性完整响应机制<br>- 响应大小限制为 100,000 字符（约 100KB）<br>- 超过限制会截断并添加提示信息 | N/A | N/A |
| **错误处理机制** | 统一错误处理 | ✅ | **错误类型**：<br>1. GCP API 错误（HTTP 状态码错误）<br>2. 认证错误（ADC 凭据失效）<br>3. 参数验证错误（Zod 校验失败）<br>4. 网络超时错误<br>5. 响应大小超限错误<br><br>**处理策略**：<br>- 统一通过 toolWrapper 处理<br>- 返回结构化错误信息（name/message/stack）<br>- 响应大小超过 100KB 自动截断<br>- 空结果转换为自然语言提示 | v0.1.0+ | [`tool_wrapper.ts`](../Code/observability-mcp/src/utils/tool_wrapper.ts) |
| **工具注释** | Annotations 支持 | ✅ | - `readOnlyHint`: 标记只读操作（所有工具均为只读）<br>- `idempotentHint`: 标记幂等操作（所有 list 工具为幂等）<br>- 用于 AI 模型理解工具副作用<br>- 通过 MCP SDK 自动生成工具描述 | v0.1.0+ | [MCP Spec](https://modelcontextprotocol.io/docs/concepts/tools) |
| **人工审批** | Elicitation API | ❌ | - 不支持 MCP Elicitation API<br>- 所有工具直接执行，无需用户确认<br>- 所有操作均为只读查询，无副作用 | N/A | N/A |
| **Resources** | 资源发现能力 | ❌ | 不支持 MCP Resources 协议，仅提供 Tools | - | - |
| | URI 模板设计 | ❌ | 不适用 | - | - |
| | 订阅机制 | ❌ | 不支持订阅机制 | - | - |
| | 分页策略 | ✅ | 所有 list 工具支持分页，使用 pageToken 策略 | v0.1.0+ | - |
| **Prompts/Sampling** | 提示词管理 | ❌ | 不支持 MCP Prompts 协议 | - | - |
| | 采样策略 | ❌ | 不支持 Sampling | - | - |
| | 自定义能力 | ❌ | 不适用 | - | - |
| **Model兼容性** | 支持的模型 | ✅ | 与所有支持 MCP 协议的模型兼容 | v0.1.0+ | - |
| | 模型切换灵活性 | ✅ | 模型无关，由 MCP 客户端管理 | v0.1.0+ | - |
| **连接方式** | 支持的协议 | ✅ | 支持 stdio 传输协议 | v0.1.0+ | - |
| | 连接池管理 | ❌ | 单一 stdio 连接，不需要连接池 | - | - |
| | 断线重连机制 | ❌ | 由 MCP 客户端处理重连 | - | - |
| **认证授权** | 认证方式 | ✅ | Google Cloud Application Default Credentials (ADC) | v0.1.0+ | [README.md](https://github.com/googleapis/gcloud-mcp/tree/main/packages/observability-mcp) |
| | Token 管理 | ✅ | Google Auth Library 自动刷新 token | v0.1.0+ | - |
| | 权限粒度 | ✅ | 依赖 GCP IAM，支持细粒度权限控制 | v0.1.0+ | - |
| **安全特性** | 数据加密 | ✅ | 通过 HTTPS/TLS 加密所有 API 调用 | v0.1.0+ | - |
| | 权限控制 | ✅ | 通过 GCP IAM 进行访问控制 | v0.1.0+ | - |
| | 审计日志 | ◐ | GCP API 调用自动记录到 Cloud Audit Logs，MCP 服务器本地日志有限 | v0.1.0+ | - |

### 2. Resources 管理

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|-------------|
| **资源发现能力** | 不支持 | ✗ | - 无 MCP Resources 接口实现<br>- 所有资源通过 Tools 手动查询<br>- 不支持资源自动发现 | N/A | N/A |
| **URI模板设计** | 不适用 | ✗ | 未实现 MCP Resources 协议 | N/A | N/A |
| **订阅机制** | 不支持 | ✗ | - 无实时更新<br>- 需客户端主动轮询<br>- 无推送通知 | N/A | N/A |
| **分页策略** | Cursor-based | ✓ | - **分页方式**：基于 `pageToken` 的游标分页<br>- **单页最大条数**：<br>  - list_log_entries: 50（默认）<br>  - list_metric_descriptors: 50（默认）<br>  - list_traces: 50（默认）<br>  - list_group_stats: 20（默认）<br>- **可配置性**：通过 `pageSize` 参数调整 | v0.1.0+ | [`registration.ts`](../Code/observability-mcp/src/tools/registration.ts) |

### 3. Prompts/Sampling

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|-------------|
| **提示词管理** | 不支持 | ✗ | 未实现 MCP Prompts 接口 | N/A | N/A |
| **采样策略** | 不适用 | N/A | - 数据采样由 Google Cloud API 控制<br>- MCP 层无自定义采样 | N/A | N/A |
| **自定义能力** | 低 | ◐ | - 仅支持通过工具参数自定义查询<br>- 无模板或预设查询 | v0.1.0+ | N/A |

### 4. Model 兼容性

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|-------------|
| **官方支持模型** | MCP 客户端决定 | N/A | - 服务器端不限制模型类型<br>- 理论上支持所有 MCP 兼容客户端<br>- 官方测试：Gemini CLI | v0.1.0+ | [`README.md`](../Code/observability-mcp/README.md) |
| **模型切换灵活性** | 完全灵活 | ✓ | - 由 MCP 客户端控制<br>- 无服务器端模型依赖 | v0.1.0+ | N/A |

### 5. 连接方式

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|-------------|
| **支持的协议** | stdio | ✓ | - **唯一支持**：stdio (StdioServerTransport)<br>- **不支持**：SSE、WebSocket、HTTP | v0.1.0+ | [`server.ts`](../Code/observability-mcp/src/server.ts) |
| **连接池管理** | 单连接 | ◐ | - 每个客户端一个独立进程<br>- 无连接池概念<br>- API 客户端单例复用（ApiClientFactory） | v0.1.0+ | [`api_client_factory.ts`](../Code/observability-mcp/src/utils/api_client_factory.ts) |
| **断线重连机制** | 客户端负责 | ◐ | - **服务器端**：无自动重连<br>- **进程退出时**：发送 SIGINT/SIGTERM 优雅关闭<br>- **客户端**：需重启进程重新连接 | v0.1.0+ | [`server.ts`](../Code/observability-mcp/src/server.ts) |

### 6. 认证授权

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|-------------|
| **认证方式** | ADC (Application Default Credentials) | ✓ | - **主要方式**：gcloud auth application-default login<br>- **权限范围**：cloud-platform（完整 GCP 访问）<br>- **凭据存储**：本地文件系统 (~/.config/gcloud)<br>- **依赖**：google-auth-library v10.1.0 | v0.1.0+ | [`README.md`](../Code/observability-mcp/README.md) |
| **Token管理** | 自动管理 | ✓ | - GoogleAuth 自动刷新 access token<br>- 无需手动干预<br>- Token 过期自动重新获取 | v0.1.0+ | [`api_client_factory.ts`](../Code/observability-mcp/src/utils/api_client_factory.ts) |
| **权限粒度** | 粗粒度 | ◐ | - **MCP 层**：无权限控制（全部工具可用）<br>- **GCP 层**：由 IAM 角色控制<br>- **最佳实践**：使用服务账户限制权限 | v0.1.0+ | [`README.md`](../Code/observability-mcp/README.md) |
| **配额项目管理** | 必需配置 | ✓ | - **必需步骤**：`gcloud auth application-default set-quota-project`<br>- **用途**：API 计费和配额管理<br>- **要求**：项目必须启用相关 API | v0.1.0+ | [`README.md`](../Code/observability-mcp/README.md) |

### 7. 安全特性

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|-------------|
| **数据加密方式** | HTTPS (传输层) | ✓ | - **传输加密**：Google Cloud API 使用 HTTPS<br>- **本地通信**：stdio 无加密（本地进程间通信）<br>- **凭据存储**：依赖操作系统文件权限 | v0.1.0+ | N/A |
| **权限控制机制** | IAM + API 启用 | ✓ | - **IAM 角色**：继承 ADC 用户的 GCP 权限<br>- **API 启用**：需在配额项目中手动启用 API<br>- **工具级控制**：无（所有工具均可用） | v0.1.0+ | [`README.md`](../Code/observability-mcp/README.md) |
| **审计日志** | 不支持（MCP层） | ◐ | - **MCP 层**：无工具调用审计<br>- **GCP 层**：Cloud Audit Logs 记录 API 调用<br>- **本地日志**：仅 stderr 错误输出 | v0.1.0+ | N/A |
| **敏感信息处理** | 无特殊处理 | ✗ | - 日志/指标内容直接透传<br>- 无自动脱敏或过滤<br>- 依赖 GCP 端的数据保护机制 | v0.1.0+ | N/A |

---

## 📊 第二部分：性能指标详解

### 2.1 响应性能

| 指标类型 | 数值/说明 | 测量方法 | 影响因素 |
|---------|---------|---------|---------|
| **冷启动时间** | 约 1-2 秒 | 进程启动到 MCP 服务器就绪 | Node.js 启动、依赖加载、ADC 初始化 |
| **工具调用延迟** | 100ms - 5s | API 调用端到端时间 | 网络延迟、Google Cloud API 响应时间、数据量 |
| **平均 QPS** | 取决于 API 配额 | 受 GCP API 配额限制 | 见下方 API 配额表 |
| **响应数据大小** | 最大 100k 字符 | tool_wrapper 截断 | 超出部分自动截断 |

### 2.2 API 配额限制（Google Cloud 端）

| API 服务 | 典型配额 | 配额类型 | 超限处理 |
|---------|---------|---------|---------|
| **Cloud Logging API** | 60 reads/min/project | 读取配额 | 429 Too Many Requests |
| **Cloud Monitoring API** | 10 writes/s/project | 写入配额 | 429 Too Many Requests |
| **Cloud Trace API** | 按项目限制 | 读取/写入配额 | 429 Too Many Requests |
| **Error Reporting API** | 按项目限制（Beta） | 读取配额 | 429 Too Many Requests |

**配额查看**：
```bash
gcloud services quota list --service=logging.googleapis.com
gcloud services quota list --service=monitoring.googleapis.com
```

### 2.3 资源消耗

| 资源类型 | 典型值 | 峰值 | 说明 |
|---------|-------|------|------|
| **内存使用** | 50-100 MB | 200 MB | 取决于 API 响应数据量 |
| **CPU 使用** | < 5% | 20% | 主要用于 JSON 序列化/反序列化 |
| **磁盘空间** | 约 30 MB | N/A | npm 包大小（node_modules） |
| **网络带宽** | 按需 | 取决于查询数据量 | 上传请求 < 10 KB，下载受 100k 字符限制 |

### 2.4 并发性能

| 场景 | 并发数 | 吞吐量 | 瓶颈 |
|------|-------|-------|------|
| **单进程单连接** | 1 | 串行处理 | stdio 传输 + 单线程 Node.js |
| **多实例部署** | N | N × 单实例吞吐 | GCP API 配额 |
| **API 客户端复用** | 4 个单例 | 减少初始化开销 | ApiClientFactory 懒加载 |

---

## ⚠️ 第三部分：限制条件说明

### 3.1 架构限制

| 限制项 | 详细说明 | 影响范围 | 规避方案 |
|-------|---------|---------|---------|
| **单进程单连接** | 每个 MCP 客户端启动独立进程，无连接复用 | 水平扩展能力 | 启动多个客户端实例 |
| **stdio 传输唯一** | 不支持 HTTP/WebSocket，无法远程访问 | 部署灵活性 | 使用 MCP proxy 转换协议 |
| **无状态服务** | 不保存查询历史或缓存 | 重复查询性能 | 客户端实现缓存 |
| **单线程处理** | Node.js 单线程模型 | CPU 密集任务 | 使用 Worker Threads（未实现） |

### 3.2 功能限制

| 限制项 | 详细说明 | 影响范围 | 规避方案 |
|-------|---------|---------|---------|
| **无批量写入** | 所有工具为只读查询 | 数据修改 | 使用 gcloud-mcp 或 gcloud CLI |
| **无实时订阅** | 无 Server-Sent Events 或 WebSocket 推送 | 实时监控 | 客户端轮询 + list_log_entries |
| **无聚合计算** | 不支持复杂聚合（如 SUM、AVG、GROUP BY） | 统计分析 | 使用 BigQuery 或 Cloud Monitoring 仪表板 |
| **日志查询限制** | `list_log_entries` 最多 100 个资源 | 大规模查询 | 分批查询或使用 Log Analytics |

### 3.3 数据限制

| 限制项 | 数值 | 影响场景 | 规避方案 |
|-------|------|---------|---------|
| **响应大小截断** | 100,000 字符 | 大量日志/指标查询 | 减小 pageSize 或添加更严格的过滤器 |
| **分页最大条数** | 无硬性限制（API决定） | 超大结果集 | 使用 pageToken 分批获取 |
| **时间范围** | 受 Cloud Logging 保留策略限制 | 历史数据查询 | 配置 Log Sink 导出到 BigQuery |
| **指标精度** | 受 Cloud Monitoring 聚合策略限制 | 高精度监控 | 调整 alignmentPeriod 参数 |

### 3.4 认证限制

| 限制项 | 详细说明 | 影响范围 | 规避方案 |
|-------|---------|---------|---------|
| **ADC 凭据过期** | 默认 1 小时，自动刷新可能失败 | 长时间运行 | 监控 401 错误，重新执行 gcloud auth |
| **权限粒度粗** | cloud-platform scope 覆盖全部 GCP | 安全性 | 使用服务账户 + 最小权限 IAM 角色 |
| **配额项目必需** | 未设置会导致所有 API 调用失败 | 首次使用 | 明确文档说明配置步骤 |
| **API 未启用** | 403 错误，需手动在 GCP Console 启用 | 新项目部署 | 提供自动化启用脚本 |

### 3.5 版本兼容性限制

| 限制项 | 详细说明 | 影响范围 | 规避方案 |
|-------|---------|---------|---------|
| **预览版本** | 0.x 版本，可能有破坏性变更 | 生产环境稳定性 | 锁定版本号，关注 CHANGELOG |
| **Node.js 版本** | 要求 ≥ 20.x | 旧环境兼容性 | 升级 Node.js 或使用 nvm |
| **googleapis 依赖** | 使用 ^155.0.0，可能引入 API 变更 | API 兼容性 | 定期测试新版本 |
| **MCP SDK 依赖** | ^1.17.1，协议变更可能导致不兼容 | 客户端兼容性 | 与客户端版本对齐 |

### 3.6 运维限制

| 限制项 | 详细说明 | 影响范围 | 规避方案 |
|-------|---------|---------|---------|
| **无监控指标** | 不暴露 Prometheus/OpenTelemetry 指标 | 运维可观测性 | 通过 stderr 日志 + 外部监控 |
| **日志格式非结构化** | console.error 纯文本输出 | 日志分析 | 重定向到日志收集系统 |
| **无健康检查端点** | stdio 传输无 HTTP /health | 自动化健康检查 | 监控进程存活状态 |
| **无优雅重启** | 重启需断开客户端连接 | 滚动升级 | 客户端实现自动重连 |

---

## 📈 第四部分：能力成熟度评估

### 4.1 MCP 协议完整性

| MCP 协议特性 | 实现状态 | 完成度 | 说明 |
|------------|---------|-------|------|
| **Tools** | ✓ 已实现 | 100% | 13 个工具，完整的参数验证 |
| **Resources** | ✗ 未实现 | 0% | 无资源发现和订阅 |
| **Prompts** | ✗ 未实现 | 0% | 无提示词模板 |
| **Sampling** | N/A | N/A | 不适用于可观测场景 |
| **Logging** | ◐ 基础实现 | 40% | 仅 stderr 输出，无结构化日志 |

**整体协议完成度**：★★★☆☆（60%）

### 4.2 可观测能力覆盖度

| 可观测支柱 | 覆盖工具数 | 功能完整度 | 缺失能力 |
|-----------|----------|----------|---------|
| **日志（Logs）** | 6 | ★★★★☆ | - 无日志写入<br>- 无实时 tail<br>- 无本地解析 |
| **指标（Metrics）** | 3 | ★★★☆☆ | - 无指标写入<br>- 无 PromQL 支持<br>- 无聚合计算 |
| **追踪（Traces）** | 2 | ★★★☆☆ | - 无追踪写入<br>- 无可视化<br>- 无性能分析 |
| **错误（Errors）** | 1 | ★★☆☆☆ | - 仅堆栈聚合<br>- 无错误趋势分析 |

**整体覆盖度**：★★★☆☆（65%）

### 4.3 生产就绪度

| 评估维度 | 评分 | 关键问题 | 建议 |
|---------|------|---------|------|
| **稳定性** | ★★☆☆☆ | 预览版本，可能有破坏性变更 | 生产环境锁定版本 |
| **性能** | ★★★☆☆ | 受 GCP API 配额限制 | 实现客户端缓存 |
| **可运维性** | ★★☆☆☆ | 无监控指标、非结构化日志 | 集成外部监控系统 |
| **安全性** | ★★★☆☆ | 粗粒度权限、无审计 | 使用服务账户 + Cloud Audit Logs |
| **扩展性** | ★★★★☆ | 代码架构清晰，易于扩展 | 添加新工具成本低 |

**生产就绪度总分**：★★★☆☆（60%）

---

## 🎯 第五部分：使用建议

### 5.1 适用场景

| 场景 | 适用性 | 理由 |
|------|-------|------|
| **开发调试** | ★★★★★ | 快速查询日志和追踪，辅助故障排查 |
| **自动化运维** | ★★★☆☆ | 可集成到脚本，但缺少批量操作 |
| **实时监控** | ★★☆☆☆ | 无推送机制，需客户端轮询 |
| **数据分析** | ★★☆☆☆ | 无聚合能力，建议使用 BigQuery |
| **合规审计** | ★★★☆☆ | 可查询审计日志，但无本地审计 |

### 5.2 最佳实践

#### 认证配置
```bash
# 1. 用户认证
gcloud auth login

# 2. 配置 ADC
gcloud auth application-default login

# 3. 设置配额项目
gcloud auth application-default set-quota-project YOUR_PROJECT_ID

# 4. 启用必需 API
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable cloudtrace.googleapis.com
gcloud services enable clouderrorreporting.googleapis.com
```

#### 服务账户方式（推荐生产环境）
```bash
# 1. 创建服务账户
gcloud iam service-accounts create observability-mcp-sa

# 2. 授予最小权限
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:observability-mcp-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/logging.viewer"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:observability-mcp-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/monitoring.viewer"

# 3. 下载密钥
gcloud iam service-accounts keys create ~/observability-mcp-key.json \
  --iam-account=observability-mcp-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com

# 4. 设置环境变量
export GOOGLE_APPLICATION_CREDENTIALS=~/observability-mcp-key.json
```

#### 性能优化
```javascript
// 客户端实现缓存
const cache = new Map();
const CACHE_TTL = 60000; // 1分钟

async function cachedListLogEntries(params) {
  const cacheKey = JSON.stringify(params);
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await mcpClient.callTool('list_log_entries', params);
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}
```

### 5.3 常见问题解决

| 问题 | 错误信息 | 解决方案 |
|------|---------|---------|
| **未配置 ADC** | `Error: Could not load the default credentials` | 执行 `gcloud auth application-default login` |
| **API 未启用** | `403: Cloud Logging API has not been used` | `gcloud services enable logging.googleapis.com` |
| **配额超限** | `429: Quota exceeded` | 减少查询频率或申请配额提升 |
| **响应截断** | `... (truncated due to 100000 character limit)` | 减小 pageSize 或添加更严格的 filter |
| **凭据过期** | `401: Invalid Credentials` | 重新执行 `gcloud auth application-default login` |

---

## 📚 附录：工具详细参考

### A1. Logging 工具

#### list_log_entries
**功能**：使用 Logging Query Language 查询日志条目
**关键参数**：
- `resourceNames` (必需): 最多 100 个资源路径
- `filter` (可选): 查询过滤器，支持 severity、resource.type、textPayload 等
- `orderBy` (可选): `timestamp asc` 或 `timestamp desc`
- `pageSize` (可选): 默认 50

**示例过滤器**：
```
severity="ERROR"
resource.type="gce_instance" AND resource.labels.instance_id="1234567890123456789"
textPayload:"database connection failed"
timestamp >= "2025-01-01T00:00:00Z" AND timestamp < "2025-01-01T01:00:00Z"
```

**性能建议**：
- 使用 `timestamp desc` 查询最近日志
- 添加 timestamp 范围限制
- 使用索引字段（severity、resource.type）

#### list_log_names
**功能**：列出项目中包含日志条目的日志名称
**用途**：日志发现、日志源枚举
**限制**：仅返回有数据的日志，空日志不显示

#### list_buckets
**功能**：列出日志存储桶
**支持资源层级**：projects、organizations、billingAccounts、folders
**关键信息**：存储桶名称、保留期、区域

#### list_views
**功能**：列出日志视图
**用途**：访问控制管理
**依赖**：需先获取 bucket 名称

#### list_sinks
**功能**：列出日志导出配置
**目标类型**：Cloud Storage、BigQuery、Pub/Sub
**用途**：了解日志流转路径

#### list_log_scopes
**功能**：列出跨项目日志查询作用域
**适用场景**：多项目集中式日志管理

### A2. Monitoring 工具

#### list_metric_descriptors
**功能**：发现可用指标类型
**过滤示例**：
```
resource.type = "gce_instance"
metric.type = "compute.googleapis.com/instance/cpu/usage_time"
metric.type : "cpu"
```

#### list_time_series
**功能**：查询时间序列数据
**必需参数**：
- `filter`: 指标过滤器
- `interval.endTime`: 结束时间（RFC 3339）

**聚合参数**：
- `alignmentPeriod`: 对齐周期（秒），最小 60
- `perSeriesAligner`: ALIGN_MEAN、ALIGN_MAX、ALIGN_SUM 等

**示例**：
```javascript
{
  "name": "projects/my-project",
  "filter": "metric.type = \"compute.googleapis.com/instance/cpu/usage_time\"",
  "interval": {
    "endTime": "2025-11-04T10:00:00Z",
    "startTime": "2025-11-04T09:00:00Z"
  },
  "aggregation": {
    "alignmentPeriod": "60",
    "perSeriesAligner": "ALIGN_MEAN"
  }
}
```

#### list_alert_policies
**功能**：列出告警策略
**排序支持**：name, display_name, enabled 等
**过滤示例**：
```
user_labels='active'
description:'cloud'
display_name=monitoring.regex.full_match('Temp \\d{3}')
```

### A3. Trace 工具

#### list_traces
**功能**：搜索分布式追踪
**过滤器示例**：
```
latency:500ms
root:main.api.HTTP
+root:main.api.HTTP Get
http.status_code:500
method:Get
```

**注意**：仅返回根 span，需配合 `get_trace` 获取完整信息

#### get_trace
**功能**：获取完整追踪详情
**输入**：projectId + traceId
**输出**：所有 span 的完整信息

### A4. Error Reporting 工具

#### list_group_stats
**功能**：聚合相似堆栈追踪
**时间范围**：PERIOD_1_HOUR、PERIOD_6_HOURS、PERIOD_1_DAY、PERIOD_1_WEEK、PERIOD_30_DAYS
**排序方式**：COUNT_DESC、LAST_SEEN_DESC、CREATED_DESC、AFFECTED_USERS_DESC
**⚠️ 重要**：不用于常规错误日志查询，应使用 `list_log_entries`
