/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * MCP能力提取工具
 * 从MCP文档中提取可观测能力并生成结构化的Markdown文档
 */

// ============ 类型定义 ============

interface MCPInput {
  mcpName: string;
  documentationUrl: string;
  mcpVersion: string;
  vendorName: string;
}

interface SupportLevel {
  supported: '✓' | '✗' | '◐'; // 完全支持/不支持/部分支持
  details: string;
  versionLimit?: string;
  docLink?: string;
}

interface ToolsCapability {
  basicTools: SupportLevel & { toolNames?: string[]; count?: number };
  parameterValidation: SupportLevel & { validationType?: string };
  parallelExecution: SupportLevel & { maxConcurrency?: number };
  streamingSupport: SupportLevel;
  errorHandling: SupportLevel & { errorTypes?: number; degradationStrategy?: string };
}

interface ResourcesCapability {
  resourceDiscovery: SupportLevel & { resourceTypes?: string[]; count?: number };
  uriTemplate: SupportLevel & { templateFormat?: string };
  subscriptionMechanism: SupportLevel & { type?: 'realtime' | 'polling'; latency?: string };
  paginationStrategy: SupportLevel & { strategy?: 'offset' | 'cursor'; maxPageSize?: number };
}

interface PromptsCapability {
  promptManagement: SupportLevel;
  samplingStrategy: SupportLevel & { strategies?: string[] };
  customization: SupportLevel & { flexibilityLevel?: string };
}

interface ModelCompatibility {
  supportedModels: SupportLevel & { models?: string[] };
  modelSwitching: SupportLevel & { flexibility?: string };
}

interface ConnectionCapability {
  protocols: SupportLevel & { supportedProtocols?: string[] };
  connectionPooling: SupportLevel;
  reconnectionMechanism: SupportLevel;
}

interface AuthCapability {
  authMethods: SupportLevel & { methods?: string[] };
  tokenManagement: SupportLevel & { autoRefresh?: boolean };
  permissionGranularity: SupportLevel & { level?: 'fine' | 'coarse' };
}

interface SecurityCapability {
  dataEncryption: SupportLevel & { encryptionMethod?: string };
  accessControl: SupportLevel;
  auditLogging: SupportLevel;
}

interface MCPCapabilities {
  tools: ToolsCapability;
  resources: ResourcesCapability;
  prompts: PromptsCapability;
  modelCompatibility: ModelCompatibility;
  connection: ConnectionCapability;
  auth: AuthCapability;
  security: SecurityCapability;
}

interface PerformanceMetrics {
  qpsLimit?: number;
  responseLatency?: string;
  throughput?: string;
  concurrencyLimit?: number;
}

interface Limitations {
  knownIssues: string[];
  constraints: string[];
  dependencies: string[];
}

// ============ 核心分析函数 ============

/**
 * 从本地MCP实现中分析能力
 * 通过读取代码和配置文件来提取能力信息
 */
