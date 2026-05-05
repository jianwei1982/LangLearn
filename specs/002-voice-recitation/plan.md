# 实施计划: 语音识别背诵功能

**分支**: `002-voice-recitation` | **日期**: 2026-05-05 | **规范**: [spec.md](spec.md)
**输入**: 来自 `/specs/002-voice-recitation/spec.md` 的功能规范

## 摘要

本功能将把现有的字母拼读背诵模式替换为语音识别背诵模式：用户点击按钮 → 播放单词发音 → 录音用户发音 → 使用语音识别评估 → 根据相似度判断并更新正确次数。

## 技术背景

**语言/版本**: Dart 3.11.5 / Flutter 3.41.9
**主要依赖**:
- `flutter_tts: ^4.2.0` - 文本转语音（已有）
- `speech_to_text: ^7.0.0` - 语音识别（研究决定）
- `permission_handler: ^11.3.0` - 权限处理（研究决定）
- sqflite_sqlcipher: ^3.1.0+1 (已有)
- flutter_riverpod: ^2.6.1 (已有)
**存储**: SQLCipher 加密数据库（已有）
**测试**: flutter_test, mocktail
**目标平台**: iOS 15+, Android API 21+
**项目类型**: 移动应用 (Flutter)
**性能目标**: 完整流程在10秒内完成（SC-001）
**约束条件**: 离线优先（宪法原则1），本地处理（宪法原则2）
**规模/范围**: 单用户本地应用，约50个屏幕

## 章程检查

*门控: 必须在阶段 0 研究前通过. 阶段 1 设计后重新检查. *

### 宪法原则检查（阶段 0 - 研究后）

| 原则 | 评估 | 说明 |
|------|------|------|
| 原则1: 完全离线与隐私优先 | ✅ 通过 | 使用 `speech_to_text` 的设备本地离线识别模式 |
| 原则2: 本地 AI 驱动 | ✅ 通过 | 语音识别使用设备系统级 API，不调用云服务 |
| 原则3: 跨平台一致性 | ✅ 通过 | Flutter + 平台原生语音识别 API 确保一致性 |
| 原则4: 儿童友好的交互设计 | ✅ 通过 | 简洁的点击开始/停止交互，明确的反馈等级 |
| 原则5: 离线数据安全与加密 | ✅ 通过 | 现有 SQLCipher 架构保持不变 |

### 研究解决的问题

1. **语音识别库选择**: ✅ 使用 `speech_to_text` 插件（跨平台、离线支持）
2. **离线语音识别**: ✅ 使用设备本地识别能力，完全离线可用
3. **权限处理**: ✅ 使用 `permission_handler` 统一处理

## 项目结构

### 文档(此功能)

```
specs/002-voice-recitation/
├── plan.md              # 此文件 (/speckit.plan 命令输出)
├── research.md          # 阶段 0 输出 (待创建)
├── data-model.md        # 阶段 1 输出 (待创建)
├── quickstart.md        # 阶段 1 输出 (待创建)
├── contracts/           # 阶段 1 输出 (如需要)
└── tasks.md             # 阶段 2 输出 (/speckit.tasks 命令创建)
```

### 源代码(现有项目)

```
kids_vocab_app/lib/
├── core/
│   └── utils/
│       └── letter_speller.dart    # 保留但可能不再使用
├── data/
│   ├── datasources/
│   │   └── database_helper.dart   # 已有，需扩展设置表
│   ├── models/
│   │   └── word_model.dart
│   └── repositories/
│       └── word_repository_impl.dart
├── domain/
│   ├── entities/
│   │   ├── word.dart               # 已有
│   │   └── learning_settings.dart  # 需扩展语音识别设置
│   ├── repositories/
│   │   └── word_repository.dart
│   └── usecases/
│       └── [多个 use case 文件]
├── presentation/
│   ├── pages/
│   │   ├── recitation_page.dart    # 需大幅修改
│   │   ├── settings_page.dart      # 需添加语音设置
│   │   └── [其他页面]
│   └── providers/
│       ├── recitation_provider.dart # 需大幅修改
│       ├── settings_provider.dart
│       └── [其他 providers]
├── services/
│   ├── tts_service.dart            # 已有，继续使用
│   ├── translation_service.dart    # 已有
│   └── speech_recognition_service.dart  # 需新增
└── main.dart
```

**结构决策**: 在现有 Clean Architecture 基础上新增 `speech_recognition_service.dart` 服务，扩展 `recitation_provider.dart` 添加语音识别状态管理，修改 `recitation_page.dart` 的 UI。

### 需要新增的文件

| 文件 | 目的 |
|------|------|
| `lib/services/speech_recognition_service.dart` | 封装语音识别功能 |
| `lib/domain/entities/voice_recording.dart` | 录音记录实体（如果需要持久化）|
| 扩展 `lib/domain/entities/learning_settings.dart` | 添加语音识别相关设置 |
| 修改 `lib/presentation/pages/recitation_page.dart` | 新 UI：录音按钮、状态显示 |
| 修改 `lib/presentation/providers/recitation_provider.dart` | 添加录音/识别状态管理 |

## 复杂度跟踪

> **仅在章程检查有必须证明的违规时填写**

| 违规 | 为什么需要 | 拒绝更简单替代方案的原因 |
|-----------|------------|-------------------------------------|
| [例如: 第 4 个项目] | [当前需求] | [为什么 3 个项目不够] |
| [例如: 仓储模式] | [特定问题] | [为什么直接数据库访问不够] |
