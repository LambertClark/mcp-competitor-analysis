# 火山引擎 ECS MCP "Agent as Tools" 模式调研报告

## 一、结论

### 远程API调用识别

经过对火山引擎 ECS MCP Server 公开源代码的全面审查，我们确认：**该项目中没有任何工具使用了 Agent-as-Tools 模式**。所有9个工具都是对火山引擎 ECS 标准 API 的直接封装，采用确定性算法实现。

### 实现模式分析

通过分析工具实现代码、依赖文件和API调用模式，我们识别出以下关键特征：

**证据1（标准API封装）**：所有工具都直接调用火山引擎 ECS 标准API（describe_instances, describe_images, describe_system_events等），没有任何AI服务调用。[见证据 1-3]

**证据2（结构化参数）**：所有工具接收结构化参数（region, instanceIds, status, zoneId 等），而非自然语言查询。[见证据 1-3]

**证据3（结构化输出）**：所有工具返回 `types.TextContent(type="text", text=f"Results: {total_results}")` 格式的结构化数据，没有生成式文本输出或特殊分隔符处理。[见证据 1-3]

**证据4（依赖审查）**：项目仅依赖 volcengine-python-sdk（火山引擎官方SDK）和 FastMCP 框架，没有任何 AI/ML 相关 SDK。[见证据 4]

### 最终判定

基于以上多维证据链，我们得出以下结论：

> 火山引擎 ECS MCP 的所有工具（包括实例管理、镜像查询、事件监控等）都采用**确定性API封装**模式，直接调用火山引擎 ECS 标准 OpenAPI。这些工具不涉及任何 AI/ML 服务调用，更不存在 Agent-as-Tools 架构。
>
> 该实现模式与 AWS MCP、Google Cloud MCP 类似，都采用确定性算法和标准API封装，与阿里云 MCP 的 Agent-as-Tools 模式存在本质区别。

---

## 二、工具清单与实现模式

| 工具名称 | 功能描述 | 实现模式判定 | 判定依据 |
|---------|---------|------------|---------|
| `describe_instances` | 查询实例列表 | 确定性API封装 | [证据 1] 直接调用 describe_instances API |
| `describe_images` | 查询镜像列表 | 确定性API封装 | [证据 1] 直接调用 describe_images API |
| `describe_instance_types` | 查询实例规格列表 | 确定性API封装 | [证据 1] 直接调用 describe_instance_types API |
| `describe_available_resource` | 查询可用资源 | 确定性API封装 | [证据 1] 直接调用 describe_available_resource API |
| `describe_system_events` | 查询系统事件 | 确定性API封装 | [证据 2] 直接调用 describe_system_events API |
| `describe_regions` | 查询区域列表 | 确定性API封装 | [证据 3] 直接调用 describe_regions API |
| `describe_zones` | 查询可用区列表 | 确定性API封装 | [证据 3] 直接调用 describe_zones API |
| `start_instances` | 启动实例 | 确定性API封装 | [证据 1] 直接调用 start_instances API |
| `renew_instance` | 续费实例 | 确定性API封装 | [证据 1] 直接调用 renew_instance API |

---

## 三、详细分析

### [证据 1] 实例管理工具的确定性API封装

**来源**：GitHub 源代码 - instance.py (L17-L408)

**代码位置**：`src/mcp_server_ecs/tools/instance.py`

**实现模式识别**：
- MCP工具层直接调用 `volc_client.describe_instances()` 等标准API
- 使用火山引擎官方 SDK（volcenginesdkecs）封装的标准ECS API
- 无任何AI服务调用

**API行为特征分析**：

✅ **结构化输入特征**：API接收结构化参数（region, instanceIds, status, zoneId 等），这些都是标准的云资源管理参数

✅ **确定性输出特征**：返回结果为 `types.TextContent(type="text", text=f"Results: {total_results}")`，这是典型的结构化数据输出，而非生成式文本

✅ **无分隔符处理**：代码中没有任何类似 `------answer------` 的分隔符处理逻辑

**关键代码片段**：

