#!/usr/bin/env python3
"""
CyberGuard - SIEM Event Collector / Engine

Recolecta eventos de fuentes locales (archivos JSON en lab/test-data, servicios
de prueba) y los envía normalizados al backend de CyberGuard.

El backend ejecuta la correlación y generación de alertas; este recolector
permite alimentar el pipeline desde el entorno controlado.

Uso:
    python collector.py                    # envía eventos de ejemplo
    python collector.py --loop --interval 15
    python collector.py --file lab/test-data/event_samples.json

Solo debe utilizarse dentro del laboratorio controlado y autorizado.
"""

import argparse
import json
import os
import random
import sys
import time
import urllib.request

BASE_DIR = os.path.dirname(__file__)
PROJECT_ROOT = os.path.normpath(os.path.join(BASE_DIR, "..", ".."))

DEFAULT_BACKEND = os.environ.get("CYBERGUARD_API", "http://localhost:3000")
DEFAULT_API_KEY = os.environ.get("CYBERGUARD_API_KEY", "cyberguard_internal_key")

# Patrones de eventos realistas para el laboratorio (RF-085)
EVENT_TEMPLATES = [
    {
        "source": "APPLICATION", "sourceLabel": "test-api",
        "type": "HTTP_ANOMALY", "severity": "MEDIUM",
        "title": "Petición HTTP anómala", "description": "Patrón de solicitud inusual detectado en API de prueba",
        "sourceIp": "192.168.1.101", "destinationIp": "127.0.0.1", "port": 8080, "protocol": "tcp",
    },
    {
        "source": "SYSTEM", "sourceLabel": "windows-lab",
        "type": "SERVICE_STOPPED", "severity": "LOW",
        "title": "Servicio detenido", "description": "Un servicio del laboratorio se detuvo inesperadamente",
        "destinationIp": "127.0.0.1",
    },
    {
        "source": "SIEM", "sourceLabel": "event-engine",
        "type": "CORRELATION_HINT", "severity": "MEDIUM",
        "title": "Patrón de eventos sospechoso", "description": "El motor de eventos detectó actividad repetitiva",
        "sourceIp": "192.168.1.45", "destinationIp": "127.0.0.1",
    },
    {
        "source": "IDS", "sourceLabel": "ids-windows",
        "type": "SCAN_DETECTED", "severity": "MEDIUM",
        "title": "Posible escaneo de puertos", "description": "Múltiples conexiones a puertos consecutivos",
        "sourceIp": "10.0.0.77", "destinationIp": "127.0.0.1",
    },
    {
        "source": "APPLICATION", "sourceLabel": "test-api",
        "type": "AUTH_ABUSE", "severity": "HIGH",
        "title": "Abuso de autenticación", "description": "Intentos de acceso reiterados a endpoint protegido",
        "sourceIp": "10.0.0.99", "destinationIp": "127.0.0.1", "port": 8080, "protocol": "tcp",
    },
    {
        "source": "SYSTEM", "sourceLabel": "windows-lab",
        "type": "USER_ESCALATION", "severity": "CRITICAL",
        "title": "Posible escalada de privilegios", "description": "Cambio de privilegios de cuenta en el laboratorio",
        "sourceIp": "192.168.1.20", "destinationIp": "127.0.0.1",
    },
]


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
            print(f"[siem] Evento {payload['type']} -> {body.get('id')}")
            return True
    except urllib.error.HTTPError as e:
        print(f"[siem] Error {e.code}: {e.read().decode('utf-8')}", file=sys.stderr)
        return False
    except OSError as e:
        print(f"[siem] Backend no disponible: {e}", file=sys.stderr)
        return False


def random_event() -> dict:
    template = random.choice(EVENT_TEMPLATES)
    event = dict(template)
    event["sourceIp"] = f"192.168.1.{random.randint(2, 254)}"
    return event


def events_from_file(path: str) -> list[dict]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, dict):
        data = data.get("events", [])
    return data


def main() -> None:
    parser = argparse.ArgumentParser(description="CyberGuard SIEM Event Collector")
    parser.add_argument("--loop", action="store_true", help="Envío continuo")
    parser.add_argument("--interval", type=int, default=15, help="Segundos entre envíos")
    parser.add_argument("--count", type=int, default=8, help="Cantidad de eventos por pasada")
    parser.add_argument("--file", help="Archivo JSON con eventos")
    parser.add_argument("--backend", default=DEFAULT_BACKEND)
    parser.add_argument("--api-key", default=DEFAULT_API_KEY)
    args = parser.parse_args()

    def send_batch() -> None:
        events = events_from_file(args.file) if args.file else [random_event() for _ in range(args.count)]
        for ev in events:
            send_event(ev, args.backend, args.api_key)
            time.sleep(0.2)

    if args.loop:
        print("[siem] Recolector en modo continuo (Ctrl+C para detener)")
        while True:
            send_batch()
            print(f"[siem] Siguiente envío en {args.interval}s")
            time.sleep(args.interval)
    else:
        send_batch()


if __name__ == "__main__":
    main()
