(() => {
  "use strict";

  const canvas = document.querySelector("#diskCanvas");
  const ctx = canvas.getContext("2d");
  const stage = document.querySelector("#diskStage");
  const controlDeck = document.querySelector(".control-deck");
  const resetButton = document.querySelector("#resetButton");
  const soundToggle = document.querySelector("#soundToggle");
  const liveStatus = document.querySelector("#liveStatus span");
  const phaseLabel = document.querySelector("#phaseLabel");
  const progressValue = document.querySelector("#progressValue");
  const progressBar = document.querySelector("#progressBar");
  const operationText = document.querySelector("#operationText");
  const fragmentedValue = document.querySelector("#fragmentedValue");
  const fragmentedLabel = document.querySelector("#fragmentedLabel");
  const movedValue = document.querySelector("#movedValue");
  const elapsedValue = document.querySelector("#elapsedValue");
  const healthValue = document.querySelector("#healthValue");
  const healthRing = document.querySelector("#healthRing");
  const inspectToast = document.querySelector("#inspectToast");
  const clock = document.querySelector("#clock");
  const completionStamp = document.querySelector("#completionStamp");
  const playAgainButton = document.querySelector("#playAgainButton");
  const densityValue = document.querySelector("#densityValue");
  const capacityBar = document.querySelector(".capacity__bar i");
  const speedButtons = [...document.querySelectorAll("[data-speed]")];
  const modeToggle = document.querySelector("#modeToggle");
  const sizeButtons = [...document.querySelectorAll("[data-size]")];
  const menuToggle = document.querySelector("#menuToggle");
  const hudTime = document.querySelector("#hudTime");
  const hudScore = document.querySelector("#hudScore");
  const hudGain = document.querySelector("#hudGain");
  const hudScoreItem = hudScore.closest(".hud-item");
  const stampTime = document.querySelector("#stampTime");
  const stampScore = document.querySelector("#stampScore");
  const deckMenu = document.querySelector("#deckMenu");
  const musicToggle = document.querySelector("#musicToggle");
  const helpToggle = document.querySelector("#helpToggle");
  const introOverlay = document.querySelector("#introOverlay");
  const introStart = document.querySelector("#introStart");
  const introAudio = document.querySelector("#introAudio");
  const langButtons = [...document.querySelectorAll("[data-lang]")];


  /* ==================================================================== I18N
   * 画面に出ることばはすべてここに集める。既定はブラウザの言語設定、
   * 選び直したぶんは localStorage に覚えておく。
   */
  const STRINGS = {
    en: {
      "app.title": "DEFRAG",
      "aria.workspace": "Defrag simulator",
      "aria.canvas": "Data cell field. Arrow keys move, space selects.",
      "aria.metrics": "Field analytics",
      "aria.reshuffle": "Reshuffle",
      "aria.modeGroup": "Control mode",
      "aria.modeManual": "Manual mode. Switch to auto.",
      "aria.modeAuto": "Auto mode. Switch to manual.",
      "aria.speedGroup": "Speed",
      "aria.cellSize": "Cell size. Changing it resets the field.",
      "aria.audioGroup": "Sound",
      "aria.soundOn": "Sound effects on",
      "aria.soundOff": "Sound effects off",
      "aria.musicOn": "Music on",
      "aria.musicOff": "Music off",
      "aria.lang": "Switch language",
      "aria.help": "How to play",
      "field.title": "CURRENT DATA FIELD",
      "field.pool": "FRAGMENT POOL",
      "stamp.small": "DATA FIELD",
      "stamp.strong": "DEFRAGGED",
      "stamp.sub": "ALL COLORS ALIGNED",
      "stamp.again": "PLAY AGAIN",
      "hint.tap": "TAP A BLOCK",
      "metrics.header": "FIELD ANALYTICS",
      "metrics.organization": "ORGANIZATION",
      "metrics.loose": "LOOSE PIECES",
      "metrics.misplaced": "MISPLACED COLORS",
      "metrics.moves": "MERGE / MOVE",
      "metrics.elapsed": "ELAPSED",
      "metrics.density": "DATA DENSITY",
      "metrics.occupied": "OCCUPIED",
      "metrics.available": "AVAILABLE",
      "deck.reshuffle": "RESHUFFLE",
      "deck.mode": "CONTROL MODE",
      "deck.rate": "SPEED",
      "deck.size": "CELL SIZE",
      "deck.sound": "SOUND",
      "deck.lang": "LANGUAGE",
      "deck.help": "HOW TO PLAY",
      "aria.menu": "Settings",
      "footer.note": "NO REAL FILES ARE MOVED",
      "intro.title": "MERGE → FILL → SORT",
      "intro.origin": "You once watched the old Windows defrag screen until it finished. Nothing got done. It was great. Same energy.",
      "intro.s1": "MERGE",
      "intro.s2": "LEFTOVER",
      "intro.s3": "SORT",
      "intro.tip.auto": "AUTO",
      "intro.tip.reset": "RESHUFFLE",
      "intro.tip.keys": "ARROW KEYS",
      "intro.start": "START",
      "intro.close": "CLOSE",
      "color.0": "BLUE",
      "color.1": "GREEN",
      "color.2": "MAGENTA",
      "color.3": "ORANGE",
      "color.free": "FREE",
      "size.1": "SMALL",
      "size.2": "MEDIUM",
      "size.3": "LARGE",
      "state.idle.status": "FIELD READY",
      "state.idle.phase": "AWAITING COMMAND",
      "state.idle.op": "The field is ready.",
      "state.scan.status": "READING FRAGMENTS",
      "state.scan.phase": "MAPPING DATA DENSITY",
      "state.scan.op": "Measuring free capacity ...",
      "state.pick.status": "AWAITING CELL SELECTION",
      "state.fill.status": "FILLING CURRENT CELL",
      "state.swap.status": "SWAPPING COLOR CELLS",
      "state.pause.status": "PROCESS PAUSED",
      "state.pause.phase": "CONSOLIDATION PAUSED",
      "state.pause.op": "The fragment map has been preserved.",
      "state.verify.status": "VERIFYING FIELD",
      "state.verify.phase": "LOCKING DATA IN PLACE",
      "state.verify.op": "Checking the final boundaries ...",
      "state.done.status": "COLOR FIELD GROUPED",
      "state.done.phase": "FILL AND SWAP COMPLETE",
      "state.done.op": "Every cell is full and all four colors are aligned.",
      "phase.pickTarget": "SELECT SOURCE, THEN TARGET",
      "phase.pickSwap": "SELECT TWO CELLS TO SWAP",
      "phase.filling": "FILLING CELL {n} / {total}",
      "phase.grouping": "GROUPING {color}",
      "op.reset": "Reset the field to start again.",
      "op.groupStart": "All cells reached 100%. Starting the color pass ...",
      "toast.source": "SRC {n} · {pct}% · {color}",
      "toast.sourceFull": "FULL {n} · TAP TO SWAP",
      "toast.leftover": "LEFTOVER {pct}% · NOW SELECTED",
      "toast.cancel": "CANCELLED",
      "toast.swapPick": "SWAP {n} · PICK PARTNER",
      "toast.alreadyFull": "{n} WAS ALREADY 100%",
      "toast.free": "{n} · FREE",
      "toast.block": "{n} · {color} {pct}%",
      "toast.cellSize": "{size} · {total} BLOCKS",
      "reject.empty": "EMPTY CELL",
      "reject.full": "ALREADY FULL",
      "reject.color": "{color} ONLY",
      "confirm.cellSize": "Changing cell size restarts the field. Continue?"
    },
    ja: {
      "app.title": "DEFRAG",
      "aria.workspace": "デフラグ シミュレーター",
      "aria.canvas": "データセル盤面。矢印キーで移動、スペースキーで選択。",
      "aria.metrics": "フィールド解析",
      "aria.reshuffle": "作りなおす",
      "aria.modeGroup": "操作モード",
      "aria.modeManual": "手動モード。自動へ切り替え",
      "aria.modeAuto": "自動モード。手動へ切り替え",
      "aria.speedGroup": "速度",
      "aria.cellSize": "マスの大きさ。変えると盤面を作りなおします",
      "aria.audioGroup": "サウンド",
      "aria.soundOn": "効果音オン",
      "aria.soundOff": "効果音オフ",
      "aria.musicOn": "BGMオン",
      "aria.musicOff": "BGMオフ",
      "aria.lang": "言語を切り替え",
      "aria.help": "遊び方",
      "field.title": "現在のデータ領域",
      "field.pool": "フラグメント",
      "stamp.small": "データ領域",
      "stamp.strong": "デフラグ完了",
      "stamp.sub": "4色そろいました",
      "stamp.again": "もう一度",
      "hint.tap": "タップで確認",
      "metrics.header": "フィールド解析",
      "metrics.organization": "整列度",
      "metrics.loose": "かけら",
      "metrics.misplaced": "色ちがい",
      "metrics.moves": "移動・合流",
      "metrics.elapsed": "経過",
      "metrics.density": "データ密度",
      "metrics.occupied": "使用中",
      "metrics.available": "空き",
      "deck.reshuffle": "作りなおす",
      "deck.mode": "操作モード",
      "deck.rate": "速度",
      "deck.size": "マスの大きさ",
      "deck.sound": "サウンド",
      "deck.lang": "言語",
      "deck.help": "遊び方",
      "aria.menu": "設定",
      "footer.note": "実際のファイルは動きません",
      "intro.title": "寄せる → 満たす → そろえる",
      "intro.origin": "昔の Windows のデフラグ画面、終わるまで見てましたよね。仕事は1ミリも進まないのに、なぜか満たされた あの時間です。",
      "intro.s1": "寄せる",
      "intro.s2": "余り",
      "intro.s3": "そろえる",
      "intro.tip.auto": "自動",
      "intro.tip.reset": "作りなおす",
      "intro.tip.keys": "矢印キー",
      "intro.start": "スタート",
      "intro.close": "とじる",
      "color.0": "青",
      "color.1": "緑",
      "color.2": "紫",
      "color.3": "橙",
      "color.free": "空き",
      "size.1": "小",
      "size.2": "中",
      "size.3": "大",
      "state.idle.status": "準備完了",
      "state.idle.phase": "コマンド待ち",
      "state.idle.op": "盤面の準備ができました。",
      "state.scan.status": "かけらを読取中",
      "state.scan.phase": "密度を計測中",
      "state.scan.op": "空き容量を計測しています ...",
      "state.pick.status": "セル選択待ち",
      "state.fill.status": "セルを充填中",
      "state.swap.status": "色を入れかえ中",
      "state.pause.status": "一時停止",
      "state.pause.phase": "統合を一時停止",
      "state.pause.op": "いまの配置を保持しました。",
      "state.verify.status": "検証中",
      "state.verify.phase": "データを確定中",
      "state.verify.op": "境界を確認しています ...",
      "state.done.status": "整列完了",
      "state.done.phase": "充填・入れかえ完了",
      "state.done.op": "すべて満タン、4色そろいました。",
      "phase.pickTarget": "元 → 先の順にタップ",
      "phase.pickSwap": "2つ選んで入れかえ",
      "phase.filling": "充填中 {n} / {total}",
      "phase.grouping": "{color}をそろえ中",
      "op.reset": "作りなおすと再開できます。",
      "op.groupStart": "全マス100%。色そろえに入ります ...",
      "toast.source": "元 {n} · {pct}% · {color}",
      "toast.sourceFull": "満 {n} · 入れかえ先を選択",
      "toast.leftover": "余り {pct}% · 選択中",
      "toast.cancel": "取消",
      "toast.swapPick": "入れかえ {n} · 相手を選択",
      "toast.alreadyFull": "{n} はすでに100%",
      "toast.free": "{n} · 空き",
      "toast.block": "{n} · {color} {pct}%",
      "toast.cellSize": "{size} · {total} マス",
      "reject.empty": "空のセル",
      "reject.full": "すでに満タン",
      "reject.color": "{color}のみ",
      "confirm.cellSize": "マスの大きさを変えると盤面を作りなおします。よろしいですか？"
    }
  };

  /* 一度きめた設定は覚えておく。言語だけは起動前に要るので別のキーにする */
  const SETTINGS_KEY = "blockshift.settings";
  const LANG_KEY = "blockshift.lang";

  const settings = { speed: 1, cellScale: 3, sound: true, music: true };

  function loadSettings() {
    let raw = null;
    try { raw = localStorage.getItem(SETTINGS_KEY); } catch (error) { return; }
    if (!raw) return;
    try {
      const stored = JSON.parse(raw);
      if ([0.5, 1, 4].includes(stored.speed)) settings.speed = stored.speed;
      if ([1, 2, 3].includes(stored.cellScale)) settings.cellScale = stored.cellScale;
      if (typeof stored.sound === "boolean") settings.sound = stored.sound;
      if (typeof stored.music === "boolean") settings.music = stored.music;
    } catch (error) { /* 壊れていたら既定のまま */ }
  }

  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (error) { /* 保存できなくても続ける */ }
  }
  let lang = "en";

  function detectLanguage() {
    let stored = null;
    try { stored = localStorage.getItem(LANG_KEY); } catch (error) { /* 保存できない環境もある */ }
    if (stored && STRINGS[stored]) return stored;
    const candidates = navigator.languages || [navigator.language || "en"];
    return candidates.some((tag) => String(tag).toLowerCase().startsWith("ja")) ? "ja" : "en";
  }

  function t(key, vars) {
    const text = STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match));
  }

  const colorName = (colorId) => t(`color.${colorId}`);
  const cellNo = (index) => String(index).padStart(3, "0");

  function applyLanguage(next) {
    lang = STRINGS[next] ? next : "en";
    try { localStorage.setItem(LANG_KEY, lang); } catch (error) { /* 保存できなくても続ける */ }
    document.documentElement.lang = lang;
    document.title = t("app.title");
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t(el.dataset.i18nAria));
    });
    langButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.lang === lang));
    fragmentedLabel.textContent = t(phase === "group" ? "metrics.misplaced" : "metrics.loose");
    introStart.textContent = t(introMode === "start" ? "intro.start" : "intro.close");
    syncAudioLabels();
    updateModeButtons();
    setState(state);
    updateStats(state === "complete");
  }

  const DESKTOP_COLS = 48;
  const DESKTOP_ROWS = 20;
  const MOBILE_ROWS = 40;
  const MAX_CELL_SIDE = 92;
  const BASE_DENSITY = 520 / (DESKTOP_COLS * DESKTOP_ROWS);
  const COLOR_COUNT = 4;
  let COLS = DESKTOP_COLS;
  let ROWS = DESKTOP_ROWS;
  let TOTAL = COLS * ROWS;
  let TARGET_CELLS = 520;
  let COLOR_ROWS = [3, 3, 3, 2];
  let groupOrder = [0, 1, 2, 3];
  const EPSILON = 0.00001;
  const FIT_EPSILON = 0.0005;
  const DATA_SHADES = ["#3296ff", "#54df65", "#d85cff", "#ff9738"];

  let cells = [];
  let state = "idle";
  let controlMode = "manual";
  let phase = "fill";
  let currentTarget = 0;
  let manualSelection = -1;
  let finalized = [];
  let completedCount = 0;
  let groupCursor = 0;
  let speed = 1;
  let cellScale = 3;
  let actions = 0;
  let score = 0;
  let scoreCombo = 0;
  let scoreComboAt = 0;
  let hudGainTimer = 0;
  let totalVolume = 0;
  let startedAt = 0;
  let elapsedBeforePause = 0;
  let lastStep = 0;
  let selectedIndex = -1;
  let keyboardIndex = 0;
  let keyboardActive = false;
  let invalidIndex = -1;
  let invalidUntil = 0;
  let transitions = [];
  let shockwaves = [];
  let pops = [];
  let focusTrails = [];
  let audioContext = null;
  let soundEnabled = false;
  let musicEnabled = false;
  let hasStarted = false;
  let introMode = "start";
  let toastTimer = null;
  let gridReady = false;
  let stallSteps = 0;
  let stallMark = -1;
  let cell = { width: 0, height: 0, gap: 0, ox: 0, oy: 0 };
  let renderCols = COLS;
  let renderRows = ROWS;

  // マスは常に正方形にして、盤面の縦横比のぶんは「マスの数」で吸収する。
  // 行数・列数を固定していると画面比のしわ寄せがマスの形に出てしまうので、
  // 先に一辺の長さを決め、そこから何行・何列とれるかを数える
  function gridMetrics() {
    const width = Math.max(80, stage.clientWidth || 320);
    const height = Math.max(80, stage.clientHeight || 320);
    const compact = width <= 560;
    const padding = compact ? 10 : 18;
    const gap = compact ? 1.5 : 2;
    const availWidth = Math.max(40, width - padding * 2);
    const availHeight = Math.max(40, height - padding * 2);

    // 倍率は「一辺の目安」を決める。高さから割り出して、大きくなりすぎない範囲に収める
    const wantRows = Math.max(4, Math.round((compact ? MOBILE_ROWS : DESKTOP_ROWS) / cellScale));
    const side = Math.max(12, Math.min(MAX_CELL_SIDE, (availHeight + gap) / wantRows - gap));
    const rows = Math.max(4, Math.floor((availHeight + gap) / (side + gap)));
    const cols = Math.max(4, Math.floor((availWidth + gap) / (side + gap)));
    return { rows, cols, gap, availWidth, availHeight };
  }

  function configureGrid() {
    const { rows, cols } = gridMetrics();

    COLS = cols;
    ROWS = rows;
    TOTAL = COLS * ROWS;
    const targetRows = Math.max(COLOR_COUNT, Math.min(
      ROWS,
      Math.round(ROWS * BASE_DENSITY)
    ));
    const rowsPerColor = Math.floor(targetRows / COLOR_COUNT);
    COLOR_ROWS = Array(COLOR_COUNT).fill(rowsPerColor);
    for (let index = 0; index < targetRows % COLOR_COUNT; index++) COLOR_ROWS[index]++;
    TARGET_CELLS = targetRows * COLS;
    renderCols = COLS;
    renderRows = ROWS;
  }

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const manhattan = (a, b) => {
    const ac = a % renderCols;
    const ar = Math.floor(a / renderCols);
    const bc = b % renderCols;
    const br = Math.floor(b / renderCols);
    return Math.abs(ac - bc) + Math.abs(ar - br);
  };

  function createField() {
    cells = Array(TOTAL).fill(null);
    const fragments = [];
    let fileId = 0;
    for (let colorId = 0; colorId < COLOR_COUNT; colorId++) {
      let colorVolume = COLOR_ROWS[colorId] * COLS;
      while (colorVolume > EPSILON) {
        let fileVolume = Math.min(colorVolume, 12 + Math.floor(Math.random() * 13));
        colorVolume -= fileVolume;
        while (fileVolume > EPSILON) {
          const proposedSize = Math.round((0.58 + Math.random() * 0.37) * 20) / 20;
          let size = Math.min(fileVolume, proposedSize);
          // 端数が細かくなりすぎるときは残りをまとめて取る。
          // ただし1マスに入る量まで。超えると満杯のまま余分を抱えたマスができ、
          // その分だけ別のマスが永久に埋まらなくなる
          if (fileVolume - size < 0.15) size = Math.min(1, fileVolume);
          fragments.push({
            kind: "data",
            fill: size,
            segments: [{ fileId, size }],
            colorId,
            shade: colorId
          });
          fileVolume -= size;
        }
        fileId++;
      }
    }
    totalVolume = TARGET_CELLS;

    const openIndices = shuffle(Array.from({ length: TOTAL }, (_, index) => index));
    fragments.forEach((fragment, index) => {
      cells[openIndices[index]] = fragment;
    });

    actions = 0;
    score = 0;
    scoreCombo = 0;
    renderScore();
    phase = "fill";
    currentTarget = 0;
    manualSelection = -1;
    finalized = Array(TOTAL).fill(false);
    completedCount = 0;
    groupCursor = 0;
    groupOrder = Array.from({ length: COLOR_COUNT }, (_, index) => index);
    selectedIndex = -1;
    keyboardIndex = 0;
    invalidIndex = -1;
    invalidUntil = 0;
    transitions = [];
    shockwaves = [];
    pops = [];
    focusTrails = [];
    stallSteps = 0;
    stallMark = -1;
    startedAt = 0;
    elapsedBeforePause = 0;
    completionStamp.classList.remove("is-visible");
    completionStamp.setAttribute("aria-hidden", "true");
    playAgainButton.disabled = true;
    setState("idle");
    updateStats();
    draw();
  }

  function dataIndices() {
    const indices = [];
    for (let i = 0; i < TOTAL; i++) {
      if (cells[i]?.kind === "data") indices.push(i);
    }
    return indices;
  }

  function loosePieceCount() {
    if (phase === "group") {
      let misplaced = 0;
      for (let index = 0; index < TARGET_CELLS; index++) {
        if (cells[index]?.colorId !== expectedColor(index)) misplaced++;
      }
      return misplaced;
    }
    return dataIndices().filter((index) => {
      if (finalized[index]) return false;
      return cells[index].fill < 1 - EPSILON;
    }).length;
  }

  function isProtected(index) {
    return index === currentTarget || finalized[index];
  }

  function setState(next) {
    state = next;
    stage.classList.toggle("is-scanning", next === "analyzing");
    if (next !== "complete") stage.classList.remove("is-complete");

    if (next === "idle") {
      fragmentedLabel.textContent = t("metrics.loose");
      liveStatus.textContent = t("state.idle.status");
      phaseLabel.textContent = t("state.idle.phase");
      operationText.textContent = t("state.idle.op");
    } else if (next === "analyzing") {
      liveStatus.textContent = t("state.scan.status");
      phaseLabel.textContent = t("state.scan.phase");
      operationText.textContent = t("state.scan.op");
    } else if (next === "running") {
      liveStatus.textContent = controlMode === "manual"
        ? t("state.pick.status")
        : t(phase === "fill" ? "state.fill.status" : "state.swap.status");
      phaseLabel.textContent = controlMode === "manual"
        ? t(phase === "fill" ? "phase.pickTarget" : "phase.pickSwap")
        : (phase === "fill"
          ? t("phase.filling", { n: cellNo(currentTarget + 1), total: TARGET_CELLS })
          : t("phase.grouping", { color: colorName(expectedColor(Math.min(groupCursor, TARGET_CELLS - 1))) }));
    } else if (next === "paused") {
      liveStatus.textContent = t("state.pause.status");
      phaseLabel.textContent = t("state.pause.phase");
      operationText.textContent = t("state.pause.op");
    } else if (next === "settling") {
      liveStatus.textContent = t("state.verify.status");
      phaseLabel.textContent = t("state.verify.phase");
      operationText.textContent = t("state.verify.op");
    } else if (next === "complete") {
      liveStatus.textContent = t("state.done.status");
      phaseLabel.textContent = t("state.done.phase");
      operationText.textContent = t("state.done.op");
    }
  }

  // 端数のずれを吸収する幅。これ以上埋まっていれば満杯とみなす
  const DRIFT_TOLERANCE = 0.02;

  // その的に流しこめるかけらが、盤面のどこかにあるか
  function hasSourceFor(index) {
    const item = cells[index];
    const targetColor = item && item.fill > EPSILON ? item.colorId : null;
    for (let i = 0; i < TOTAL; i++) {
      if (i === index || finalized[i]) continue;
      const source = cells[i];
      if (!source || source.fill <= EPSILON) continue;
      if (targetColor === null || source.colorId === targetColor) return true;
    }
    return false;
  }

  // 埋まりきっていないマスのうち、続きを流しこめるものを返す
  function findPartialTarget() {
    let best = -1;
    let bestFill = -1;
    for (let index = 0; index < TOTAL; index++) {
      const item = cells[index];
      if (!item || item.fill <= EPSILON || item.fill >= 1 - EPSILON) continue;
      if (!hasSourceFor(index)) continue;
      if (item.fill > bestFill) {
        bestFill = item.fill;
        best = index;
      }
    }
    return best;
  }

  // 進められる的をさがす。埋まりかけのものから順に見る
  function findFillableTarget() {
    const open = [];
    for (let index = 0; index < TOTAL; index++) {
      if (!finalized[index]) open.push(index);
    }
    open.sort((a, b) => (cells[b]?.fill || 0) - (cells[a]?.fill || 0));
    for (const index of open) {
      if (hasSourceFor(index)) return index;
    }
    return -1;
  }

  function chooseSource(target, remaining) {
    const targetColor = cells[target]?.fill > EPSILON ? cells[target].colorId : null;
    const sources = dataIndices().filter((index) => {
      if (index === target || isProtected(index) || cells[index].fill <= EPSILON) return false;
      return targetColor === null || cells[index].colorId === targetColor;
    });
    if (!sources.length) return -1;

    // まず近さ。同じ距離のときだけ、ぴったり収まるほうを先に取る
    return sources.sort((a, b) => {
      const distanceDelta = manhattan(a, target) - manhattan(b, target);
      if (distanceDelta !== 0) return distanceDelta;
      return Math.abs(cells[a].fill - remaining) - Math.abs(cells[b].fill - remaining);
    })[0];
  }

  function chooseRemainderStorage(sourceIndex, remainder) {
    const remainderColor = cells[sourceIndex].colorId;
    const anchorIndex = controlMode === "manual" ? currentTarget : sourceIndex;
    const column = anchorIndex % renderCols;
    const row = Math.floor(anchorIndex / renderCols);
    const adjacent = [];
    if (column < renderCols - 1) adjacent.push(anchorIndex + 1);
    if (column > 0) adjacent.push(anchorIndex - 1);
    if (controlMode === "manual") {
      if (row < renderRows - 1) adjacent.push(anchorIndex + renderCols);
      if (row > 0) adjacent.push(anchorIndex - renderCols);
    }
    const adjacentSpace = adjacent.find((index) => {
      if (index === sourceIndex) return false;
      if (isProtected(index)) return false;
      if (!cells[index]) return true;
      // 手動のときは空いているマスにしか置かない。中身のあるマスへ勝手に
      // 流しこむと、こちらが選んでいない合体を打つことになる。
      // 置き場がなければ余りは元のマスに残す
      if (controlMode === "manual") return false;
      return cells[index].colorId === remainderColor && 1 - cells[index].fill >= remainder - EPSILON;
    });
    if (adjacentSpace !== undefined) return adjacentSpace;
    if (controlMode === "manual") return sourceIndex;

    const alternatives = [];
    for (let index = 0; index < TOTAL; index++) {
      if (index === sourceIndex || isProtected(index)) continue;
      if (!cells[index] || (
        cells[index].colorId === remainderColor && 1 - cells[index].fill >= remainder - EPSILON
      )) alternatives.push(index);
    }
    alternatives.sort((a, b) => manhattan(a, sourceIndex) - manhattan(b, sourceIndex));
    return alternatives[0] ?? -1;
  }

  // 入る量だけ移し、あふれた分は元のマスに残す。
  // ここで丸めて捨てると、盤面ぜんぶの体積が減って最後の1マスが埋まらなくなる
  function storeRemainder(storageIndex, source) {
    const target = cells[storageIndex];
    const space = target ? Math.max(0, 1 - target.fill) : 1;
    const moved = Math.min(source.fill, space);
    if (moved <= EPSILON) return 0;
    const segments = takeVolume(source, moved);
    if (!target) {
      cells[storageIndex] = {
        kind: "data",
        fill: moved,
        segments,
        colorId: source.colorId,
        shade: source.shade
      };
    } else {
      target.segments.push(...segments);
      target.fill = Math.min(1, target.fill + moved);
    }
    return moved;
  }

  function targetEase(index, sources = dataIndices()) {
    if (index < 0 || index >= TOTAL || finalized[index]) return -Infinity;
    const item = cells[index];
    if (item?.fill >= 1 - EPSILON) return 50;
    const fill = item?.fill || 0;
    const remaining = 1 - fill;
    const colorId = fill > EPSILON ? item.colorId : null;
    let nearestExact = Infinity;
    let nearbyVolume = 0;

    sources.forEach((sourceIndex) => {
      if (sourceIndex === index) return;
      if (finalized[sourceIndex]) return;
      const source = cells[sourceIndex];
      if (colorId !== null && source.colorId !== colorId) return;
      const distance = manhattan(sourceIndex, index);
      if (Math.abs(source.fill - remaining) <= FIT_EPSILON) {
        nearestExact = Math.min(nearestExact, distance);
      }
      if (distance <= 4) nearbyVolume += Math.min(source.fill, remaining);
    });

    let score = fill * 6;
    if (nearestExact <= 3) score += 6;
    score += Math.min(1, nearbyVolume / Math.max(EPSILON, remaining)) * 16;
    return score;
  }

  // 自動運転の的えらび。番号順になぞるのではなく、いま仕上げたセルの
  // まわりから片づけていく。近さを最優先にしつつ、近所のなかでは
  // 「かけらが集まっていて仕上げやすい」セルを先に取る
  const LOCAL_RADIUS = 5;
  const LOCALITY_WEIGHT = 2.6;

  // 未完了のセルから無作為に何箇所か見て、いちばん仕上げやすいものを返す
  function randomOpenTarget(sources = dataIndices()) {
    const open = [];
    for (let index = 0; index < TOTAL; index++) {
      if (!finalized[index]) open.push(index);
    }
    if (!open.length) return TARGET_CELLS;
    let best = open[Math.floor(Math.random() * open.length)];
    let bestScore = targetEase(best, sources);
    for (let i = 0; i < 5; i++) {
      const candidate = open[Math.floor(Math.random() * open.length)];
      const score = targetEase(candidate, sources);
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }
    return best;
  }

  function chooseNextTarget(previous) {
    const base = finalized.findIndex((done) => !done);
    if (base < 0) return { index: TARGET_CELLS, reason: "complete" };
    const sources = dataIndices();
    const anchor = previous >= 0 && previous < TOTAL ? previous : base;

    let best = -1;
    let bestScore = -Infinity;
    for (let index = 0; index < TOTAL; index++) {
      if (finalized[index]) continue;
      const distance = manhattan(index, anchor);
      if (distance > LOCAL_RADIUS) continue;
      const score = targetEase(index, sources) - distance * LOCALITY_WEIGHT;
      if (score > bestScore) {
        bestScore = score;
        best = index;
      }
    }
    if (best >= 0) return { index: best, reason: "local" };

    // 近所が片づいたら、盤面のどこか別の場所へ移ってそこを新しい起点にする。
    // 端から順になぞらないよう、何箇所か無作為に見てから仕上げやすい方を取る
    return { index: randomOpenTarget(sources), reason: "hop" };
  }

  function takeVolume(source, amount) {
    const taken = [];
    let remaining = amount;
    while (remaining > EPSILON && source.segments.length) {
      const segment = source.segments[source.segments.length - 1];
      const size = Math.min(segment.size, remaining);
      taken.unshift({ fileId: segment.fileId, size });
      segment.size -= size;
      remaining -= size;
      if (segment.size <= EPSILON) source.segments.pop();
    }
    source.fill = Math.max(0, source.fill - amount);
    return taken;
  }

  function consolidateStep(now, forcedSourceIndex = -1) {
    if (currentTarget >= TOTAL || (completedCount >= TARGET_CELLS && findFillableTarget() < 0)) {
      beginGrouping(now);
      return;
    }

    if (!cells[currentTarget]) {
      cells[currentTarget] = {
        kind: "data", fill: 0, segments: [], colorId: null, shade: 0
      };
    }
    const destination = cells[currentTarget];
    if (destination.fill >= 1 - EPSILON) {
      destination.fill = Math.max(destination.fill, 1);
      completeCurrentTarget(now);
      return;
    }

    const remaining = 1 - destination.fill;
    const sourceIndex = forcedSourceIndex >= 0 ? forcedSourceIndex : chooseSource(currentTarget, remaining);
    if (sourceIndex < 0) {
      // 端数が積み上がって最後のひと押しが来ないときは、満杯とみなして確定する
      if (destination.fill > 1 - DRIFT_TOLERANCE) {
        destination.fill = 1;
        completeCurrentTarget(now, false);
        return;
      }
      // この的に流しこめる相手がいない。別の的へ移してやり直す
      const retarget = findFillableTarget();
      if (retarget >= 0 && retarget !== currentTarget) {
        if (destination.fill <= EPSILON && !destination.segments.length) cells[currentTarget] = null;
        currentTarget = retarget;
        return;
      }
      beginFinish(now);
      return;
    }
    const source = cells[sourceIndex];
    if (destination.colorId === null) {
      destination.colorId = source.colorId;
      destination.shade = source.shade;
    }
    const beforeFrom = source.fill;
    const beforeTo = destination.fill;
    const amount = Math.min(source.fill, remaining);
    const pieces = takeVolume(source, amount);
    destination.segments.push(...pieces);
    destination.fill = Math.min(1, destination.fill + amount);
    let remainderTo = -1;
    let remainderAmount = 0;
    if (source.fill > EPSILON) {
      remainderAmount = source.fill;
      remainderTo = chooseRemainderStorage(sourceIndex, remainderAmount);
      if (remainderTo >= 0 && remainderTo !== sourceIndex) {
        storeRemainder(remainderTo, source);
        // 移しきれた場合だけ元のマスを空にする
        if (source.fill <= EPSILON) cells[sourceIndex] = null;
      }
    } else {
      cells[sourceIndex] = null;
    }

    transitions.push({
      kind: "merge", from: sourceIndex, to: currentTarget, time: now, duration: 340,
      beforeFrom, beforeTo, afterFrom: cells[sourceIndex]?.fill || 0, afterTo: destination.fill,
      amount, remainderAmount, remainderTo, sourceColor: source.colorId
    });
    recordAction();
    if (destination.fill < 1 - EPSILON) sfxMerge(currentTarget, destination.fill);
    phaseLabel.textContent = t("phase.filling", { n: cellNo(currentTarget + 1), total: TARGET_CELLS });
    const mergedIndex = currentTarget;
    // かけらを1つも余らせずに 100% に届いた＝ぴったり
    const perfect = destination.fill >= 1 - EPSILON && remainderAmount <= EPSILON;
    if (destination.fill >= 1 - EPSILON) {
      completeCurrentTarget(now, perfect);
      if (perfect) {
        // 余りがないので次に引き継ぐものが無い。選択はいったん手放す
        manualSelection = -1;
        selectedIndex = -1;
      } else if (controlMode === "manual" && remainderTo >= 0 && cells[remainderTo]) {
        // 満タンになったセルから、余りが移ったセルへ選択を引き渡す
        handOffFocus(mergedIndex, remainderTo, now);
        phaseLabel.textContent = t("phase.pickTarget");
        showToast(t("toast.leftover", { pct: (cells[remainderTo].fill * 100).toFixed(0) }));
      }
    } else if (controlMode === "manual") {
      handOffFocus(sourceIndex, currentTarget, now);
      phaseLabel.textContent = t("phase.pickTarget");
      showToast(t("toast.source", {
        n: cellNo(currentTarget), pct: (destination.fill * 100).toFixed(0),
        color: colorName(destination.colorId)
      }));
    }
  }

  function completeCurrentTarget(now, perfect = false) {
    const completed = currentTarget;
    // すでに確定しているマスをもう一度数えると、詰めが早く打ち切られてしまう
    const alreadyDone = finalized[completed];
    cells[completed].fill = Math.max(cells[completed].fill, 1);
    finalized[completed] = true;
    if (!alreadyDone) completedCount++;
    const next = controlMode === "auto"
      ? chooseNextTarget(completed)
      : { index: finalized.findIndex((done) => !done), reason: "manual" };
    if (next.index < 0) next.index = TARGET_CELLS;
    currentTarget = next.index;
    manualSelection = -1;
    if (controlMode === "manual") selectedIndex = -1;
    pushPop(completed, cells[completed]?.colorId ?? 0, now, perfect);
    if (rowIsFilled(Math.floor(completed / renderCols))) {
      sfxRowComplete();
      addScore(SCORE.rowFilled);
    } else if (perfect) {
      sfxPerfectFit(completed);
      addScore(SCORE.perfect);
    } else {
      sfxCellComplete(completed);
      addScore(SCORE.cell);
    }
    updateStats();
    if (controlMode === "manual" && completedCount >= TARGET_CELLS) beginGrouping(now);
  }

  function expectedColor(index) {
    const row = Math.floor(index / COLS);
    let boundary = 0;
    for (const colorId of groupOrder) {
      boundary += COLOR_ROWS[colorId];
      if (row < boundary) return colorId;
    }
    return groupOrder[groupOrder.length - 1];
  }

  function establishGroupOrder() {
    groupOrder = Array.from({ length: COLOR_COUNT }, (_, colorId) => colorId)
      .sort((a, b) => {
        const firstA = cells.findIndex((item) => item?.colorId === a);
        const firstB = cells.findIndex((item) => item?.colorId === b);
        return firstA - firstB;
      });
  }

  // 行がまるごと満杯になったか（詰めフェーズのごほうび判定）
  function rowIsFilled(row) {
    const start = row * renderCols;
    if (start < 0 || start >= TARGET_CELLS) return false;
    for (let index = start; index < Math.min(start + renderCols, TARGET_CELLS); index++) {
      if (!cells[index] || cells[index].fill < 1 - EPSILON) return false;
    }
    return true;
  }

  // 行が「そろうべき色」で染まったか（色そろえフェーズのごほうび判定）
  function rowIsGrouped(row) {
    const start = row * renderCols;
    if (start < 0 || start >= TARGET_CELLS) return false;
    const wanted = expectedColor(start);
    for (let index = start; index < Math.min(start + renderCols, TARGET_CELLS); index++) {
      const item = cells[index];
      if (!item || item.fill < 1 - EPSILON || item.colorId !== wanted) return false;
    }
    return true;
  }

  function isFieldOrganized() {
    if (TARGET_CELLS % COLS !== 0) return false;

    const seenColors = new Set();
    let previousColor = null;
    for (let rowStart = 0; rowStart < TARGET_CELLS; rowStart += COLS) {
      const rowColor = cells[rowStart]?.colorId;
      if (rowColor === null || rowColor === undefined) return false;
      for (let index = rowStart; index < rowStart + COLS; index++) {
        const item = cells[index];
        if (!item || item.fill < 1 - EPSILON || item.colorId !== rowColor) return false;
      }
      if (rowColor !== previousColor) {
        if (seenColors.has(rowColor)) return false;
        seenColors.add(rowColor);
        previousColor = rowColor;
      }
    }

    for (let index = TARGET_CELLS; index < TOTAL; index++) {
      if (cells[index]?.fill > EPSILON) return false;
    }
    return true;
  }

  function checkManualCompletion(now = performance.now()) {
    if (controlMode !== "manual" || state !== "running" || !isFieldOrganized()) return false;
    phase = "group";
    groupCursor = TARGET_CELLS;
    manualSelection = -1;
    selectedIndex = -1;
    beginFinish(now);
    return true;
  }

  // 色が合っていても、埋まりきっていないマスは「そろった」とみなさない
  function advanceGroupCursor() {
    while (
      groupCursor < TARGET_CELLS &&
      cells[groupCursor]?.fill >= 1 - EPSILON &&
      cells[groupCursor]?.colorId === expectedColor(groupCursor)
    ) groupCursor++;
  }

  function beginGrouping(now) {
    phase = "group";
    fragmentedLabel.textContent = t("metrics.misplaced");
    establishGroupOrder();
    groupCursor = 0;
    advanceGroupCursor();
    if (isFieldOrganized()) {
      beginFinish(now);
      return;
    }
    setState("running");
    operationText.textContent = t("op.groupStart");
    shockwaves.push({ row: -2, time: now, duration: 850 });
    sfxGroupStart();
  }

  function swapStep(now) {
    advanceGroupCursor();
    if (groupCursor >= TARGET_CELLS) {
      beginFinish(now);
      return;
    }

    const wanted = expectedColor(groupCursor);
    const displaced = cells[groupCursor]?.colorId ?? null;
    const candidates = [];
    for (let index = groupCursor + 1; index < TOTAL; index++) {
      if (cells[index]?.colorId === wanted && cells[index].fill >= 1 - EPSILON) candidates.push(index);
    }
    // 先の方に見あたらないときは、手前のマスも含めて探しなおす。
    // ここで打ち切ると、あと1マスのところで進めなくなることがある
    if (!candidates.length) {
      for (let index = 0; index < groupCursor; index++) {
        if (cells[index]?.colorId === wanted && cells[index].fill >= 1 - EPSILON
          && expectedColor(index) !== wanted) candidates.push(index);
      }
    }
    if (!candidates.length) {
      beginFinish(now);
      return;
    }

    const perfectSwap = candidates.filter((index) => {
      if (index >= TARGET_CELLS) return displaced === null;
      return displaced !== null && expectedColor(index) === displaced;
    });
    const sourceIndex = (perfectSwap.length ? perfectSwap : candidates)
      .sort((a, b) => manhattan(a, groupCursor) - manhattan(b, groupCursor))[0];
    const swapTarget = groupCursor;
    [cells[swapTarget], cells[sourceIndex]] = [cells[sourceIndex], cells[swapTarget]];
    transitions.push({
      kind: "swap", from: sourceIndex, to: swapTarget, partner: sourceIndex,
      time: now, duration: 360, sourceColor: wanted
    });
    actions++;
    sfxSwap(sourceIndex, swapTarget);
    advanceGroupCursor();
    phaseLabel.textContent = groupCursor < TARGET_CELLS
      ? t("phase.grouping", { color: colorName(expectedColor(groupCursor)) })
      : t("state.verify.phase");
    if (groupCursor % COLS === 0) {
      shockwaves.push({ row: Math.floor((groupCursor - 1) / renderCols), time: now + 80, duration: 520 });
      sfxRowGrouped(expectedColor(Math.max(0, groupCursor - 1)));
      addScore(SCORE.rowGrouped);
    }
    updateStats();
  }

  function manualCellClick(index) {
    if (phase === "group") {
      manualSwapClick(index);
      return;
    }

    if (manualSelection < 0) {
      if (!cells[index]) {
        rejectCell(index, t("reject.empty"));
        return;
      }
      manualSelection = index;
      selectedIndex = index;
      sfxSelect(index);
      const completed = cells[index].fill >= 1 - EPSILON;
      showToast(completed
        ? t("toast.sourceFull", { n: cellNo(index) })
        : t("toast.source", {
          n: cellNo(index), pct: (cells[index].fill * 100).toFixed(0),
          color: colorName(cells[index].colorId)
        }));
      phaseLabel.textContent = t("phase.pickTarget");
      return;
    }

    if (index === manualSelection) {
      manualSelection = -1;
      selectedIndex = -1;
      phaseLabel.textContent = t("phase.pickTarget");
      sfxCancel(index);
      showToast(t("toast.cancel"));
      return;
    }
    const sourceIndex = manualSelection;
    const source = cells[sourceIndex];
    if (source.fill >= 1 - EPSILON) {
      moveCompletedCell(sourceIndex, index);
      return;
    }
    if (finalized[index]) {
      rejectCell(index, t("reject.full"));
      return;
    }
    const target = cells[index];
    if (target?.colorId !== null && target?.colorId !== undefined && target.colorId !== source.colorId) {
      rejectCell(index, t("reject.color", { color: colorName(source.colorId) }));
      return;
    }
    if (target?.fill >= 1 - EPSILON) {
      currentTarget = index;
      completeCurrentTarget(performance.now());
      showToast(t("toast.alreadyFull", { n: cellNo(index) }));
      return;
    }

    currentTarget = index;
    selectedIndex = index;
    consolidateStep(performance.now(), sourceIndex);
  }

  function moveCompletedCell(from, to) {
    const fromWasFinalized = Boolean(finalized[from]);
    const toWasFinalized = Boolean(finalized[to]);
    const sourceColor = cells[from]?.colorId ?? 0;
    [cells[from], cells[to]] = [cells[to], cells[from]];
    finalized[from] = toWasFinalized;
    finalized[to] = fromWasFinalized;
    transitions.push({
      kind: "swap", from, to, partner: to,
      time: performance.now(), duration: 360, sourceColor
    });
    actions++;
    manualSelection = -1;
    selectedIndex = -1;
    const firstOpen = finalized.findIndex((done) => !done);
    currentTarget = firstOpen < 0 ? TARGET_CELLS : firstOpen;
    phaseLabel.textContent = t("phase.pickTarget");
    updateStats();
    sfxSwap(from, to);
  }

  function manualSwapClick(index) {
    if (manualSelection < 0) {
      manualSelection = index;
      selectedIndex = index;
      sfxSelect(index);
      showToast(t("toast.swapPick", { n: cellNo(index) }));
      return;
    }
    if (index === manualSelection) {
      manualSelection = -1;
      selectedIndex = -1;
      phaseLabel.textContent = t("phase.pickSwap");
      sfxCancel(index);
      showToast(t("toast.cancel"));
      return;
    }

    const first = manualSelection;
    [cells[first], cells[index]] = [cells[index], cells[first]];
    transitions.push({
      kind: "swap", from: index, to: first, partner: index,
      time: performance.now(), duration: 360, sourceColor: cells[first]?.colorId ?? 0
    });
    actions++;
    manualSelection = -1;
    selectedIndex = index;
    groupCursor = 0;
    advanceGroupCursor();
    phaseLabel.textContent = t("phase.pickSwap");
    updateStats();
    sfxSwap(first, index);
    const grouped = [first, index]
      .map((cellIndex) => Math.floor(cellIndex / renderCols))
      .filter((row, position, rows) => rows.indexOf(row) === position)
      .filter((row) => rowIsGrouped(row));
    if (grouped.length) {
      sfxRowGrouped(cells[grouped[0] * renderCols]?.colorId ?? 0);
      addScore(SCORE.rowGrouped);
    }
    if (isFieldOrganized()) beginFinish(performance.now());
  }

  function setControlMode(nextMode) {
    controlMode = nextMode;
    manualSelection = -1;
    selectedIndex = -1;
    controlDeck.classList.toggle("is-manual", nextMode === "manual");
    if (phase === "fill") {
      const firstOpen = finalized.findIndex((done) => !done);
      currentTarget = nextMode === "auto"
        ? randomOpenTarget()
        : (firstOpen < 0 ? TARGET_CELLS : firstOpen);
    }
    if (state !== "complete" && state !== "settling") {
      if (state !== "running") startedAt = performance.now();
      lastStep = performance.now();
      setState("running");
    } else {
      operationText.textContent = t("op.reset");
    }
    updateModeButtons();
  }

  function updateModeButtons() {
    const isAuto = controlMode === "auto";
    modeToggle.dataset.currentMode = controlMode;
    modeToggle.classList.toggle("is-active", !isAuto);
    modeToggle.setAttribute("aria-pressed", String(isAuto));
    modeToggle.setAttribute("aria-label", t(isAuto ? "aria.modeAuto" : "aria.modeManual"));
  }

  /* 得点。続けて決めるほど倍率が上がり、2.4秒あくと元に戻る */
  const SCORE = { cell: 100, perfect: 250, rowFilled: 500, rowGrouped: 400, clear: 2000 };

  function comboMultiplier() {
    return Math.min(1 + Math.floor(scoreCombo / 4), 6);
  }

  function addScore(points, { chain = true } = {}) {
    const now = performance.now();
    if (now - scoreComboAt > 2400) scoreCombo = 0;
    scoreComboAt = now;
    const multiplier = comboMultiplier();
    if (chain) scoreCombo++;
    const gained = Math.round(points * multiplier);
    score += gained;
    renderScore();
    showScoreGain(gained, multiplier);
  }

  function renderScore() {
    hudScore.textContent = score.toLocaleString("en-US");
  }

  function showScoreGain(gained, multiplier) {
    hudGain.textContent = multiplier > 1 ? `+${gained} ×${multiplier}` : `+${gained}`;
    hudGain.classList.remove("is-shown");
    hudScoreItem.classList.remove("is-bumped");
    void hudGain.offsetWidth;
    hudGain.classList.add("is-shown");
    hudScoreItem.classList.add("is-bumped");
    window.clearTimeout(hudGainTimer);
    hudGainTimer = window.setTimeout(() => {
      hudGain.classList.remove("is-shown");
      hudScoreItem.classList.remove("is-bumped");
    }, 900);
  }

  function recordAction() {
    actions++;
    updateStats();
  }

  function beginFinish(now) {
    if (!isFieldOrganized()) {
      if (phase === "fill") {
        beginGrouping(now);
        return;
      }
      // 色そろえで手が無くなった。まだ埋まっていない的が残っていれば詰めに戻り、
      // それも無ければ空回りさせずに止める
      const partial = findPartialTarget();
      const retarget = partial >= 0 ? partial : findFillableTarget();
      if (retarget >= 0 && (cells[retarget]?.fill ?? 0) < 1 - EPSILON) {
        phase = "fill";
        fragmentedLabel.textContent = t("metrics.loose");
        currentTarget = retarget;
        setState("running");
        return;
      }
      setState("paused");
      updateModeButtons();
      return;
    }
    setState("settling");
    updateModeButtons();
    shockwaves.push({ row: -1, time: now + 120, duration: 1200 });
    window.setTimeout(() => {
      if (state === "settling") finish();
    }, 620);
  }

  function finish() {
    elapsedBeforePause += performance.now() - startedAt;
    const seconds = Math.floor(elapsedBeforePause / 1000);
    scoreCombo = 0;
    addScore(SCORE.clear + Math.max(0, 600 - seconds) * 10, { chain: false });
    stampTime.textContent = formatDuration(elapsedBeforePause);
    stampScore.textContent = score.toLocaleString("en-US");
    controlMode = "manual";
    manualSelection = -1;
    selectedIndex = -1;
    controlDeck.classList.add("is-manual");
    setState("complete");
    updateModeButtons();
    stage.classList.add("is-complete");
    completionStamp.classList.remove("is-visible");
    void completionStamp.offsetWidth;
    completionStamp.classList.add("is-visible");
    completionStamp.setAttribute("aria-hidden", "false");
    playAgainButton.disabled = false;
    updateStats(true);
    sfxComplete();
    stopMusic();          // 余韻のあいだは静かにしておく
  }

  function updateStats(forceComplete = false) {
    const targetFill = cells[currentTarget]?.fill || 0;
    const fillProgress = Math.min(1, (completedCount + targetFill) / TARGET_CELLS);
    const groupProgress = Math.min(1, groupCursor / TARGET_CELLS);
    const progress = forceComplete ? 100 : Math.max(
      0,
      Math.min(99.8, phase === "fill" ? fillProgress * 70 : 70 + groupProgress * 30)
    );
    const organization = Math.round(28 + progress * 0.71);
    const density = Math.round(totalVolume / TOTAL * 100);
    fragmentedValue.textContent = `${loosePieceCount()} PCS`;
    movedValue.textContent = String(actions).padStart(3, "0");
    progressValue.textContent = `${progress.toFixed(1)}%`;
    progressBar.style.width = `${progress}%`;
    musicIntensity = Math.max(0, Math.min(1, progress / 100));
    healthValue.textContent = String(organization);
    healthRing.style.setProperty("--health", organization);
    densityValue.textContent = `${density}%`;
    capacityBar.style.width = `${density}%`;
  }

  function resizeCanvas() {
    const viewportWidth = stage.clientWidth;
    const viewportHeight = stage.clientHeight;
    // 格子を決めるのは、画面の大きさが最初に分かった一度きり。
    // あとは幅や高さが変わっても盤面はそのままで、マスの一辺だけ合わせる
    // （正方形は保つ）。作りなおすときは configureGrid をあらためて呼ぶ
    if (!gridReady && viewportWidth > 80 && viewportHeight > 80) {
      const previousCols = COLS;
      const previousRows = ROWS;
      configureGrid();
      if (cells.length && (previousCols !== COLS || previousRows !== ROWS)) createField();
      gridReady = true;
    }

    const surfaceWidth = viewportWidth;
    const surfaceHeight = viewportHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(surfaceWidth * dpr);
    canvas.height = Math.round(surfaceHeight * dpr);
    canvas.style.width = `${surfaceWidth}px`;
    canvas.style.height = `${surfaceHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { gap, availWidth, availHeight } = gridMetrics();
    cell.gap = gap;
    // 幅と高さの両方に収まる一辺を選ぶ。縦横おなじ値にするので必ず正方形になる
    const side = Math.min(
      (availWidth + gap) / renderCols - gap,
      (availHeight + gap) / renderRows - gap
    );
    cell.width = Math.max(1, side);
    cell.height = cell.width;
    const gridWidth = cell.width * renderCols + gap * (renderCols - 1);
    const gridHeight = cell.height * renderRows + gap * (renderRows - 1);
    cell.ox = (surfaceWidth - gridWidth) / 2;
    cell.oy = (surfaceHeight - gridHeight) / 2;
    draw();
  }

  function blockPosition(index) {
    const col = index % renderCols;
    const row = Math.floor(index / renderCols);
    return {
      x: cell.ox + col * (cell.width + cell.gap),
      y: cell.oy + row * (cell.height + cell.gap)
    };
  }

  function activeTransition(index, now) {
    for (let i = transitions.length - 1; i >= 0; i--) {
      const transition = transitions[i];
      if (now - transition.time > transition.duration) continue;
      if (transition.from === index || transition.to === index || transition.remainderTo === index) return transition;
    }
    return null;
  }

  function draw(now = performance.now()) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#090d0e";
    ctx.fillRect(0, 0, width, height);
    transitions = transitions.filter((transition) => now - transition.time < transition.duration);

    for (let i = 0; i < TOTAL; i++) {
      const { x, y } = blockPosition(i);
      const item = cells[i];
      const active = activeTransition(i, now);

      ctx.fillStyle = i === selectedIndex ? "#35433c" : "#17201c";
      ctx.fillRect(x, y, Math.max(1, cell.width), Math.max(1, cell.height));
      const swapping = activeSwap(i, now);
      if (!item || swapping) {
        if (swapping) drawActiveEdge(x, y, swapping, now, i === swapping.to ? "target" : "source");
        else if (active?.from === i) drawActiveEdge(x, y, active, now, "source");
        if (shouldDrawCursor(i)) drawTargetCursor(x, y, now);
        if (i === invalidIndex && now < invalidUntil) drawInvalidCursor(x, y, now);
        if (keyboardActive && i === keyboardIndex) drawKeyboardCursor(x, y, now);
        if (i === selectedIndex) drawSelectionBrackets(x, y, now);
        continue;
      }

      // 弾けている最中のセルは、ひとまわり膨らませて見せる
      const pop = activePop(i, now);
      if (pop) {
        const punch = Math.sin(Math.min(1, (now - pop.time) / pop.duration) * Math.PI) * (pop.perfect ? 4.2 : 2.6);
        drawDataCell(item, x - punch, y - punch, state === "complete", punch);
      } else {
        drawDataCell(item, x, y, state === "complete");
      }

      if (active) {
        const role = active.to === i ? "target" : (active.remainderTo === i ? "remainder" : "source");
        drawActiveEdge(x, y, active, now, role);
      }
      if (shouldDrawCursor(i)) drawTargetCursor(x, y, now);
      if (i === invalidIndex && now < invalidUntil) drawInvalidCursor(x, y, now);
      if (keyboardActive && i === keyboardIndex) drawKeyboardCursor(x, y, now);
      if (i === selectedIndex) drawSelectionBrackets(x, y, now);
    }

    transitions.forEach((transition) => {
      if (transition.kind === "swap") drawSwapFlyers(transition, now);
      else drawTransitionFlyers(transition, now);
    });
    drawFocusTrails(now);
    drawPops(now);
    drawShockwaves(now);
  }

  function shouldDrawCursor(index) {
    if (state === "idle" || state === "complete") return false;
    if (controlMode === "manual") return index === manualSelection;
    return phase === "fill" && index === currentTarget;
  }

  function drawTargetCursor(x, y, now) {
    ctx.save();
    ctx.strokeStyle = "#c9ff3f";
    ctx.globalAlpha = .55 + Math.sin(now / 150) * .25;
    ctx.shadowColor = "#c9ff3f";
    ctx.shadowBlur = 8;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 2, y - 2, cell.width + 4, cell.height + 4);
    ctx.restore();
  }

  function drawInvalidCursor(x, y, now) {
    const remaining = Math.max(0, invalidUntil - now) / 520;
    const shake = Math.sin(now / 18) * 2.5 * remaining;
    ctx.save();
    ctx.strokeStyle = "#ff5f57";
    ctx.globalAlpha = .45 + remaining * .55;
    ctx.shadowColor = "#ff5f57";
    ctx.shadowBlur = 9;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 2 + shake, y - 2, cell.width + 4, cell.height + 4);
    ctx.restore();
  }

  // 選択中のセル。四隅のかぎ括弧にすると、盤面のどこにいても目で拾える
  function drawSelectionBrackets(x, y, now) {
    const arm = Math.max(3, Math.min(9, cell.width * 0.34));
    const pad = 2 + Math.sin(now / 210) * 0.7;
    const left = x - pad;
    const top = y - pad;
    const right = x + cell.width + pad;
    const bottom = y + cell.height + pad;
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.shadowColor = "rgba(255,255,255,.55)";
    ctx.shadowBlur = 6;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(left, top + arm); ctx.lineTo(left, top); ctx.lineTo(left + arm, top);
    ctx.moveTo(right - arm, top); ctx.lineTo(right, top); ctx.lineTo(right, top + arm);
    ctx.moveTo(right, bottom - arm); ctx.lineTo(right, bottom); ctx.lineTo(right - arm, bottom);
    ctx.moveTo(left + arm, bottom); ctx.lineTo(left, bottom); ctx.lineTo(left, bottom - arm);
    ctx.stroke();
    ctx.restore();
  }

  function drawKeyboardCursor(x, y, now) {
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.globalAlpha = .72 + Math.sin(now / 190) * .18;
    ctx.lineWidth = 1.25;
    ctx.setLineDash([3, 2]);
    ctx.strokeRect(x - 3, y - 3, cell.width + 6, cell.height + 6);
    ctx.restore();
  }

  const FOCUS_DELAY = 120;
  const FOCUS_FLIGHT = 320;
  const FOCUS_HOLD = 420;

  // 選択が別のセルへ動いたことを、飛ぶ枠と着地の波紋で伝える
  function handOffFocus(from, to, now) {
    manualSelection = to;
    selectedIndex = to;
    if (from < 0 || to < 0 || from === to) return;
    focusTrails.push({ from, to, time: now + FOCUS_DELAY, duration: FOCUS_FLIGHT });
    if (focusTrails.length > 6) focusTrails.shift();
  }

  // 盤面のいちばん手前にある「かけら」を最初のフォーカスにする。
  // 空のセルや満タンのセルは合流の起点にできないので飛ばす
  function focusFirstCell(now = performance.now()) {
    if (controlMode !== "manual" || phase !== "fill") return;
    let target = -1;
    for (let index = 0; index < TOTAL; index++) {
      const item = cells[index];
      if (!item || finalized[index]) continue;
      if (item.fill < 1 - EPSILON) { target = index; break; }
      if (target < 0) target = index;
    }
    if (target < 0) return;
    manualSelection = target;
    selectedIndex = target;
    keyboardIndex = target;
    focusTrails.push({ from: -1, to: target, time: now, duration: 0 });
    phaseLabel.textContent = t("phase.pickTarget");
    showToast(t("toast.source", {
      n: cellNo(target), pct: (cells[target].fill * 100).toFixed(0),
      color: colorName(cells[target].colorId)
    }));
  }

  function drawFocusTrails(now) {
    focusTrails = focusTrails.filter((trail) => now - trail.time < trail.duration + FOCUS_HOLD);
    focusTrails.forEach((trail) => {
      const age = now - trail.time;
      if (age < 0) return;
      const to = blockPosition(trail.to);
      const t = trail.duration > 0 ? Math.min(1, age / trail.duration) : 1;
      const eased = easeOut(t);

      if (t < 1) {
        const from = blockPosition(trail.from);
        // どこから来たのかが分かるように、道すじを点線で引く
        ctx.save();
        ctx.globalAlpha = (1 - t) * 0.5;
        ctx.strokeStyle = "#edf7f1";
        ctx.setLineDash([2, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(from.x + cell.width / 2, from.y + cell.height / 2);
        ctx.lineTo(to.x + cell.width / 2, to.y + cell.height / 2);
        ctx.stroke();
        ctx.restore();

        // 置いてきたセルの枠は薄れていく
        ctx.save();
        ctx.globalAlpha = (1 - t) * 0.45;
        ctx.strokeStyle = "#edf7f1";
        ctx.lineWidth = 1;
        ctx.strokeRect(from.x - 1.5, from.y - 1.5, cell.width + 3, cell.height + 3);
        ctx.restore();

        // 飛んでいく選択枠。着地に向けて少しずつ締まる
        const slack = (1 - eased) * 5;
        const x = from.x + (to.x - from.x) * eased;
        const y = from.y + (to.y - from.y) * eased;
        ctx.save();
        ctx.strokeStyle = "#c9ff3f";
        ctx.shadowColor = "#c9ff3f";
        ctx.shadowBlur = 10;
        ctx.lineWidth = 1.6;
        ctx.strokeRect(x - 2 - slack, y - 2 - slack, cell.width + 4 + slack * 2, cell.height + 4 + slack * 2);
        ctx.restore();
        return;
      }

      // 着地の波紋。ここに移ったよ、と一度だけ知らせる
      const hold = Math.min(1, (age - trail.duration) / FOCUS_HOLD);
      const spread = easeOut(hold) * Math.min(cell.width * 0.55, 18);
      ctx.save();
      ctx.globalAlpha = (1 - hold) * 0.9;
      ctx.strokeStyle = "#c9ff3f";
      ctx.lineWidth = Math.max(1, 2 * (1 - hold));
      ctx.strokeRect(to.x - spread, to.y - spread, cell.width + spread * 2, cell.height + spread * 2);
      ctx.restore();
    });
  }

  function pushPop(index, colorId, now, perfect = false) {
    pops.push({ index, colorId, time: now, duration: perfect ? 720 : 460, perfect });
    if (pops.length > 140) pops.splice(0, pops.length - 140);
  }

  function activePop(index, now) {
    for (let i = pops.length - 1; i >= 0; i--) {
      const pop = pops[i];
      if (pop.index === index && now - pop.time < pop.duration) return pop;
    }
    return null;
  }

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function activeSwap(index, now) {
    for (let i = transitions.length - 1; i >= 0; i--) {
      const transition = transitions[i];
      if (transition.kind !== "swap" || now - transition.time > transition.duration) continue;
      if (transition.from === index || transition.to === index) return transition;
    }
    return null;
  }

  // 交換した2つは、互いの位置へすれちがいながら入れかわる。
  // 中身は入れかえ済みなので、to にあるものが from から来たことになる
  function drawSwapFlyers(transition, now) {
    const t = Math.min(1, Math.max(0, (now - transition.time) / transition.duration));
    const eased = easeInOut(t);
    const a = blockPosition(transition.from);
    const b = blockPosition(transition.to);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy) || 1;
    // 進行方向と直角にふくらませて、2つが重ならずにすれちがうようにする
    const arc = Math.sin(t * Math.PI) * Math.min(12, Math.max(cell.width, cell.height) * 0.4);
    const ox = (-dy / length) * arc;
    const oy = (dx / length) * arc;
    drawSwapPiece(cells[transition.to], a, b, eased, ox, oy);
    drawSwapPiece(cells[transition.from], b, a, eased, -ox, -oy);
  }

  function drawSwapPiece(item, from, to, eased, ox, oy) {
    if (!item) return;
    const x = from.x + (to.x - from.x) * eased + ox;
    const y = from.y + (to.y - from.y) * eased + oy;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.45)";
    ctx.shadowBlur = 6;
    drawDataCell(item, x, y, state === "complete");
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(237,247,241,.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 0.5, y - 0.5, cell.width + 1, cell.height + 1);
    ctx.restore();
  }

  // セルが 100% になった瞬間。白く弾けて、輪が広がって、火花が散る。
  // 余りゼロでぴったり収まったときは、輪も火花もひとまわり大きく長く出す
  function drawPops(now) {
    pops = pops.filter((pop) => now - pop.time < pop.duration);
    pops.forEach((pop) => {
      const t = (now - pop.time) / pop.duration;
      const { x, y } = blockPosition(pop.index);
      const cx = x + cell.width / 2;
      const cy = y + cell.height / 2;
      const perfect = pop.perfect;
      const spokes = perfect ? 14 : 8;
      // マスが大きいときに輪が盤面を覆わないよう、広がりに上限をつける
      const ringMax = perfect ? Math.min(cell.width * 1.15, 44) : Math.min(cell.width * 0.7, 24);
      const sparkMax = perfect ? Math.min(cell.width * 1.7, 62) : Math.min(cell.width * 1.05, 34);
      ctx.save();

      // 芯の閃光。最初の一瞬だけ白く飛ばす
      const flashUntil = perfect ? 0.42 : 0.34;
      if (t < flashUntil) {
        ctx.globalAlpha = (1 - t / flashUntil) * (perfect ? 1 : 0.85);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, cell.width, cell.height);
      }

      // 広がる輪。ぴったりのときは二重にして、遅れてもう一枚追いかける
      const ring = easeOut(t);
      const rings = perfect ? [ring, easeOut(Math.max(0, t - 0.16) / 0.84)] : [ring];
      rings.forEach((value, layer) => {
        const spread = value * ringMax;
        ctx.globalAlpha = (1 - value) * (layer ? 0.45 : 0.8);
        ctx.strokeStyle = layer ? "#ffffff" : "#c9ff3f";
        ctx.lineWidth = Math.max(1, (perfect ? 3.2 : 2.4) * (1 - value));
        ctx.strokeRect(x - spread, y - spread, cell.width + spread * 2, cell.height + spread * 2);
      });

      // 四方に散る火花
      const reach = ring * sparkMax;
      ctx.globalAlpha = (1 - ring) * (perfect ? 1 : 0.85);
      ctx.strokeStyle = perfect ? "#eaffb2" : DATA_SHADES[pop.colorId ?? 0];
      ctx.lineWidth = Math.max(1, (perfect ? 2.4 : 1.8) * (1 - ring));
      ctx.beginPath();
      for (let i = 0; i < spokes; i++) {
        const angle = (Math.PI * 2 * i) / spokes + 0.39;
        const inner = reach * (perfect ? 0.3 : 0.45);
        ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
        ctx.lineTo(cx + Math.cos(angle) * reach, cy + Math.sin(angle) * reach);
      }
      ctx.stroke();
      ctx.restore();
    });
  }

  // 動いたぶんが実際に飛ぶ。入りきらなかった「余り」は点線で別に飛ばす
  function drawTransitionFlyers(transition, now) {
    if (transition.kind !== "merge") return;
    const t = Math.min(1, Math.max(0, (now - transition.time) / transition.duration));
    const eased = easeOut(t);
    const from = blockPosition(transition.from);
    const color = DATA_SHADES[transition.sourceColor ?? 0];

    drawFlyer(from, blockPosition(transition.to), transition.amount, color, eased, false);

    const leftover = transition.remainderAmount || 0;
    if (leftover <= EPSILON || transition.remainderTo < 0) return;
    if (transition.remainderTo === transition.from) {
      // その場に残る場合は、点線の枠を光らせて「ここに余った」と伝える
      const pulse = Math.sin(t * Math.PI);
      ctx.save();
      ctx.globalAlpha = pulse * 0.9;
      ctx.strokeStyle = "#edf7f1";
      ctx.setLineDash([2, 2]);
      ctx.lineWidth = 1.2;
      ctx.strokeRect(from.x - 2, from.y - 2, cell.width + 4, cell.height + 4);
      ctx.restore();
      return;
    }
    drawFlyer(from, blockPosition(transition.remainderTo), leftover, color, eased, true);
  }

  function drawFlyer(from, to, amount, color, eased, isLeftover) {
    const height = Math.max(1.5, cell.height * amount);
    const lift = Math.sin(eased * Math.PI) * (isLeftover ? -7 : 7);
    const x = from.x + (to.x - from.x) * eased;
    const y = from.y + (to.y - from.y) * eased + (cell.height - height) - lift;
    ctx.save();
    ctx.globalAlpha = (isLeftover ? 0.7 : 0.9) * (1 - Math.pow(eased, 4));
    ctx.fillStyle = color;
    ctx.fillRect(x, y, cell.width, height);
    ctx.strokeStyle = isLeftover ? "#edf7f1" : "#f4ffd7";
    ctx.lineWidth = 1;
    if (isLeftover) ctx.setLineDash([2, 2]);
    ctx.strokeRect(x - 0.5, y - 0.5, cell.width + 1, height + 1);
    ctx.restore();
  }

  function drawDataCell(item, x, y, completed, grow = 0) {
    const partial = item.fill < 1 - EPSILON && !completed;
    const width = cell.width + grow * 2;
    const height = cell.height + grow * 2;
    const fillHeight = Math.max(1, height * item.fill);
    const color = DATA_SHADES[item.colorId ?? item.shade ?? 0];
    ctx.globalAlpha = partial ? .1 : .2;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = color;
    ctx.globalAlpha = partial ? .68 : 1;
    ctx.fillRect(x, y + height - fillHeight, width, fillHeight);

    if (partial && item.segments.length > 1 && height > 5) {
      let offset = 0;
      ctx.strokeStyle = "rgba(8,14,13,.52)";
      ctx.lineWidth = .65;
      item.segments.slice(0, -1).forEach((segment) => {
        offset += segment.size;
        const lineY = y + height - fillHeight + height * offset;
        ctx.beginPath();
        ctx.moveTo(x, lineY);
        ctx.lineTo(x + width, lineY);
        ctx.stroke();
      });
    }
    // 満杯のマスは、ロゴのブロックと同じように面取りして「積んだ」見た目にする。
    // 半端なマスは平らなままなので、遠目でもどちらか一目でわかる
    if (item.fill >= 1 - EPSILON) {
      const bevel = Math.max(1, Math.min(3, width * .1));
      ctx.globalAlpha = .55;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, width, bevel);
      ctx.fillRect(x, y, bevel, height);
      ctx.globalAlpha = .34;
      ctx.fillStyle = "#04070a";
      ctx.fillRect(x, y + height - bevel, width, bevel);
      ctx.fillRect(x + width - bevel, y, bevel, height);

      const markSize = Math.max(2, Math.min(4.5, width * .18));
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + bevel + 1, y + bevel + 1, markSize, markSize);
    }
    ctx.globalAlpha = 1;
  }

  function drawActiveEdge(x, y, transition, now, role) {
    const t = Math.min(1, Math.max(0, (now - transition.time) / transition.duration));
    const pulse = Math.sin(t * Math.PI);
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = role === "target"
      ? "#c9ff3f"
      : (role === "remainder" ? "#edf7f1" : DATA_SHADES[transition.sourceColor ?? 0]);
    if (role === "remainder") ctx.setLineDash([2, 2]);
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 8;
    ctx.lineWidth = 1 + pulse;
    const inset = role === "target" ? (1 - pulse) * 3 : pulse * 2;
    ctx.strokeRect(x - inset, y - inset, cell.width + inset * 2, cell.height + inset * 2);
    ctx.restore();
  }

  function drawShockwaves(now) {
    shockwaves = shockwaves.filter((wave) => now - wave.time < wave.duration);
    shockwaves.forEach((wave) => {
      const age = now - wave.time;
      if (age < 0) return;
      const t = age / wave.duration;
      ctx.save();
      ctx.globalAlpha = (1 - t) * .55;
      ctx.strokeStyle = "#c9ff3f";
      ctx.lineWidth = Math.max(1, 2 * (1 - t));
      if (wave.row >= 0) {
        const position = blockPosition(wave.row * renderCols + (wave.column || 0));
        const spread = t * 10;
        ctx.strokeRect(
          position.x - spread,
          position.y - spread,
          cell.width + spread * 2,
          cell.height + spread * 2
        );
      } else if (wave.row === -2) {
        const x = cell.ox + (canvas.clientWidth - cell.ox * 2) * t;
        ctx.fillStyle = `rgba(201,255,63,${(1 - t) * .08})`;
        ctx.fillRect(x - 20, cell.oy, 40, canvas.clientHeight - cell.oy * 2);
      } else {
        ctx.beginPath();
        ctx.arc(canvas.clientWidth / 2, canvas.clientHeight / 2, t * Math.max(canvas.clientWidth, canvas.clientHeight) * .65, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  function tick(now) {
    if (state === "running" && controlMode === "auto") {
      const interval = Math.max(22, 190 / speed);
      let safety = 0;
      while (now - lastStep >= interval && safety < speed) {
        if (phase === "fill") consolidateStep(now);
        else swapStep(now);
        watchProgress(now);
        lastStep += interval;
        safety++;
        if (state !== "running") break;
      }
    }
    if (state === "running" || state === "analyzing" || state === "settling") {
      const elapsed = elapsedBeforePause + performance.now() - startedAt;
      const label = formatDuration(elapsed);
      elapsedValue.textContent = label;
      hudTime.textContent = label;
    }
    draw(now);
    requestAnimationFrame(tick);
  }

  /* 何かの取りこぼしで一歩も進まなくなっても、空回りさせずに立て直す。
     詰めなら満杯寸前のマスを確定させるか別の的へ、色そろえなら仕上げ判定へ回す */
  const STALL_LIMIT = 240;

  function watchProgress(now) {
    const mark = phase === "fill" ? completedCount : groupCursor;
    if (mark !== stallMark) {
      stallMark = mark;
      stallSteps = 0;
      return;
    }
    if (++stallSteps < STALL_LIMIT) return;
    stallSteps = 0;
    repairProgress(now);
  }

  function repairProgress(now) {
    if (phase === "fill") {
      const destination = cells[currentTarget];
      if (destination && destination.fill > 1 - DRIFT_TOLERANCE) {
        destination.fill = 1;
        completeCurrentTarget(now, false);
        return;
      }
      const retarget = findFillableTarget();
      if (retarget >= 0 && retarget !== currentTarget) {
        currentTarget = retarget;
        return;
      }
      beginGrouping(now);
      return;
    }
    advanceGroupCursor();
    beginFinish(now);
  }

  function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    return `${String(minutes).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;
  }

  function pointerIndex(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - cell.ox;
    const y = event.clientY - rect.top - cell.oy;
    const col = Math.floor(x / (cell.width + cell.gap));
    const row = Math.floor(y / (cell.height + cell.gap));
    if (col < 0 || col >= renderCols || row < 0 || row >= renderRows) return -1;
    const index = row * renderCols + col;
    return index < TOTAL ? index : -1;
  }

  function handleCanvasPointer(event) {
    const index = pointerIndex(event);
    if (index < 0) return;
    keyboardIndex = index;
    canvas.focus({ preventScroll: true });
    if (controlMode === "manual" && state === "running") {
      manualCellClick(index);
      checkManualCompletion();
    } else {
      inspectIndex(index);
    }
  }

  function handleCanvasKeydown(event) {
    const column = keyboardIndex % renderCols;
    let nextIndex = keyboardIndex;
    if (event.key === "ArrowLeft" && column > 0) nextIndex--;
    else if (event.key === "ArrowRight" && column < renderCols - 1 && keyboardIndex < TOTAL - 1) nextIndex++;
    else if (event.key === "ArrowUp" && keyboardIndex >= renderCols) nextIndex -= renderCols;
    else if (event.key === "ArrowDown" && keyboardIndex + renderCols < TOTAL) nextIndex += renderCols;
    else if (event.code === "Space" || event.key === "Enter") {
      event.preventDefault();
      if (controlMode === "manual" && state === "running") {
        manualCellClick(keyboardIndex);
        checkManualCompletion();
        if (manualSelection >= 0) keyboardIndex = manualSelection;
      } else {
        inspectIndex(keyboardIndex);
      }
      return;
    } else {
      return;
    }
    event.preventDefault();
    keyboardIndex = nextIndex;
    scrollCellIntoView(keyboardIndex);
  }

  function scrollCellIntoView(index) {
    // The entire grid always fits inside the stage; keyboard navigation never scrolls it.
  }

  function inspectIndex(index) {
    selectedIndex = index;
    const item = cells[index];
    if (!item) {
      showToast(t("toast.free", { n: cellNo(index) }));
    } else {
      showToast(t("toast.block", {
        n: cellNo(index), color: colorName(item.colorId), pct: (item.fill * 100).toFixed(0)
      }));
    }
    sfxInspect(index, Boolean(item));
  }

  function rejectCell(index, message) {
    invalidIndex = index;
    invalidUntil = performance.now() + 520;
    showToast(message, true);
    sfxInvalid(index);
  }

  function showToast(message, isError = false) {
    inspectToast.textContent = message;
    inspectToast.classList.toggle("is-error", isError);
    inspectToast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      inspectToast.classList.remove("is-visible", "is-error");
    }, 2300);
  }

  /* ================================================================= AUDIO
   *
   * iPhone で音が出ない件の下ごしらえ（../marumaru と同じ手口）。原因は3つ。
   *
   *  1) 着信スイッチが「消音」だと WebAudio は鳴らない。ページの音は既定で
   *     ambient 扱いになり、消音スイッチに従うため。playback に変えると鳴る。
   *     ・iOS 16.4 以降 … navigator.audioSession.type = "playback"
   *     ・それ以前     … 無音メディアをループ再生すると playback に切り替わる
   *  2) AudioContext は suspended で始まる。ユーザー操作の中で resume が要る。
   *  3) 一度バックグラウンドに回すと再び suspended になり、戻っても止まったまま。
   *
   * 無音メディアは外部ファイルにせず data URI で持つ（依存ゼロ・file:// でも動く）。
   */
  const SILENT_MEDIA = "data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA";

  let silentLoop = null;
  let master = null;
  let sfxBus = null;
  let musicBus = null;
  let reverbBus = null;
  let noiseSource = null;

  // 消音スイッチを無視して鳴らせる状態にする。最初のタップで一度だけ効かせる。
  // audioSession が使えるならそれで済ませる。無音ループは再生中の表示が
  // コントロールセンターに出てしまうので、古い iOS のときだけの手段にする
  function enablePlaybackAudio() {
    try {
      if (navigator.audioSession) { navigator.audioSession.type = "playback"; return; }
    } catch (error) { /* 未対応ブラウザは無音ループにまかせる */ }
    if (silentLoop) {
      if (silentLoop.paused) silentLoop.play().catch(() => {});
      return;
    }
    silentLoop = new Audio(SILENT_MEDIA);
    silentLoop.loop = true;
    silentLoop.volume = 1;        // muted や volume=0 では playback に切り替わらない
    silentLoop.setAttribute("playsinline", "");
    silentLoop.play().catch(() => {});
  }

  function audio() {
    if (!audioContext) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      audioContext = new Ctor();
      buildAudioGraph();
    }
    if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
    return audioContext;
  }

  // 出音の道すじ：各ボイス → (パン) → sfx / music バス → リミッタ → 出力。
  // リバーブは共有のセンドにして、粒の細かい音でも余韻がつながるようにする
  function buildAudioGraph() {
    const c = audioContext;
    master = c.createGain();
    master.gain.value = 0.82;   // 再開直後に音が重なっても振り切らないよう余裕をとる
    const limiter = c.createDynamicsCompressor();
    limiter.threshold.value = -13;
    limiter.knee.value = 22;
    limiter.ratio.value = 3.6;
    limiter.attack.value = 0.004;
    limiter.release.value = 0.22;
    master.connect(limiter).connect(c.destination);

    sfxBus = c.createGain();
    sfxBus.gain.value = 1.35;
    sfxBus.connect(master);

    musicBus = c.createGain();
    musicBus.gain.value = 0;
    musicBus.connect(master);

    const convolver = c.createConvolver();
    convolver.buffer = impulseResponse(c, 2.1, 2.7);
    reverbBus = c.createGain();
    reverbBus.gain.value = 0.5;
    reverbBus.connect(convolver).connect(master);
  }

  function impulseResponse(c, seconds, decay) {
    const length = Math.max(1, Math.floor(c.sampleRate * seconds));
    const buffer = c.createBuffer(2, length, c.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const t = i / length;
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
      }
    }
    return buffer;
  }

  function noiseBuffer(c) {
    if (!noiseSource) {
      noiseSource = c.createBuffer(1, Math.floor(c.sampleRate * 1.4), c.sampleRate);
      const data = noiseSource.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    return noiseSource;
  }

  function routeVoice(node, pan, send, bus) {
    const c = audioContext;
    let out = node;
    if (pan && c.createStereoPanner) {
      const panner = c.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, pan));
      out.connect(panner);
      out = panner;
    }
    out.connect(bus || sfxBus);
    if (send > 0 && reverbBus) {
      const sendGain = c.createGain();
      sendGain.gain.value = send;
      out.connect(sendGain).connect(reverbBus);
    }
  }

  // 単音。at は「今から何秒後か」。glide を渡すと終点までピッチが滑る
  function voice(frequency, options = {}) {
    const c = audio();
    if (!c) return;
    const {
      dur = 0.16, type = "triangle", vol = 0.05, at = 0, glide = 0,
      attack = 0.008, send = 0.2, pan = 0, detune = 0, bus = null
    } = options;
    const start = c.currentTime + at;
    const oscillator = c.createOscillator();
    oscillator.type = type;
    oscillator.detune.value = detune;
    oscillator.frequency.setValueAtTime(Math.max(20, frequency), start);
    if (glide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, glide), start + dur);
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    oscillator.connect(gain);
    routeVoice(gain, pan, send, bus);
    oscillator.start(start);
    oscillator.stop(start + dur + 0.05);
  }

  function noiseVoice(options = {}) {
    const c = audio();
    if (!c) return;
    const {
      dur = 0.12, vol = 0.04, at = 0, freq = 2400, sweep = 0, q = 1,
      type = "bandpass", send = 0.12, pan = 0, bus = null, attack = 0.005
    } = options;
    const start = c.currentTime + at;
    const source = c.createBufferSource();
    source.buffer = noiseBuffer(c);
    source.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(Math.max(40, freq), start);
    if (sweep) filter.frequency.exponentialRampToValueAtTime(Math.max(40, sweep), start + dur);
    filter.Q.value = q;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    source.connect(filter).connect(gain);
    routeVoice(gain, pan, send, bus);
    source.start(start);
    source.stop(start + dur + 0.05);
  }

  const tone = (frequency, options) => { if (soundEnabled) voice(frequency, options); };
  const noiseHit = (options) => { if (soundEnabled) noiseVoice(options); };

  /* --- 気持ちよさの芯：連続で決めるほどペンタトニックの音階が駆けあがる --- */
  const PENTATONIC = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24];
  const CEILING = 24;                                        // C6 より上には行かせない
  const SFX_BASE = 261.63;                                   // C4
  const hz = (semitone) => SFX_BASE * Math.pow(2, semitone / 12);

  let comboStep = -1;
  let comboAt = 0;
  let lastMergeSound = 0;
  let lastCompleteSound = 0;
  let lastRowSound = 0;
  let lastSwapSound = 0;

  // 登りきったら下へ折り返す。自動運転で延々と高音が鳴り続けるのを防ぐ
  function bumpCombo() {
    const now = performance.now();
    if (now - comboAt > 2400) comboStep = -1;
    comboAt = now;
    comboStep = (comboStep + 1) % PENTATONIC.length;
    return PENTATONIC[comboStep];
  }

  // 自動運転はこちらが操作していないので、音は間引いて控えめに鳴らす
  const isAuto = () => controlMode === "auto";
  const sfxGap = (manual, auto) => (isAuto() ? auto : manual);

  function breakCombo() { comboStep = -1; }

  function panFor(index) {
    if (!renderCols || renderCols < 2) return 0;
    return ((index % renderCols) / (renderCols - 1) - 0.5) * 1.1;
  }

  function buzz(pattern) {
    if (!soundEnabled || !navigator.vibrate) return;
    try { navigator.vibrate(pattern); } catch (error) { /* 触覚は無くてもよい */ }
  }

  // かけらが流れこむ音。満杯に近いほど倍音が増えて、詰まっていく手ごたえが出る
  function sfxMerge(index, fill) {
    const now = performance.now();
    if (now - lastMergeSound < sfxGap(32, 130)) return;
    lastMergeSound = now;
    const level = isAuto() ? 0.6 : 1;
    const frequency = hz(Math.min(bumpCombo(), CEILING));
    const pan = panFor(index);
    tone(frequency, { type: "triangle", vol: 0.05 * level, dur: 0.13, pan, send: 0.22 });
    tone(frequency * 2, { type: "sine", vol: 0.02 * level, dur: 0.24, at: 0.012, pan, send: 0.34 });
    noiseHit({ dur: 0.04, vol: 0.014 * level, freq: 5200, q: 0.8, pan, send: 0.1 });
    // いちばん耳につく倍音は、自分で操作しているときだけ足す
    if (fill > 0.8 && !isAuto()) tone(frequency * 3, { type: "sine", vol: 0.012, dur: 0.32, at: 0.03, pan, send: 0.44 });
  }

  // セルが 100% になった瞬間の鈴。音階が上がりつづけるので連鎖が快い
  function sfxCellComplete(index) {
    const now = performance.now();
    if (now - lastCompleteSound < sfxGap(0, 150)) return;
    lastCompleteSound = now;
    const level = isAuto() ? 0.55 : 1;
    const root = hz(Math.min(bumpCombo() + 12, CEILING));
    const pan = panFor(index);
    // 自動運転では上に積む倍音を減らして、耳当たりをやわらげる
    const layers = isAuto() ? [1] : [1, 1.5, 2];
    layers.forEach((ratio, layer) => {
      tone(root * ratio, {
        type: "sine", vol: (0.046 / (layer + 1)) * level, dur: 0.36 + layer * 0.12,
        at: layer * 0.014, pan, send: 0.36
      });
    });
    tone(root / 2, { type: "triangle", vol: 0.028 * level, dur: 0.15, pan, send: 0.14 });
    if (!isAuto()) noiseHit({ dur: 0.07, vol: 0.02, freq: 7200, sweep: 2600, q: 0.7, pan, send: 0.2 });
    buzz(7);
  }

  // 余りゼロでぴったり収まったとき。ふつうの完成音より一段華やかに鳴らす
  function sfxPerfectFit(index) {
    const now = performance.now();
    if (now - lastCompleteSound < sfxGap(0, 150)) return;
    lastCompleteSound = now;
    const level = isAuto() ? 0.62 : 1;
    const root = hz(Math.min(bumpCombo(), CEILING - 12));
    const pan = panFor(index);
    [0, 4, 7, 12].forEach((semitone, i) => {
      tone(root * Math.pow(2, semitone / 12), {
        type: "triangle", vol: 0.05 * level, dur: 0.34, at: i * 0.038, pan, send: 0.42
      });
    });
    tone(root * 4, { type: "sine", vol: 0.026 * level, dur: 0.7, at: 0.16, attack: 0.05, pan, send: 0.66 });
    tone(root / 2, { type: "triangle", vol: 0.034 * level, dur: 0.2, pan, send: 0.16 });
    if (!isAuto()) noiseHit({ dur: 0.34, vol: 0.024, freq: 900, sweep: 7000, q: 0.6, pan, send: 0.5 });
    buzz([10, 26, 16]);
  }

  // 一列そろったときのごほうび。左から右へ音が抜けていく
  function sfxRowComplete() {
    const now = performance.now();
    if (now - lastRowSound < sfxGap(0, 400)) return;
    lastRowSound = now;
    [0, 4, 7, 12].forEach((semitone, i) => {
      tone(hz(semitone + 12), {
        type: "triangle", vol: 0.042, dur: 0.36, at: i * 0.05,
        pan: -0.55 + i * 0.37, send: 0.42
      });
    });
    noiseHit({ dur: 0.5, vol: 0.026, freq: 420, sweep: 6500, q: 0.6, send: 0.4 });
    buzz([9, 26, 9]);
  }

  function sfxSwap(from, to) {
    const now = performance.now();
    if (now - lastSwapSound < sfxGap(0, 120)) return;
    lastSwapSound = now;
    const fromPan = panFor(from);
    const toPan = panFor(to);
    tone(392, { type: "sine", vol: 0.038, dur: 0.12, glide: 523.25, pan: fromPan, send: 0.2 });
    tone(523.25, { type: "sine", vol: 0.038, dur: 0.14, at: 0.05, glide: 392, pan: toPan, send: 0.2 });
    noiseHit({ dur: 0.17, vol: 0.018, freq: 900, sweep: 3400, q: 0.9, pan: fromPan, send: 0.24 });
  }

  function sfxSelect(index) {
    tone(hz(12), { type: "sine", vol: 0.03, dur: 0.09, pan: panFor(index), send: 0.16 });
    noiseHit({ dur: 0.03, vol: 0.012, freq: 4200, q: 1.4, pan: panFor(index), send: 0.08 });
  }

  function sfxCancel(index) {
    tone(hz(7), { type: "sine", vol: 0.026, dur: 0.11, glide: hz(0), pan: panFor(index), send: 0.14 });
  }

  function sfxInspect(index, hasData) {
    tone(hz(hasData ? 7 : -5), {
      type: "sine", vol: 0.022, dur: 0.08, pan: panFor(index), send: 0.14
    });
  }

  function sfxInvalid(index) {
    breakCombo();
    scoreCombo = 0;
    const pan = panFor(index);
    tone(184, { type: "sawtooth", vol: 0.045, dur: 0.26, glide: 74, pan, send: 0.1 });
    tone(92, { type: "square", vol: 0.03, dur: 0.28, pan, send: 0.05 });
    noiseHit({ dur: 0.1, vol: 0.018, freq: 240, q: 0.6, pan, send: 0.08 });
    buzz(42);
  }

  // 全マスが埋まって色そろえに移る合図。低い和音がふわっと立ちあがる
  function sfxGroupStart() {
    breakCombo();
    [0, 7, 12, 16].forEach((semitone, i) => {
      tone(hz(semitone), {
        type: "triangle", vol: 0.038, dur: 0.9, at: i * 0.045,
        attack: 0.12, pan: (i - 1.5) * 0.3, send: 0.5
      });
    });
    noiseHit({ dur: 0.85, vol: 0.022, freq: 200, sweep: 5200, q: 0.5, send: 0.45 });
    buzz([12, 40, 12]);
  }

  function sfxRowGrouped(colorId) {
    const root = hz([0, 3, 7, 10][colorId % 4] + 12);
    tone(root, { type: "triangle", vol: 0.04, dur: 0.3, send: 0.4 });
    tone(root * 1.5, { type: "sine", vol: 0.022, dur: 0.42, at: 0.03, send: 0.45 });
    noiseHit({ dur: 0.22, vol: 0.016, freq: 1400, sweep: 5600, q: 0.7, send: 0.3 });
  }

  // クリア。長三和音を駆けあがってから、上でしばらく光らせておく
  function sfxComplete() {
    breakCombo();
    duckMusic();
    [0, 4, 7, 12, 16, 19, 24].forEach((semitone, i) => {
      tone(hz(semitone), {
        type: "triangle", vol: 0.055, dur: 0.55, at: i * 0.075,
        pan: -0.5 + i * 0.16, send: 0.45
      });
      tone(hz(semitone) * 2, { type: "sine", vol: 0.018, dur: 0.7, at: i * 0.075 + 0.02, send: 0.55 });
    });
    [0, 7, 12, 16, 19].forEach((semitone) => {
      tone(hz(semitone + 12), { type: "sine", vol: 0.03, dur: 2.6, at: 0.62, attack: 0.3, send: 0.7 });
    });
    noiseHit({ dur: 1.3, vol: 0.03, freq: 300, sweep: 8000, q: 0.5, send: 0.6 });
    buzz([14, 40, 14, 40, 60]);
  }

  function sfxReset() {
    breakCombo();
    tone(hz(19), { type: "sine", vol: 0.035, dur: 0.34, glide: hz(0), send: 0.28 });
    noiseHit({ dur: 0.42, vol: 0.024, freq: 6200, sweep: 320, q: 0.6, send: 0.3 });
  }

  function sfxUI(up = true) {
    tone(hz(up ? 12 : 7), { type: "sine", vol: 0.03, dur: 0.1, send: 0.18 });
    if (up) tone(hz(19), { type: "sine", vol: 0.016, dur: 0.16, at: 0.05, send: 0.24 });
  }

  /* =================================================================== BGM
   *
   * ファミコンの音源に寄せた組み立て。矩形波2本＋三角波＋ノイズだけで鳴らす。
   *  ・矩形波1 … 主旋律（デューティ12.5%、ビブラート付き）
   *  ・矩形波2 … 和音のかわりの高速アルペジオ（デューティ25%）
   *  ・三角波 … ベース（フィルタなし、音量一定）
   *  ・ノイズ … キック／スネア／ハイハット
   * リバーブは通さず、リードにだけ短いディレイをかける。
   */
  const BPM = 138;
  const MUSIC_STEP = 60 / BPM / 4;
  const MUSIC_STEPS = 64;
  const MUSIC_LEVEL = 0.62;
  const MUSIC_BASE = 65.41;                                  // C2
  const mhz = (semitone) => MUSIC_BASE * Math.pow(2, semitone / 12);
  const CHORDS = [
    { bass: 0, arp: [24, 28, 31] },                          // C
    { bass: 7, arp: [26, 31, 35] },                          // G
    { bass: 9, arp: [24, 28, 33] },                          // Am
    { bass: 5, arp: [24, 29, 33] }                           // F
  ];
  // 4小節の主旋律。-1 は休符、-2 は前の音をのばす
  const LEAD = [
    40, -2, 43, -2, 45, -2, 43, -2, 40, -2, -1, -1, 36, -2, -1, -1,
    38, -2, 41, -2, 43, -2, 41, -2, 38, -2, -1, -1, 35, -2, -1, -1,
    36, -2, 40, -2, 45, -2, 44, -2, 45, -2, -1, 47, 48, -2, -2, -2,
    45, -2, 41, -2, 40, -2, 36, -2, 38, -2, 40, -2, 41, -2, -1, -1
  ];

  let musicTimer = 0;
  let musicFadeTimer = 0;
  let musicStep = 0;
  let musicNextTime = 0;
  let musicIntensity = 0;
  let pulseWaves = null;
  let leadEcho = null;

  // デューティ比つきの矩形波。これが 8bit らしさの芯になる
  function pulseWave(duty) {
    const c = audioContext;
    const harmonics = 28;
    const real = new Float32Array(harmonics);
    const imag = new Float32Array(harmonics);
    for (let k = 1; k < harmonics; k++) real[k] = (2 / (k * Math.PI)) * Math.sin(Math.PI * k * duty);
    return c.createPeriodicWave(real, imag, { disableNormalization: false });
  }

  function chipWave(duty) {
    if (!pulseWaves) pulseWaves = {};
    if (!pulseWaves[duty]) pulseWaves[duty] = pulseWave(duty);
    return pulseWaves[duty];
  }

  // リードだけに短いディレイ。チップチューン特有の粒立ちが出る
  function echoBus() {
    if (leadEcho) return leadEcho;
    const c = audioContext;
    const delay = c.createDelay(0.5);
    delay.delayTime.value = MUSIC_STEP * 3;
    const feedback = c.createGain();
    feedback.gain.value = 0.3;
    const level = c.createGain();
    level.gain.value = 0.34;
    delay.connect(feedback).connect(delay);
    delay.connect(level).connect(musicBus);
    leadEcho = delay;
    return leadEcho;
  }

  // 音量はなめらかに絞らず、段で落とす。チップの発音らしさが出る
  function chipVoice(frequency, { duty = 0.5, dur = 0.12, vol = 0.05, at = 0, pan = 0, vibrato = 0, echo = false }) {
    const c = audio();
    if (!c) return;
    const start = c.currentTime + at;
    const oscillator = c.createOscillator();
    oscillator.setPeriodicWave(chipWave(duty));
    oscillator.frequency.setValueAtTime(Math.max(20, frequency), start);
    if (vibrato) {
      const lfo = c.createOscillator();
      const depth = c.createGain();
      lfo.frequency.value = 6.2;
      depth.gain.value = vibrato;
      lfo.connect(depth).connect(oscillator.frequency);
      lfo.start(start + 0.09);
      lfo.stop(start + dur + 0.05);
    }
    const gain = c.createGain();
    gain.gain.setValueAtTime(vol, start);
    gain.gain.setValueAtTime(vol * 0.7, start + dur * 0.45);
    gain.gain.setValueAtTime(vol * 0.42, start + dur * 0.75);
    gain.gain.setValueAtTime(0, start + dur);
    oscillator.connect(gain);
    routeVoice(gain, pan, 0, musicBus);
    if (echo) gain.connect(echoBus());
    oscillator.start(start);
    oscillator.stop(start + dur + 0.02);
  }

  function startMusic() {
    if (!musicEnabled) return;
    const c = audio();
    if (!c) return;
    musicBus.gain.cancelScheduledValues(c.currentTime);
    musicBus.gain.setTargetAtTime(MUSIC_LEVEL, c.currentTime, 0.4);
    window.clearTimeout(musicFadeTimer);
    if (musicTimer) return;
    musicNextTime = c.currentTime + 0.14;
    musicTimer = window.setInterval(pumpMusic, 40);
  }

  function stopMusic() {
    if (!audioContext || !musicBus) return;
    musicBus.gain.cancelScheduledValues(audioContext.currentTime);
    musicBus.gain.setTargetAtTime(0, audioContext.currentTime, 0.2);
    window.clearTimeout(musicFadeTimer);
    musicFadeTimer = window.setTimeout(() => {
      window.clearInterval(musicTimer);
      musicTimer = 0;
    }, 900);
  }

  // クリア演出のあいだだけ BGM を下げて、ファンファーレを前に出す
  function duckMusic() {
    if (!musicTimer || !musicBus || !audioContext) return;
    const now = audioContext.currentTime;
    musicBus.gain.cancelScheduledValues(now);
    musicBus.gain.setTargetAtTime(MUSIC_LEVEL * 0.26, now, 0.08);
    musicBus.gain.setTargetAtTime(MUSIC_LEVEL, now + 2.4, 0.8);
  }

  function pumpMusic() {
    if (!musicEnabled || !audioContext || audioContext.state !== "running") return;
    while (musicNextTime < audioContext.currentTime + 0.18) {
      if (musicNextTime > audioContext.currentTime - 0.02) {
        scheduleMusicStep(musicStep, musicNextTime - audioContext.currentTime);
      }
      musicNextTime += MUSIC_STEP;
      musicStep = (musicStep + 1) % MUSIC_STEPS;
    }
  }

  function scheduleMusicStep(step, at) {
    const chord = CHORDS[Math.floor(step / 16) % CHORDS.length];
    const beat = step % 16;
    const intensity = musicIntensity;

    // ノイズ3種のドラム
    if (beat === 0 || beat === 6 || beat === 8) chipKick(at);
    if (beat === 4 || beat === 12) chipSnare(at);
    if (beat % 2 === 0 || intensity > 0.45) chipHat(at, beat % 4 === 0 ? 0.009 : 0.006);

    // 三角波のベース。8分で根音と5度／オクターブを行き来する
    if (beat % 2 === 0) {
      const jump = beat === 4 || beat === 12 ? 12 : (beat === 10 ? 7 : 0);
      chipBass(at, chord.bass + jump);
    }

    // 矩形波2：和音は鳴らさず、構成音を16分で回して和音に聞かせる
    chipArp(at, chord.arp[step % chord.arp.length], intensity);

    // 矩形波1：主旋律
    const note = LEAD[step % LEAD.length];
    if (note > 0) chipLead(at, note, LEAD[(step + 1) % LEAD.length] === -2 ? 2 : 1);
  }

  function chipLead(at, semitone, lengthInSteps) {
    chipVoice(mhz(semitone), {
      duty: 0.125, dur: MUSIC_STEP * lengthInSteps * 0.92, vol: 0.055,
      at, pan: -0.12, vibrato: 5.5, echo: true
    });
  }

  function chipArp(at, semitone, intensity) {
    chipVoice(mhz(semitone + 12), {
      duty: 0.25, dur: MUSIC_STEP * 0.6, vol: 0.018 + intensity * 0.012, at, pan: 0.3
    });
  }

  function chipBass(at, semitone) {
    voice(mhz(semitone), {
      type: "triangle", vol: 0.11, dur: MUSIC_STEP * 1.7, at,
      attack: 0.003, send: 0, bus: musicBus
    });
  }

  function chipKick(at) {
    voice(150, { type: "triangle", vol: 0.13, dur: 0.11, at, glide: 44, attack: 0.002, send: 0, bus: musicBus });
  }

  function chipSnare(at) {
    noiseVoice({ dur: 0.11, vol: 0.032, at, freq: 1500, q: 0.5, type: "highpass", send: 0, bus: musicBus });
    voice(190, { type: "triangle", vol: 0.03, dur: 0.05, at, glide: 120, send: 0, bus: musicBus });
  }

  function chipHat(at, vol) {
    noiseVoice({ dur: 0.022, vol, at, freq: 9500, q: 0.8, type: "highpass", send: 0, pan: 0.22, bus: musicBus });
  }

  function setMusicEnabled(next) {
    musicEnabled = next;
    musicToggle.setAttribute("aria-pressed", String(next));
    syncAudioLabels();
    if (next) startMusic();
    else stopMusic();
    syncSilentLoop();
  }

  function setSoundEnabled(next) {
    soundEnabled = next;
    soundToggle.setAttribute("aria-pressed", String(next));
    syncAudioLabels();
    syncSilentLoop();
  }

  function syncAudioLabels() {
    soundToggle.setAttribute("aria-label", t(soundEnabled ? "aria.soundOff" : "aria.soundOn"));
    musicToggle.setAttribute("aria-label", t(musicEnabled ? "aria.musicOff" : "aria.musicOn"));
    const wantAudio = introAudio.getAttribute("aria-pressed") === "true";
    introAudio.setAttribute("aria-label", t(wantAudio ? "aria.soundOff" : "aria.soundOn"));
  }

  // 音を全部切っているあいだは無音ループも止める。
  // 鳴らさないのに「再生中」がコントロールセンターに残るのは気持ちが悪いため
  function syncSilentLoop() {
    if (!silentLoop) return;
    if (soundEnabled || musicEnabled) {
      if (silentLoop.paused) silentLoop.play().catch(() => {});
    } else if (!silentLoop.paused) {
      silentLoop.pause();
    }
  }

  // iOS はユーザー操作の中でしか解錠できないので、最初のタップ／キーで一度だけ
  function unlockAudio() {
    enablePlaybackAudio();
    const c = audio();
    if (!c) return;
    try {
      const buffer = c.createBuffer(1, 1, 22050);
      const source = c.createBufferSource();
      source.buffer = buffer;
      source.connect(c.destination);
      source.start(0);
    } catch (error) { /* 解錠できないブラウザでも先に進む */ }
  }

  ["pointerdown", "touchstart", "keydown"].forEach((type) => {
    window.addEventListener(type, unlockAudio, { once: true, passive: true });
  });

  // バックグラウンドから戻ると suspended のままなので鳴らし直せるようにする
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    if (audioContext && audioContext.state === "suspended") audioContext.resume().catch(() => {});
    syncSilentLoop();
  });

  function resetGame() {
    hasStarted = true;
    if (musicEnabled) startMusic();
    configureGrid();
    createField();
    hudTime.textContent = "00:00";
    startedAt = performance.now();
    lastStep = performance.now();
    setState("running");
    updateModeButtons();
    stage.scrollTo({ left: 0, top: 0, behavior: "auto" });
    focusFirstCell();
    sfxReset();
  }

  /* --------------------------------------------------- 遊び方オーバーレイ */
  // 起動時はここで止め、START のタップをそのまま音の解錠に使う（iOS 対策）
  function openIntro(mode) {
    introMode = mode;
    introStart.textContent = t(mode === "start" ? "intro.start" : "intro.close");
    introAudio.hidden = mode !== "start";
    introOverlay.classList.add("is-visible");
    window.requestAnimationFrame(() => introStart.focus({ preventScroll: true }));
  }

  function closeIntro() {
    introOverlay.classList.remove("is-visible");
  }

  function startGame() {
    hasStarted = true;
    unlockAudio();
    const wantAudio = introAudio.getAttribute("aria-pressed") === "true";
    setSoundEnabled(wantAudio && settings.sound);
    setMusicEnabled(wantAudio && settings.music);
    closeIntro();
    elapsedBeforePause = 0;
    startedAt = performance.now();
    lastStep = performance.now();
    setState("running");
    updateModeButtons();
    canvas.focus({ preventScroll: true });
    focusFirstCell();
    sfxUI(true);
  }

  introAudio.addEventListener("click", () => {
    const next = introAudio.getAttribute("aria-pressed") !== "true";
    introAudio.setAttribute("aria-pressed", String(next));
    syncAudioLabels();
  });
  langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyLanguage(button.dataset.lang);
      sfxUI(true);
    });
  });
  function setMenuOpen(open) {
    deckMenu.hidden = !open;
    menuToggle.setAttribute("aria-expanded", String(open));
  }

  menuToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    setMenuOpen(deckMenu.hidden);
    sfxUI(!deckMenu.hidden);
  });
  // 盤面や外側を触ったら閉じる。中の操作では閉じない
  deckMenu.addEventListener("click", (event) => event.stopPropagation());
  document.addEventListener("click", () => { if (!deckMenu.hidden) setMenuOpen(false); });

  introStart.addEventListener("click", () => {
    if (introMode === "start") startGame();
    else { closeIntro(); sfxUI(true); }
  });
  helpToggle.addEventListener("click", () => {
    setMenuOpen(false);
    if (introOverlay.classList.contains("is-visible")) {
      if (introMode === "start") startGame();
      else closeIntro();
      return;
    }
    openIntro(hasStarted ? "help" : "start");
    sfxUI(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!deckMenu.hidden) { setMenuOpen(false); return; }
    if (!introOverlay.classList.contains("is-visible")) return;
    if (introMode === "start") startGame();
    else closeIntro();
  });

  resetButton.addEventListener("click", () => { setMenuOpen(false); resetGame(); });
  playAgainButton.addEventListener("click", resetGame);
  soundToggle.addEventListener("click", () => {
    unlockAudio();
    setSoundEnabled(!soundEnabled);
    settings.sound = soundEnabled;
    saveSettings();
    sfxUI(soundEnabled);
  });
  musicToggle.addEventListener("click", () => {
    unlockAudio();
    setMusicEnabled(!musicEnabled);
    settings.music = musicEnabled;
    saveSettings();
    sfxUI(musicEnabled);
  });
  function applySpeed(value) {
    speed = value;
    settings.speed = value;
    saveSettings();
    speedButtons.forEach((item) => item.classList.toggle("is-active", Number(item.dataset.speed) === value));
  }

  function applyCellScale(value) {
    cellScale = value;
    settings.cellScale = value;
    saveSettings();
    sizeButtons.forEach((item) => item.classList.toggle("is-active", Number(item.dataset.size) === value));
  }

  speedButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applySpeed(Number(button.dataset.speed));
      sfxUI(speed >= 1);
    });
  });
  sizeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextCellScale = Number(button.dataset.size);
      if (nextCellScale === cellScale) return;
      if (!window.confirm(t("confirm.cellSize"))) return;
      applyCellScale(nextCellScale);
      resetGame();
      resizeCanvas();
      showToast(t("toast.cellSize", { size: t(`size.${cellScale}`), total: TOTAL }));
    });
  });
  modeToggle.addEventListener("click", () => {
    setControlMode(controlMode === "manual" ? "auto" : "manual");
    checkManualCompletion();
  });
  canvas.addEventListener("click", handleCanvasPointer);
  canvas.addEventListener("keydown", handleCanvasKeydown);
  canvas.addEventListener("focus", () => { keyboardActive = true; });
  canvas.addEventListener("blur", () => { keyboardActive = false; });
  new ResizeObserver(resizeCanvas).observe(stage);
  // ヘッダーの高さを CSS に返し、盤面が画面の残りをきっちり使えるようにする
  const topbar = document.querySelector(".topbar");
  new ResizeObserver(() => {
    document.documentElement.style.setProperty("--deck-h", `${Math.round(topbar.offsetHeight + 14)}px`);
  }).observe(topbar);

  window.setInterval(() => {
    clock.textContent = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    }).format(new Date());
  }, 1000);

  loadSettings();
  applySpeed(settings.speed);
  applyCellScale(settings.cellScale);
  introAudio.setAttribute("aria-pressed", String(settings.sound || settings.music));
  /* ロゴ画像を置いたら、そちらをそのまま使う。
     logo.png … ヘッダーと起動画面のロゴ（無ければ組みこみの SVG のまま）
     用意が無いときに読みこみを試すのは1回だけにしておく */
  const LOGO_FILE = "logo.png";

  (function useLogoFile() {
    const images = [...document.querySelectorAll(".brand__logo, .intro-logo__img")];
    if (!images.length) return;
    const probe = new Image();
    probe.onload = () => {
      images.forEach((image) => {
        image.src = LOGO_FILE;
        image.hidden = false;
      });
      document.querySelectorAll(".brand__mark, .brand__name, .intro-logo__mark, .intro-logo__word")
        .forEach((node) => { node.style.display = "none"; });
    };
    probe.src = LOGO_FILE;
  })();

  applyLanguage(detectLanguage());
  configureGrid();
  createField();
  controlMode = "manual";
  controlDeck.classList.add("is-manual");
  updateModeButtons();
  resizeCanvas();
  requestAnimationFrame(tick);
  openIntro("start");
})();