```python
@mcp.tool(
    name="describe_instances",
    description="Query instance list",
)
async def describe_instances(
    region: str = Field(
        default="cn-beijing",
        description="默认为cn-beijing. 可为：ap-southeast-1, cn-beijing2, cn-shanghai, cn-guangzhou 等",
    ),
    instanceIds: List[str] = Field(
        default=[],
        description="实例ID，最多支持100个",
    ),
    status: str = Field(
        default="",
        description="实例的状态，取值：CREATING：创建中，RUNNING：运行中，STOPPING：停止中，STOPPED：已停止，...",
    ),
    # ... 其他结构化参数
) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
    try:
        volc_client = get_volc_ecs_client(region)
        total_results = []
        next_token = None

        while True:
            response = volc_client.describe_instances(
                volcenginesdkecs.DescribeInstancesRequest(
                    eip_addresses=eipAddresses,
                    instance_charge_type=instanceChargeType,
                    instance_ids=instanceIds,
                    # ... 其他结构化参数
                )
            )

            if not response or not getattr(response, "instances", None):
                return handle_error("describe_instances")

            for instance in response.instances:
                filtered_instance = {
                    "Cpus": instance.cpus,
                    "InstanceId": instance.instance_id,
                    "Status": instance.status,
                    # ... 提取关键字段
                }
                total_results.append(filtered_instance)

            if len(total_results) >= needNum or not response.next_token:
                break

        return [types.TextContent(type="text", text=f"Results: {total_results}")]

    except Exception as e:
        return handle_error("describe_instances", e)
```

**判定**：基于上述行为特征，该API是标准的确定性API封装，而非AI服务。

---

### [证据 2] 系统事件工具的确定性API封装

**来源**：GitHub 源代码 - event.py (L17-L127)

**代码位置**：`src/mcp_server_ecs/tools/event.py`

**实现模式识别**：
- MCP工具层直接调用 `volc_client.describe_system_events()` 标准API
- 使用结构化的时间范围、事件类型、状态等参数
- 返回系统事件数据的JSON格式

**API行为特征分析**：

✅ **结构化输入特征**：API接收结构化参数（createdAtStart, createdAtEnd, eventIds, resourceIds, status, event_types），完全是标准的事件查询参数

✅ **确定性输出特征**：返回 `types.TextContent(type="text", text=f"Results: {total_results}")`，标准的事件数据格式

✅ **无智能分析**：仅提供事件数据检索功能，没有事件分析、根因诊断等智能功能

**关键代码片段**：

```python
@mcp.tool(
    name="describe_system_events",
    description="Query system events",
)
async def describe_system_events(
    region: str = Field(default="cn-beijing", ...),
    createdAtStart: str = Field(default="", ...),
    createdAtEnd: str = Field(default="", ...),
    eventIds: List[str] = Field(default=[], ...),
    status: List[str] = Field(default=[], description="""
        系统事件的状态，最多支持10个。
        UnknownStatus：未知状态
        Executing：执行中
        Succeeded：执行成功
        Failed：执行失败
        ...
    """),
    event_types: List[str] = Field(default=[], description="""
        系统事件的类型，最多支持100个。
        SystemFailure_Stop：因系统故障实例停止。
        SystemFailure_Reboot：因系统故障实例重启。
        ...
    """),
) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
    try:
        volc_client = get_volc_ecs_client(region)
        response = volc_client.describe_system_events(
            volcenginesdkecs.DescribeSystemEventsRequest(
                created_at_start=createdAtStart,
                created_at_end=createdAtEnd,
                event_ids=eventIds,
                status=status,
                types=event_types,
            )
        )

        for event in response.system_events:
            filtered_event = {
                "Id": event.id,
                "Status": event.status,
                "Type": event.type,
                # ...
            }
            total_results.append(filtered_event)

        return [types.TextContent(type="text", text=f"Results: {total_results}")]
```

**判定**：标准的确定性API封装，无AI服务特征。

---

### [证据 3] 区域和可用区工具的确定性API封装

**来源**：GitHub 源代码 - region.py (L17-L95)

**代码位置**：`src/mcp_server_ecs/tools/region.py`

**实现模式识别**：
- MCP工具层直接调用 `volc_client.describe_regions()` 和 `volc_client.describe_zones()` 标准API
- 使用结构化参数进行区域和可用区查询
- 返回区域/可用区数据的JSON格式

**API行为特征分析**：

✅ **结构化输入特征**：接收 region, regionIds, zoneIds 等结构化参数

✅ **确定性输出特征**：返回 `types.TextContent(type="text", text=f"Results: {total_results}")`

