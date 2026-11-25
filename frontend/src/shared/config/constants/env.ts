const APP_MODE = {
  DEMO: "demo",
} as const;

type AppMode = (typeof APP_MODE)[keyof typeof APP_MODE];

function requireEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`${name}が設定されていません`);
  }

  return value;
}

export function parseAppMode(value: string | undefined): AppMode {
  const appMode = requireEnv("NEXT_PUBLIC_APP_MODE", value);

  if (appMode !== APP_MODE.DEMO) {
    throw new Error(`NEXT_PUBLIC_APP_MODEの値 "${appMode}" は未対応です`);
  }

  return appMode;
}

export function isDemoMode() {
  return parseAppMode(process.env.NEXT_PUBLIC_APP_MODE) === APP_MODE.DEMO;
}

export function getApiBaseUrl() {
  return requireEnv(
    "NEXT_PUBLIC_API_BASE_URL",
    process.env.NEXT_PUBLIC_API_BASE_URL,
  );
}
