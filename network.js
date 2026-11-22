/**
 * Genius Ludo - Multiplayer Realtime Sync using Firebase Realtime Database
 * Modular Firebase v10+ via ESM CDN - Zero Build Tools Required
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    onValue, 
    update, 
    remove, 
    onDisconnect,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// ============================================================================
// 1. FIREBASE CONFIGURATION (ACTIVE PRODUCTION CONFIG)
// ============================================================================
export const firebaseConfig = {
    apiKey: "AIzaSyBuNouMEmbRvZcvDwKAX0b3Z0OKslIvJo8",
    authDomain: "genius-ludo-624ec.firebaseapp.com",
    databaseURL: "https://genius-ludo-624ec-default-rtdb.firebaseio.com",
    projectId: "genius-ludo-624ec",
    storageBucket: "genius-ludo-624ec.firebasestorage.app",
    messagingSenderId: "413107174344",
    appId: "1:413107174344:web:55ffa9e709edc9db621efd"
};

class NetworkManager {
    constructor() {
        this.app = null;
        this.db = null;
        this.isConfigured = false;
        this.currentRoomCode = null;
        this.playerId = this.getOrCreatePlayerId();
        this.playerName = localStorage.getItem('genius_ludo_player_name') || 'Player';
        this.playerSlot = 0; // 0: Red, 1: Green, 2: Yellow, 3: Blue
        this.isHost = false;
        this.roomRef = null;
        this.roomListenerUnsub = null;
        this.lastProcessedActionTimestamp = 0;
        this.lastProcessedReactionTimestamp = 0;
        this.onRoomStateChange = null;
        this.onReactionReceived = null;
        this.onGameAction = null;
        this.onGameStateSync = null;
        this.init();
    }

    getOrCreatePlayerId() {
        let id = localStorage.getItem('genius_ludo_pid');
        if (!id) {
            id = 'p_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
            localStorage.setItem('genius_ludo_pid', id);
        }
        return id;
    }

    // ===== SESSION PERSISTENCE =====

    saveSession(roomId, playerColor, playerName, playerId) {
        try {
            localStorage.setItem('genius_ludo_session', JSON.stringify({
                roomId,
                playerColor,
                playerName,
                playerId,
                savedAt: Date.now()
            }));
        } catch (e) { /* storage quota */ }
    }

    clearSession() {
        localStorage.removeItem('genius_ludo_session');
    }

    getSession() {
        try {
            const raw = localStorage.getItem('genius_ludo_session');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    updateBrowserURL(roomId) {
        try {
            window.history.replaceState({}, '', '?room=' + roomId);
        } catch (e) { /* SSR safety */ }
    }

    resetBrowserURL() {
        try {
            window.history.replaceState({}, '', window.location.pathname);
        } catch (e) { /* SSR safety */ }
    }

    /**
     * Try to auto-rejoin a session stored in localStorage.
     * Returns the restored session object { roomId, playerColor, playerName, playerSlot, roomData }
     * or null if the session is invalid / room no longer exists.
     */
    async tryAutoRejoin() {
        if (!this.checkConfig()) return null;

        const session = this.getSession();
        if (!session || !session.roomId || !session.playerId) return null;

        // Session expires after 4 hours
        if (Date.now() - (session.savedAt || 0) > 4 * 60 * 60 * 1000) {
            this.clearSession();
            return null;
        }

        try {
            const roomRef = ref(this.db, `rooms/${session.roomId}`);
            const snapshot = await get(roomRef);
            if (!snapshot.exists()) {
                this.clearSession();
                return null;
            }

            const roomData = snapshot.val();
            const players = roomData.players || {};

            // Verify our playerId is still in the room
            if (!players[session.playerId]) {
                this.clearSession();
                return null;
            }

            const playerEntry = players[session.playerId];
            this.currentRoomCode = session.roomId;
            this.playerName = session.playerName || playerEntry.name || 'Player';
            this.playerSlot = playerEntry.slot;
            this.isHost = (playerEntry.id === roomData.hostId || playerEntry.isHost);
            this.roomRef = roomRef;
            this.lastProcessedActionTimestamp = Date.now();
            this.lastProcessedReactionTimestamp = Date.now();

            // Mark online again
            await update(ref(this.db, `rooms/${session.roomId}/players/${session.playerId}`), {
                online: true
            });
            onDisconnect(ref(this.db, `rooms/${session.roomId}/players/${session.playerId}`))
                .update({ online: false });

            this.listenToRoom();
            this.updateBrowserURL(session.roomId);

            return {
                roomId: session.roomId,
                playerColor: session.playerColor,
                playerName: this.playerName,
                playerSlot: this.playerSlot,
                isHost: this.isHost,
                roomData
            };
        } catch (err) {
            console.warn('[Network] tryAutoRejoin failed:', err.message);
            this.clearSession();
            return null;
        }
    }

    init() {
        try {
            const isDefault = !firebaseConfig.apiKey || 
                              firebaseConfig.apiKey.includes('DummyKey') || 
                              (firebaseConfig.databaseURL && firebaseConfig.databaseURL.includes('genius-ludo-demo'));
            if (isDefault) {
                this.isConfigured = false;
                console.warn("[Network] Firebase config is currently set to placeholder credentials. Offline Pass & Play and AI modes are active.");
                return;
            }

            if (!firebaseConfig.databaseURL && firebaseConfig.projectId) {
                firebaseConfig.databaseURL = `https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com`;
            }

            this.app = initializeApp(firebaseConfig);
            this.db = getDatabase(this.app, firebaseConfig.databaseURL);
            this.isConfigured = true;
            console.log("[Network] Firebase Realtime DB initialized successfully with URL:", firebaseConfig.databaseURL);
        } catch (err) {
            this.isConfigured = false;
            console.warn("[Network] Firebase initialization failed or offline:", err.message);
        }
    }

    checkConfig() {
        if (!this.isConfigured || !this.db) {
            return false;
        }
        return true;
    }

    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous I, 1, O, 0
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    /**
     * Create a new online multiplayer room
     * @param {string} hostName 
     * @param {number} maxPlayers (2, 3, or 4)
     */
    async createRoom(hostName, maxPlayers = 4) {
        if (!this.checkConfig()) {
            throw new Error("FIREBASE_NOT_CONFIGURED");
        }

        this.playerName = hostName || 'Player 1';
        localStorage.setItem('genius_ludo_player_name', this.playerName);
        this.currentRoomCode = this.generateRoomCode();
        this.isHost = true;
        this.playerSlot = 0; // Host is always slot 0 (Red)
        this.lastProcessedActionTimestamp = Date.now();
        this.lastProcessedReactionTimestamp = Date.now();

        this.roomRef = ref(this.db, `rooms/${this.currentRoomCode}`);

        const initialRoomData = {
            code: this.currentRoomCode,
            hostId: this.playerId,
            maxPlayers: Number(maxPlayers),
            status: 'waiting', // waiting, playing, finished
            createdAt: Date.now(),
            players: {
                [this.playerId]: {
                    id: this.playerId,
                    name: this.playerName,
                    slot: 0,
                    isHost: true,
                    joinedAt: Date.now(),
                    online: true
                }
            },
            gameState: null,
            lastAction: null,
            reaction: null
        };

        await set(this.roomRef, initialRoomData);

        this.saveSession(this.currentRoomCode, 'red', this.playerName, this.playerId);
        this.updateBrowserURL(this.currentRoomCode);

        // Disconnect handler
        const playerRef = ref(this.db, `rooms/${this.currentRoomCode}/players/${this.playerId}`);
        onDisconnect(playerRef).update({ online: false });

        this.listenToRoom();
        return this.currentRoomCode;
    }

    /**
     * Join an existing room by code
     */
    async joinRoom(roomCode, playerName) {
        if (!this.checkConfig()) {
            throw new Error("FIREBASE_NOT_CONFIGURED");
        }

        const cleanCode = roomCode.trim().toUpperCase();
        this.currentRoomCode = cleanCode;
        this.playerName = playerName || 'Player';
        localStorage.setItem('genius_ludo_player_name', this.playerName);
        this.lastProcessedActionTimestamp = Date.now();
        this.lastProcessedReactionTimestamp = Date.now();

        this.roomRef = ref(this.db, `rooms/${cleanCode}`);
        const snapshot = await get(this.roomRef);

        if (!snapshot.exists()) {
            throw new Error("ROOM_NOT_FOUND");
        }

        const roomData = snapshot.val();
        if (roomData.status !== 'waiting' && !roomData.players[this.playerId]) {
            throw new Error("GAME_ALREADY_STARTED");
        }

        const currentPlayers = roomData.players || {};
        const playerIds = Object.keys(currentPlayers);

        // Check if already in room (reconnection)
        if (currentPlayers[this.playerId]) {
            this.isHost = (currentPlayers[this.playerId].id === roomData.hostId);
            this.playerSlot = currentPlayers[this.playerId].slot;
            await update(ref(this.db, `rooms/${cleanCode}/players/${this.playerId}`), {
                name: this.playerName,
                online: true
            });
        } else {
            if (playerIds.length >= roomData.maxPlayers) {
                throw new Error("ROOM_FULL");
            }

            // Assign next available slot
            const usedSlots = Object.values(currentPlayers).map(p => p.slot);
            let assignedSlot = -1;

            if (roomData.maxPlayers === 2) {
                // In 2 player mode: slots 0 (Red) and 2 (Yellow)
                assignedSlot = usedSlots.includes(0) ? 2 : 0;
            } else {
                for (let s = 0; s < roomData.maxPlayers; s++) {
                    if (!usedSlots.includes(s)) {
                        assignedSlot = s;
                        break;
                    }
                }
            }

            if (assignedSlot === -1) assignedSlot = playerIds.length;

            this.isHost = false;
            this.playerSlot = assignedSlot;

            await update(ref(this.db, `rooms/${cleanCode}/players/${this.playerId}`), {
                id: this.playerId,
                name: this.playerName,
                slot: assignedSlot,
                isHost: false,
                joinedAt: Date.now(),
                online: true
            });
        }

        const playerRef = ref(this.db, `rooms/${cleanCode}/players/${this.playerId}`);
        onDisconnect(playerRef).update({ online: false });

        const colorNames = ['red', 'green', 'yellow', 'blue'];
        this.saveSession(cleanCode, colorNames[this.playerSlot] || 'red', this.playerName, this.playerId);
        this.updateBrowserURL(cleanCode);

        this.listenToRoom();
        return roomData;
    }

    listenToRoom() {
        if (!this.roomRef) return;
        if (this.roomListenerUnsub) {
            this.roomListenerUnsub();
        }

        this.roomListenerUnsub = onValue(this.roomRef, (snapshot) => {
            if (!snapshot.exists()) {
                if (this.onRoomStateChange) {
                    this.onRoomStateChange({ deleted: true });
                }
                return;
            }
            const data = snapshot.val();

            if (this.onRoomStateChange) {
                this.onRoomStateChange(data);
            }

            // Sync Remote Actions (Dice rolls, Pawn moves)
            if (data.lastAction && data.lastAction.timestamp) {
                if (data.lastAction.timestamp > this.lastProcessedActionTimestamp) {
                    this.lastProcessedActionTimestamp = data.lastAction.timestamp;
                    if (data.lastAction.senderSlot !== this.playerSlot && this.onGameAction) {
                        this.onGameAction(data.lastAction);
                    }
                }
            }

            // Sync Authoritative Game State for ALL clients (host and non-host)
            if (data.gameState && this.onGameStateSync) {
                this.onGameStateSync(data.gameState);
            }

            // Floating Emoji Reactions
            if (data.reaction && data.reaction.timestamp) {
                if (data.reaction.timestamp > this.lastProcessedReactionTimestamp) {
                    this.lastProcessedReactionTimestamp = data.reaction.timestamp;
                    if (this.onReactionReceived) {
                        this.onReactionReceived(data.reaction);
                    }
                }
            }
        }, (error) => {
            console.error("[Network] Room sync error:", error);
        });
    }

    /**
     * Start game (Host only)
     */
    async startGame(initialGameState) {
        if (!this.roomRef || !this.isHost) return;
        await update(this.roomRef, {
            status: 'playing',
            gameState: initialGameState,
            startedAt: Date.now()
        });
    }

    /**
     * Broadcast dice roll action
     */
    async broadcastDiceRoll(rollValue, consecutiveSixes) {
        if (!this.roomRef || !this.currentRoomCode || !this.db) return;
        try {
            await update(ref(this.db, `rooms/${this.currentRoomCode}/lastAction`), {
                type: 'DICE_ROLL',
                senderSlot: this.playerSlot,
                rollValue: rollValue,
                consecutiveSixes: consecutiveSixes || 0,
                timestamp: Date.now()
            });
        } catch (err) {
            console.error("[Network] broadcastDiceRoll error:", err);
        }
    }

    /**
     * Broadcast token move action
     */
    async broadcastMoveToken(tokenIndex, steps, fromStep, toStep) {
        if (!this.roomRef || !this.currentRoomCode || !this.db) return;
        try {
            await update(ref(this.db, `rooms/${this.currentRoomCode}/lastAction`), {
                type: 'MOVE_TOKEN',
                senderSlot: this.playerSlot,
                tokenIndex: tokenIndex,
                steps: steps,
                fromStep: fromStep,
                toStep: toStep,
                timestamp: Date.now()
            });
        } catch (err) {
            console.error("[Network] broadcastMoveToken error:", err);
        }
    }

    /**
     * Atomic partial or full game state update (turn, tokens, hasRolled, etc.)
     * Used by both host and active turn players to sync authoritative match progress
     */
    async updateGameState(partialState) {
        if (!this.roomRef || !this.currentRoomCode || !this.db) return;
        try {
            const gameRef = ref(this.db, `rooms/${this.currentRoomCode}/gameState`);
            await update(gameRef, {
                ...partialState,
                lastUpdate: Date.now()
            });
        } catch (err) {
            console.error("[Network] Failed to update gameState:", err);
        }
    }

    /**
     * Synchronize entire game state (used as master snapshot)
     */
    async syncFullGameState(state) {
        if (!this.roomRef || !this.currentRoomCode || !this.db) return;
        try {
            await update(ref(this.db, `rooms/${this.currentRoomCode}`), {
                gameState: state
            });
        } catch (err) {
            console.error("[Network] syncFullGameState error:", err);
        }
    }

    /**
     * Send floating emoji reaction
     */
    async sendEmoji(emojiChar) {
        if (!this.roomRef || !this.currentRoomCode || !this.db) return;
        try {
            const reactionData = {
                id: 'r_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                senderSlot: this.playerSlot,
                senderName: this.playerName,
                emoji: emojiChar,
                timestamp: Date.now()
            };
            await update(ref(this.db, `rooms/${this.currentRoomCode}`), {
                reaction: reactionData
            });
        } catch (err) {
            console.error("[Network] sendEmoji error:", err);
        }
    }

    /**
     * Leave or disconnect from current room
     */
    async leaveRoom() {
        if (this.roomRef && this.currentRoomCode && this.db) {
            try {
                if (this.isHost) {
                    await remove(this.roomRef);
                } else {
                    await remove(ref(this.db, `rooms/${this.currentRoomCode}/players/${this.playerId}`));
                }
            } catch (e) {
                // Ignore cleanup errors on exit
            }
        }
        if (this.roomListenerUnsub) {
            this.roomListenerUnsub();
            this.roomListenerUnsub = null;
        }
        this.clearSession();
        this.resetBrowserURL();
        this.currentRoomCode = null;
        this.roomRef = null;
        this.isHost = false;
    }
}

export const network = new NetworkManager();