✅ **无智能推荐**：仅提供基础的区域和可用区列表，没有智能推荐或分析功能

**关键代码片段**：

```python
@mcp.tool(
    name="describe_regions",
    description="Query region list",
)
async def describe_regions(
    region: str = Field(default="cn-beijing", ...),
    regionIds: List[str] = Field(default=[], ...),
) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
    try:
        volc_client = get_volc_ecs_client(region)
        response = volc_client.describe_regions(
            volcenginesdkecs.DescribeRegionsRequest(
                region_ids=regionIds,
            )
        )

        for region in response.regions:
            total_results.append(region.region_id)

        return [types.TextContent(type="text", text=f"Results: {total_results}")]
```

**判定**：标准的确定性API封装，无AI服务特征。

---

### [证据 4] 依赖文件分析

**来源**：pyproject.toml

**关键发现**：

**已包含的依赖**：
```toml
dependencies = [
    "mcp>=1.9.4",
    "pydantic==2.10.6",
    "volcengine-python-sdk>=3.0.1",
    "concurrent-log-handler==0.9.25",
    "dynaconf==3.2.10",
    "jsonref>=1.1.0",
]
```

- `volcengine-python-sdk`: 火山引擎官方 Python SDK
- `mcp`: MCP 协议SDK
- `pydantic`: 数据验证库
- `dynaconf`: 配置管理库
- `concurrent-log-handler`: 日志处理库
- `jsonref`: JSON 引用处理

**未发现的AI/ML依赖**：
- ❌ 任何大语言模型相关SDK（如 openai, anthropic, volcengine-ml 等）
- ❌ 任何AI平台SDK（如 sagemaker, vertexai 等）
- ❌ `langchain` 或其他 LLM 框架
- ❌ 任何本地AI/ML模型库（transformers, tensorflow, pytorch等）

**API客户端分析**：

```python
# client.py
def get_volc_ecs_client(region: str = None) -> ECSApi:
    ecs_config = volcenginesdkcore.Configuration()
    ecs_config.ak = os.environ.get("VOLCENGINE_ACCESS_KEY") or auth_config["ak"]
    ecs_config.sk = os.environ.get("VOLCENGINE_SECRET_KEY") or auth_config["sk"]
    ecs_config.region = os.environ.get("VOLCENGINE_REGION") or auth_config["region"]
    ecs_config.host = os.environ.get("VOLCENGINE_ENDPOINT") or auth_config["endpoint"]
    volcenginesdkcore.Configuration.set_default(ecs_config)
    return ECSApi()
```

**判定**：
- 依赖文件中没有任何AI/ML相关SDK，确认不存在本地或远程AI服务调用
- API客户端仅初始化标准的 ECS API 客户端
- 完全采用确定性API封装模式

---

### [证据 5] 关键词搜索结果

**搜索关键词**：`\b(ai|llm|agent|ml|model|gemini|openai|anthropic|智能|分析)\b`（不区分大小写）

**搜索范围**：`src/` 目录下所有Python文件

**发现结果**：
- ❌ 在工具实现文件（instance.py, event.py, region.py）中**完全没有**AI相关关键词
- ❌ 在 main.py 和 client.py 中也**没有**AI相关关键词
- ❌ 整个项目的核心实现中**不包含**任何AI服务调用

**判定**：项目完全不涉及任何AI服务，工具实现本身不涉及任何AI技术。

---

## 四、调研方法说明

本报告采用**代码静态分析**方法，具体分析流程按逻辑顺序包括：

### 第一步：依赖文件审查（双重目的）

**主要目的**：寻找调用远程AI服务的SDK
- 审查结果：检查 pyproject.toml 依赖列表
- 发现：仅包含 volcengine-python-sdk 和 mcp，无AI相关SDK
- 结论：排除了远程AI服务调用的可能性

**次要目的**：排除本地运行模型的可能性
- 审查结果：确认不包含 transformers, tensorflow, torch 等本地AI库
- 技术现实：AI模型（LLM）本地运行几乎不可能（需要GPU，体积大）
- 结论：排除了本地AI模型的可能性

### 第二步：API调用分析（核心侦查）

**函数实现代码审查**：
- 检查每个工具函数的实现逻辑
- 识别API调用模式（是标准API还是AI服务API）

