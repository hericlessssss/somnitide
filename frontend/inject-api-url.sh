#!/bin/sh
# Este script injeta a variável de ambiente API_URL no arquivo de configuração do Angular.
# É utilizado durante o build no Cloudflare Pages.

if [ -z "$API_URL" ]; then
  echo "ERRO: A variável de ambiente API_URL não está definida."
  exit 1
fi

echo "Injetando API_URL: $API_URL"
sed -i "s|API_URL_PLACEHOLDER|$API_URL|g" src/environments/environment.ts

if [ $? -eq 0 ]; then
  echo "Sucesso: API_URL injetada com sucesso."
else
  echo "ERRO: Falha ao injetar API_URL."
  exit 1
fi
