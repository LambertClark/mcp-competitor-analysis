# 阿里云可观测性 MCP "Agent as Tools" 模式调研报告

## 一、结论

### 远程API调用识别

经过对阿里云可观测性 MCP Server 公开源代码的全面审查，我们确认：**该项目中有 8 个工具使用了 Agent-as-Tools 模式**。这些工具通过阿里云 SLS 的 `CallAiTools` API 调用远程 AI 服务，实现了从自然语言转查询语句、智能诊断、性能分析等高级功能。

### 实现模式分析

通过分析工具实现代码、依赖文件和API调用模式，我们识别出以下关键特征：

**证据1（AI服务API调用）**：8个工具直接调用阿里云 SLS 的 `CallAiTools` API，通过 `CallAiToolsRequest` 和 `CallAiToolsResponse` 实现远程 AI 服务调用。[见证据 1-8]

**证据2（自然语言参数）**：这些工具接收自然语言查询参数（`sys.query`），而非纯结构化参数。[见证据 1-8]

**证据3（生成式输出处理）**：所有工具返回的数据包含特殊分隔符 `------answer------\n`，需要进行分隔符处理以提取 AI 生成的答案。[见证据 1-8]

**证据4（依赖审查）**：项目依赖 `alibabacloud_sls20201230` SDK，该 SDK 包含 `CallAiTools` API 用于调用远程 AI 服务。[见证据 9]

### 最终判定

基于以上多维证据链，我们得出以下结论：

> 阿里云可观测性 MCP 有 **8个工具采用 Agent-as-Tools 模式**，通过阿里云 SLS 的 `CallAiTools` API 调用远程 AI 服务。这些工具涵盖了：
> - **自然语言转查询**（Text-to-SQL、Text-to-PromQL）
> - **智能诊断**（SQL诊断、Trace质量分析）
> - **根因分析**（慢调用分析、错误分析）
> - **性能分析**（火焰图分析、差分火焰图分析）
>
> 该实现模式与 AWS MCP 和 Google Cloud MCP 存在本质区别，阿里云 MCP 是目前调研的云厂商中**唯一大规模采用 Agent-as-Tools 模式**的 MCP 实现。

---

## 二、工具清单与实现模式

| 工具名称 | 功能描述 | 实现模式判定 | 判定依据 |
|---------|---------|------------|---------|
| `arms_search_apps` | 搜索ARMS应用 | 确定性API封装 | 直接调用 ARMS API `SearchTraceAppByPage` |
| `arms_generate_trace_query` | 生成调用链查询语句 | **Agent-as-Tools**（间接） | 调用 `text_to_sql` 工具，该工具调用 AI 服务 |
| `arms_profile_flame_analysis` | 火焰图性能热点分析 | **Agent-as-Tools** | [证据 1] 调用 `profile_flame_analysis` AI 工具 |
| `arms_diff_profile_flame_analysis` | 差分火焰图性能对比 | **Agent-as-Tools** | [证据 2] 调用 `diff_profile_flame_analysis` AI 工具 |
| `arms_get_application_info` | 获取应用信息 | 确定性API封装 | 直接调用 ARMS API `GetTraceApp` |
| `arms_trace_quality_analysis` | Trace质量检测 | **Agent-as-Tools** | [证据 3] 调用 `trace_struct_analysis` AI 工具 |
| `arms_slow_trace_analysis` | 慢调用根因分析 | **Agent-as-Tools** | [证据 4] 调用 `trace_slow_analysis` AI 工具 |
| `arms_error_trace_analysis` | 错误根因分析 | **Agent-as-Tools** | [证据 5] 调用 `trace_error_analysis` AI 工具 |
| `sls_list_projects` | 列出SLS项目 | 确定性API封装 | 直接调用 SLS API `ListProject` |
| `sls_list_logstores` | 列出日志库 | 确定性API封装 | 直接调用 SLS API `ListLogStores` |
| `sls_describe_logstore` | 获取日志库结构 | 确定性API封装 | 直接调用 SLS API `GetIndex` |
| `sls_execute_sql_query` | 执行SLS日志查询 | 确定性API封装 | 直接调用 SLS API `GetLogs` |
| `sls_translate_text_to_sql_query` | 自然语言转SQL | **Agent-as-Tools** | [证据 6] 调用 `text_to_sql` AI 工具 |
| `sls_diagnose_query` | 诊断SQL查询语句 | **Agent-as-Tools** | [证据 7] 调用 `diagnosis_sql` AI 工具 |
| `cms_translate_text_to_promql` | 自然语言转PromQL | **Agent-as-Tools** | [证据 8] 调用 `text_to_promql` AI 工具 |
| `cms_execute_promql_query` | 执行PromQL查询 | 确定性API封装 | 直接调用 SLS API `GetLogs` |

