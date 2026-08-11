#!/usr/bin/env python3
"""
CyberGuard - Intrusion Detection System (IDS)

Lee el registro de eventos de seguridad de Windows (Security Log), detecta
actividad sospechosa y envía los eventos normalizados al backend de CyberGuard.

Detectores incluidos:
  - Evento 4625 : intentos de inicio de sesión fallidos
  - Evento 4720 : creación de cuentas de usuario
  - Evento 4728 : adición de un miembro al grupo Administradores
  - Evento 4624 tipo 10 : inicio de sesión remoto (RDP)

Uso:
    python ids.py                      # monitoreo continuo (una pasada por defecto)
    python ids.py --loop --interval 10
    python ids.py --simulate           # genera eventos de prueba (RF-085)
    python ids.py --since "2026-01-01T00:00:00"

Solo debe ejecutarse dentro del entorno controlado y autorizado.
"""

import argparse
import json
import os
import subprocess
import sys
import time
import urllib.request
from datetime import datetime, timedelta, timezone

CURSOR_FILE = os.path.join(os.path.dirname(__file__), ".ids_cursor")

DEFAULT_BACKEND = os.environ.get("CYBERGUARD_API", "http://localhost:3000")
DEFAULT_API_KEY = os.environ.get("CYBERGUARD_API_KEY", "cyberguard_internal_key")

# EventID -> tipo de evento normalizado
EVENT_TYPES = {
    4625: {"type": "LOGIN_FAILED", "severity": "MEDIUM", "title": "Intento de inicio de sesión fallido"},
    4720: {"type": "ACCOUNT_CREATED", "severity": "MEDIUM", "title": "Cuenta de usuario creada"},
    4728: {"type": "ADMIN_GROUP_CHANGED", "severity": "HIGH", "title": "Miembro añadido al grupo Administradores"},
    4624: {"type": "REMOTE_LOGON", "severity": "LOW", "title": "Inicio de sesión remoto"},
}


