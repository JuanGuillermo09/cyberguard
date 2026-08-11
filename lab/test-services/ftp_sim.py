#!/usr/bin/env python3
"""
CyberGuard - Laboratorio: servicio FTP simulado

Servidor FTP de prueba que responde con un banner identificable y registra
intentos de autenticación. Sirve para validar la detección de servicios,
versiones y vulnerabilidades conocidas en el scanner.

Uso:
    python ftp_sim.py [--port 2121]
"""

import argparse
import socket
import sys

BANNER = b"220 CyberGuard-FTP-SIM v2.1.0 ready\r\n"


def handle(conn: socket.socket) -> None:
    try:
        conn.sendall(BANNER)
        while True:
            data = conn.recv(1024)
            if not data:
                break
            cmd = data.decode("utf-8", errors="replace").strip().split(" ")[0].upper()
            if cmd == "USER":
                conn.sendall(b"331 User name okay, need password\r\n")
            elif cmd == "PASS":
                conn.sendall(b"530 Login incorrect\r\n")
            elif cmd == "QUIT":
                conn.sendall(b"221 Goodbye\r\n")
                break
            else:
                conn.sendall(b"500 Command not recognized\r\n")
    except OSError:
        pass
    finally:
        conn.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="CyberGuard Lab FTP simulation service")
    parser.add_argument("--port", type=int, default=2121)
    parser.add_argument("--host", default="127.0.0.1")
    args = parser.parse_args()

    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((args.host, args.port))
    server.listen(5)
    print(f"[ftp-lab] Escuchando en {args.host}:{args.port} (Ctrl+C para detener)")

    try:
        while True:
            conn, addr = server.accept()
            print(f"[ftp-lab] Conexión de {addr[0]}:{addr[1]}")
            handle(conn)
    except KeyboardInterrupt:
        print("\n[ftp-lab] Detenido")
        server.close()
        sys.exit(0)


if __name__ == "__main__":
    main()