**统计摘要**：
- **总工具数**：16个
- **Agent-as-Tools工具**：8个（50%）
- **确定性API封装工具**：8个（50%）

---

## 三、详细分析

### [证据 1] ARMS 火焰图性能热点分析 - Agent-as-Tools

**来源**：GitHub 源代码 - arms_toolkit.py (L210-L322)

**代码位置**：`src/mcp_server_aliyun_observability/toolkit/arms_toolkit.py:210-322`

**实现模式识别**：
- MCP工具层调用阿里云 SLS 的 `CallAiTools` API
- 使用 `CallAiToolsRequest` 和 `CallAiToolsResponse` 进行 AI 服务调用
- 指定 `tool_name="profile_flame_analysis"` 调用远程 AI 工具

**Agent-as-Tools 行为特征分析**：

✅ **自然语言输入特征**：API参数包含 `sys.query`，内容为自然语言描述："帮我分析下应用 {service_name} 的火焰图性能热点问题"

✅ **生成式输出特征**：返回结果包含特殊分隔符 `------answer------\n`，需要分隔处理以提取 AI 生成的分析报告

✅ **AI服务调用**：通过 `sls_client.call_ai_tools_with_options()` 调用远程 AI 服务，而非本地确定性算法

**关键代码片段**：

```python
sls_client: Client = ctx.request_context.lifespan_context[
    "sls_client"
].with_region("cn-shanghai")
ai_request: CallAiToolsRequest = CallAiToolsRequest(
    tool_name="profile_flame_analysis", region_id=regionId
)

params: dict[str, Any] = {
    "serviceName": service_name,
    "startMs": startMs,
    "endMs": endMs,
    "profileType": profileType,
    "ip": ip,
    "language": language,
    "thread": thread,
    "threadGroup": threadGroup,
    "sys.query": f"帮我分析下应用 {service_name} 的火焰图性能热点问题",
}

ai_request.params = params
runtime: util_models.RuntimeOptions = util_models.RuntimeOptions(
    read_timeout=60000, connect_timeout=60000
)

tool_response: CallAiToolsResponse = (
    sls_client.call_ai_tools_with_options(
        request=ai_request, headers={}, runtime=runtime
    )
)
data = tool_response.body

if "------answer------\n" in data:
    data = data.split("------answer------\n")[1]

return {"data": data}
```

**判定**：基于上述行为特征，该工具是典型的 Agent-as-Tools 实现，调用远程 AI 服务进行火焰图性能分析。

---

### [证据 2] ARMS 差分火焰图性能对比 - Agent-as-Tools

**来源**：GitHub 源代码 - arms_toolkit.py (L324-L442)

**代码位置**：`src/mcp_server_aliyun_observability/toolkit/arms_toolkit.py:324-442`

**实现模式识别**：
- MCP工具层调用阿里云 SLS 的 `CallAiTools` API
- 指定 `tool_name="diff_profile_flame_analysis"` 调用远程 AI 工具
- 用于对比两个时间段的性能变化

**Agent-as-Tools 行为特征分析**：

✅ **自然语言输入特征**：API参数包含 `sys.query`，内容为："帮我分析应用 {service_name} 在两个时间段前后的性能变化情况"

✅ **生成式输出特征**：返回结果包含 `------answer------\n` 分隔符

✅ **AI服务调用**：通过 `call_ai_tools_with_options` 调用远程 AI 服务

**关键代码片段**：

