#!/usr/bin/env bash
set -euo pipefail

# Universal Workflow Agents: Cross-Harness Installer & Symlinker
# Installs agents into Antigravity, Claude Code, Cursor, or generates prompt bundles.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

USE_SYMLINK=true
UNINSTALL=false
TARGET=""

ANTIGRAV_DIR="${HOME}/.gemini/config/skills"
CLAUDE_DIR="${HOME}/.claude/skills"
CURSOR_DIR="${PWD}/.cursor/rules"

usage() {
  cat << EOF
Usage: $(basename "$0") [OPTIONS]

Options:
  -t, --target <harness>    Target harness to install agents to:
                            antigravity  (Installs into ~/.gemini/config/skills)
                            claude       (Installs into ~/.claude/skills)
                            cursor       (Installs into ./.cursor/rules in current repo)
                            bundle       (Builds dist/all-agents-bundle.md)
                            all          (Installs to all detected harnesses)
  --copy                    Copy files instead of symlinking (default: symlink)
  --uninstall               Remove installed agent symlinks/files from target
  -h, --help                Show this help message

Examples:
  $(basename "$0") --target antigravity
  $(basename "$0") --target claude
  $(basename "$0") --target all
  $(basename "$0") --target antigravity --uninstall
EOF
}

# Parse flags
while [[ $# -gt 0 ]]; do
  case "$1" in
    -t|--target)
      TARGET="$2"
      shift 2
      ;;
    --copy)
      USE_SYMLINK=false
      shift
      ;;
    --uninstall)
      UNINSTALL=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
done

link_or_copy() {
  local src="$1"
  local dest="$2"

  if [ "${UNINSTALL}" = true ]; then
    if [ -L "${dest}" ] || [ -f "${dest}" ] || [ -d "${dest}" ]; then
      echo "  [x] Removing ${dest}"
      rm -rf "${dest}"
    fi
    return 0
  fi

  mkdir -p "$(dirname "${dest}")"

  if [ -L "${dest}" ] || [ -e "${dest}" ]; then
    rm -rf "${dest}"
  fi

  if [ "${USE_SYMLINK}" = true ]; then
    ln -s "${src}" "${dest}"
    echo "  [✓] Symlinked: ${dest} -> ${src}"
  else
    cp -R "${src}" "${dest}"
    echo "  [✓] Copied: ${dest}"
  fi
}

