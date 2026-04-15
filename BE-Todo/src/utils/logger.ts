import fs from 'fs';
import path from 'path';

// ─── Cấu hình thư mục log ─────────────────────────────────────────────────────
const LOG_DIR = path.resolve(process.cwd(), 'logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ─── Levels ───────────────────────────────────────────────────────────────────
const LEVELS = {
  error: 0,
  warn:  1,
  info:  2,
  http:  3,
  debug: 4,
} as const;

type LogLevel = keyof typeof LEVELS;

// Log level tối thiểu từ ENV (mặc định: 'http' ở production, 'debug' ở dev)
const ENV_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === 'production' ? 'http' : 'debug');

// ─── Màu sắc cho console ──────────────────────────────────────────────────────
const COLORS: Record<LogLevel, string> = {
  error: '\x1b[31m', // đỏ
  warn:  '\x1b[33m', // vàng
  info:  '\x1b[36m', // cyan
  http:  '\x1b[35m', // tím
  debug: '\x1b[90m', // xám
};
const RESET = '\x1b[0m';
const BOLD  = '\x1b[1m';

// ─── Helper lấy ngày hiện tại ─────────────────────────────────────────────────
function getDateString(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getTimestamp(): string {
  return new Date().toISOString(); // full ISO timestamp
}

// ─── Ghi ra file ──────────────────────────────────────────────────────────────
function writeToFile(filename: string, line: string): void {
  const filePath = path.join(LOG_DIR, filename);
  fs.appendFile(filePath, line + '\n', (err) => {
    if (err) process.stderr.write(`[Logger] Failed to write log: ${err.message}\n`);
  });
}

// ─── Core log function ────────────────────────────────────────────────────────
function log(level: LogLevel, message: string, meta?: object): void {
  // Bỏ qua nếu level thấp hơn ngưỡng cấu hình
  if (LEVELS[level] > LEVELS[ENV_LEVEL]) return;

  const timestamp = getTimestamp();
  const date      = getDateString();

  // JSON record ghi file
  const record = JSON.stringify({
    timestamp,
    level,
    message,
    ...(meta ?? {}),
  });

  // Ghi vào combined log
  writeToFile(`${date}-combined.log`, record);

  // Ghi thêm vào error log nếu là error/warn
  if (level === 'error' || level === 'warn') {
    writeToFile(`${date}-error.log`, record);
  }

  // Format console đẹp
  const color  = COLORS[level];
  const label  = level.toUpperCase().padEnd(5);
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  process.stdout.write(
    `${color}${BOLD}[${timestamp}]${RESET} ${color}${label}${RESET}  ${message}${metaStr}\n`
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────
const logger = {
  error: (message: string, meta?: object) => log('error', message, meta),
  warn:  (message: string, meta?: object) => log('warn',  message, meta),
  info:  (message: string, meta?: object) => log('info',  message, meta),
  http:  (message: string, meta?: object) => log('http',  message, meta),
  debug: (message: string, meta?: object) => log('debug', message, meta),
  stream: {
    write: (message: string) => log('http', message.trim()),
  },
};

export default logger;
