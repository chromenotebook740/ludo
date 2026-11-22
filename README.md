# 🎲 Genius Ludo (Modern Matte Tabletop Edition)

> **Ultra-Clean, Tactile, Zero-Lag Web-Based Multiplayer Ludo Game**  
> Pure HTML5, CSS3, and Vanilla ES6+ JavaScript — Zero External Frameworks, Zero Heavy Assets, Zero Lag (< 80 KB Total Payload).

---

## 🌟 Key Visual & Gameplay Upgrades

1. **Modern Matte Tabletop Board Aesthetics**
   - **No Glossy Shine or Plastic Highlights:** Built with high-contrast matte surfaces, warm charcoal-slate backdrop (`#181A20`), and rich matte walnut/slate frame (`#2B2E3B`).
   - **Clean Ivory Grid:** Off-white ivory playing tiles (`#F8F9FA`) with sharp `1.2px` grid lines (`#CBD5E1`).
   - **Matte Player Palette:** Crimson Red (`#E63946`), Emerald Green (`#2A9D8F`), Amber Gold (`#E9C46A`), and Royal Cobalt (`#3A86FF`).
   - **4 Corner Yards:** Solid matte colored outer yards with crisp white inner cards holding 4 recessed circular token sockets.
   - **Center Finish Area:** 4 sharp geometric triangles meeting in a white circular disc with a clean matte Gold Crown emblem.
   - **Safe Zones:** Minimalist slate 5-point stars (`#94A3B8`) and directional start arrows.

2. **Top-Down Tactile Pin/Pawn Board Game Pieces**
   - Lathe-turned tactile pawn design with a soft grounded drop shadow (`rgba(0,0,0,0.28)`).
   - Crisp `2.5px` pure white outer ring (`#FFFFFF`) ensuring every pawn pops sharply on any tile.
   - Smooth parabolic hop animation with ground-shadow perspective scaling.
   - Intelligent scaling & angular offsets for multiple pawns sharing the same tile.

3. **Tactile 3D-Style Dice & Player Docks**
   - Crisp white rounded dice (`#FFFFFF`, `border-radius: 10px`, `2px solid #E2E8F0`) with deep matte pips (and red pip for `1` and `6`).
   - 4 Player Dock Cards around the board featuring player avatars, names, **4 mini progress dots** for tokens home, and active turn countdown progress lines.

4. **Web Audio API Procedural Sound Synthesis**
   - 100% synthesized audio with zero audio asset files.
   - Realistic dice rattle and clatter, musical token hops, punchy capture pops, celestial star safe-zone chimes, and victory fanfares.
   - Built-in mute/unmute toggle persisted across sessions.

5. **Multiplayer + Offline Modes**
   - **Play Online (2, 3, or 4 Players):** Realtime room sync powered by Firebase Realtime Database. Generate 6-character room codes, copy invite link (`?room=CODE`), or share via WhatsApp.
   - **Pass & Play (Local 2-4 Players):** Play locally on a single device with customized names.
   - **Vs Computer:** Instant match against smart tactical AI bots (1 vs 1 or 1 vs 3).

---

## 🚀 3-Step Setup Guide

### Step 1: Create a Free Firebase Realtime Database (for Online Multiplayer)
*Note: Pass & Play and Vs Computer modes work 100% offline out-of-the-box without this step!*

1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **"Add project"** (e.g. `genius-ludo`).
2. In the project dashboard:
   - Click the **Web (`</>`)** icon to register a web app.
   - Copy the `firebaseConfig` object shown on the screen.
3. In the Firebase left sidebar, navigate to **Build > Realtime Database**:
   - Click **"Create Database"** (choose default location).
   - In the **Rules** tab, set public read/write for simple room sync:
     ```json
     {
       "rules": {
         "rooms": {
           ".read": true,
           ".write": true
         }
       }
     }
     ```
   - Click **Publish**.
4. Open `network.js` in your code editor and paste your Firebase credentials into `firebaseConfig`:
   ```javascript
   export const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT_ID.appspot.com",
       messagingSenderId: "YOUR_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

---

### Step 2: Test Locally
You can test the game using any standard local static web server:

**Using Python:**
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your web browser.

**Using Node.js:**
```bash
npx serve .
```

---

### Step 3: Deploy to GitHub Pages in 60 Seconds

1. Create a new GitHub repository named `genius-ludo`.
2. Push the files (`index.html`, `style.css`, `game.js`, `network.js`, `audio.js`, `README.md`) to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Genius Ludo Matte Tabletop Edition"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/genius-ludo.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Go to **Settings** > **Pages** (under the "Code and automation" section).
   - Under **Build and deployment > Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` and `/ (root)`, then click **Save**.
4. Within 1-2 minutes, your live game URL will be ready at:  
   `https://YOUR_USERNAME.github.io/genius-ludo/`

Share the link with your friends and enjoy zero-lag multiplayer Ludo! 🎲🏆
