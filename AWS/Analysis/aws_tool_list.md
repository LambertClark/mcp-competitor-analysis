# AWS CloudWatch MCP 能力清单 v0.0.11

## 📋 目录

- [第一部分: 完整能力清单表格](#第一部分-完整能力清单表格)
  - [1. Tools能力](#1-tools能力)
  - [2. Resources管理](#2-resources管理)
  - [3. Prompts/Sampling](#3-promptssampling)
  - [4. Model兼容性](#4-model兼容性)
  - [5. 连接方式](#5-连接方式)
  - [6. 认证授权](#6-认证授权)
  - [7. 安全特性](#7-安全特性)
- [第二部分: 性能指标详解](#第二部分-性能指标详解)
- [第三部分: 限制条件说明](#第三部分-限制条件说明)

---

## 第一部分: 完整能力清单表格

### 1. Tools能力

#### 1.1 基础工具列表

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 文件路径 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|---------|------------|
| **CloudWatch Logs** | 工具总数 | ✅ | 5个工具 | [`tools.py`](AWS/Code/cloudwatch-mcp-server/awslabs/cloudwatch_mcp_server/cloudwatch_logs/tools.py) | v0.0.3+ | [链接](https://awslabs.github.io/mcp/servers/cloudwatch-mcp-server/) |
| Logs | `describe_log_groups` | ✅ | 查找日志组元数据，支持跨账户查询、名称前缀过滤、日志类别筛选 | [`tools.py:232`](AWS/Code/cloudwatch-mcp-server/awslabs/cloudwatch_mcp_server/cloudwatch_logs/tools.py:232) | v0.0.3+ | - |
| Logs | `analyze_log_group` | ✅ | 分析日志异常和错误模式，包含异常检测、常见模式识别、错误模式统计 | [`tools.py:362`](AWS/Code/cloudwatch-mcp-server/awslabs/cloudwatch_mcp_server/cloudwatch_logs/tools.py:362) | v0.0.3+ | - |
| Logs | `execute_log_insights_query` | ✅ | 执行CloudWatch Logs Insights查询，返回查询ID用于轮询结果 | [`tools.py:509`](AWS/Code/cloudwatch-mcp-server/awslabs/cloudwatch_mcp_server/cloudwatch_logs/tools.py:509) | v0.0.3+ | - |
| Logs | `get_logs_insight_query_results` | ✅ | 获取Logs Insights查询结果（通过query_id） | [`tools.py:616`](AWS/Code/cloudwatch-mcp-server/awslabs/cloudwatch_mcp_server/cloudwatch_logs/tools.py:616) | v0.0.3+ | - |
| Logs | `cancel_logs_insight_query` | ✅ | 取消正在执行的Logs Insights查询 | [`tools.py:670`](AWS/Code/cloudwatch-mcp-server/awslabs/cloudwatch_mcp_server/cloudwatch_logs/tools.py:670) | v0.0.3+ | - |
| **CloudWatch Metrics** | 工具总数 | ✅ | 3个工具 | [`tools.py`](AWS/Code/cloudwatch-mcp-server/awslabs/cloudwatch_mcp_server/cloudwatch_metrics/tools.py) | v0.0.3+ | [链接](https://awslabs.github.io/mcp/servers/cloudwatch-mcp-server/) |
| Metrics | `get_metric_data` | ✅ | 检索指标时间序列数据，支持标准GetMetricData和Metrics Insights两种模式，支持维度分组、排序、限制 | [`tools.py:142`](AWS/Code/cloudwatch-mcp-server/awslabs/cloudwatch_mcp_server/cloudwatch_metrics/tools.py:142) | v0.0.3+ | - |
| Metrics | `get_metric_metadata` | ✅ | 获取指标定义和推荐统计信息（从预置元数据索引） | [`tools.py:576`](AWS/Code/cloudwatch-mcp-server/awslabs/cloudwatch_mcp_server/cloudwatch_metrics/tools.py:576) | v0.0.3+ | - |
| Metrics | `get_recommended_metric_alarms` | ✅ | 获取指标的推荐告警配置（阈值、评估周期、统计方式） | [`tools.py:653`](AWS/Code/cloudwatch-mcp-server/awslabs/cloudwatch_mcp_server/cloudwatch_metrics/tools.py:653) | v0.0.3+ | - |
| **CloudWatch Alarms** | 工具总数 | ✅ | 2个工具 | [`tools.py`](AWS/Code/cloudwatch-mcp-server/awslabs/cloudwatch_mcp_server/cloudwatch_alarms/tools.py) | v0.0.3+ | [链接](https://awslabs.github.io/mcp/servers/cloudwatch-mcp-server/) |
| Alarms | `get_active_alarms` | ✅ | 获取当前处于ALARM状态的所有告警（包含Metric和Composite告警） | [`tools.py:69`](AWS/Code/cloudwatch-mcp-server/awslabs/cloudwatch_mcp_server/cloudwatch_alarms/tools.py:69) | v0.0.3+ | - |
| Alarms | `get_alarm_history` | ✅ | 检索告警的历史状态变化记录 | [`tools.py:188`](AWS/Code/cloudwatch-mcp-server/awslabs/cloudwatch_mcp_server/cloudwatch_alarms/tools.py:188) | v0.0.3+ | - |
| **工具总计** | - | ✅ | **10个工具** | - | - | - |
#### 1.2 参数验证机制

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|------------|
| 参数验证 | JSON Schema验证 | ✅ | 通过Pydantic Field自动生成Schema，所有参数都有描述 | v0.0.3+ | - |
| 参数验证 | 类型检查 | ✅ | Pydantic自动类型验证，支持Union类型（如str/datetime） | v0.0.3+ | - |
| 参数验证 | 必填参数检查 | ✅ | 使用`Field(...)`标记必填参数 | v0.0.3+ | - |
| 参数验证 | 枚举值限制 | ✅ | 使用`Literal`类型限制可选值（如statistic参数） | v0.0.3+ | - |
| 参数验证 | 自定义验证器 | ✅ | 如`_validate_log_group_parameters`验证互斥参数 | v0.0.3+ | - |
| 参数验证 | 默认值处理 | ✅ | 所有可选参数都有明确的默认值 | v0.0.3+ | - |
| 参数验证 | 错误消息质量 | ⭐⭐⭐⭐☆ | Pydantic生成详细的验证错误信息 | v0.0.3+ | - |

#### 1.3 并行调用支持

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|------------|
| 并行调用 | 多工具并行 | ✅ | 所有工具都是异步函数，支持asyncio并行调用 | v0.0.3+ | - |
| 并行调用 | 最大并发数 | ⚠️ | 无内置限制，受限于AWS API速率限制和MCP客户端配置 | - | - |
| 并行调用 | 并发安全 | ✅ | 每次调用创建独立的boto3客户端，无共享状态冲突 | v0.0.3+ | - |
| 并行调用 | 连接池管理 | ⚠️ | boto3内置连接池，但MCP服务器无额外管理 | - | - |
| 并行调用 | 批量操作支持 | ◐ | 部分支持：日志组查询支持多个log_group_names，但无批量工具调用API | v0.0.3+ | - |

**并发能力评估**: ⭐⭐⭐⭐☆
- ✅ 原生异步支持
- ⚠️ 无内置并发控制
- ✅ 无状态设计避免竞态

#### 1.4 流式处理支持

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|------------|
| 流式处理 | 流式响应 | ❌ | 不支持流式返回，所有工具返回完整响应 | - | - |
| 流式处理 | 分页支持 | ✅ | 使用boto3 paginator自动处理分页，但对MCP客户端返回完整结果 | v0.0.3+ | - |
| 流式处理 | 增量更新 | ❌ | 不支持，查询必须等待完成后返回全部结果 | - | - |
| 流式处理 | Server-Sent Events | ❌ | 不支持SSE（MCP协议使用stdio传输） | - | - |
| 流式处理 | 轮询机制 | ✅ | Logs Insights查询支持轮询（返回query_id，客户端轮询） | v0.0.3+ | - |
| 流式处理 | 大数据处理 | ◐ | 通过`max_items`限制响应大小，默认50条，防止上下文溢出 | v0.0.3+ | - |

**流式能力评估**: ⭐⭐☆☆☆
- ❌ 无真正流式处理
- ✅ 支持轮询模式
- ⚠️ 大数据依赖客户端分批请求

#### 1.5 错误处理机制

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|------------|
| 错误处理 | 错误类型分类 | ✅ | 区分AWS API错误、参数验证错误、超时错误等 | v0.0.3+ | - |
| 错误处理 | 错误类型数量 | ⭐⭐⭐⭐☆ | 10+种错误类型（boto3异常、Pydantic验证、自定义异常） | v0.0.3+ | - |
| 错误处理 | 错误捕获 | ✅ | 所有工具使用try/except包裹，捕获所有异常 | v0.0.3+ | - |
| 错误处理 | 错误日志 | ✅ | 使用loguru记录详细错误信息（ERROR级别） | v0.0.3+ | - |
| 错误处理 | 错误传播 | ✅ | 通过`ctx.error()`返回错误信息给MCP客户端 | v0.0.3+ | - |
| 错误处理 | 降级策略 | ◐ | 部分支持：查询超时返回query_id供后续重试；空结果返回友好消息 | v0.0.3+ | - |
| 错误处理 | 重试机制 | ✅ | boto3内置指数退避重试（最多3次） | v0.0.3+ | - |
| 错误处理 | 熔断保护 | ❌ | 无熔断器，高频失败会持续调用AWS API | - | - |
| 错误处理 | 错误恢复建议 | ◐ | 部分工具提供错误恢复提示（如Logs Insights超时） | v0.0.3+ | - |

**错误处理代码示例**:
```python
try:
    result = logs_client.start_query(...)
except Exception as e:
    logger.error(f'Error starting query: {str(e)}')
    await ctx.error(f'Error executing query: {str(e)}')
    raise
```

**错误处理评分**: ⭐⭐⭐⭐☆
- ✅ 全面的错误捕获
- ✅ 详细的日志记录
- ⚠️ 缺少高级降级和熔断

---

### 2. Resources管理

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|------------|
| Resources | 资源发现 | ❌ | **不支持MCP Resources**，仅提供Tools | - | - |
| Resources | 支持的资源类型 | - | 0种（无Resources实现） | - | - |
| Resources | URI模板设计 | ❌ | 无Resources，无URI模板 | - | - |
| Resources | 订阅机制 | ❌ | 不支持资源订阅 | - | - |
| Resources | 实时更新 | ❌ | 不支持（无订阅机制） | - | - |
| Resources | 分页策略 | - | N/A（无Resources） | - | - |

**Resources能力评估**: ⭐☆☆☆☆
- ❌ **无MCP Resources实现**
- ✅ 所有功能通过Tools提供
- ℹ️ 这是设计选择，Tools模式更适合查询场景

**设计说明**:
AWS CloudWatch MCP采用纯Tools架构，不使用MCP Resources特性。这是因为：
1. CloudWatch数据是动态的，不适合静态资源模型
2. 查询参数复杂，Tools提供更好的灵活性
3. 避免Resources的订阅开销

**替代方案**:
- 通过`describe_log_groups`获取日志组列表（类似资源发现）
- 使用`max_items`参数实现分页效果
- 客户端主动轮询实现"订阅"效果

---

### 3. Prompts/Sampling

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|------------|
| Prompts | 提示词管理 | ❌ | **不支持MCP Prompts** | - | - |
| Prompts | 预置提示词 | ❌ | 无预置提示词模板 | - | - |
| Prompts | 自定义提示词 | ❌ | 不支持 | - | - |
| Prompts | 提示词版本控制 | ❌ | 不支持 | - | - |
| Sampling | 采样策略 | ❌ | **不支持MCP Sampling** | - | - |
| Sampling | 支持的采样方式 | - | N/A | - | - |
| Sampling | 自定义采样 | ❌ | 不支持 | - | - |

**Prompts/Sampling能力评估**: ⭐☆☆☆☆
- ❌ **无MCP Prompts/Sampling实现**
- ℹ️ 服务器指令通过FastMCP的`instructions`参数提供

**服务器级指令**（代替Prompts）:
```python
mcp = FastMCP(
    'awslabs.cloudwatch-mcp-server',
    instructions='Use this MCP server to run read-only commands and analyze CloudWatch Logs, Metrics, and Alarms. ...'
)
```

这是一个全局指令，会被MCP客户端展示给LLM，指导其如何使用工具。

**设计说明**:
- AWS CloudWatch MCP专注于工具提供，不涉及提示词管理
- 工具文档字符串（docstring）本身就是最好的"提示词"
- LLM客户端负责提示词工程

---

### 4. Model兼容性

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|------------|
| Model兼容性 | 官方支持的模型 | ✅ | **所有支持MCP协议的模型**（协议无关） | v0.0.3+ | - |
| Model兼容性 | OpenAI系列 | ✅ | 通过MCP客户端支持（如Cursor + OpenAI） | v0.0.3+ | - |
| Model兼容性 | Anthropic系列 | ✅ | 官方推荐（Claude Code, Amazon Q CLI） | v0.0.3+ | - |
| Model兼容性 | 开源模型 | ✅ | 理论支持所有实现MCP客户端的开源模型 | v0.0.3+ | - |
| Model兼容性 | 私有模型 | ✅ | 只要实现MCP客户端即可 | v0.0.3+ | - |
| 模型切换 | 切换灵活性 | ✅ | MCP服务器与模型完全解耦，由客户端决定 | v0.0.3+ | - |
| 模型切换 | 配置方式 | - | 在MCP客户端配置，非服务器端 | - | - |
| 性能差异 | 模型相关优化 | ◐ | 响应优化（max_items限制）针对LLM上下文窗口，但不针对特定模型 | v0.0.3+ | - |

**Model兼容性评估**: ⭐⭐⭐⭐⭐
- ✅ **完全模型无关**
- ✅ 遵循MCP协议标准
- ✅ 响应格式优化为LLM友好

**支持的MCP客户端**:
- ✅ Cursor IDE
- ✅ VS Code (MCP扩展)
- ✅ Amazon Q CLI
- ✅ Cline
- ✅ 任何实现MCP协议的客户端

**响应优化设计**:
```python
# 1. 限制默认返回条数
max_items: int = 50  # 防止LLM上下文溢出

# 2. 清理冗余字段
clean_up_pattern(pattern_result)  # 移除tokens、visualization等

# 3. 结构化响应
return GetMetricDataResponse(  # Pydantic模型，JSON Schema清晰
    metric_data_results=[...],
    ...
)
```

---

### 5. 连接方式

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|------------|
| 连接协议 | stdio | ✅ | **唯一支持的协议**（MCP标准） | v0.0.3+ | - |
| 连接协议 | SSE (Server-Sent Events) | ❌ | 不支持 | - | - |
| 连接协议 | WebSocket | ❌ | 不支持 | - | - |
| 连接协议 | HTTP/REST | ❌ | 不支持 | - | - |
| 连接管理 | 连接池 | ❌ | stdio不需要连接池 | - | - |
| 连接管理 | 断线重连 | ❌ | stdio由MCP客户端管理，服务器端不处理 | - | - |
| 连接管理 | 心跳检测 | ❌ | 不支持 | - | - |
| 连接管理 | 超时配置 | ◐ | 依赖FastMCP默认值，无显式配置 | v0.0.3+ | - |
| 连接管理 | 并发连接数 | - | stdio单连接模型（一个进程一个连接） | - | - |
| 传输安全 | TLS/SSL | - | stdio在本地，无需加密 | - | - |

**连接方式评估**: ⭐⭐⭐☆☆
- ✅ 标准stdio实现
- ⚠️ 仅支持本地连接
- ❌ 无远程连接能力

**stdio连接模型**:
```
MCP客户端 (Cursor/Q CLI)
    ↓ stdin/stdout
MCP服务器 (Python进程)
    ↓ boto3
AWS CloudWatch API (HTTPS)
```

**运行要求**:
- ✅ 服务器必须与MCP客户端在同一主机
- ✅ 每个客户端独立启动服务器进程
- ❌ 不支持多客户端共享同一服务器实例

**Docker模式下的stdio**:
```bash
docker run --rm --interactive \
  -v ~/.aws:/root/.aws \
  awslabs/cloudwatch-mcp-server:latest
```
- 使用`--interactive`保持stdin打开
- 容器内stdio映射到宿主机

---

### 6. 认证授权

#### 6.1 认证方式

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|------------|
| 认证方式 | AWS_PROFILE | ✅ | **推荐方式**，通过环境变量指定AWS配置文件 | v0.0.3+ | - |
| 认证方式 | 默认凭证链 | ✅ | 支持AWS SDK标准凭证链（环境变量、配置文件、IAM角色） | v0.0.3+ | - |
| 认证方式 | IAM角色 | ✅ | EC2/ECS实例角色自动获取临时凭证 | v0.0.3+ | - |
| 认证方式 | 环境变量凭证 | ✅ | AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY | v0.0.3+ | - |
| 认证方式 | API Key | ❌ | 不支持（使用AWS凭证） | - | - |
| 认证方式 | OAuth | ❌ | 不支持 | - | - |
| 认证方式 | 证书认证 | ❌ | 不支持 | - | - |
| 认证方式 | MFA | ◐ | 通过AWS CLI配置支持（aws_session_token） | v0.0.3+ | - |

**凭证优先级**（boto3标准）:
```
1. 代码中显式传递（不适用于本MCP）
2. 环境变量（AWS_ACCESS_KEY_ID等）
3. AWS_PROFILE环境变量指定的profile
4. ~/.aws/credentials中的[default] profile
5. ~/.aws/config中的配置
6. IAM实例角色（EC2/ECS/Lambda）
7. 容器凭证（ECS任务角色）
```

**认证代码实现**:
```python
def _get_logs_client(self, region: str):
    config = Config(user_agent_extra=f'awslabs/mcp/cloudwatch-mcp-server/{VERSION}')

    if aws_profile := os.environ.get('AWS_PROFILE'):
        # 方式1: 使用指定profile
        return boto3.Session(
            profile_name=aws_profile,
            region_name=region
        ).client('logs', config=config)
    else:
        # 方式2: 使用默认凭证链
        return boto3.Session(
            region_name=region
        ).client('logs', config=config)
```

#### 6.2 Token管理

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|------------|
| Token管理 | 自动刷新 | ✅ | boto3自动刷新临时凭证（IAM角色模式） | v0.0.3+ | - |
| Token管理 | 手动刷新 | ◐ | 静态凭证需要手动更新（不推荐使用） | v0.0.3+ | - |
| Token管理 | 过期检测 | ✅ | boto3自动检测并报错 | v0.0.3+ | - |
| Token管理 | Token缓存 | ✅ | boto3在~/.aws/cli/cache/目录缓存临时凭证 | v0.0.3+ | - |
| Token管理 | Token撤销 | ❌ | 依赖AWS IAM，服务器端不处理 | - | - |

#### 6.3 权限粒度

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|------------|
| 权限粒度 | 工具级权限 | ❌ | 无MCP层面权限控制，依赖AWS IAM | - | - |
| 权限粒度 | 资源级权限 | ✅ | 通过IAM策略精确控制可访问的日志组/告警/指标 | v0.0.3+ | - |
| 权限粒度 | 细粒度IAM | ✅ | 支持AWS IAM完整权限体系 | v0.0.3+ | - |
| 权限粒度 | 权限最小化 | ✅ | README提供最小权限IAM策略示例 | v0.0.3+ | [`链接`](AWS/Code/cloudwatch-mcp-server/README.md#required-iam-permissions) |
| 权限验证 | 预检查 | ❌ | 不在启动时验证权限，首次API调用时才发现 | - | - |
| 权限验证 | 错误提示 | ✅ | AWS API返回详细的权限错误信息 | v0.0.3+ | - |

**必需IAM权限清单**:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "cloudwatch:DescribeAlarms",
      "cloudwatch:DescribeAlarmHistory",
      "cloudwatch:GetMetricData",
      "cloudwatch:ListMetrics",
      "logs:DescribeLogGroups",
      "logs:DescribeQueryDefinitions",
      "logs:ListLogAnomalyDetectors",
      "logs:ListAnomalies",
      "logs:StartQuery",
      "logs:GetQueryResults",
      "logs:StopQuery"
    ],
    "Resource": "*"
  }]
}
```

**权限细化示例**:
```json
{
  "Effect": "Allow",
  "Action": ["logs:StartQuery", "logs:GetQueryResults"],
  "Resource": [
    "arn:aws:logs:us-east-1:123456789012:log-group:/aws/lambda/my-function:*"
  ]
}
```

**认证授权评分**: ⭐⭐⭐⭐☆
- ✅ 完整AWS凭证支持
- ✅ 细粒度IAM权限
- ⚠️ 无MCP层面权限控制

---

### 7. 安全特性

| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |
|---------|-----------|---------|---------|---------|------------|
| 数据加密 | 传输加密 (TLS) | ✅ | boto3与AWS API通信使用HTTPS | v0.0.3+ | - |
| 数据加密 | stdio加密 | ❌ | 本地stdio通信无加密（本地信任） | - | - |
| 数据加密 | 静态数据加密 | - | 不存储数据，N/A | - | - |
| 数据加密 | KMS集成 | ◐ | 读取KMS加密的日志组（由CloudWatch处理） | v0.0.3+ | - |
| 权限控制 | 最小权限原则 | ✅ | README提供最小权限示例 | v0.0.3+ | - |
| 权限控制 | 资源隔离 | ✅ | 通过IAM策略限制可访问的资源 | v0.0.3+ | - |
| 权限控制 | 跨账户访问 | ✅ | `describe_log_groups`支持跨账户查询（监控账户模式） | v0.0.3+ | - |
| 审计日志 | 操作审计 | ✅ | loguru记录所有操作（ERROR/INFO/DEBUG级别） | v0.0.3+ | - |
| 审计日志 | 审计日志完整性 | ⭐⭐⭐☆☆ | 记录工具调用和错误，但未记录参数详情（避免敏感信息泄露） | v0.0.3+ | - |
| 审计日志 | 审计日志存储 | ◐ | 输出到stdout/stderr，可重定向到文件或日志服务 | v0.0.3+ | - |
| 审计日志 | AWS CloudTrail | ✅ | AWS API调用自动记录到CloudTrail | v0.0.3+ | - |
| 密钥管理 | 密钥检测 | ✅ | pre-commit钩子使用detect-secrets扫描 | v0.0.3+ | - |
| 密钥管理 | 密钥轮换 | ◐ | 支持IAM角色临时凭证自动轮换 | v0.0.3+ | - |
| 密钥管理 | 密钥存储 | ✅ | 凭证存储在~/.aws/credentials（用户级文件权限保护） | v0.0.3+ | - |
| 安全扫描 | 依赖扫描 | ✅ | Dependabot自动扫描依赖漏洞 | v0.0.3+ | - |
| 安全扫描 | 代码扫描 | ✅ | bandit扫描Python安全问题（pre-commit） | v0.0.3+ | - |
| 安全扫描 | 容器扫描 | ◐ | Docker基础镜像定期更新（dependabot） | v0.0.3+ | - |
| 安全最佳实践 | 非root用户运行 | ✅ | Dockerfile创建app用户运行服务 | v0.0.3+ | - |
| 安全最佳实践 | 只读操作 | ✅ | **所有工具都是只读的**，无写入/删除操作 | v0.0.3+ | - |
| 安全最佳实践 | User-Agent标记 | ✅ | 所有请求添加自定义User-Agent便于追踪 | v0.0.3+ | - |
| 安全最佳实践 | 输入验证 | ✅ | Pydantic全面验证输入 | v0.0.3+ | - |
| 安全最佳实践 | SQL注入防护 | - | 不适用（无SQL操作） | - | - |
| 漏洞响应 | 漏洞响应速度 | ⭐⭐⭐⭐☆ | AWS Labs官方维护，有专门团队 | v0.0.3+ | - |
| 漏洞响应 | 安全公告 | ✅ | 通过GitHub Security Advisories发布 | v0.0.3+ | [链接](https://github.com/awslabs/mcp/security) |
| 漏洞响应 | 版本更新频率 | ⭐⭐⭐⭐☆ | 定期更新（最近提交2025-10-28） | v0.0.3+ | - |

**安全架构图**:
```
┌─────────────────────────────────────────┐
│ MCP客户端 (本地，用户权限)              │
└────────────┬────────────────────────────┘
             │ stdio (本地通信)
             ↓
┌─────────────────────────────────────────┐
│ MCP服务器 (Python进程, 非root用户)      │
│ - Pydantic输入验证                      │
│ - loguru审计日志                        │
│ - 只读操作                              │
└────────────┬────────────────────────────┘
             │ HTTPS + AWS SigV4签名
             ↓
┌─────────────────────────────────────────┐
│ AWS CloudWatch API                      │
│ - IAM权限控制                           │
│ - CloudTrail审计                        │
│ - KMS加密（可选）                       │
└─────────────────────────────────────────┘
```

**安全优势**:
1. ✅ **只读设计**: 所有工具都是查询操作，无法修改/删除资源
2. ✅ **IAM集成**: 利用AWS成熟的权限体系
3. ✅ **审计完整**: 本地日志 + CloudTrail双重审计
4. ✅ **密钥安全**: 支持临时凭证，避免长期密钥泄露
5. ✅ **依赖安全**: 自动化扫描和更新

**安全劣势**:
1. ⚠️ **stdio明文**: 本地通信无加密（假定本地环境可信）
2. ⚠️ **无访问控制**: MCP层面无用户/角色区分（依赖系统用户隔离）
3. ⚠️ **日志泄露风险**: DEBUG模式可能记录敏感参数

**安全评分**: ⭐⭐⭐⭐☆
- ✅ 只读操作大幅降低风险
- ✅ AWS安全最佳实践
- ⚠️ 本地部署假定环境可信

---

## 第二部分: 性能指标详解

### 2.1 响应时间指标

| 指标类型 | 典型值 | 说明 | 影响因素 |
|---------|--------|------|---------|
| **工具调用延迟** | | | |
| 本地工具启动 | <100ms | MCP服务器启动和工具注册时间 | Python环境、依赖加载 |
| 参数验证 | <10ms | Pydantic验证时间 | 参数复杂度 |
| **AWS API延迟** | | | |
| DescribeLogGroups | 100-500ms | 列出日志组 | 日志组数量、区域 |
| StartQuery (Logs Insights) | 100-300ms | 启动查询 | 查询复杂度 |
| GetQueryResults | 100ms-15min | 获取查询结果 | 查询范围、数据量 |
| DescribeAlarms | 200-800ms | 获取告警列表 | 告警数量 |
| GetMetricData | 500ms-5s | 获取指标数据 | 时间范围、数据点数量 |
| **端到端延迟** | | | |
| 简单查询 (get_active_alarms) | 0.5-1.5s | 包含网络、API、处理 | 网络质量、AWS区域 |
| 复杂查询 (analyze_log_group) | 5-60s | 多次API调用 + 数据处理 | 日志量、异常检测器数量 |
| 长查询 (Logs Insights) | 10s-15min | 等待AWS处理大数据 | 查询范围、日志量 |

**性能优化措施**:
1. ✅ **客户端缓存**: boto3自动缓存DNS解析和连接
2. ✅ **自动分页**: boto3 paginator自动处理多页请求
3. ✅ **异步设计**: 工具异步执行，支持并发
4. ✅ **响应限制**: `max_items`防止大响应

### 2.2 吞吐量指标

| 指标类型 | 典型值 | 说明 | 限制因素 |
|---------|--------|------|---------|
| **API调用速率** | | | |
| CloudWatch API | 400 TPS | AWS服务端限制（可提升） | AWS账户配额 |
| Logs API | 5-10 TPS | 部分API速率更低 | API类型 |
| Logs Insights并发 | 30个/区域 | 同时执行的查询数 | AWS服务端限制 |
| **MCP工具调用** | | | |
| 单客户端QPS | 无硬限制 | 受AWS API限制 | boto3重试、网络 |
| 并发工具调用 | 10-50个 | 实际受AWS API限制 | asyncio并发度 |
| **数据传输** | | | |
| 单次响应大小 | 建议<1MB | 防止LLM上下文溢出 | max_items参数 |
| 查询结果最大 | 10,000条 | Logs Insights限制 | AWS服务端限制 |

**吞吐量优化建议**:
- 使用`max_items`控制响应大小
- 并行调用不同工具（如同时查询日志和指标）
- 避免短时间内重复查询相同数据
- 考虑申请AWS API配额提升

### 2.3 资源消耗指标

| 资源类型 | 基础消耗 | 峰值消耗 | 说明 |
|---------|---------|---------|------|
| **内存** | | | |
| 服务器进程 | ~50MB | ~200MB | 包含Python运行时和依赖 |
| 元数据索引 | ~5MB | - | metric_metadata.json加载到内存 |
| 单次查询 | +10-50MB | +200MB | 临时存储响应数据 |
| **CPU** | | | |
| 空闲 | <1% | - | 等待stdio输入 |
| 查询处理 | 5-20% | 50% | Pydantic序列化、数据处理 |
| **网络** | | | |
| 上行 (到AWS) | <1KB/请求 | ~100KB | API请求大小 |
| 下行 (从AWS) | 10KB-10MB | - | 取决于查询结果 |
| **磁盘** | | | |
| 代码和依赖 | ~100MB | - | Python包大小 |
| 日志文件 | 0-unlimited | - | 取决于日志配置 |

**Docker镜像大小**:
- 基础镜像: Python 3.13 Alpine (~50MB)
- 最终镜像: ~100MB（优化后）

### 2.4 可扩展性指标

| 扩展维度 | 能力 | 说明 | 限制 |
|---------|------|------|------|
| **水平扩展** | | | |
| 多实例 | ✅ | 每个MCP客户端独立进程 | 无共享状态 |
| 负载均衡 | ❌ | stdio单连接，无需负载均衡 | - |
| **垂直扩展** | | | |
| CPU | ⭐⭐☆☆☆ | IO密集型，CPU不是瓶颈 | - |
| 内存 | ⭐⭐⭐☆☆ | 受响应数据大小限制 | max_items控制 |
| **数据规模** | | | |
| 日志组数量 | 无限制 | 通过分页处理 | API响应时间 |
| 单次查询范围 | 建议<24h | 长查询可能超时 | 15分钟查询超时 |
| 并发查询 | 30个/区域 | AWS限制 | 服务端配额 |

---

## 第三部分: 限制条件说明

### 3.1 AWS服务限制

#### 3.1.1 CloudWatch Logs限制

| 限制项 | 数值 | 影响 | 缓解措施 |
|--------|------|------|---------|
| **Logs Insights** | | | |
| 并发查询 | 30个/账户/区域 | 超过后StartQuery失败 | 客户端队列 + 重试 |
| 查询超时 | 15分钟 | 长查询自动取消 | 缩小时间范围 |
| 查询结果 | 10,000条 | 超过后截断 | 使用LIMIT + 多次查询 |
| 查询历史 | 7天 | 过期查询ID无法获取结果 | 及时获取结果 |
| **API速率** | | | |
| StartQuery | 5 TPS | 超过触发限流 | 客户端限速 |
| GetQueryResults | 5 TPS | 轮询可能受限 | 增加轮询间隔 |
| DescribeLogGroups | 5 TPS | 列表查询受限 | 使用name_prefix减少调用 |
| **数据限制** | | | |
| 日志组名称 | 512字符 | 超长名称报错 | 验证输入 |
| 日志事件大小 | 256KB | 单条日志限制 | - |

#### 3.1.2 CloudWatch Metrics限制

| 限制项 | 数值 | 影响 | 缓解措施 |
|--------|------|------|---------|
| **GetMetricData** | | | |
| 数据点 | 100,800个/请求 | 大范围查询超限 | 分批查询 |
| Metrics数量 | 500个/请求 | - | 分批查询 |
| API速率 | 400 TPS | 可申请提升 | 申请配额 |
| **Metrics维度** | | | |
| 维度数量 | 30个/Metric | 超过截断 | 选择关键维度 |
| 维度值长度 | 1024字符 | - | - |

#### 3.1.3 CloudWatch Alarms限制

| 限制项 | 数值 | 影响 | 缓解措施 |
|--------|------|------|---------|
| **DescribeAlarms** | | | |
| 单次返回 | 100个 | 需要分页 | 使用paginator |
| 告警历史 | 默认14天 | 历史数据有限 | 调整时间范围 |
| API速率 | 400 TPS | - | - |

### 3.2 MCP服务器限制

| 限制项 | 数值/说明 | 可配置 | 影响 | 解决方案 |
|--------|----------|--------|------|---------|
| **请求限制** | | | | |
| max_items默认值 | 50 | ✅ | 默认仅返回50条 | 增加max_items参数 |
| 日志样本数量 | 1条/模式 | ❌ | 错误样本少 | 修改clean_up_pattern() |
| 默认区域 | us-east-1 | ✅ | 跨区域需显式指定 | 使用region参数 |
| **超时限制** | | | | |
| 工具执行超时 | 无明确限制 | - | 长查询阻塞 | 使用轮询模式 |
| Logs Insights轮询 | 默认等待完成 | ❌ | 可能阻塞很久 | 返回query_id异步查询 |
| **并发限制** | | | | |
| 客户端并发 | 无限制 | - | 受AWS API限制 | 客户端控制并发 |
| 服务器并发 | 无限制 | - | asyncio自动调度 | - |
| **响应大小** | | | | |
| 建议上限 | <1MB | ⚠️ | 大响应影响LLM | 使用max_items限制 |
| 实际上限 | 无硬限制 | - | 可能超出LLM上下文 | 分批查询 |

### 3.3 部署限制

| 限制项 | 说明 | 影响 | 解决方案 |
|--------|------|------|---------|
| **环境限制** | | | |
| 运行位置 | 必须与MCP客户端同主机 | 无法远程部署 | 本地安装或本地Docker |
| 传输协议 | 仅stdio | 无法通过网络访问 | 无解（MCP协议限制） |
| Python版本 | >=3.10 | 旧系统不兼容 | 使用Docker |
| **网络限制** | | | |
| AWS API访问 | 需要公网或VPC端点 | 内网隔离环境不可用 | 配置VPC端点 |
| DNS解析 | 需要解析*.amazonaws.com | 企业防火墙可能阻止 | 配置代理或白名单 |
| **权限限制** | | | |
| IAM权限 | 需要11个权限 | 权限不足导致失败 | 配置IAM策略 |
| 跨账户访问 | 需要Trust Policy | 默认仅访问同账户 | 配置跨账户角色 |
| **多租户限制** | | | |
| 用户隔离 | 不支持 | 每用户需独立实例 | 使用系统用户隔离 |
| 配额共享 | 不支持 | 所有用户共享AWS配额 | 申请配额提升 |

### 3.4 功能限制

| 限制项 | 说明 | 影响 | 解决方案 |
|--------|------|------|---------|
| **不支持的MCP特性** | | | |
| Resources | 无Resources实现 | 无资源订阅 | 通过Tools主动查询 |
| Prompts | 无Prompts实现 | 无提示词模板 | 使用工具文档字符串 |
| Sampling | 无Sampling实现 | 无采样配置 | - |
| **不支持的操作** | | | |
| 写入操作 | 所有工具只读 | 无法创建/修改/删除 | 使用AWS CLI |
| 实时订阅 | 无订阅机制 | 无法实时接收事件 | 定期轮询 |
| 批量操作 | 无批量工具 | 需要循环调用 | 客户端实现批量 |
| **不支持的传输** | | | |
| SSE | 不支持 | 无流式推送 | - |
| WebSocket | 不支持 | 无双向通信 | - |
| HTTP | 不支持 | 无REST API | - |

### 3.5 已知问题和限制

#### 3.5.1 技术债务

| 问题 | 影响 | 优先级 | GitHub Issue |
|------|------|--------|-------------|
| Windows路径支持 | Windows用户配置复杂 | 中 | - |
| 元数据索引更新 | 新Metric元数据可能缺失 | 低 | - |
| 大响应处理 | 可能超出LLM上下文 | 中 | - |
| 监控指标缺失 | 难以诊断性能问题 | 低 | - |

#### 3.5.2 兼容性问题

| 问题 | 影响范围 | 解决方案 |
|------|---------|---------|
| Python 3.9不支持 | 旧系统 | 升级Python或使用Docker |
| boto3版本要求 | <1.38.22版本不兼容 | 升级boto3 |
| MCP协议版本 | 旧客户端可能不兼容 | 升级MCP客户端 |

#### 3.5.3 性能瓶颈

| 瓶颈 | 场景 | 影响 | 优化方向 |
|------|------|------|---------|
| AWS API速率 | 高频查询 | 限流 | 客户端限速 + 缓存 |
| 长查询超时 | 大范围日志分析 | 查询失败 | 缩小时间窗口 |
| 大响应传输 | 返回大量数据 | LLM性能下降 | 强制max_items限制 |
| 串行工具调用 | 复杂场景 | 总耗时长 | 客户端并行调用 |

---

## 📊 综合能力雷达图

```
            Tools能力 (90%)
                 ⭐⭐⭐⭐⭐
                    /|\
                   / | \
                  /  |  \
                 /   |   \
     安全性(80%)/    |    \Model兼容性(100%)
      ⭐⭐⭐⭐     |     ⭐⭐⭐⭐⭐
              \  |  /
               \ | /
                \|/
            认证授权(80%)
             ⭐⭐⭐⭐

    连接方式(60%)        性能(70%)
     ⭐⭐⭐☆☆          ⭐⭐⭐⭐☆

Resources(20%) Prompts(20%)
  ⭐☆☆☆☆      ⭐☆☆☆☆
```

---

## 🎯 能力总结

### 核心优势能力

1. ✅ **Tools能力完善** (90%)
   - 10个精心设计的工具
   - 完整的参数验证
   - 异步并发支持
   - 优秀的错误处理

2. ✅ **Model兼容性极佳** (100%)
   - 完全模型无关
   - 遵循MCP标准
   - 响应格式优化

3. ✅ **认证授权成熟** (80%)
   - AWS完整凭证支持
   - 细粒度IAM权限
   - 临时凭证自动刷新

4. ✅ **安全性高** (80%)
   - 只读操作
   - 完整审计
   - 依赖扫描

### 关键限制

1. ❌ **无Resources实现** (20%)
   - 设计选择，Tools更适合
   - 通过Tools实现类似功能

2. ❌ **无Prompts/Sampling** (20%)
   - 非核心功能
   - 通过其他方式替代

3. ⚠️ **连接方式受限** (60%)
   - 仅stdio，无远程访问
   - MCP协议标准限制

4. ⚠️ **性能依赖AWS** (70%)
   - 受AWS API速率限制
   - 长查询可能超时

### 适用场景评估

| 场景 | 适用性 | 说明 |
|------|--------|------|
| AI驱动故障排查 | ⭐⭐⭐⭐⭐ | 核心场景，完美匹配 |
| 智能运维助手 | ⭐⭐⭐⭐⭐ | 自然语言查询监控数据 |
| IDE集成开发 | ⭐⭐⭐⭐☆ | Cursor/VS Code良好支持 |
| 实时监控告警 | ⭐⭐☆☆☆ | 无实时订阅，需轮询 |
| 大规模数据分析 | ⭐⭐☆☆☆ | 响应大小受限 |
| 多租户SaaS | ⭐☆☆☆☆ | 无租户隔离 |

---

## 📚 参考文档

### 官方文档
- **项目主页**: https://awslabs.github.io/mcp/
- **服务器文档**: https://awslabs.github.io/mcp/servers/cloudwatch-mcp-server/
- **GitHub仓库**: https://github.com/awslabs/mcp
- **PyPI包**: https://pypi.org/project/awslabs.cloudwatch-mcp-server/
- **CHANGELOG**: [CHANGELOG.md](AWS/Code/cloudwatch-mcp-server/CHANGELOG.md)

### 技术规范
- **MCP协议**: https://modelcontextprotocol.io/
- **FastMCP框架**: https://github.com/jlowin/fastmcp
- **AWS CloudWatch**: https://docs.aws.amazon.com/cloudwatch/
- **boto3文档**: https://boto3.amazonaws.com/v1/documentation/api/latest/

### 工具文档
- **uv包管理器**: https://docs.astral.sh/uv/
- **MCP Inspector**: https://modelcontextprotocol.io/docs/tools/inspector
- **Pydantic**: https://docs.pydantic.dev/
