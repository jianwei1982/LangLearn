# 任务: 儿童英语背单词应用

**输入**: 来自 `/specs/001-kids-vocab-app/` 的设计文档
**前置条件**: plan.md(必需), spec.md(用户故事必需)

**组织结构**: 任务按用户故事分组, 以便每个故事能够独立实施和测试.

## 格式: `[ID] [P?] [Story] 描述`

---

## 阶段 1: 设置(共享基础设施)

**目的**: 项目初始化和基本结构

- [ ] T001 创建 Flutter 项目结构 (参照 plan.md 的 lib/ 目录规划)
- [ ] T002 初始化 Flutter 项目，配置 pubspec.yaml 依赖
- [ ] T003 [P] 配置代码检查 (flutter analyze) 和格式化工具 (flutter format)
- [ ] T004 [P] 配置 Riverpod 代码生成 (flutter_riverpod, build_runner)

---

## 阶段 2: 基础(阻塞前置条件)

**目的**: 在任何用户故事可以实施之前必须完成的核心基础设施

**关键**: 在此阶段完成之前, 无法开始任何用户故事工作

- [ ] T005 配置 sqflite_sqlcipher 加密数据库依赖
- [ ] T006 [P] 创建数据库架构和迁移脚本 (words, settings 表)
- [ ] T007 [P] 实施本地加密存储服务 (DatabaseService)
- [ ] T008 创建领域实体 (Word, LearningSettings)
- [ ] T009 实现 TTS 服务接口 (TTSService)
- [ ] T010 实现翻译服务接口 (TranslationService)
- [ ] T011 配置 Riverpod providers 基础架构

**检查点**: 基础就绪 - 现在可以开始并行实施用户故事

---

## 阶段 3: 用户故事 1 - 单词管理 (优先级: P1) 🎯 MVP

**目标**: 家长可以添加、查看、编辑和删除单词

**独立测试**: 通过添加单词 → 查看列表 → 编辑 → 删除的完整流程验证

### 实施任务

- [ ] T012 [P] [US1] 在 lib/domain/entities/word.dart 创建 Word 实体
- [ ] T013 [P] [US1] 在 lib/data/models/word_model.dart 创建 WordModel (DTO)
- [ ] T014 [US1] 在 lib/domain/repositories/word_repository.dart 定义仓库接口
- [ ] T015 [US1] 在 lib/data/repositories/word_repository_impl.dart 实现仓库
- [ ] T016 [US1] 在 lib/domain/usecases/add_word_usecase.dart 实现添加单词用例
- [ ] T017 [US1] 在 lib/domain/usecases/get_words_usecase.dart 实现获取单词列表用例
- [ ] T018 [US1] 在 lib/domain/usecases/update_word_usecase.dart 实现编辑单词用例
- [ ] T019 [US1] 在 lib/domain/usecases/delete_word_usecase.dart 实现删除单词用例
- [ ] T020 [US1] 在 lib/presentation/providers/word_provider.dart 创建 Riverpod provider
- [ ] T021 [US1] 在 lib/presentation/pages/word_list_page.dart 创建单词列表页面
- [ ] T022 [US1] 在 lib/presentation/pages/add_word_page.dart 创建添加单词页面
- [ ] T023 [US1] 在 lib/presentation/pages/edit_word_page.dart 创建编辑单词页面

**检查点**: 用户故事 1 完全功能化 - 可独立添加/查看/编辑/删除单词

---

## 阶段 4: 用户故事 2 - 学习设置管理 (优先级: P2)

**目标**: 家长可以设置连续正确次数阈值和等待时间

**独立测试**: 修改设置 → 退出 → 重新进入，验证设置已保存

### 实施任务

- [ ] T024 [P] [US2] 在 lib/domain/entities/learning_settings.dart 创建 LearningSettings 实体
- [ ] T025 [US2] 在 lib/domain/usecases/get_settings_usecase.dart 实现获取设置用例
- [ ] T026 [US2] 在 lib/domain/usecases/update_settings_usecase.dart 实现更新设置用例
- [ ] T027 [US2] 在 lib/presentation/providers/settings_provider.dart 创建设置 provider
- [ ] T028 [US2] 在 lib/presentation/pages/settings_page.dart 建设置页面

**检查点**: 用户故事 2 完成 - 设置可保存和读取

---

## 阶段 5: 用户故事 3 - 字母背诵模式 (优先级: P1) 🎯 MVP

**目标**: 孩子可以听到单词每个字母的朗读（双字母读作 double）

**独立测试**: 播放 "apple" → 听到 "A-P-Double P-L-E"