function analyzeLocalMCP(basePath: string): MCPCapabilities {
  // 这里实现本地代码分析逻辑
  // 示例：分析当前observability-mcp的能力

  const capabilities: MCPCapabilities = {
    tools: {
      basicTools: {
        supported: '✓',
        details: '提供12个GCP可观测性工具',
        toolNames: [
          'list_log_entries',
          'list_log_names',
          'list_buckets',
          'list_views',
          'list_sinks',
          'list_log_scopes',
          'list_metric_descriptors',
          'list_time_series',
          'list_alert_policies',
          'list_traces',
          'get_trace',
          'list_group_stats',
        ],
        count: 12,
        versionLimit: 'v0.1.0+',
        docLink: 'README.md#tools-reference',
      },
      parameterValidation: {
        supported: '✓',
        details: 'Zod Schema验证所有输入参数',
        validationType: 'Zod Schema',
        versionLimit: 'v0.1.0+',
      },
      parallelExecution: {
        supported: '✓',
        details: '支持并行调用多个工具，无硬性并发限制（受GCP API配额限制）',
        maxConcurrency: undefined,
        versionLimit: 'v0.1.0+',
      },
      streamingSupport: {
        supported: '✗',
        details: '不支持流式处理，所有响应为完整JSON',
      },
      errorHandling: {
        supported: '✓',
        details: 'toolWrapper统一处理错误，返回结构化错误信息',
        errorTypes: 3,
        degradationStrategy: '捕获异常并返回包含name/message/stack的JSON错误',
        versionLimit: 'v0.1.0+',
      },
    },
    resources: {
      resourceDiscovery: {
        supported: '✗',
        details: '不支持MCP Resources协议，仅提供Tools',
      },
      uriTemplate: {
        supported: '✗',
        details: '不适用',
      },
      subscriptionMechanism: {
        supported: '✗',
        details: '不支持订阅机制',
      },
      paginationStrategy: {
        supported: '✓',
        details: '所有list工具支持分页，使用pageToken策略',
        strategy: 'cursor',
        maxPageSize: 50,
        versionLimit: 'v0.1.0+',
      },
    },
    prompts: {
      promptManagement: {
        supported: '✗',
        details: '不支持MCP Prompts协议',
      },
      samplingStrategy: {
        supported: '✗',
        details: '不支持Sampling',
      },
      customization: {
        supported: '✗',
        details: '不适用',
      },
    },
    modelCompatibility: {
      supportedModels: {
        supported: '✓',
        details: '与所有支持MCP协议的模型兼容',
        models: ['Claude', 'Gemini', '其他MCP兼容模型'],
        versionLimit: 'v0.1.0+',
      },
      modelSwitching: {
        supported: '✓',
        details: '模型无关，由MCP客户端管理',
        flexibility: '完全灵活',
      },
    },
    connection: {
      protocols: {
        supported: '✓',
        details: '支持stdio传输协议',
        supportedProtocols: ['stdio'],
        versionLimit: 'v0.1.0+',
      },
      connectionPooling: {
        supported: '✗',
        details: '单一stdio连接，不需要连接池',
      },
      reconnectionMechanism: {
        supported: '✗',
        details: '由MCP客户端处理重连',
      },
    },
    auth: {
      authMethods: {
        supported: '✓',
        details: 'Google Cloud Application Default Credentials (ADC)',
        methods: ['ADC', 'OAuth 2.0', 'Service Account'],
        versionLimit: 'v0.1.0+',
        docLink: 'README.md#authentication',
      },
      tokenManagement: {
        supported: '✓',
        details: 'Google Auth Library自动刷新token',
        autoRefresh: true,
        versionLimit: 'v0.1.0+',
      },
      permissionGranularity: {
        supported: '✓',
        details: '依赖GCP IAM，支持细粒度权限控制',
        level: 'fine',
        versionLimit: 'v0.1.0+',
      },
    },
    security: {
      dataEncryption: {
        supported: '✓',
        details: '通过HTTPS/TLS加密所有API调用',
        encryptionMethod: 'TLS 1.2+',
        versionLimit: 'v0.1.0+',
      },
      accessControl: {
        supported: '✓',
        details: '通过GCP IAM进行访问控制',
        versionLimit: 'v0.1.0+',
      },
      auditLogging: {
        supported: '◐',
        details: 'GCP API调用自动记录到Cloud Audit Logs，MCP服务器本地日志有限',
        versionLimit: 'v0.1.0+',
      },
    },
  };

  return capabilities;
}

/**
 * 从远程文档URL分析能力
 * 通过获取和解析文档来提取能力信息
 */
async function analyzeRemoteMCP(documentationUrl: string): Promise<Partial<MCPCapabilities>> {
  // 这里可以实现从远程文档获取和解析的逻辑
  // 需要使用WebFetch或类似工具
  console.warn('远程文档分析功能尚未完全实现，请手动补充信息');
  return {};
}

