// 状态管理
const state = {
  words: [],
  settings: {
    correctThreshold: 3,
    waitTime: 3,
    similarityThreshold: 80
  },
  studyIndex: 0,
  studyWords: [],
  stats: {
    total: 0,
    correct: 0,
    skip: 0
  },
  editingWordId: null,
  isSpeaking: false,
  isRecording: false,
  mediaRecorder: null,
  audioChunks: [],
  recognition: null,
  retryCount: 0,
  maxRetries: 3,
  recognitionTimeout: null
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 检查语音合成是否可用
  if (!window.speechSynthesis) {
    alert('您的浏览器不支持语音合成功能');
  }

  loadData();
  renderWordsList();
  updateSettingsUI();

  // 预先加载语音（解决某些浏览器的限制）
  speechSynthesis.cancel();
});

// 页面切换
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`${pageId}-page`).classList.add('active');

  if (pageId === 'study') {
    startStudy();
  }
}

// 数据管理
function loadData() {
  const wordsJson = localStorage.getItem('words');
  const settingsJson = localStorage.getItem('settings');

  if (wordsJson) {
    state.words = JSON.parse(wordsJson);
  }

  if (settingsJson) {
    state.settings = JSON.parse(settingsJson);
  }
}

function saveWords() {
  localStorage.setItem('words', JSON.stringify(state.words));
}

function saveSettings() {
  const threshold = parseInt(document.getElementById('correct-threshold').value);
  const waitTime = parseInt(document.getElementById('wait-time').value);

  if (threshold < 1 || threshold > 10) {
    alert('连续正确次数范围：1-10');
    return;
  }

  if (waitTime < 1 || waitTime > 30) {
    alert('等待时间范围：1-30秒');
    return;
  }

  state.settings.correctThreshold = threshold;
  state.settings.waitTime = waitTime;
  localStorage.setItem('settings', JSON.stringify(state.settings));

  alert('设置已保存');
}

function updateSettingsUI() {
  document.getElementById('correct-threshold').value = state.settings.correctThreshold;
  document.getElementById('wait-time').value = state.settings.waitTime;
}

// 单词管理
function renderWordsList() {
  const container = document.getElementById('words-list');

  if (state.words.length === 0) {
    container.innerHTML = '<div class="empty">暂无单词，请添加</div>';
    return;
  }

  container.innerHTML = state.words
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(word => `
      <div class="word-item" data-id="${word.id}">
        <div>
          <div class="word">${word.text}</div>
          <div class="meaning">${word.meaning || '未知'}</div>
          <div class="correct-count">正确次数：${word.correctCount}/${state.settings.correctThreshold}</div>
        </div>
        <div class="actions">
          <button class="edit" onclick="editWord('${word.id}')">编辑</button>
          <button class="delete" onclick="deleteWord('${word.id}')">删除</button>
        </div>
      </div>
    `).join('');
}

function showAddWordModal() {
  state.editingWordId = null;
  document.getElementById('modal-title').textContent = '添加单词';
  document.getElementById('word-input').value = '';
  document.getElementById('word-meaning').textContent = '';
  document.getElementById('word-preview').classList.add('hidden');
  document.getElementById('word-modal').classList.remove('hidden');
}

function editWord(id) {
  const word = state.words.find(w => w.id === id);
  if (!word) return;

  state.editingWordId = id;
  document.getElementById('modal-title').textContent = '编辑单词';
  document.getElementById('word-input').value = word.text;
  document.getElementById('word-meaning').textContent = word.meaning || '';
  document.getElementById('word-preview').classList.remove('hidden');
  document.getElementById('word-modal').classList.remove('hidden');
}

function closeWordModal() {
  document.getElementById('word-modal').classList.add('hidden');
  state.editingWordId = null;
}

async function saveWord() {
  const text = document.getElementById('word-input').value.trim().toLowerCase();

  if (!text) {
    alert('请输入单词');
    return;
  }

  if (!/^[a-zA-Z]+$/.test(text)) {
    alert('只能输入英文字母');
    return;
  }

  // 检查重复
  const exists = state.words.find(w => w.text === text && w.id !== state.editingWordId);
  if (exists) {
    alert('单词已存在');
    return;
  }

  // 获取中文含义（这里用简单的模拟，实际可以用翻译API）
  const meaning = await getWordMeaning(text);

  if (state.editingWordId) {
    // 编辑
    const word = state.words.find(w => w.id === state.editingWordId);
    if (word) {
      word.text = text;
      word.meaning = meaning;
    }
  } else {
    // 添加
    state.words.push({
      id: Date.now().toString(),
      text,
      meaning,
      correctCount: 0,
      createdAt: new Date().toISOString()
    });
  }

  saveWords();
  renderWordsList();
  closeWordModal();
}

