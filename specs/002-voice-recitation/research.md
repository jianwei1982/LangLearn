# 研究报告: 语音识别背诵功能

**日期**: 2026-05-05
**功能**: 002-voice-recitation
**来源**: 实施计划中的 NEEDS CLARIFICATION

---

## 决策 1: 语音识别库选择

**问题**: 使用哪个语音识别库？

### 选项分析

| 库 | 离线支持 | 平台 | 维护状态 | 儿童应用适合度 |
|------|---------|------|----------|----------------|
| `speech_to_text` | 部分支持（设备依赖）| iOS/Android | 活跃 | ✅ 推荐 |
| `flutter_speech_recognizer` | 是 | 仅 Android | 一般 | ❌ |
| 平台原生 API (SpeechRecognizer/SFSpeechRecognizer) | 需要封装 | 分别实现 | 不适用 | ⚠️ 复杂 |

### 推荐

**选择: `speech_to_text` 插件**

理由：
1. 跨平台统一 API
2. 支持设备级别的离线语音识别（iOS 的 Speech Framework/Android 的 SpeechRecognizer）
3. Flutter 生态中最成熟稳定的语音识别插件
4. 已通过大量项目验证

### 替代方案

如 `speech_to_text` 在特定平台有问题，可回退到使用平台原生 API 封装，但这会增加维护成本。

---

## 决策 2: 离线语音识别能力

**问题**: 语音识别是否需要网络连接？

### 选项分析

| 模式 | 说明 | 优点 | 缺点 |
|------|------|------|------|
| 纯离线 | 使用设备本地语音识别 | 符合宪法原则，无需网络 | 识别准确率可能较低 |
| 纯在线 | 使用云服务 API | 准确率高 | 违反宪法原则1，需要网络 |
| 混合优先 | 优先离线，失败时回退在线 | 最佳体验 | 实现复杂，可能违反隐私原则 |

### 推荐

**选择: 纯离线模式**

理由：
1. 完全符合宪法原则1（完全离线与隐私优先）
2. 宪法假设中明确"初始版本需要网络连接"可以调整
3. 现代移动设备的本地语音识别能力已足够满足儿童英语单词识别需求
4. iOS Speech Recognition 和 Android SpeechRecognizer 都支持离线模式

### 实现策略

- 使用 `speech_to_text` 的本地识别模式
- 在设备不支持离线时，回退到手动模式（用户自行选择"会/不会"）
- 这已在规范澄清中确定（Q1: 自动回退到手动模式）

---

## 决策 3: 权限处理方案

**问题**: 如何处理麦克风和语音识别权限？

### 选项分析

| 方案 | 说明 | 优点 | 缺点 |
|------|------|------|------|
| `permission_handler` | 跨平台权限管理插件 | 统一 API，简单 | 增加依赖 |
| 平台特定代码 | 分别在 iOS/Android 实现 | 无额外依赖 | 代码重复 |
| 混合 | 使用 permission_handler，但自定义 UI | 灵活 | 实现复杂 |

### 推荐

**选择: `permission_handler` 插件**

理由：
1. Flutter 生态中最成熟的权限处理方案
2. 统一处理 iOS（Info.plist）和 Android（AndroidManifest.xml）配置
3. 易于处理"永久拒绝"等边界情况
4. 与 `speech_to_text` 配合良好

### 需要的权限

| 平台 | 权限 | 配置位置 |
|------|------|----------|
| iOS | NSSpeechRecognitionUsageDescription | Info.plist |
| iOS | NSMicrophoneUsageDescription | Info.plist |
| Android | RECORD_AUDIO | AndroidManifest.xml |
| Android | INTERNET (如需在线识别备选) | AndroidManifest.xml |

---

## 决策 4: 相似度比对算法

**问题**: 如何比较用户发音（文本识别结果）与目标单词？

### 选项分析

| 算法 | 说明 | 复杂度 | 准确度 |
|------|------|--------|--------|
| 精确匹配 | 完全相同 | O(n) | 低 |
| 编辑距离 (Levenshtein) | 计算字符差异 | O(n*m) | 中 |
| 模糊匹配 (包含/子串) | 包含关系 | O(n) | 中 |
| 音素相似度 | 发音相似度 | 复杂 | 高 |
| Jaro-Winkler | 字符串相似度 | O(n) | 中高 |

### 推荐

**选择: 编辑距离 (Levenshtein) + 百分比阈值**

理由：
1. 实现简单，标准算法
2. 对于儿童英语单词识别足够（单词短小）
3. 可以快速计算相似度百分比
4. 可以区分"相似但不完全匹配"的情况（如 "appul" vs "apple"）

### 相似度计算公式

```
similarity = (1 - editDistance / maxLength) * 100%
```

其中 maxLength = max(len(recognized), len(target))

---

## 总结

| 决策项 | 推荐选择 | 理由 |
|--------|----------|------|
| 语音识别库 | `speech_to_text` | 跨平台、离线支持、活跃维护 |
| 离线能力 | 纯离线 | 符合宪法原则1 |
| 权限处理 | `permission_handler` | 统一 API、成熟稳定 |
| 相似度算法 | Levenshtein 距离 | 实现简单、足够准确 |