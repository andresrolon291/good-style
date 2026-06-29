"use client";

import { useEffect, useMemo, useState } from "react";
import { getProductosPersistidos, guardarProductos } from "../productosStore";

const categorias = ["Jeans", "Buzos", "Remeras", "Accesorios"];
const ADMIN_USER = "admin";
const ADMIN_PASS = "goodstyle2026";

const productoVacio = {
  categoria: "Jeans",
  nombre: "",
  precio: "",
  imagen: "",
  talles: "",
  descripcion: "",
};

const promoVacio = {
  titulo: "",
  texto: "",
  descuento: "",
  activa: true,
};

export default function AdminPage() {
  const [productos, setProductos] = useState([]);
  const [productoEditando, setProductoEditando] = useState(null);
  const [form, setForm] = useState(productoVacio);
  const [autenticado, setAutenticado] = useState(false);
  const [loginData, setLoginData] = useState({ usuario: "", password: "" });
  const [errorLogin, setErrorLogin] = useState("");
  const [promos, setPromos] = useState([]);
  const [promoEditando, setPromoEditando] = useState(null);
  const [promoForm, setPromoForm] = useState(promoVacio);
  const [vistaActiva, setVistaActiva] = useState("prendas");
  const [categoriaAdmin, setCategoriaAdmin] = useState("Todos");
  const [talleAdmin, setTalleAdmin] = useState("Todos");

  useEffect(() => {
    const datos = getProductosPersistidos();
    setProductos(datos);

    const authGuardado = window.localStorage.getItem("goodStyleAdminAuth");
    if (authGuardado === "true") {
      setAutenticado(true);
    }

    const promosGuardados = window.localStorage.getItem("goodStylePromos");
    if (promosGuardados) {
      setPromos(JSON.parse(promosGuardados));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("goodStylePromos", JSON.stringify(promos));
      window.dispatchEvent(new Event("promosActualizadas"));
    }
  }, [promos]);

  const iniciarSesion = (event) => {
    event.preventDefault();

    if (loginData.usuario === ADMIN_USER && loginData.password === ADMIN_PASS) {
      window.localStorage.setItem("goodStyleAdminAuth", "true");
      setAutenticado(true);
      setErrorLogin("");
      return;
    }

    setErrorLogin("Usuario o contraseña incorrectos");
  };

  const cerrarSesion = () => {
    window.localStorage.removeItem("goodStyleAdminAuth");
    setAutenticado(false);
    setLoginData({ usuario: "", password: "" });
  };

  const guardar = (event) => {
    event.preventDefault();

    if (!form.nombre.trim() || !form.precio.trim()) {
      alert("Completá al menos nombre y precio");
      return;
    }

    const productoFinal = {
      ...form,
      nombre: form.nombre.trim(),
      precio: form.precio.trim(),
      categoria: form.categoria || "Jeans",
      talles: form.talles.trim(),
      descripcion: form.descripcion.trim(),
      imagen: form.imagen.trim(),
    };

    let prods;
    if (productoEditando) {
      prods = productos.map((item) =>
        item.id === productoEditando.id ? { ...item, ...productoFinal } : item
      );
    } else {
      prods = [{ ...productoFinal, id: Date.now() }, ...productos];
    }

    setProductos(prods);
    guardarProductos(prods);
    setForm(productoVacio);
    setProductoEditando(null);
  };

  const editarProducto = (producto) => {
    setVistaActiva("prendas");
    setProductoEditando(producto);
    setForm({ ...producto });
  };

  const borrarProducto = (id) => {
    const prods = productos.filter((item) => item.id !== id);
    setProductos(prods);
    guardarProductos(prods);
  };

  const manejarArchivo = (event) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = () => {
      setForm((prev) => ({ ...prev, imagen: lector.result }));
    };
    lector.readAsDataURL(archivo);
  };

  const guardarPromo = (event) => {
    event.preventDefault();

    if (!promoForm.titulo.trim() || !promoForm.descuento) {
      alert("Completá el título y el descuento");
      return;
    }

    if (promoEditando) {
      setPromos((prev) =>
        prev.map((promo) =>
          promo.id === promoEditando.id ? { ...promo, ...promoForm, titulo: promoForm.titulo.trim(), texto: promoForm.texto.trim(), descuento: promoForm.descuento } : promo
        )
      );
    } else {
      setPromos((prev) => [
        { id: Date.now(), ...promoForm, titulo: promoForm.titulo.trim(), texto: promoForm.texto.trim(), descuento: promoForm.descuento },
        ...prev,
      ]);
    }

    setPromoForm(promoVacio);
    setPromoEditando(null);
  };

  const editarPromo = (promo) => {
    setPromoEditando(promo);
    setPromoForm({ ...promo });
  };

  const borrarPromo = (id) => {
    setPromos((prev) => prev.filter((promo) => promo.id !== id));
  };

  const productosOrdenados = useMemo(() => {
    return [...productos].sort((a, b) => a.nombre.localeCompare(b.nombre, "es-AR"));
  }, [productos]);

  const productosFiltradosAdmin = useMemo(() => {
    return productosOrdenados.filter((producto) => {
      const coincideCategoria =
        categoriaAdmin === "Todos" || producto.categoria === categoriaAdmin;

      const tallesProducto = producto.talles
        ? producto.talles.split(",").map((talle) => talle.trim().toUpperCase())
        : [];

      const coincideTalle =
        talleAdmin === "Todos" || tallesProducto.includes(talleAdmin);

      return coincideCategoria && coincideTalle;
    });
  }, [categoriaAdmin, productosOrdenados, talleAdmin]);

  const ordenTalles = ["S", "M", "L", "XL", "XXL", "38", "40", "42", "44", "46"];
  const tallesDisponibles = [
    "Todos",
    ...[...new Set(
      productosOrdenados.flatMap((producto) =>
        producto.talles
          ? producto.talles.split(",").map((talle) => talle.trim().toUpperCase())
          : []
      )
    )].sort((a, b) => {
      const posicionA = ordenTalles.indexOf(a);
      const posicionB = ordenTalles.indexOf(b);

      if (posicionA === -1 && posicionB === -1) {
        return a.localeCompare(b, "es-AR", { numeric: true });
      }

      if (posicionA === -1) return 1;
      if (posicionB === -1) return -1;

      return posicionA - posicionB;
    }),
  ];

  if (!autenticado) {
    return (
      <main style={{ maxWidth: "420px", margin: "40px auto", padding: "24px", fontFamily: "Arial, sans-serif" }}>
        <h1 style={{ color: "#2f8f46", marginBottom: "8px" }}>Acceso administrador</h1>
        <p style={{ color: "#555", marginBottom: "16px" }}>Ingresá tus credenciales para administrar los productos.</p>

        <form onSubmit={iniciarSesion} style={{ background: "#f8fff8", border: "1px solid #d8f0d8", padding: "16px", borderRadius: "12px" }}>
          <input
            value={loginData.usuario}
            onChange={(e) => setLoginData({ ...loginData, usuario: e.target.value })}
            placeholder="Usuario"
            style={inputStyle}
          />
          <input
            type="password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            placeholder="Contraseña"
            style={{ ...inputStyle, marginTop: "10px" }}
          />
          {errorLogin && <p style={{ color: "#d9534f", marginTop: "8px" }}>{errorLogin}</p>}
          <button type="submit" style={{ ...botonVerde, width: "100%", marginTop: "12px" }}>Entrar</button>
        </form>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <div>
          <h1 style={{ color: "#2f8f46", marginBottom: "4px" }}>Panel de administración</h1>
          <p style={{ color: "#555", margin: 0 }}>Gestioná prendas, promos y descuentos desde un solo lugar.</p>
        </div>
        <button onClick={cerrarSesion} style={botonGris}>Salir</button>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <button onClick={() => setVistaActiva("prendas")} style={vistaActiva === "prendas" ? botonVerde : botonGris}>Agregar prendas</button>
        <button onClick={() => setVistaActiva("promos")} style={vistaActiva === "promos" ? botonVerde : botonGris}>Descuentos</button>
        <button onClick={() => setVistaActiva("productos")} style={vistaActiva === "productos" ? botonVerde : botonGris}>Productos</button>
      </div>

      {vistaActiva === "prendas" && (
        <section style={panelStyle}>
          <h2 style={{ marginTop: 0 }}>Agregar o editar prenda</h2>
          <form onSubmit={guardar}>
            <div style={{ display: "grid", gap: "12px" }}>
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" style={inputStyle} />
              <input value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="Precio" style={inputStyle} />
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} style={inputStyle}>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
              <input value={form.talles} onChange={(e) => setForm({ ...form, talles: e.target.value })} placeholder="Talles (ej: 38, 40, 42)" style={inputStyle} />
              <input value={form.imagen} onChange={(e) => setForm({ ...form, imagen: e.target.value })} placeholder="URL o base64 de imagen" style={inputStyle} />
              <input type="file" accept="image/*" onChange={manejarArchivo} style={inputStyle} />
              {form.imagen && (
                <div style={{ border: "1px solid #d8f0d8", padding: "8px", borderRadius: "8px", background: "#fff" }}>
                  <img src={form.imagen} alt="Vista previa" style={{ width: "140px", height: "140px", objectFit: "cover", borderRadius: "8px" }} />
                </div>
              )}
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción" style={{ ...inputStyle, minHeight: "80px" }} />
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button type="submit" style={botonVerde}>Guardar</button>
              {productoEditando && (
                <button type="button" onClick={() => { setProductoEditando(null); setForm(productoVacio); }} style={botonGris}>Cancelar</button>
              )}
            </div>
          </form>
        </section>
      )}

      {vistaActiva === "promos" && (
        <section style={panelStyle}>
          <h2 style={{ marginTop: 0 }}>Descuentos y promos</h2>
          <form onSubmit={guardarPromo}>
            <div style={{ display: "grid", gap: "10px" }}>
              <input value={promoForm.titulo} onChange={(e) => setPromoForm({ ...promoForm, titulo: e.target.value })} placeholder="Título de la promo" style={inputStyle} />
              <textarea value={promoForm.texto} onChange={(e) => setPromoForm({ ...promoForm, texto: e.target.value })} placeholder="Texto de la promoción" style={{ ...inputStyle, minHeight: "70px" }} />
              <input type="number" value={promoForm.descuento} onChange={(e) => setPromoForm({ ...promoForm, descuento: e.target.value })} placeholder="Descuento %" style={inputStyle} />
              <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#444" }}>
                <input type="checkbox" checked={promoForm.activa} onChange={(e) => setPromoForm({ ...promoForm, activa: e.target.checked })} />
                Promo activa
              </label>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button type="submit" style={botonVerde}>Guardar promo</button>
              {promoEditando && <button type="button" onClick={() => { setPromoEditando(null); setPromoForm(promoVacio); }} style={botonGris}>Cancelar</button>}
            </div>
          </form>

          <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
            {promos.map((promo) => (
              <div key={promo.id} style={{ border: "1px solid #e5ece5", borderRadius: "10px", padding: "10px", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                  <strong>{promo.titulo}</strong>
                  <span style={{ color: promo.activa ? "#2f8f46" : "#999", fontSize: "0.9rem" }}>{promo.activa ? "Activa" : "Inactiva"}</span>
                </div>
                <div style={{ color: "#666", fontSize: "0.95rem", marginTop: "4px" }}>{promo.texto || "Sin texto"}</div>
                <div style={{ color: "#2f8f46", fontWeight: "700", marginTop: "4px" }}>{promo.descuento}% de descuento</div>
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <button onClick={() => editarPromo(promo)} style={botonGris}>Editar</button>
                  <button onClick={() => borrarPromo(promo.id)} style={botonRojo}>Borrar</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {vistaActiva === "productos" && (
        <section style={panelStyle}>
          <h2 style={{ marginTop: 0 }}>Listado de prendas</h2>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
            {(["Todos", ...categorias]).map((categoria) => (
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

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
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
            {productosFiltradosAdmin.map((producto) => (
              <div
                key={producto.id}
                onClick={() => editarProducto(producto)}
                style={{ border: "1px solid #e2e8e2", padding: "12px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", cursor: "pointer" }}
              >
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {producto.imagen ? (
                    <img src={producto.imagen} alt={producto.nombre} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }} />
                  ) : (
                    <div style={{ width: "60px", height: "60px", borderRadius: "8px", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>Sin img</div>
                  )}
                  <div>
                    <strong>{producto.nombre}</strong>
                    <div style={{ color: "#666", fontSize: "0.95rem" }}>{producto.categoria} • {producto.precio} • Talles: {producto.talles || "—"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={(event) => { event.stopPropagation(); editarProducto(producto); }} style={botonGris}>Editar</button>
                  <button onClick={(event) => { event.stopPropagation(); borrarProducto(producto.id); }} style={botonRojo}>Borrar</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #c3d8c3",
};

const panelStyle = {
  background: "#f8fff8",
  border: "1px solid #d8f0d8",
  padding: "16px",
  borderRadius: "12px",
};

const botonVerde = {
  background: "#2f8f46",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
};

const botonGris = {
  background: "#e7e7e7",
  color: "#111",
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
};

const botonRojo = {
  background: "#d9534f",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
};
