/**
 * Genius Ludo - Core Game Engine (Matte Tabletop Edition)
 * Crisp 60 FPS Canvas Renderer, Top-Down Pin/Pawn Board Game Pieces,
 * Sharp 1.2px Grid, Matte Palette, Authentic Rules & Strategic AI
 */

import { audio } from './audio.js';
import { network } from './network.js';

// ============================================================================
// MATTE COLOR PALETTE & BOARD TOPOLOGY (15x15 Standard Ludo Grid)
// ============================================================================

export const PLAYER_COLORS = [
    { 
        id: 0, 
        name: 'Red', 
        hex: '#E63946',         // Matte Crimson
        tint: '#FDE8EA',        // Soft Tint Base
        darkHex: '#BA181B', 
        accentHex: '#D90429',
        borderHex: '#E63946',
        cardBg: 'rgba(230, 57, 70, 0.12)'
    },
    { 
        id: 1, 
        name: 'Green', 
        hex: '#2A9D8F',         // Matte Emerald
        tint: '#E4F5F3',        // Soft Tint Base
        darkHex: '#1F6F65', 
        accentHex: '#21867A',
        borderHex: '#2A9D8F',
        cardBg: 'rgba(42, 157, 143, 0.12)'
    },
    { 
        id: 2, 
        name: 'Yellow', 
        hex: '#E9C46A',         // Matte Amber Gold
        tint: '#FDF6E2',        // Soft Tint Base
        darkHex: '#C58B12', 
        accentHex: '#F4A261',
        borderHex: '#E9C46A',
        cardBg: 'rgba(233, 196, 106, 0.12)'
    },
    { 
        id: 3, 
        name: 'Blue', 
        hex: '#3A86FF',         // Matte Royal Cobalt
        tint: '#E7F0FF',        // Soft Tint Base
        darkHex: '#1D5ECC', 
        accentHex: '#2563EB',
        borderHex: '#3A86FF',
        cardBg: 'rgba(58, 134, 255, 0.12)'
    }
];

export const PALETTE = {
    appBg: '#181A20',          // Warm Charcoal-Slate Screen Background
    cardBg: '#232631',         // Clean Matte Card Background
    cardBorder: '#2E3342',     // Subtle Card Border
    boardFrame: '#2B2E3B',     // Matte Walnut / Slate Frame
    tileIvory: '#F8F9FA',      // Warm Crisp Off-White Tiles
    tileBorder: '#CBD5E1',     // Clean Sharp Grid Lines (1.2px)
    starColor: '#94A3B8',      // Crisp Neutral Slate Star
    pawnRing: '#FFFFFF',       // 2.5px Crisp Pure White Token Ring
    whiteInnerYard: '#FFFFFF', // Crisp White Yard Inset
    socketFill: '#EEF2F6',     // Recessed Socket Inset
    socketBorder: '#CBD5E1',   // Socket Border
    textLight: '#F8FAFC',
    textMuted: '#94A3B8'
};

// 52 Common Perimeter Cells (Clockwise from Red Start at 6, 1)
export const COMMON_TRACK = [
    { r: 6, c: 1 },  // 0: Red Start (Safe)
    { r: 6, c: 2 },  // 1
    { r: 6, c: 3 },  // 2
    { r: 6, c: 4 },  // 3
    { r: 6, c: 5 },  // 4
    { r: 5, c: 6 },  // 5
    { r: 4, c: 6 },  // 6
    { r: 3, c: 6 },  // 7
    { r: 2, c: 6 },  // 8: Star Safe 1
    { r: 1, c: 6 },  // 9
    { r: 0, c: 6 },  // 10
    { r: 0, c: 7 },  // 11
    { r: 0, c: 8 },  // 12
    { r: 1, c: 8 },  // 13: Green Start (Safe)
    { r: 2, c: 8 },  // 14
    { r: 3, c: 8 },  // 15
    { r: 4, c: 8 },  // 16
    { r: 5, c: 8 },  // 17
    { r: 6, c: 9 },  // 18
    { r: 6, c: 10 }, // 19
    { r: 6, c: 11 }, // 20
    { r: 6, c: 12 }, // 21: Star Safe 2
    { r: 6, c: 13 }, // 22
    { r: 6, c: 14 }, // 23
    { r: 7, c: 14 }, // 24
    { r: 8, c: 14 }, // 25
    { r: 8, c: 13 }, // 26: Yellow Start (Safe)
    { r: 8, c: 12 }, // 27
    { r: 8, c: 11 }, // 28
    { r: 8, c: 10 }, // 29
    { r: 8, c: 9 },  // 30
    { r: 9, c: 8 },  // 31
    { r: 10, c: 8 }, // 32
    { r: 11, c: 8 }, // 33
    { r: 12, c: 8 }, // 34: Star Safe 3
    { r: 13, c: 8 }, // 35
    { r: 14, c: 8 }, // 36
    { r: 14, c: 7 }, // 37
    { r: 14, c: 6 }, // 38
    { r: 13, c: 6 }, // 39: Blue Start (Safe)
    { r: 12, c: 6 }, // 40
    { r: 11, c: 6 }, // 41
    { r: 10, c: 6 }, // 42
    { r: 9, c: 6 },  // 43
    { r: 8, c: 5 },  // 44
    { r: 8, c: 4 },  // 45
    { r: 8, c: 3 },  // 46
    { r: 8, c: 2 },  // 47: Star Safe 4
    { r: 8, c: 1 },  // 48
    { r: 8, c: 0 },  // 49
    { r: 7, c: 0 },  // 50
    { r: 6, c: 0 }   // 51
];

export const SAFE_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];
export const STAR_INDICES = [8, 21, 34, 47];
export const START_INDICES = [0, 13, 26, 39];

// Home Columns (Steps 51 to 55) & Center Goal (Step 56 = Finished)
export const FINISH_STEP = 56;