```python
ai_request: CallAiToolsRequest = CallAiToolsRequest(
    tool_name="diff_profile_flame_analysis", region_id=regionId
)

params: dict[str, Any] = {
    "serviceName": service_name,
    "startMs": currentStartMs,
    "endMs": currentEndMs,
    "baseStartMs": referenceStartMs,
    "baseEndMs": referenceEndMs,
    "profileType": profileType,
    "ip": ip,
    "language": language,
    "thread": thread,
    "threadGroup": threadGroup,
    "sys.query": f"帮我分析应用 {service_name} 在两个时间段前后的性能变化情况",
}

ai_request.params = params
tool_response: CallAiToolsResponse = (
    sls_client.call_ai_tools_with_options(
        request=ai_request, headers={}, runtime=runtime
    )
)
data = tool_response.body

if "------answer------\n" in data:
    data = data.split("------answer------\n")[1]

return {"data": data}
```

**判定**：典型的 Agent-as-Tools 实现，调用远程 AI 服务进行差分火焰图性能对比分析。

---

### [证据 3] ARMS Trace 质量检测 - Agent-as-Tools

**来源**：GitHub 源代码 - arms_toolkit.py (L481-L551)

**代码位置**：`src/mcp_server_aliyun_observability/toolkit/arms_toolkit.py:481-551`

**实现模式识别**：
- MCP工具层调用阿里云 SLS 的 `CallAiTools` API
- 指定 `tool_name="trace_struct_analysis"` 调用远程 AI 工具
- 用于识别 Trace 的完整性问题（断链）和性能问题（错慢调用）

**Agent-as-Tools 行为特征分析**：

✅ **自然语言输入特征**：API参数包含 `sys.query: "分析这个trace"`

✅ **生成式输出特征**：返回结果包含 `------answer------\n` 分隔符

✅ **AI服务调用**：通过 `call_ai_tools_with_options` 调用远程 AI 服务

**关键代码片段**：

```python
ai_request: CallAiToolsRequest = CallAiToolsRequest(
    tool_name="trace_struct_analysis", region_id=regionId
)

params: dict[str, Any] = {
    "startMs": startMs,
    "endMs": endMs,
    "traceId": traceId,
    "sys.query": f"分析这个trace",
}

ai_request.params = params
tool_response: CallAiToolsResponse = (
    sls_client.call_ai_tools_with_options(
        request=ai_request, headers={}, runtime=runtime
    )
)
data = tool_response.body

if "------answer------\n" in data:
    data = data.split("------answer------\n")[1]

return {"data": data}
```

**判定**：典型的 Agent-as-Tools 实现，调用远程 AI 服务进行 Trace 质量分析。

---

### [证据 4] ARMS 慢调用根因分析 - Agent-as-Tools

**来源**：GitHub 源代码 - arms_toolkit.py (L554-L625)

**代码位置**：`src/mcp_server_aliyun_observability/toolkit/arms_toolkit.py:554-625`

**实现模式识别**：
- MCP工具层调用阿里云 SLS 的 `CallAiTools` API
- 指定 `tool_name="trace_slow_analysis"` 调用远程 AI 工具
- 用于针对 Trace 中的慢调用进行诊断分析，输出包含概述、根因、影响范围及解决方案的诊断报告

**Agent-as-Tools 行为特征分析**：

✅ **自然语言输入特征**：API参数包含 `sys.query: "深入分析慢调用根因"`

✅ **生成式输出特征**：返回结果包含 `------answer------\n` 分隔符

✅ **AI服务调用**：通过 `call_ai_tools_with_options` 调用远程 AI 服务

**关键代码片段**：

```python
ai_request: CallAiToolsRequest = CallAiToolsRequest(
    tool_name="trace_slow_analysis", region_id=regionId
)

params: dict[str, Any] = {
    "startMs": startMs,
    "endMs": endMs,
    "traceId": traceId,
    "sys.query": f"深入分析慢调用根因",
}

ai_request.params = params
tool_response: CallAiToolsResponse = (
    sls_client.call_ai_tools_with_options(
        request=ai_request, headers={}, runtime=runtime
    )
)
data = tool_response.body

if "------answer------\n" in data:
    data = data.split("------answer------\n")[1]

return {"data": data}
```

**判定**：典型的 Agent-as-Tools 实现，调用远程 AI 服务进行慢调用根因分析。

**重要对比**：与 Google Cloud MCP 的 `get_trace` 工具相比，Google Cloud MCP 仅提供基础的 trace 数据检索，而阿里云 MCP 提供智能的根因分析能力。