// ============ Markdown生成器 ============

function generateCapabilityTable(capabilities: MCPCapabilities): string {
  const rows: string[] = [];

  // 表头
  rows.push('| 能力模块 | 具体功能项 | 是否支持 | 详细说明 | 版本限制 | 官方文档链接 |');
  rows.push('|---------|-----------|---------|---------|---------|-------------|');

  // Tools能力
  rows.push(
    `| **Tools** | 基础工具数量 | ${capabilities.tools.basicTools.supported} | ${capabilities.tools.basicTools.details} (${capabilities.tools.basicTools.count}个) | ${capabilities.tools.basicTools.versionLimit || '-'} | ${capabilities.tools.basicTools.docLink || '-'} |`,
  );
  rows.push(
    `| | 参数验证 | ${capabilities.tools.parameterValidation.supported} | ${capabilities.tools.parameterValidation.details} | ${capabilities.tools.parameterValidation.versionLimit || '-'} | - |`,
  );
  rows.push(
    `| | 并行调用支持 | ${capabilities.tools.parallelExecution.supported} | ${capabilities.tools.parallelExecution.details} | ${capabilities.tools.parallelExecution.versionLimit || '-'} | - |`,
  );
  rows.push(
    `| | 流式处理 | ${capabilities.tools.streamingSupport.supported} | ${capabilities.tools.streamingSupport.details} | ${capabilities.tools.streamingSupport.versionLimit || '-'} | - |`,
  );
  rows.push(
    `| | 错误处理机制 | ${capabilities.tools.errorHandling.supported} | ${capabilities.tools.errorHandling.details} | ${capabilities.tools.errorHandling.versionLimit || '-'} | - |`,
  );

  // Resources管理
  rows.push(
    `| **Resources** | 资源发现能力 | ${capabilities.resources.resourceDiscovery.supported} | ${capabilities.resources.resourceDiscovery.details} | ${capabilities.resources.resourceDiscovery.versionLimit || '-'} | - |`,
  );
  rows.push(
    `| | URI模板设计 | ${capabilities.resources.uriTemplate.supported} | ${capabilities.resources.uriTemplate.details} | ${capabilities.resources.uriTemplate.versionLimit || '-'} | - |`,
  );
  rows.push(
    `| | 订阅机制 | ${capabilities.resources.subscriptionMechanism.supported} | ${capabilities.resources.subscriptionMechanism.details} | ${capabilities.resources.subscriptionMechanism.versionLimit || '-'} | - |`,
  );
  rows.push(
    `| | 分页策略 | ${capabilities.resources.paginationStrategy.supported} | ${capabilities.resources.paginationStrategy.details} | ${capabilities.resources.paginationStrategy.versionLimit || '-'} | - |`,
  );

  // Prompts/Sampling
  rows.push(
    `| **Prompts/Sampling** | 提示词管理 | ${capabilities.prompts.promptManagement.supported} | ${capabilities.prompts.promptManagement.details} | ${capabilities.prompts.promptManagement.versionLimit || '-'} | - |`,
  );
  rows.push(
    `| | 采样策略 | ${capabilities.prompts.samplingStrategy.supported} | ${capabilities.prompts.samplingStrategy.details} | ${capabilities.prompts.samplingStrategy.versionLimit || '-'} | - |`,
  );
  rows.push(
    `| | 自定义能力 | ${capabilities.prompts.customization.supported} | ${capabilities.prompts.customization.details} | ${capabilities.prompts.customization.versionLimit || '-'} | - |`,
  );

  // Model兼容性
  rows.push(
    `| **Model兼容性** | 支持的模型 | ${capabilities.modelCompatibility.supportedModels.supported} | ${capabilities.modelCompatibility.supportedModels.details} | ${capabilities.modelCompatibility.supportedModels.versionLimit || '-'} | - |`,
  );
  rows.push(
    `| | 模型切换灵活性 | ${capabilities.modelCompatibility.modelSwitching.supported} | ${capabilities.modelCompatibility.modelSwitching.details} | ${capabilities.modelCompatibility.modelSwitching.versionLimit || '-'} | - |`,
  );

  // 连接方式
  rows.push(
    `| **连接方式** | 支持的协议 | ${capabilities.connection.protocols.supported} | ${capabilities.connection.protocols.details} | ${capabilities.connection.protocols.versionLimit || '-'} | - |`,
  );
  rows.push(
    `| | 连接池管理 | ${capabilities.connection.connectionPooling.supported} | ${capabilities.connection.connectionPooling.details} | ${capabilities.connection.connectionPooling.versionLimit || '-'} | - |`,
  );
  rows.push(
    `| | 断线重连机制 | ${capabilities.connection.reconnectionMechanism.supported} | ${capabilities.connection.reconnectionMechanism.details} | ${capabilities.connection.reconnectionMechanism.versionLimit || '-'} | - |`,
  );

  // 认证授权
  rows.push(
    `| **认证授权** | 认证方式 | ${capabilities.auth.authMethods.supported} | ${capabilities.auth.authMethods.details} | ${capabilities.auth.authMethods.versionLimit || '-'} | ${capabilities.auth.authMethods.docLink || '-'} |`,
  );
  rows.push(
    `| | Token管理 | ${capabilities.auth.tokenManagement.supported} | ${capabilities.auth.tokenManagement.details} | ${capabilities.auth.tokenManagement.versionLimit || '-'} | - |`,
  );
  rows.push(
    `| | 权限粒度 | ${capabilities.auth.permissionGranularity.supported} | ${capabilities.auth.permissionGranularity.details} | ${capabilities.auth.permissionGranularity.versionLimit || '-'} | - |`,
  );

  // 安全特性
  rows.push(
    `| **安全特性** | 数据加密 | ${capabilities.security.dataEncryption.supported} | ${capabilities.security.dataEncryption.details} | ${capabilities.security.dataEncryption.versionLimit || '-'} | - |`,
  );
  rows.push(
    `| | 权限控制 | ${capabilities.security.accessControl.supported} | ${capabilities.security.accessControl.details} | ${capabilities.security.accessControl.versionLimit || '-'} | - |`,
  );
  rows.push(
    `| | 审计日志 | ${capabilities.security.auditLogging.supported} | ${capabilities.security.auditLogging.details} | ${capabilities.security.auditLogging.versionLimit || '-'} | - |`,
  );

  return rows.join('\n');
}

