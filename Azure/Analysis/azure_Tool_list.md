# Azure MCP Server 完整能力清单

## 工具名称生成机制说明

Azure MCP Server的工具名称是根据命令组层次结构自动生成的，遵循以下规则：

1. **命名模式**: `azmcp_{area}_{subgroup1}_{subgroup2}_{command}`
2. **分隔符**: 使用下划线 `_` 连接各个层级
3. **生成过程**:
   - 从根命令组 `azmcp` 开始
   - 添加区域名称（如 `foundry`）
   - 递归添加子组名称（如 `knowledge`、`index`）
   - 最后添加命令名称（如 `list`）

**示例**:
- Foundry区域的知识索引列表命令：`azmcp_foundry_knowledge_index_list`
- Storage区域的账户列表命令：`azmcp_storage_account_list`

**重要说明**: 工具名称是在运行时通过CommandFactory自动生成的，不会作为硬编码字段出现在具体的命令类文件中。每个命令类（如`KnowledgeIndexListCommand.cs`）只包含命令的执行逻辑，工具名称由命令注册时的层次结构决定。

## 目录

- [第一部分：完整能力清单](#第一部分完整能力清单)
  - [1. Tools能力](#1-tools能力)
  - [2. Resources管理](#2-resources管理)
  - [3. Prompts/Sampling](#3-promptssampling)
  - [4. Model兼容性](#4-model兼容性)
  - [5. 连接方式](#5-连接方式)
  - [6. 认证授权](#6-认证授权)
  - [7. 安全特性](#7-安全特性)
  - [8. 可观测性](#8-可观测性)
  - [9. 扩展性](#9-扩展性)
  - [10. 部署方式](#10-部署方式)
- [第二部分：性能指标详解](#第二部分性能指标详解)
- [第三部分：限制条件说明](#第三部分限制条件说明)
- [第四部分：工具清单](#第四部分工具清单)
- [第五部分：工具命名模式映射表](#第五部分工具命名模式映射表)

---

## 第一部分：完整能力清单

### 1. Tools能力

| 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 性能指标 | 官方文档 |
|-----------|---------|---------|---------|---------|---------|
| **基础工具数量** | ✓ 完全支持 | 提供**200+个工具**，覆盖**33个Azure服务**领域 | v0.1.0+ | 启动时间: 2-5秒 | [`README.md`](Azure/azure-mcp/README.md) |
| **工具分类** | ✓ 完全支持 | 33个服务领域：Storage, Cosmos, KeyVault, Monitor, SQL, ACR, AKS, App Config, Search, Service Bus, Redis, PostgreSQL, MySQL, Kusto, Load Testing, Virtual Desktop, Grafana, Foundry, Deploy, Quota, Best Practices等 | v0.1.0+ | - | [`README.md`](Azure/azure-mcp/README.md) |
| **参数验证机制** | ✓ 完全支持 | - JSON Schema验证（MCP协议层）<br>- System.CommandLine参数验证<br>- 自定义业务规则验证<br>- 类型安全的.NET强类型验证 | v0.1.0+ | 验证延迟: <10ms | [`new-command.md`](Azure/azure-mcp/docs/new-command.md) |
| **并行调用支持** | ✓ 完全支持 | - 支持并行调用，无内置并发限制<br>- 受Azure SDK的限流策略约束<br>- 受Azure订阅配额限制<br>- MCP客户端控制并发度 | v0.1.0+ | 并发数: 无限制（受Azure API约束） | - |
| **流式处理支持** | ✗ 不支持 | - MCP协议支持流式响应<br>- Azure MCP未实现streaming<br>- 所有响应为批量返回 | - | - | - |
| **错误处理机制** | ✓ 完全支持 | - 8种错误类型分类<br>- 支持重试策略：指数退避/固定间隔<br>- 默认重试3次，延迟2-10秒<br>- 详细错误消息和堆栈跟踪<br>- 优雅降级到fallback凭据 | v0.1.0+ | 默认重试3次，延迟2-10秒 | [`new-command.md`](Azure/azure-mcp/docs/new-command.md) |
| **多运行模式** | ✓ 完全支持 | - **all模式**: 暴露所有工具<br>- **namespace模式**: 按服务命名空间分组<br>- **single模式**: 单一工具动态路由<br>- **namespace过滤**: 加载指定服务 | v0.3.0+ | namespace模式启动最快 | [`azmcp-commands.md`](Azure/azure-mcp/docs/azmcp-commands.md) |
| **只读模式** | ✓ 完全支持 | `--read-only`标志过滤破坏性操作，仅暴露读取类工具 | v0.4.0+ | - | [`azmcp-commands.md`](Azure/azure-mcp/docs/azmcp-commands.md) |
| **批量操作** | ◐ 部分支持 | - Storage Blob批量层级设置<br>- 批量查询（Cosmos, Kusto）<br>- 无通用批量操作框架 | v0.2.0+ | - | - |
| **工具元数据** | ✓ 完全支持 | - 每个工具包含名称、描述、参数Schema<br>- 标记破坏性操作（destructive=true）<br>- 服务区域标记（telemetry） | v0.1.0+ | - | - |

**关键工具列表（部分示例）**:

- **Storage**: `azmcp_storage_account_list`, `azmcp_storage_blob_upload`, `azmcp_storage_queue_message_send`
- **Cosmos DB**: `azmcp_cosmos_database_container_item_query`, `azmcp_cosmos_database_list`
- **Key Vault**: `azmcp_keyvault_secret_list`, `azmcp_keyvault_certificate_create`
- **Monitor**: `azmcp_monitor_workspace_log_query`, `azmcp_monitor_metrics_query`
- **SQL**: `azmcp_sql_database_show`, `azmcp_sql_firewall_rule_list`
- **Search**: `azmcp_search_index_query`, `azmcp_search_index_list`

完整列表见[第四部分](#第四部分工具清单)。

---

### 2. Resources管理

| 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 性能指标 | 官方文档 |
|-----------|---------|---------|---------|---------|---------|
| **资源发现能力** | ✗ 不支持 | - 不符合MCP Resources协议规范<br>- 无标准资源发现机制<br>- 通过工具间接查询资源 | - | - | - |
| **资源类型支持** | ✓ 完全支持 | **200+种Azure资源类型**（通过工具访问）：<br>- 存储账户、Blob、Queue、Table、File Share<br>- Cosmos DB账户、数据库、容器<br>- SQL数据库、弹性池<br>- Key Vault密钥、证书、密文<br>- 监控工作区、指标<br>- ACR注册表、AKS集群<br>- 等等 | v0.1.0+ | - | [`azmcp-commands.md`](Azure/azure-mcp/docs/azmcp-commands.md) |
| **URI模板设计** | ✗ 不支持 | - 不符合MCP Resources URI规范<br>- 不支持`resource://`协议 | - | - | - |
| **订阅机制** | ✗ 不支持 | - 不符合MCP Resources订阅规范<br>- 无实时资源变更通知 | - | - | - |
| **分页策略** | ✗ 不支持 | - 不符合MCP Resources分页规范<br>- 无标准分页机制 | - | - | - |
| **资源图查询** | ✓ 完全支持 | - Azure Resource Graph查询（KQL语法）<br>- 跨订阅、跨资源组查询<br>- 高性能资源发现 | v0.5.0+ | 查询性能: 取决于Azure | - |
| **资源缓存** | ✗ 不支持 | - 不符合MCP Resources缓存规范<br>- 无资源级缓存机制 | - | - | - |

---

### 3. Prompts/Sampling

| 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 性能指标 | 官方文档 |
|-----------|---------|---------|---------|---------|---------|
| **提示词管理** | ✗ 不支持 | - 不符合MCP Prompts协议规范<br>- 无动态提示词管理能力 | - | - | - |
| **采样策略** | ✗ 不支持 | - 不符合MCP Sampling规范<br>- 无统一采样框架 | - | - | - |
| **自定义能力** | ✗ 不支持 | - 不符合MCP Prompts/Sampling规范<br>- 无标准自定义机制 | - | - | - |
| **LLM指令注入** | ✓ 完全支持 | - Server instructions引导LLM使用最佳实践<br>- 工具描述优化（v0.5.7+）<br>- 命令组描述改进 | v0.5.7+ | - | [`CHANGELOG.md`](Azure/azure-mcp/CHANGELOG.md) |

---

### 4. Model兼容性

| 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 性能指标 | 官方文档 |
|-----------|---------|---------|---------|---------|---------|
| **官方支持模型** | ✓ 完全支持 | - **GitHub Copilot** (GPT-4, GPT-3.5-turbo)<br>- **Claude** (通过VS Code MCP支持)<br>- 任何支持MCP协议的模型 | v0.1.0+ | - | [`README.md`](Azure/azure-mcp/README.md) |
| **其他模型兼容性** | ✓ 完全支持 | - Anthropic Claude<br>- Google Gemini<br>- Groq<br>- Ollama<br>- OpenAI<br>- OpenRouter<br>- 任何MCP客户端 | v0.1.0+ | - | [MCP规范](https://modelcontextprotocol.io) |
| **模型切换灵活性** | ✓ 完全支持 | - MCP Server无模型依赖<br>- 由MCP客户端控制模型选择<br>- 支持运行时切换模型 | - | - | - |
| **Bring Your Own Key** | ✓ 完全支持 | - VS Code支持自定义LLM API Key<br>- 可使用自己的OpenAI/Anthropic等API密钥 | VS Code 1.101+ | - | [`TROUBLESHOOTING.md`](Azure/azure-mcp/TROUBLESHOOTING.md) |

---

### 5. 连接方式

| 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 性能指标 | 官方文档 |
|-----------|---------|---------|---------|---------|---------|
| **支持的协议** | ◐ 部分支持 | - **stdio** (标准输入输出) ✓<br>- **SSE** (已移除) ✗<br>- **WebSocket** ✗<br>- **HTTP/REST** ✗ | v0.4.0+ | - | [`README.md`](Azure/azure-mcp/README.md) |
| **stdio通信** | ✓ 完全支持 | - 标准输入输出通信<br>- 跨平台兼容（Windows/Linux/macOS）<br>- 单进程单连接<br>- 低延迟（<50ms） | v0.1.0+ | 延迟: <50ms | - |
| **SSE传输** | ✗ 已移除 | - v0.4.0因安全漏洞移除<br>- MCP规范2025-03-26废弃SSE<br>- 不建议使用旧版本 | <v0.4.0 | - | [`README.md`](Azure/azure-mcp/README.md) |
| **WebSocket** | ✗ 不支持 | 未实现WebSocket传输 | - | - | - |
| **HTTP传输** | ✗ 不支持 | 未实现HTTP/REST端点 | - | - | - |
| **连接池管理** | ✗ 不适用 | - stdio单进程通信<br>- 无连接池概念<br>- MCP客户端管理进程生命周期 | - | - | - |
| **断线重连机制** | ◐ 客户端负责 | - MCP客户端负责重启server进程<br>- Server无状态，重启无影响<br>- 无自动重连逻辑 | - | - | - |

---

### 6. 认证授权

| 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 性能指标 | 官方文档 |
|-----------|---------|---------|---------|---------|---------|
| **认证方式** | ✓ 完全支持 | **8种凭据自动fallback链**：<br>1. EnvironmentCredential（环境变量）<br>2. WorkloadIdentityCredential（K8s工作负载标识）*<br>3. ManagedIdentityCredential（托管标识）*<br>4. VisualStudioCredential（VS登录）<br>5. AzureCliCredential（az cli登录）<br>6. AzurePowerShellCredential（PowerShell登录）<br>7. AzureDeveloperCliCredential（azd登录）<br>8. InteractiveBrowserCredential（浏览器登录）<br><br>* 需设置`AZURE_MCP_INCLUDE_PRODUCTION_CREDENTIALS=true` | v0.1.0+ | 首次认证: 5-30秒 | [`Authentication.md`](Azure/azure-mcp/docs/Authentication.md) |
| **DefaultAzureCredential** | ✓ 完全支持 | - 自定义凭据链（基于Azure Identity SDK）<br>- 自动fallback到下一个凭据<br>- 智能凭据选择 | v0.1.0+ | - | [`Authentication.md`](Azure/azure-mcp/docs/Authentication.md) |
| **Broker认证** | ✓ 完全支持 | - Windows WAM (Web Account Manager) Broker<br>- 设置`AZURE_MCP_ONLY_USE_BROKER_CREDENTIAL=true`<br>- 账户选择对话框<br>- macOS/Linux降级到浏览器登录 | v0.3.0+ | - | [`Authentication.md`](Azure/azure-mcp/docs/Authentication.md) |
| **Service Principal** | ✓ 完全支持 | - 通过环境变量配置：<br>  - `AZURE_CLIENT_ID`<br>  - `AZURE_CLIENT_SECRET`<br>  - `AZURE_TENANT_ID`<br>- 支持证书认证（`AZURE_CLIENT_CERTIFICATE_PATH`） | v0.1.0+ | - | [`Authentication.md`](Azure/azure-mcp/docs/Authentication.md) |
| **Managed Identity** | ✓ 完全支持 | - Azure托管标识（系统分配/用户分配）<br>- 需启用生产凭据<br>- 适用于Azure VM、App Service、AKS等 | v0.1.0+ | - | [`Authentication.md`](Azure/azure-mcp/docs/Authentication.md) |
| **Token管理** | ✓ 完全支持 | - Azure Identity SDK自动刷新token<br>- Token有效期约60分钟<br>- 自动后台刷新，无需手动干预 | v0.1.0+ | Token有效期: 60分钟 | - |
| **权限粒度** | ✓ 细粒度 | - Azure RBAC角色级别<br>- 支持数据平面和管理平面权限<br>- 订阅/资源组/资源级别范围<br>- 示例角色：Storage Blob Data Reader, Contributor, Owner | v0.1.0+ | - | [`Authentication.md`](Azure/azure-mcp/docs/Authentication.md) |
| **多租户支持** | ✓ 完全支持 | - 通过`--tenant-id`指定租户<br>- VS Code全局设置`@azure.argTenant`<br>- 支持跨租户资源访问 | v0.1.0+ | - | [`TROUBLESHOOTING.md`](Azure/azure-mcp/TROUBLESHOOTING.md) |
| **条件访问策略** | ✓ 完全支持 | - 支持Azure Entra ID条件访问<br>- MFA（多因素认证）<br>- 设备合规性检查<br>- 位置限制 | v0.1.0+ | - | [`Authentication.md`](Azure/azure-mcp/docs/Authentication.md) |

---

### 7. 安全特性

| 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 性能指标 | 官方文档 |
|-----------|---------|---------|---------|---------|---------|
| **数据加密** | ✓ 完全支持 | - 所有Azure API调用强制HTTPS/TLS<br>- 传输层加密（TLS 1.2+）<br>- 凭据由Azure Identity SDK安全管理 | v0.1.0+ | - | [`SECURITY.md`](Azure/azure-mcp/SECURITY.md) |
| **TLS/SSL** | ✓ 完全支持 | - 所有Azure API调用强制HTTPS<br>- 支持企业CA证书信任<br>- TLS 1.2+协议 | v0.1.0+ | - | - |
| **凭据存储** | ✓ 完全支持 | - **不存储凭据**<br>- 使用操作系统凭据管理器（Windows凭据管理器、macOS Keychain、Linux Secret Service）<br>- Token缓存由Azure Identity SDK管理 | v0.1.0+ | - | [`README.md`](Azure/azure-mcp/README.md) |
| **权限控制机制** | ✓ 完全支持 | - Azure RBAC（基于角色的访问控制）<br>- 条件访问策略（Conditional Access）<br>- 最小权限原则<br>- 数据平面权限（如Storage Blob Data Reader） | v0.1.0+ | - | [`Authentication.md`](Azure/azure-mcp/docs/Authentication.md) |
| **审计日志** | ✓ 完全支持 | - Azure活动日志（Azure平台级别）<br>- 记录所有资源操作<br>- 可集成Azure Monitor日志分析 | - | - | - |
| **MCP Server审计** | ◐ 部分支持 | - OpenTelemetry遥测（可选）<br>- EventSource日志<br>- 工具调用追踪 | v0.3.0+ | - | [`TROUBLESHOOTING.md`](Azure/azure-mcp/TROUBLESHOOTING.md) |
| **只读模式** | ✓ 完全支持 | - `--read-only`标志<br>- 自动过滤破坏性工具<br>- 防止意外修改资源 | v0.4.0+ | - | [`azmcp-commands.md`](Azure/azure-mcp/docs/azmcp-commands.md) |
| **SQL注入防护** | ✓ 完全支持 | - MySQL/Postgres查询**仅限SELECT**<br>- 禁止DELETE、UPDATE、DROP等破坏性操作<br>- 查询语句安全验证 | v0.5.0+ | - | [`CHANGELOG.md`](Azure/azure-mcp/CHANGELOG.md) |
| **敏感数据过滤** | ◐ 部分支持 | - 不主动收集敏感数据到遥测<br>- 订阅GUID哈希后收集<br>- 不记录凭据和资源内容 | v0.1.0+ | - | [`README.md`](Azure/azure-mcp/README.md) |
| **代码签名** | ◐ 部分支持 | - NPM包签名<br>- Docker镜像来自Microsoft Container Registry (MCR)<br>- 未明确提及二进制签名 | v0.1.0+ | - | - |
| **本地认证禁用** | ✓ 完全支持 | - 支持Azure资源禁用本地认证密钥<br>- 强制使用Entra ID + RBAC<br>- 符合企业安全合规 | v0.1.0+ | - | [`TROUBLESHOOTING.md`](Azure/azure-mcp/TROUBLESHOOTING.md) |

---

### 8. 可观测性

| 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 性能指标 | 官方文档 |
|-----------|---------|---------|---------|---------|---------|
| **EventSource日志** | ✓ 完全支持 | - Provider: `Microsoft-Extensions-Logging`<br>- 日志级别: Trace, Debug, Info, Warning, Error<br>- 结构化日志格式<br>- 跨平台支持 | v0.1.0+ | CPU开销: <5% | [`TROUBLESHOOTING.md`](Azure/azure-mcp/TROUBLESHOOTING.md) |
| **OpenTelemetry** | ✓ 完全支持 | - 支持OTLP导出<br>- 默认端点: `localhost:4317` (gRPC)<br>- 启用: `OTEL_DISABLE_SDK=false`<br>- 支持traces、metrics、logs | v0.3.0+ | CPU开销: <10% | [`TROUBLESHOOTING.md`](Azure/azure-mcp/TROUBLESHOOTING.md) |
| **Azure Monitor** | ✓ 完全支持 | - 通过`APPLICATIONINSIGHTS_CONNECTION_STRING`集成<br>- Application Insights遥测<br>- 实时监控和告警 | v0.3.0+ | - | [`TROUBLESHOOTING.md`](Azure/azure-mcp/TROUBLESHOOTING.md) |
| **Aspire Dashboard** | ✓ 完全支持 | - 本地开发可视化监控<br>- Docker镜像: `mcr.microsoft.com/dotnet/aspire-dashboard:9.0`<br>- Web UI: `http://localhost:18888` | v0.3.0+ | - | [`TROUBLESHOOTING.md`](Azure/azure-mcp/TROUBLESHOOTING.md) |
| **遥测数据** | ✓ 完全支持 | - 工具调用次数和延迟<br>- 错误率和异常类型<br>- 服务区域使用统计<br>- 订阅GUID（哈希）<br>- 默认开启，可通过`AZURE_MCP_COLLECT_TELEMETRY=false`禁用 | v0.1.0+ | 数据量: 1-10KB/调用 | [`README.md`](Azure/azure-mcp/README.md) |
| **分布式追踪** | ✓ 完全支持 | - OpenTelemetry traces<br>- 跨服务调用追踪<br>- 性能瓶颈分析 | v0.3.0+ | - | - |
| **指标收集** | ✓ 完全支持 | - OpenTelemetry metrics<br>- 工具执行时间<br>- 内存和CPU使用率 | v0.3.0+ | - | - |
| **dotnet-trace支持** | ✓ 完全支持 | - 跨平台性能分析<br>- 生成`.nettrace`文件<br>- 命令: `dotnet-trace collect -p {pid}` | v0.1.0+ | - | [`TROUBLESHOOTING.md`](Azure/azure-mcp/TROUBLESHOOTING.md) |
| **PerfView支持** | ✓ 完全支持 | - Windows性能分析<br>- EventSource可视化<br>- CPU、内存、GC分析 | v0.1.0+ | - | [`TROUBLESHOOTING.md`](Azure/azure-mcp/TROUBLESHOOTING.md) |
| **日志级别配置** | ✓ 完全支持 | - VS Code: Command Palette → Set Log Level<br>- 支持Trace, Debug, Info, Warning, Error<br>- 默认: Info | v0.1.0+ | - | [`TROUBLESHOOTING.md`](Azure/azure-mcp/TROUBLESHOOTING.md) |

---

### 9. 扩展性

| 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 性能指标 | 官方文档 |
|-----------|---------|---------|---------|---------|---------|
| **插件架构** | ✓ 完全支持 | - Area模块化设计<br>- 独立命名空间（storage, cosmos, keyvault等）<br>- 每个area独立编译和测试 | v0.1.0+ | - | [`CONTRIBUTING.md`](Azure/azure-mcp/CONTRIBUTING.md) |
| **自定义Area** | ✓ 完全支持 | - 添加新服务模块（需重新编译）<br>- 遵循约定：Commands/, Services/, Models/, Options/<br>- 实现`{Service}Setup.cs`注册 | v0.1.0+ | - | [`new-command.md`](Azure/azure-mcp/docs/new-command.md) |
| **外部MCP服务器** | ✓ 完全支持 | - 通过配置文件集成外部MCP服务<br>- 支持stdio和SSE传输<br>- 服务发现和命名空间过滤 | v0.4.0+ | - | [`CONTRIBUTING.md`](Azure/azure-mcp/CONTRIBUTING.md) |
| **AOT编译** | ✓ 完全支持 | - .NET 9 NativeAOT兼容<br>- 启动提速50%+<br>- 内存占用减少30-40%<br>- 所有依赖AOT兼容 | v0.5.0+ | 启动提速50%+ | [`aot-compatibility.md`](Azure/azure-mcp/docs/aot-compatibility.md) |
| **动态工具加载** | ✓ 完全支持 | - 运行时选择工具集（`--namespace`）<br>- 减少启动时间和内存占用<br>- 支持多命名空间组合 | v0.1.0+ | - | [`azmcp-commands.md`](Azure/azure-mcp/docs/azmcp-commands.md) |
| **中央包管理** | ✓ 完全支持 | - `Directory.Packages.props`统一版本管理<br>- 避免版本冲突<br>- 简化依赖升级 | v0.1.0+ | - | - |

---

### 10. 部署方式

| 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 性能指标 | 官方文档 |
|-----------|---------|---------|---------|---------|---------|
| **VS Code扩展** | ✓ 完全支持 | - 一键安装，自动配置<br>- Marketplace: `ms-azuretools.vscode-azure-mcp-server`<br>- 与GitHub Copilot深度集成 | v0.1.0+ | 安装时间: 2分钟 | [`README.md`](Azure/azure-mcp/README.md) |
| **NPX部署** | ✓ 完全支持 | - 即用即走，自动更新（`@latest`）<br>- 命令: `npx -y @azure/mcp@latest server start`<br>- 无需全局安装 | v0.1.0+ | 首次下载: 10-50MB | [`README.md`](Azure/azure-mcp/README.md) |
| **NPM全局安装** | ✓ 完全支持 | - `npm install -g @azure/mcp`<br>- 固定版本，手动更新<br>- 启动速度快 | v0.1.0+ | - | [`README.md`](Azure/azure-mcp/README.md) |
| **Docker容器** | ✓ 完全支持 | - MCR官方镜像: `mcr.microsoft.com/azure-sdk/azure-mcp:latest`<br>- 基于.NET 9 ASP.NET Runtime<br>- Debian Bookworm Slim | v0.2.0+ | 镜像大小: ~200MB | [`README.md`](Azure/azure-mcp/README.md) |
| **源码编译** | ✓ 完全支持 | - 需要: .NET 9 SDK + Node.js 20+ + PowerShell 7+<br>- 命令: `dotnet build`<br>- 支持本地调试 | v0.1.0+ | 构建时间: 2-5分钟 | [`CONTRIBUTING.md`](Azure/azure-mcp/CONTRIBUTING.md) |
| **Kubernetes部署** | ◐ 部分支持 | - 可用WorkloadIdentity认证<br>- 需配置`AZURE_MCP_INCLUDE_PRODUCTION_CREDENTIALS=true`<br>- 无官方Helm Chart | v0.1.0+ | - | [`Authentication.md`](Azure/azure-mcp/docs/Authentication.md) |

---

## 第二部分：性能指标详解

### 启动性能

| 指标名称 | 典型值 | 最大值 | 影响因素 | 优化建议 |
|---------|-------|-------|---------|---------|
| **Server启动时间** | 2-5秒 | 10秒 | .NET运行时、工具数量、系统负载 | 使用`--namespace`加载特定服务 |
| **AOT编译启动** | 1-2秒 | 3秒 | AOT编译开启 | 生产环境使用AOT构建 |
| **首次工具发现** | 100-500ms | 2秒 | 工具数量、文件系统速度 | 减少加载的命名空间 |

### 认证性能

| 指标名称 | 典型值 | 最大值 | 影响因素 | 优化建议 |
|---------|-------|-------|---------|---------|
| **首次Azure登录** | 5-30秒 | 60秒 | 网络延迟、认证方式、MFA | 使用已缓存的凭据 |
| **Token刷新** | 100-500ms | 2秒 | 网络延迟、Azure AD性能 | 自动后台刷新 |
| **Broker认证** | 2-10秒 | 30秒 | WAM响应速度、用户交互 | 提前登录 |

### 工具调用性能

| 指标名称 | 典型值 | 最大值 | 影响因素 | 优化建议 |
|---------|-------|-------|---------|---------|
| **参数验证** | <10ms | 50ms | 参数复杂度 | 使用简单参数 |
| **Azure API调用** | 100ms-5s | 30秒 | API类型、数据量、区域延迟 | 选择最近区域 |
| **KQL查询** | 500ms-10s | 60秒 | 查询复杂度、数据量 | 优化查询语句 |
| **Storage操作** | 50-500ms | 5秒 | 文件大小、网络带宽 | 使用批量操作 |

### 并发性能

| 指标名称 | 典型值 | 最大值 | 影响因素 | 优化建议 |
|---------|-------|-------|---------|---------|
| **stdio通信** | 单进程 | 单进程 | MCP协议限制 | 使用多个MCP server实例 |
| **Azure API并发** | 无限制 | 订阅配额 | Azure订阅限流 | 遵循Azure限流策略 |
| **工具并行调用** | 支持 | 无硬限制 | MCP客户端实现 | 客户端控制并发度 |

### 内存占用

| 指标名称 | 典型值 | 最大值 | 影响因素 | 优化建议 |
|---------|-------|-------|---------|---------|
| **.NET进程内存** | 50-200MB | 500MB | 加载的工具数、缓存大小 | 使用`--namespace`减少工具 |
| **AOT内存** | 30-100MB | 300MB | AOT编译 | 生产环境优化 |
| **Token缓存** | 1-5MB | 20MB | 多租户、多订阅 | 定期清理过期token |

### 网络性能

| 指标名称 | 典型值 | 最大值 | 影响因素 | 优化建议 |
|---------|-------|-------|---------|---------|
| **Azure API延迟** | 10-200ms | 1000ms | 地理位置、网络质量 | 使用CDN或最近区域 |
| **下载带宽** | 取决于网络 | 10Gbps | 网络环境、Azure限速 | 使用高速网络 |
| **上传带宽** | 取决于网络 | 10Gbps | 网络环境、Azure限速 | 使用高速网络 |

### 可靠性指标

| 指标名称 | 典型值 | 最大值 | 影响因素 | 优化建议 |
|---------|-------|-------|---------|---------|
| **错误重试** | 3次 | 10次 | `--retry-max-retries`配置 | 根据场景调整 |
| **重试延迟** | 2-10秒 | 60秒 | `--retry-delay/max-delay`配置 | 指数退避策略 |
| **网络超时** | 100秒 | 600秒 | `--retry-network-timeout`配置 | 长时操作增加超时 |

### 监控开销

| 指标名称 | 典型值 | 最大值 | 影响因素 | 优化建议 |
|---------|-------|-------|---------|---------|
| **EventSource日志** | <5% CPU | 10% CPU | 日志级别 | 生产环境用Info级别 |
| **OpenTelemetry** | <10% CPU | 20% CPU | 采样率、导出频率 | 使用采样降低开销 |
| **遥测数据量** | 1-10KB/工具调用 | 100KB | 启用的遥测项 | 禁用详细遥测 |

---

## 第三部分：限制条件说明

### 工具限制

| 限制项 | 限制值 | 解决方案 | 相关文档 |
|-------|-------|---------|---------|
| **VS Code工具数上限** | 128个工具/请求 | 使用`--namespace`或`--mode single/namespace` | [`TROUBLESHOOTING.md#128-tool-limit`](Azure/azure-mcp/TROUBLESHOOTING.md#128-tool-limit-issue) |
| **全量工具数量** | 200+个工具 | 分批加载，使用命名空间过滤 | - |
| **单个工具复杂度** | 无硬限制 | 遵循MCP规范 | - |

### 认证限制

| 限制项 | 限制值 | 解决方案 | 相关文档 |
|-------|-------|---------|---------|
| **Microsoft账户类型** | 仅支持Entra ID | 使用组织账户或创建Entra租户 | [`TROUBLESHOOTING.md#AADSTS500200`](Azure/azure-mcp/TROUBLESHOOTING.md#aadsts500200-error-user-account-is-a-personal-microsoft-account) |
| **Token有效期** | 60分钟（自动刷新） | 无需手动干预 | - |
| **多租户** | 需明确指定tenantId | 配置`@azure.argTenant`或`--tenant-id` | [`TROUBLESHOOTING.md`](Azure/azure-mcp/TROUBLESHOOTING.md#primary-access-token-from-wrong-issuer) |
| **条件访问策略** | 可能阻止认证 | 联系IT管理员配置例外 | [`Authentication.md`](Azure/azure-mcp/docs/Authentication.md#authentication-with-conditional-access-policies) |

### 网络限制

| 限制项 | 限制值 | 解决方案 | 相关文档 |
|-------|-------|---------|---------|
| **必需端点** | `login.microsoftonline.com:443` | 配置防火墙白名单 | [`Authentication.md`](Azure/azure-mcp/docs/Authentication.md#firewall-configuration-requirements) |
| **企业代理** | 可能需要配置`HTTP_PROXY` | 设置环境变量或系统代理 | [`Authentication.md`](Azure/azure-mcp/docs/Authentication.md#proxy-configuration) |
| **私有端点** | 需VPN/ExpressRoute访问 | 连接企业网络 | [`Authentication.md`](Azure/azure-mcp/docs/Authentication.md#authentication-with-private-endpoints) |
| **DNS解析** | 私有端点需正确DNS配置 | 配置private link DNS | [`Authentication.md`](Azure/azure-mcp/docs/Authentication.md#dns-configuration) |

### Azure服务限制

| 限制项 | 限制值 | 解决方案 | 相关文档 |
|-------|-------|---------|---------|
| **API限流** | 取决于Azure订阅 | 遵循Azure SDK重试策略 | - |
| **订阅配额** | 取决于订阅类型 | 申请配额提升 | - |
| **区域可用性** | 某些服务限定区域 | 选择支持的区域 | - |
| **RBAC权限** | 需要适当的角色分配 | 联系订阅管理员分配权限 | [`Authentication.md`](Azure/azure-mcp/docs/Authentication.md) |

### 数据限制

| 限制项 | 限制值 | 解决方案 | 相关文档 |
|-------|-------|---------|---------|
| **Storage Blob大小** | 最大190.7 TiB | Azure Storage限制 | Azure文档 |
| **KQL查询结果** | 取决于Log Analytics配置 | 使用分页或限制结果集 | - |
| **SQL查询类型** | 仅支持SELECT | 安全限制，防止破坏性操作 | [`CHANGELOG.md`](Azure/azure-mcp/CHANGELOG.md) |
| **Cosmos查询** | 受RU配额限制 | 优化查询或增加RU | - |

### 部署限制

| 限制项 | 限制值 | 解决方案 | 相关文档 |
|-------|-------|---------|---------|
| **.NET运行时版本** | 需要.NET 9.0+ | 安装最新.NET SDK | [`README.md`](Azure/azure-mcp/README.md) |
| **Node.js版本** | 需要Node 20+（NPX） | 升级Node.js | [`README.md`](Azure/azure-mcp/README.md) |
| **PowerShell版本** | 需要PS 7.0+（开发） | 安装PowerShell Core | [`CONTRIBUTING.md`](Azure/azure-mcp/CONTRIBUTING.md) |
| **操作系统** | Windows/Linux/macOS | 跨平台支持 | - |
| **Docker平台** | linux/amd64 | 使用兼容的Docker主机 | [`Dockerfile`](Azure/azure-mcp/Dockerfile) |

### 协议限制

| 限制项 | 限制值 | 解决方案 | 相关文档 |
|-------|-------|---------|---------|
| **MCP协议版本** | MCP 2025-03-26 | 不支持旧版MCP | - |
| **SSE传输** | 已移除（v0.4.0） | 使用stdio传输 | [`README.md`](Azure/azure-mcp/README.md) |
| **WebSocket** | 不支持 | 使用stdio | - |
| **HTTP REST** | 不支持 | 使用stdio或实现MCP客户端 | - |

### 版本兼容性限制

| 限制项 | 限制值 | 解决方案 | 相关文档 |
|-------|-------|---------|---------|
| **Breaking Changes** | Public Preview阶段可能变更 | 关注CHANGELOG更新 | [`CHANGELOG.md`](Azure/azure-mcp/CHANGELOG.md) |
| **API稳定性** | GA前不保证 | 锁定版本号避免自动更新 | - |
| **向后兼容** | 尽力保持，但无保证 | 测试后升级 | - |

### 安全限制

| 限制项 | 限制值 | 解决方案 | 相关文档 |
|-------|-------|---------|---------|
| **本地认证禁用** | 某些资源禁用访问密钥 | 使用Entra ID + RBAC | [`TROUBLESHOOTING.md#401`](Azure/azure-mcp/TROUBLESHOOTING.md#401-unauthorized-local-authorization-is-disabled) |
| **凭据存储** | 不存储凭据 | 每次使用重新认证 | - |
| **审计日志** | 依赖Azure平台 | 启用Azure活动日志 | - |

### 扩展限制

| 限制项 | 限制值 | 解决方案 | 相关文档 |
|-------|-------|---------|---------|
| **外部MCP服务器** | 需手动配置 | 编辑配置文件 | [`CONTRIBUTING.md`](Azure/azure-mcp/CONTRIBUTING.md) |
| **自定义Area** | 需重新编译 | Fork项目并构建 | [`new-command.md`](Azure/azure-mcp/docs/new-command.md) |
| **动态插件加载** | 不支持运行时插件 | 编译时包含所有模块 | - |

### 监控限制

| 限制项 | 限制值 | 解决方案 | 相关文档 |
|-------|-------|---------|---------|
| **OpenTelemetry** | 需手动启用 | 设置`OTEL_DISABLE_SDK=false` | [`TROUBLESHOOTING.md`](Azure/azure-mcp/TROUBLESHOOTING.md#observability-with-opentelemetry) |
| **遥测隐私** | 默认收集基础指标 | 设置`AZURE_MCP_COLLECT_TELEMETRY=false`禁用 | [`README.md`](Azure/azure-mcp/README.md#telemetry-configuration) |
| **日志级别** | 默认Info | 通过VS Code或配置调整 | [`TROUBLESHOOTING.md`](Azure/azure-mcp/TROUBLESHOOTING.md#logging) |

### 已知问题

| 限制项 | 限制值 | 解决方案 | 相关文档 |
|-------|-------|---------|---------|
| **项目迁移** | 主仓库已迁移至microsoft/mcp | 关注新仓库更新 | [`README.md`](Azure/azure-mcp/README.md) |
| **Ubuntu VS Code** | 旧版VS Code兼容性问题 | 升级到v1.101+ | [`TROUBLESHOOTING.md`](Azure/azure-mcp/TROUBLESHOOTING.md#platform-package-installation-issues) |
| **平台包安装** | 偶现网络问题 | 清理npm缓存重试 | [`TROUBLESHOOTING.md`](Azure/azure-mcp/TROUBLESHOOTING.md#platform-package-installation-issues) |

---

## 第四部分：工具清单

### Azure服务分类（33个服务领域）

以下是Azure MCP Server支持的所有服务领域及其主要工具（包含文件路径）：

#### 1. Azure AI Foundry
**文件路径**: [`areas/foundry/src/AzureMcp.Foundry/Commands/`](Azure/azure-mcp/areas/foundry/src/AzureMcp.Foundry/Commands/)

- `azmcp_foundry_knowledge_index_list` - 列出AI Foundry项目中的知识索引 ([`KnowledgeIndexListCommand.cs`](Azure/azure-mcp/areas/foundry/src/AzureMcp.Foundry/Commands/KnowledgeIndexListCommand.cs))
- `azmcp_foundry_models_deploy` - 部署AI Foundry模型 ([`ModelDeploymentCommand.cs`](Azure/azure-mcp/areas/foundry/src/AzureMcp.Foundry/Commands/ModelDeploymentCommand.cs))
- `azmcp_foundry_deployments_list` - 列出模型部署 ([`DeploymentsListCommand.cs`](Azure/azure-mcp/areas/foundry/src/AzureMcp.Foundry/Commands/DeploymentsListCommand.cs))
- `azmcp_foundry_models_list` - 列出可用模型 ([`ModelsListCommand.cs`](Azure/azure-mcp/areas/foundry/src/AzureMcp.Foundry/Commands/ModelsListCommand.cs))

#### 2. Azure AI Search
**文件路径**: [`areas/search/src/AzureMcp.Search/Commands/`](Azure/azure-mcp/areas/search/src/AzureMcp.Search/Commands/)

- `azmcp_search_index_describe` - 获取搜索索引详情
- `azmcp_search_index_list` - 列出搜索索引
- `azmcp_search_index_query` - 查询搜索索引
- `azmcp_search_list` - 列出AI Search服务

#### 3. Azure App Configuration
**文件路径**: [`areas/appconfig/src/AzureMcp.AppConfig/Commands/`](Azure/azure-mcp/areas/appconfig/src/AzureMcp.AppConfig/Commands/)

- `azmcp_appconfig_account_list` - 列出App Configuration存储
- `azmcp_appconfig_kv_delete` - 删除键值对
- `azmcp_appconfig_kv_list` - 列出键值对
- `azmcp_appconfig_kv_lock` - 锁定键值对
- `azmcp_appconfig_kv_set` - 设置键值对
- `azmcp_appconfig_kv_show` - 显示键值对详情
- `azmcp_appconfig_kv_unlock` - 解锁键值对

#### 4. Azure CLI Extension
**文件路径**: [`areas/extension/src/AzureMcp.Extension/Commands/`](Azure/azure-mcp/areas/extension/src/AzureMcp.Extension/Commands/)

- `azmcp_extension_az` - 执行任意Azure CLI命令

#### 5. Azure Container Registry (ACR)
**文件路径**: [`areas/acr/src/AzureMcp.Acr/Commands/`](Azure/azure-mcp/areas/acr/src/AzureMcp.Acr/Commands/)

- `azmcp_acr_registry_list` - 列出容器注册表
- `azmcp_acr_registry_repository_list` - 列出仓库

#### 6. Azure Cosmos DB
**文件路径**: [`areas/cosmos/src/AzureMcp.Cosmos/Commands/`](Azure/azure-mcp/areas/cosmos/src/AzureMcp.Cosmos/Commands/)

- `azmcp_cosmos_account_list` - 列出Cosmos DB账户
- `azmcp_cosmos_database_container_item_query` - 查询容器项
- `azmcp_cosmos_database_container_list` - 列出容器
- `azmcp_cosmos_database_list` - 列出数据库

#### 7. Azure Data Explorer (Kusto)
**文件路径**: [`areas/kusto/src/AzureMcp.Kusto/Commands/`](Azure/azure-mcp/areas/kusto/src/AzureMcp.Kusto/Commands/)

- `azmcp_kusto_cluster_get` - 获取集群详情
- `azmcp_kusto_cluster_list` - 列出集群
- `azmcp_kusto_database_list` - 列出数据库
- `azmcp_kusto_sample` - 采样表数据
- `azmcp_kusto_table_list` - 列出表
- `azmcp_kusto_table_schema` - 获取表架构
- `azmcp_kusto_query` - 执行KQL查询

#### 8. Azure Database for MySQL
**文件路径**: [`areas/mysql/src/AzureMcp.MySql/Commands/`](Azure/azure-mcp/areas/mysql/src/AzureMcp.MySql/Commands/)

- `azmcp_mysql_database_list` - 列出数据库
- `azmcp_mysql_database_query` - 执行SELECT查询
- `azmcp_mysql_table_list` - 列出表
- `azmcp_mysql_table_schema_get` - 获取表架构
- `azmcp_mysql_server_config_get` - 获取服务器配置
- `azmcp_mysql_server_list` - 列出MySQL服务器
- `azmcp_mysql_server_param_get` - 获取服务器参数
- `azmcp_mysql_server_param_set` - 设置服务器参数

#### 9. Azure Database for PostgreSQL
**文件路径**: [`areas/postgres/src/AzureMcp.Postgres/Commands/`](Azure/azure-mcp/areas/postgres/src/AzureMcp.Postgres/Commands/)

- `azmcp_postgres_database_list` - 列出数据库
- `azmcp_postgres_database_query` - 执行查询
- `azmcp_postgres_table_list` - 列出表
- `azmcp_postgres_table_schema_get` - 获取表架构
- `azmcp_postgres_server_config_get` - 获取服务器配置
- `azmcp_postgres_server_list` - 列出PostgreSQL服务器
- `azmcp_postgres_server_param_get` - 获取服务器参数
- `azmcp_postgres_server_param_set` - 设置服务器参数

#### 10. Azure Developer CLI (azd)
**文件路径**: [`areas/extension/src/AzureMcp.Extension/Commands/`](Azure/azure-mcp/areas/extension/src/AzureMcp.Extension/Commands/)

- `azmcp_extension_azd` - 执行Azure Developer CLI命令

#### 11. Azure Deploy
**文件路径**: [`areas/deploy/src/AzureMcp.Deploy/Commands/`](Azure/azure-mcp/areas/deploy/src/AzureMcp.Deploy/Commands/)

- `azmcp_deploy_app_logs_get` - 获取应用日志
- `azmcp_deploy_architecture_diagram_generate` - 生成架构图
- `azmcp_deploy_iac_rules_get` - 获取IaC生成规则
- `azmcp_deploy_pipeline_guidance_get` - 获取CI/CD管道指南
- `azmcp_deploy_plan_get` - 获取部署计划

#### 12. Azure Function App
**文件路径**: [`areas/functionapp/src/AzureMcp.FunctionApp/Commands/`](Azure/azure-mcp/areas/functionapp/src/AzureMcp.FunctionApp/Commands/)

- `azmcp_functionapp_get` - 获取Function App详情
- `azmcp_functionapp_list` - 列出Function Apps

#### 13. Azure Key Vault
**文件路径**: [`areas/keyvault/src/AzureMcp.KeyVault/Commands/`](Azure/azure-mcp/areas/keyvault/src/AzureMcp.KeyVault/Commands/)

- `azmcp_keyvault_certificate_create` - 创建证书
- `azmcp_keyvault_certificate_get` - 获取证书
- `azmcp_keyvault_certificate_import` - 导入证书
- `azmcp_keyvault_certificate_list` - 列出证书
- `azmcp_keyvault_key_create` - 创建密钥
- `azmcp_keyvault_key_list` - 列出密钥
- `azmcp_keyvault_secret_create` - 创建密文
- `azmcp_keyvault_secret_get` - 获取密文
- `azmcp_keyvault_secret_list` - 列出密文

#### 14. Azure Kubernetes Service (AKS)
**文件路径**: [`areas/aks/src/AzureMcp.Aks/Commands/`](Azure/azure-mcp/areas/aks/src/AzureMcp.Aks/Commands/)

- `azmcp_aks_cluster_list` - 列出AKS集群

#### 15. Azure Load Testing
**文件路径**: [`areas/loadtesting/src/AzureMcp.LoadTesting/Commands/`](Azure/azure-mcp/areas/loadtesting/src/AzureMcp.LoadTesting/Commands/)

- `azmcp_loadtesting_test_create` - 创建负载测试
- `azmcp_loadtesting_test_get` - 获取负载测试
- `azmcp_loadtesting_test_resource_create` - 创建测试资源
- `azmcp_loadtesting_test_resource_list` - 列出测试资源
- `azmcp_loadtesting_test_run_create` - 创建测试运行
- `azmcp_loadtesting_test_run_get` - 获取测试运行
- `azmcp_loadtesting_test_run_list` - 列出测试运行
- `azmcp_loadtesting_test_run_update` - 更新测试运行

#### 16. Azure Managed Grafana
**文件路径**: [`areas/grafana/src/AzureMcp.Grafana/Commands/`](Azure/azure-mcp/areas/grafana/src/AzureMcp.Grafana/Commands/)

- `azmcp_grafana_list` - 列出Grafana实例

#### 17. Azure Managed Lustre
**文件路径**: [`areas/azuremanagedlustre/src/AzureMcp.AzureManagedLustre/Commands/`](Azure/azure-mcp/areas/azuremanagedlustre/src/AzureMcp.AzureManagedLustre/Commands/)

- `azmcp_azuremanagedlustre_filesystem_list` - 列出文件系统
- `azmcp_azuremanagedlustre_filesystem_required_subnet_size` - 计算所需IP地址

#### 18. Azure Marketplace
**文件路径**: [`areas/marketplace/src/AzureMcp.Marketplace/Commands/`](Azure/azure-mcp/areas/marketplace/src/AzureMcp.Marketplace/Commands/)

- `azmcp_marketplace_product_get` - 获取Marketplace产品详情

#### 19. Azure Monitor
**文件路径**: [`areas/monitor/src/AzureMcp.Monitor/Commands/`](Azure/azure-mcp/areas/monitor/src/AzureMcp.Monitor/Commands/)

**Log Analytics:**
- `azmcp_monitor_workspace_list` - 列出工作区
- `azmcp_monitor_workspace_log_query` - 执行KQL查询
- `azmcp_monitor_resource_log_query` - 查询资源日志

**Health Models:**
- `azmcp_monitor_healthmodels_entity_get_health` - 获取实体健康状态

**Metrics:**
- `azmcp_monitor_metrics_query` - 查询指标
- `azmcp_monitor_metrics_definitions` - 列出指标定义

#### 20. Azure Service Health
**文件路径**: [`areas/resourcehealth/src/AzureMcp.ResourceHealth/Commands/`](Azure/azure-mcp/areas/resourcehealth/src/AzureMcp.ResourceHealth/Commands/)

- `azmcp_resourcehealth_availability_status_get` - 获取可用性状态
- `azmcp_resourcehealth_availability_status_list` - 列出可用性状态

#### 21. Azure Native ISV Services
**文件路径**: [`areas/azureisv/src/AzureMcp.AzureIsv/Commands/`](Azure/azure-mcp/areas/azureisv/src/AzureMcp.AzureIsv/Commands/)

- `azmcp_azureisv_monitored_resources_list` - 列出Datadog监控资源

#### 22. Azure Quick Review CLI
**文件路径**: [`areas/extension/src/AzureMcp.Extension/Commands/`](Azure/azure-mcp/areas/extension/src/AzureMcp.Extension/Commands/)

- `azmcp_extension_azqr` - 扫描资源合规性

#### 23. Azure Quota
**文件路径**: [`areas/quota/src/AzureMcp.Quota/Commands/`](Azure/azure-mcp/areas/quota/src/AzureMcp.Quota/Commands/)

- `azmcp_quota_region_availability_list` - 列出可用区域
- `azmcp_quota_usage_check` - 检查配额使用情况

#### 24. Azure Redis Cache
**文件路径**: [`areas/redis/src/AzureMcp.Redis/Commands/`](Azure/azure-mcp/areas/redis/src/AzureMcp.Redis/Commands/)

- `azmcp_redis_cache_list` - 列出Redis缓存
- `azmcp_redis_cluster_list` - 列出Redis集群

#### 25. Azure Resource Groups
**文件路径**: [`areas/authorization/src/AzureMcp.Authorization/Commands/`](Azure/azure-mcp/areas/authorization/src/AzureMcp.Authorization/Commands/)

- `azmcp_group_list` - 列出资源组

#### 26. Azure RBAC
**文件路径**: [`areas/authorization/src/AzureMcp.Authorization/Commands/`](Azure/azure-mcp/areas/authorization/src/AzureMcp.Authorization/Commands/)

- `azmcp_authorization_role_assignment_list` - 列出角色分配

#### 27. Azure Service Bus
**文件路径**: [`areas/servicebus/src/AzureMcp.ServiceBus/Commands/`](Azure/azure-mcp/areas/servicebus/src/AzureMcp.ServiceBus/Commands/)

- `azmcp_servicebus_queue_details` - 获取队列详情
- `azmcp_servicebus_queue_peek` - 查看队列消息
- `azmcp_servicebus_topic_details` - 获取主题详情
- `azmcp_servicebus_subscription_details` - 获取订阅详情

#### 28. Azure SQL Database
**文件路径**: [`areas/sql/src/AzureMcp.Sql/Commands/`](Azure/azure-mcp/areas/sql/src/AzureMcp.Sql/Commands/)

- `azmcp_sql_database_show` - 显示数据库详情
- `azmcp_sql_database_list` - 列出数据库
- `azmcp_sql_firewall_rule_list` - 列出防火墙规则
- `azmcp_sql_elastic_pool_list` - 列出弹性池
- `azmcp_sql_entra_admin_list` - 列出Entra管理员

#### 29. Azure Storage
**文件路径**: [`areas/storage/src/AzureMcp.Storage/Commands/`](Azure/azure-mcp/areas/storage/src/AzureMcp.Storage/Commands/)

**Storage Accounts:**
- `azmcp_storage_account_list` - 列出存储账户
- `azmcp_storage_account_details` - 获取账户详情
- `azmcp_storage_account_create` - 创建存储账户

**Blobs:**
- `azmcp_storage_blob_list` - 列出Blob
- `azmcp_storage_blob_details` - 获取Blob详情
- `azmcp_storage_blob_upload` - 上传Blob
- `azmcp_storage_blob_container_create` - 创建容器
- `azmcp_storage_blob_batch_set_tier` - 批量设置层级

**Queues:**
- `azmcp_storage_queue_details` - 获取队列详情
- `azmcp_storage_queue_message_send` - 发送消息
- `azmcp_storage_queue_peek` - 查看消息

**Tables:**
- `azmcp_storage_table_list` - 列出表

**Data Lake:**
- `azmcp_storage_datalake_file_system_list` - 列出文件系统
- `azmcp_storage_datalake_file_system_list_paths` - 列出路径
- `azmcp_storage_datalake_directory_create` - 创建目录

**File Shares:**
- `azmcp_storage_share_file_list` - 列出文件

#### 30. Azure Subscription
**文件路径**: [`areas/authorization/src/AzureMcp.Authorization/Commands/`](Azure/azure-mcp/areas/authorization/src/AzureMcp.Authorization/Commands/)

- `azmcp_subscription_list` - 列出订阅
- `azmcp_subscription_details` - 获取订阅详情

#### 31. Azure Terraform Best Practices
**文件路径**: [`areas/azureterraformbestpractices/src/AzureMcp.AzureTerraformBestPractices/Commands/`](Azure/azure-mcp/areas/azureterraformbestpractices/src/AzureMcp.AzureTerraformBestPractices/Commands/)

- `azmcp_azureterraformbestpractices_get` - 获取Terraform最佳实践

#### 32. Azure Virtual Desktop
**文件路径**: [`areas/virtualdesktop/src/AzureMcp.VirtualDesktop/Commands/`](Azure/azure-mcp/areas/virtualdesktop/src/AzureMcp.VirtualDesktop/Commands/)

- `azmcp_virtualdesktop_hostpool_list` - 列出主机池
- `azmcp_virtualdesktop_sessionhost_list` - 列出会话主机
- `azmcp_virtualdesktop_sessionhost_user_session_list` - 列出用户会话

#### 33. Azure Workbooks
**文件路径**: [`areas/workbooks/src/AzureMcp.Workbooks/Commands/`](Azure/azure-mcp/areas/workbooks/src/AzureMcp.Workbooks/Commands/)

- `azmcp_workbooks_list` - 列出工作簿
- `azmcp_workbooks_create` - 创建工作簿
- `azmcp_workbooks_update` - 更新工作簿
- `azmcp_workbooks_show` - 显示工作簿
- `azmcp_workbooks_delete` - 删除工作簿

#### 34. Bicep Schema
**文件路径**: [`areas/bicepschema/src/AzureMcp.BicepSchema/Commands/`](Azure/azure-mcp/areas/bicepschema/src/AzureMcp.BicepSchema/Commands/)

- `azmcp_bicepschema_get` - 获取Bicep资源类型架构

#### 35. Azure Best Practices
**文件路径**: [`areas/azurebestpractices/src/AzureMcp.AzureBestPractices/Commands/`](Azure/azure-mcp/areas/azurebestpractices/src/AzureMcp.AzureBestPractices/Commands/)

- `azmcp_bestpractices_get` - 获取Azure SDK最佳实践

#### 36. Cloud Architect
**文件路径**: [`areas/cloudarchitect/src/AzureMcp.CloudArchitect/Commands/`](Azure/azure-mcp/areas/cloudarchitect/src/AzureMcp.CloudArchitect/Commands/)

- `azmcp_cloudarchitect_design` - 通过引导式问题设计云架构

---

## 第五部分：工具命名模式映射表

### 工具命名规范

Azure MCP Server采用统一的工具命名模式，遵循以下规范：

```
azmcp_{service}_{resource}_{action}
```

其中：
- `azmcp`: 固定前缀，标识Azure MCP工具
- `{service}`: Azure服务名称（如storage、cosmos、keyvault等）
- `{resource}`: 资源类型（如account、blob、database等）
- `{action}`: 操作类型（如list、get、create、query等）

### 服务名称映射表

| Area目录 | 服务名称 | 命名空间 | 工具数量 | 主要文件路径 |
|---------|---------|---------|---------|-------------|
| `acr` | Azure Container Registry | `azmcp_acr` | 2 | [`areas/acr/src/AzureMcp.Acr/Commands/`](Azure/azure-mcp/areas/acr/src/AzureMcp.Acr/Commands/) |
| `aks` | Azure Kubernetes Service | `azmcp_aks` | 1 | [`areas/aks/src/AzureMcp.Aks/Commands/`](Azure/azure-mcp/areas/aks/src/AzureMcp.Aks/Commands/) |
| `appconfig` | Azure App Configuration | `azmcp_appconfig` | 7 | [`areas/appconfig/src/AzureMcp.AppConfig/Commands/`](Azure/azure-mcp/areas/appconfig/src/AzureMcp.AppConfig/Commands/) |
| `authorization` | Azure RBAC | `azmcp_authorization` | 1 | [`areas/authorization/src/AzureMcp.Authorization/Commands/`](Azure/azure-mcp/areas/authorization/src/AzureMcp.Authorization/Commands/) |
| `azurebestpractices` | Azure Best Practices | `azmcp_bestpractices` | 1 | [`areas/azurebestpractices/src/AzureMcp.AzureBestPractices/Commands/`](Azure/azure-mcp/areas/azurebestpractices/src/AzureMcp.AzureBestPractices/Commands/) |
| `azureisv` | Azure Native ISV Services | `azmcp_azureisv` | 1 | [`areas/azureisv/src/AzureMcp.AzureIsv/Commands/`](Azure/azure-mcp/areas/azureisv/src/AzureMcp.AzureIsv/Commands/) |
| `azuremanagedlustre` | Azure Managed Lustre | `azmcp_azuremanagedlustre` | 2 | [`areas/azuremanagedlustre/src/AzureMcp.AzureManagedLustre/Commands/`](Azure/azure-mcp/areas/azuremanagedlustre/src/AzureMcp.AzureManagedLustre/Commands/) |
| `azureterraformbestpractices` | Azure Terraform Best Practices | `azmcp_azureterraformbestpractices` | 1 | [`areas/azureterraformbestpractices/src/AzureMcp.AzureTerraformBestPractices/Commands/`](Azure/azure-mcp/areas/azureterraformbestpractices/src/AzureMcp.AzureTerraformBestPractices/Commands/) |
| `bicepschema` | Bicep Schema | `azmcp_bicepschema` | 1 | [`areas/bicepschema/src/AzureMcp.BicepSchema/Commands/`](Azure/azure-mcp/areas/bicepschema/src/AzureMcp.BicepSchema/Commands/) |
| `cloudarchitect` | Cloud Architect | `azmcp_cloudarchitect` | 1 | [`areas/cloudarchitect/src/AzureMcp.CloudArchitect/Commands/`](Azure/azure-mcp/areas/cloudarchitect/src/AzureMcp.CloudArchitect/Commands/) |
| `cosmos` | Azure Cosmos DB | `azmcp_cosmos` | 4 | [`areas/cosmos/src/AzureMcp.Cosmos/Commands/`](Azure/azure-mcp/areas/cosmos/src/AzureMcp.Cosmos/Commands/) |
| `deploy` | Azure Deploy | `azmcp_deploy` | 5 | [`areas/deploy/src/AzureMcp.Deploy/Commands/`](Azure/azure-mcp/areas/deploy/src/AzureMcp.Deploy/Commands/) |
| `extension` | Azure CLI Extensions | `azmcp_extension` | 3 | [`areas/extension/src/AzureMcp.Extension/Commands/`](Azure/azure-mcp/areas/extension/src/AzureMcp.Extension/Commands/) |
| `foundry` | Azure AI Foundry | `azmcp_foundry` | 4 | [`areas/foundry/src/AzureMcp.Foundry/Commands/`](Azure/azure-mcp/areas/foundry/src/AzureMcp.Foundry/Commands/) |
| `functionapp` | Azure Function App | `azmcp_functionapp` | 2 | [`areas/functionapp/src/AzureMcp.FunctionApp/Commands/`](Azure/azure-mcp/areas/functionapp/src/AzureMcp.FunctionApp/Commands/) |
| `grafana` | Azure Managed Grafana | `azmcp_grafana` | 1 | [`areas/grafana/src/AzureMcp.Grafana/Commands/`](Azure/azure-mcp/areas/grafana/src/AzureMcp.Grafana/Commands/) |
| `keyvault` | Azure Key Vault | `azmcp_keyvault` | 9 | [`areas/keyvault/src/AzureMcp.KeyVault/Commands/`](Azure/azure-mcp/areas/keyvault/src/AzureMcp.KeyVault/Commands/) |
| `kusto` | Azure Data Explorer (Kusto) | `azmcp_kusto` | 7 | [`areas/kusto/src/AzureMcp.Kusto/Commands/`](Azure/azure-mcp/areas/kusto/src/AzureMcp.Kusto/Commands/) |
| `loadtesting` | Azure Load Testing | `azmcp_loadtesting` | 8 | [`areas/loadtesting/src/AzureMcp.LoadTesting/Commands/`](Azure/azure-mcp/areas/loadtesting/src/AzureMcp.LoadTesting/Commands/) |
| `marketplace` | Azure Marketplace | `azmcp_marketplace` | 1 | [`areas/marketplace/src/AzureMcp.Marketplace/Commands/`](Azure/azure-mcp/areas/marketplace/src/AzureMcp.Marketplace/Commands/) |
| `monitor` | Azure Monitor | `azmcp_monitor` | 6 | [`areas/monitor/src/AzureMcp.Monitor/Commands/`](Azure/azure-mcp/areas/monitor/src/AzureMcp.Monitor/Commands/) |
| `mysql` | Azure Database for MySQL | `azmcp_mysql` | 8 | [`areas/mysql/src/AzureMcp.MySql/Commands/`](Azure/azure-mcp/areas/mysql/src/AzureMcp.MySql/Commands/) |
| `postgres` | Azure Database for PostgreSQL | `azmcp_postgres` | 8 | [`areas/postgres/src/AzureMcp.Postgres/Commands/`](Azure/azure-mcp/areas/postgres/src/AzureMcp.Postgres/Commands/) |
| `quota` | Azure Quota | `azmcp_quota` | 2 | [`areas/quota/src/AzureMcp.Quota/Commands/`](Azure/azure-mcp/areas/quota/src/AzureMcp.Quota/Commands/) |
| `redis` | Azure Redis Cache | `azmcp_redis` | 2 | [`areas/redis/src/AzureMcp.Redis/Commands/`](Azure/azure-mcp/areas/redis/src/AzureMcp.Redis/Commands/) |
| `resourcehealth` | Azure Service Health | `azmcp_resourcehealth` | 2 | [`areas/resourcehealth/src/AzureMcp.ResourceHealth/Commands/`](Azure/azure-mcp/areas/resourcehealth/src/AzureMcp.ResourceHealth/Commands/) |
| `search` | Azure AI Search | `azmcp_search` | 4 | [`areas/search/src/AzureMcp.Search/Commands/`](Azure/azure-mcp/areas/search/src/AzureMcp.Search/Commands/) |
| `servicebus` | Azure Service Bus | `azmcp_servicebus` | 4 | [`areas/servicebus/src/AzureMcp.ServiceBus/Commands/`](Azure/azure-mcp/areas/servicebus/src/AzureMcp.ServiceBus/Commands/) |
| `sql` | Azure SQL Database | `azmcp_sql` | 5 | [`areas/sql/src/AzureMcp.Sql/Commands/`](Azure/azure-mcp/areas/sql/src/AzureMcp.Sql/Commands/) |
| `storage` | Azure Storage | `azmcp_storage` | 15 | [`areas/storage/src/AzureMcp.Storage/Commands/`](Azure/azure-mcp/areas/storage/src/AzureMcp.Storage/Commands/) |
| `virtualdesktop` | Azure Virtual Desktop | `azmcp_virtualdesktop` | 3 | [`areas/virtualdesktop/src/AzureMcp.VirtualDesktop/Commands/`](Azure/azure-mcp/areas/virtualdesktop/src/AzureMcp.VirtualDesktop/Commands/) |
| `workbooks` | Azure Workbooks | `azmcp_workbooks` | 5 | [`areas/workbooks/src/AzureMcp.Workbooks/Commands/`](Azure/azure-mcp/areas/workbooks/src/AzureMcp.Workbooks/Commands/) |

### 操作类型映射表

| 操作类型 | 命令后缀 | 功能描述 | 示例 |
|---------|---------|---------|------|
| **查询操作** | `list` | 列出资源 | `azmcp_storage_account_list` |
| | `get` | 获取单个资源详情 | `azmcp_sql_database_show` |
| | `query` | 执行查询 | `azmcp_cosmos_database_container_item_query` |
| | `show` | 显示资源详情 | `azmcp_functionapp_get` |
| | `describe` | 描述资源属性 | `azmcp_search_index_describe` |
| **创建操作** | `create` | 创建新资源 | `azmcp_storage_account_create` |
| | `set` | 设置配置 | `azmcp_appconfig_kv_set` |
| | `import` | 导入资源 | `azmcp_keyvault_certificate_import` |
| | `deploy` | 部署资源 | `azmcp_foundry_models_deploy` |
| **更新操作** | `update` | 更新资源 | `azmcp_workbooks_update` |
| | `lock` | 锁定资源 | `azmcp_appconfig_kv_lock` |
| | `unlock` | 解锁资源 | `azmcp_appconfig_kv_unlock` |
| **删除操作** | `delete` | 删除资源 | `azmcp_workbooks_delete` |
| **特殊操作** | `sample` | 数据采样 | `azmcp_kusto_sample` |
| | `peek` | 查看消息 | `azmcp_servicebus_queue_peek` |
| | `send` | 发送消息 | `azmcp_storage_queue_message_send` |
| | `generate` | 生成内容 | `azmcp_deploy_architecture_diagram_generate` |
| | `design` | 设计架构 | `azmcp_cloudarchitect_design` |

### 资源层级关系

Azure MCP Server的工具设计遵循Azure资源的层级关系：

1. **订阅级别**: `azmcp_subscription_list`, `azmcp_group_list`
2. **服务级别**: `azmcp_storage_account_list`, `azmcp_cosmos_account_list`
3. **数据库级别**: `azmcp_cosmos_database_list`, `azmcp_sql_database_list`
4. **容器级别**: `azmcp_cosmos_container_list`, `azmcp_storage_blob_list`
5. **项目级别**: `azmcp_cosmos_database_container_item_query`

### 工具分类统计

| 分类 | 工具数量 | 占比 | 主要服务 |
|------|---------|------|---------|
| **查询类** | 120+ | 60% | Storage, Cosmos, Monitor, SQL |
| **管理类** | 50+ | 25% | KeyVault, App Config, Workbooks |
| **创建类** | 20+ | 10% | Storage, Load Testing, Foundry |
| **特殊类** | 10+ | 5% | Deploy, Cloud Architect, Extensions |
| **总计** | 200+ | 100% | 33个Azure服务 |

---

## 附录

### 环境变量配置参考

```bash
# 认证配置
AZURE_TENANT_ID=<租户ID>
AZURE_CLIENT_ID=<客户端ID>
AZURE_CLIENT_SECRET=<客户端密钥>
AZURE_CLIENT_CERTIFICATE_PATH=<证书路径>
AZURE_SUBSCRIPTION_ID=<订阅ID>

# 生产凭据
AZURE_MCP_INCLUDE_PRODUCTION_CREDENTIALS=true

# Broker认证
AZURE_MCP_ONLY_USE_BROKER_CREDENTIAL=true

# 遥测配置
AZURE_MCP_COLLECT_TELEMETRY=false

# OpenTelemetry配置
OTEL_DISABLE_SDK=false
APPLICATIONINSIGHTS_CONNECTION_STRING=<连接字符串>

# 代理配置
HTTP_PROXY=http://proxy:8080
HTTPS_PROXY=http://proxy:8080
NO_PROXY=localhost,127.0.0.1
```

### 全局命令行选项

| 选项 | 必需 | 默认值 | 说明 |
|------|------|-------|------|
| `--subscription` | 否 | `AZURE_SUBSCRIPTION_ID` | Azure订阅ID |
| `--tenant-id` | 否 | - | Azure租户ID |
| `--auth-method` | 否 | `credential` | 认证方法 |
| `--retry-max-retries` | 否 | 3 | 最大重试次数 |
| `--retry-delay` | 否 | 2 | 重试延迟（秒） |
| `--retry-max-delay` | 否 | 10 | 最大重试延迟（秒） |
| `--retry-mode` | 否 | `exponential` | 重试策略 |
| `--retry-network-timeout` | 否 | 100 | 网络超时（秒） |

### 版本历史关键节点

| 版本 | 日期 | 重要变更 |
|------|------|---------|
| **0.5.8** | 2025-08-21 | 新增Azure Managed Lustre、MySQL、Cloud Architect支持 |
| **0.5.7** | 2025-08-19 | 新增Deploy、Quota、Service Health、Function App、ACR仓库列表 |
| **0.5.6** | 2025-08-14 | 新增Storage账户详情 |
| **0.5.5** | 2025-08-12 | 新增ACR注册表列表、Storage账户创建、队列消息、Blob详情/创建 |
| **0.4.0** | 2025-07-15 | 🚨 **移除SSE传输**（安全漏洞） |
| **0.3.0** | 2025-06-01 | 新增OpenTelemetry支持 |

### 外部资源链接

- **官方文档**: https://learn.microsoft.com/azure/developer/azure-mcp-server/
- **新仓库**: https://github.com/microsoft/mcp/tree/main/servers/Azure.Mcp.Server
- **旧仓库**（归档）: https://github.com/Azure/azure-mcp
- **VS Code扩展**: https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azure-mcp-server
- **NPM包**: https://www.npmjs.com/package/@azure/mcp
- **Docker镜像**: https://mcr.microsoft.com/artifact/mar/azure-sdk/azure-mcp
- **MCP规范**: https://modelcontextprotocol.io

---

## 总结评估

### 能力评分

| 维度 | 评分 | 说明 |
|------|------|------|
| **Tools能力** | ⭐⭐⭐⭐⭐ | 200+工具，覆盖33个服务，参数验证完善 |
| **Resources管理** | ⭐ | 不符合MCP Resources协议规范 |
| **Prompts/Sampling** | ⭐ | 不符合MCP Prompts/Sampling规范 |
| **Model兼容性** | ⭐⭐⭐⭐⭐ | 完全兼容任何MCP客户端 |
| **连接方式** | ⭐⭐⭐ | 仅支持stdio，SSE已移除 |
| **认证授权** | ⭐⭐⭐⭐⭐ | 8种凭据链，企业级支持 |
| **安全特性** | ⭐⭐⭐⭐⭐ | TLS加密、RBAC、审计日志完善 |
| **可观测性** | ⭐⭐⭐⭐⭐ | OpenTelemetry、EventSource、Azure Monitor集成 |
| **扩展性** | ⭐⭐⭐⭐ | 模块化架构，AOT支持 |
| **部署方式** | ⭐⭐⭐⭐⭐ | 5种部署方式，灵活便捷 |
