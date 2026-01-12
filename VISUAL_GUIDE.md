# SEAM-VIZ Visual Guide

## 🎨 What You'll See When You Open http://localhost:3000

### Layout Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                         SEAM-VIZ Application                            │
├────────────────────────────┬───────────────────────────────────────────┤
│                            │                                            │
│   LEFT PANEL              │         RIGHT PANEL                        │
│   "OBJECT IN ℝ³"          │         "DIRECTION SPACE S²"               │
│                            │                                            │
│   ┌──────────────┐        │         ┌──────────────┐                  │
│   │              │        │         │              │                  │
│   │   3D Shape   │        │         │   Quotient   │                  │
│   │   (Sphere)   │        │         │   Sphere     │                  │
│   │              │        │         │              │                  │
│   │   🔦 Cyan    │        │         │    [u]       │                  │
│   │   Spotlight  │        │         │              │                  │
│   │              │        │         │  ✨Fiber     │                  │
│   │   🔦 Purple  │        │         │   Bundles    │                  │
│   │   Spotlight  │        │         │              │                  │
│   │              │        │         │              │                  │
│   └──────────────┘        │         └──────────────┘                  │
│                            │                                            │
└────────────────────────────┴───────────────────────────────────────────┘
│                      CONTROLS FOOTER                                    │
├────────────────────────────────────────────────────────────────────────┤
│  Shape: [Sphere ▼] │ Aperture: [━━●━━] │ [Color Picker] │ [Recalibrate]│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Visual Features

### 1. **Antipodal Color Picker** (NEW!)

Located in the controls footer:

```
┌─────────────────────────────────────────┐
│  Spotlight Colors                        │
├─────────────────────────────────────────┤
│                                          │
│  "Some choices determine their opposite" │  ← First-time hint
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ ● [Cyan]      u        #00E5BC     │ │ ← You pick this
│  └────────────────────────────────────┘ │
│             │                            │
│             │  ⚫ Spinning sphere        │ ← Animation
│             ▼                            │
│  ┌────────────────────────────────────┐ │
│  │ ● [Coral] 🔒  -u       #FF1A43     │ │ ← Auto-determined
│  │   "Determined by u"                │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**What happens:**
- Click the top color → picker opens
- Choose any color (e.g., cyan #00E5BC)
- **200ms pause** (system "thinking")
- **Sphere animates** (spins 180°)
- **Antipodal color appears** (coral #FF1A43)
- Bottom is **locked** (🔒 icon visible)

---

### 2. **Fiber Bundles** (NEW!)

When you **click the quotient sphere** (right panel):

```
RIGHT PANEL - DIRECTION SPACE S²

        ┌───────────┐
       ╱             ╲
      │               │
      │      [u]      │  ← Clicked here
      │       ●━━━━━━━━━━━━━━> u (cyan endpoint)
      │       ┃       │
      │       ┃  ⚪   │  ← Pulsing white base
      │       ┃       │
      │       ┗━━━━━━━━━━━━━━> -u (purple endpoint)
      │               │
       ╲             ╱
        └───────────┘

Legend:
  ●     = Quotient point [u] on sphere surface
  ⚪    = Pulsing white marker at base
  ━━━>  = Fiber bundle lines (colored)
  ends  = Small colored spheres at u and -u
```

**Animation sequence:**
1. **Click** anywhere on quotient sphere
2. **White pulse** appears at click point
3. **Two lines shoot upward** (500ms animation)
   - Cyan line → toward u representative
   - Purple line → toward -u representative
4. **Endpoint markers** appear (small spheres)
5. **Bundles fade** after 3 seconds
6. **Max 5 bundles** visible at once

---

### 3. **Spotlight Cones** (Existing, Enhanced)

LEFT PANEL - Shows the effect in source space:

```
     3D SHAPE (e.g., Sphere)

         ╱╲              ← Cyan cone (from u)
        ╱  ╲
       ╱ 🔦 ╲           ← Spotlight apex
      ╱      ╲
     ╱________╲
    │          │
    │  Sphere  │
    │          │
     ╲________╱
      ╲      ╱
       ╲ 🔦 ╱            ← Spotlight apex
        ╲  ╱
         ╲╱              ← Purple cone (from -u)
```

**Color synchronization:**
- Spotlights use **same colors** as color picker
- Change picker → spotlights update instantly
- Cones point at both u and -u simultaneously

---

### 4. **Background Gradient** (Existing)

Subtle radial gradients emanate from top/bottom:
- **Top**: Cyan glow (from u)
- **Bottom**: Purple glow (from -u)
- **Intensity**: Tied to aperture slider

---

## 🎬 Interaction Demo

### Scenario: Click and Change Color

**Step 1: Initial State**
- Sphere with default cyan/purple spotlights
- Color picker shows cyan (#00E5BC)
- No fiber bundles

**Step 2: Click Quotient Sphere**
```
Action: Click top of quotient sphere (right panel)

