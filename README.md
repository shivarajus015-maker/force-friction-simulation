# Force & Friction Lab (ಬಲ ಮತ್ತು ಘರ್ಷಣೆ)

An interactive, colorful 8th-grade Science simulation game that helps students explore **Force** (`ಬಲ`) and **Friction** (`ಘರ್ಷಣೆ`) through hands-on experimentation. Built with pure **HTML, CSS, and JavaScript** with zero external images or build tools—ready to run offline or host directly on **GitHub Pages**.

---

## ✨ Features

- **Playful Game Stage:** Sky-blue gradient backdrop, animated clouds, `0–100 cm` ruler track, and a `🚗` toy car launched by a stretchy SVG rubber band.
- **4 Interactive Surfaces (with Hidden Friction):**
  - 📄 **Paper (`ಕಾಗದ`)** — Smooth, low friction
  - 🧵 **Cloth (`ಬಟ್ಟೆ`)** — Woven textile, medium friction
  - 🧱 **Sandpaper (`ಮರಳು ಕಾಗದ`)** — Gritty texture, high friction
  - 🟫 **Carpet (`ಕಾರ್ಪೆಟ್`)** — Plush surface, very high friction
- **3 Ways to Apply Force:**
  1. **Drag the Rubber Band / Car** directly backward on desktop mouse or tablet touch (`touch-action: none` + Pointer Events).
  2. **Hold to Pull (`ಒತ್ತಿ ಹಿಡಿದು ಬಿಡಿ`)** button to charge up the Force Meter and launch on release.
  3. **Force Slider + Release Car! (`ಕಾರು ಬಿಡಿ`)** button for exact controlled trials.
- **Physics & Visual Trail:**
  - Calculates `Distance Traveled = User Force - Surface Friction` (when `Force ≤ Friction`, the car shudders and barely moves `1 cm`).
  - Animates acceleration, friction deceleration, motion ribbon & tire-track trails, dust particles, and a `🏁` stop flag.
- **Live Experiment Data Log (`ಪ್ರಯೋಗದ ದಾಖಲೆಗಳು`):**
  - Logs **Surface Type**, **Force Applied**, and **Distance Traveled** for every trial.
  - Automatically highlights the highest-distance row in **green (`🏆 Best`)**.
- **Instant Feedback Pop-up:** Shows `"You applied [X] force. The [Surface] had [Y] friction. The car moved [Z] cm!"` along with a Kannada explanation.
- **5-Pull Mini-Quiz (`ಮಿನಿ ಕ್ವಿಜ್`):** Automatically unlocks and opens a bilingual 3-question quiz after 5 completed pulls.
- **Synthesized Sound Effects:** Built-in Web Audio API sound effects with a header mute/unmute toggle.

---

## 📁 Project Structure

```text
force-and-friction-lab/
├── index.html   # Page structure, SVG rubber band, stage, controls, data table, quiz modal
├── styles.css   # Sky theme, CSS-only surface textures, animations, responsive tablet/mobile layout
├── script.js    # Physics simulation, pointer drag events, Web Audio SFX, data logger, mini-quiz
└── README.md    # Project documentation
```

---

## 🚀 How to Run

### Option 1: Open Locally
No installation or server is required. Download or clone the repository and open `index.html` directly in any modern browser (Chrome, Edge, Safari, Firefox, or tablet browsers).

### Option 2: Host on GitHub Pages
1. Push all files (`index.html`, `styles.css`, `script.js`, `README.md`) to your GitHub repository (for example, `force-and-friction-lab`).
2. Go to your repository **Settings** → **Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose your `main` branch and `/ (root)` folder, then click **Save**.
5. After a minute, your live simulation will be available at `https://<your-username>.github.io/force-and-friction-lab/`.

---

## 🧪 Learning Objectives (8th Grade Science)
- Observe how surface roughness affects friction and stopping distance.
- Compare outcomes when the same force is applied across different surfaces.
- Understand that motion occurs only when applied force overcomes opposing friction (`Force > Friction`).
