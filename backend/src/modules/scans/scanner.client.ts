/**
 * scanner.client.ts
 * Cliente que invoca el escáner Python (scanner/vulnerability-scanner/main.py)
 * como proceso hijo y parsea su salida JSON. Aísla el detalle de `child_process`
 * del resto de la aplicación.
 */
import { spawn } from "child_process";
import path from "path";
import { logger } from "../../lib/logger";

/** Resultado de un puerto individual reportado por el scanner. */
export interface ScannerPortResult {
  port: number;
  protocol: string;
  state: string;
  service: string | null;
  version: string | null;
  cves?: { cveId: string; title: string; severity: string }[];
}

/** Estructura JSON que el scanner imprime al finalizar. */
export interface ScannerOutput {
  host: string;
  ports: ScannerPortResult[];
  durationMs: number;
}

/** Intérprete de Python usado; se puede sobreescribir con la variable de entorno. */
const PYTHON_BIN = process.env.SCANNER_PYTHON_BIN || "python";

/** Ruta absoluta al script del scanner (resuelta desde este archivo). */
const SCANNER_SCRIPT = path.resolve(
  __dirname,
  "../../../../scanner/main.py"
);

/**
 * Ejecuta el scanner Python y devuelve su salida parseada.
 * @param host IP o hostname a escanear.
 * @param portRange Puertos o rangos ("80", "80,443", "1-1024").
 * @param timeoutMs Timeout por puerto en milisegundos.
 * @param maxThreads Número máximo de hilos concurrentes.
 */
export function runScanner(
  host: string,
  portRange: string,
  timeoutMs: number,
  maxThreads: number
): Promise<ScannerOutput> {
  return new Promise((resolve, reject) => {
    const args = [
      SCANNER_SCRIPT,
      "--host",
      host,
      "--ports",
      portRange,
      "--timeout",
      String(timeoutMs),
      "--threads",
      String(maxThreads),
    ];

    logger.info(`[scanner] python ${args.join(" ")}`);
    const child = spawn(PYTHON_BIN, args, { windowsHide: true });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));

    child.on("error", (err) => {
      reject(new Error(`No se pudo ejecutar el scanner: ${err.message}`));
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Scanner falló (código ${code}): ${stderr.trim()}`));
        return;
      }
      try {
        // El scanner imprime logs a stdout; el JSON final es la última línea.
        const lastLine = stdout.trim().split("\n").pop() || "{}";
        const output = JSON.parse(lastLine) as ScannerOutput;
        resolve(output);
      } catch (err) {
        reject(new Error(`Scanner devolvió salida inválida: ${(err as Error).message}`));
      }
    });
  });
}
