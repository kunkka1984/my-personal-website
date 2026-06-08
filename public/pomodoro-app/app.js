/**
 * Focus Flow - 极美番茄钟核心逻辑
 * 包含：双模式状态机、随机数生成算法、Web Audio API 合成器
 */

// -------------------------------------------------------------
// 1. 状态管理与配置项
// -------------------------------------------------------------
const CONFIG = {
    // 经典模式参数 (分钟)
    classic: {
        work: 25,
        break: 5
    },
    // 胡伯曼模式参数范围 (分钟)
    huberman: {
        workMin: 15,
        workMax: 35,
        breakMin: 1,
        breakMax: 3
    },
    // 音频设置
    audio: {
        volume: 0.7,
        sound: 'bowl'
    }
};

let timer = {
    mode: 'classic',        // 'classic' | 'huberman'
    state: 'idle',          // 'idle' | 'work' | 'break' | 'chill' (chill 代表胡伯曼放空休整)
    timeLeft: 0,            // 当前阶段剩余秒数
    totalDuration: 0,       // 当前阶段总秒数 (用于计算进度条)
    isRunning: false,       // 运行状态
    intervalId: null,       // 定时器 ID
    hubermanCyclesCompleted: 0, // 已完成的胡伯曼循环数
    hideCountdown: false    // 是否隐藏倒计时数字 (用于彻底消除时钟焦虑)
};

// SVG 圆环参数 (R = 88 => 周长约 552.92)
const CIRCUMFERENCE = 2 * Math.PI * 88;

