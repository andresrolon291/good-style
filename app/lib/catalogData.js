import { createClient } from "@supabase/supabase-js";
import { productos as productosBase } from "../productos";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseServiceKey);
}

function getSupabaseAdmin() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseAdmin) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseAdmin;
}

export function normalizarProductos(productos = []) {
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

export function normalizarPromos(promos = []) {
  return promos.map((promo) => ({
    id: String(promo.id || crypto.randomUUID()),
    titulo: promo.titulo || "",
    texto: promo.texto || "",
    descuento: String(promo.descuento || ""),
    activa: Boolean(promo.activa),
  }));
}

export function productosFallback() {
  return normalizarProductos(productosBase);
}

export async function obtenerCatalogo() {
  const fallback = {
    productos: productosFallback(),
    promos: [],
    source: "fallback",
    configured: isSupabaseConfigured(),
  };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return fallback;
  }

  const [productosResult, promosResult] = await Promise.all([
    supabase.from("productos").select("*").order("created_at", { ascending: false }),
    supabase.from("promos").select("*").order("created_at", { ascending: false }),
  ]);

  if (productosResult.error) {
    console.error("No se pudieron leer los productos de Supabase", productosResult.error);
    return fallback;
  }

  if (promosResult.error) {
    console.error("No se pudieron leer las promos de Supabase", promosResult.error);
  }

  const productos = normalizarProductos(productosResult.data || []);

  return {
    productos: productos.length > 0 ? productos : fallback.productos,
    promos: normalizarPromos(promosResult.data || []),
    source: productos.length > 0 ? "supabase" : "fallback",
    configured: true,
  };
}

export async function guardarProducto(producto) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase no esta configurado");
  }

  const [productoNormalizado] = normalizarProductos([
    {
      ...producto,
      id: producto.id || crypto.randomUUID(),
    },
  ]);

  const { data, error } = await supabase
    .from("productos")
    .upsert(productoNormalizado, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return normalizarProductos([data])[0];
}

export async function borrarProducto(id) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase no esta configurado");
  }

  const { error } = await supabase.from("productos").delete().eq("id", String(id));
  if (error) {
    throw error;
  }
}

export async function guardarPromo(promo) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase no esta configurado");
  }

  const [promoNormalizada] = normalizarPromos([
    {
      ...promo,
      id: promo.id || crypto.randomUUID(),
    },
  ]);

  const { data, error } = await supabase
    .from("promos")
    .upsert(promoNormalizada, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return normalizarPromos([data])[0];
}

export async function borrarPromo(id) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase no esta configurado");
  }

  const { error } = await supabase.from("promos").delete().eq("id", String(id));
  if (error) {
    throw error;
  }
}

export async function importarProductosBase() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase no esta configurado");
  }

  const productos = productosFallback();
  const { error } = await supabase
    .from("productos")
    .upsert(productos, { onConflict: "id" });

  if (error) {
    throw error;
  }

  return productos.length;
}
