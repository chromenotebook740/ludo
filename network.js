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
        this.onRoomStateChange = null;
        this.onReactionReceived = null;
        this.onGameAction = null;
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

    init() {
        try {
            // Check if config has been modified from default dummy values
            const isDefault = !firebaseConfig.apiKey || 
                              firebaseConfig.apiKey.includes('DummyKey') || 
                              (firebaseConfig.databaseURL && firebaseConfig.databaseURL.includes('genius-ludo-demo'));
            if (isDefault) {
                this.isConfigured = false;
                console.warn("[Network] Firebase config is currently set to placeholder credentials. Offline Pass & Play and AI modes are active.");
                return;
            }

            // Ensure databaseURL is present
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
            if (data.reaction && this.onReactionReceived) {
                this.onReactionReceived(data.reaction);
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
        if (!this.roomRef) return;
        await update(ref(this.db, `rooms/${this.currentRoomCode}/lastAction`), {
            type: 'DICE_ROLL',
            senderSlot: this.playerSlot,
            rollValue: rollValue,
            consecutiveSixes: consecutiveSixes,
            timestamp: Date.now()
        });
    }

    /**
     * Broadcast token move action
     */
    async broadcastMoveToken(tokenIndex, steps, fromStep, toStep) {
        if (!this.roomRef) return;
        await update(ref(this.db, `rooms/${this.currentRoomCode}/lastAction`), {
            type: 'MOVE_TOKEN',
            senderSlot: this.playerSlot,
            tokenIndex: tokenIndex,
            steps: steps,
            fromStep: fromStep,
            toStep: toStep,
            timestamp: Date.now()
        });
    }

    /**
     * Synchronize entire game state (used by host as authoritative anchor)
     */
    async syncFullGameState(state) {
        if (!this.roomRef || !this.isHost) return;
        await update(ref(this.db, `rooms/${this.currentRoomCode}`), {
            gameState: state
        });
    }

    /**
     * Send floating emoji reaction
     */
    async sendEmoji(emojiChar) {
        if (!this.roomRef) return;
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
    }

    /**
     * Leave or disconnect from current room
     */
    async leaveRoom() {
        if (this.roomRef && this.currentRoomCode) {
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
        this.currentRoomCode = null;
        this.roomRef = null;
        this.isHost = false;
    }
}

export const network = new NetworkManager();
