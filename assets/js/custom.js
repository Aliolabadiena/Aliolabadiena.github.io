/**
 * LAB: Flip Card Memory game (Contact section)
 * - Renders board dynamically (no HTML tables)
 * - Difficulty: Easy 4x3, Hard 6x4
 * - Stats: moves (flips), attempts (pair tries), matched pairs
 * - Buttons: Start, Atnaujinti (reset)
 */

(() => {
  "use strict";

  // ---- Data set (>= 12 unique items for "hard" 6x4 = 12 pairs) ----
  const ITEMS = [
    { key: "html",  label: "HTML",  icon: "🟧" },
    { key: "css",   label: "CSS",   icon: "🟦" },
    { key: "js",    label: "JS",    icon: "🟨" },
    { key: "node",  label: "Node",  icon: "🟩" },
    { key: "git",   label: "Git",   icon: "🔧" },
    { key: "sql",   label: "SQL",   icon: "🗄️" },
    { key: "api",   label: "API",   icon: "🔌" },
    { key: "bug",   label: "Debug", icon: "🐞" },
    { key: "cloud", label: "Cloud", icon: "☁️" },
    { key: "lock",  label: "Auth",  icon: "🔒" },
    { key: "ui",    label: "UI",    icon: "🎛️" },
    { key: "rocket",label: "Deploy",icon: "🚀" },
    { key: "cpu",   label: "CPU",   icon: "🧠" },
    { key: "moon",  label: "Night", icon: "🌙" },
    { key: "star",  label: "Star",  icon: "⭐" },
    { key: "spark", label: "Spark", icon: "✨" }
  ];

  const CONFIG = {
    easy: { cols: 4, rows: 3, pairs: 6 },
    hard: { cols: 6, rows: 4, pairs: 12 }
  };

  const SELECTORS = {
    section: "#memory-game-section",
    board: "#mg-board",
    message: "#mg-message",
    moves: "#mg-moves",
    attempts: "#mg-attempts",
    pairs: "#mg-pairs",
    totalPairs: "#mg-total-pairs",
    startBtn: "#mg-start",
    resetBtn: "#mg-reset",
    difficultyRadios: 'input[name="mg-difficulty"]'
  };

  const state = {
    started: false,
    lock: false,
    opened: [],
    moves: 0,
    attempts: 0,
    matchedPairs: 0,
    totalPairs: 0,
    difficulty: "easy",
    deck: []
  };

  function $(sel, root = document) {
    return root.querySelector(sel);
  }
  function $all(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function shuffle(array) {
    const a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function readDifficulty() {
    const selected = $(SELECTORS.difficultyRadios + ":checked");
    return selected ? selected.value : "easy";
  }

  function setMessage(text = "") {
    const el = $(SELECTORS.message);
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("is-visible", Boolean(text));
  }

  function updateStats() {
    const movesEl = $(SELECTORS.moves);
    const attemptsEl = $(SELECTORS.attempts);
    const pairsEl = $(SELECTORS.pairs);
    const totalPairsEl = $(SELECTORS.totalPairs);

    if (movesEl) movesEl.textContent = String(state.moves);
    if (attemptsEl) attemptsEl.textContent = String(state.attempts);
    if (pairsEl) pairsEl.textContent = String(state.matchedPairs);
    if (totalPairsEl) totalPairsEl.textContent = String(state.totalPairs);
  }

  function clearBoard() {
    const board = $(SELECTORS.board);
    if (!board) return;
    board.innerHTML = "";
  }

  function renderBoard() {
    const board = $(SELECTORS.board);
    if (!board) return;

    const { cols, rows } = CONFIG[state.difficulty];
    board.style.setProperty("--mg-cols", String(cols));
    board.style.setProperty("--mg-rows", String(rows));
    board.innerHTML = "";

    const frag = document.createDocumentFragment();
    for (const card of state.deck) {
      frag.appendChild(createCardEl(card));
    }
    board.appendChild(frag);
  }

  function createCardEl(card) {
    // Button = keyboard accessible
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mg-card";
    btn.dataset.key = card.key;
    btn.setAttribute("aria-label", "Kortelė");
    btn.setAttribute("aria-pressed", "false");

    const inner = document.createElement("span");
    inner.className = "mg-card-inner";

    const front = document.createElement("span");
    front.className = "mg-face mg-front";
    front.textContent = "❓";

    const back = document.createElement("span");
    back.className = "mg-face mg-back";
    back.innerHTML = `
      <span class="mg-icon" aria-hidden="true">${card.icon}</span>
      <span class="mg-label">${card.label}</span>
    `;

    inner.appendChild(front);
    inner.appendChild(back);
    btn.appendChild(inner);

    btn.addEventListener("click", () => onCardClick(btn));
    return btn;
  }

  function buildDeck() {
    const pairsNeeded = CONFIG[state.difficulty].pairs;

    if (ITEMS.length < pairsNeeded) {
      // Defensive: should not happen with the current ITEMS list.
      throw new Error("Neužtenka unikalių kortelių elementų pasirinktai lentelei.");
    }

    const chosen = shuffle(ITEMS).slice(0, pairsNeeded);
    const doubled = chosen.flatMap(item => [{ ...item }, { ...item }]);
    state.deck = shuffle(doubled);
    state.totalPairs = pairsNeeded;
  }

  function resetStateForNewGame() {
    state.lock = false;
    state.opened = [];
    state.moves = 0;
    state.attempts = 0;
    state.matchedPairs = 0;
    updateStats();
    setMessage("");
  }

  function setStartedUI(isStarted) {
    const board = $(SELECTORS.board);
    if (board) board.classList.toggle("is-started", isStarted);
  }

  function startNewGame() {
    state.difficulty = readDifficulty();
    state.started = true;

    resetStateForNewGame();
    buildDeck();
    renderBoard();
    setStartedUI(true);

    setMessage("Sėkmės! Surask visas poras.");
  }

  function resetGame(keepBoard = true) {
    state.difficulty = readDifficulty();
    state.started = false;
    state.lock = false;
    state.opened = [];
    state.moves = 0;
    state.attempts = 0;
    state.matchedPairs = 0;
    state.totalPairs = CONFIG[state.difficulty].pairs;
    updateStats();

    setStartedUI(false);
    setMessage("Pasirink sudėtingumą ir spausk „Start“.");

    if (keepBoard) {
      clearBoard();
    }
  }

  function flipCard(btn, shouldFlip) {
    btn.classList.toggle("is-flipped", shouldFlip);
    btn.setAttribute("aria-pressed", shouldFlip ? "true" : "false");
  }

  function markMatched(btn) {
    btn.classList.add("is-matched");
    btn.disabled = true;
  }

  function onCardClick(btn) {
    if (!state.started) return;
    if (state.lock) return;
    if (btn.classList.contains("is-matched")) return;
    if (btn.classList.contains("is-flipped")) return;

    flipCard(btn, true);
    state.moves += 1;
    updateStats();

    state.opened.push(btn);

    if (state.opened.length < 2) return;

    // 2 cards opened
    state.lock = true;
    state.attempts += 1;
    updateStats();

    const [a, b] = state.opened;
    const isMatch = a.dataset.key === b.dataset.key;

    if (isMatch) {
      // keep open
      window.setTimeout(() => {
        markMatched(a);
        markMatched(b);
        state.opened = [];
        state.lock = false;

        state.matchedPairs += 1;
        updateStats();

        if (state.matchedPairs === state.totalPairs) {
          setMessage("🎉 Laimėjote!");
        }
      }, 250);
    } else {
      // flip back
      window.setTimeout(() => {
        flipCard(a, false);
        flipCard(b, false);
        state.opened = [];
        state.lock = false;
      }, 800);
    }
  }

  function wireUI() {
    const startBtn = $(SELECTORS.startBtn);
    const resetBtn = $(SELECTORS.resetBtn);
    const radios = $all(SELECTORS.difficultyRadios);

    if (startBtn) startBtn.addEventListener("click", startNewGame);

    if (resetBtn) resetBtn.addEventListener("click", () => {
      // "Atnaujinti" = reset and allow new start
      resetGame(true);
    });

    // Requirement: changing difficulty reloads board and resets stats
    radios.forEach(r => r.addEventListener("change", () => {
      if (state.started) {
        startNewGame();
      } else {
        // keep simple: update expected totals while waiting for start
        state.difficulty = readDifficulty();
        state.totalPairs = CONFIG[state.difficulty].pairs;
        updateStats();
        setMessage("Pasirink sudėtingumą ir spausk „Start“.");
      }
    }));
  }

  function init() {
    const section = $(SELECTORS.section);
    if (!section) return;

    wireUI();
    state.difficulty = readDifficulty();
    state.totalPairs = CONFIG[state.difficulty].pairs;
    updateStats();
    setStartedUI(false);
    setMessage("Pasirink sudėtingumą ir spausk „Start“.");
  }

  window.addEventListener("DOMContentLoaded", init);
})();
