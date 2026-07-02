import { NextResponse } from "next/server";
import {
  borrarProducto,
  guardarProducto,
  importarProductosBase,
  obtenerCatalogo,
} from "../../../lib/catalogData";
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

    if (body.action === "importar-base") {
      const total = await importarProductosBase();
      const catalogo = await obtenerCatalogo();
      return NextResponse.json({ ok: true, total, productos: catalogo.productos });
    }

    const producto = await guardarProducto(body.producto || body);
    return NextResponse.json({ ok: true, producto });
  } catch (error) {
    console.error("No se pudo guardar el producto", error);
    return NextResponse.json(
      { error: error.message || "No se pudo guardar el producto" },
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

    await borrarProducto(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("No se pudo borrar el producto", error);
    return NextResponse.json(
      { error: error.message || "No se pudo borrar el producto" },
      { status: 500 }
    );
  }
}
