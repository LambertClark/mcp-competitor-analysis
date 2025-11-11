# 阿里云可观测MCP服务器 - 能力清单

## 目录

1. [完整能力清单表格](#完整能力清单表格)
2. [性能指标详解](#性能指标详解)
3. [限制条件说明](#限制条件说明)
4. [工具详细清单](#工具详细清单)

---

## 完整能力清单表格

### 一、Tools能力

| 能力模块 | 具体功能 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 | 文件路径 |
|---------|----------|---------|---------|---------|-------------|---------|
| **基础工具数量** | 工具总数 | ✓ | **15个工具**：SLS(6) + ARMS(5) + CMS(2) + Util(2) | v0.1.0+ | [`README.md`](../Code/alibabacloud-observability-mcp-server/README.md) | [`src/mcp_server_aliyun_observability/toolkit/`](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/toolkit/) |
| **参数验证机制** | Pydantic校验 | ✓ | 所有工具参数使用Pydantic Field验证，支持类型检查、范围验证(ge/le)、必填验证 | v0.1.0+ | [参数验证实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) | [参数验证代码](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |
| **并行调用支持** | 多工具并行 | ✓ | FastMCP框架原生支持，无明确并发数限制 | v0.1.0+ | - | [并行调用实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |
| **流式处理** | 流式响应 | ✗ | 不支持，所有工具均同步返回 | - | - | - |
| **错误处理机制** | 自动重试 | ✓ | 使用tenacity库，最多3次重试，间隔1秒 | v0.1.0+ | [重试机制实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) | [重试机制代码](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |
| **错误处理机制** | 异常映射 | ✓ | 自定义TeaException处理，提供可操作的错误解决方案 | v0.1.7+ | [异常映射实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) | [异常映射代码](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |
| **错误处理机制** | 诊断工具 | ✓ | `sls_diagnose_query`专用于诊断SQL查询错误 | v0.1.6+ | [诊断工具实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) | [诊断工具代码](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |
| **AI增强能力** | 自然语言转SQL | ✓ | `sls_translate_text_to_sql_query`支持Text-to-SQL | v0.1.0+ | [Text-to-SQL实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) | [Text-to-SQL代码](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |
| **AI增强能力** | 自然语言转PromQL | ✓ | `cms_translate_text_to_promql`支持Text-to-PromQL | v0.2.0+ | [Text-to-PromQL实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) | [Text-to-PromQL代码](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |
| **AI增强能力** | Trace查询生成 | ✓ | `arms_generate_trace_query`生成trace查询语句 | v0.1.0+ | [Trace查询实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) | [Trace查询代码](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |
| **AI增强能力** | 火焰图分析 | ✓ | `arms_profile_flame_analysis`性能热点AI分析 | v0.2.4+ | [火焰图分析实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) | [火焰图分析代码](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |
| **AI增强能力** | 差分火焰图 | ✓ | `arms_diff_profile_flame_analysis`性能对比分析 | v0.2.4+ | [差分火焰图实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) | [差分火焰图代码](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |                                                       |

### 二、Resources管理

| 能力模块 | 具体功能 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|----------|---------|---------|---------|-------------|
| **资源发现** | MCP Resources协议 | ✗ | 不支持MCP Resources协议，无`@server.resource()`装饰器 | - | - |
| **资源类型** | 工具间接支持 | ✓ | 通过工具发现资源：`sls_list_projects`(项目)、`sls_list_logstores`(日志库)、`arms_search_apps`(应用) | v0.1.0+ | - |
| **URI模板** | - | ✗ | 不使用标准MCP URI模板 | - | - |
| **订阅机制** | - | ✗ | 无实时订阅，所有查询为主动拉取 | - | - |
| **分页策略** | Offset分页 | ✓ | 支持limit参数(1-100)，部分工具支持pageNumber/pageSize | v0.1.0+ | [分页实现1](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/), [分页实现2](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |

### 三、Prompts/Sampling

| 能力模块 | 具体功能 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|----------|---------|---------|---------|-------------|
| **提示词管理** | MCP Prompts | ✓ | 1个内置prompt：`sls 日志查询 prompt` | v0.2.1+ | [Prompts实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |
| **提示词功能** | 流程引导 | ✓ | 提供3步查询流程：获取project/logstore → 生成查询 → 执行查询 | v0.2.1+ | - |
| **采样策略** | MCP Sampling | ✗ | 不支持MCP Sampling协议 | - | - |
| **自定义能力** | 参数化prompt | ✓ | prompt接受question参数，但无复杂模板系统 | v0.2.1+ | - |

### 四、Model兼容性
| 能力模块 | 具体功能 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|----------|---------|---------|---------|-------------|
| **模型依赖** | 后端AI服务 | ✓ | 依赖阿里云SLS AI工具服务（text_to_sql等） | v0.1.0+ | [AI服务实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |
| **模型列表** | 固定后端 | ✓ | 无暴露模型选择，使用阿里云内置AI引擎 | - | - |
| **模型切换** | - | ✗ | 不支持切换模型 | - | - |
| **客户端兼容** | MCP客户端 | ✓ | 支持Cursor、Cline、Cherry Studio、ChatWise等 | v0.1.0+ | [`README.md`](../Code/alibabacloud-observability-mcp-server/README.md) |

### 五、连接方式
| 能力模块 | 具体功能 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|----------|---------|---------|---------|-------------|
| **传输协议** | stdio | ✓ | 标准输入输出，适用于本地集成 | v0.1.0+ | [stdio实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |
| **传输协议** | SSE | ✓ | Server-Sent Events，HTTP流式协议 | v0.1.0+ | [SSE实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |
| **传输协议** | streamable-http | ✓ | HTTP流式协议（新增） | v0.2.8+ | [streamable-http实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |
| **传输协议** | WebSocket | ✗ | 不支持 | - | - |
| **连接池** | 客户端连接池 | ✓ | 每次请求创建阿里云SDK客户端，通过lifespan共享wrapper | v0.1.0+ | [连接池实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |
| **断线重连** | 自动重试 | ✓ | tenacity库实现3次重试，间隔1秒 | v0.1.0+ | [重连实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |
| **端点管理** | 动态端点映射 | ✓ | 支持CLI配置SLS/ARMS区域端点映射 | v0.3.2+ | [端点管理实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |

### 六、认证授权
| 能力模块 | 具体功能 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|----------|---------|---------|---------|-------------|
| **认证方式** | AccessKey | ✓ | 阿里云AK/SK认证，通过CLI参数或环境变量 | v0.1.0+ | [AccessKey认证实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |
| **认证方式** | 默认凭证链 | ✓ | 支持环境变量ALIBABA_CLOUD_ACCESS_KEY_ID/SECRET | v0.1.9+ | [`README.md`](../Code/alibabacloud-observability-mcp-server/README.md) |
| **认证方式** | STS Token | ✓ | 支持临时凭证ALIBABA_CLOUD_SECURITY_TOKEN | v0.1.9+ | [`README.md`](../Code/alibabacloud-observability-mcp-server/README.md) |
| **认证方式** | OAuth 2.0 | ✗ | 不支持 | - | - |
| **Token管理** | 自动刷新 | ✓ | 依赖阿里云SDK自动管理，MCP层无刷新逻辑 | v0.1.0+ | - |
| **权限粒度** | RAM细粒度 | ✓ | 支持RAM Policy细粒度控制（sls:Read*, sls:CallAiTools, arms:Query*等） | v0.1.0+ | [`README.md`](../Code/alibabacloud-observability-mcp-server/README.md) |
| **密钥安全** | 不落盘 | ✓ | 密钥仅存于内存，不写入文件 | v0.1.0+ | [`README.md`](../Code/alibabacloud-observability-mcp-server/README.md) |

### 七、安全特性
| 能力模块 | 具体功能 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|----------|---------|---------|---------|-------------|
| **数据加密** | HTTPS传输 | ✓ | 阿里云OpenAPI强制HTTPS | v0.1.0+ | - |
| **数据加密** | 密钥加密 | ✓ | 内存明文存储（进程隔离） | - | - |
| **权限控制** | RAM授权 | ✓ | 基于阿里云RAM的RBAC | v0.1.0+ | - |
| **权限控制** | 最小权限原则 | ✓ | 文档推荐仅授予必需权限 | v0.1.0+ | [`README.md`](../Code/alibabacloud-observability-mcp-server/README.md) |
| **审计日志** | 操作日志 | ✓ | 本地日志文件`~/mcp_server_aliyun_observability/mcp_server_YYYYMMDD.log` | v0.2.8+ | [操作日志实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |
| **审计日志** | 端点解析日志 | ✓ | 记录每次客户端创建时的region/endpoint/source | v0.3.2+ | [端点解析日志实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) |
| **审计日志** | 云端审计 | ✓ | 依赖阿里云ActionTrail（需单独启用） | - | - |
| **网络隔离** | VPC支持 | ✓ | 支持内网端点映射，建议VPC部署 | v0.3.2+ | [`README.md`](../Code/alibabacloud-observability-mcp-server/README.md) |
| **SSE安全** | 访问控制警告 | ✓ | 文档强调SSE模式需自行实现访问控制 | v0.1.0+ | [`README.md`](../Code/alibabacloud-observability-mcp-server/README.md) |

---

## 性能指标详解

### 1. 查询性能

| 指标 | 数值 | 说明 |
|------|------|------|
| **AI工具超时** | 60秒 | `text_to_sql`、`text_to_promql`等AI工具的read/connect超时 |
| **查询超时** | 60秒 | `sls_execute_sql_query`、`cms_execute_promql_query`的超时时间 |
| **重试次数** | 最多3次 | 失败后自动重试，间隔1秒 |
| **响应延迟** | 取决于阿里云API | 无本地缓存，实时请求云端API |

**代码位置**: [查询性能实现1](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/), [查询性能实现2](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/), [查询性能实现3](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

### 2. 并发能力

| 指标 | 数值 | 说明 |
|------|------|------|
| **最大并发数** | 无明确限制 | 受FastMCP框架和阿里云API限流影响 |
| **QPS限制** | 继承阿里云OpenAPI限流 | 无独立限流，依赖阿里云服务端限制 |
| **连接池** | 每请求独立客户端 | 无连接复用，每次调用创建新SDK客户端 |

**代码位置**: [并发能力实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

### 3. 分页性能

| 工具 | 默认页大小 | 最大页大小 | 分页方式 |
|------|----------|----------|---------|
| `sls_list_projects` | 50 | 100 | limit |
| `sls_list_logstores` | 10 | 100 | limit |
| `sls_execute_sql_query` | 10 | 100 | limit |
| `arms_search_apps` | 20 | 100 | pageNumber + pageSize |

**代码位置**: [分页性能实现1](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/), [分页性能实现2](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/), [分页性能实现3](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

### 4. 日志性能

| 指标 | 数值 | 说明 |
|------|------|------|
| **日志级别** | INFO（默认） | 可通过`--log-level`调整为DEBUG/WARNING/ERROR |
| **日志输出** | 双重输出 | 终端彩色输出 + 文件持久化 |
| **文件滚动** | 按日期 | 每天生成新文件`mcp_server_YYYYMMDD.log` |
| **日志位置** | `~/mcp_server_aliyun_observability/` | 用户目录下 |

**代码位置**: [日志性能实现1](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/), [日志性能实现2](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

---

## 限制条件说明

### 1. 平台限制

| 限制项 | 要求 | 影响范围 |
|--------|------|---------|
| **Python版本** | ≥3.10 | 必需，使用现代Python特性（dataclass、类型提示） |
| **操作系统** | 跨平台 | Windows/Linux/macOS均支持 |
| **阿里云SDK版本** | 固定锁定 | `alibabacloud_sls20201230==5.7.0`, `alibabacloud_arms20190808==8.0.0` |

**代码位置**: [`../Code/alibabacloud-observability-mcp-server/pyproject.toml`](../Code/alibabacloud-observability-mcp-server/pyproject.toml)

### 2. 数据量限制
| 限制项 | 限制值 | 说明 | 绕过方法 |
|--------|--------|------|---------|
| **项目列表** | 1-100个项目 | 防止返回数据过大 | 使用`projectName`模糊搜索 |
| **日志库列表** | 1-100个日志库 | 同上 | 使用`logStore`模糊搜索 |
| **查询结果** | 1-100条记录 | 默认10条 | 调整`limit`参数 |
| **应用搜索** | 1-100个应用 | 默认20条 | 使用`pageNumber`分页 |

**代码位置**: [数据量限制实现1](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/), [数据量限制实现2](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/), [数据量限制实现3](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

### 3. 区域限制

| 限制项 | 要求 | 说明 |
|--------|------|------|
| **regionId必填** | 所有工具 | 必须明确指定阿里云区域ID（如`cn-hangzhou`） |
| **支持区域** | 阿里云开通的区域 | 使用`sls_get_regions`获取部分常用区域 |
| **跨区域查询** | 不支持 | 每次查询仅限单区域 |

**代码位置**: [区域限制实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

### 4. 功能限制

| 限制项 | 说明 | 版本 |
|--------|------|------|
| **不支持流式输出** | 所有工具均同步返回 | v0.3.2 |
| **无本地缓存** | 每次请求实时查询云端 | v0.3.2 |
| **无离线模式** | 必须联网访问阿里云API | v0.3.2 |
| **AI工具权限** | 需要额外授予`sls:CallAiTools`权限 | v0.1.0+ |
| **火焰图语言** | 仅支持Java和Go | v0.2.4+ |
| **知识库配置** | 需手动配置JSON文件 | v0.2.6+ |

**代码位置**: [功能限制实现1](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/), [功能限制实现2](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

### 5. 安全限制

| 限制项 | 要求 | 说明 |
|--------|------|------|
| **SSE模式访问控制** | 用户自行实现 | 官方不提供认证机制 |
| **VPC部署推荐** | 强烈建议 | 避免公网暴露 |
| **密钥存储** | 不落盘 | 仅命令行参数或环境变量 |
| **RAM权限** | 需预先配置 | 最小权限原则 |

**代码位置**: [`../Code/alibabacloud-observability-mcp-server/README.md`](../Code/alibabacloud-observability-mcp-server/README.md)

---

## 工具详细清单

### SLS工具 (6个)

#### 1. sls_list_projects
- **用途**: 列出SLS项目
- **参数**:
  - `projectName` (可选): 项目名称模糊搜索
  - `limit` (默认50, 1-100): 返回数量
  - `regionId` (必需): 区域ID
- **返回**: `{"projects": [...], "message": "..."}`
- **限制**: 最多100个
- **版本**: v0.1.0+
- **代码位置**: [sls_list_projects实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

#### 2. sls_list_logstores
- **用途**: 列出日志库
- **参数**:
  - `project` (必需): 项目名称（精确匹配）
  - `logStore` (可选): 日志库名称模糊搜索
  - `limit` (默认10, 1-100): 返回数量
  - `isMetricStore` (默认False): 是否指标库
  - `logStoreType` (可选): 日志库类型（logs/metrics）
  - `regionId` (必需): 区域ID
- **返回**: `{"total": N, "logstores": [...], "message": "..."}`
- **重试**: 最多3次，间隔1秒
- **版本**: v0.1.0+
- **代码位置**: [sls_list_logstores实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

#### 3. sls_describe_logstore
- **用途**: 获取日志库索引结构
- **参数**:
  - `project` (必需): 项目名称
  - `logStore` (必需): 日志库名称
  - `regionId` (必需): 区域ID
- **返回**: `{"field_name": {"alias": "...", "sensitive": bool, "type": "...", "json_keys": {...}}}`
- **重试**: 最多3次
- **版本**: v0.1.0+
- **代码位置**: [sls_describe_logstore实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

#### 4. sls_execute_sql_query
- **用途**: 执行SLS SQL查询
- **参数**:
  - `project` (必需): 项目名称
  - `logStore` (必需): 日志库名称
  - `query` (必需): SQL查询语句
  - `fromTimestampInSeconds` (必需): 开始时间戳（秒）
  - `toTimestampInSeconds` (必需): 结束时间戳（秒）
  - `limit` (默认10, 1-100): 返回数量
  - `regionId` (必需): 区域ID
- **返回**: `{"data": [...], "message": "..."}`
- **超时**: 60秒
- **重试**: 最多3次
- **版本**: v0.1.0+
- **代码位置**: [sls_execute_sql_query实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

#### 5. sls_translate_text_to_sql_query
- **用途**: 自然语言转SLS SQL（AI增强）
- **参数**:
  - `text` (必需): 自然语言描述
  - `project` (必需): 项目名称
  - `logStore` (必需): 日志库名称
  - `regionId` (必需): 区域ID
- **返回**: `{"data": "SQL语句", "requestId": "..."}`
- **AI后端**: 阿里云SLS AI工具（text_to_sql）
- **超时**: 60秒
- **重试**: 最多3次
- **权限**: 需要`sls:CallAiTools`
- **版本**: v0.1.0+
- **代码位置**: [sls_translate_text_to_sql_query实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

#### 6. sls_diagnose_query
- **用途**: 诊断SQL查询错误（AI增强）
- **参数**:
  - `query` (必需): 查询语句
  - `errorMessage` (必需): 错误信息
  - `project` (必需): 项目名称
  - `logStore` (必需): 日志库名称
  - `regionId` (必需): 区域ID
- **返回**: 诊断结果和优化建议（字符串）
- **AI后端**: 阿里云SLS AI工具（diagnosis_sql）
- **超时**: 60秒
- **权限**: 需要`sls:CallAiTools`
- **版本**: v0.1.6+
- **代码位置**: [sls_diagnose_query实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

---

### ARMS工具 (5个)

#### 1. arms_search_apps
- **用途**: 搜索ARMS应用
- **参数**:
  - `appNameQuery` (必需): 应用名称查询
  - `regionId` (必需): 区域ID
  - `pageSize` (默认20, 1-100): 每页大小
  - `pageNumber` (默认1): 页码
- **返回**: `{"total": N, "page_size": N, "page_number": N, "trace_apps": [...]}`
- **版本**: v0.1.0+
- **代码位置**: [arms_search_apps实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

#### 2. arms_generate_trace_query
- **用途**: 生成trace查询语句（AI增强）
- **参数**:
  - `user_id` (必需): 阿里云账号ID
  - `pid` (必需): 应用PID
  - `region_id` (必需): 区域ID
  - `question` (必需): 自然语言问题
- **返回**: `{"sls_query": "...", "requestId": "...", "project": "...", "log_store": "..."}`
- **AI后端**: 阿里云SLS AI工具（text_to_sql）
- **超时**: 60秒
- **重试**: 最多3次
- **版本**: v0.1.0+
- **代码位置**: [arms_generate_trace_query实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

#### 3. arms_profile_flame_analysis
- **用途**: 分析火焰图性能热点（AI增强）
- **参数**:
  - `pid` (必需): 应用PID
  - `startMs` (必需): 开始时间戳（毫秒）
  - `endMs` (必需): 结束时间戳（毫秒）
  - `profileType` (默认cpu): 类型（cpu/memory）
  - `ip` (可选): 主机IP（逗号分隔）
  - `thread` (可选): 线程名（逗号分隔）
  - `threadGroup` (可选): 线程组（逗号分隔）
  - `regionId` (必需): 区域ID
- **返回**: `{"data": "分析结果"}`
- **AI后端**: 阿里云SLS AI工具（profile_flame_analysis）
- **语言限制**: 仅支持Java和Go
- **超时**: 60秒
- **版本**: v0.2.4+
- **代码位置**: [arms_profile_flame_analysis实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

#### 4. arms_diff_profile_flame_analysis
- **用途**: 差分火焰图性能对比（AI增强）
- **参数**:
  - `pid` (必需): 应用PID
  - `currentStartMs` (必需): 当前时段开始时间戳（毫秒）
  - `currentEndMs` (必需): 当前时段结束时间戳（毫秒）
  - `referenceStartMs` (必需): 参考时段开始时间戳（毫秒）
  - `referenceEndMs` (必需): 参考时段结束时间戳（毫秒）
  - `profileType` (默认cpu): 类型（cpu/memory）
  - `ip` (可选): 主机IP
  - `thread` (可选): 线程名
  - `threadGroup` (可选): 线程组
  - `regionId` (必需): 区域ID
- **返回**: `{"data": "性能变化分析"}`
- **AI后端**: 阿里云SLS AI工具（diff_profile_flame_analysis）
- **语言限制**: 仅支持Java和Go
- **超时**: 60秒
- **版本**: v0.2.4+
- **代码位置**: [arms_diff_profile_flame_analysis实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

#### 5. arms_get_application_info
- **用途**: 获取应用详细信息
- **参数**:
  - `pid` (必需): 应用PID
  - `regionId` (必需): 区域ID
- **返回**: 应用详细信息
- **版本**: v0.2.3+
- **代码位置**: [arms_get_application_info实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/) (未完整展示)

---

### CMS工具 (2个)

#### 1. cms_translate_text_to_promql
- **用途**: 自然语言转PromQL（AI增强）
- **参数**:
  - `text` (必需): 自然语言描述
  - `project` (必需): SLS项目名称
  - `metricStore` (必需): 指标库名称
  - `regionId` (必需): 区域ID
- **返回**: PromQL查询语句（字符串）
- **AI后端**: 阿里云SLS AI工具（text_to_promql）
- **超时**: 60秒
- **重试**: 最多3次
- **版本**: v0.2.0+
- **代码位置**: [cms_translate_text_to_promql实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

#### 2. cms_execute_promql_query
- **用途**: 执行PromQL查询
- **参数**:
  - `project` (必需): 项目名称
  - `metricStore` (必需): 指标库名称
  - `query` (必需): PromQL查询语句
  - `fromTimestampInSeconds` (必需): 开始时间戳（秒）
  - `toTimestampInSeconds` (必需): 结束时间戳（秒）
  - `regionId` (必需): 区域ID
- **返回**: `{"data": [...], "message": "..."}`
- **超时**: 60秒
- **重试**: 最多3次
- **特殊**: 使用内置SPL模板包装PromQL，返回带图表URL
- **版本**: v0.2.0+
- **代码位置**: [cms_execute_promql_query实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

---

### 通用工具 (2个)

#### 1. sls_get_regions
- **用途**: 获取阿里云区域列表
- **参数**: 无
- **返回**: `[{"RegionName": "...", "RegionId": "..."}]`
- **说明**: 返回12个常用区域（华北/华东/华南/西南）
- **版本**: v0.1.0+
- **代码位置**: [sls_get_regions实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

#### 2. sls_get_current_time
- **用途**: 获取当前时间
- **参数**: 无
- **返回**: `{"current_time": "YYYY-MM-DD HH:MM:SS", "current_timestamp": 毫秒时间戳}`
- **说明**: 用于生成查询时间参数
- **版本**: v0.1.0+
- **代码位置**: [sls_get_current_time实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

---

### Prompt清单 (1个)

#### sls 日志查询 prompt
- **名称**: `sls 日志查询 prompt`
- **描述**: 当用户需要查询sls日志时，可以调用该prompt来获取过程
- **参数**: `question` (字符串)
- **返回**: 3步流程指引：
  1. 获取project和logstore（使用`sls_list_projects`和`sls_list_logstores`）
  2. 生成查询语句（使用`sls_translate_text_to_sql_query`）
  3. 执行查询（使用`sls_execute_sql_query`）
- **版本**: v0.2.1+
- **代码位置**: [sls日志查询prompt实现](../Code/alibabacloud-observability-mcp-server/src/mcp_server_aliyun_observability/)

---

## 能力矩阵总结

| 能力类别 | 支持程度 | 评分 | 说明 |
|---------|---------|------|------|
| **Tools** | ✓✓✓✓✓ | 5/5 | 15个工具覆盖日志/监控/指标全场景 |
| **Resources** | ◐◐◐☆☆ | 2/5 | 无标准MCP Resources，通过工具间接支持 |
| **Prompts** | ✓✓☆☆☆ | 2/5 | 1个内置prompt，功能简单 |
| **Sampling** | ✗✗✗✗✗ | 0/5 | 不支持 |
| **连接方式** | ✓✓✓✓☆ | 4/5 | 支持3种传输协议，无WebSocket |
| **认证授权** | ✓✓✓✓✓ | 5/5 | 多种认证方式，细粒度权限控制 |
| **安全性** | ✓✓✓✓☆ | 4/5 | HTTPS+RAM+审计日志，无密钥加密 |
| **AI增强** | ✓✓✓✓✓ | 5/5 | 5个AI工具（Text-to-SQL/PromQL/火焰图分析） |
| **错误处理** | ✓✓✓✓☆ | 4/5 | 自动重试+异常映射+诊断工具 |
| **文档质量** | ✓✓✓✓☆ | 4/5 | 中英双语，示例丰富，缺少架构文档 |

---

## 版本演进路线图
| 版本 | 发布时间 | 主要特性 |
|------|---------|---------|
| v0.1.0 | 2024年 | 初始版本：6个SLS工具 + 2个ARMS工具 |
| v0.1.6 | 2024年 | 新增SQL诊断工具 |
| v0.1.7 | 2024年 | 优化错误处理机制 |
| v0.1.9 | 2024年 | 支持STS Token认证 |
| v0.2.0 | 2024年 | 新增CMS PromQL工具 |
| v0.2.1 | 2024年 | 新增SLS Prompts |
| v0.2.3 | 2024年 | 新增ARMS应用详情工具 |
| v0.2.4 | 2024年 | 新增火焰图分析工具（单次/差分） |
| v0.2.6 | 2024年 | 新增知识库RAG支持 |
| v0.2.8 | 2024年 | 新增streamable-http传输，重构日志系统 |
| v0.3.0 | 2025年 | 使用Rich库替换标准logging |
| v0.3.2 | 2025年 | **当前版本**：新增全局配置系统，端点映射，CLI清理 |

---

## 依赖关系图
```
MCP Client (Cursor/Cline/Cherry Studio)
    ↕ (stdio/SSE/streamable-http)
FastMCP Server (mcp_server_aliyun_observability)
    ├── SLSToolkit (6 tools)
    │   └── SLSClientWrapper
    │       └── alibabacloud_sls20201230 SDK
    │           └── 阿里云SLS OpenAPI
    ├── ARMSToolkit (5 tools)
    │   └── ARMSClientWrapper
    │       └── alibabacloud_arms20190808 SDK
    │           └── 阿里云ARMS OpenAPI
    ├── CMSToolkit (2 tools)
    │   └── SLSClientWrapper (复用)
    │       └── alibabacloud_sls20201230 SDK
    └── UtilToolkit (2 tools)
```

---

## 最佳实践建议
### 1. 性能优化
- ✓ 使用模糊搜索减少返回数据量
- ✓ 合理设置limit参数（10-50条）
- ✓ 查询时间范围控制（7天内）
- ✓ 利用自动重试机制处理瞬态错误

### 2. 安全加固
- ✓ 使用默认凭证链代替硬编码AK/SK
- ✓ 配置RAM最小权限Policy
- ✓ VPC环境使用内网端点映射
- ✓ SSE模式部署在内网或添加认证网关
- ✓ 定期轮换AccessKey

### 3. 工具组合
- ✓ **查询流程**: `sls_list_projects` → `sls_list_logstores` → `sls_describe_logstore` → `sls_translate_text_to_sql_query` → `sls_execute_sql_query`
- ✓ **错误处理**: 查询失败时使用`sls_diagnose_query`诊断
- ✓ **ARMS追踪**: `arms_search_apps` → `arms_generate_trace_query` → `sls_execute_sql_query`
- ✓ **性能分析**: `arms_search_apps` → `arms_get_application_info` → `arms_profile_flame_analysis`

### 4. 开发调试
- ✓ 启动时使用`--log-level DEBUG`
- ✓ 检查日志文件中的端点解析记录
- ✓ 使用pytest fixtures编写单元测试
- ✓ 开发环境使用stdio，生产使用SSE

---

## 已知限制与未来展望
### 当前限制
1. ✓ 不支持MCP Resources标准协议
2. ✓ 不支持流式输出（所有响应同步返回）
3. ✓ 无本地缓存（每次请求实时查询云端）
4. ✓ 火焰图分析仅支持Java/Go
5. ✓ 无多云支持（专为阿里云设计）

### 潜在改进方向
1. 🔜 增加更多阿里云产品支持（CMS云监控完整功能、SLB、ECS等）
2. 🔜 实现MCP Resources协议
3. 🔜 添加查询结果缓存机制
4. 🔜 支持更多编程语言的火焰图分析
5. 🔜 提供WebSocket传输协议
6. 🔜 内置更多Prompts模板

---

## 联系与支持
- **GitHub Issues**: https://github.com/aliyun/alibabacloud-observability-mcp-server/issues
- **官方文档**: [`README.md`](../Code/alibabacloud-observability-mcp-server/README.md)
- **PyPI**: https://pypi.org/project/mcp-server-aliyun-observability/
- **MCP协议**: https://modelcontextprotocol.io/
