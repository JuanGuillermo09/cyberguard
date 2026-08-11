#!/usr/bin/env python3
"""
CyberGuard - Laboratorio: servidor HTTP de prueba

Servidor HTTP controlado para validar el scanner (banner/versión) y generar
eventos de seguridad. Solo escucha en 127.0.0.1.

Uso:
    python http_server.py [--port 8080]
"""

import argparse
import json
import socket
import sys
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

VERSION = "CyberGuard Lab Server/1.2.3"


class LabHandler(BaseHTTPRequestHandler):
    server_version = VERSION
    sys_version = ""

    def log_message(self, fmt, *args):
        print(f"[http-lab] {datetime.now().isoformat()} {self.client_address[0]} {fmt % args}")

    def _send(self, code: int, body: str, ctype: str = "application/json"):
        data = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", f"{ctype}; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path in ("/", "/health"):
            self._send(200, json.dumps({"status": "ok", "service": "cyberguard-lab-http", "version": VERSION}))
        elif self.path == "/metrics":
            self._send(200, json.dumps({"requests": 0, "errors": 0, "uptime": "unknown"}))
        elif self.path == "/admin":
            self._send(403, json.dumps({"error": "Acceso restringido"}))
        else:
            self._send(404, json.dumps({"error": "not found"}))

    def do_POST(self):
        if self.path == "/api/v1/scan":
            self._send(202, json.dumps({"accepted": True, "note": "Petición registrada para auditoría"}))
        elif self.path == "/api/v1/upload":
            self._send(415, json.dumps({"error": "Tipo de contenido no soportado"}))
        else:
            self._send(400, json.dumps({"error": "bad request"}))


def main() -> None:
    parser = argparse.ArgumentParser(description="CyberGuard Lab HTTP test server")
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument("--host", default="127.0.0.1")
    args = parser.parse_args()

    try:
        server = ThreadingHTTPServer((args.host, args.port), LabHandler)
        print(f"[http-lab] Escuchando en http://{args.host}:{args.port} (Ctrl+C para detener)")
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[http-lab] Detenido")
        server.shutdown()
        sys.exit(0)


if __name__ == "__main__":
    main()