---

### [证据 5] ARMS 错误根因分析 - Agent-as-Tools

**来源**：GitHub 源代码 - arms_toolkit.py (L628-L701)

**代码位置**：`src/mcp_server_aliyun_observability/toolkit/arms_toolkit.py:628-701`

**实现模式识别**：
- MCP工具层调用阿里云 SLS 的 `CallAiTools` API
- 指定 `tool_name="trace_error_analysis"` 调用远程 AI 工具
- 用于针对 Trace 中的错误调用进行深入诊断分析，输出错误诊断报告

**Agent-as-Tools 行为特征分析**：

✅ **自然语言输入特征**：API参数包含 `sys.query: "深入分析错误根因"`

✅ **生成式输出特征**：返回结果包含 `------answer------\n` 分隔符

✅ **AI服务调用**：通过 `call_ai_tools_with_options` 调用远程 AI 服务

**关键代码片段**：

```python
ai_request: CallAiToolsRequest = CallAiToolsRequest(
    tool_name="trace_error_analysis", region_id=regionId
)

params: dict[str, Any] = {
    "startMs": startMs,
    "endMs": endMs,
    "traceId": traceId,
    "sys.query": f"深入分析错误根因",
}

ai_request.params = params
tool_response: CallAiToolsResponse = (
    sls_client.call_ai_tools_with_options(
        request=ai_request, headers={}, runtime=runtime
    )
)
data = tool_response.body

if "------answer------\n" in data:
    data = data.split("------answer------\n")[1]

return {"data": data}
```

**判定**：典型的 Agent-as-Tools 实现，调用远程 AI 服务进行错误根因分析。

---

### [证据 6] SLS 自然语言转SQL - Agent-as-Tools

**来源**：GitHub 源代码 - utils.py (L308-L342)

**代码位置**：`src/mcp_server_aliyun_observability/utils.py:308-342`

**实现模式识别**：
- 通过 `text_to_sql` 函数调用阿里云 SLS 的 `CallAiTools` API
- 指定 `tool_name="text_to_sql"` 调用远程 AI 工具
- 用于将自然语言描述转换为 SLS 查询语句

**Agent-as-Tools 行为特征分析**：

✅ **自然语言输入特征**：API参数包含 `sys.query`，内容为用户输入的自然语言查询

✅ **生成式输出特征**：返回结果包含 `------answer------\n` 分隔符

✅ **AI服务调用**：通过 `call_ai_tools_with_options` 调用远程 AI 服务

✅ **外部知识库集成**：支持 `external_knowledge_uri` 和 `external_knowledge_key` 参数，实现 RAG（检索增强生成）模式

**关键代码片段**：

```python
def text_to_sql(
    ctx: Context, text: str, project: str, log_store: str, region_id: str
) -> dict[str, Any]:
    try:
        sls_client_wrapper = ctx.request_context.lifespan_context["sls_client"]
        sls_client: Client = sls_client_wrapper.with_region("cn-shanghai")
        knowledge_config = sls_client_wrapper.get_knowledge_config(project, log_store)
        request: CallAiToolsRequest = CallAiToolsRequest()
        request.tool_name = "text_to_sql"
        request.region_id = region_id
        params: dict[str, Any] = {
            "project": project,
            "logstore": log_store,
            "sys.query": append_current_time(text),
            "external_knowledge_uri": knowledge_config["uri"] if knowledge_config else "",
            "external_knowledge_key": knowledge_config["key"] if knowledge_config else "",
        }
        request.params = params
        runtime: util_models.RuntimeOptions = util_models.RuntimeOptions()
        runtime.read_timeout = 60000
        runtime.connect_timeout = 60000
        tool_response: CallAiToolsResponse = sls_client.call_ai_tools_with_options(
            request=request, headers={}, runtime=runtime
        )
        data = tool_response.body
        if "------answer------\n" in data:
            data = data.split("------answer------\n")[1]
        return {
            "data": data,
            "requestId": tool_response.headers.get("x-log-requestid", ""),
        }
    except Exception as e:
        logger.error(f"调用SLS AI工具失败: {str(e)}")
        raise
```

