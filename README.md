# MCP 竞争对手分析 - 版本信息汇总

本文档汇总了仓库中各厂商MCP（Model Context Protocol）服务器的版本信息。

## 版本信息总览

| 厂商 | 项目名称 | 版本号 | 编程语言 | 主要功能 |
|------|----------|--------|----------|----------|
| **Alibaba** | alibabacloud-observability-mcp-server | 0.3.2 | Python | 阿里云可观测性服务 |
| **AWS** | cloudwatch-mcp-server | 0.0.11 | Python | AWS CloudWatch监控 |
| **Azure** | azure-mcp | 0.5.8 | C#/.NET | Azure云服务管理 |
| **Dynatrace** | dynatrace-mcp-server | 0.12.0 | TypeScript/Node.js | Dynatrace可观测性平台 |
| **Google** | observability-mcp | 0.1.2 | TypeScript/Node.js | Google Cloud可观测性 |
| **Volcengine** | mcp-server-ecs | 0.1.0 | Python | 火山引擎ECS服务 |

## 详细信息

### Alibaba (阿里云)
- **项目**: alibabacloud-observability-mcp-server
- **版本**: 0.3.2
- **语言**: Python 3.10+
- **配置文件**: [`pyproject.toml`](Alibaba/Code/alibabacloud-observability-mcp-server/pyproject.toml:3)
- **主要依赖**:
  - mcp >= 1.3.0
  - pydantic >= 2.10.0
  - alibabacloud_arms20190808 == 8.0.0
  - alibabacloud_sls20201230 == 5.7.0

### AWS (亚马逊云)
- **项目**: cloudwatch-mcp-server
- **版本**: 0.0.11
- **语言**: Python 3.10+
- **配置文件**: [`pyproject.toml`](AWS/Code/cloudwatch-mcp-server/pyproject.toml:3)
- **主要依赖**:
  - mcp[cli] >= 1.11.0
  - boto3 >= 1.38.22
  - pydantic >= 2.10.6

### Azure (微软云)
- **项目**: azure-mcp
- **版本**: 0.5.8
- **语言**: C#/.NET 9.0
- **配置文件**: [`Directory.Build.props`](Azure/azure-mcp/Directory.Build.props:3)
- **SDK版本**: 10.0.100-preview.7.25380.108
- **主要特性**: 支持AOT编译，多服务集成

### Dynatrace
- **项目**: dynatrace-mcp-server
- **版本**: 0.12.0
- **语言**: TypeScript/Node.js
- **配置文件**: [`package.json`](Dynatrace/Code/dynatrace-mcp/package.json:3)
- **主要依赖**:
  - @modelcontextprotocol/sdk ^1.8.0
  - @dynatrace-sdk/client-query ^1.18.1
  - @dynatrace-sdk/client-davis-copilot ^1.0.0

### Google (谷歌云)
- **项目**: observability-mcp
- **版本**: 0.1.2
- **语言**: TypeScript/Node.js
- **配置文件**: [`package.json`](Google/Code/observability-mcp/package.json:4)
- **主要依赖**:
  - @modelcontextprotocol/sdk ^1.17.1
  - googleapis ^155.0.0
  - google-auth-library ^10.1.0

### Volcengine (火山引擎)
- **项目**: mcp-server-ecs
- **版本**: 0.1.0
- **语言**: Python 3.12+
- **配置文件**: [`pyproject.toml`](Volcengine/Code/mcp_server_ecs/pyproject.toml:3)
- **主要依赖**:
  - mcp >= 1.9.4
  - pydantic == 2.10.6
  - volcengine-python-sdk >= 3.0.1

## 版本成熟度分析

### 最成熟项目
1. **Dynatrace** (0.12.0) - 版本号最高，功能相对完善
2. **Alibaba** (0.3.2) - 快速迭代，从0.1.0到0.3.2共12个版本

### 新兴项目
1. **Volcengine** (0.1.0) - 初始版本
2. **Google** (0.1.2) - 早期版本
3. **AWS** (0.0.11) - 仍在开发中

### 技术栈分布
- **Python**: Alibaba, AWS, Volcengine (3个项目)
- **TypeScript/Node.js**: Dynatrace, Google (2个项目)
- **C#/.NET**: Azure (1个项目)

## 更新频率
- **高频率**: Alibaba (快速迭代，版本更新频繁)
- **中等频率**: Dynatrace, Azure
- **低频率**: AWS, Google, Volcengine

---

*最后更新时间: 2025-11-10*
*数据来源: 各项目的配置文件 (pyproject.toml, package.json, Directory.Build.props)*