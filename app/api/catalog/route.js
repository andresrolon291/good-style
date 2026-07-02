import { NextResponse } from "next/server";
import { obtenerCatalogo } from "../../lib/catalogData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalogo = await obtenerCatalogo();
    return NextResponse.json(catalogo);
  } catch (error) {
    console.error("Error leyendo catalogo", error);
    return NextResponse.json(
      { error: "No se pudo leer el catalogo" },
      { status: 500 }
    );
  }
}