async function getWordMeaning(word) {
  // 这里可以用免费的翻译API，暂时返回占位符
  // 实际项目中可以接入百度翻译、有道翻译等API
  const meanings = {
    'apple': '苹果', 'banana': '香蕉', 'orange': '橙子',
    'cat': '猫', 'dog': '狗', 'fish': '鱼', 'bird': '鸟',
    'hello': '你好', 'world': '世界', 'good': '好的'
  };

  return meanings[word] || '点击查看';
}

function deleteWord(id) {
  if (!confirm('确定要删除这个单词吗？')) return;

  state.words = state.words.filter(w => w.id !== id);
  saveWords();
  renderWordsList();
}

// 背诵功能
function startStudy() {
  // 筛选需要学习的单词（未达到掌握标准的）
  state.studyWords = state.words.filter(
    w => w.correctCount < state.settings.correctThreshold
  );

  state.studyIndex = 0;
  state.stats = { total: state.studyWords.length, correct: 0, skip: 0 };

  if (state.words.length === 0) {
    alert('还没有单词，请先添加一些单词吧');
    showPage('words');
    return;
  }

  if (state.studyWords.length === 0) {
    document.getElementById('study-content').classList.add('hidden');
    document.getElementById('study-empty').classList.remove('hidden');
    return;
  }

  document.getElementById('study-content').classList.remove('hidden');
  document.getElementById('study-empty').classList.add('hidden');
  updateStudyProgress();

  // 初始化语音（解决浏览器首次播放限制）
  initSpeech();
}

// 初始化语音 - 在用户首次交互时调用
function initSpeech() {
  // 预加载语音
  loadVoices();

  // 创建一个简短的 utterance 来"唤醒"语音合成
  setTimeout(() => {
    const dummy = new SpeechSynthesisUtterance('a');
    dummy.volume = 0;
    dummy.rate = 1;
    speechSynthesis.speak(dummy);
    speechSynthesis.cancel();
  }, 100);
}

function updateStudyProgress() {
  const progress = document.getElementById('study-progress');
  progress.textContent = `${state.studyIndex + 1}/${state.studyWords.length}`;
}

function playCurrentWord() {
  if (state.isSpeaking) return;

  const word = state.studyWords[state.studyIndex];
  if (!word) return;

  state.isSpeaking = true;
  const statusEl = document.getElementById('word-status');
  statusEl.textContent = '🔊 播放中...';
  statusEl.className = 'word-status playing';

  // 只播放单词发音
  speakWord(word.text, () => {
    state.isSpeaking = false;
    statusEl.textContent = '请选择：会 / 跳过 / 不会';
    statusEl.className = 'word-status';
  });
}

// 获取美式英语语音
function getAmericanVoice() {
  const voices = speechSynthesis.getVoices();
  // 优先选择美式英语
  const usVoice = voices.find(v => v.lang === 'en-US' || v.lang.startsWith('en-US'));
  if (usVoice) {
    console.log('使用美式英语语音:', usVoice.name);
    return usVoice;
  }
  // 如果没有 en-US，尝试其他英语
  return voices.find(v => v.lang.startsWith('en')) || null;
}

function speakText(text, callback) {
  // 先停止之前的播放
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.7;  // 稍慢一些，更清晰
  utterance.pitch = 1;
  utterance.volume = 1;  // 最大音量

  // 使用美式英语语音
  const usVoice = getAmericanVoice();
  if (usVoice) {
    utterance.voice = usVoice;
  }

  utterance.onend = () => {
    if (callback) callback();
  };

  utterance.onerror = (e) => {
    console.error('语音播放错误:', e);
    if (callback) callback();
  };

  speechSynthesis.speak(utterance);
}