// -------------------------------------------------------------
// 2. DOM 节点获取
// -------------------------------------------------------------
const dom = {
    ambientBg: document.getElementById('ambientBg'),
    appTitle: document.getElementById('appTitle'),
    openSettingsBtn: document.getElementById('openSettingsBtn'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    settingsOverlay: document.getElementById('settingsOverlay'),
    settingsDrawer: document.getElementById('settingsDrawer'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),

    tabClassic: document.getElementById('tabClassic'),
    tabHuberman: document.getElementById('tabHuberman'),
    modeSlider: document.getElementById('modeSlider'),

    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    progressRingBar: document.getElementById('progressRingBar'),
    timeCountdown: document.getElementById('timeCountdown'),
    timeCountdownContainer: document.getElementById('timeCountdownContainer'),
    timeHiddenLabel: document.getElementById('timeHiddenLabel'),
    eyeToggleBtn: document.getElementById('eyeToggleBtn'),
    eyeOpenIcon: document.getElementById('eyeOpenIcon'),
    eyeClosedIcon: document.getElementById('eyeClosedIcon'),
    eyeToggleText: document.getElementById('eyeToggleText'),

    hubermanInfo: document.getElementById('hubermanInfo'),
    hubermanCycles: document.getElementById('hubermanCycles'),

    resetBtn: document.getElementById('resetBtn'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    playIcon: document.getElementById('playIcon'),
    pauseIcon: document.getElementById('pauseIcon'),
    skipBtn: document.getElementById('skipBtn'),

    // 设置项控件
    inputClassicWork: document.getElementById('inputClassicWork'),
    valClassicWork: document.getElementById('valClassicWork'),
    inputClassicBreak: document.getElementById('inputClassicBreak'),
    valClassicBreak: document.getElementById('valClassicBreak'),

    inputHubermanWorkMin: document.getElementById('inputHubermanWorkMin'),
    valHubermanWorkMin: document.getElementById('valHubermanWorkMin'),
    inputHubermanWorkMax: document.getElementById('inputHubermanWorkMax'),
    valHubermanWorkMax: document.getElementById('valHubermanWorkMax'),
    inputHubermanBreakMin: document.getElementById('inputHubermanBreakMin'),
    valHubermanBreakMin: document.getElementById('valHubermanBreakMin'),
    inputHubermanBreakMax: document.getElementById('inputHubermanBreakMax'),
    valHubermanBreakMax: document.getElementById('valHubermanBreakMax'),

    soundSelect: document.getElementById('soundSelect'),
    volumeSlider: document.getElementById('volumeSlider'),
    valVolume: document.getElementById('valVolume'),

    // 胡伯曼覆盖层
    chillOverlay: document.getElementById('chillOverlay'),
    chillTimer: document.getElementById('chillTimer'),
    chillSkipBtn: document.getElementById('chillSkipBtn')
};

// -------------------------------------------------------------
// 3. Web Audio API 音效合成器 (零音频文件依赖)
// -------------------------------------------------------------
let audioCtx = null;

function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

/**
 * 纯数学模型合成声音，实现空灵与禅意效果
 */
function playSoundNotification() {
    initAudioContext();
    if (!audioCtx) return;

    const volume = CONFIG.audio.volume;
    const soundType = CONFIG.audio.sound;
    const dest = audioCtx.destination;

    // 创建主音量节点
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.8, audioCtx.currentTime);
    masterGain.connect(dest);

    if (soundType === 'bowl') {
        // --------------------------------------------------
        // 空灵藏磬 (Bowl Sound): 模拟金属磬磬钵振动
        // 磬声是由基音与若干个非整数倍的谐音（Partials）缓慢衰减叠加而成
        // --------------------------------------------------
        const baseFreq = 160; // 基音 160Hz 深沉且有厚度
        const partials = [
            { freq: baseFreq, amp: 0.6, decay: 5 },
            { freq: baseFreq * 2.01, amp: 0.3, decay: 4 }, // 微量失谐模拟金属质感
            { freq: baseFreq * 2.98, amp: 0.2, decay: 3 },
            { freq: baseFreq * 4.05, amp: 0.15, decay: 2.5 },
            { freq: baseFreq * 5.92, amp: 0.1, decay: 2 },
            { freq: baseFreq * 8.12, amp: 0.05, decay: 1.5 }
        ];

        partials.forEach(p => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            // 磬声的各分量以正弦波为主，少量高频用三角波混合
            osc.type = p.freq > 500 ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(p.freq, audioCtx.currentTime);

            // 振幅包络：快速淡入，极长且平滑地指数淡出
            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(p.amp, audioCtx.currentTime + 0.08); // 80ms 敲击淡入
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + p.decay);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start();
            osc.stop(audioCtx.currentTime + p.decay + 0.1);
        });

    } else if (soundType === 'muyu') {
        // --------------------------------------------------
        // 禅意木鱼 (Muyu Sound): 短促的中低频木敲击声
        // 频率从高往低快速微落（Pitch Drop），加带通滤波过滤
        // --------------------------------------------------
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = 'sine';
        
        // 敲击瞬间音高从 900Hz 快速跌落至 450Hz，形成木质击打声
        osc.frequency.setValueAtTime(850, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(450, audioCtx.currentTime + 0.05);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(500, audioCtx.currentTime);
        filter.Q.setValueAtTime(4, audioCtx.currentTime);

        // 振幅极快衰减
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + 0.005); // 极快侵入
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18); // 180ms 内衰减完毕

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);

    } else {
        // --------------------------------------------------
        // 温暖电子 (Digital Sound): 温和的合成双音琶音 (E5 -> A5)
        // --------------------------------------------------
        const playNote = (freq, startTime, duration) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(startTime);
            osc.stop(startTime + duration + 0.05);
        };

        // 琶音：E5 (659.25Hz) 先响，180ms 后 A5 (880Hz) 响起
        playNote(659.25, audioCtx.currentTime, 0.8);
        playNote(880.00, audioCtx.currentTime + 0.18, 1.2);
    }
}

// -------------------------------------------------------------
// 4. 倒计时状态机控制
// -------------------------------------------------------------

/**
 * 页面初始化或切换模式时重置计时器
 */
