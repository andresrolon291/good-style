import { NextResponse } from "next/server";
import { getAdminCredentials, readJson } from "../auth";

export async function POST(request) {
  const body = await readJson(request);
  const credentials = getAdminCredentials();

  if (body.usuario === credentials.user && body.password === credentials.pass) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { error: "Usuario o contrasena incorrectos" },
    { status: 401 }
  );
}