function speakWord(word, callback) {
  // 先停止之前的播放
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = 0.6;  // 更慢，方便听清
  utterance.pitch = 1;
  utterance.volume = 1;  // 最大音量

  // 使用美式英语语音
  const usVoice = getAmericanVoice();
  if (usVoice) {
    utterance.voice = usVoice;
  }

  utterance.onend = () => {
    if (callback) callback();
  };

  utterance.onerror = (e) => {
    console.error('语音播放错误:', e);
    if (callback) callback();
  };

  speechSynthesis.speak(utterance);
}

// 预加载语音列表
function loadVoices() {
  const voices = speechSynthesis.getVoices();
  console.log('可用的语音:', voices.map(v => v.lang + ' - ' + v.name).slice(0, 10));
}

// 语音列表加载完成后调用
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = loadVoices;
}

function markWord(correct) {
  const word = state.studyWords[state.studyIndex];
  if (!word) return;

  if (correct) {
    word.correctCount++;
    state.stats.correct++;
  } else {
    word.correctCount = 0;
  }

  saveWords();
  nextWord();
}

function skipWord() {
  state.stats.skip++;
  nextWord();
}

function nextWord() {
  state.studyIndex++;

  if (state.studyIndex >= state.studyWords.length) {
    showStats();
    return;
  }

  updateStudyProgress();

  const statusEl = document.getElementById('word-status');
  statusEl.textContent = '';
  statusEl.className = 'word-status';
}

function showStats() {
  document.getElementById('stat-total').textContent = state.stats.total;
  document.getElementById('stat-correct').textContent = state.stats.correct;
  document.getElementById('stat-skip').textContent = state.stats.skip;
  document.getElementById('stats-modal').classList.remove('hidden');
}

function closeStatsModal() {
  document.getElementById('stats-modal').classList.add('hidden');
  showPage('home');
}

// ==================== 语音识别功能 ====================

// 检查语音识别支持
function checkSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('您的浏览器不支持语音识别功能\n\n请使用 Chrome 浏览器以获得最佳体验');
    return null;
  }
  console.log('浏览器支持 SpeechRecognition');
  console.log('UserAgent:', navigator.userAgent);
  console.log(' SpeechRecognition:', SpeechRecognition);
  return SpeechRecognition;
}

// 初始化语音识别
function initRecognition() {
  const SpeechRecognition = checkSpeechRecognition();
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onerror = (event) => {
    console.error('语音识别错误:', event.error);
    const statusEl = document.getElementById('word-status');

    if (event.error === 'no-speech') {
      statusEl.textContent = '没有听到声音，请再说一次';
    } else if (event.error === 'not-allowed') {
      statusEl.textContent = '请允许麦克风权限';
    } else {
      statusEl.textContent = '识别失败，请重试';
    }

    stopRecordingUI();
  };

  return recognition;
}

// 切换录音状态
async function toggleRecording() {
  // 如果已经在录音中，则忽略（防止重复点击）
  if (state.isRecording) {
    console.log('正在录音中，忽略重复点击');
    return;
  }
  await startRecording();
}