function resetTimer() {
    stopTimerInterval();
    timer.isRunning = false;
    timer.hubermanCyclesCompleted = 0;
    
    if (timer.mode === 'classic') {
        timer.state = 'idle';
        timer.totalDuration = CONFIG.classic.work * 60;
        timer.timeLeft = timer.totalDuration;
        dom.hubermanInfo.classList.add('hidden');
    } else {
        timer.state = 'idle';
        // 胡伯曼模式在开始前，预设最大专注时长
        timer.totalDuration = CONFIG.huberman.workMax * 60;
        timer.timeLeft = timer.totalDuration;
        dom.hubermanInfo.classList.remove('hidden');
        dom.hubermanCycles.textContent = `准备中`;
    }

    updateUI();
}

/**
 * 决定下一次的随机时长 (胡伯曼模式)
 */
function getHubermanRandomDuration(type) {
    if (type === 'work') {
        const min = CONFIG.huberman.workMin;
        const max = CONFIG.huberman.workMax;
        // 在 [min, max] 之间取整分钟，转为秒
        const minutes = Math.floor(Math.random() * (max - min + 1)) + min;
        return minutes * 60;
    } else if (type === 'break') {
        const min = CONFIG.huberman.breakMin;
        const max = CONFIG.huberman.breakMax;
        // 支持半分钟休整 (e.g. 1.5分钟)，以 30 秒为最小刻度
        const stepsMin = min * 2;
        const stepsMax = max * 2;
        const steps = Math.floor(Math.random() * (stepsMax - stepsMin + 1)) + stepsMin;
        return (steps * 30);
    }
    return 0;
}

/**
 * 开始 / 暂停按钮逻辑
 */