export const HOME_COLUMNS = [
    // 0: Red (enters right into row 7)
    [
        { r: 7, c: 1 }, // 51
        { r: 7, c: 2 }, // 52
        { r: 7, c: 3 }, // 53
        { r: 7, c: 4 }, // 54
        { r: 7, c: 5 }, // 55
        { r: 7, c: 7 }  // 56: Finished in Center Goal
    ],
    // 1: Green (enters down into col 7)
    [
        { r: 1, c: 7 }, // 51
        { r: 2, c: 7 }, // 52
        { r: 3, c: 7 }, // 53
        { r: 4, c: 7 }, // 54
        { r: 5, c: 7 }, // 55
        { r: 7, c: 7 }  // 56
    ],
    // 2: Yellow (enters left into row 7)
    [
        { r: 7, c: 13 }, // 51
        { r: 7, c: 12 }, // 52
        { r: 7, c: 11 }, // 53
        { r: 7, c: 10 }, // 54
        { r: 7, c: 9 },  // 55
        { r: 7, c: 7 }   // 56
    ],
    // 3: Blue (enters up into col 7)
    [
        { r: 13, c: 7 }, // 51
        { r: 12, c: 7 }, // 52
        { r: 11, c: 7 }, // 53
        { r: 10, c: 7 }, // 54
        { r: 9, c: 7 },  // 55
        { r: 7, c: 7 }   // 56
    ]
];

// Yard Base Token Pedestals (Center Coordinates in grid units)
export const YARD_POSITIONS = [
    [{ r: 1.5, c: 1.5 }, { r: 1.5, c: 3.5 }, { r: 3.5, c: 1.5 }, { r: 3.5, c: 3.5 }],
    [{ r: 1.5, c: 10.5 }, { r: 1.5, c: 12.5 }, { r: 3.5, c: 10.5 }, { r: 3.5, c: 12.5 }],
    [{ r: 10.5, c: 10.5 }, { r: 10.5, c: 12.5 }, { r: 12.5, c: 10.5 }, { r: 12.5, c: 12.5 }],
    [{ r: 10.5, c: 1.5 }, { r: 10.5, c: 3.5 }, { r: 12.5, c: 1.5 }, { r: 12.5, c: 3.5 }]
];

// ============================================================================
// GAME CONTROLLER CLASS
// ============================================================================

export class LudoGame {
    constructor(canvas, uiCallbacks) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ui = uiCallbacks || {};

        this.mode = 'local';
        this.playerCount = 4;
        this.activeSlots = [0, 1, 2, 3];
        this.currentTurnIndex = 0;
        this.diceValue = 1;
        this.isRolling = false;
        this.hasRolled = false;
        this.consecutiveSixes = 0;
        this.validMoves = [];

        // Turn Watchdog Failsafe (15 seconds)
        this.turnDuration = 15000;
        this.turnStartTime = performance.now();
        this.watchdogTimer = null;

        this.players = [
            { id: 0, name: 'Red', isAI: false, tokens: [-1, -1, -1, -1], finishedTokens: 0, rank: null },
            { id: 1, name: 'Green', isAI: false, tokens: [-1, -1, -1, -1], finishedTokens: 0, rank: null },
            { id: 2, name: 'Yellow', isAI: false, tokens: [-1, -1, -1, -1], finishedTokens: 0, rank: null },
            { id: 3, name: 'Blue', isAI: false, tokens: [-1, -1, -1, -1], finishedTokens: 0, rank: null }
        ];

        this.winners = [];
        this.isGameOver = false;

        this.activeHopAnimation = null;
        this.particles = [];
        this.lastFrameTime = performance.now();
        this.autoMoveTimer = null;

        this.cellSize = 0;
        this.boardLeft = 0;
        this.boardTop = 0;
        this.boardWidth = 0;
        this.pulseTime = 0;

