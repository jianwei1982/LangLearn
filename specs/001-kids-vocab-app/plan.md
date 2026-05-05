# 实施计划: 儿童英语背单词应用

**分支**: `001-kids-vocab-app` | **日期**: 2026-05-04 | **规范**: [spec.md](spec.md)
**输入**: 来自 `/specs/001-kids-vocab-app/spec.md` 的功能规范

## 摘要

本项目开发一款面向儿童的英语单词背诵移动应用，采用 Flutter 框架实现 iOS 和 Android 双平台部署。核心功能包括：单词维护（增删改查）、学习参数设置、字母拼读背诵模式、单词发音播放、智能单词筛选。

技术方案遵循宪法原则：完全离线运行、使用本地 AI（TTS + 翻译）、SQLCipher 加密存储、Riverpod 状态管理、Clean Architecture 分层架构。

## 技术背景

**语言/版本**: Dart 3.x (Flutter 3.x)
**主要依赖**: Flutter, Riverpod, sqflite_sqlcipher, translator (Dart库), flutter_tts
**存储**: 本地加密数据库 (SQLCipher via sqflite_sqlcipher)
**测试**: flutter test (单元测试 + 集成测试)
**目标平台**: iOS 12+, Android API 21+ (Android 5.0+)
**项目类型**: 移动应用 (跨平台)
**性能目标**: 单词发音3秒内开始播放, 字母朗读间隔<500ms
**约束条件**: 完全离线可用, 所有数据本地加密存储

## 章程检查

| 章程原则 | 合规状态 | 备注 |
|----------|----------|------|
| 原则1: 完全离线与隐私优先 | ✅ 符合 | 本地存储，无网络依赖 |
| 原则2: 本地 AI 驱动 | ⚠ 待定 | 使用 flutter_tts (系统TTS) 替代 KittenTTS，需验证是否符合要求 |
| 原则3: 跨平台一致性 | ✅ 符合 | Flutter 框架实现 |
| 原则4: 儿童友好交互 | ✅ 符合 | 无字母提示, double读法, 跳过功能 |
| 原则5: 离线数据安全 | ✅ 符合 | SQLCipher 加密 |
| 原则6: 音频缓存 | ✅ 符合 | 预生成并缓存音频 |
| 原则7: 虚拟环境隔离 | N/A | Python 项目规则，本项目为 Flutter |
| 原则8: 可扩展性 | ✅ 符合 | Clean Architecture |
| 原则9: 可维护性 | ✅ 符合 | Riverpod + 分层架构 |

**门控说明**: 原则2 (KittenTTS) 存在潜在冲突——flutter_tts 是系统级 TTS 而非纯本地开源方案。建议在阶段1设计时评估是否可接受系统 TTS，或寻找替代方案。

## 项目结构

### 文档(此功能)

```
specs/001-kids-vocab-app/
├── plan.md              # 此文件
├── research.md          # 阶段0输出 (技术调研)
├── data-model.md        # 阶段1输出 (数据模型设计)
├── quickstart.md        # 阶段1输出 (快速开始指南)
├── contracts/           # 阶段1输出 (接口定义)
└── tasks.md             # 阶段2输出 (任务列表)
```

### 源代码(Flutter 项目)

```
lib/
├── main.dart                    # 应用入口
├── core/                        # 核心层 (共享工具, 常量, 主题)
│   ├── constants/
│   ├── theme/
│   └── utils/
├── data/                        # 数据层
│   ├── datasources/             # 本地数据源 (SQLCipher)
│   ├── models/                  # 数据模型 (DTO)
│   └── repositories/            # 仓库实现
├── domain/                      # 领域层
│   ├── entities/                # 实体 (Word, Settings)
│   ├── repositories/            # 仓库接口
│   └── usecases/                # 用例 (CRUD, 背诵逻辑)
├── presentation/                # 表现层
│   ├── providers/               # Riverpod providers
│   ├── pages/                   # 页面 (单词管理, 背诵, 设置)
│   └── widgets/                 # 通用组件
└── services/                    # 服务层
    ├── tts_service.dart         # TTS 服务
    └── translation_service.dart # 翻译服务

test/
├── unit/                        # 单元测试
└── integration/                 # 集成测试
```

**结构决策**: 采用 Clean Architecture + Riverpod 状态管理，完全符合宪法原则8和9。

## 复杂度跟踪

| 违规项 | 为什么需要 | 拒绝更简单替代方案的原因 |
|--------|------------|--------------------------|
| Clean Architecture | 需解耦 TTS/翻译引擎以遵循原则2的"可替换"要求 | 直接数据库访问无法满足未来引擎替换需求 |
| SQLCipher 加密 | 儿童数据隐私（宪法原则5） | 普通 SQLite 无法满足加密要求 |
| 音频预生成缓存 | 背诵时需即时播放（性能目标） | 实时合成会导致明显延迟 |

---

*计划版本: 1.0 | 创建日期: 2026-05-04*