**判定**：典型的 Agent-as-Tools 实现，调用远程 AI 服务将自然语言转换为 SQL 查询语句。该工具支持外部知识库集成，实现了 RAG 模式。

---

### [证据 7] SLS 诊断SQL查询语句 - Agent-as-Tools

**来源**：GitHub 源代码 - sls_toolkit.py (L469-L541)

**代码位置**：`src/mcp_server_aliyun_observability/toolkit/sls_toolkit.py:469-541`

**实现模式识别**：
- MCP工具层调用阿里云 SLS 的 `CallAiTools` API
- 指定 `tool_name="diagnosis_sql"` 调用远程 AI 工具
- 用于根据错误信息诊断 SQL 查询语句

**Agent-as-Tools 行为特征分析**：

✅ **自然语言输入特征**：API参数包含 `sys.query`，内容为："帮我诊断下 {query} 的日志查询语句,错误信息为 {errorMessage}"

✅ **生成式输出特征**：返回结果包含 `------answer------\n` 分隔符

✅ **AI服务调用**：通过 `call_ai_tools_with_options` 调用远程 AI 服务

✅ **外部知识库集成**：支持 `external_knowledge_uri` 和 `external_knowledge_key` 参数，实现 RAG 模式

**关键代码片段**：

```python
sls_client: Client = sls_client_wrapper.with_region("cn-shanghai")
knowledge_config = sls_client_wrapper.get_knowledge_config(
    project, logStore
)
request: CallAiToolsRequest = CallAiToolsRequest()
request.tool_name = "diagnosis_sql"
request.region_id = regionId
params: dict[str, Any] = {
    "project": project,
    "logstore": logStore,
    "sys.query": append_current_time(
        f"帮我诊断下 {query} 的日志查询语句,错误信息为 {errorMessage}"
    ),
    "external_knowledge_uri": knowledge_config["uri"]
    if knowledge_config
    else "",
    "external_knowledge_key": knowledge_config["key"]
    if knowledge_config
    else "",
}
request.params = params
tool_response: CallAiToolsResponse = (
    sls_client.call_ai_tools_with_options(
        request=request, headers={}, runtime=runtime
    )
)
data = tool_response.body
if "------answer------\n" in data:
    data = data.split("------answer------\n")[1]
return data
```

**判定**：典型的 Agent-as-Tools 实现，调用远程 AI 服务进行 SQL 查询诊断。

---

### [证据 8] CMS 自然语言转PromQL - Agent-as-Tools

**来源**：GitHub 源代码 - cms_toolkit.py (L48-L127)

**代码位置**：`src/mcp_server_aliyun_observability/toolkit/cms_toolkit.py:48-127`

**实现模式识别**：
- MCP工具层调用阿里云 SLS 的 `CallAiTools` API
- 指定 `tool_name="text_to_promql"` 调用远程 AI 工具
- 用于将自然语言描述转换为 PromQL 查询语句

**Agent-as-Tools 行为特征分析**：

✅ **自然语言输入特征**：API参数包含 `sys.query`，内容为用户输入的自然语言查询

✅ **生成式输出特征**：返回结果包含 `------answer------\n` 分隔符

✅ **AI服务调用**：通过 `call_ai_tools_with_options` 调用远程 AI 服务

**关键代码片段**：

```python
sls_client: SLSClient = ctx.request_context.lifespan_context[
    "sls_client"
].with_region("cn-shanghai")
request: CallAiToolsRequest = CallAiToolsRequest()
request.tool_name = "text_to_promql"
request.region_id = regionId
params: dict[str, Any] = {
    "project": project,
    "metricstore": metricStore,
    "sys.query": text,
}
request.params = params
tool_response: CallAiToolsResponse = (
    sls_client.call_ai_tools_with_options(
        request=request, headers={}, runtime=runtime
    )
)
data = tool_response.body
if "------answer------\n" in data:
    data = data.split("------answer------\n")[1]
return data
```

**判定**：典型的 Agent-as-Tools 实现，调用远程 AI 服务将自然语言转换为 PromQL 查询语句。

---

### [证据 9] 依赖文件分析

**来源**：pyproject.toml

**关键发现**：

