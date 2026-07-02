export function getAdminCredentials() {
  return {
    user: process.env.ADMIN_USER || "admin",
    pass: process.env.ADMIN_PASS || "goodstyle2026",
  };
}

export function isAdminRequest(request) {
  const authHeader = request.headers.get("authorization") || "";
  const [type, token] = authHeader.split(" ");

  if (type !== "Basic" || !token) {
    return false;
  }

  try {
    const decoded = atob(token);
    const separatorIndex = decoded.indexOf(":");
    const user = decoded.slice(0, separatorIndex);
    const pass = decoded.slice(separatorIndex + 1);
    const credentials = getAdminCredentials();

    return user === credentials.user && pass === credentials.pass;
  } catch {
    return false;
  }
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
