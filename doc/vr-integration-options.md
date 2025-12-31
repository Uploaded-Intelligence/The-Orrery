# VR Integration Options
## Status: NEEDS DECISION (before deployment phase)
## Priority: Low for prototype, Critical for deployment

---

```
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   THE QUESTION                                                             ║
║                                                                            ║
║   The Orrery is a React web app.                                           ║
║   Final deployment is Windows (VRChat/Resonite require GPU).               ║
║                                                                            ║
║   How does a web app integrate with VR?                                    ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

# The Four Options

## Option A: In-World Browser Panel

**How it works:** Resonite (and some VRChat worlds) support web panels—browser windows rendered as textures inside VR.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   VR WORLD                                                                  │
│   ═════════                                                                 │
│                                                                             │
│   ┌─────────────────────────────────────┐                                   │
│   │                                     │                                   │
│   │   [Browser Panel floating in VR]    │                                   │
│   │   └── renders: https://orrery.app   │                                   │
│   │                                     │                                   │
│   └─────────────────────────────────────┘                                   │
│                                                                             │
│   Player looks at panel, uses laser pointer to interact                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Pros | Cons |
|------|------|
| Zero code changes to Orrery | Limited to what VR browser supports |
| Deploy as normal web app | Input via laser pointer (less immersive) |
| Works today | Can't integrate deeply with VR world |
| | Resonite-specific (VRChat support unclear) |

**Dev platform impact:** None. Web app is platform-agnostic.

**Research needed:**
- [ ] Resonite web panel capabilities and limitations
- [ ] VRChat equivalent (if any)
- [ ] Input methods available (keyboard? gesture?)

---

## Option B: Desktop Overlay (OVR Toolkit, XSOverlay)

**How it works:** Third-party tools capture desktop windows and display them as floating panels in any VR app.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   WINDOWS DESKTOP                    VR HEADSET VIEW                        │
│   ═══════════════                    ════════════════                       │
│                                                                             │
│   ┌─────────────┐                    ┌─────────────────────┐                │
│   │ Chrome tab  │ ──── captured ──── │ Floating panel      │                │
│   │ (Orrery)    │      by OVR        │ visible in VR       │                │
│   └─────────────┘                    └─────────────────────┘                │
│                                                                             │
│   Player can pin, resize, position anywhere in VR space                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Pros | Cons |
|------|------|
| Works with ANY VR app (VRChat, Resonite, etc.) | Requires third-party tool |
| No code changes to Orrery | Less integrated feel |
| User controls placement | Slight latency |
| Already common workflow for VR users | |

**Dev platform impact:** None. Just a browser window.

**Research needed:**
- [ ] OVR Toolkit vs XSOverlay comparison
- [ ] Latency/performance impact
- [ ] Touch/gesture input support

---

## Option C: Native Bridge (Electron + WebSocket/OSC)

**How it works:** Wrap Orrery in Electron (desktop app), communicate with VR client via protocols like OSC or WebSocket.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   WINDOWS MACHINE                                                           │
│   ═══════════════                                                           │
│                                                                             │
│   ┌─────────────────┐         WebSocket/OSC         ┌─────────────────┐     │
│   │ Orrery          │ ◄──────────────────────────── │ VRChat/Resonite │     │
│   │ (Electron app)  │                               │ (sends events)  │     │
│   └─────────────────┘                               └─────────────────┘     │
│          │                                                   │              │
│          │ can trigger                                       │ can trigger  │
│          ▼                                                   ▼              │
│   - System notifications                             - Quest completion     │
│   - Sounds                                           - Timer events         │
│   - Window management                                - Avatar expressions   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Pros | Cons |
|------|------|
| Deep integration possible | Significant additional code |
| Bidirectional communication | Platform-specific (Windows) |
| Can trigger VR-side effects | Requires running separate app |
| Works with both VRChat and Resonite | More complex deployment |

**Dev platform impact:** Windows preferred for integration testing.

**Research needed:**
- [ ] VRChat OSC documentation
- [ ] Resonite WebSocket/API capabilities
- [ ] Electron packaging for Windows

---

## Option D: True VR Native (Unity/Resonite SDK)

**How it works:** Rebuild the Orrery UI inside the VR environment using native tools.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   THIS IS A DIFFERENT PROJECT                                               │
│                                                                             │
│   Not "integrate web app with VR"                                           │
│   But "rebuild as VR-native application"                                    │
│                                                                             │
│   Would require:                                                            │
│   - Learning Unity or Resonite SDK                                          │
│   - Rebuilding all UI in 3D                                                 │
│   - Different input paradigm (hands, gaze, controllers)                     │
│   - Months of additional work                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Pros | Cons |
|------|------|
| Most immersive possible | Essentially a rewrite |
| True VR-native experience | Long development time |
| Full access to VR capabilities | Requires new skills |
| | Maintains two codebases |

**Dev platform impact:** Windows required.

**Research needed:**
- [ ] Is this even desirable? (vs overlay approaches)
- [ ] Resonite ProtoFlux capabilities
- [ ] Scope estimate

---

# Decision Framework

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   FOR PROTOTYPE PHASE (NOW):                                                │
│   ══════════════════════════                                                │
│                                                                             │
│   Don't decide yet. Build the web app.                                      │
│   Test with Option B (desktop overlay) for quick validation.                │
│                                                                             │
│   DECISION TRIGGER:                                                         │
│   ═════════════════                                                         │
│                                                                             │
│   When Party chat feels right AND you want to use it in VR,                 │
│   THEN evaluate options based on:                                           │
│                                                                             │
│   1. How much VR integration do you actually need?                          │
│      - Just see it in VR? → Option A or B                                   │
│      - VR triggers Orrery events? → Option C                                │
│      - Full immersion required? → Option D                                  │
│                                                                             │
│   2. Which VR platform is primary?                                          │
│      - Resonite: Option A viable (good web panels)                          │
│      - VRChat: Option B or C (limited in-world browser)                     │
│      - Both equally: Option B or C                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# Dev Platform Recommendation

**For prototype phase:** Use whichever machine you prefer. Doesn't matter.

**For integration testing (later):**
- Options A, B: Still doesn't matter
- Option C: Windows preferred
- Option D: Windows required

**Bottom line:** Don't let VR concerns drive dev platform choice during prototype. The web app works anywhere. Make the platform decision when you reach integration phase.

---

*Document: VR Integration Options*
*Status: Question captured. Decision deferred.*
*Last Updated: 2025-12-30*
