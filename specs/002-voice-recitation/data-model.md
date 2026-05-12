# 数据模型: 语音录音背诵功能

**功能**: 002-voice-recitation
**日期**: 2026-05-12

---

## 实体

### 1. Word (已有，扩展)

现有 `Word` 实体保持不变，用于单词背诵学习。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 唯一标识 |
| spelling | String | 单词拼写 |
| meaning | String | 中文含义 |
| correctCount | int | 连续正确次数 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### 2. LearningSettings (扩展)

现有 `LearningSettings` 实体扩展，新增录音相关设置。

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| correctThreshold | int | 3 | 连续正确次数阈值 |
| waitTimeSeconds | int | 3 | 等待时间（秒）|
| recordingMaxSeconds | int | 60 | 录音最大时长（秒）|

### 3. RecordingSession (新增)

录音会话记录用户每次录音的状态。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 唯一标识 (UUID) |
| wordId | String | 关联的单词 ID |
| status | RecordingStatus | 录音状态 |
| startedAt | DateTime | 开始时间 |
| stoppedAt | DateTime | 结束时间（可选）|
| filePath | String? | 录音文件路径（临时）|
| assessment | AssessmentType? | 评估结果（会/不会/跳过）|

### 4. RecordingStatus (枚举)

| 值 | 说明 |
|-----|------|
| idle | 空闲状态 |
| recording | 录音中 |
| stopped | 录音已停止，等待评估 |

### 5. AssessmentType (枚举)

| 值 | 说明 |
|-----|------|
| correct | 用户点击"会"，正确次数+1 |
| incorrect | 用户点击"不会"，正确次数归零 |
| skipped | 用户点击"跳过"，正确次数不变 |

---

## 关系

```
Word (1) ←→ (N) RecordingSession
  - 一个单词可以有多次录音练习记录
  - RecordingSession 关联 Word.id
```

---

## 状态转换

### 背诵流程状态机

```
[空闲]
    │
    ▼ 点击"录音"
[录音中] ─────────────────────────────┐
    │                                   │
    │ 用户点击"结束"                    │
    ▼                                   │
[录音停止]                              │
    │                                   │
    ├─→ 用户点击"会" ──→ [正确次数+1] ──→ [下一单词]
    │
    ├─→ 用户点击"不会" ──→ [正确次数归零] ──→ [下一单词]
    │
    └─→ 用户点击"跳过" ──→ [正确次数不变] ──→ [下一单词]
         │
         ├─→ 录音中点击 ──→ [停止录音] ──→ [下一单词]
         │
         └─→ 超时自动停止 ──→ [录音停止] ──→ [等待评估]
```

---

## 数据流

1. **录音流程**: 用户点击"录音" → 开始录音 → 用户点击"结束" → 停止录音 → 用户选择评估
2. **设置流程**: 设置页面 → 修改录音参数 → 持久化到数据库
3. **评估流程**: 用户选择会/不会/跳过 → 更新单词正确次数 → 进入下一单词

---

## 数据库表扩展

### settings 表（扩展）

```sql
-- 新增字段
ALTER TABLE settings ADD COLUMN recording_max_seconds INTEGER DEFAULT 60;
```

### recording_sessions 表（可选，用于统计分析）

```sql
CREATE TABLE recording_sessions (
  id TEXT PRIMARY KEY,
  word_id TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  stopped_at TEXT,
  assessment TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (word_id) REFERENCES words(id)
);
```

**注意**: 此表为可选，用于后续统计分析。当前 MVP 可不持久化每次录音会话。

---

## UI 交互契约

### 录音按钮状态

| 状态 | 按钮文字 | 可点击 |
|------|---------|--------|
| idle | "录音" | ✅ |
| recording | "结束" | ✅ |
| stopped | "录音" | ✅ |

### 评估按钮可见性

| 状态 | "会"按钮 | "不会"按钮 | "跳过"按钮 |
|------|---------|-----------|-----------|
| idle | ❌ | ❌ | ✅ |
| recording | ❌ | ❌ | ✅ (停止录音后跳过) |
| stopped | ✅ | ✅ | ✅ |