function generateToolsDetail(capabilities: MCPCapabilities): string {
  if (!capabilities.tools.basicTools.toolNames) return '';

  const sections: string[] = [];
  sections.push('### 工具详细列表\n');

  capabilities.tools.basicTools.toolNames.forEach((tool, index) => {
    sections.push(`${index + 1}. **${tool}**`);
  });

  return sections.join('\n');
}

function generatePerformanceMetrics(metrics: PerformanceMetrics): string {
  const sections: string[] = [];
  sections.push('## 二、性能指标详解\n');

  sections.push('### GCP API限制');
  sections.push('- **QPS限制**：依赖GCP API配额，不同API有不同限制');
  sections.push('- **响应延迟**：通常 < 1s，取决于查询复杂度和数据量');
  sections.push('- **并发限制**：无MCP层面限制，受GCP API配额约束');
  sections.push('- **工具响应大小**：最大100,000字符（在tool_wrapper.ts中强制执行）\n');

  return sections.join('\n');
}

function generateLimitations(limitations: Limitations): string {
  const sections: string[] = [];
  sections.push('## 三、限制条件说明\n');

  sections.push('### 已知约束');
  sections.push('1. **响应大小限制**：所有工具响应截断至100,000字符');
  sections.push('2. **配额依赖**：必须设置GCP配额项目，且启用相应API');
  sections.push('3. **认证要求**：需要ADC认证，需执行 `gcloud auth application-default login`');
  sections.push('4. **协议支持**：仅支持stdio传输，不支持SSE/WebSocket');
  sections.push('5. **MCP功能**：仅实现Tools协议，不支持Resources/Prompts/Sampling\n');

  sections.push('### 依赖关系');
  sections.push('- **google-auth-library**: ^10.1.0 - 用于GCP认证');
  sections.push('- **googleapis**: ^155.0.0 - 用于调用GCP API');
  sections.push('- **@modelcontextprotocol/sdk**: ^1.17.1 - MCP协议实现');
  sections.push('- **zod**: ^3.25.76 - 参数验证\n');

  return sections.join('\n');
}