**API参数设计分析**：
- 检查API参数类型（结构化参数 vs 自然语言参数）
- 分析参数命名（instanceIds, status, region vs query, prompt）

**返回结果处理分析**：
- 检查输出格式（标准的 TextContent vs 分隔符处理）
- 分析输出特征（结构化数据 vs 生成式文本）

### 第三步：关键词与行为模式分析（辅助推断）

**全局关键词搜索**：
- 搜索 AI/ML 相关关键词
- 确认搜索结果不在任何工具实现中

**行为模式识别**：
- 识别是否接收自然语言输入
- 识别是否返回生成式文本
- 识别是否支持RAG模式
- 结论：完全不具备AI服务特征

### 技术现实说明

AI模型（LLM）的调用几乎100%是远程调用，ML模型（传统ML）的调用通常也是远程调用。因此调研重点在于识别远程调用，而非查找本地AI库。

---

## 五、与其他云服务商MCP的对比

### 5.1 实现模式对比

| 云服务商 | MCP服务器 | Agent-as-Tools | 确定性API封装 | 备注 |
|---------|---------|---------------|--------------|------|
| 阿里云 | 可观测性MCP | ✅ 是 | 部分 | L4层工具（trace分析、日志分析等）使用Agent-as-Tools |
| Google Cloud | 可观测性MCP | ❌ 否 | ✅ 是 | 所有工具都是确定性API封装 |
| AWS | CloudWatch MCP | ❌ 否 | ✅ 是 | 所有工具都是确定性API封装 |
| **火山引擎** | **ECS MCP** | **❌ 否** | **✅ 是** | **所有工具都是确定性API封装** |

### 5.2 工具能力范围对比

**火山引擎 ECS MCP**：
- 聚焦于 ECS（弹性计算服务）资源管理
- 提供实例、镜像、区域、事件等基础查询和操作
- 不涉及可观测性（日志、监控、追踪）领域
- 工具数量：9个

**阿里云可观测性MCP**：
- 聚焦于可观测性（日志、监控、追踪）
- 提供智能分析工具（trace分析、日志分析等）
- 使用Agent-as-Tools进行根因分析
- 工具数量：30+个

**对比结论**：
> 火山引擎 ECS MCP 与阿里云可观测性MCP属于不同的业务领域：
> - 火山引擎专注于**云资源管理**（ECS实例管理）
> - 阿里云专注于**可观测性**（日志、监控、追踪分析）
>
> 由于业务领域的差异，火山引擎 ECS MCP 不需要智能分析能力，因此采用确定性API封装是合理的技术选择。

---

## 六、附录：代码证据位置

### 6.1 实例管理工具
- `describe_instances`: instance.py:17-122
- `describe_images`: instance.py:125-211
- `describe_instance_types`: instance.py:214-277
- `describe_available_resource`: instance.py:280-333
- `start_instances`: instance.py:336-369
- `renew_instance`: instance.py:372-407

### 6.2 系统事件工具
- `describe_system_events`: event.py:17-126

### 6.3 区域和可用区工具
- `describe_regions`: region.py:17-58
- `describe_zones`: region.py:61-94

### 6.4 通用代码
- API客户端工厂: client.py:13-51
- 依赖文件: pyproject.toml:1-25
- MCP服务器初始化: tools/__init__.py:9-14

---

## 七、结论总结

通过对火山引擎 ECS MCP Server 的全面代码审查，我们得出以下最终结论：

1. **无 Agent-as-Tools 架构**：所有9个工具都是对火山引擎 ECS 标准 OpenAPI 的直接封装
2. **确定性算法实现**：工具使用结构化参数，返回结构化数据，无任何AI特征
3. **业务领域差异**：作为云资源管理工具，不需要智能分析能力，与阿里云可观测性MCP的需求场景不同
4. **技术选型合理**：对于ECS资源管理场景，确定性API封装是最合适的实现方式

**与其他云服务商MCP的相似性**：
- 与 AWS CloudWatch MCP、Google Cloud 可观测性MCP 类似，都采用确定性API封装
- 与阿里云可观测性MCP 的 Agent-as-Tools 模式形成对比

**技术架构评估**：
- ✅ 代码结构清晰，模块划分合理
- ✅ 使用官方SDK，稳定性有保障
- ✅ 参数设计详细，支持灵活查询
- ✅ 错误处理完善，用户体验良好
