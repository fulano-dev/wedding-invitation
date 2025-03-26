#!/bin/bash

# Checa a mensagem do último commit
LAST_COMMIT_MESSAGE=$(git log -1 --pretty=%B)

# Se a mensagem NÃO contém [deploy], cancela o deploy
if [[ "$LAST_COMMIT_MESSAGE" != *"[deploy]"* ]]; then
  echo "🚫 Commit não autorizado para deploy."
  exit 1
else
  echo "✅ Commit autorizado para deploy."
  exit 0
fi