install_antigravity() {
  echo "==> Configuring Antigravity (~/.gemini/config/skills)..."
  mkdir -p "${ANTIGRAV_DIR}"

  # Clean up legacy unprefixed symlinks if present
  for legacy in code-review adversarial simplifier design-crit design-system empathy-a11y copy-editor steelman-skeptic narrative-architect; do
    if [ -L "${ANTIGRAV_DIR}/${legacy}" ]; then
      rm -f "${ANTIGRAV_DIR}/${legacy}"
    fi
  done

  # Install dedicated VXNT Lead Agent
  if [ -d "${ROOT_DIR}/agents/vxnt" ]; then
    echo "  -> Configuring dedicated agent: vxnt..."
    link_or_copy "${ROOT_DIR}/agents/vxnt" "${ANTIGRAV_DIR}/vxnt"
  fi

  # Install prefixed skills
  for domain in code design writing; do
    for agent_dir in "${ROOT_DIR}/agents/${domain}"/*; do
      if [ -d "${agent_dir}" ] && [ -f "${agent_dir}/SKILL.md" ]; then
        agent_name="$(basename "${agent_dir}")"
        link_or_copy "${agent_dir}" "${ANTIGRAV_DIR}/vxnt:${agent_name}"
      fi
    done
  done

  # Install Antigravity Subagents (~/.gemini/config/agents/)
  local antigrav_agents_dir="${HOME}/.gemini/config/agents"
  mkdir -p "${antigrav_agents_dir}"
  echo "==> Configuring Antigravity Subagents (~/.gemini/config/agents)..."
  if [ -d "${ROOT_DIR}/.agents/agents" ]; then
    for subagent_file in "${ROOT_DIR}/.agents/agents"/*.md; do
      if [ -f "${subagent_file}" ]; then
        local subagent_name="$(basename "${subagent_file}")"
        link_or_copy "${subagent_file}" "${antigrav_agents_dir}/${subagent_name}"
      fi
    done
  fi
}

install_claude() {
  echo "==> Configuring Claude Code (~/.claude/skills)..."
  mkdir -p "${CLAUDE_DIR}"

  # Clean up legacy unprefixed symlinks if present
  for legacy in code-review adversarial simplifier design-crit design-system empathy-a11y copy-editor steelman-skeptic narrative-architect; do
    if [ -L "${CLAUDE_DIR}/${legacy}" ]; then
      rm -f "${CLAUDE_DIR}/${legacy}"
    fi
  done

  # Install dedicated VXNT Lead Agent
  if [ -d "${ROOT_DIR}/agents/vxnt" ]; then
    echo "  -> Configuring dedicated agent: vxnt..."
    link_or_copy "${ROOT_DIR}/agents/vxnt" "${CLAUDE_DIR}/vxnt"
  fi

  # Install prefixed skills
  for domain in code design writing; do
    for agent_dir in "${ROOT_DIR}/agents/${domain}"/*; do
      if [ -d "${agent_dir}" ] && [ -f "${agent_dir}/SKILL.md" ]; then
        agent_name="$(basename "${agent_dir}")"
        link_or_copy "${agent_dir}" "${CLAUDE_DIR}/vxnt:${agent_name}"
      fi
    done
  done
}

install_cursor() {
  echo "==> Configuring Cursor rules (${CURSOR_DIR})..."
  mkdir -p "${CURSOR_DIR}"

  # Clean up legacy rules
  for legacy in code-review adversarial simplifier design-crit design-system empathy-a11y copy-editor steelman-skeptic narrative-architect; do
    rm -f "${CURSOR_DIR}/${legacy}.mdc"
  done

  # Install dedicated agent rule
  if [ -d "${ROOT_DIR}/agents/vxnt" ] && [ -f "${ROOT_DIR}/agents/vxnt/SKILL.md" ]; then
    local dest_rule="${CURSOR_DIR}/vxnt.mdc"
    if [ "${UNINSTALL}" = true ]; then
      rm -f "${dest_rule}"
    else
      cat << EOF > "${dest_rule}"
---
description: "VXNT Dedicated Lead Agent"
globs: *
alwaysApply: true
---
EOF
      cat "${ROOT_DIR}/agents/vxnt/SKILL.md" >> "${dest_rule}"
      echo "  [✓] Generated: ${dest_rule}"
    fi
  fi

  # Install prefixed skill rules
  for domain in code design writing; do
    for agent_dir in "${ROOT_DIR}/agents/${domain}"/*; do
      if [ -d "${agent_dir}" ] && [ -f "${agent_dir}/SKILL.md" ]; then
        agent_name="$(basename "${agent_dir}")"
        dest_rule="${CURSOR_DIR}/vxnt:${agent_name}.mdc"
        if [ "${UNINSTALL}" = true ]; then
          rm -f "${dest_rule}"
          echo "  [x] Removed ${dest_rule}"
        else
          cat << EOF > "${dest_rule}"
---
description: "VXNT Skill: vxnt:${agent_name}"
globs: *
alwaysApply: false
---
EOF
          cat "${agent_dir}/SKILL.md" >> "${dest_rule}"
          echo "  [✓] Generated: ${dest_rule}"
        fi
      fi
    done
  done
}

install_bundle() {
  "${SCRIPT_DIR}/export-bundle.sh"
}

# If no target specified, show interactive selector
if [ -z "${TARGET}" ]; then
  echo "Select target harness to install:"
  echo "  1) Antigravity (~/.gemini/config/skills)"
  echo "  2) Claude Code (~/.claude/skills)"
  echo "  3) Cursor (.cursor/rules in current repo)"
  echo "  4) All detected harnesses"
  echo "  5) Generate standalone prompt bundle (dist/all-agents-bundle.md)"
  echo "  6) Exit"
  read -r -p "Enter choice [1-6]: " choice
  case "$choice" in
    1) TARGET="antigravity" ;;
    2) TARGET="claude" ;;
    3) TARGET="cursor" ;;
    4) TARGET="all" ;;
    5) TARGET="bundle" ;;
    *) echo "Exiting."; exit 0 ;;
  esac
fi

case "${TARGET}" in
  antigravity)
    install_antigravity
    ;;
  claude)
    install_claude
    ;;
  cursor)
    install_cursor
    ;;
  bundle)
    install_bundle
    ;;
  all)
    install_antigravity
    install_claude
    install_cursor
    install_bundle
    ;;
  *)
    echo "Unknown target: ${TARGET}"
    usage
    exit 1
    ;;
esac

echo "==> Done!"
