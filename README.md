# Universal Workflow Agents

A model-agnostic, harness-agnostic suite of 9 specialized AI agents engineered for **Code**, **Design**, and **Writing** workflows.

These agents run natively in **Claude Code**, **Google Antigravity**, **Cursor**, **Windsurf**, or directly inside web chats and API wrappers (Claude, GPT-4o, Gemini, DeepSeek, Ollama).

---

## 🧭 The 3x3 Agent Suite

| Domain | Agent ID | Core Specialty | Key Lens |
| :--- | :--- | :--- | :--- |
| **Code** | [`code-review`](file:///Users/visualnaut/sites/agents-model/agents/code/code-review/SKILL.md) | Architecture & Quality Gatekeeper | Module depth, seams, cognitive load, error resilience |
| **Code** | [`adversarial`](file:///Users/visualnaut/sites/agents-model/agents/code/adversarial/SKILL.md) | Doubt-Driven Red Teamer | Concurrency, race conditions, toxic inputs, failure cascades |
| **Code** | [`simplifier`](file:///Users/visualnaut/sites/agents-model/agents/code/simplifier/SKILL.md) | YAGNI & Bloat Eliminator | Dead code, premature abstractions, native stdlib leverage |
| **Design** | [`design-crit`](file:///Users/visualnaut/sites/agents-model/agents/design/design-crit/SKILL.md) | Visual & Interaction Critic | Visual hierarchy, 4px/8px rhythm, typography, affordances |
| **Design** | [`design-system`](file:///Users/visualnaut/sites/agents-model/agents/design/design-system/SKILL.md) | Token & Component Hygiene Enforcer | Zero hardcoded values, component reusability, semantic HTML |
| **Design** | [`empathy-a11y`](file:///Users/visualnaut/sites/agents-model/agents/design/empathy-a11y/SKILL.md) | Cognitive Strain & A11y Auditor | WCAG 2.2 AA/AAA, keyboard focus, screen readers, edge states |
| **Writing** | [`copy-editor`](file:///Users/visualnaut/sites/agents-model/agents/writing/copy-editor/SKILL.md) | Ruthless Slop-Cutter & Stylist | Purges AI clichés, active verbs, dynamic cadence, 30%+ cut |
| **Writing** | [`steelman-skeptic`](file:///Users/visualnaut/sites/agents-model/agents/writing/steelman-skeptic/SKILL.md) | Thesis Challenger & Logic Auditor | Exposes unstated assumptions, attacks weak logic, steelmans |
| **Writing** | [`narrative-architect`](file:///Users/visualnaut/sites/agents-model/agents/writing/narrative-architect/SKILL.md) | Information Architect & Pacing Strategist | Outlines, cognitive progression (familiar -> novel), payoffs |

---

## ⚡ Dual-Mode Execution

Every agent supports two complementary operational modes:

### 1. Fast Audit Mode (Default)
Feed an artifact (diff, component code, PRD, or essay) to the agent. It immediately returns a standardized:
- **Executive Verdict** (`PASS`, `NEEDS_WORK`, or `REJECT`)
- **Quality Scorecard Matrix** (1-5 ratings across 4 domain dimensions)
- **Ranked Findings** (`BLOCKER`, `WARNING`, `NIT/POLISH`) with problem analysis and **concrete drop-in replacement diffs**
- **Dialectic Probing Questions**

### 2. Workshop Mode
Triggered during exploratory phases (e.g., *"Spar with me on this architecture"* or *"Let's workshop this opening paragraph"*). The agent acts as a dialectic sparring partner, cross-examining your assumptions, exploring trade-offs, and co-refining the solution.

---

## 🎯 Persona Calibration

- **Default (`ruthless`):** Zero sycophancy. No empty praise (*"Great job!"*). Assumes the artifact has weaknesses and immediately identifies failure modes, unstated premises, or bloat.
- **Draft Mode (`--gentle` or `mode: draft`):** Tolerates scaffolding and rough edges for early brainstorming while identifying structural dead ends.

---

## 🛡️ Multi-Agent Gauntlet Recipes

For comprehensive end-to-end evaluation, use the composite Gauntlet recipes:

- [**Code Gauntlet**](file:///Users/visualnaut/sites/agents-model/recipes/code-gauntlet.md): `code-review` ➔ `adversarial` ➔ `simplifier`  
  *Reviews seams, attacks edge cases, then strips defensive bloat.*
- [**Design Gauntlet**](file:///Users/visualnaut/sites/agents-model/recipes/design-gauntlet.md): `design-crit` ➔ `empathy-a11y` ➔ `design-system`  
  *Refines visual hierarchy, ensures accessibility/edge states, then normalizes tokens.*
- [**Writing Gauntlet**](file:///Users/visualnaut/sites/agents-model/recipes/writing-gauntlet.md): `narrative-architect` ➔ `copy-editor` ➔ `steelman-skeptic`  
  *Structures narrative flow, cuts slop by 30%+, then pressure-tests the thesis.*

---

## 🚀 Cross-Harness Installation

Use the included zero-dependency installer script to link or export agents:

```bash
# Interactive setup
./scripts/install.sh

# Target specific harness:
./scripts/install.sh --target antigravity   # Symlinks to ~/.gemini/config/skills/
./scripts/install.sh --target claude        # Symlinks to ~/.claude/skills/
./scripts/install.sh --target cursor        # Generates .cursor/rules/*.mdc
./scripts/install.sh --target bundle        # Builds dist/all-agents-bundle.md
./scripts/install.sh --target all           # Installs across all supported harnesses

# Uninstall symlinks:
./scripts/install.sh --target antigravity --uninstall
```

### Using with Web LLMs (ChatGPT, Claude.ai, Gemini Studio, Ollama)
Run `./scripts/export-bundle.sh` to generate [`dist/all-agents-bundle.md`](file:///Users/visualnaut/sites/agents-model/dist/all-agents-bundle.md). Copy and paste any agent's specification directly into your model's system prompt or chat session.

---

## 📁 Repository Structure

```
agents-model/
├── README.md                          # This documentation
├── agents/                            # Canonical agent specifications
│   ├── code/
│   │   ├── code-review/SKILL.md
│   │   ├── adversarial/SKILL.md
│   │   └── simplifier/SKILL.md
│   ├── design/
│   │   ├── design-crit/SKILL.md
│   │   ├── design-system/SKILL.md
│   │   └── empathy-a11y/SKILL.md
│   └── writing/
│       ├── copy-editor/SKILL.md
│       ├── steelman-skeptic/SKILL.md
│       └── narrative-architect/SKILL.md
├── recipes/                           # Multi-agent pipelines
│   ├── code-gauntlet.md
│   ├── design-gauntlet.md
│   └── writing-gauntlet.md
├── scripts/
│   ├── install.sh                     # Cross-harness installer/symlinker
│   └── export-bundle.sh               # Single prompt library bundler
└── dist/
    └── all-agents-bundle.md           # Standalone copy-paste bundle
```

---

## 📄 License
MIT
