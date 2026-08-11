#!/usr/bin/env python3
"""
CyberGuard - Laboratorio: servicio de eco TCP

Servicio TCP simple en 127.0.0.1 que responde con un banner identificable y
devuelve los datos recibidos. Sirve para validar la detección de servicios.

Uso:
    python echo_service.py [--port 9999]
"""

import argparse
import socket
import sys

BANNER = b"CYBERGUARD-LAB-ECHO v1.0\r\n"


def handle(conn: socket.socket) -> None:
    try:
        conn.sendall(BANNER)
        while True:
            data = conn.recv(1024)
            if not data:
                break
            conn.sendall(data)
    except OSError:
        pass
    finally:
        conn.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="CyberGuard Lab TCP echo test service")
    parser.add_argument("--port", type=int, default=9999)
    parser.add_argument("--host", default="127.0.0.1")
    args = parser.parse_args()

    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((args.host, args.port))
    server.listen(5)
    print(f"[echo-lab] Escuchando en {args.host}:{args.port} (Ctrl+C para detener)")

    try:
        while True:
            conn, addr = server.accept()
            print(f"[echo-lab] Conexión de {addr[0]}:{addr[1]}")
            handle(conn)
    except KeyboardInterrupt:
        print("\n[echo-lab] Detenido")
        server.close()
        sys.exit(0)


if __name__ == "__main__":
    main()