**已包含的依赖**：
- `alibabacloud_sls20201230==5.7.0` - 阿里云日志服务 SDK，包含 `CallAiTools` API
- `alibabacloud_arms20190808==8.0.0` - 阿里云应用实时监控服务 SDK
- `alibabacloud_credentials>=1.0.1` - 阿里云凭证管理
- `mcp>=1.3.0` - MCP 协议 SDK
- `pydantic>=2.10.0` - 参数验证库
- `tenacity>=8.0.0` - 重试机制库

**AI服务调用依赖**：
- ✅ `alibabacloud_sls20201230` - 该 SDK 包含 `CallAiToolsRequest` 和 `CallAiToolsResponse`，用于调用阿里云 SLS 的远程 AI 服务

**判定**：
- 依赖文件确认项目使用阿里云 SLS SDK 的 AI 工具调用能力
- `CallAiTools` API 是阿里云提供的远程 AI 服务接口
- 完全采用远程 AI 服务调用模式，而非本地模型

---

### [证据 10] CallAiTools API 调用模式分析

**API调用统一模式**：

所有 Agent-as-Tools 工具都遵循以下统一模式：

```python
# 1. 创建 AI 工具请求
ai_request: CallAiToolsRequest = CallAiToolsRequest(
    tool_name="<远程AI工具名称>",
    region_id=regionId
)

# 2. 设置参数（包含自然语言查询）
params: dict[str, Any] = {
    # 结构化参数
    "project": project,
    "logstore": logStore,
    # 自然语言参数
    "sys.query": "用户的自然语言查询",
    # 可选：外部知识库（RAG）
    "external_knowledge_uri": knowledge_uri,
    "external_knowledge_key": knowledge_key,
}
ai_request.params = params

# 3. 调用远程 AI 服务
tool_response: CallAiToolsResponse = sls_client.call_ai_tools_with_options(
    request=ai_request,
    headers={},
    runtime=runtime
)

# 4. 处理生成式输出（分隔符处理）
data = tool_response.body
if "------answer------\n" in data:
    data = data.split("------answer------\n")[1]
```

**关键特征识别**：

1. **统一入口**：所有 AI 工具调用都通过 `sls_client.call_ai_tools_with_options()` 进行
2. **工具名称**：通过 `tool_name` 参数指定远程 AI 工具
3. **自然语言查询**：通过 `sys.query` 参数传递用户意图
4. **分隔符处理**：返回结果包含 `------answer------\n` 分隔符，表明是 AI 生成的文本
5. **超时配置**：所有 AI 调用都设置 60 秒超时（`read_timeout=60000`）

**判定**：这是阿里云 SLS 提供的统一 AI 工具调用框架，类似于 Function Calling 或 Tool Use 机制。

---

## 四、调研方法说明

本报告采用**代码静态分析**方法，具体分析流程按逻辑顺序包括：

### 第一步：依赖文件审查（识别AI服务调用能力）

**主要目的**：寻找调用远程AI服务的SDK
- 审查结果：检查 pyproject.toml 依赖列表
- 发现：包含 `alibabacloud_sls20201230==5.7.0`，该 SDK 提供 `CallAiTools` API
- 结论：项目具备远程 AI 服务调用能力

### 第二步：API调用分析（核心侦查）

**函数实现代码审查**：
- 检查每个工具函数的实现逻辑
- 识别 API 调用模式（是标准 API 还是 AI 服务 API）

**关键标志识别**：
- 搜索 `CallAiToolsRequest` 和 `CallAiToolsResponse` 的使用
- 识别 `tool_name` 参数（远程 AI 工具名称）
- 识别 `sys.query` 参数（自然语言查询）

**返回结果处理分析**：
- 检查输出格式是否包含 `------answer------\n` 分隔符
- 分析输出特征（结构化数据 vs 生成式文本）

### 第三步：行为模式识别（验证判断）

**AI服务特征确认**：
- 识别是否接收自然语言输入（`sys.query`）
- 识别是否返回生成式文本（分隔符处理）
- 识别是否支持 RAG 模式（外部知识库）

**统一模式识别**：
- 所有 Agent-as-Tools 工具遵循统一的调用模式
- 通过 `sls_client.call_ai_tools_with_options()` 调用远程 AI 服务
- 结论：完全具备 AI 服务特征

### 技术现实说明

