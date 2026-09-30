#!/usr/bin/env bash
set -euo pipefail

# Export all agents and recipes into a single consolidated Markdown file
# for easy copy-pasting into any web LLM (ChatGPT, Claude.ai, Gemini Studio, Ollama).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
DIST_DIR="${ROOT_DIR}/dist"
OUTPUT_FILE="${DIST_DIR}/all-agents-bundle.md"

mkdir -p "${DIST_DIR}"

cat << 'EOF' > "${OUTPUT_FILE}"
# Universal Workflow Agents: Consolidated Prompt Library
> Model-Agnostic & Harness-Agnostic Agent Specifications for Code, Design, and Writing.
> Copy and paste the relevant agent section into your LLM's system prompt or chat session.

---

EOF

echo "==> Bundling dedicated agent and skills into ${OUTPUT_FILE}..."

if [ -f "${ROOT_DIR}/agents/vxnt/SKILL.md" ]; then
  echo "  -> Adding dedicated agent: vxnt..."
  echo "## The Dedicated Lead Agent: VXNT" >> "${OUTPUT_FILE}"
  echo "" >> "${OUTPUT_FILE}"
  cat "${ROOT_DIR}/agents/vxnt/SKILL.md" >> "${OUTPUT_FILE}"
  echo "" >> "${OUTPUT_FILE}"
  echo "---" >> "${OUTPUT_FILE}"
  echo "" >> "${OUTPUT_FILE}"
fi

if [ -d "${ROOT_DIR}/.agents/agents" ]; then
  echo "  -> Adding division subagents..."
  echo "## The Division Subagents" >> "${OUTPUT_FILE}"
  echo "" >> "${OUTPUT_FILE}"
  for subagent_file in "${ROOT_DIR}/.agents/agents"/vxnt-*.md; do
    if [ -f "${subagent_file}" ]; then
      subagent_name="$(basename "${subagent_file}" .md)"
      echo "     - ${subagent_name}..."
      cat "${subagent_file}" >> "${OUTPUT_FILE}"
      echo "" >> "${OUTPUT_FILE}"
      echo "---" >> "${OUTPUT_FILE}"
      echo "" >> "${OUTPUT_FILE}"
    fi
  done
fi

if [ -f "${ROOT_DIR}/agents/CORE.md" ]; then
  echo "  -> Adding Core Protocol: CORE.md..."
  echo "## Universal Core Protocol & Output Schema" >> "${OUTPUT_FILE}"
  echo "" >> "${OUTPUT_FILE}"
  cat "${ROOT_DIR}/agents/CORE.md" >> "${OUTPUT_FILE}"
  echo "" >> "${OUTPUT_FILE}"
  echo "---" >> "${OUTPUT_FILE}"
  echo "" >> "${OUTPUT_FILE}"
fi

for domain in code design writing efficiency; do
  domain_upper=$(echo "${domain}" | tr '[:lower:]' '[:upper:]')
  echo "## Domain: ${domain_upper}" >> "${OUTPUT_FILE}"
  echo "" >> "${OUTPUT_FILE}"

  for agent_dir in "${ROOT_DIR}/agents/${domain}"/*; do
    if [ -d "${agent_dir}" ] && [ -f "${agent_dir}/SKILL.md" ]; then
      agent_name="$(basename "${agent_dir}")"
      echo "  -> Adding ${agent_name}..."
      echo "---" >> "${OUTPUT_FILE}"
      echo "" >> "${OUTPUT_FILE}"
      cat "${agent_dir}/SKILL.md" >> "${OUTPUT_FILE}"
      echo "" >> "${OUTPUT_FILE}"
      echo "" >> "${OUTPUT_FILE}"
    fi
  done
done

echo "==> Bundling recipes..."
cat << 'EOF' >> "${OUTPUT_FILE}"
---

# Multi-Agent Gauntlet Recipes

EOF

for recipe in "${ROOT_DIR}/recipes"/*.md; do
  if [ -f "${recipe}" ]; then
    echo "  -> Adding $(basename "${recipe}")..."
    echo "---" >> "${OUTPUT_FILE}"
    echo "" >> "${OUTPUT_FILE}"
    cat "${recipe}" >> "${OUTPUT_FILE}"
    echo "" >> "${OUTPUT_FILE}"
    echo "" >> "${OUTPUT_FILE}"
  fi
done

echo "==> Successfully created ${OUTPUT_FILE} ($(wc -l < "${OUTPUT_FILE}" | tr -d ' ') lines)"