function togglePlayPause() {
    initAudioContext();
    if (timer.isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    timer.isRunning = true;

    // 若从 Idle 状态启动，需更新状态为 Work，并在胡伯曼模式下生成第一个随机时间
    if (timer.state === 'idle') {
        timer.state = 'work';
        if (timer.mode === 'huberman') {
            timer.totalDuration = getHubermanRandomDuration('work');
            timer.timeLeft = timer.totalDuration;
            timer.hubermanCyclesCompleted++;
            dom.hubermanCycles.textContent = `第 ${timer.hubermanCyclesCompleted} 轮专注`;
        } else {
            timer.totalDuration = CONFIG.classic.work * 60;
            timer.timeLeft = timer.totalDuration;
        }
    }

    updateUI();
    
    // 启动定时器间隔
    timer.intervalId = setInterval(() => {
        if (timer.timeLeft > 0) {
            timer.timeLeft--;
            updateUI();
        } else {
            // 时间耗尽，触发阶段转换
            handlePhaseTransition();
        }
    }, 1000);
}

function pauseTimer() {
    timer.isRunning = false;
    stopTimerInterval();
    updateUI();
}

function stopTimerInterval() {
    if (timer.intervalId) {
        clearInterval(timer.intervalId);
        timer.intervalId = null;
    }
}

/**
 * 跳过当前倒计时阶段
 */
function skipCurrentPhase() {
    if (timer.state === 'idle') return;
    initAudioContext();
    handlePhaseTransition(true);
}

/**
 * 核心状态转换机制
 */
function handlePhaseTransition(isSkipped = false) {
    stopTimerInterval();

    if (!isSkipped) {
        playSoundNotification(); // 播放提示音
    }

    if (timer.mode === 'classic') {
        // ==========================================
        // 经典模式转换
        // ==========================================
        if (timer.state === 'work') {
            // 专注结束 -> 进入休息
            timer.state = 'break';
            timer.totalDuration = CONFIG.classic.break * 60;
            timer.timeLeft = timer.totalDuration;
        } else if (timer.state === 'break') {
            // 休息结束 -> 回到专注
            timer.state = 'work';
            timer.totalDuration = CONFIG.classic.work * 60;
            timer.timeLeft = timer.totalDuration;
        }
    } else {
        // ==========================================
        // 胡伯曼随机模式转换
        // ==========================================
        if (timer.state === 'work') {
            // 随机专注结束 -> 进入全屏“放空休整”
            timer.state = 'chill';
            timer.totalDuration = getHubermanRandomDuration('break');
            timer.timeLeft = timer.totalDuration;
            
            // 激活放空全屏覆盖层
            dom.chillOverlay.classList.add('active');
            updateChillTimerDisplay();
        } else if (timer.state === 'chill') {
            // 随机放空结束 -> 回到下一次随机专注
            timer.state = 'work';
            timer.totalDuration = getHubermanRandomDuration('work');
            timer.timeLeft = timer.totalDuration;
            timer.hubermanCyclesCompleted++;
            dom.hubermanCycles.textContent = `第 ${timer.hubermanCyclesCompleted} 轮专注`;
            
            // 关闭全屏覆盖层
            dom.chillOverlay.classList.remove('active');
        }
    }

    // 状态切换后，保持运行状态并继续倒计时
    if (timer.isRunning) {
        startTimer();
    } else {
        updateUI();
    }
}

// -------------------------------------------------------------
// 5. UI 渲染与更新
// -------------------------------------------------------------

function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateChillTimerDisplay() {
    dom.chillTimer.textContent = formatTime(timer.timeLeft);
}

function updateUI() {
    const formatted = formatTime(timer.timeLeft);
    
    // 1. 更新主时钟数字与显示状态
    dom.timeCountdown.textContent = formatted;
    if (timer.state === 'chill') {
        updateChillTimerDisplay();
    }

    if (timer.hideCountdown) {
        dom.timeCountdown.classList.add('hidden');
        dom.timeHiddenLabel.classList.remove('hidden');
        dom.eyeOpenIcon.classList.add('hidden');
        dom.eyeClosedIcon.classList.remove('hidden');
        dom.eyeToggleText.textContent = '显示时间';
    } else {
        dom.timeCountdown.classList.remove('hidden');
        dom.timeHiddenLabel.classList.add('hidden');
        dom.eyeOpenIcon.classList.remove('hidden');
        dom.eyeClosedIcon.classList.add('hidden');
        dom.eyeToggleText.textContent = '隐藏时间';
    }

    // 2. 更新浏览器 Tab 标题与控制背景色调
    let stateLabel = '准备';

    if (timer.state === 'work') {
        stateLabel = '专注中';
        dom.ambientBg.style.setProperty('--hue-primary', 230);
        dom.statusDot.className = 'status-dot pulsing';
    } else if (timer.state === 'break') {
        stateLabel = '短休中';
        dom.ambientBg.style.setProperty('--hue-primary', 150);
        dom.statusDot.className = 'status-dot';
    } else if (timer.state === 'chill') {
        stateLabel = '放空中';
        dom.ambientBg.style.setProperty('--hue-primary', 300);
        dom.statusDot.className = 'status-dot pulsing';
    } else {
        dom.statusDot.className = 'status-dot';
        dom.ambientBg.style.setProperty('--hue-primary', 230);
    }

    // 如果隐藏了倒计时，Tab 标题也应同步隐藏时间，彻底避免时钟焦虑
    if (timer.hideCountdown && timer.state !== 'idle' && timer.state !== 'chill') {
        document.title = `[${stateLabel}] Focus Flow - 极美番茄钟`;
    } else {
        document.title = timer.state === 'idle' ? 'Focus Flow' : `[${formatted}] ${stateLabel} - 极美番茄钟`;
    }
    dom.statusText.textContent = stateLabel;

    // 3. 更新圆环进度条
    const progressPercent = (timer.timeLeft / timer.totalDuration) * 100;
    // strokeDashoffset 满值为 CIRCUMFERENCE (代表0进度)，0为满进度
    const offset = (timer.timeLeft / timer.totalDuration) * CIRCUMFERENCE;
    dom.progressRingBar.style.strokeDashoffset = offset;

    // 4. 控制播放/暂停按钮的 SVG 图标切换
    if (timer.isRunning) {
        dom.playIcon.classList.add('hidden');
        dom.pauseIcon.classList.remove('hidden');
    } else {
        dom.playIcon.classList.remove('hidden');
        dom.pauseIcon.classList.add('hidden');
    }

    // 5. 模式切换滑块位置
    if (timer.mode === 'classic') {
        dom.modeSlider.style.left = '4px';
        dom.tabClassic.classList.add('active');
        dom.tabHuberman.classList.remove('active');
    } else {
        dom.modeSlider.style.left = 'calc(50% - 0px)';
        dom.tabClassic.classList.remove('active');
        dom.tabHuberman.classList.add('active');
    }
}

function toggleCountdownVisibility() {
    timer.hideCountdown = !timer.hideCountdown;
    updateUI();
}

// -------------------------------------------------------------
// 6. 设置面板管理与数据存取
// -------------------------------------------------------------

function openSettings() {
    // 载入当前配置到输入项中
    dom.inputClassicWork.value = CONFIG.classic.work;
    dom.valClassicWork.textContent = `${CONFIG.classic.work}m`;
    dom.inputClassicBreak.value = CONFIG.classic.break;
    dom.valClassicBreak.textContent = `${CONFIG.classic.break}m`;

    dom.inputHubermanWorkMin.value = CONFIG.huberman.workMin;
    dom.valHubermanWorkMin.textContent = `${CONFIG.huberman.workMin}m`;
    dom.inputHubermanWorkMax.value = CONFIG.huberman.workMax;
    dom.valHubermanWorkMax.textContent = `${CONFIG.huberman.workMax}m`;
    dom.inputHubermanBreakMin.value = CONFIG.huberman.breakMin;
    dom.valHubermanBreakMin.textContent = `${CONFIG.huberman.breakMin}m`;
    dom.inputHubermanBreakMax.value = CONFIG.huberman.breakMax;
    dom.valHubermanBreakMax.textContent = `${CONFIG.huberman.breakMax}m`;

    dom.soundSelect.value = CONFIG.audio.sound;
    dom.volumeSlider.value = CONFIG.audio.volume;
    dom.valVolume.textContent = `${Math.round(CONFIG.audio.volume * 100)}%`;

    dom.settingsOverlay.classList.add('active');
}

function closeSettings() {
    dom.settingsOverlay.classList.remove('active');
}

function saveSettings() {
    // 1. 获取输入值
    const classicWork = parseInt(dom.inputClassicWork.value);
    const classicBreak = parseInt(dom.inputClassicBreak.value);
    
    const hWorkMin = parseInt(dom.inputHubermanWorkMin.value);
    const hWorkMax = parseInt(dom.inputHubermanWorkMax.value);
    const hBreakMin = parseFloat(dom.inputHubermanBreakMin.value);
    const hBreakMax = parseFloat(dom.inputHubermanBreakMax.value);

    // 2. 校验胡伯曼数值合理性
    if (hWorkMin >= hWorkMax) {
        alert('胡伯曼模式中：最长专注时间必须大于最短专注时间！');
        return;
    }
    if (hBreakMin >= hBreakMax) {
        alert('胡伯曼模式中：最长休整时间必须大于最短休整时间！');
        return;
    }

    // 3. 应用并保存
    CONFIG.classic.work = classicWork;
    CONFIG.classic.break = classicBreak;
    CONFIG.huberman.workMin = hWorkMin;
    CONFIG.huberman.workMax = hWorkMax;
    CONFIG.huberman.breakMin = hBreakMin;
    CONFIG.huberman.breakMax = hBreakMax;
    
    CONFIG.audio.sound = dom.soundSelect.value;
    CONFIG.audio.volume = parseFloat(dom.volumeSlider.value);

    closeSettings();
    playSoundNotification(); // 保存时试听

    // 4. 重置当前计时（避免在倒计时时乱套，如果不运行则直接刷新）
    if (!timer.isRunning) {
        resetTimer();
    }
}

// -------------------------------------------------------------
// 7. 事件绑定与初始化
// -------------------------------------------------------------
function setupEventListeners() {
    // 模式切换
    dom.tabClassic.addEventListener('click', () => {
        if (timer.mode === 'classic') return;
        timer.mode = 'classic';
        resetTimer();
    });
    dom.tabHuberman.addEventListener('click', () => {
        if (timer.mode === 'huberman') return;
        timer.mode = 'huberman';
        resetTimer();
    });

    // 核心按钮
    dom.playPauseBtn.addEventListener('click', togglePlayPause);
    dom.resetBtn.addEventListener('click', () => {
        if (confirm('确定要重置当前番茄钟吗？')) {
            resetTimer();
        }
    });
    dom.skipBtn.addEventListener('click', skipCurrentPhase);

    // 设置面板交互
    dom.openSettingsBtn.addEventListener('click', openSettings);
    dom.closeSettingsBtn.addEventListener('click', closeSettings);
    dom.settingsOverlay.addEventListener('click', (e) => {
        if (e.target === dom.settingsOverlay) closeSettings();
    });
    dom.saveSettingsBtn.addEventListener('click', saveSettings);

    // 放空覆盖层交互
    dom.chillSkipBtn.addEventListener('click', () => {
        if (confirm('确认提前结束这轮记忆休整吗？（为了最好的学习效果，建议坚持放空哦）')) {
            dom.chillOverlay.classList.remove('active');
            handlePhaseTransition(true);
        }
    });

    // 联动设置项滑块值实时变更
    dom.inputClassicWork.addEventListener('input', (e) => {
        dom.valClassicWork.textContent = `${e.target.value}m`;
    });
    dom.inputClassicBreak.addEventListener('input', (e) => {
        dom.valClassicBreak.textContent = `${e.target.value}m`;
    });
    dom.inputHubermanWorkMin.addEventListener('input', (e) => {
        dom.valHubermanWorkMin.textContent = `${e.target.value}m`;
        // 限制最大值滑块不能低于最小值
        if (parseInt(dom.inputHubermanWorkMax.value) <= parseInt(e.target.value)) {
            dom.inputHubermanWorkMax.value = parseInt(e.target.value) + 1;
            dom.valHubermanWorkMax.textContent = `${dom.inputHubermanWorkMax.value}m`;
        }
    });
    dom.inputHubermanWorkMax.addEventListener('input', (e) => {
        dom.valHubermanWorkMax.textContent = `${e.target.value}m`;
        if (parseInt(dom.inputHubermanWorkMin.value) >= parseInt(e.target.value)) {
            dom.inputHubermanWorkMin.value = Math.max(5, parseInt(e.target.value) - 1);
            dom.valHubermanWorkMin.textContent = `${dom.inputHubermanWorkMin.value}m`;
        }
    });
    dom.inputHubermanBreakMin.addEventListener('input', (e) => {
        dom.valHubermanBreakMin.textContent = `${e.target.value}m`;
        if (parseFloat(dom.inputHubermanBreakMax.value) <= parseFloat(e.target.value)) {
            dom.inputHubermanBreakMax.value = parseFloat(e.target.value) + 0.5;
            dom.valHubermanBreakMax.textContent = `${dom.inputHubermanBreakMax.value}m`;
        }
    });
    dom.inputHubermanBreakMax.addEventListener('input', (e) => {
        dom.valHubermanBreakMax.textContent = `${e.target.value}m`;
        if (parseFloat(dom.inputHubermanBreakMin.value) >= parseFloat(e.target.value)) {
            dom.inputHubermanBreakMin.value = Math.max(1, parseFloat(e.target.value) - 0.5);
            dom.valHubermanBreakMin.textContent = `${dom.inputHubermanBreakMin.value}m`;
        }
    });
    dom.volumeSlider.addEventListener('input', (e) => {
        dom.valVolume.textContent = `${Math.round(e.target.value * 100)}%`;
        CONFIG.audio.volume = parseFloat(e.target.value);
    });

    // 隐藏倒计时切换事件
    dom.timeCountdownContainer.addEventListener('click', toggleCountdownVisibility);
    dom.eyeToggleBtn.addEventListener('click', toggleCountdownVisibility);
}

// -------------------------------------------------------------
// 8. 启动运行
// -------------------------------------------------------------
// 预初始化进度条虚线
dom.progressRingBar.style.strokeDasharray = CIRCUMFERENCE;
dom.progressRingBar.style.strokeDashoffset = CIRCUMFERENCE;

// 初始化
setupEventListeners();
resetTimer();