### 实施任务

- [ ] T029 [P] [US3] 在 lib/core/utils/letter_speller.dart 实现字母拼读工具类
- [ ] T030 [P] [US3] 在 lib/domain/usecases/spell_word_usecase.dart 实现拼读用例
- [ ] T031 [US3] 在 lib/presentation/providers/recitation_provider.dart 创建背诵状态 provider
- [ ] T032 [US3] 在 lib/presentation/pages/recitation_page.dart 创建背诵页面
- [ ] T033 [US3] 实现字母拼读播放逻辑 (单字母正常读，双字母读 double)

**检查点**: 用户故事 3 完成 - 可以播放字母拼读

---

## 阶段 6: 用户故事 4 - 单词发音播放 (优先级: P1) 🎯 MVP

**目标**: 孩子可以听到单词的标准英语发音

**独立测试**: 点击播放按钮 → 听到单词发音

### 实施任务

- [ ] T034 [P] [US4] 扩展 TTSService 实现单词发音播放
- [ ] T035 [US4] 在 recitation_page.dart 添加播放按钮和发音逻辑
- [ ] T036 [US4] 实现播放控制 (播放/停止/重新播放)

**检查点**: 用户故事 4 完成 - 可以播放单词发音

---

## 阶段 7: 用户故事 5 - 跳过单词 (优先级: P2)

**目标**: 跳过单词时正确次数不变

**独立测试**: 跳过单词 → 该单词正确次数不变

### 实施任务

- [ ] T037 [US5] 在 recitation_page.dart 添加跳过按钮
- [ ] T038 [US5] 实现跳过逻辑 (正确次数不变，进入下一个)

**检查点**: 用户故事 5 完成 - 跳过功能正常

---

## 阶段 8: 用户故事 6 - 智能单词筛选 (优先级: P2)

**目标**: 已掌握单词不再出现

**独立测试**: 单词连续正确3次后，该单词不再出现在背诵列表

### 实施任务

- [ ] T039 [P] [US6] 在 lib/domain/usecases/get_remaining_words_usecase.dart 实现筛选用例
- [ ] T040 [US6] 在 lib/domain/usecases/mark_word_known_usecase.dart 实现标记"会"用例 (正确次数+1)
- [ ] T041 [US6] 在 lib/domain/usecases/mark_word_unknown_usecase.dart 实现标记"不会"用例 (正确次数归零)
- [ ] T042 [US6] 在 recitation_provider.dart 集成筛选逻辑
- [ ] T043 [US6] 实现背诵完成统计显示

**检查点**: 用户故事 6 完成 - 智能筛选正常工作

---

## 阶段 9: 完善与横切关注点

**目的**: 影响多个用户故事的改进

- [ ] T044 [P] 添加单元测试 (单词实体, 字母拼读逻辑, 设置逻辑)
- [ ] T045 [P] 集成测试 (完整背诵流程)
- [ ] T046 性能优化 (音频预加载缓存)
- [ ] T047 安全加固 (数据库加密验证)
- [ ] T048 文档更新 (快速开始指南)

---

## 依赖关系与执行顺序

### 阶段依赖关系

- **设置(阶段1)**: 无依赖 - 可立即开始
- **基础(阶段2)**: 依赖于设置完成 - 阻塞所有用户故事
- **用户故事(阶段3-8)**: 都依赖于基础阶段完成
- **完善(阶段9)**: 依赖于所有用户故事完成

### 用户故事依赖关系

- **用户故事 1 (P1)**: 可在基础后开始 - MVP 核心
- **用户故事 2 (P2)**: 可与 US1 并行 - 独立功能
- **用户故事 3-4 (P1)**: 依赖 US1 的单词数据
- **用户故事 5 (P2)**: 依赖 US3-4
- **用户故事 6 (P2)**: 依赖 US5

### 并行机会

- T003, T004 可以并行 (设置任务)
- T006, T007 可以并行 (数据库任务)
- T012, T013 可以并行 (模型任务)
- 用户故事 1 和 2 可以并行开发

---

## 实施策略

### MVP (用户故事 1-4)

1. 完成阶段1: 设置
2. 完成阶段2: 基础
3. 完成阶段3-6: 用户故事 1-4
4. **验证**: 独立测试核心背诵功能
5. 部署/演示

### 增量交付

1. 设置 + 基础 → 基础就绪
2. 添加 US1-4 (单词管理+背诵核心) → MVP
3. 添加 US5-6 (跳过+筛选) → 完整功能
4. 完善 → 发布

---

**任务版本**: 1.0 | **创建日期**: 2026-05-04