function generateMarkdownDocument(
  input: MCPInput,
  capabilities: MCPCapabilities,
  metrics: PerformanceMetrics,
  limitations: Limitations,
): string {
  const sections: string[] = [];

  // 标题和元信息
  sections.push(`# ${input.vendorName} MCP 能力清单 v${input.mcpVersion}\n`);
  sections.push(`**产品名称**: ${input.mcpName}`);
  sections.push(`**版本**: ${input.mcpVersion}`);
  sections.push(`**文档链接**: ${input.documentationUrl}`);
  sections.push(`**生成时间**: ${new Date().toISOString()}\n`);
  sections.push('---\n');

  // 第一部分：完整能力清单表格
  sections.push('## 一、完整能力清单\n');
  sections.push(generateCapabilityTable(capabilities));
  sections.push('\n');
  sections.push(generateToolsDetail(capabilities));
  sections.push('\n');

  // 第二部分：性能指标详解
  sections.push(generatePerformanceMetrics(metrics));

  // 第三部分：限制条件说明
  sections.push(generateLimitations(limitations));

  // 符号说明
  sections.push('---\n');
  sections.push('## 符号说明\n');
  sections.push('- ✓ : 完全支持');
  sections.push('- ✗ : 不支持');
  sections.push('- ◐ : 部分支持');

  return sections.join('\n');
}

// ============ 主函数 ============

function main() {
  const input: MCPInput = {
    mcpName: 'Cloud Observability MCP',
    documentationUrl: 'https://github.com/googleapis/gcloud-mcp/tree/main/packages/observability-mcp',
    mcpVersion: '0.1.2',
    vendorName: 'Google Cloud',
  };

  console.log('正在分析MCP能力...');

  // 分析本地MCP实现
  const capabilities = analyzeLocalMCP('.');

  // 性能指标（可根据实际情况调整）
  const metrics: PerformanceMetrics = {
    qpsLimit: undefined, // 依赖GCP API
    responseLatency: '< 1s',
    concurrencyLimit: undefined, // 无硬性限制
  };

  // 限制条件
  const limitations: Limitations = {
    knownIssues: [
      '响应大小限制为100,000字符',
      '不支持流式处理',
      '仅支持stdio传输协议',
    ],
    constraints: ['需要GCP认证', '需要启用相应的GCP API', '依赖GCP API配额'],
    dependencies: ['google-auth-library', 'googleapis', '@modelcontextprotocol/sdk', 'zod'],
  };

  // 生成Markdown文档
  const markdown = generateMarkdownDocument(input, capabilities, metrics, limitations);

  // 写入文件
  const outputPath = join(
    process.cwd(),
    `${input.vendorName.replace(/\s+/g, '_')}_MCP_能力清单_v${input.mcpVersion}.md`,
  );
  writeFileSync(outputPath, markdown, 'utf-8');

  console.log(`✓ 能力清单已生成: ${outputPath}`);
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeLocalMCP, analyzeRemoteMCP, generateMarkdownDocument };
export type { MCPInput, MCPCapabilities, PerformanceMetrics, Limitations };