阿里云 SLS 的 `CallAiTools` API 是一个统一的 AI 工具调用框架，通过 `tool_name` 参数路由到不同的后端 AI 服务。这种设计模式类似于：
- OpenAI 的 Function Calling
- Anthropic 的 Tool Use
- LangChain 的 Agent Tools

关键区别在于，阿里云将 AI 能力封装为远程服务，通过统一的 API 网关提供给 MCP 服务器调用。

---

## 五、附录：代码证据位置

### 5.1 Agent-as-Tools 工具（ARMS）
- `arms_profile_flame_analysis`: arms_toolkit.py:210-322
- `arms_diff_profile_flame_analysis`: arms_toolkit.py:324-442
- `arms_trace_quality_analysis`: arms_toolkit.py:481-551
- `arms_slow_trace_analysis`: arms_toolkit.py:554-625
- `arms_error_trace_analysis`: arms_toolkit.py:628-701

### 5.2 Agent-as-Tools 工具（SLS）
- `sls_translate_text_to_sql_query`: sls_toolkit.py:411-466（调用 utils.py:308-342）
- `sls_diagnose_query`: sls_toolkit.py:469-541

### 5.3 Agent-as-Tools 工具（CMS）
- `cms_translate_text_to_promql`: cms_toolkit.py:48-127

### 5.4 确定性API封装工具
- `arms_search_apps`: arms_toolkit.py:34-117
- `arms_get_application_info`: arms_toolkit.py:445-478
- `sls_list_projects`: sls_toolkit.py:77-137
- `sls_list_logstores`: sls_toolkit.py:140-232
- `sls_describe_logstore`: sls_toolkit.py:235-305
- `sls_execute_sql_query`: sls_toolkit.py:308-401
- `cms_execute_promql_query`: cms_toolkit.py:130-232

### 5.5 通用代码
- AI工具调用核心函数: utils.py:308-342
- 客户端封装: utils.py:106-189
- 依赖文件: pyproject.toml:1-60

---

## 六、与其他云厂商的对比

| 云厂商 | Agent-as-Tools工具数 | 总工具数 | 占比 | 主要AI能力 |
|--------|---------------------|---------|------|-----------|
| **阿里云** | **8** | **16** | **50%** | Text-to-SQL、根因分析、性能分析、智能诊断 |
| **AWS** | 0 | ~15 | 0% | 无 |
| **Google Cloud** | 0 | 13 | 0% | 无 |
| **Azure** | 待调研 | 待调研 | 待调研 | 待调研 |
| **Dynatrace** | 待调研 | 待调研 | 待调研 | 待调研 |

**核心差异**：
- 阿里云是目前调研的云厂商中**唯一大规模采用 Agent-as-Tools 模式**的 MCP 实现
- AWS 和 Google Cloud 完全采用确定性 API 封装，不涉及任何 AI 服务
- 阿里云的 AI 工具覆盖了查询生成、根因分析、性能诊断等多个场景

**技术架构优势**：
- 阿里云提供统一的 `CallAiTools` API 框架，易于扩展新的 AI 工具
- 支持外部知识库集成（RAG），增强 AI 生成质量
- 自然语言接口降低用户使用门槛

**潜在挑战**：
- AI 服务调用延迟较高（60秒超时）
- 生成式输出的确定性和可靠性需要验证
- 对网络连接和服务可用性有较高要求

---

## 七、总结

阿里云可观测性 MCP 是一个**混合架构**的实现：
- **50% 的工具**采用 Agent-as-Tools 模式，提供智能分析能力
- **50% 的工具**采用确定性 API 封装，提供基础数据查询能力

这种混合架构在保留确定性操作的同时，通过 AI 服务增强了高级分析能力，代表了可观测性工具智能化的一个重要方向。

**关键创新点**：
1. 统一的 AI 工具调用框架（`CallAiTools` API）
2. 自然语言查询接口（Text-to-SQL、Text-to-PromQL）
3. 智能根因分析（慢调用、错误、性能）
4. 外部知识库集成（RAG）

**与竞品的本质区别**：
- AWS/Google Cloud：纯 API 封装，依赖确定性算法
- 阿里云：API 封装 + AI 服务，结合确定性与智能化

这种架构选择体现了阿里云在可观测性领域的技术理念：**通过 AI 降低使用门槛，提升分析效率**。
