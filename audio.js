/**
 * Genius Ludo - Web Audio API Procedural Sound Engine
 * Zero external audio files. 100% synthesized sound effects.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = localStorage.getItem('genius_ludo_muted') === 'true';
    }

    init() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('genius_ludo_muted', this.isMuted);
        return this.isMuted;
    }

    getMuted() {
        return this.isMuted;
    }

    /**
     * Crisp procedural dice rattle & clatter
     */
    playDiceRoll() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const totalDuration = 0.55;

        // Multiple rattling micro-impacts
        const impacts = [0, 0.08, 0.17, 0.25, 0.33, 0.40, 0.48];
        impacts.forEach((timeOffset, idx) => {
            const t = now + timeOffset;
            const decay = 0.04 + (idx === impacts.length - 1 ? 0.06 : 0.02);

            // Resonant body click
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(180 + Math.random() * 120, t);
            osc.frequency.exponentialRampToValueAtTime(60, t + decay);

            gain.gain.setValueAtTime(0.18 + (idx / impacts.length) * 0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + decay);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + decay);

            // High frequency rattle crackle
            const bufferSize = this.ctx.sampleRate * decay;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1600 + idx * 200;
            filter.Q.value = 3;

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.12, t);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, t + decay);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);
            noise.start(t);
            noise.stop(t + decay);
        });
    }

    /**
     * Melodic, resonant token hop
     */
    playHop(step = 0) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Progressive pitch based on path progress
        const baseFreq = 340 + Math.min(step * 6, 260);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.05);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, now + 0.12);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    /**
     * Punchy comic capture pop & slide
     */
    playCapture() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // Low punch / thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.28);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);

        // Crack / pop burst
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.06);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const popGain = this.ctx.createGain();
        popGain.gain.setValueAtTime(0.25, now);
        popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        noise.connect(popGain);
        popGain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 0.07);
    }

    /**
     * Crystal star / safe-zone chime
     */
    playSafeZone() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const frequencies = [880, 1320, 1760]; // Shimmering harmonic triad

        frequencies.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.04);

            gain.gain.setValueAtTime(0.16, now + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65 + idx * 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.04);
            osc.stop(now + 0.8);
        });
    }

    /**
     * Token reaches home goal chime
     */
    playHome() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.08);

            gain.gain.setValueAtTime(0.25, now + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.45);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.5);
        });
    }

    /**
     * Triumphant Victory Fanfare
     */
    playVictory() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Celebration arpeggios
        const chords = [
            { t: 0.0, freqs: [523.25, 659.25, 783.99], dur: 0.22 },       // C maj
            { t: 0.24, freqs: [587.33, 739.99, 880.00], dur: 0.22 },      // D maj
            { t: 0.48, freqs: [659.25, 830.61, 987.77], dur: 0.25 },      // E maj
            { t: 0.75, freqs: [783.99, 987.77, 1174.66], dur: 0.28 },     // G maj
            { t: 1.05, freqs: [1046.50, 1318.51, 1567.98], dur: 0.85 }    // High C maj chord
        ];

        chords.forEach(chord => {
            chord.freqs.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + chord.t);

                gain.gain.setValueAtTime(0.18, now + chord.t);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + chord.t + chord.dur);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + chord.t);
                osc.stop(now + chord.t + chord.dur + 0.05);
            });
        });
    }

    /**
     * Clean subtle button tap
     */
    playClick() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.045);
    }

    /**
     * Playful emoji reaction pop
     */
    playEmoji() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.08);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
    }
}

export const audio = new SoundEngine();
