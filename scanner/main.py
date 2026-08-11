#!/usr/bin/env python3
"""
CyberGuard - Vulnerability Scanner

Escáner de puertos TCP con detección de servicios y versiones (banner grabbing)
y análisis de vulnerabilidades conocidas (CVE).

Uso:
    python main.py --host 127.0.0.1 --ports 1-1000 --timeout 1500 --threads 50

Salida (JSON en stdout):
    {"host": "...", "ports": [...], "durationMs": ...}

Solo debe usarse sobre activos propios o autorizados dentro del laboratorio.
"""

import argparse
import json
import socket
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# ---------------------------------------------------------------
# Tablas de referencia local (sin dependencias externas)
# ---------------------------------------------------------------

PORT_SERVICES = {
    21: "ftp", 22: "ssh", 23: "telnet", 25: "smtp", 53: "dns",
    80: "http", 110: "pop3", 111: "rpcbind", 135: "msrpc", 139: "netbios-ssn",
    143: "imap", 389: "ldap", 443: "https", 445: "microsoft-ds", 465: "smtps",
    587: "smtp", 636: "ldaps", 873: "rsync", 993: "imaps", 995: "pop3s",
    1080: "socks-proxy", 1433: "mssql", 1521: "oracle", 2049: "nfs",
    2121: "ftp", 2222: "ssh-alt", 2375: "docker", 2376: "docker-tls", 3000: "grafana",
    3128: "squid-proxy", 3306: "mysql", 3389: "rdp", 4000: "kestrel",
    5000: "http-alt", 5432: "postgresql", 5601: "kibana", 5900: "vnc",
    5985: "winrm", 5986: "winrm-https", 6379: "redis", 7001: "weblogic",
    8000: "http-alt", 8080: "http-proxy", 8081: "http-proxy-alt",
    8443: "https-alt", 8888: "http-alt", 9000: "php-fpm", 9090: "prometheus",
    9200: "elasticsearch", 9300: "elasticsearch", 11211: "memcached",
    27017: "mongodb", 27018: "mongodb", 50000: "sap", 50070: "hdfs",
}

# Servicios con banners conocidos -> posibles vulnerabilidades de referencia.
# cve_id, título, severidad. Solo referencia local para demo/educación.
KNOWN_VULNERABILITIES = [
    {
        "match": {"service": "ftp"},
        "cve": "CVE-2011-2523",
        "title": "FTP service exposed",
        "severity": "LOW",
    },
    {
        "match": {"service": "telnet"},
        "cve": "CVE-1999-0619",
        "title": "Telnet service exposed (unencrypted)",
        "severity": "HIGH",
    },
    {
        "match": {"service": "microsoft-ds"},
        "cve": "CVE-2017-0144",
        "title": "SMB service exposed (EternalBlue risk)",
        "severity": "CRITICAL",
    },
    {
        "match": {"service": "rdp"},
        "cve": "CVE-2019-0708",
        "title": "Remote Desktop Protocol exposed (BlueKeep)",
        "severity": "CRITICAL",
    },
    {
        "match": {"service": "redis"},
        "cve": "CVE-2021-32761",
        "title": "Redis exposed without authentication",
        "severity": "HIGH",
    },
    {
        "match": {"service": "mongodb"},
        "cve": "CVE-2013-1892",
        "title": "MongoDB exposed without authentication",
        "severity": "HIGH",
    },
    {
        "match": {"service": "mysql"},
        "cve": "CVE-2012-2122",
        "title": "MySQL authentication bypass risk",
        "severity": "MEDIUM",
    },
    {
        "match": {"service": "ssh"},
        "cve": "CVE-2016-20012",
        "title": "SSH service exposed",
        "severity": "LOW",
    },
    {
        "match": {"service": "docker"},
        "cve": "CVE-2019-5736",
        "title": "Docker daemon API exposed",
        "severity": "CRITICAL",
    },
]


def resolve_ports(port_range: str) -> list:
    """Convierte '1-1000', '22' o '80,443,8080' en lista de puertos."""
    ports: list[int] = []
    for part in port_range.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            start, _, end = part.partition("-")
            ports.extend(range(int(start), int(end) + 1))
        else:
            ports.append(int(part))
    return sorted(set(ports))


def probe_port(host: str, port: int, timeout_ms: int) -> dict | None:
    """Intenta conexión TCP y banner grabbing."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(timeout_ms / 1000.0)
    result = None
    try:
        sock.connect((host, port))
        result = {
            "port": port,
            "protocol": "tcp",
            "state": "open",
            "service": PORT_SERVICES.get(port),
            "version": None,
        }

        # Banner grabbing básico
        banner = None
        try:
            sock.settimeout(max(500, timeout_ms / 3) / 1000.0)
            probe = b"\r\n"
            if result["service"] in ("http", "http-proxy", "https", "grafana", "kibana", "prometheus"):
                probe = b"GET / HTTP/1.0\r\nHost: localhost\r\n\r\n"
            sock.sendall(probe)
            data = sock.recv(512)
            if data:
                banner = parse_banner(result["service"], data)
        except (socket.timeout, OSError):
            pass

        if banner:
            result["version"] = banner
    except (socket.timeout, OSError):
        result = {
            "port": port,
            "protocol": "tcp",
            "state": "closed",
            "service": None,
            "version": None,
        }
    finally:
        sock.close()
    return result


def parse_banner(service: str | None, data: bytes) -> str | None:
    """Extrae información de versión según el protocolo del servicio."""
    text = data.decode("utf-8", errors="replace").strip()
    if not text:
        return None
    if service in ("http", "http-proxy", "https", "grafana", "kibana", "prometheus"):
        for line in text.split("\r\n")[:8]:
            if line.lower().startswith("server:"):
                return line.split(":", 1)[1].strip()
        return text[:80]
    return text[:120]


def find_cves(result: dict) -> list[dict]:
    """Relaciona el puerto/servicio detectado con CVEs de referencia local."""
    service = (result.get("service") or "").lower()
    cves = []
    for known in KNOWN_VULNERABILITIES:
        if known["match"].get("service") == service:
            cves.append(
                {
                    "cveId": known["cve"],
                    "title": known["title"],
                    "severity": known["severity"],
                }
            )
    return cves


def main() -> None:
    parser = argparse.ArgumentParser(description="CyberGuard Vulnerability Scanner")
    parser.add_argument("--host", required=True, help="Dirección IP objetivo")
    parser.add_argument("--ports", default="1-1000", help="Rango de puertos (ej: 1-1000)")
    parser.add_argument("--timeout", type=int, default=1500, help="Timeout en ms")
    parser.add_argument("--threads", type=int, default=50, help="Cantidad de hilos")
    args = parser.parse_args()

    ports = resolve_ports(args.ports)
    start = time.time()
    results = []

    with ThreadPoolExecutor(max_workers=args.threads) as executor:
        futures = {
            executor.submit(probe_port, args.host, port, args.timeout): port
            for port in ports
        }
        for future in as_completed(futures):
            try:
                result = future.result()
            except Exception:
                continue
            if result and result["state"] == "open":
                cves = find_cves(result)
                result["cves"] = cves
                results.append(result)

    results.sort(key=lambda r: r["port"])
    duration_ms = int((time.time() - start) * 1000)

    output = {
        "host": args.host,
        "ports": results,
        "durationMs": duration_ms,
        "totalPortsScanned": len(ports),
    }
    print(json.dumps(output))
    sys.stdout.flush()


if __name__ == "__main__":
    main()
