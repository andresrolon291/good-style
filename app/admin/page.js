"use client";

import { useEffect, useMemo, useState } from "react";

const CATEGORIAS = ["Jeans", "Buzos", "Remeras", "Accesorios", "Zapatillas"];
const ORDEN_TALLES = ["S", "M", "L", "XL", "XXL", "36", "37", "38", "39", "40", "41", "42", "44", "46"];
const AUTH_KEY = "goodStyleAdminAuth";

const productoVacio = {
  categoria: "Jeans",
  nombre: "",
  precio: "",
  imagen: "",
  imagen2: "",
  imagen3: "",
  imagen4: "",
  talles: "",
  descripcion: "",
};

const promoVacio = {
  titulo: "",
  texto: "",
  descuento: "",
  activa: true,
};

function authHeader(token) {
  return {
    Authorization: `Basic ${token}`,
    "Content-Type": "application/json",
  };
}

function crearToken(usuario, password) {
  return btoa(`${usuario}:${password}`);
}

function normalizarPrecio(precio) {
  const limpio = String(precio).trim();
  if (!limpio) return "";
  if (limpio.startsWith("$")) return limpio;

  const soloNumeros = limpio.replace(/[^0-9]/g, "");
  if (!soloNumeros) return limpio;

  return `$${Number(soloNumeros).toLocaleString("es-AR")}`;
}

function normalizarTalles(talles) {
  return String(talles)
    .split(",")
    .map((talle) => talle.trim().replace(".", "").toUpperCase())
    .filter(Boolean)
    .join(", ");
}

function obtenerTalles(producto) {
  return producto.talles
    ? producto.talles.split(",").map((talle) => talle.trim().replace(".", "").toUpperCase()).filter(Boolean)
    : [];
}

function obtenerImagenes(producto) {
  return [producto.imagen, producto.imagen2, producto.imagen3, producto.imagen4].filter(Boolean);
}

async function leerRespuesta(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "No se pudo completar la accion");
  }
  return data;
}

