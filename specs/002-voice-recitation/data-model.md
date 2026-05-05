# 数据模型: 语音识别背诵功能

**功能**: 002-voice-recitation
**日期**: 2026-05-05

---

## 实体

### 1. Word (已有，扩展)

现有 `Word` 实体保持不变，但增加了与语音识别相关的状态管理。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 唯一标识 |
| spelling | String | 单词拼写 |
| meaning | String | 中文含义 |
| correctCount | int | 连续正确次数 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### 2. LearningSettings (扩展)

现有 `LearningSettings` 实体扩展，新增语音识别相关设置。

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| correctThreshold | int | 3 | 连续正确次数阈值 |
| waitTimeSeconds | int | 3 | 等待时间（秒）|
| voiceSimilarityThreshold | int | 80 | 语音识别相似度阈值 (%) |
| voiceRecordingMaxSeconds | int | 5 | 录音最大时长（秒）|
| voiceMaxRetries | int | 3 | 最大重试次数 |

### 3. VoiceRecognitionResult (新增)

语音识别结果数据结构。

| 字段 | 类型 | 说明 |
|------|------|------|
| recognizedText | String | 识别的文本 |
| similarity | double | 与目标单词的相似度 (0-100) |
| isMatch | bool | 是否匹配（≥相似度阈值）|
| feedbackLevel | FeedbackLevel | 反馈等级 |
| timestamp | DateTime | 识别时间 |

### 4. FeedbackLevel (枚举)

| 值 | 相似度范围 | 显示文本 |
|-----|-----------|----------|
| excellent | ≥80% | "太棒了！" |
| good | 50%-79% | "有点接近了，再试试" |
| poor | <50% | "再试一次" |
| failed | 识别失败 | "没有听清楚，请再说一次" |

---

## 关系

```
Word (1) ←→ (N) VoiceRecognitionResult
  - 一个单词可以有多次发音练习记录
  - VoiceRecognitionResult 关联 Word.id
```

---

## 状态转换

### 背诵流程状态机

```
[空闲]
    │
    ▼ 点击"发音练习"
[播放单词发音]
    │
    ▼ 播放完成
[录音中]
    │
    ▼ 用户点击停止 或 达到最大时长
[识别中]
    │
    ▼ 识别完成
[显示结果] ─────────────────────────────────────────┐
    │                                                  │
    ├─→ 相似度≥80% ──→ [标记为掌握] ──→ [下一单词]      │
    │                                                  │
    ├─→ 50%-79% ──→ [提示再试] ──→ [返回录音]           │
    │                          (计数+1)                │
    │                                                  │
    ├─→ <50% ──→ [提示再试] ──→ [返回录音]              │
    │                          (计数+1)                │
    │                                                  │
    └─→ 识别失败 ──→ [回退手动] ──→ [用户选择会/不会]   │
```

---

## 数据流

1. **录音流程**: 用户点击 → TTS播放 → 录音 → 语音识别 → 相似度计算 → 结果处理
2. **设置流程**: 设置页面 → 修改语音参数 → 持久化到数据库
3. **统计流程**: 完成背诵 → 更新单词正确次数 → 统计展示

---

## 数据库表扩展

### settings 表（扩展）

```sql
-- 新增字段
ALTER TABLE settings ADD COLUMN voice_similarity_threshold INTEGER DEFAULT 80;
ALTER TABLE settings ADD COLUMN voice_recording_max_seconds INTEGER DEFAULT 5;
ALTER TABLE settings ADD COLUMN voice_max_retries INTEGER DEFAULT 3;
```

### voice_recognition_results 表（可选，用于统计分析）

```sql
CREATE TABLE voice_recognition_results (
  id TEXT PRIMARY KEY,
  word_id TEXT NOT NULL,
  recognized_text TEXT,
  similarity REAL,
  is_match INTEGER,
  feedback_level TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (word_id) REFERENCES words(id)
);
```

**注意**: 此表为可选，用于后续统计分析。当前 MVP 可不持久化每次识别结果。