# VXNT: Dedicated Workflow Agent & Skill System

A model-agnostic, harness-agnostic system featuring **VXNT** (Dedicated Lead Agent), 4 specialized **Division Subagents**, and 15 skills prefixed with `vxnt:` across **Build**, **Code**, **Design**, **Writing**, and **Token Efficiency**.

Runs natively in **Google Antigravity**, **Claude Code**, **Cursor**, **Windsurf**, or directly inside web chats and API wrappers (Claude, GPT-4o, Gemini, DeepSeek, Ollama).

---

## 👑 The Dedicated Lead Agent: `VXNT`

Instead of just a loose bag of tools, this system is anchored by a dedicated Lead Agent: [`agents/vxnt/SKILL.md`](file:///Users/visualnaut/sites/agents-model/agents/vxnt/SKILL.md) and governed by [`AGENTS.md`](file:///Users/visualnaut/sites/agents-model/AGENTS.md) and [`agents/CORE.md`](file:///Users/visualnaut/sites/agents-model/agents/CORE.md).

- **Role:** Principal Architect, Design Director, Chief Editor, and Build Engine.
- **Trigger:** `/vxnt`, `@vxnt`, or *"ask vxnt"*.
- **Authority:** Evaluates the problem holistically, dynamically summons the 4 divisions, and executes the multi-agent Gauntlet & Build Pipeline recipes.

```mermaid
flowchart TD
    User["User / Developer"] -->|"/vxnt <task, spec, or diff>"| VXNT[VXNT Lead Agent]
    
    subgraph Build Division
        GS["vxnt:grill-spec"]
        DM["vxnt:domain-model"]
        TG["vxnt:task-graph"]
        IMP["vxnt:implement"]
        HO["vxnt:handover"]
    end

    subgraph Code Division
        CR["vxnt:code-review"]
        ADV["vxnt:adversarial"]
        SMP["vxnt:simplifier"]
    end
    
    subgraph Design Division
        DC["vxnt:design-crit"]
        DS["vxnt:design-system"]
        EA["vxnt:empathy-a11y"]
    end
    
    subgraph Writing Division
        CE["vxnt:copy-editor"]
        SS["vxnt:steelman-skeptic"]
        NA["vxnt:narrative-architect"]
    end

    subgraph Cross-Division Governance
        TE["vxnt:token-economist"]
    end
    
    VXNT --> Build Division
    VXNT --> Code Division
    VXNT --> Design Division
    VXNT --> Writing Division
    VXNT --> Cross-Division Governance
```

---

## 🤖 The Division Subagents

For task-specific delegation in harnesses that support subagents (e.g. Antigravity, Cursor):

| Subagent ID | Focus Area | File Spec |
| :--- | :--- | :--- |
| **`vxnt-build`** | Requirements grilling, domain modeling, DAG task plans, dual-gate implementation, and handover | [`.agents/agents/vxnt-build.md`](file:///Users/visualnaut/sites/agents-model/.agents/agents/vxnt-build.md) |
| **`vxnt-code`** | Code architecture, red-team hardening, and simplification | [`.agents/agents/vxnt-code.md`](file:///Users/visualnaut/sites/agents-model/.agents/agents/vxnt-code.md) |
| **`vxnt-design`** | Visual hierarchy, WCAG 2.2 AA accessibility, and token enforcement | [`.agents/agents/vxnt-design.md`](file:///Users/visualnaut/sites/agents-model/.agents/agents/vxnt-design.md) |
| **`vxnt-writing`** | Ruthless copy editing, argument steelmanning, and narrative outlines | [`.agents/agents/vxnt-writing.md`](file:///Users/visualnaut/sites/agents-model/.agents/agents/vxnt-writing.md) |
| **`vxnt`** | Principal orchestrator coordinating all divisions | [`.agents/agents/vxnt.md`](file:///Users/visualnaut/sites/agents-model/.agents/agents/vxnt.md) |

---

## 🧭 The 15 Linked Specialist Skills (`vxnt:*`)

All skills follow the lean standard defined in [`agents/CORE.md`](file:///Users/visualnaut/sites/agents-model/agents/CORE.md) (~50% leaner, zero duplicate boilerplate):

| Division | Skill ID & Spec Link | Role & Specialty | Key Lens |
| :--- | :--- | :--- | :--- |
| **Build** | [`vxnt:grill-spec`](file:///Users/visualnaut/sites/agents-model/agents/build/grill-spec/SKILL.md) | Requirement Inquisitor | Zero-tolerance interrogation, non-goals, failure states, RFCs |
| **Build** | [`vxnt:domain-model`](file:///Users/visualnaut/sites/agents-model/agents/build/domain-model/SKILL.md) | Strategic DDD Modeler | Ubiquitous language, entities, value objects, invariants, states |
| **Build** | [`vxnt:task-graph`](file:///Users/visualnaut/sites/agents-model/agents/build/task-graph/SKILL.md) | Transient DAG Decomposer | Vertical slices, `blocked_by` graphs, LOCAL/REMOTE tracking |
| **Build** | [`vxnt:implement`](file:///Users/visualnaut/sites/agents-model/agents/build/implement/SKILL.md) | Incremental Craftsman | ACTIVE live surface gates vs AFK 3-strike circuit breaker |
| **Build** | [`vxnt:handover`](file:///Users/visualnaut/sites/agents-model/agents/build/handover/SKILL.md) | Continuity Governor & Archiver | `.tasks/HANDOVER.md` checkpoints, master doc archival & cleanup |
| **Code** | [`vxnt:code-review`](file:///Users/visualnaut/sites/agents-model/agents/code/code-review/SKILL.md) | Architecture & Quality Gatekeeper | Module depth, seams, cognitive load, error resilience |
| **Code** | [`vxnt:adversarial`](file:///Users/visualnaut/sites/agents-model/agents/code/adversarial/SKILL.md) | Doubt-Driven Red Teamer | Concurrency, race conditions, toxic inputs, failure cascades |
| **Code** | [`vxnt:simplifier`](file:///Users/visualnaut/sites/agents-model/agents/code/simplifier/SKILL.md) | YAGNI & Bloat Eliminator | Dead code, premature abstractions, native stdlib leverage |
| **Design** | [`vxnt:design-crit`](file:///Users/visualnaut/sites/agents-model/agents/design/design-crit/SKILL.md) | Visual & Interaction Critic | Visual hierarchy, 4px/8px rhythm, typography, affordances |
| **Design** | [`vxnt:design-system`](file:///Users/visualnaut/sites/agents-model/agents/design/design-system/SKILL.md) | Token & Component Hygiene Enforcer | Zero hardcoded values, component reusability, semantic HTML |
| **Design** | [`vxnt:empathy-a11y`](file:///Users/visualnaut/sites/agents-model/agents/design/empathy-a11y/SKILL.md) | Cognitive Strain & A11y Auditor | WCAG 2.2 AA/AAA, keyboard focus, screen readers, edge states |
| **Writing** | [`vxnt:copy-editor`](file:///Users/visualnaut/sites/agents-model/agents/writing/copy-editor/SKILL.md) | Ruthless Slop-Cutter & Stylist | Purges AI clichés, active verbs, dynamic cadence, 30%+ cut |
| **Writing** | [`vxnt:steelman-skeptic`](file:///Users/visualnaut/sites/agents-model/agents/writing/steelman-skeptic/SKILL.md) | Thesis Challenger & Logic Auditor | Exposes unstated assumptions, attacks weak logic, steelmans |
| **Writing** | [`vxnt:narrative-architect`](file:///Users/visualnaut/sites/agents-model/agents/writing/narrative-architect/SKILL.md) | Information Architect & Pacing Strategist | Outlines, cognitive progression (familiar -> novel), payoffs |
| **Efficiency**| [`vxnt:token-economist`](file:///Users/visualnaut/sites/agents-model/agents/efficiency/token-economist/SKILL.md) | Cross-Division Token Governor | Prunes context noise, enforces terse diffs, aligns prompt cache |

---

## ⚡ Dual-Mode Execution

Every agent and skill supports two operational modes:

### 1. Fast Audit / Active Mode (Default)
Feed an artifact (diff, component code, PRD, or task). It immediately returns:
- **Executive Verdict** (`PASS`, `NEEDS_WORK`, or `REJECT`)
- **Quality Scorecard Matrix** (1-5 ratings across domain dimensions)
- **Ranked Findings** (`BLOCKER`, `WARNING`, `NIT/POLISH`) with problem analysis and **concrete drop-in replacement diffs**
- **Verification Runbook & Surface:** Concrete CLI command, URL, or curl snippet for live verification.

### 2. Workshop / AFK Mode
- **Workshop Mode:** Triggered during exploratory phases (e.g., *"Spar with me on this architecture"* or *"Let's workshop this opening paragraph"*). The agent acts as a dialectic sparring partner.
- **AFK Mode (Autonomous Execution):** Executes DAG tasks autonomously with deterministic test verification and a strict 3-attempt circuit breaker before halting.

---

## 🛡️ Multi-Agent Recipes & Pipelines

Full recipes and single-prompt templates live in [`recipes/`](file:///Users/visualnaut/sites/agents-model/recipes/):

| Recipe | Sequence & Recipe Link | Best For | Quick Trigger Example |
| :--- | :--- | :--- | :--- |
| **Build Pipeline** | [`recipes/build-pipeline.md`](file:///Users/visualnaut/sites/agents-model/recipes/build-pipeline.md)<br>`vxnt:grill-spec` ➔ `vxnt:domain-model` ➔ `vxnt:task-graph` ➔ `vxnt:implement` ➔ `vxnt:handover` | Product ideas, new features, and end-to-end implementations | `/vxnt run build pipeline on feature-idea`<br>*(or ask `vxnt-build`)* |
| **Code Gauntlet** | [`recipes/code-gauntlet.md`](file:///Users/visualnaut/sites/agents-model/recipes/code-gauntlet.md)<br>`vxnt:code-review` ➔ `vxnt:adversarial` ➔ `vxnt:simplifier` | Pull requests, critical backend modules, refactors | `/vxnt run code gauntlet on src/auth.ts`<br>*(or ask `vxnt-code`)* |
| **Design Gauntlet** | [`recipes/design-gauntlet.md`](file:///Users/visualnaut/sites/agents-model/recipes/design-gauntlet.md)<br>`vxnt:design-crit` ➔ `vxnt:empathy-a11y` ➔ `vxnt:design-system` | New UI components, modals, responsive screens | `/vxnt run design gauntlet on components/Modal.tsx`<br>*(or ask `vxnt-design`)* |
| **Writing Gauntlet** | [`recipes/writing-gauntlet.md`](file:///Users/visualnaut/sites/agents-model/recipes/writing-gauntlet.md)<br>`vxnt:narrative-architect` ➔ `vxnt:copy-editor` ➔ `vxnt:steelman-skeptic` | PRDs, RFCs, blog posts, strategic pitches | `/vxnt run writing gauntlet on docs/rfc.md`<br>*(or ask `vxnt-writing`)* |

### How to Run Recipes:
1. **Interactive Lead Agent:** Mention `/vxnt run the <build|code|design|writing> pipeline on <target>`. VXNT will orchestrate the passes and synthesize findings.
2. **Dedicated Division Subagent:** Tell `vxnt-build`, `vxnt-code`, `vxnt-design`, or `vxnt-writing` to run the recipe.
3. **Step-by-Step Manual Execution:** Run the individual slash commands sequentially.
4. **Single-Prompt Web LLMs:** Copy the pre-built `Automated Gauntlet / Pipeline Prompt` from the bottom of any recipe file into ChatGPT, Claude.ai, or Gemini Studio.

---

## 🚀 Cross-Harness Installation

Use the included zero-dependency installer script to link or export agents:

```bash
# Interactive setup
./scripts/install.sh

# Target specific harness:
./scripts/install.sh --target antigravity   # Skills to ~/.gemini/config/skills/, subagents to ~/.gemini/config/agents/
./scripts/install.sh --target claude        # Skills to ~/.claude/skills/ (subagents governed by AGENTS.md)
./scripts/install.sh --target cursor        # Generates .cursor/rules/ (subagent personas @vxnt-* & skills)
./scripts/install.sh --target bundle        # Builds dist/all-agents-bundle.md
./scripts/install.sh --target all           # Installs across all supported harnesses

# Uninstall symlinks:
./scripts/install.sh --target antigravity --uninstall
```

### Using with Web LLMs (ChatGPT, Claude.ai, Gemini Studio, Ollama)
Run `./scripts/export-bundle.sh` to generate [`dist/all-agents-bundle.md`](file:///Users/visualnaut/sites/agents-model/dist/all-agents-bundle.md). Copy and paste any agent's specification directly into your model's system prompt or chat session.

---

## 📄 License
MIT