export default function AdminPage() {
  const [productos, setProductos] = useState([]);
  const [promos, setPromos] = useState([]);
  const [productoEditando, setProductoEditando] = useState(null);
  const [promoEditando, setPromoEditando] = useState(null);
  const [form, setForm] = useState(productoVacio);
  const [promoForm, setPromoForm] = useState(promoVacio);
  const [autenticado, setAutenticado] = useState(false);
  const [token, setToken] = useState("");
  const [loginData, setLoginData] = useState({ usuario: "", password: "" });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [vistaActiva, setVistaActiva] = useState("productos");
  const [categoriaAdmin, setCategoriaAdmin] = useState("Todos");
  const [talleAdmin, setTalleAdmin] = useState("Todos");

  const cargarCatalogo = async () => {
    setError("");
    try {
      const response = await fetch("/api/catalog", { cache: "no-store" });
      const data = await leerRespuesta(response);
      setProductos(data.productos || []);
      setPromos(data.promos || []);

      if (!data.configured) {
        setMensaje("Modo respaldo: falta configurar Supabase. La pagina muestra el catalogo base, pero el admin no puede guardar cambios compartidos todavia.");
      } else if (data.source === "fallback") {
        setMensaje("Supabase esta configurado, pero la tabla de productos esta vacia. Usa 'Importar catalogo base' una vez.");
      } else {
        setMensaje("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const tokenGuardado = localStorage.getItem(AUTH_KEY);
    if (tokenGuardado) {
      setToken(tokenGuardado);
      setAutenticado(true);
    }

    cargarCatalogo();
  }, []);

  const iniciarSesion = async (event) => {
    event.preventDefault();
    setError("");
    setMensaje("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      await leerRespuesta(response);
      const nuevoToken = crearToken(loginData.usuario, loginData.password);
      localStorage.setItem(AUTH_KEY, nuevoToken);
      setToken(nuevoToken);
      setAutenticado(true);
      setLoginData({ usuario: "", password: "" });
      setMensaje("Sesion iniciada.");
    } catch (err) {
      setError(err.message);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem(AUTH_KEY);
    setAutenticado(false);
    setToken("");
    setLoginData({ usuario: "", password: "" });
  };

  const guardarProducto = async (event) => {
    event.preventDefault();
    setError("");
    setMensaje("");

    const productoFinal = {
      ...form,
      id: productoEditando?.id || form.id,
      nombre: form.nombre.trim(),
      precio: normalizarPrecio(form.precio),
      talles: normalizarTalles(form.talles),
      descripcion: form.descripcion.trim(),
      imagen: form.imagen.trim(),
      imagen2: form.imagen2.trim(),
      imagen3: form.imagen3.trim(),
      imagen4: form.imagen4.trim(),
    };

    if (!productoFinal.nombre || !productoFinal.precio) {
      setError("Completa al menos nombre y precio.");
      return;
    }

    setGuardando(true);
    try {
      const response = await fetch("/api/admin/productos", {
        method: "POST",
        headers: authHeader(token),
        body: JSON.stringify({ producto: productoFinal }),
      });

      const data = await leerRespuesta(response);
      setProductos((prev) => {
        const existe = prev.some((item) => item.id === data.producto.id);
        if (existe) {
          return prev.map((item) => (item.id === data.producto.id ? data.producto : item));
        }
        return [data.producto, ...prev];
      });
      setForm(productoVacio);
      setProductoEditando(null);
      setVistaActiva("productos");
      setMensaje("Producto guardado. La pagina publica lo va a reflejar al recargar o automaticamente en unos segundos.");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const borrarProductoAdmin = async (id) => {
    if (!confirm("Seguro que queres borrar este producto?")) return;

    setError("");
    setMensaje("");
    try {
      const response = await fetch(`/api/admin/productos?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: authHeader(token),
      });

      await leerRespuesta(response);
      setProductos((prev) => prev.filter((item) => item.id !== id));
      setMensaje("Producto borrado.");
    } catch (err) {
      setError(err.message);
    }
  };

  const importarCatalogoBase = async () => {
    if (!confirm("Esto carga el catalogo base en Supabase. Los productos con el mismo id se actualizan. Continuar?")) return;

    setError("");
    setMensaje("");
    setGuardando(true);
    try {
      const response = await fetch("/api/admin/productos", {
        method: "POST",
        headers: authHeader(token),
        body: JSON.stringify({ action: "importar-base" }),
      });

      const data = await leerRespuesta(response);
      setProductos(data.productos || []);
      setMensaje(`Catalogo base importado (${data.total} productos).`);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const editarProducto = (producto) => {
    setProductoEditando(producto);
    setForm({ ...producto });
    setVistaActiva("editar");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarProducto = () => {
    setProductoEditando(null);
    setForm(productoVacio);
    setVistaActiva("productos");
  };

  const manejarArchivo = (event, campo) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = () => {
      setForm((prev) => ({ ...prev, [campo]: lector.result }));
    };
    lector.readAsDataURL(archivo);
  };

  const guardarPromoAdmin = async (event) => {
    event.preventDefault();
    setError("");
    setMensaje("");

    const promoFinal = {
      ...promoForm,
      id: promoEditando?.id || promoForm.id,
      titulo: promoForm.titulo.trim(),
      texto: promoForm.texto.trim(),
      descuento: String(promoForm.descuento).trim(),
      activa: Boolean(promoForm.activa),
    };

    if (!promoFinal.titulo || !promoFinal.descuento) {
      setError("Completa el titulo y el descuento.");
      return;
    }

    setGuardando(true);
    try {
      const response = await fetch("/api/admin/promos", {
        method: "POST",
        headers: authHeader(token),
        body: JSON.stringify({ promo: promoFinal }),
      });

      const data = await leerRespuesta(response);
      setPromos((prev) => {
        const existe = prev.some((promo) => promo.id === data.promo.id);
        if (existe) {
          return prev.map((promo) => (promo.id === data.promo.id ? data.promo : promo));
        }
        return [data.promo, ...prev];
      });
      setPromoForm(promoVacio);
      setPromoEditando(null);
      setMensaje("Promo guardada.");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const borrarPromoAdmin = async (id) => {
    if (!confirm("Seguro que queres borrar esta promo?")) return;

    setError("");
    setMensaje("");
    try {
      const response = await fetch(`/api/admin/promos?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: authHeader(token),
      });

      await leerRespuesta(response);
      setPromos((prev) => prev.filter((promo) => promo.id !== id));
      setMensaje("Promo borrada.");
    } catch (err) {
      setError(err.message);
    }
  };

  const editarPromo = (promo) => {
    setPromoEditando(promo);
    setPromoForm({ ...promo });
    setVistaActiva("promos");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const productosOrdenados = useMemo(() => {
    return [...productos].sort((a, b) => a.nombre.localeCompare(b.nombre, "es-AR"));
  }, [productos]);

  const productosFiltradosAdmin = useMemo(() => {
    return productosOrdenados.filter((producto) => {
      const coincideCategoria = categoriaAdmin === "Todos" || producto.categoria === categoriaAdmin;
      const tallesProducto = obtenerTalles(producto);
      const coincideTalle = talleAdmin === "Todos" || tallesProducto.includes(talleAdmin);
      return coincideCategoria && coincideTalle;
    });
  }, [categoriaAdmin, productosOrdenados, talleAdmin]);

  const tallesDisponibles = useMemo(() => {
    const talles = productosOrdenados.flatMap(obtenerTalles);

    return [
      "Todos",
      ...[...new Set(talles)].sort((a, b) => {
        const posicionA = ORDEN_TALLES.indexOf(a);
        const posicionB = ORDEN_TALLES.indexOf(b);

        if (posicionA === -1 && posicionB === -1) {
          return a.localeCompare(b, "es-AR", { numeric: true });
        }

        if (posicionA === -1) return 1;
        if (posicionB === -1) return -1;

        return posicionA - posicionB;
      }),
    ];
  }, [productosOrdenados]);

  if (!autenticado) {
    return (
      <main style={adminPageStyle}>
        <section style={{ ...panelStyle, maxWidth: "440px", margin: "40px auto" }}>
          <h1 style={titleStyle}>Acceso administrador</h1>
          <p style={mutedStyle}>Ingresa tus credenciales para administrar productos y promos.</p>

          <form onSubmit={iniciarSesion} style={{ display: "grid", gap: "10px", marginTop: "16px" }}>
            <input
              value={loginData.usuario}
              onChange={(event) => setLoginData({ ...loginData, usuario: event.target.value })}
              placeholder="Usuario"
              autoComplete="username"
              style={inputStyle}
            />
            <input
              type="password"
              value={loginData.password}
              onChange={(event) => setLoginData({ ...loginData, password: event.target.value })}
              placeholder="Contrasena"
              autoComplete="current-password"
              style={inputStyle}
            />
            {error && <p style={errorStyle}>{error}</p>}
            <button type="submit" style={botonVerde}>Entrar</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main style={adminPageStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Panel de administracion</h1>
          <p style={mutedStyle}>Gestiona productos y promos desde cualquier dispositivo.</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={cargarCatalogo} style={botonGris}>Actualizar</button>
          <button onClick={cerrarSesion} style={botonGris}>Salir</button>
        </div>
      </header>

      {mensaje && <div style={noticeStyle}>{mensaje}</div>}
      {error && <div style={errorBoxStyle}>{error}</div>}

      <nav style={tabsStyle}>
        <button onClick={() => setVistaActiva("productos")} style={vistaActiva === "productos" ? botonVerde : botonGris}>Productos</button>
        <button onClick={() => { setVistaActiva("editar"); setProductoEditando(null); setForm(productoVacio); }} style={vistaActiva === "editar" ? botonVerde : botonGris}>Agregar producto</button>
        <button onClick={() => setVistaActiva("promos")} style={vistaActiva === "promos" ? botonVerde : botonGris}>Promos</button>
        <button onClick={importarCatalogoBase} disabled={guardando} style={botonGris}>Importar catalogo base</button>
      </nav>

      {vistaActiva === "editar" && (
        <section style={panelStyle}>
          <h2 style={{ marginTop: 0 }}>{productoEditando ? "Editar producto" : "Agregar producto"}</h2>
          <form onSubmit={guardarProducto}>
            <div style={formGridStyle}>
              <input value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} placeholder="Nombre" style={inputStyle} />
              <input value={form.precio} onChange={(event) => setForm({ ...form, precio: event.target.value })} placeholder="Precio, ej: 39000" inputMode="numeric" style={inputStyle} />
              <select value={form.categoria} onChange={(event) => setForm({ ...form, categoria: event.target.value })} style={inputStyle}>
                {CATEGORIAS.map((categoria) => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
              <input value={form.talles} onChange={(event) => setForm({ ...form, talles: event.target.value })} placeholder="Talles, ej: 38, 40, 42" style={inputStyle} />
              <textarea value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} placeholder="Descripcion" style={{ ...inputStyle, minHeight: "80px" }} />
            </div>

            <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
              {["imagen", "imagen2", "imagen3", "imagen4"].map((campo, index) => (
                <div key={campo} style={imageFieldStyle}>
                  <div>
                    <label style={labelStyle}>Imagen {index + 1}</label>
                    <input
                      value={form[campo] || ""}
                      onChange={(event) => setForm({ ...form, [campo]: event.target.value })}
                      placeholder="URL o imagen cargada"
                      style={inputStyle}
                    />
                    <input type="file" accept="image/*" onChange={(event) => manejarArchivo(event, campo)} style={{ ...inputStyle, marginTop: "8px" }} />
                  </div>
                  {form[campo] && <img src={form[campo]} alt={`Vista previa ${index + 1}`} style={previewStyle} />}
                </div>
              ))}
            </div>

            <div style={actionsStyle}>
              <button type="submit" disabled={guardando} style={botonVerde}>{guardando ? "Guardando..." : "Guardar producto"}</button>
              <button type="button" onClick={cancelarProducto} style={botonGris}>Cancelar</button>
            </div>
          </form>
        </section>
      )}

      {vistaActiva === "promos" && (
        <section style={panelStyle}>
          <h2 style={{ marginTop: 0 }}>Promos y descuentos</h2>
          <form onSubmit={guardarPromoAdmin}>
            <div style={formGridStyle}>
              <input value={promoForm.titulo} onChange={(event) => setPromoForm({ ...promoForm, titulo: event.target.value })} placeholder="Titulo de la promo" style={inputStyle} />
              <input value={promoForm.descuento} onChange={(event) => setPromoForm({ ...promoForm, descuento: event.target.value })} placeholder="Descuento %" inputMode="numeric" style={inputStyle} />
              <textarea value={promoForm.texto} onChange={(event) => setPromoForm({ ...promoForm, texto: event.target.value })} placeholder="Texto de la promocion" style={{ ...inputStyle, minHeight: "70px" }} />
              <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#444" }}>
                <input type="checkbox" checked={promoForm.activa} onChange={(event) => setPromoForm({ ...promoForm, activa: event.target.checked })} />
                Promo activa
              </label>
            </div>
            <div style={actionsStyle}>
              <button type="submit" disabled={guardando} style={botonVerde}>{guardando ? "Guardando..." : "Guardar promo"}</button>
              {promoEditando && <button type="button" onClick={() => { setPromoEditando(null); setPromoForm(promoVacio); }} style={botonGris}>Cancelar</button>}
            </div>
          </form>

          <div style={{ display: "grid", gap: "10px", marginTop: "18px" }}>
            {promos.length === 0 ? (
              <p style={mutedStyle}>Todavia no hay promos cargadas.</p>
            ) : promos.map((promo) => (
              <article key={promo.id} style={itemStyle}>
                <div>
                  <strong>{promo.titulo}</strong>
                  <div style={mutedStyle}>{promo.texto || "Sin texto"}</div>
                  <div style={{ color: "#2f8f46", fontWeight: 700 }}>{promo.descuento}% de descuento - {promo.activa ? "Activa" : "Inactiva"}</div>
                </div>
                <div style={actionsStyle}>
                  <button onClick={() => editarPromo(promo)} style={botonGris}>Editar</button>
                  <button onClick={() => borrarPromoAdmin(promo.id)} style={botonRojo}>Borrar</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {vistaActiva === "productos" && (
        <section style={panelStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>Productos ({productosFiltradosAdmin.length})</h2>
            {cargando && <span style={mutedStyle}>Cargando...</span>}
          </div>

          <div style={filtersStyle}>
            {["Todos", ...CATEGORIAS].map((categoria) => (
              <button
                key={categoria}
                onClick={() => {
                  setCategoriaAdmin(categoria);
                  setTalleAdmin("Todos");
                }}
                style={categoriaAdmin === categoria ? botonVerde : botonGris}
              >
                {categoria}
              </button>
            ))}
          </div>

          <div style={filtersStyle}>
            {tallesDisponibles.map((talle) => (
              <button
                key={talle}
                onClick={() => setTalleAdmin(talle)}
                style={talleAdmin === talle ? botonVerde : botonGris}
              >
                {talle === "Todos" ? "Todos los talles" : talle}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            {productosFiltradosAdmin.map((producto) => {
              const imagenes = obtenerImagenes(producto);
              return (
                <article key={producto.id} style={itemStyle}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", minWidth: 0 }}>
                    {imagenes[0] ? (
                      <img src={imagenes[0]} alt={producto.nombre} style={thumbStyle} />
                    ) : (
                      <div style={emptyThumbStyle}>Sin img</div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <strong>{producto.nombre}</strong>
                      <div style={mutedStyle}>{producto.categoria} | {producto.precio} | Talles: {producto.talles || "-"}</div>
                      {producto.descripcion && <div style={mutedStyle}>{producto.descripcion}</div>}
                    </div>
                  </div>
                  <div style={actionsStyle}>
                    <button onClick={() => editarProducto(producto)} style={botonGris}>Editar</button>
                    <button onClick={() => borrarProductoAdmin(producto.id)} style={botonRojo}>Borrar</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

const adminPageStyle = {
  maxWidth: "1180px",
  margin: "0 auto",
  padding: "18px",
  fontFamily: "Arial, sans-serif",
  color: "#121212",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
  marginBottom: "14px",
};

const titleStyle = {
  color: "#2f8f46",
  margin: 0,
};

const mutedStyle = {
  color: "#666",
  fontSize: "0.95rem",
  margin: 0,
};

const panelStyle = {
  background: "#f8fff8",
  border: "1px solid #d8f0d8",
  padding: "16px",
  borderRadius: "12px",
  marginBottom: "16px",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #c3d8c3",
  fontSize: "16px",
};

const formGridStyle = {
  display: "grid",
  gap: "12px",
};

const tabsStyle = {
  display: "flex",
  gap: "10px",
  marginBottom: "16px",
  flexWrap: "wrap",
};

const filtersStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  margin: "14px 0",
};

const actionsStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginTop: "10px",
};

const imageFieldStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: "12px",
  alignItems: "end",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  color: "#444",
  fontWeight: 700,
};

const previewStyle = {
  width: "92px",
  height: "92px",
  objectFit: "cover",
  borderRadius: "8px",
  border: "1px solid #d8f0d8",
};

const itemStyle = {
  border: "1px solid #e2e8e2",
  padding: "12px",
  borderRadius: "10px",
  background: "#fff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const thumbStyle = {
  width: "64px",
  height: "64px",
  objectFit: "cover",
  borderRadius: "8px",
  flex: "0 0 auto",
};

const emptyThumbStyle = {
  ...thumbStyle,
  background: "#f0f0f0",
  color: "#777",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
};

const botonVerde = {
  background: "#2f8f46",
  color: "white",
  border: "none",
  padding: "11px 14px",
  borderRadius: "8px",
  cursor: "pointer",
};

const botonGris = {
  background: "#e7e7e7",
  color: "#111",
  border: "none",
  padding: "11px 14px",
  borderRadius: "8px",
  cursor: "pointer",
};

const botonRojo = {
  background: "#d9534f",
  color: "white",
  border: "none",
  padding: "11px 14px",
  borderRadius: "8px",
  cursor: "pointer",
};

const noticeStyle = {
  background: "#fff7d6",
  color: "#664d03",
  border: "1px solid #f3d36b",
  borderRadius: "10px",
  padding: "10px 12px",
  marginBottom: "12px",
};

const errorStyle = {
  color: "#d9534f",
  margin: 0,
};

const errorBoxStyle = {
  background: "#fff0f0",
  color: "#a52727",
  border: "1px solid #f2b7b7",
  borderRadius: "10px",
  padding: "10px 12px",
  marginBottom: "12px",
};