def read_cursor() -> str:
    try:
        with open(CURSOR_FILE, "r", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        return ""


def write_cursor(value: str) -> None:
    with open(CURSOR_FILE, "w", encoding="utf-8") as f:
        f.write(value)


def query_security_events(since: str | None) -> list[dict]:
    """Consulta el Security Log usando wevtutil."""
    query = ["wevtutil", "qe", "Security", "/rd:true", "/c:100"]
    if since:
        query += ["/q:Queries/QueryList/Query[EventData[Data[@Name='EventRecordID'] and Data>'0']]"]

    try:
        proc = subprocess.run(
            ["wevtutil", "qe", "Security", "/rd:true", "/c:200", "/f:text"],
            capture_output=True, text=True, timeout=30, creationflags=0x08000000,
        )
        if proc.returncode != 0:
            print(f"[ids] Error wevtutil: {proc.stderr.strip()}", file=sys.stderr)
            return []
    except (subprocess.SubprocessError, FileNotFoundError):
        print("[ids] No se pudo acceder al Security Log (requiere permisos elevados)", file=sys.stderr)
        return []

    events = []
    current: dict = {}
    in_event = False
    for line in proc.stdout.splitlines():
        line = line.strip()
        if line.startswith("Event["):
            if current:
                events.append(current)
            current = {"EventID": None, "TimeCreated": None, "SubjectUserName": None,
                       "TargetUserName": None, "LogonType": None, "IpAddress": None}
            in_event = True
        elif in_event:
            if line.startswith("EventID:"):
                try:
                    current["EventID"] = int(line.split(":", 1)[1].strip())
                except ValueError:
                    current["EventID"] = None
            elif line.startswith("TimeCreated:") or line.startswith("TimeCreated("):
                current["TimeCreated"] = line.split(":", 1)[1].strip()
            elif line.startswith("SubjectUserName:"):
                current["SubjectUserName"] = line.split(":", 1)[1].strip()
            elif line.startswith("TargetUserName:"):
                current["TargetUserName"] = line.split(":", 1)[1].strip()
            elif line.startswith("LogonType:"):
                current["LogonType"] = line.split(":", 1)[1].strip()
            elif line.startswith("IpAddress:"):
                current["IpAddress"] = line.split(":", 1)[1].strip()

    if current:
        events.append(current)

    return [e for e in events if e.get("EventID")]


def normalize(ev: dict) -> dict | None:
    eid = ev.get("EventID")
    if eid not in EVENT_TYPES:
        return None
    meta = EVENT_TYPES[eid]

    source_ip = ev.get("IpAddress")
    if source_ip in ("-", "::1", ""):
        source_ip = None

    # RDP (LogonType 10) para evento 4624
    if eid == 4624 and ev.get("LogonType") != "10":
        return None

    return {
        "source": "IDS",
        "sourceLabel": "ids-windows",
        "type": meta["type"],
        "severity": meta["severity"],
        "title": meta["title"],
        "description": f"Evento {eid} detectado por el IDS en Windows",
        "sourceIp": source_ip,
        "destinationIp": "127.0.0.1",
        "raw": ev,
    }


def send_event(payload: dict, backend: str, api_key: str) -> bool:
    req = urllib.request.Request(
        f"{backend}/api/events/ingest",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "X-Api-Key": api_key},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            print(f"[ids] Evento enviado: {body.get('id')} ({payload['type']})")
            return True
    except urllib.error.HTTPError as e:
        print(f"[ids] Error {e.code} enviando evento: {e.read().decode('utf-8')}", file=sys.stderr)
        return False
    except OSError as e:
        print(f"[ids] No se pudo contactar el backend: {e}", file=sys.stderr)
        return False


def simulate_events(backend: str, api_key: str, count: int = 5) -> None:
    """Genera eventos de prueba controlados (RF-085)."""
    samples = [
        {"source": "IDS", "sourceLabel": "ids-windows", "type": "LOGIN_FAILED",
         "severity": "MEDIUM", "title": "Intento de inicio de sesión fallido",
         "sourceIp": "192.168.1.66", "destinationIp": "127.0.0.1", "port": 445},
        {"source": "IDS", "sourceLabel": "ids-windows", "type": "ADMIN_GROUP_CHANGED",
         "severity": "HIGH", "title": "Miembro añadido al grupo Administradores",
         "sourceIp": "192.168.1.66", "destinationIp": "127.0.0.1"},
        {"source": "IDS", "sourceLabel": "ids-windows", "type": "SCAN_DETECTED",
         "severity": "MEDIUM", "title": "Posible escaneo de puertos detectado",
         "sourceIp": "10.0.0.44", "destinationIp": "127.0.0.1"},
        {"source": "IDS", "sourceLabel": "ids-windows", "type": "ANOMALY_DETECTED",
         "severity": "HIGH", "title": "Anomalía de red detectada",
         "sourceIp": "10.0.0.88", "destinationIp": "127.0.0.1", "port": 8080},
    ]
    for i in range(count):
        send_event(samples[i % len(samples)], backend, api_key)
        time.sleep(0.3)


def main() -> None:
    parser = argparse.ArgumentParser(description="CyberGuard IDS")
    parser.add_argument("--loop", action="store_true", help="Monitoreo continuo")
    parser.add_argument("--interval", type=int, default=10, help="Segundos entre pasadas")
    parser.add_argument("--simulate", action="store_true", help="Generar eventos de prueba")
    parser.add_argument("--count", type=int, default=5, help="Eventos de prueba")
    parser.add_argument("--backend", default=DEFAULT_BACKEND)
    parser.add_argument("--api-key", default=DEFAULT_API_KEY)
    args = parser.parse_args()

    if args.simulate:
        print("[ids] Generando eventos de prueba (laboratorio controlado)")
        simulate_events(args.backend, args.api_key, args.count)
        return

    since = read_cursor() or (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()

    if args.loop:
        while True:
            detected = query_security_events(since)
            for raw in detected:
                normalized = normalize(raw)
                if normalized:
                    send_event(normalized, args.backend, args.api_key)
            since = datetime.now(timezone.utc).isoformat()
            write_cursor(since)
            print(f"[ids] Siguiente pasada en {args.interval}s (Ctrl+C para detener)")
            time.sleep(args.interval)
    else:
        detected = query_security_events(since)
        sent = 0
        for raw in detected:
            normalized = normalize(raw)
            if normalized and send_event(normalized, args.backend, args.api_key):
                sent += 1
        print(f"[ids] {sent} eventos enviados desde {since}")
        write_cursor(datetime.now(timezone.utc).isoformat())


if __name__ == "__main__":
    main()
