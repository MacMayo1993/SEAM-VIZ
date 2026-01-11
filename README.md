# SEAM  
## Quotient Symmetry in Information Geometry

**Stochastic Eversion of Antipodal Manifolds**

SEAM is an interactive pedagogical instrument for understanding **quotient symmetry** and **information geometry** through the visualization of the **real projective plane (ℝP²)**.

The app demonstrates one foundational idea:

> **When orientation information is discarded, distinct states become identical in a structured, unavoidable way.**

SEAM shows this process explicitly by allowing users to apply **projective identification**—the rule  
**u ≡ −u**—to ordinary geometric objects and observe which distinctions collapse.

This identification is the mathematical foundation from which **non-orientability, seams, and ambiguity** later arise.

---

## What SEAM Is (Current Version)

SEAM is **not** a shape-morphing tool and **not** a gallery of exotic surfaces.

It is an **information-theoretic instrument** that cleanly separates:

- **State space** — what distinctions exist before identification  
- **Identification rules** — which distinctions are forgotten  

and lets users explore the consequences of applying those rules.

The current version focuses exclusively on **projective identification** and the emergence of **ℝP²**.

---

## Core Mathematical Concept

### Direction Space and Quotienting

- Directions in 3D space live on the **unit sphere S²**
- If orientation is ignored, opposite directions are identified:

  **u ≡ −u**

- The quotient space formed by this identification is the **real projective plane**:

  **ℝP² = S² / (u ≡ −u)**

SEAM visualizes this quotient *operationally*, not symbolically.

The right panel of the app represents this identification rule directly.

---

## Interface Overview

SEAM is organized into **two panels with strictly distinct roles**.

---

### Left Panel — State Space

**Label:**  
**STATE SPACE (ℝ² or ℝ³)**

The left panel displays a **single base object** representing distinct states *before* identification.

Supported objects include:

#### Planar Domains (ℝ² embedded in ℝ³)
- Circle
- Triangle
- Square

#### Spatial Objects (ℝ³)
- Sphere
- Cube
- Pyramid

These objects are:
- Fully orientable
- Continuous (no gaps, cuts, or seams)
- Passive until acted upon by identification

The topology of the object never changes.

---

### Right Panel — Projective Identification Instrument

**Label:**  
**DIRECTION SPACE S²**  
**IDENTIFICATION: u ≡ −u**  
**QUOTIENT: S²/(±) = ℝP²**

The right panel is a **fixed instrument** that represents:

- The unit sphere of directions **S²**
- With enforced antipodal identification **u ≡ −u**

It is **not** a visualization of the left object.

It exists solely to select **projective equivalence classes**.

---

## Antipodal Spotlights

Projective identification is visualized using **antipodal spotlights**:

- A spotlight is defined by a direction **u** and aperture angle **θ**
- A point on the left object is highlighted if it lies within θ of **u** *or* **−u**
- Highlights are always:
  - Symmetric
  - Paired
  - Simultaneous

It is impossible to select **u** without also selecting **−u**.

This makes equivalence classes visible without cutting or deforming objects.

---

## Interaction Model

### Right → Left

1. User clicks the sphere in the right panel
2. Direction **u** is selected
3. Antipodal direction **−u** is automatically paired
4. Left object highlights all points identified with **[u]**

---

### Left → Right

1. User clicks a point on the object
2. The direction from the object’s center is computed
3. Its projective class **[u]** is selected
4. Antipodal cones appear on the right panel

At no point can a single direction exist without its antipode.

---

## Adjustable Controls (Current)

All user controls affect **representation and clarity**, never topology or identification rules.

### Geometry & Perception
- Mesh resolution / smoothness
- Edge visibility
- Lighting direction
- Lighting intensity
- Camera zoom (constrained)

### Highlighting
- Spotlight aperture (cone width)
- Highlight falloff
- Highlight intensity

### Constraints
- Planar objects cannot be freely rotated
- No cuts, gaps, or deformations are possible
- Projective identification cannot be disabled

---

## What SEAM Does *Not* Do (By Design)

The current version deliberately avoids:

- Showing ℝP² as a surface
- Allowing non-orientable objects as base inputs
- Morphing objects into projective surfaces
- Showing seams or ambiguity regions
- Introducing dynamics, eversion, or time evolution

Non-orientability is treated as a **consequence**, not a starting point.

---

## Pedagogical Goal (V1)

The goal of the current version is for users to internalize one fact:

> **Quotienting collapses distinctions globally, not locally.**

Once this is understood, seams and ambiguity become inevitable rather than mysterious.

---

# Roadmap — Future Development

The following features are **not yet implemented** and are intentionally staged.

---

## V2 — Derived Topology Reveal

Goal: Show what **emerges** from projective identification.

- Ghosted Möbius strip revealed from circle + antipodal ID
- Ghosted ℝP² reference model revealed from sphere + antipodal ID
- Non-interactive explanatory overlays only
- Clear labeling: *“Result of projective identification”*

---

## V3 — Seam Visualization

Goal: Make **seams** explicit as loci of ambiguity.

- Highlight regions where identification density concentrates
- Visualize overlap of equivalence neighborhoods
- Introduce the concept of a seam as **identification stress**
- No cuts or surgery

---

## V4 — Dynamic Identification

Goal: Explore identification under motion.

- Direction sweeps
- Continuity vs ambiguity
- Emergent non-orientability in motion

---

## V5 — Pedagogical Expansion

Goal: Turn SEAM into a full learning instrument.

- Guided lessons
- Concept checkpoints
- Educator annotations
- Exportable visual states

---

## Design Philosophy (Pinned)

> **SEAM is not a shape viewer.  
> It is an instrument that applies a rule.  
> Non-orientability is not chosen — it is discovered.**

---

## Status

- **Current:** Functional V1 projective identification instrument  
- **Focus:** Information geometry and quotient symmetry  
- **Next:** Derived topology and seam emergence  

---

If you understand this README,  
you are already prepared to understand why seams must exist.
