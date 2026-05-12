# 任务清单: 语音录音背诵功能

**功能**: 语音录音背诵功能
**分支**: 002-voice-recitation
**规范**: [spec.md](spec.md)
**计划**: [plan.md](plan.md)

---

## 摘要

| 指标 | 值 |
|------|-----|
| 总任务数 | 14 |
| 用户故事数 | 3 |
| MVP 任务数 | 8 |

---

## 用户故事 → 任务映射

| 用户故事 | 优先级 | 任务数 | 独立测试标准 |
|----------|--------|--------|--------------|
| US1: 语音录音背诵流程 | P1 | 7 | 可以通过完整流程测试：点击"录音"→录音中→点击"结束"→停止→点击"会/不会"→更新正确次数 |
| US2: 发音评估反馈 | P2 | 3 | 可以通过点击"会"或"不会"按钮测试反馈显示 |
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
US1 - 语音录音背诵流程 (Phase 3)
    ├── T003, T004, T005 (基础服务+实体)
    ├── T006, T007, T008 (UI+状态+流程)
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

- [ ] T001 添加依赖到 pubspec.yaml (record, permission_handler)

---

## Phase 2: 基础（阻塞性前置条件）

- [ ] T002 [P] 配置 iOS 麦克风权限 (Info.plist 添加 NSMicrophoneUsageDescription)
- [ ] T003 [P] 配置 Android 麦克风权限 (AndroidManifest.xml 添加 RECORD_AUDIO)
- [ ] T004 扩展 LearningSettings 实体添加录音设置项 (recordingMaxSeconds)

---

## Phase 3: US1 - 语音录音背诵流程

- [ ] T005 [P] [US1] 创建 RecordingSession 实体类 in lib/domain/entities/recording_session.dart
- [ ] T006 [P] [US1] 创建 RecordingStatus 枚举 in lib/domain/entities/recording_session.dart
- [ ] T007 [P] [US1] 创建 AssessmentType 枚举 in lib/domain/entities/recording_session.dart
- [ ] T008 [US1] 创建 RecordingService 服务类 in lib/data/services/recording_service.dart
- [ ] T009 [US1] 创建 RecordingProvider 状态管理 in lib/presentation/providers/recording_provider.dart
- [ ] T010 [US1] 创建 RecordingButton 组件 in lib/presentation/widgets/recording_button.dart
- [ ] T011 [US1] 修改 RecitationScreen 集成录音功能 in lib/presentation/screens/recitation_screen.dart

---

## Phase 4: US2 - 发音评估反馈

- [ ] T012 [US2] 实现评估按钮 UI ("会"/"不会"按钮) in lib/presentation/screens/recitation_screen.dart
- [ ] T013 [US2] 实现点击"会"更新正确次数+1 in lib/presentation/providers/recitation_provider.dart
- [ ] T014 [US2] 实现点击"不会"正确次数归零 in lib/presentation/providers/recitation_provider.dart

---

## Phase 5: US3 - 跳过功能

- [ ] T015 [US3] 验证现有跳过功能与录音流程的集成
- [ ] T016 [US3] 确保录音中点击跳过时停止录音且正确次数不变

---

## Phase 6: 收尾与横切关注点

- [ ] T017 录音超时自动停止逻辑 in lib/data/services/recording_service.dart
- [ ] T018 测试完整背诵流程并验证所有成功标准

---

## 实现策略

### MVP 范围 (US1 核心功能)

首批实现将专注于 US1 的核心流程：
- T001, T002, T003, T004 (设置+基础)
- T005, T006, T007 (实体层)
- T008, T009, T010, T011 (服务+状态+UI)

这 11 个任务完成后，应用应该能够：
1. 点击"录音"按钮开始录音
2. 按钮从"录音"变为"结束"
3. 点击"结束"按钮停止录音
4. 按钮从"结束"恢复为"录音"
5. 显示"会/不会"评估按钮

### 增量交付

- **增量 1**: 基础设置 (T001-T004) → 可添加依赖和配置权限
- **增量 2**: 实体层 (T005-T007) → 可创建数据模型
- **增量 3**: 服务层 (T008) → 可测试录音服务
- **增量 4**: 状态管理 (T009) → 可测试状态切换
- **增量 5**: UI 组件 (T010-T011) → 可测试完整录音流程
- **增量 6**: 评估反馈 (T012-T014) → 完整功能
- **增量 7**: 跳过功能 (T015-T016) → 完整功能
- **增量 8**: 收尾 (T017-T018) → 完善

---

## 并行执行示例

以下任务可以并行执行（在不影响的前提下）：

1. **Phase 2 中的 T002 和 T003**: iOS 和 Android 权限配置可以同时进行
2. **Phase 3 中的 T005, T006, T007**: 实体类创建可以并行（不同文件）
3. **Phase 3 中的 T008, T009**: 服务和 Provider 可以并行开发（通过接口解耦）

---

## 关键文件路径

| 任务 | 文件路径 |
|------|----------|
| T001 | `pubspec.yaml` |
| T002 | `ios/Runner/Info.plist` |
| T003 | `android/app/src/main/AndroidManifest.xml` |
| T004 | `lib/domain/entities/learning_settings.dart` |
| T005-T007 | `lib/domain/entities/recording_session.dart` |
| T008 | `lib/data/services/recording_service.dart` |
| T009 | `lib/presentation/providers/recording_provider.dart` |
| T010 | `lib/presentation/widgets/recording_button.dart` |
| T011 | `lib/presentation/screens/recitation_screen.dart` |
| T012-T014 | `lib/presentation/screens/recitation_screen.dart`, `recitation_provider.dart` |
| T015-T016 | `lib/presentation/screens/recitation_screen.dart` |
| T017-T018 | 服务层和测试 |

---

## 验证

每个任务完成后，应验证：
1. 代码能够编译 (`flutter analyze`)
2. 单元测试通过 (`flutter test`)
3. 功能可通过 UI 测试验证