Result:
  ✨ White pulse at click point
  ✨ Two fiber bundles shoot up
  ✨ Cyan line goes to top representative
  ✨ Purple line goes to bottom representative
  ✨ Small spheres mark endpoints
  ✅ Spotlights update on left panel
```

**Step 3: Change Color**
```
Action: Click color picker, choose red (#FF0000)

Result:
  ⏸️  200ms pause
  🔄 Sphere spins
  🎨 Antipodal becomes cyan (#00FFFF)
  ✅ Spotlights change to red/cyan
  ✅ Existing fiber bundles retain old colors
  ✅ New clicks create red/cyan bundles
```

**Step 4: Multiple Clicks**
```
Action: Click 5 different points on quotient sphere

Result:
  📊 Up to 5 fiber bundles visible
  🌊 Oldest bundles fade as new ones appear
  🎨 All bundles color-coded by timestamp
  ⚡ Smooth staggered animations
```

---

## 🎨 Color Examples

Try these color combinations to see antipodal pairing:

| Primary (u) | Antipodal (-u) | Visual Effect |
|-------------|----------------|---------------|
| #FF0000 (Red) | #00FFFF (Cyan) | Classic complementary |
| #00E5BC (Teal) | #FF1A43 (Coral) | Current default |
| #FFFF00 (Yellow) | #0000FF (Blue) | High contrast |
| #8B4513 (Brown) | #74BAEC (Sky Blue) | Earthy/airy |
| #000000 (Black) | #FFFFFF (White) | Maximum contrast |

---

## 📐 Mathematical Visualization

### Quotient Map in Action

```
   COVERING SPACE (S²)         QUOTIENT SPACE (ℝP²)
   Left Panel                   Right Panel

   u (North) ●━━━━━━━━━━━━━━━━━●  [u]
             ╲                 ╱
              ╲   Fiber       ╱
               ╲  Bundle     ╱
                ╲           ╱
                 ╲         ╱
                  ╲       ╱
                   ╲     ╱
                    ╲   ╱
                     ╲ ╱
  -u (South) ●━━━━━━━●

  π: S² → ℝP²
  π(u) = π(-u) = [u]
  π⁻¹([u]) = {u, -u}  ← Fiber visualized!
```

---

## 🎓 Pedagogical Moments

### When you first open:
1. **See**: Two spotlights on left, one sphere on right
2. **Learn**: "Hmm, two lights but clicking one point?"
3. **Understand**: Quotient identification u ≡ -u

### When you try to change second color:
1. **See**: Lock icon, grayed out, can't click
2. **Try**: Maybe I can override?
3. **Learn**: "The system won't let me. It's determined."
4. **Understand**: Some choices are not independent

### When you click quotient sphere:
1. **See**: Two bundles shoot up
2. **Count**: One click → two effects
3. **Connect**: "This [u] maps to both u and -u"
4. **Understand**: Covering spaces have fibers

---

## 🚀 Quick Test Checklist

Open http://localhost:3000 and try:

- [ ] **Rotate both panels** (drag to orbit)
- [ ] **Click color picker** → See antipodal animation
- [ ] **Click quotient sphere** → See fiber bundles appear
- [ ] **Adjust aperture slider** → See spotlight cones expand/contract
- [ ] **Change shape** → See spotlights adapt to new geometry
- [ ] **Click 5+ times rapidly** → See bundle management
- [ ] **Wait 3 seconds** → See bundles fade
- [ ] **Click Recalibrate** → Everything resets

---

## 📊 Performance Metrics

What to expect:
- **Initial load**: < 500ms
- **Fiber bundle animation**: 500ms (smooth)
- **Color picker animation**: 500ms total (200ms pause + 300ms spin)
- **Frame rate**: 60 FPS on modern hardware
- **Memory**: ~50MB for 5 active fiber bundles

---

## 🎯 Success Indicators

You'll know it's working when:

✅ Color picker shows spinning sphere animation
✅ Antipodal color changes automatically
✅ Clicking quotient sphere creates vertical bundles
✅ Fiber bundles are color-coded and fade smoothly
✅ Spotlights match color picker colors
✅ Lock icon appears on -u color
✅ First-time hint appears and fades
✅ TypeScript has zero errors
✅ Build completes in < 200ms

---

**Enjoy exploring quotient spaces!** 🎨✨
