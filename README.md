# MCP 竞争对手分析 - 版本信息汇总

本文档汇总了仓库中各厂商MCP（Model Context Protocol）服务器的版本信息。

## 详细信息

### Alibaba (阿里云)
- **项目**: alibabacloud-observability-mcp-server
- **版本**: 0.3.2
- **语言**: Python 3.10+
- **配置文件**: [`pyproject.toml`](Alibaba/Code/alibabacloud-observability-mcp-server/pyproject.toml)
- **主要依赖**:
  - mcp >= 1.3.0
  - pydantic >= 2.10.0
  - alibabacloud_arms20190808 == 8.0.0
  - alibabacloud_sls20201230 == 5.7.0

### AWS (亚马逊云)
- **项目**: cloudwatch-mcp-server
- **版本**: 0.0.11
- **语言**: Python 3.10+
- **配置文件**: [`pyproject.toml`](AWS/Code/cloudwatch-mcp-server/pyproject.toml)
- **主要依赖**:
  - mcp[cli] >= 1.11.0
  - boto3 >= 1.38.22
  - pydantic >= 2.10.6

### Azure (微软云)
- **项目**: azure-mcp
- **版本**: 0.5.8
- **语言**: C#/.NET 9.0
- **配置文件**: [`Directory.Build.props`](Azure/azure-mcp/Directory.Build.props)
- **SDK版本**: 10.0.100-preview.7.25380.108
- **主要特性**: 支持AOT编译，多服务集成

### Dynatrace
- **项目**: dynatrace-mcp-server
- **版本**: 0.12.0
- **语言**: TypeScript/Node.js
- **配置文件**: [`package.json`](Dynatrace/Code/dynatrace-mcp/package.json)
- **主要依赖**:
  - @modelcontextprotocol/sdk ^1.8.0
  - @dynatrace-sdk/client-query ^1.18.1
  - @dynatrace-sdk/client-davis-copilot ^1.0.0

### Google (谷歌云)
- **项目**: observability-mcp
- **版本**: 0.1.2
- **语言**: TypeScript/Node.js
- **配置文件**: [`package.json`](Google/Code/observability-mcp/package.json)
- **主要依赖**:
  - @modelcontextprotocol/sdk ^1.17.1
  - googleapis ^155.0.0
  - google-auth-library ^10.1.0

### Volcengine (火山引擎)
- **项目**: mcp-server-ecs
- **版本**: 0.1.0
- **语言**: Python 3.12+
- **配置文件**: [`pyproject.toml`](Volcengine/Code/mcp_server_ecs/pyproject.toml)
- **主要依赖**:
  - mcp >= 1.9.4
  - pydantic == 2.10.6
  - volcengine-python-sdk >= 3.0.1

# Tools能力调研

[Alibaba](Alibaba/Analysis/Alibaba_Tool_list.md)
[Google](Google/Analysis/google_tool_list.md)
[Azure](Azure/Analysis/azure_Tool_list.md)
[Dynatrace](Dynatrace/Analysis/dynatrace_tool_list.md)
[AWS](aws/Analysis/aws_tool_list.md)
[Volcengine](Volcengine/Analysis/volcengine_tool_list.md)

# Agent-as-Tools调研

[Alibaba](Alibaba/Analysis/Alibaba_Agent_as_Tools.md)
[Google](Google/Analysis/Google_Agent_as_Tools.md)
[Azure](Azure/Analysis/Azure_Agent_as_Tools.md)
[Dynatrace](Dynatrace/Analysis/Dynatrace_Agent_as_Tools.md)
[AWS](aws/Analysis/AWS_Agent_as_Tools.md)
[Volcengine](Volcengine/Analysis/Volcengine_Agent_as_Tools.md)
