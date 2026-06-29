import { productos as productosBase } from "./productos";

export const PRODUCTOS_STORAGE_KEY = "goodStyleProductos";

function normalizarProductos(productos) {
    return productos.map((producto, index) => ({
        ...producto,
        id: producto.id || `producto-${index + 1}`,
    }));
}

export function getProductosPersistidos() {
    if (typeof window === "undefined") {
        return normalizarProductos(productosBase);
    }

    try {
        const guardados = window.localStorage.getItem(PRODUCTOS_STORAGE_KEY);
        if (!guardados) {
            return normalizarProductos(productosBase);
        }

        const productosLeidos = JSON.parse(guardados);
        return normalizarProductos(productosLeidos);
    } catch (error) {
        console.error("No se pudieron leer los productos guardados", error);
        return normalizarProductos(productosBase);
    }
}

export function guardarProductos(productos) {
    if (typeof window === "undefined") {
        return;
    }

    const productosNormalizados = normalizarProductos(productos);
    window.localStorage.setItem(PRODUCTOS_STORAGE_KEY, JSON.stringify(productosNormalizados));
    window.dispatchEvent(new Event("productosActualizados"));
}
