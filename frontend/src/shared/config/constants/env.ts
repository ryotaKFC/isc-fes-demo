const DEMO_APP_MODE = "demo";

function requireEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`${name}が設定されていません`);
  }

  return value;
}

export function isDemoMode() {
  return (
    requireEnv("NEXT_PUBLIC_APP_MODE", process.env.NEXT_PUBLIC_APP_MODE) ===
    DEMO_APP_MODE
  );
}

export function getApiBaseUrl() {
  return requireEnv(
    "NEXT_PUBLIC_API_BASE_URL",
    process.env.NEXT_PUBLIC_API_BASE_URL,
  );
}
