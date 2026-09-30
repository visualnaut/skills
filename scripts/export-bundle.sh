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

echo "==> Bundling agents into ${OUTPUT_FILE}..."

for domain in code design writing; do
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
