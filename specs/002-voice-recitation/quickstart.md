# 快速开始指南: 语音识别背诵功能

**功能**: 002-voice-recitation
**日期**: 2026-05-05

---

## 功能概述

语音识别背诵功能允许孩子通过实际开口发音来学习英语单词。点击"发音练习"按钮后：
1. 系统播放单词标准发音
2. 用户点击开始录音，再次点击停止
3. 系统使用语音识别评估发音
4. 根据相似度给出反馈并更新掌握状态

---

## 测试场景

### 场景 1: 完整的语音识别背诵流程

**前置条件**:
- 应用中已有至少 1 个单词
- 已授予麦克风权限

**步骤**:
1. 打开应用，进入背诵页面
2. 点击"发音练习"按钮
3. 等待单词发音播放完毕
4. 再次点击按钮开始录音
5. 对着麦克风发音（如 "apple"）
6. 点击按钮停止录音
7. 观察系统反馈和结果

**预期结果**:
- 单词发音正确播放
- 录音成功开始/停止
- 语音识别返回结果
- 根据相似度显示相应反馈（优秀/接近/再试）
- 正确次数根据结果更新

---

### 场景 2: 识别失败回退到手动模式

**前置条件**:
- 语音识别服务不可用或识别失败

**步骤**:
1. 按照场景1的步骤进行
2. 触发语音识别失败条件

**预期结果**:
- 系统显示"没有听清楚"
- 自动回退到手动模式，显示"会/不会"按钮
- 用户可手动确认掌握状态

---

### 场景 3: 多次重试后跳过

**前置条件**:
- 设置中最大重试次数为 3

**步骤**:
1. 连续 3 次发音不准确（相似度 < 50%）

**预期结果**:
- 第3次识别后自动跳过当前单词
- 显示跳过提示
- 进入下一个单词

---

### 场景 4: 权限请求流程

**前置条件**:
- 应用首次请求麦克风权限

**步骤**:
1. 首次点击"发音练习"按钮
2. 系统弹出权限请求

**预期结果**:
- iOS: 显示系统权限对话框
- Android: 显示系统权限对话框
- 拒绝权限后：显示提示，使用纯手动模式
- 授予权限后：正常进行语音识别

---

### 场景 5: 设置项调整

**前置条件**:
- 进入设置页面

**步骤**:
1. 找到语音识别相关设置
2. 修改"相似度阈值"为 70%
3. 修改"录音最大时长"为 8 秒
4. 保存设置

**预期结果**:
- 设置成功保存到数据库
- 返回背诵页面后，新设置生效

---

## 运行项目

```bash
# 克隆项目
cd kids_vocab_app

# 获取依赖（需要添加新依赖）
flutter pub add speech_to_text
flutter pub add permission_handler

# 获取所有依赖
flutter pub get

# 运行项目
flutter run
```

---

## 项目结构

```
lib/
├── core/              # 核心工具
├── data/              # 数据层
│   └── datasources/
│       └── database_helper.dart   # 需扩展设置表
├── domain/            # 领域层
│   └── entities/
│       └── learning_settings.dart # 需扩展
├── presentation/      # 表现层
│   ├── pages/
│   │   └── recitation_page.dart   # 需大幅修改
│   └── providers/
│       └── recitation_provider.dart # 需大幅修改
├── services/          # 服务层
│   ├── tts_service.dart            # 已有
│   └── speech_recognition_service.dart # 需新增
└── main.dart
```

---

## 测试

```bash
# 运行单元测试
flutter test test/unit/

# 运行特定测试
flutter test test/unit/recitation_provider_test.dart
```

---

## 依赖项

需要添加到 `pubspec.yaml`:

```yaml
dependencies:
  speech_to_text: ^7.0.0
  permission_handler: ^11.3.0
```

---

## iOS 配置

在 `ios/Runner/Info.plist` 中添加:

```xml
<key>NSSpeechRecognitionUsageDescription</key>
<string>用于识别您的发音来评估单词掌握情况</string>
<key>NSMicrophoneUsageDescription</key>
<string>用于录制您的发音</string>
```

---

## Android 配置

在 `android/app/src/main/AndroidManifest.xml` 中添加:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
```