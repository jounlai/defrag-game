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
  const cellSizeControl = document.querySelector("#cellSizeControl");

  const DESKTOP_COLS = 48;
  const DESKTOP_ROWS = 20;
  const MOBILE_COLS = 24;
  const MOBILE_ROWS = 40;
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
  const COLOR_NAMES = ["BLUE", "GREEN", "MAGENTA", "ORANGE"];
  const FILE_NAMES = [
    "IMAGE CACHE", "DOCUMENT SET", "AUDIO BUFFER", "PROJECT DATA",
    "ARCHIVE CHUNK", "INDEX TABLE", "MEDIA STREAM", "TEMPORARY DATA"
  ];

  let cells = [];
  let state = "idle";
  let controlMode = "manual";
  let phase = "fill";
  let currentTarget = 0;
  let manualSelection = -1;
  let finalized = [];
  let completedCount = 0;
  let sideRunRemaining = 0;
  let jumpCooldown = 0;
  let groupCursor = 0;
  let speed = 1;
  let cellScale = 1;
  let actions = 0;
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
  let audioContext = null;
  let soundEnabled = false;
  let toastTimer = null;
  let cell = { width: 0, height: 0, gap: 0, ox: 0, oy: 0 };
  let renderCols = COLS;
  let renderRows = ROWS;

  function configureGrid() {
    const compact = stage.clientWidth <= 560;
    const baseCols = compact ? MOBILE_COLS : DESKTOP_COLS;
    const baseRows = compact ? MOBILE_ROWS : DESKTOP_ROWS;
    const nextCols = Math.max(4, Math.ceil(baseCols / cellScale));
    const nextRows = Math.max(4, Math.ceil(baseRows / cellScale));

    COLS = nextCols;
    ROWS = nextRows;
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
          if (fileVolume - size < 0.15) size = fileVolume;
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
    phase = "fill";
    currentTarget = 0;
    manualSelection = -1;
    finalized = Array(TOTAL).fill(false);
    completedCount = 0;
    sideRunRemaining = 0;
    jumpCooldown = 0;
    groupCursor = 0;
    groupOrder = Array.from({ length: COLOR_COUNT }, (_, index) => index);
    selectedIndex = -1;
    keyboardIndex = 0;
    invalidIndex = -1;
    invalidUntil = 0;
    transitions = [];
    shockwaves = [];
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
      fragmentedLabel.textContent = "LOOSE PIECES";
      liveStatus.textContent = "FIELD READY";
      phaseLabel.textContent = "AWAITING COMMAND";
      operationText.textContent = "The fragment field is ready. Begin when you are.";
    } else if (next === "analyzing") {
      liveStatus.textContent = "READING FRAGMENTS";
      phaseLabel.textContent = "MAPPING DATA DENSITY";
      operationText.textContent = "Measuring free capacity inside each fragment ...";
    } else if (next === "running") {
      liveStatus.textContent = controlMode === "manual"
        ? "AWAITING CELL SELECTION"
        : (phase === "fill" ? "FILLING CURRENT CELL" : "SWAPPING COLOR CELLS");
      phaseLabel.textContent = controlMode === "manual"
        ? (phase === "fill" ? "SELECT SOURCE, THEN TARGET" : "SELECT TWO CELLS TO SWAP")
        : (phase === "fill"
          ? `CONSOLIDATING CELL ${String(currentTarget + 1).padStart(3, "0")}`
          : `GROUPING ${COLOR_NAMES[expectedColor(Math.min(groupCursor, TARGET_CELLS - 1))]}`);
      if (controlMode === "manual") {
        operationText.textContent = phase === "fill"
          ? "Tap a source fragment, then tap the cell you want to fill."
          : "Tap two cells to swap their positions.";
      }
    } else if (next === "paused") {
      liveStatus.textContent = "PROCESS PAUSED";
      phaseLabel.textContent = "CONSOLIDATION PAUSED";
      operationText.textContent = "The current fragment map has been preserved.";
    } else if (next === "settling") {
      liveStatus.textContent = "VERIFYING FIELD";
      phaseLabel.textContent = "LOCKING DATA IN PLACE";
      operationText.textContent = "Checking the final data boundaries ...";
    } else if (next === "complete") {
      liveStatus.textContent = "COLOR FIELD GROUPED";
      phaseLabel.textContent = "FILL AND SWAP COMPLETE";
      operationText.textContent = "Every cell is full and all four color regions are aligned.";
    }
  }

  function chooseSource(target, remaining) {
    const targetColor = cells[target]?.fill > EPSILON ? cells[target].colorId : null;
    const sources = dataIndices().filter((index) => {
      if (index === target || isProtected(index) || cells[index].fill <= EPSILON) return false;
      return targetColor === null || cells[index].colorId === targetColor;
    });
    if (!sources.length) return -1;

    const exactFits = sources
      .filter((index) => Math.abs(cells[index].fill - remaining) <= FIT_EPSILON)
      .sort((a, b) => manhattan(a, target) - manhattan(b, target));
    if (exactFits.length) return exactFits[0];

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
      return !cells[index] || (
        cells[index].colorId === remainderColor && 1 - cells[index].fill >= remainder - EPSILON
      );
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

  function storeRemainder(storageIndex, source) {
    const remainder = source.fill;
    const segments = source.segments.map((segment) => ({ ...segment }));
    if (!cells[storageIndex]) {
      cells[storageIndex] = {
        kind: "data",
        fill: remainder,
        segments,
        colorId: source.colorId,
        shade: source.shade
      };
    } else {
      cells[storageIndex].segments.push(...segments);
      cells[storageIndex].fill = Math.min(1, cells[storageIndex].fill + remainder);
    }
  }

  function targetEase(index, sources = dataIndices()) {
    if (index < 0 || index >= TARGET_CELLS || finalized[index]) return -Infinity;
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

    let score = fill * 8;
    if (nearestExact < Infinity) score += Math.max(5, 20 - nearestExact);
    score += Math.min(1, nearbyVolume / Math.max(EPSILON, remaining)) * 8;
    return score;
  }

  function chooseNextTarget(previous) {
    const base = finalized.findIndex((done) => !done);
    if (base < 0) return { index: TARGET_CELLS, reason: "complete" };
    const sources = dataIndices();

    const continuation = previous + 1;
    const wasInSideRun = sideRunRemaining > 0;
    if (
      sideRunRemaining > 0 &&
      continuation < TARGET_CELLS &&
      !finalized[continuation] &&
      targetEase(continuation, sources) >= 10
    ) {
      sideRunRemaining--;
      if (sideRunRemaining === 0) jumpCooldown = 6;
      return { index: continuation, reason: "nearby-run" };
    }
    sideRunRemaining = 0;
    if (wasInSideRun) {
      jumpCooldown = 5;
      return { index: base, reason: "sequential" };
    }

    if (completedCount < 10 || jumpCooldown > 0) {
      if (jumpCooldown > 0) jumpCooldown--;
      return { index: base, reason: "sequential" };
    }

    const baseScore = targetEase(base, sources);
    let best = { index: base, score: baseScore };
    const candidates = [];
    for (let index = base + 24; index < TARGET_CELLS; index++) {
      if (!finalized[index] && cells[index]) candidates.push(index);
    }
    candidates.sort((a, b) => (cells[b]?.fill || 0) - (cells[a]?.fill || 0));
    for (const index of candidates.slice(0, 72)) {
      const score = targetEase(index, sources);
      if (score > best.score) best = { index, score };
    }
    if (best.index !== base && best.score >= 14 && best.score > baseScore + 3) {
      sideRunRemaining = 7;
      return { index: best.index, reason: "nearby-opportunity" };
    }
    return { index: base, reason: "sequential" };
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
    if (completedCount >= TARGET_CELLS) {
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
      destination.fill = 1;
      completeCurrentTarget(now);
      return;
    }

    const remaining = 1 - destination.fill;
    const sourceIndex = forcedSourceIndex >= 0 ? forcedSourceIndex : chooseSource(currentTarget, remaining);
    if (sourceIndex < 0) {
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
      if (remainderTo >= 0) {
        if (remainderTo !== sourceIndex) {
          storeRemainder(remainderTo, source);
          cells[sourceIndex] = null;
        }
      }
    } else {
      cells[sourceIndex] = null;
    }

    transitions.push({
      kind: "merge", from: sourceIndex, to: currentTarget, time: now, duration: 260,
      beforeFrom, beforeTo, afterFrom: cells[sourceIndex]?.fill || 0, afterTo: destination.fill,
      amount, remainderAmount, remainderTo, sourceColor: source.colorId
    });
    recordAction();
    if (remainderTo >= 0) {
      const anchorDistance = manhattan(
        remainderTo,
        controlMode === "manual" ? currentTarget : sourceIndex
      );
      const remainderLocation = controlMode === "manual"
        ? (remainderTo === sourceIndex ? "source" : "target-neighbor")
        : (anchorDistance === 1 ? "adjacent" : "nearest");
      operationText.textContent = `Split ${sourceIndex}: ${(amount * 100).toFixed(0)}% to target · ${(remainderAmount * 100).toFixed(0)}% remainder → ${remainderLocation} cell ${remainderTo}`;
    } else {
      const exact = Math.abs(beforeFrom - remaining) <= FIT_EPSILON;
      operationText.textContent = `${exact ? "Exact fit" : "Merged"} ${sourceIndex} → target ${String(currentTarget).padStart(3, "0")} · ${(destination.fill * 100).toFixed(0)}% full`;
    }
    phaseLabel.textContent = `FILLING CELL ${String(currentTarget + 1).padStart(3, "0")} / ${TARGET_CELLS}`;
    if (destination.fill >= 1 - EPSILON) {
      completeCurrentTarget(now);
      if (controlMode === "manual" && remainderTo >= 0 && cells[remainderTo]) {
        manualSelection = remainderTo;
        selectedIndex = remainderTo;
        phaseLabel.textContent = `REMAINDER ${String(remainderTo + 1).padStart(3, "0")} · SELECT NEXT TARGET`;
        showToast(`REMAINDER ${(cells[remainderTo].fill * 100).toFixed(0)}% · SELECTED AS NEXT SOURCE`);
      }
    } else if (controlMode === "manual") {
      manualSelection = currentTarget;
      selectedIndex = currentTarget;
      phaseLabel.textContent = `SOURCE ${String(currentTarget + 1).padStart(3, "0")} · SELECT NEXT TARGET`;
      showToast(`CELL ${String(currentTarget).padStart(3, "0")} IS ${(destination.fill * 100).toFixed(0)}% · SELECTED AS NEXT SOURCE`);
    }
  }

  function completeCurrentTarget(now) {
    const completed = currentTarget;
    cells[completed].fill = 1;
    finalized[completed] = true;
    completedCount++;
    const next = controlMode === "auto"
      ? chooseNextTarget(completed)
      : { index: finalized.findIndex((done) => !done), reason: "manual" };
    if (next.index < 0) next.index = TARGET_CELLS;
    currentTarget = next.index;
    manualSelection = -1;
    if (controlMode === "manual") selectedIndex = -1;
    shockwaves.push({ row: Math.floor(completed / renderCols), column: completed % renderCols, time: now + 80, duration: 360 });
    if (next.reason === "nearby-opportunity") {
      operationText.textContent = `Near-fit cluster detected · switching ahead to cell ${String(next.index + 1).padStart(3, "0")}`;
      phaseLabel.textContent = `NEAR-FIT DETECTED · CELL ${String(next.index + 1).padStart(3, "0")}`;
    } else if (next.reason === "nearby-run") {
      operationText.textContent = `Adjacent cell can be completed quickly · continuing at ${String(next.index + 1).padStart(3, "0")}`;
      phaseLabel.textContent = `LOCAL RUN · CELL ${String(next.index + 1).padStart(3, "0")}`;
    }
    beep(235 + (completed % renderCols) * 1.4, 0.018);
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

  function advanceGroupCursor() {
    while (
      groupCursor < TARGET_CELLS &&
      cells[groupCursor]?.colorId === expectedColor(groupCursor)
    ) groupCursor++;
  }

  function beginGrouping(now) {
    phase = "group";
    fragmentedLabel.textContent = "MISPLACED COLORS";
    establishGroupOrder();
    groupCursor = 0;
    advanceGroupCursor();
    if (isFieldOrganized()) {
      beginFinish(now);
      return;
    }
    setState("running");
    operationText.textContent = "All cells reached 100%. Beginning color SWAP pass ...";
    shockwaves.push({ row: -2, time: now, duration: 850 });
    beep(410, 0.06);
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
      if (cells[index]?.colorId === wanted) candidates.push(index);
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
      time: now, duration: 300, sourceColor: wanted
    });
    actions++;
    operationText.textContent = `SWAP ${String(swapTarget).padStart(3, "0")} ↔ ${String(sourceIndex).padStart(3, "0")} · ${COLOR_NAMES[wanted]} joined its region`;
    advanceGroupCursor();
    phaseLabel.textContent = groupCursor < TARGET_CELLS
      ? `GROUPING ${COLOR_NAMES[expectedColor(groupCursor)]} · CELL ${String(groupCursor + 1).padStart(3, "0")}`
      : "VERIFYING FOUR COLOR REGIONS";
    if (groupCursor % COLS === 0) {
      shockwaves.push({ row: Math.floor((groupCursor - 1) / renderCols), time: now + 80, duration: 520 });
      beep(350 + expectedColor(Math.max(0, groupCursor - 1)) * 75, 0.04);
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
        rejectCell(index, "THIS CELL IS EMPTY · SELECT A DATA SOURCE");
        return;
      }
      manualSelection = index;
      selectedIndex = index;
      const completed = cells[index].fill >= 1 - EPSILON;
      showToast(completed
        ? `COMPLETED CELL ${String(index).padStart(3, "0")} · CHOOSE MOVE / SWAP DESTINATION`
        : `SOURCE ${String(index).padStart(3, "0")} SELECTED · CHOOSE ${COLOR_NAMES[cells[index].colorId]} TARGET`
      );
      phaseLabel.textContent = completed
        ? `COMPLETED ${String(index + 1).padStart(3, "0")} · SELECT DESTINATION`
        : `SOURCE ${String(index + 1).padStart(3, "0")} · SELECT TARGET`;
      return;
    }

    if (index === manualSelection) {
      manualSelection = -1;
      selectedIndex = -1;
      phaseLabel.textContent = "SELECT SOURCE, THEN TARGET";
      showToast("SELECTION CANCELLED");
      return;
    }
    const sourceIndex = manualSelection;
    const source = cells[sourceIndex];
    if (source.fill >= 1 - EPSILON) {
      moveCompletedCell(sourceIndex, index);
      return;
    }
    if (finalized[index]) {
      rejectCell(index, "THIS CELL IS ALREADY COMPLETED");
      return;
    }
    const target = cells[index];
    if (target?.colorId !== null && target?.colorId !== undefined && target.colorId !== source.colorId) {
      rejectCell(index, `COLOR MISMATCH · SELECT A ${COLOR_NAMES[source.colorId]} TARGET`);
      return;
    }
    if (target?.fill >= 1 - EPSILON) {
      currentTarget = index;
      completeCurrentTarget(performance.now());
      showToast(`TARGET ${String(index).padStart(3, "0")} WAS ALREADY 100%`);
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
      time: performance.now(), duration: 300, sourceColor
    });
    actions++;
    manualSelection = -1;
    selectedIndex = -1;
    const firstOpen = finalized.findIndex((done) => !done);
    currentTarget = firstOpen < 0 ? TARGET_CELLS : firstOpen;
    operationText.textContent = cells[from]
      ? `COMPLETED CELL ${String(from).padStart(3, "0")} ↔ ${String(to).padStart(3, "0")} SWAPPED`
      : `COMPLETED CELL MOVED ${String(from).padStart(3, "0")} → ${String(to).padStart(3, "0")}`;
    phaseLabel.textContent = "SELECT SOURCE, THEN TARGET";
    updateStats();
    beep(320, 0.03);
  }

  function manualSwapClick(index) {
    if (manualSelection < 0) {
      manualSelection = index;
      selectedIndex = index;
      showToast(`SWAP CELL ${String(index).padStart(3, "0")} · SELECT PARTNER`);
      return;
    }
    if (index === manualSelection) {
      manualSelection = -1;
      selectedIndex = -1;
      phaseLabel.textContent = "SELECT TWO CELLS TO SWAP";
      showToast("SWAP SELECTION CANCELLED");
      return;
    }

    const first = manualSelection;
    const firstColor = cells[first]?.colorId ?? null;
    [cells[first], cells[index]] = [cells[index], cells[first]];
    transitions.push({
      kind: "swap", from: index, to: first, partner: index,
      time: performance.now(), duration: 300, sourceColor: cells[first]?.colorId ?? 0
    });
    actions++;
    manualSelection = -1;
    selectedIndex = index;
    groupCursor = 0;
    advanceGroupCursor();
    operationText.textContent = `MANUAL SWAP ${String(first).padStart(3, "0")} ↔ ${String(index).padStart(3, "0")} · ${firstColor === null ? "FREE SPACE" : COLOR_NAMES[firstColor]} exchanged`;
    phaseLabel.textContent = "SELECT TWO CELLS TO SWAP";
    updateStats();
    beep(300, 0.025);
    if (isFieldOrganized()) beginFinish(performance.now());
  }

  function setControlMode(nextMode) {
    controlMode = nextMode;
    manualSelection = -1;
    selectedIndex = -1;
    controlDeck.classList.toggle("is-manual", nextMode === "manual");
    if (phase === "fill") {
      const firstOpen = finalized.findIndex((done) => !done);
      currentTarget = firstOpen < 0 ? TARGET_CELLS : firstOpen;
    }
    if (state !== "complete" && state !== "settling") {
      if (state !== "running") startedAt = performance.now();
      lastStep = performance.now();
      setState("running");
    } else {
      operationText.textContent = "Reset the field to start again.";
    }
    updateModeButtons();
  }

  function updateModeButtons() {
    const isAuto = controlMode === "auto";
    modeToggle.dataset.currentMode = controlMode;
    modeToggle.classList.toggle("is-active", !isAuto);
    modeToggle.setAttribute("aria-pressed", String(isAuto));
    modeToggle.setAttribute(
      "aria-label",
      isAuto ? "自動モード。手動モードへ切り替え" : "手動モード。自動モードへ切り替え"
    );
  }

  function recordAction() {
    actions++;
    updateStats();
  }

  function beginFinish(now) {
    if (!isFieldOrganized()) {
      if (phase === "fill") beginGrouping(now);
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
    beep(470, 0.07);
    window.setTimeout(() => beep(620, 0.09), 100);
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
    healthValue.textContent = String(organization);
    healthRing.style.setProperty("--health", organization);
    densityValue.textContent = `${density}%`;
    capacityBar.style.width = `${density}%`;
  }

  function resizeCanvas() {
    const viewportWidth = stage.clientWidth;
    const viewportHeight = stage.clientHeight;
    const previousCols = COLS;
    const previousRows = ROWS;
    configureGrid();
    if (cells.length && (previousCols !== COLS || previousRows !== ROWS)) {
      createField();
      startedAt = performance.now();
      lastStep = performance.now();
      setState("running");
      updateModeButtons();
    }

    const surfaceWidth = viewportWidth;
    const surfaceHeight = viewportHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(surfaceWidth * dpr);
    canvas.height = Math.round(surfaceHeight * dpr);
    canvas.style.width = `${surfaceWidth}px`;
    canvas.style.height = `${surfaceHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const padding = viewportWidth < 550 ? 10 : 18;
    const gap = viewportWidth < 550 ? 1.5 : 2;
    cell.gap = gap;
    cell.width = (surfaceWidth - padding * 2 - gap * (renderCols - 1)) / renderCols;
    cell.height = Math.min(cell.width * 1.28, (surfaceHeight - padding * 2 - gap * (renderRows - 1)) / renderRows);
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
      if (!item) {
        if (active?.from === i) {
          if (active.remainderAmount > EPSILON) drawSplitGhost(x, y, active, now);
          drawActiveEdge(x, y, active, now, "source");
        }
        if (shouldDrawCursor(i)) drawTargetCursor(x, y, now);
        if (i === invalidIndex && now < invalidUntil) drawInvalidCursor(x, y, now);
        if (keyboardActive && i === keyboardIndex) drawKeyboardCursor(x, y, now);
        continue;
      }

      drawDataCell(item, x, y, state === "complete");

      if (active) {
        const role = active.to === i ? "target" : (active.remainderTo === i ? "remainder" : "source");
        drawActiveEdge(x, y, active, now, role);
      }
      if (shouldDrawCursor(i)) drawTargetCursor(x, y, now);
      if (i === invalidIndex && now < invalidUntil) drawInvalidCursor(x, y, now);
      if (keyboardActive && i === keyboardIndex) drawKeyboardCursor(x, y, now);
      if (i === selectedIndex) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 1.5, y - 1.5, cell.width + 3, cell.height + 3);
      }
    }

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

  function drawKeyboardCursor(x, y, now) {
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.globalAlpha = .72 + Math.sin(now / 190) * .18;
    ctx.lineWidth = 1.25;
    ctx.setLineDash([3, 2]);
    ctx.strokeRect(x - 3, y - 3, cell.width + 6, cell.height + 6);
    ctx.restore();
  }

  function drawSplitGhost(x, y, transition, now) {
    const t = Math.min(1, Math.max(0, (now - transition.time) / transition.duration));
    const fullHeight = cell.height * transition.beforeFrom;
    const splitRatio = transition.amount / transition.beforeFrom;
    ctx.save();
    ctx.globalAlpha = (1 - t) * .68;
    ctx.fillStyle = DATA_SHADES[transition.sourceColor ?? 0];
    ctx.fillRect(x, y + cell.height - fullHeight, cell.width, fullHeight);
    ctx.strokeStyle = "#f4ffd7";
    ctx.lineWidth = 1;
    const splitY = y + cell.height - fullHeight + fullHeight * splitRatio;
    ctx.beginPath();
    ctx.moveTo(x - 1, splitY);
    ctx.lineTo(x + cell.width + 1, splitY);
    ctx.stroke();
    ctx.restore();
  }

  function drawDataCell(item, x, y, completed) {
    const partial = item.fill < 1 - EPSILON && !completed;
    const fillHeight = Math.max(1, cell.height * item.fill);
    const color = DATA_SHADES[item.colorId ?? item.shade ?? 0];
    ctx.globalAlpha = partial ? .13 : .18;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, cell.width, cell.height);
    ctx.fillStyle = color;
    ctx.globalAlpha = partial ? .76 : .92;
    ctx.fillRect(x, y + cell.height - fillHeight, cell.width, fillHeight);

    if (partial && item.segments.length > 1 && cell.height > 5) {
      let offset = 0;
      ctx.strokeStyle = "rgba(8,14,13,.52)";
      ctx.lineWidth = .65;
      item.segments.slice(0, -1).forEach((segment) => {
        offset += segment.size;
        const lineY = y + cell.height - fillHeight + cell.height * offset;
        ctx.beginPath();
        ctx.moveTo(x, lineY);
        ctx.lineTo(x + cell.width, lineY);
        ctx.stroke();
      });
    }
    if (item.fill >= 1 - EPSILON) {
      const markSize = Math.max(1.5, Math.min(3, cell.width * .24));
      ctx.globalAlpha = .95;
      ctx.fillStyle = "#eaffb2";
      ctx.fillRect(x + 1, y + 1, markSize, markSize);
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
        lastStep += interval;
        safety++;
        if (state !== "running") break;
      }
    }
    if (state === "running" || state === "analyzing" || state === "settling") {
      const elapsed = elapsedBeforePause + performance.now() - startedAt;
      elapsedValue.textContent = formatDuration(elapsed);
    }
    draw(now);
    requestAnimationFrame(tick);
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
      showToast(`BLOCK ${String(index).padStart(4, "0")}  ·  FREE SPACE`);
    } else {
      const names = [...new Set(item.segments.map((segment) => FILE_NAMES[segment.fileId % FILE_NAMES.length]))];
      showToast(`BLOCK ${String(index).padStart(4, "0")}  ·  ${COLOR_NAMES[item.colorId]}  ·  ${(item.fill * 100).toFixed(0)}% FULL  ·  ${names.length} PIECE${names.length === 1 ? "" : "S"}`);
    }
    beep(item ? 230 : 120, 0.025);
  }

  function rejectCell(index, message) {
    invalidIndex = index;
    invalidUntil = performance.now() + 520;
    showToast(message, true);
    beep(105, 0.035);
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

  function beep(frequency, duration) {
    if (!soundEnabled) return;
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.016, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }

  function resetGame() {
    createField();
    startedAt = performance.now();
    lastStep = performance.now();
    setState("running");
    updateModeButtons();
    stage.scrollTo({ left: 0, top: 0, behavior: "auto" });
    beep(190, 0.06);
  }

  resetButton.addEventListener("click", resetGame);
  playAgainButton.addEventListener("click", resetGame);
  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundToggle.setAttribute("aria-label", soundEnabled ? "サウンドをオフにする" : "サウンドをオンにする");
    beep(440, 0.05);
  });
  speedButtons.forEach((button) => {
    button.addEventListener("click", () => {
      speed = Number(button.dataset.speed);
      speedButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      beep(250 + speed * 12, 0.03);
    });
  });
  cellSizeControl.addEventListener("change", () => {
    const nextCellScale = Number(cellSizeControl.value);
    if (nextCellScale === cellScale) return;
    const confirmed = window.confirm("マスのサイズを変更すると、現在のゲームはリセットされます。変更してもよろしいですか？");
    if (!confirmed) {
      cellSizeControl.value = String(cellScale);
      return;
    }
    cellScale = nextCellScale;
    configureGrid();
    resetGame();
    resizeCanvas();
    const sizeName = ["SMALL", "MEDIUM", "LARGE"][cellScale - 1];
    showToast(`CELL SIZE ${sizeName} · ${TOTAL} BLOCKS · GAME RESET`);
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

  window.setInterval(() => {
    clock.textContent = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    }).format(new Date());
  }, 1000);

  configureGrid();
  createField();
  startedAt = performance.now();
  lastStep = performance.now();
  setControlMode("manual");
  resizeCanvas();
  requestAnimationFrame(tick);
})();
