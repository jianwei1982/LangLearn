# 任务清单: 语音识别背诵功能

**功能**: 语音识别背诵功能
**分支**: 002-voice-recitation
**规范**: [spec.md](spec.md)
**计划**: [plan.md](plan.md)

---

## 摘要

| 指标 | 值 |
|------|-----|
| 总任务数 | 15 |
| 用户故事数 | 3 |
| MVP 任务数 | 8 |

---

## 用户故事 → 任务映射

| 用户故事 | 优先级 | 任务数 | 独立测试标准 |
|----------|--------|--------|--------------|
| US1: 语音识别背诵流程 | P1 | 7 | 可以通过完整流程测试：点击按钮 → 播放发音 → 录音 → 识别 → 结果显示 |
| US2: 发音评估反馈 | P2 | 4 | 可以通过不同发音（正确/错误）测试反馈显示 |
| US3: 跳过功能 | P3 | 2 | 可以通过点击跳过验证统计更新 |

---

## 依赖关系

```
设置阶段 (Phase 1)
    │
    ▼
基础阶段 (Phase 2)
    │
    ├── T001 (依赖设置完成)
    ├── T002 (依赖 T001)
    │
    ▼
US1 - 语音识别背诵流程 (Phase 3)
    ├── T003, T004 (基础服务)
    ├── T005, T006 (UI/状态)
    │
    ▼
US2 - 发音评估反馈 (Phase 4) [依赖 US1 核心功能]
    │
    ▼
US3 - 跳过功能 (Phase 5) [依赖 US1 核心功能]
    │
    ▼
收尾阶段 (Phase 6)
```

---

## Phase 1: 设置（项目初始化）

- [ ] T001 添加依赖到 pubspec.yaml (speech_to_text, permission_handler)

---

## Phase 2: 基础（阻塞性前置条件）

- [ ] T002 配置 iOS/Android 权限 (Info.plist, AndroidManifest.xml)
- [ ] T003 扩展 LearningSettings 实体添加语音识别设置项

---

## Phase 3: US1 - 语音识别背诵流程

- [ ] T004 [P] [US1] 创建 SpeechRecognitionService 服务类
- [ ] T005 [P] [US1] 创建相似度计算工具类 (Levenshtein distance)
- [ ] T006 [US1] 扩展 RecitationProvider 添加语音识别状态管理
- [ ] T007 [US1] 修改 RecitationPage UI 添加录音按钮和状态显示
- [ ] T008 [US1] 实现播放发音 → 录音 → 识别的完整流程
- [ ] T009 [US1] 实现识别结果处理和正确次数更新

---

## Phase 4: US2 - 发音评估反馈

- [ ] T010 [US2] 实现 FeedbackLevel 枚举和显示逻辑
- [ ] T011 [US2] 添加不同反馈等级的 UI 显示（图标+文字）
- [ ] T012 [US2] 实现多次重试逻辑和最大重试次数处理

---

## Phase 5: US3 - 跳过功能

- [ ] T013 [US3] 验证现有跳过功能与语音识别流程的集成
- [ ] T014 [US3] 确保跳过后正确次数不变

---

## Phase 6: 收尾与横切关注点

- [ ] T015 测试完整背诵流程并验证所有成功标准

---

## 实现策略

### MVP 范围 (US1 核心功能)

首批实现将专注于 US1 的核心流程：
- T001, T002, T003 (设置+基础)
- T004, T005 (服务层)
- T006, T007, T008, T009 (UI + 状态 + 流程)

这 8 个任务完成后，应用应该能够：
1. 点击按钮播放单词发音
2. 录音用户发音
3. 使用语音识别评估
4. 根据相似度更新正确次数

### 增量交付

- **增量 1**: 基础设置 + 服务层 → 可测试语音识别服务
- **增量 2**: Provider + 状态 → 可测试状态管理
- **增量 3**: UI 修改 → 可测试完整用户流程
- **增量 4**: 反馈 + 跳过 → 完整功能

---

## 关键文件路径

| 任务 | 文件路径 |
|------|----------|
| T001 | `kids_vocab_app/pubspec.yaml` |
| T002 | `kids_vocab_app/ios/Runner/Info.plist`, `kids_vocab_app/android/app/src/main/AndroidManifest.xml` |
| T003 | `kids_vocab_app/lib/domain/entities/learning_settings.dart` |
| T004 | `kids_vocab_app/lib/services/speech_recognition_service.dart` (新建) |
| T005 | `kids_vocab_app/lib/core/utils/similarity_calculator.dart` (新建) |
| T006 | `kids_vocab_app/lib/presentation/providers/recitation_provider.dart` |
| T007 | `kids_vocab_app/lib/presentation/pages/recitation_page.dart` |
| T008-T015 | 现有文件修改或测试文件 |

---

## 验证

每个任务完成后，应验证：
1. 代码能够编译 (`flutter analyze`)
2. 单元测试通过 (`flutter test`)
3. 功能可通过 UI 测试验证