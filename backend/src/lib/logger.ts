/**
 * lib/logger.ts
 * Logger simple con timestamps y niveles.
 * Los mensajes DEBUG solo se muestran en desarrollo.
 */
const ts = () => new Date().toISOString();

export const logger = {
  info: (...args: unknown[]) => console.log(`[INFO]  ${ts()}`, ...args),
  warn: (...args: unknown[]) => console.warn(`[WARN]  ${ts()}`, ...args),
  error: (...args: unknown[]) => console.error(`[ERROR] ${ts()}`, ...args),
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${ts()}`, ...args);
    }
  },
};
