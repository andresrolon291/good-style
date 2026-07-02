import { productos as productosBase } from "./productos";

export function normalizarProductos(productos = productosBase) {
  return productos.map((producto, index) => ({
    id: String(producto.id || `producto-${index + 1}`),
    categoria: producto.categoria || "Jeans",
    nombre: producto.nombre || "",
    precio: producto.precio || "",
    imagen: producto.imagen || "",
    imagen2: producto.imagen2 || "",
    imagen3: producto.imagen3 || "",
    imagen4: producto.imagen4 || "",
    talles: producto.talles || "",
    descripcion: producto.descripcion || "",
  }));
}

export async function getCatalogo() {
  try {
    const response = await fetch("/api/catalog", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("No se pudo leer el catalogo");
    }

    const data = await response.json();
    return {
      productos: normalizarProductos(data.productos),
      promos: data.promos || [],
      source: data.source || "api",
      configured: Boolean(data.configured),
    };
  } catch (error) {
    console.error("No se pudo leer el catalogo remoto", error);
    return {
      productos: normalizarProductos(productosBase),
      promos: [],
      source: "fallback",
      configured: false,
    };
  }
}

export function getProductosPersistidos() {
  return normalizarProductos(productosBase);
}
