# 快速开始指南: 语音录音背诵功能

**功能**: 002-voice-recitation
**日期**: 2026-05-12

---

## 功能概述

语音录音背诵功能允许孩子通过实际开口发音来学习英语单词。流程如下：
1. 点击"录音"按钮开始录音
2. 录音过程中，"录音"按钮变为"结束"按钮
3. 点击"结束"按钮停止录音
4. 用户通过"会/不会"按钮手动评估自己的发音

---

## 测试场景

### 场景 1: 完整的录音背诵流程

**前置条件**:
- 应用中已有至少 1 个单词
- 已授予麦克风权限

**步骤**:
1. 打开应用，进入背诵页面
2. 点击"录音"按钮
3. 对着麦克风发音（如 "apple"）
4. 点击"结束"按钮停止录音
5. 点击"会"或"不会"按钮评估

**预期结果**:
- 录音成功开始
- 按钮从"录音"变为"结束"
- 录音成功停止
- 按钮从"结束"恢复为"录音"
- 点击"会"后正确次数+1，进入下一单词
- 点击"不会"后正确次数归零，进入下一单词

---

### 场景 2: 录音过程中跳过

**前置条件**:
- 正在录音中

**步骤**:
1. 开始录音
2. 点击"跳过"按钮

**预期结果**:
- 录音立即停止
- 正确次数不变
- 进入下一个单词

---

### 场景 3: 录音超时自动停止

**前置条件**:
- 录音超时设置为 60 秒（默认值）

**步骤**:
1. 开始录音
2. 不做任何操作，等待 60 秒

**预期结果**:
- 录音自动停止
- 按钮恢复为"录音"
- 提示用户重新录音

---

### 场景 4: 权限请求流程

**前置条件**:
- 应用首次请求麦克风权限

**步骤**:
1. 首次点击"录音"按钮
2. 系统弹出权限请求

**预期结果**:
- iOS: 显示系统权限对话框
- Android: 显示系统权限对话框
- 拒绝权限后：显示提示，引导用户手动评估
- 授予权限后：正常进行录音

---

### 场景 5: 设置项调整

**前置条件**:
- 进入设置页面

**步骤**:
1. 找到录音相关设置
2. 修改"录音最大时长"为 30 秒
3. 保存设置

**预期结果**:
- 设置成功保存到数据库
- 返回背诵页面后，新设置生效

---

## 运行项目

```bash
# 克隆项目
cd kids_vocab_app

# 获取依赖（需要添加新依赖）
flutter pub add record
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
│   ├── datasources/
│   │   └── database_helper.dart   # 需扩展设置表
│   └── services/
│       └── recording_service.dart # 需新增
├── domain/            # 领域层
│   ├── entities/
│   │   └── recording_session.dart # 需新增
│   └── usecases/
├── presentation/      # 表现层
│   ├── pages/
│   │   └── recitation_page.dart   # 需修改
│   ├── providers/
│   │   └── recording_provider.dart # 需新增
│   └── widgets/
│       └── recording_button.dart  # 需新增
└── main.dart
```

---

## 测试

```bash
# 运行单元测试
flutter test test/unit/

# 运行特定测试
flutter test test/unit/recording_provider_test.dart
```

---

## 依赖项

需要添加到 `pubspec.yaml`:

```yaml
dependencies:
  record: ^5.0.0
  permission_handler: ^11.0.0
```

---

## iOS 配置

在 `ios/Runner/Info.plist` 中添加:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>需要使用麦克风来录制您的发音，以便评估学习效果</string>
```

---

## Android 配置

在 `android/app/src/main/AndroidManifest.xml` 中添加:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
```