// 开始录音
async function startRecording() {
  const statusEl = document.getElementById('word-status');
  const recordBtn = document.getElementById('record-btn');

  // 显示正在启动
  statusEl.textContent = '🎤 启动录音中...';
  statusEl.className = 'word-status playing';
  recordBtn.disabled = true;

  try {
    // 请求麦克风权限
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('麦克风权限已获得');

    // 初始化 Web Speech API 识别
    const SpeechRecognition = checkSpeechRecognition();
    if (!SpeechRecognition) {
      statusEl.textContent = '浏览器不支持语音识别';
      recordBtn.disabled = false;
      return;
    }

    console.log('启动语音识别...');
    state.recognition = new SpeechRecognition();
    state.recognition.lang = 'en-US';
    state.recognition.continuous = false;
    state.recognition.interimResults = false;

    state.recognition.onstart = () => {
      state.isRecording = true;
      state.retryCount = 0;
      // 不再显示录音中，而是提示用户发音
      statusEl.textContent = '🎤 请现在说出这个单词';
      statusEl.className = 'word-status playing';
      console.log('语音识别已开始');
      recordBtn.disabled = false;

      // 设置超时（8秒）
      state.recognitionTimeout = setTimeout(() => {
        if (state.isRecording) {
          console.log('识别超时');
          statusEl.textContent = '语音识别不可用，请使用"会/不会"按钮';
          stopRecordingUI();
        }
      }, 8000);
    };

    state.recognition.onresult = (event) => {
      console.log('识别事件:', event);
      // 清除超时
      if (state.recognitionTimeout) {
        clearTimeout(state.recognitionTimeout);
        state.recognitionTimeout = null;
      }

      if (event.results.length > 0) {
        const result = event.results[0][0].transcript.toLowerCase().trim();
        const word = state.studyWords[state.studyIndex];
        console.log('识别结果:', result, '目标:', word.text);

        const similarity = calculateSimilarity(result, word.text);
        console.log('相似度:', similarity + '%');

        handleRecognitionResult(result, similarity, word);
      }
    };

    state.recognition.onerror = (event) => {
      // 清除超时
      if (state.recognitionTimeout) {
        clearTimeout(state.recognitionTimeout);
        state.recognitionTimeout = null;
      }

      console.error('识别错误:', event.error, event);
      let message = '';
      switch (event.error) {
        case 'no-speech':
          message = '没有听到声音，请靠近麦克风并大声说';
          break;
        case 'not-allowed':
          message = '请允许麦克风权限';
          break;
        case 'network':
          message = '网络问题（可能需要 VPN）请使用"会/不会"按钮';
          break;
        case 'aborted':
          message = '识别已取消';
          break;
        case 'service-not-allowed':
          message = '语音服务不可用，请使用"会/不会"按钮';
          break;
        default:
          message = '识别失败: ' + event.error + '，请使用按钮';
      }
      statusEl.textContent = message;
      stopRecordingUI();
    };

    state.recognition.onend = () => {
      // 清除超时
      if (state.recognitionTimeout) {
        clearTimeout(state.recognitionTimeout);
        state.recognitionTimeout = null;
      }
      console.log('语音识别已结束');
      stopRecordingUI();
    };

    // 启动识别
    state.recognition.start();
    console.log('已启动语音识别');

  } catch (err) {
    console.error('错误:', err);
    statusEl.textContent = '请允许麦克风权限';
    recordBtn.disabled = false;
    alert('需要麦克风权限才能使用语音识别功能');
  }
}

// 停止录音
function stopRecording() {
  if (state.recognition) {
    state.recognition.stop();
  }
  stopRecordingUI();
}

// 更新录音按钮状态
function updateRecordButton(recording) {
  const btn = document.getElementById('record-btn');
  if (recording) {
    btn.classList.add('recording');
    btn.querySelector('.label').textContent = '结束';
  } else {
    btn.classList.remove('recording');
    btn.querySelector('.label').textContent = '录音';
  }
}

function stopRecordingUI() {
  if (state.recognitionTimeout) {
    clearTimeout(state.recognitionTimeout);
    state.recognitionTimeout = null;
  }
  state.isRecording = false;
  const recordBtn = document.getElementById('record-btn');
  if (recordBtn) {
    recordBtn.disabled = false;
  }
  updateRecordButton(false);
}

// 处理识别结果
function handleRecognitionResult(resultText, similarity, word) {
  const statusEl = document.getElementById('word-status');

  if (similarity >= state.settings.similarityThreshold) {
    // 相似度 >= 80%，正确
    statusEl.textContent = `太棒了！发音很棒！(${Math.round(similarity)}%)`;
    statusEl.className = 'word-status success';
    word.correctCount++;
    state.stats.correct++;
    saveWords();

    setTimeout(() => nextWord(), 1500);
  } else if (similarity >= 50) {
    // 50% - 79%，接近但不够
    statusEl.textContent = `有点接近了，再试试 (${Math.round(similarity)}%)`;
    statusEl.className = 'word-status';
    // 不计为正确，也不归零
  } else {
    // < 50%，不正确
    statusEl.textContent = `再试一次 (${Math.round(similarity)}%)`;
    statusEl.className = 'word-status fail';
    word.correctCount = 0;
    saveWords();
  }
}

// 计算两个字符串的相似度 (Levenshtein 距离)
function calculateSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().replace(/[^a-z]/g, '');
  const s2 = str2.toLowerCase().replace(/[^a-z]/g, '');

  if (s1 === s2) return 100;

  const len1 = s1.length;
  const len2 = s2.length;
  const matrix = [];

  // 初始化矩阵
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // 填充矩阵
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  const similarity = ((maxLen - distance) / maxLen) * 100;

  return Math.max(0, Math.min(100, similarity));
}