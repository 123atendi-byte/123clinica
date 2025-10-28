#!/bin/sh
# Entrypoint simples: delega para o processo principal (nginx)
# As chamadas � API devem usar o caminho relativo /api,
# que � proxyado para o backend pelo nginx.conf.

exec "$@"
