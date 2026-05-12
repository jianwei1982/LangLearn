# 实施计划: 语音录音背诵功能

**分支**: `002-voice-recitation` | **日期**: 2026-05-12 | **规范**: [spec.md](./spec.md)
**输入**: 来自 `/specs/002-voice-recitation/spec.md` 的功能规范

---

## 摘要

实现儿童英语背单词应用的语音录音背诵功能。用户点击"录音"按钮开始录音，录音过程中按钮变为"结束"按钮，点击"结束"停止录音后，用户通过"会/不会"按钮手动评估自己的发音。

## 技术背景

| 字段 | 值 |
|------|-----|
| **语言/版本** | Dart 3.x / Flutter 3.x |
| **主要依赖** | `record` (音频录制), `permission_handler` (权限管理) |
| **存储** | SQLCipher (现有), 录音文件临时存储 |
| **测试** | Flutter Test, Mocktail |
| **目标平台** | iOS 12+, Android API 21+ |
| **项目类型** | 移动应用 (Flutter) |
| **性能目标** | 录音启动 < 1秒，按钮切换 < 200ms |
| **约束条件** | 离线优先（宪法原则1），完全本地化 |
| **规模/Scope** | 新增功能模块，2-3个屏幕 |

---

## 章程检查

| 门控条件 | 状态 | 说明 |
|---------|------|------|
| 原则1: 离线优先 | ✅ 通过 | 录音功能完全离线，不依赖网络 |
| 原则2: 本地AI | ✅ 通过 | 不使用云端语音识别，采用手动评估 |
| 原则5: 加密存储 | ✅ 通过 | 录音文件临时存储，会话结束后删除 |
| 原则8: MVVM + Clean Architecture | ✅ 通过 | 遵循现有架构模式 |

---

## 项目结构

### 文档(此功能)

```
specs/002-voice-recitation/
├── plan.md              # 此文件
├── research.md          # ✅ 已完成 (阶段0)
├── data-model.md        # ✅ 已完成 (阶段1)
├── quickstart.md        # 待更新
└── tasks.md             # 待生成
```

### 源代码(仓库根目录)

基于现有项目结构，新增：

```
lib/
├── core/
│   └── constants/
├── data/
│   ├── repositories/
│   └── services/
│       └── recording_service.dart   # 新增
├── domain/
│   ├── entities/
│   │   └── recording_session.dart    # 新增
│   └── usecases/
└── presentation/
    ├── providers/
    │   └── recording_provider.dart    # 新增
    ├── screens/
    │   └── recitation/
    │       └── recitation_screen.dart # 修改
    └── widgets/
        └── recording_button.dart      # 新增
```

**结构决策**: 遵循现有 Clean Architecture 分层，新增录音相关的服务、实体和 UI 组件。

---

## 复杂度跟踪

> **仅在章程检查有必须证明的违规时填写**

无需复杂度违规，所有门控条件均已通过。

---

## 阶段完成状态

| 阶段 | 状态 | 说明 |
|------|------|------|
| 阶段0: 大纲与研究 | ✅ 完成 | research.md 已生成 |
| 阶段1: 设计与契约 | ✅ 完成 | data-model.md 已更新 |
| 阶段2: 任务分解 | ⏳ 待执行 | tasks.md 待生成 |

---

## 技术决策摘要

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 音频录制库 | `record` | 跨平台、轻量、功能完整 |
| 权限处理 | `permission_handler` | 统一 API、成熟稳定 |
| 存储策略 | 临时存储 | 符合隐私原则 |
| 音频格式 | AAC (M4A) | 跨平台兼容、音质好 |
| 超时设置 | 60秒 | 合理时间限制 |