        this.initEventListeners();
        this.resize();
        this.startRenderLoop();
    }

    normalizeTokens(tokens) {
        if (!tokens) return [-1, -1, -1, -1];
        if (Array.isArray(tokens)) {
            return [
                tokens[0] !== undefined ? Number(tokens[0]) : -1,
                tokens[1] !== undefined ? Number(tokens[1]) : -1,
                tokens[2] !== undefined ? Number(tokens[2]) : -1,
                tokens[3] !== undefined ? Number(tokens[3]) : -1
            ];
        }
        if (typeof tokens === 'object') {
            return [
                tokens[0] !== undefined ? Number(tokens[0]) : (tokens['0'] !== undefined ? Number(tokens['0']) : -1),
                tokens[1] !== undefined ? Number(tokens[1]) : (tokens['1'] !== undefined ? Number(tokens['1']) : -1),
                tokens[2] !== undefined ? Number(tokens[2]) : (tokens['2'] !== undefined ? Number(tokens['2']) : -1),
                tokens[3] !== undefined ? Number(tokens[3]) : (tokens['3'] !== undefined ? Number(tokens['3']) : -1)
            ];
        }
        return [-1, -1, -1, -1];
    }

    startMatch(mode, playerCount, playerNames = {}, aiSlots = []) {
        this.mode = mode;
        this.playerCount = playerCount;
        this.winners = [];
        this.isGameOver = false;
        this.consecutiveSixes = 0;
        this.validMoves = [];
        this.activeHopAnimation = null;
        this.particles = [];

        if (this.autoMoveTimer) {
            clearTimeout(this.autoMoveTimer);
            this.autoMoveTimer = null;
        }
        this.clearTurnWatchdog();

        if (playerCount === 2) {
            this.activeSlots = [0, 2];
        } else if (playerCount === 3) {
            this.activeSlots = [0, 1, 2];
        } else {
            this.activeSlots = [0, 1, 2, 3];
        }

        this.currentTurnIndex = 0;
        this.hasRolled = false;
        this.isRolling = false;
        this.diceValue = 6;
        this.turnStartTime = performance.now();

        this.players.forEach(p => {
            p.tokens = [-1, -1, -1, -1];
            p.finishedTokens = 0;
            p.rank = null;
            p.isAI = false;
        });

        this.activeSlots.forEach(slot => {
            if (playerNames[slot]) {
                this.players[slot].name = playerNames[slot];
            } else {
                this.players[slot].name = PLAYER_COLORS[slot].name;
            }

            if (mode === 'ai' && aiSlots.includes(slot)) {
                this.players[slot].isAI = true;
                this.players[slot].name = `${PLAYER_COLORS[slot].name} Bot`;
            }
        });

        this.resize();
        this.updateUI();
        this.armTurnWatchdog();

        if (this.mode === 'online' && network.isHost) {
            network.updateGameState(this.serializeState());
        }

        if (this.isCurrentPlayerAI()) {
            this.triggerAIRoll();
        }
    }

    getCurrentPlayer() {
        return this.players[this.activeSlots[this.currentTurnIndex]];
    }

    getCurrentSlot() {
        return this.activeSlots[this.currentTurnIndex];
    }

    isCurrentPlayerAI() {
        return this.getCurrentPlayer().isAI;
    }

    isMyTurn() {
        if (this.mode !== 'online') return true;
        return this.getCurrentSlot() === network.playerSlot;
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        const fallback = Math.min(window.innerWidth * 0.94, window.innerHeight * 0.58, 520);
        let size = Math.min(rect.width, rect.height);
        if (!size || size < 40) {
            size = fallback;
        }

        this.canvas.width = Math.round(size * dpr);
        this.canvas.height = Math.round(size * dpr);
        this.boardWidth = size;
        this.cellSize = size / 15;
        this.boardLeft = 0;
        this.boardTop = 0;

        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    initEventListeners() {
        window.addEventListener('resize', () => this.resize());

        const handleInteraction = (clientX, clientY) => {
            if (this.isGameOver || !this.hasRolled || this.isRolling || this.activeHopAnimation) return;

            const rect = this.canvas.getBoundingClientRect();
            if (!rect.width || !rect.height) return;

            const scaleX = this.boardWidth / rect.width;
            const scaleY = this.boardWidth / rect.height;
            const x = (clientX - rect.left) * scaleX;
            const y = (clientY - rect.top) * scaleY;

            if (!this.isMyTurn()) return;
            if (this.isCurrentPlayerAI()) return;

            this.handleCanvasClick(x, y);
        };

        this.canvas.addEventListener('click', (e) => {
            handleInteraction(e.clientX, e.clientY);
        });

        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches[0]) {
                handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });
    }

    getTokenCoords(playerSlot, step, tokenIndex) {
        if (step === -1) {
            return YARD_POSITIONS[playerSlot][tokenIndex];
        }
        if (step >= 0 && step <= 50) {
            const startOffset = START_INDICES[playerSlot];
            const trackIndex = (startOffset + step) % 52;
            return COMMON_TRACK[trackIndex];
        }
        if (step >= 51 && step <= 56) {
            const homeIdx = Math.min(step - 51, 5);
            return HOME_COLUMNS[playerSlot][homeIdx];
        }
        return { r: 7, c: 7 };
    }

    gridToPixel(row, col) {
        return {
            x: this.boardLeft + (col + 0.5) * this.cellSize,
            y: this.boardTop + (row + 0.5) * this.cellSize
        };
    }

    rollDice() {
        if (this.isGameOver || this.hasRolled || this.isRolling || this.activeHopAnimation) {
            return;
        }

        if (!this.isMyTurn()) {
            if (this.ui.showToast) {
                this.ui.showToast("Wait for opponent's turn!", "warning");
            }
            return;
        }

        this.hasRolled = true;
        this.isRolling = true;
        audio.playDiceRoll();

        let simulatedDice = 1;
        const rollDuration = 500;

        const rollInterval = setInterval(() => {
            simulatedDice = Math.floor(Math.random() * 6) + 1;
            this.diceValue = simulatedDice;
            this.updateUI();
        }, 50);

        setTimeout(() => {
            clearInterval(rollInterval);
            this.diceValue = Math.floor(Math.random() * 6) + 1;
            this.isRolling = false;

            if (this.mode === 'online') {
                network.broadcastDiceRoll(this.diceValue, this.consecutiveSixes);
            }

            this.processDiceRollResult();
        }, rollDuration);
    }

    processDiceRollResult() {
        const player = this.getCurrentPlayer();
        const slot = this.getCurrentSlot();
        const tokens = this.normalizeTokens(player.tokens);

        if (this.diceValue === 6) {
            this.consecutiveSixes++;
            if (this.consecutiveSixes === 3) {
                if (this.ui.showToast) {
                    this.ui.showToast("3 consecutive 6s! Turn forfeited.", "warning");
                }
                this.consecutiveSixes = 0;
                setTimeout(() => this.passTurn(), 850);
                return;
            }
        } else {
            this.consecutiveSixes = 0;
        }

        this.validMoves = [];
        tokens.forEach((step, idx) => {
            if (this.isValidMove(slot, idx, this.diceValue)) {
                this.validMoves.push(idx);
            }
        });

        this.updateUI();

        if (this.validMoves.length === 0) {
            if (this.ui.showToast) {
                this.ui.showToast(`No valid moves for ${player.name}`);
            }
            // Automatically advance after 900ms if no moves exist
            setTimeout(() => this.passTurn(), 900);
        } else if (this.validMoves.length === 1) {
            if (this.isMyTurn()) {
                const autoMoveIdx = this.validMoves[0];
                this.autoMoveTimer = setTimeout(() => {
                    if (!this.activeHopAnimation && this.validMoves.includes(autoMoveIdx)) {
                        this.executeMove(autoMoveIdx);
                    }
                }, 300);
            }
        } else {
            if (player.isAI) {
                setTimeout(() => {
                    const bestMoveIdx = this.chooseAIMove();
                    this.executeMove(bestMoveIdx);
                }, 550);
            }
        }
    }

    isValidMove(slot, tokenIndex, dice) {
        const tokens = this.normalizeTokens(this.players[slot].tokens);
        const step = tokens[tokenIndex];
        if (step >= 56) return false; // Already finished in center goal
        if (step === -1) return dice === 6;
        return (step + dice) <= 56; // Cannot overshoot 56
    }

    handleCanvasClick(clickX, clickY) {
        if (this.isGameOver || this.isRolling) return;

        if (this.mode === 'online' && !this.isMyTurn()) {
            if (this.ui.showToast) {
                this.ui.showToast("Wait for opponent's turn!", "warning");
            }
            return;
        }

        if (!this.hasRolled) {
            if (this.isMyTurn() && this.ui.showToast) {
                this.ui.showToast("Roll the dice first!");
            }
            return;
        }

        if (this.validMoves.length === 0) return;

        const currentSlot = this.getCurrentSlot();
        const player = this.getCurrentPlayer();
        const tokens = this.normalizeTokens(player.tokens);

        let closestTokenIdx = -1;
        let minDistance = this.cellSize * 1.3;

        this.validMoves.forEach(tokenIdx => {
            const step = tokens[tokenIdx];
            const coords = this.getTokenCoords(currentSlot, step, tokenIdx);
            const pos = this.gridToPixel(coords.r, coords.c);

            const offset = this.getTokenOffset(currentSlot, tokenIdx, coords.r, coords.c);
            const targetX = pos.x + offset.x;
            const targetY = pos.y + offset.y;

            const dist = Math.hypot(clickX - targetX, clickY - targetY);
            if (dist < minDistance) {
                minDistance = dist;
                closestTokenIdx = tokenIdx;
            }
        });

        if (closestTokenIdx !== -1) {
            if (this.autoMoveTimer) {
                clearTimeout(this.autoMoveTimer);
                this.autoMoveTimer = null;
            }
            this.executeMove(closestTokenIdx);
        }
    }

    executeMove(tokenIndex) {
        if (!this.validMoves.includes(tokenIndex)) return;

        if (this.autoMoveTimer) {
            clearTimeout(this.autoMoveTimer);
            this.autoMoveTimer = null;
        }
        this.clearTurnWatchdog();

        this.validMoves = [];
        const slot = this.getCurrentSlot();
        const player = this.getCurrentPlayer();
        const tokens = this.normalizeTokens(player.tokens);
        const startStep = tokens[tokenIndex];
        const dice = this.diceValue;

        const targetStep = (startStep === -1) ? 0 : (startStep + dice);
        if (targetStep > 56) return;

        if (this.mode === 'online' && slot === network.playerSlot) {
            network.broadcastMoveToken(tokenIndex, dice, startStep, targetStep);
        }

        const waypoints = [];
        if (startStep === -1) {
            const fromCoords = this.getTokenCoords(slot, -1, tokenIndex);
            const toCoords = this.getTokenCoords(slot, 0, tokenIndex);
            waypoints.push({
                from: this.gridToPixel(fromCoords.r, fromCoords.c),
                to: this.gridToPixel(toCoords.r, toCoords.c),
                step: 0
            });
        } else {
            for (let s = startStep + 1; s <= targetStep; s++) {
                const prevCoords = this.getTokenCoords(slot, s - 1, tokenIndex);
                const nextCoords = this.getTokenCoords(slot, s, tokenIndex);
                waypoints.push({
                    from: this.gridToPixel(prevCoords.r, prevCoords.c),
                    to: this.gridToPixel(nextCoords.r, nextCoords.c),
                    step: s
                });
            }
        }

        this.activeHopAnimation = {
            slot,
            tokenIndex,
            waypoints,
            currentHopIndex: 0,
            hopProgress: 0,
            hopDuration: 120,
            lastHopTime: performance.now(),
            onComplete: () => {
                player.tokens[tokenIndex] = targetStep;
                this.activeHopAnimation = null;
                this.handleLanding(slot, tokenIndex, targetStep);
            }
        };

        audio.playHop(startStep + 1);
    }

    handleLanding(slot, tokenIndex, finalStep) {
        const player = this.players[slot];
        let grantsBonusRoll = false;

        if (finalStep >= 56) {
            // FINISHED IN CENTER TRIANGLE GOAL!
            player.tokens[tokenIndex] = 56;
            player.finishedTokens = player.tokens.filter(t => t >= 56).length;
            audio.playHome();
            this.spawnConfettiParticles(this.gridToPixel(7, 7));

            if (this.ui.showToast) {
                this.ui.showToast(`🎯 ${player.name}'s token reached Home! Bonus Roll!`, "success");
            }
            grantsBonusRoll = true;

            if (player.finishedTokens === 4) {
                player.rank = this.winners.length + 1;
                this.winners.push(slot);

                if (this.ui.showToast) {
                    this.ui.showToast(`🏆 ${player.name} finished #${player.rank}!`, "gold");
                }

                const remainingActive = this.activeSlots.filter(s => this.players[s].finishedTokens < 4);
                if (remainingActive.length <= 1) {
                    if (remainingActive.length === 1) {
                        const lastSlot = remainingActive[0];
                        this.players[lastSlot].rank = this.winners.length + 1;
                        this.winners.push(lastSlot);
                    }
                    this.endGame();
                    return;
                }
            }
        } else if (finalStep >= 0 && finalStep <= 50) {
            const startOffset = START_INDICES[slot];
            const currentTrackIndex = (startOffset + finalStep) % 52;
            const isSafe = SAFE_INDICES.includes(currentTrackIndex);

            if (isSafe) {
                audio.playSafeZone();
            } else {
                const capturedOpponents = [];
                this.activeSlots.forEach(otherSlot => {
                    if (otherSlot === slot) return;
                    const otherPlayer = this.players[otherSlot];
                    const otherTokens = this.normalizeTokens(otherPlayer.tokens);
                    otherTokens.forEach((otherStep, otherTokenIdx) => {
                        if (otherStep >= 0 && otherStep <= 50) {
                            const otherTrackIndex = (START_INDICES[otherSlot] + otherStep) % 52;
                            if (otherTrackIndex === currentTrackIndex) {
                                capturedOpponents.push({ slot: otherSlot, tokenIndex: otherTokenIdx });
                            }
                        }
                    });
                });

                if (capturedOpponents.length > 0) {
                    audio.playCapture();
                    const captureCoords = COMMON_TRACK[currentTrackIndex];
                    this.spawnCaptureParticles(this.gridToPixel(captureCoords.r, captureCoords.c), PLAYER_COLORS[slot].hex);

                    capturedOpponents.forEach(cap => {
                        this.players[cap.slot].tokens[cap.tokenIndex] = -1;
                    });

                    grantsBonusRoll = true;
                    if (this.ui.showToast) {
                        this.ui.showToast(`💥 CAPTURE! ${player.name} earned a Bonus Roll!`, "danger");
                    }
                }
            }
        }

        if (this.diceValue === 6 && !grantsBonusRoll) {
            grantsBonusRoll = true;
            if (this.ui.showToast) {
                this.ui.showToast(`Rolled 6! Roll again.`);
            }
        }

        if (grantsBonusRoll && player.finishedTokens < 4) {
            this.hasRolled = false;
            this.isRolling = false;
            this.turnStartTime = performance.now();
            this.updateUI();
            this.armTurnWatchdog();

            if (this.mode === 'online') {
                network.updateGameState({
                    currentTurn: this.getCurrentSlot(),
                    currentTurnIndex: this.currentTurnIndex,
                    hasRolled: false,
                    isMoving: false,
                    diceValue: this.diceValue,
                    players: this.serializePlayers(),
                    lastUpdate: Date.now()
                });
            }

            if (player.isAI) {
                setTimeout(() => this.triggerAIRoll(), 650);
            }
        } else {
            this.passTurn();
        }
    }

    passTurn() {
        if (this.isGameOver) return;

        this.clearTurnWatchdog();
        this.consecutiveSixes = 0;
        this.validMoves = [];
        this.hasRolled = false;
        this.isRolling = false;

        let nextIndex = this.currentTurnIndex;
        let attempts = 0;
        do {
            nextIndex = (nextIndex + 1) % this.activeSlots.length;
            attempts++;
        } while (this.players[this.activeSlots[nextIndex]].finishedTokens === 4 && attempts <= this.activeSlots.length);

        this.currentTurnIndex = nextIndex;
        this.turnStartTime = performance.now();
        this.updateUI();
        this.armTurnWatchdog();

        if (this.mode === 'online') {
            network.updateGameState({
                currentTurn: this.getCurrentSlot(),
                currentTurnIndex: this.currentTurnIndex,
                hasRolled: false,
                isMoving: false,
                diceValue: this.diceValue,
                players: this.serializePlayers(),
                lastUpdate: Date.now()
            });
        }

        if (this.isCurrentPlayerAI()) {
            setTimeout(() => this.triggerAIRoll(), 600);
        }
    }

    triggerAIRoll() {
        if (this.isGameOver || this.hasRolled || this.isRolling) return;
        this.rollDice();
    }

    chooseAIMove() {
        const slot = this.getCurrentSlot();
        const player = this.getCurrentPlayer();
        const tokens = this.normalizeTokens(player.tokens);
        const dice = this.diceValue;

        let bestScore = -9999;
        let bestTokenIdx = this.validMoves[0];

        this.validMoves.forEach(tokenIdx => {
            const currentStep = tokens[tokenIdx];
            const targetStep = (currentStep === -1) ? 0 : (currentStep + dice);
            let score = 0;

            if (targetStep === 56) score += 150;
            if (currentStep === -1 && dice === 6) score += 95;

            if (targetStep >= 0 && targetStep <= 50) {
                const targetTrackIndex = (START_INDICES[slot] + targetStep) % 52;
                const isSafe = SAFE_INDICES.includes(targetTrackIndex);

                if (!isSafe) {
                    let opponentPresent = false;
                    this.activeSlots.forEach(otherSlot => {
                        if (otherSlot === slot) return;
                        const otherTokens = this.normalizeTokens(this.players[otherSlot].tokens);
                        otherTokens.forEach(otherStep => {
                            if (otherStep >= 0 && otherStep <= 50) {
                                const otherTrackIndex = (START_INDICES[otherSlot] + otherStep) % 52;
                                if (otherTrackIndex === targetTrackIndex) {
                                    opponentPresent = true;
                                }
                            }
                        });
                    });

                    if (opponentPresent) score += 130;
                } else {
                    score += 45;
                }
            }

            if (targetStep >= 51 && currentStep < 51) score += 60;
            score += targetStep * 0.8 + Math.random() * 2;

            if (score > bestScore) {
                bestScore = score;
                bestTokenIdx = tokenIdx;
            }
        });

        return bestTokenIdx;
    }

    getTokenOffset(playerSlot, tokenIndex, row, col) {
        const tokensOnTile = [];
        this.activeSlots.forEach(s => {
            const tokens = this.normalizeTokens(this.players[s].tokens);
            tokens.forEach((step, tIdx) => {
                if (step >= 0 && step < 56) {
                    const c = this.getTokenCoords(s, step, tIdx);
                    if (c.r === row && c.c === col) {
                        tokensOnTile.push({ slot: s, tokenIndex: tIdx });
                    }
                }
            });
        });

        if (tokensOnTile.length <= 1) {
            return { x: 0, y: 0, scale: 1.0 };
        }

        const myIndex = tokensOnTile.findIndex(t => t.slot === playerSlot && t.tokenIndex === tokenIndex);
        const count = tokensOnTile.length;
        const d = this.cellSize * 0.22;

        if (count === 2) {
            const sign = myIndex === 0 ? -1 : 1;
            return { x: sign * d, y: sign * d, scale: 0.74 };
        } else if (count === 3) {
            const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
            return {
                x: Math.cos(angles[myIndex]) * d * 1.1,
                y: Math.sin(angles[myIndex]) * d * 1.1,
                scale: 0.64
            };
        } else {
            const positions = [
                { x: -d, y: -d }, { x: d, y: -d },
                { x: -d, y: d },  { x: d, y: d }
            ];
            const p = positions[myIndex % 4];
            return { x: p.x, y: p.y, scale: 0.56 };
        }
    }

    // ========================================================================
    // TURN WATCHDOG & FAILSAFE SYNC (15 Seconds)
    // ========================================================================

    armTurnWatchdog() {
        this.clearTurnWatchdog();
        this.watchdogTimer = setTimeout(() => {
            if (this.mode === 'online' && !this.isGameOver) {
                console.warn("[Watchdog] Turn stalled for >15s. Auto-passing turn.");
                if (this.ui.showToast) {
                    this.ui.showToast("Turn auto-passed due to inactivity.", "warning");
                }
                this.forcePassTurn();
            }
        }, 15000);
    }

    clearTurnWatchdog() {
        if (this.watchdogTimer) {
            clearTimeout(this.watchdogTimer);
            this.watchdogTimer = null;
        }
    }

    forcePassTurn() {
        this.isRolling = false;
        this.hasRolled = false;
        this.activeHopAnimation = null;
        this.passTurn();
    }

    // ========================================================================
    // REMOTE MULTIPLAYER ACTION HANDLERS
    // ========================================================================

    handleRemoteAction(action) {
        if (!action) return;

        if (action.type === 'DICE_ROLL') {
            this.applyRemoteDiceRoll(action.rollValue, action.consecutiveSixes, action.senderSlot);
        } else if (action.type === 'MOVE_TOKEN') {
            this.applyRemoteMoveToken(action.tokenIndex, action.steps, action.fromStep, action.toStep, action.senderSlot);
        }
    }

    applyRemoteDiceRoll(rollValue, consecutiveSixes, senderSlot) {
        if (senderSlot !== undefined) {
            const senderTurnIdx = this.activeSlots.indexOf(senderSlot);
            if (senderTurnIdx !== -1) {
                this.currentTurnIndex = senderTurnIdx;
            }
        }
        this.hasRolled = true;
        this.isRolling = true;
        audio.playDiceRoll();

        setTimeout(() => {
            this.diceValue = rollValue;
            this.consecutiveSixes = consecutiveSixes || 0;
            this.isRolling = false;
            this.processDiceRollResult();
        }, 450);
    }

    applyRemoteMoveToken(tokenIndex, steps, fromStep, toStep, senderSlot) {
        if (senderSlot !== undefined) {
            const senderTurnIdx = this.activeSlots.indexOf(senderSlot);
            if (senderTurnIdx !== -1) {
                this.currentTurnIndex = senderTurnIdx;
            }
        }
        if (this.autoMoveTimer) {
            clearTimeout(this.autoMoveTimer);
            this.autoMoveTimer = null;
        }
        this.diceValue = steps;
        if (!this.validMoves.includes(tokenIndex)) {
            this.validMoves = [tokenIndex];
        }
        this.executeMove(tokenIndex);
    }

    applyRemoteStateSync(remoteState) {
        if (!remoteState) return;

        if (remoteState.activeSlots) this.activeSlots = remoteState.activeSlots;

        // Sync turn slot directly
        if (remoteState.currentTurn !== undefined) {
            const turnIdx = this.activeSlots.indexOf(remoteState.currentTurn);
            if (turnIdx !== -1) {
                this.currentTurnIndex = turnIdx;
            }
        } else if (remoteState.currentTurnIndex !== undefined) {
            this.currentTurnIndex = remoteState.currentTurnIndex;
        }

        if (remoteState.diceValue !== undefined) this.diceValue = remoteState.diceValue;
        if (remoteState.hasRolled !== undefined) this.hasRolled = remoteState.hasRolled;
        if (remoteState.isMoving === false) this.activeHopAnimation = null;
        if (remoteState.consecutiveSixes !== undefined) this.consecutiveSixes = remoteState.consecutiveSixes;

        if (remoteState.players && !this.activeHopAnimation) {
            const pData = Array.isArray(remoteState.players) ? remoteState.players : Object.values(remoteState.players);
            pData.forEach(rp => {
                if (rp && rp.id !== undefined && this.players[rp.id]) {
                    this.players[rp.id].tokens = this.normalizeTokens(rp.tokens);
                    this.players[rp.id].finishedTokens = Number(rp.finishedTokens !== undefined ? rp.finishedTokens : this.players[rp.id].tokens.filter(t => t >= 56).length);
                    this.players[rp.id].rank = rp.rank || null;
                }
            });
        }

        if (remoteState.winners) this.winners = remoteState.winners;
        if (remoteState.isGameOver !== undefined) this.isGameOver = remoteState.isGameOver;

        this.armTurnWatchdog();
        this.updateUI();
    }

    serializePlayers() {
        const out = {};
        this.activeSlots.forEach(s => {
            out[s] = {
                id: s,
                name: this.players[s].name,
                tokens: this.normalizeTokens(this.players[s].tokens),
                finishedTokens: this.players[s].finishedTokens,
                rank: this.players[s].rank
            };
        });
        return out;
    }

    serializeState() {
        return {
            currentTurn: this.getCurrentSlot(),
            currentTurnIndex: this.currentTurnIndex,
            activeSlots: this.activeSlots,
            diceValue: this.diceValue,
            hasRolled: this.hasRolled,
            consecutiveSixes: this.consecutiveSixes,
            players: this.serializePlayers(),
            winners: [...this.winners],
            isGameOver: this.isGameOver,
            lastUpdate: Date.now()
        };
    }

    endGame() {
        this.isGameOver = true;
        this.clearTurnWatchdog();
        audio.playVictory();
        this.updateUI();

        const podiumResults = this.winners.map(slot => ({
            slot,
            name: this.players[slot].name,
            color: PLAYER_COLORS[slot],
            rank: this.players[slot].rank
        }));

        if (this.ui.onGameOver) {
            this.ui.onGameOver(podiumResults);
        }
    }

    updateUI() {
        if (this.ui.onStateChange) {
            this.ui.onStateChange({
                currentSlot: this.getCurrentSlot(),
                currentPlayer: this.getCurrentPlayer(),
                diceValue: this.diceValue,
                hasRolled: this.hasRolled,
                isRolling: this.isRolling,
                isMyTurn: this.isMyTurn(),
                consecutiveSixes: this.consecutiveSixes,
                players: this.players,
                activeSlots: this.activeSlots,
                isGameOver: this.isGameOver,
                turnStartTime: this.turnStartTime,
                turnDuration: this.turnDuration
            });
        }
    }

    // ========================================================================
    // TACTILE MATTE TABLETOP CANVAS RENDERING (60 FPS)
    // ========================================================================

    startRenderLoop() {
        const loop = (now) => {
            const dt = now - this.lastFrameTime;
            this.lastFrameTime = now;
            this.pulseTime += dt * 0.005;

            this.updateHopAnimation(now);
            this.updateParticles(dt);
            this.render();

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    updateHopAnimation(now) {
        if (!this.activeHopAnimation) return;

        const anim = this.activeHopAnimation;
        const currentWaypoint = anim.waypoints[anim.currentHopIndex];
        const elapsed = now - anim.lastHopTime;
        anim.hopProgress = Math.min(elapsed / anim.hopDuration, 1.0);

        if (anim.hopProgress >= 1.0) {
            anim.currentHopIndex++;
            anim.lastHopTime = now;
            anim.hopProgress = 0;

            if (anim.currentHopIndex < anim.waypoints.length) {
                audio.playHop(anim.waypoints[anim.currentHopIndex].step);
            } else {
                anim.onComplete();
            }
        }
    }

    spawnCaptureParticles(pos, colorHex) {
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            this.particles.push({
                x: pos.x,
                y: pos.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 2.5 + Math.random() * 3,
                color: colorHex,
                alpha: 1.0,
                decay: 0.025
            });
        }
    }

    spawnConfettiParticles(pos) {
        const colors = ['#E63946', '#2A9D8F', '#E9C46A', '#3A86FF', '#F4A261'];
        for (let i = 0; i < 35; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.5 + Math.random() * 4.5;
            this.particles.push({
                x: pos.x,
                y: pos.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                radius: 3 + Math.random() * 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1.0,
                decay: 0.018
            });
        }
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.alpha -= p.decay;
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render() {
        if (!this.boardWidth || this.boardWidth < 40 || !this.cellSize) {
            this.resize();
        }

        const ctx = this.ctx;
        const size = this.boardWidth;
        const cs = this.cellSize;
        const dpr = window.devicePixelRatio || 1;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, size, size);

        // 1. Board Frame
        this.drawBoardFrame(ctx, size);

        // 2. 15x15 Grid
        this.drawBoardTiles(ctx, cs, size);

        // 3. 4 Corner Yards
        this.drawMatteYard(ctx, 0, 0, PLAYER_COLORS[0]);  // Red (Top-Left)
        this.drawMatteYard(ctx, 0, 9, PLAYER_COLORS[1]);  // Green (Top-Right)
        this.drawMatteYard(ctx, 9, 9, PLAYER_COLORS[2]);  // Yellow (Bottom-Right)
        this.drawMatteYard(ctx, 9, 0, PLAYER_COLORS[3]);  // Blue (Bottom-Left)

        // 4. Center Finish Area (4 Triangles + Crown)
        this.drawCenterFinish(ctx, cs);

        // 5. Safe Zones (Stars & Directional Start Arrows)
        this.drawSafeZoneMarkers(ctx, cs);

        // 6. Pawns
        this.drawPawns(ctx, cs);

        // 7. Particles
        this.drawParticles(ctx);
    }

    drawBoardFrame(ctx, size) {
        ctx.save();
        ctx.fillStyle = PALETTE.boardFrame;
        ctx.beginPath();
        ctx.roundRect(0, 0, size, size, 18);
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.stroke();
        ctx.restore();
    }

    drawBoardTiles(ctx, cs, size) {
        ctx.save();
        const pad = cs * 0.18;
        const innerSize = size - pad * 2;

        ctx.fillStyle = PALETTE.tileIvory;
        ctx.beginPath();
        ctx.roundRect(pad, pad, innerSize, innerSize, 12);
        ctx.fill();

        COMMON_TRACK.forEach((cell, idx) => {
            const x = cell.c * cs;
            const y = cell.r * cs;

            let isStartTile = false;
            let startColor = null;

            START_INDICES.forEach((startIdx, colorIdx) => {
                if (startIdx === idx) {
                    isStartTile = true;
                    startColor = PLAYER_COLORS[colorIdx];
                }
            });

            ctx.beginPath();
            ctx.rect(x, y, cs, cs);

            if (isStartTile) {
                ctx.fillStyle = startColor.tint;
                ctx.fill();
            } else {
                ctx.fillStyle = PALETTE.tileIvory;
                ctx.fill();
            }

            ctx.lineWidth = 1.2;
            ctx.strokeStyle = PALETTE.tileBorder;
            ctx.stroke();
        });

        HOME_COLUMNS.forEach((colArray, colorIdx) => {
            const colColor = PLAYER_COLORS[colorIdx];
            for (let i = 0; i < 5; i++) {
                const cell = colArray[i];
                const x = cell.c * cs;
                const y = cell.r * cs;

                ctx.beginPath();
                ctx.rect(x, y, cs, cs);
                ctx.fillStyle = colColor.hex;
                ctx.fill();

                ctx.lineWidth = 1.2;
                ctx.strokeStyle = '#FFFFFF';
                ctx.stroke();
            }
        });

        ctx.restore();
    }

    drawMatteYard(ctx, gridRow, gridCol, colorObj) {
        const cs = this.cellSize;
        const x = gridCol * cs;
        const y = gridRow * cs;
        const w = 6 * cs;
        const h = 6 * cs;

        ctx.save();
        ctx.fillStyle = colorObj.hex;
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, w - 4, h - 4, 14);
        ctx.fill();

        const inset = cs * 0.85;
        const ix = x + inset;
        const iy = y + inset;
        const iw = w - inset * 2;
        const ih = h - inset * 2;

        ctx.fillStyle = PALETTE.whiteInnerYard;
        ctx.beginPath();
        ctx.roundRect(ix, iy, iw, ih, 12);
        ctx.fill();

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
        ctx.stroke();

        const pedestals = YARD_POSITIONS[colorObj.id];
        pedestals.forEach(pos => {
            const p = this.gridToPixel(pos.r, pos.c);
            const rad = cs * 0.62;

            ctx.beginPath();
            ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
            ctx.fillStyle = PALETTE.socketFill;
            ctx.fill();

            ctx.lineWidth = 1.5;
            ctx.strokeStyle = PALETTE.socketBorder;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(p.x, p.y, rad * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = colorObj.tint;
            ctx.fill();
        });

        ctx.restore();
    }

    drawCenterFinish(ctx, cs) {
        ctx.save();
        const cx = 7.5 * cs;
        const cy = 7.5 * cs;

        this.drawMatteTriangle(ctx, 6 * cs, 6 * cs, 6 * cs, 9 * cs, cx, cy, PLAYER_COLORS[0].hex);
        this.drawMatteTriangle(ctx, 6 * cs, 6 * cs, 9 * cs, 6 * cs, cx, cy, PLAYER_COLORS[1].hex);
        this.drawMatteTriangle(ctx, 9 * cs, 6 * cs, 9 * cs, 9 * cs, cx, cy, PLAYER_COLORS[2].hex);
        this.drawMatteTriangle(ctx, 6 * cs, 9 * cs, 9 * cs, 9 * cs, cx, cy, PLAYER_COLORS[3].hex);

        ctx.beginPath();
        ctx.arc(cx, cy, cs * 0.62, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = PALETTE.boardFrame;
        ctx.stroke();

        this.drawCrownIcon(ctx, cx, cy, cs * 0.32);

        ctx.restore();
    }

    drawMatteTriangle(ctx, x1, y1, x2, y2, x3, y3, colorHex) {
        ctx.fillStyle = colorHex;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
    }

    drawCrownIcon(ctx, cx, cy, radius) {
        ctx.save();
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        const w = radius * 1.5;
        const h = radius * 1.1;
        const left = cx - w / 2;
        const top = cy - h / 2 + 1;

        ctx.moveTo(left, top + h);
        ctx.lineTo(left + w, top + h);
        ctx.lineTo(left + w * 0.9, top + h * 0.2);
        ctx.lineTo(left + w * 0.65, top + h * 0.55);
        ctx.lineTo(cx, top);
        ctx.lineTo(left + w * 0.35, top + h * 0.55);
        ctx.lineTo(left + w * 0.1, top + h * 0.2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#D97706';
        ctx.fillRect(left, top + h - 2, w, 2.5);
        ctx.restore();
    }

    drawSafeZoneMarkers(ctx, cs) {
        ctx.save();

        STAR_INDICES.forEach(idx => {
            const cell = COMMON_TRACK[idx];
            const px = (cell.c + 0.5) * cs;
            const py = (cell.r + 0.5) * cs;
            this.drawMinimalStar(ctx, px, py, 5, cs * 0.30, cs * 0.14, PALETTE.starColor);
        });

        START_INDICES.forEach((idx, colorIdx) => {
            const cell = COMMON_TRACK[idx];
            const px = (cell.c + 0.5) * cs;
            const py = (cell.r + 0.5) * cs;
            const col = PLAYER_COLORS[colorIdx];

            const angles = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
            this.drawDirectionArrow(ctx, px, py, cs * 0.26, angles[colorIdx], col.hex);
        });

        ctx.restore();
    }

    drawDirectionArrow(ctx, cx, cy, size, angle, colorHex) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.fillStyle = colorHex;
        ctx.beginPath();
        ctx.moveTo(size * 0.8, 0);
        ctx.lineTo(-size * 0.5, -size * 0.6);
        ctx.lineTo(-size * 0.2, 0);
        ctx.lineTo(-size * 0.5, size * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    drawMinimalStar(ctx, cx, cy, spikes, outerRadius, innerRadius, colorHex) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fillStyle = colorHex;
        ctx.fill();
        ctx.restore();
    }

    drawPawns(ctx, cs) {
        const currentSlot = this.getCurrentSlot();

        this.activeSlots.forEach(slot => {
            const player = this.players[slot];
            if (!player) return;
            const colorObj = PLAYER_COLORS[slot];
            const tokens = this.normalizeTokens(player.tokens);

            tokens.forEach((step, tokenIdx) => {
                if (this.activeHopAnimation && 
                    this.activeHopAnimation.slot === slot && 
                    this.activeHopAnimation.tokenIndex === tokenIdx) {
                    return;
                }

                if (step >= 56) {
                    this.drawGoalPawn(ctx, slot, tokenIdx, cs);
                    return;
                }

                const coords = this.getTokenCoords(slot, step, tokenIdx);
                const pos = this.gridToPixel(coords.r, coords.c);

                let offset = { x: 0, y: 0, scale: 1.0 };
                if (step >= 0 && step < 56) {
                    offset = this.getTokenOffset(slot, tokenIdx, coords.r, coords.c);
                }

                const finalX = pos.x + offset.x;
                const finalY = pos.y + offset.y;
                const radius = (cs * 0.40) * offset.scale;

                const isMovable = (slot === currentSlot && this.hasRolled && this.validMoves.includes(tokenIdx));

                this.drawMattePawn(ctx, finalX, finalY, radius, colorObj, isMovable, 1.0);
            });
        });

        if (this.activeHopAnimation) {
            this.drawHoppingPawn(ctx, cs);
        }
    }

    drawGoalPawn(ctx, slot, tokenIdx, cs) {
        const center = this.gridToPixel(7, 7);
        const colorObj = PLAYER_COLORS[slot];
        const rad = cs * 0.20;

        const angleOffsets = [Math.PI, -Math.PI / 2, 0, Math.PI / 2];
        const baseAngle = angleOffsets[slot];
        const spreadAngle = (tokenIdx - 1.5) * 0.35;
        const dist = cs * 0.92;

        const x = center.x + Math.cos(baseAngle + spreadAngle) * dist;
        const y = center.y + Math.sin(baseAngle + spreadAngle) * dist;

        this.drawMattePawn(ctx, x, y, rad, colorObj, false, 0.9);
    }

    drawHoppingPawn(ctx, cs) {
        const anim = this.activeHopAnimation;
        const waypoint = anim.waypoints[anim.currentHopIndex];
        const p = anim.hopProgress;
        const colorObj = PLAYER_COLORS[anim.slot];

        const currX = waypoint.from.x + (waypoint.to.x - waypoint.from.x) * p;
        const currY = waypoint.from.y + (waypoint.to.y - waypoint.from.y) * p;
        const hopHeight = Math.sin(p * Math.PI) * (cs * 0.46);

        const shadowScale = 1.0 + (hopHeight / (cs * 0.46)) * 0.35;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(currX, currY + 3, cs * 0.32 * shadowScale, cs * 0.18 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.fill();
        ctx.restore();

        const hopScale = 1.0 + (hopHeight / (cs * 0.46)) * 0.16;
        const pawnRadius = cs * 0.42 * hopScale;

        this.drawMattePawn(ctx, currX, currY - hopHeight, pawnRadius, colorObj, false, hopScale);
    }

    drawMattePawn(ctx, x, y, radius, colorObj, isMovable, scale = 1.0) {
        ctx.save();

        // Ground drop shadow
        ctx.beginPath();
        ctx.ellipse(x, y + 2.5 * scale, radius * 0.95, radius * 0.85, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.fill();

        // Movable Selection Indicator
        if (isMovable) {
            const pulse = (Math.sin(this.pulseTime * 6) + 1) / 2;
            const ringRadius = radius + 3 + pulse * 2.5;

            ctx.beginPath();
            ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
            ctx.lineWidth = 2.2;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(x, y - ringRadius - 2, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
        }

        // Crisp pure white outer ring (2.5px)
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        // Solid matte colored pawn body
        const bodyRadius = radius - 2.5 * scale;
        ctx.beginPath();
        ctx.arc(x, y, bodyRadius, 0, Math.PI * 2);
        ctx.fillStyle = colorObj.hex;
        ctx.fill();

        // Concentric inner ring detail
        ctx.beginPath();
        ctx.arc(x, y, bodyRadius * 0.62, 0, Math.PI * 2);
        ctx.lineWidth = 1.4 * scale;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.stroke();

        // Center pin head dot
        ctx.beginPath();
        ctx.arc(x, y, bodyRadius * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.restore();
    }

    drawParticles(ctx) {
        ctx.save();
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(p.alpha, 0);
            ctx.fill();
        });
        ctx.restore();
    }
}
