import { NextResponse } from "next/server";
import { borrarPromo, guardarPromo } from "../../../lib/catalogData";
import { isAdminRequest, readJson } from "../auth";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export async function POST(request) {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }

  try {
    const body = await readJson(request);
    const promo = await guardarPromo(body.promo || body);
    return NextResponse.json({ ok: true, promo });
  } catch (error) {
    console.error("No se pudo guardar la promo", error);
    return NextResponse.json(
      { error: error.message || "No se pudo guardar la promo" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }

  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Falta el id" }, { status: 400 });
    }

    await borrarPromo(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("No se pudo borrar la promo", error);
    return NextResponse.json(
      { error: error.message || "No se pudo borrar la promo" },
      { status: 500 }
    );
  }
}
