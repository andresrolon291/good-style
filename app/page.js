"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getCatalogo } from "./productosStore";

const CATEGORIAS = ["Todos", "Jeans", "Buzos", "Remeras", "Accesorios", "Zapatillas"];
const ORDEN_TALLES = ["S", "M", "L", "XL", "XXL", "36", "37", "38", "39", "40", "41", "42", "44", "46"];

function obtenerImagenes(producto) {
  return [producto.imagen, producto.imagen2, producto.imagen3, producto.imagen4].filter(Boolean);
}

function parsearPrecio(precio) {
  return Number(String(precio).replace(/[^0-9]/g, "")) || 0;
}

function obtenerTalles(producto) {
  return producto.talles
    ? producto.talles.split(",").map((talle) => talle.trim().replace(".", "").toUpperCase()).filter(Boolean)
    : [];
}

export default function Home() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [talleSeleccionado, setTalleSeleccionado] = useState("Todos");
  const [carrito, setCarrito] = useState([]);
  const [carritoCargado, setCarritoCargado] = useState(false);
  const [imagenActual, setImagenActual] = useState({});
  const [imagenGrande, setImagenGrande] = useState(null);
  const [productos, setProductos] = useState([]);
  const [promos, setPromos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const total = carrito.reduce((acum, item) => acum + parsearPrecio(item.precio), 0);
  const textoBusqueda = busqueda.trim().toLowerCase();

  const cargarCatalogo = async () => {
    const data = await getCatalogo();
    setProductos(data.productos);
    setPromos(data.promos);
    setCargando(false);
  };

  useEffect(() => {
    const carritoGuardado = localStorage.getItem("goodStyleCarrito");
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }

    setCarritoCargado(true);
    cargarCatalogo();

    const intervalo = window.setInterval(cargarCatalogo, 30000);
    const recargarSiVuelve = () => {
      if (document.visibilityState === "visible") {
        cargarCatalogo();
      }
    };

    document.addEventListener("visibilitychange", recargarSiVuelve);

    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", recargarSiVuelve);
    };
  }, []);

  useEffect(() => {
    if (carritoCargado) {
      localStorage.setItem("goodStyleCarrito", JSON.stringify(carrito));
    }
  }, [carrito, carritoCargado]);

  const productosCategoriaActual = useMemo(() => {
    return productos.filter((producto) => {
      const coincideCategoria =
        categoriaSeleccionada === "Todos" || producto.categoria === categoriaSeleccionada;

      const textoProducto = [
        producto.nombre,
        producto.descripcion,
        producto.talles,
        producto.categoria,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const coincideBusqueda = textoBusqueda === "" || textoProducto.includes(textoBusqueda);

      return coincideCategoria && coincideBusqueda;
    });
  }, [categoriaSeleccionada, productos, textoBusqueda]);

  const tallesDisponibles = useMemo(() => {
    const talles = productosCategoriaActual.flatMap(obtenerTalles);

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
  }, [productosCategoriaActual]);

  const productosFiltrados = useMemo(() => {
    return productosCategoriaActual.filter((producto) => {
      const tallesProducto = obtenerTalles(producto);
      return talleSeleccionado === "Todos" || tallesProducto.includes(talleSeleccionado);
    });
  }, [productosCategoriaActual, talleSeleccionado]);

  const linkWhatsapp = `https://wa.me/5493786411223?text=${encodeURIComponent(
    "Hola Good Style!\n\n" +
      "Quiero comprar:\n\n" +
      carrito.map((item) => `- ${item.nombre} - ${item.precio}`).join("\n") +
      "\n\nTotal: $" +
      total.toLocaleString("es-AR") +
      "\n\nMetodo de entrega:\n" +
      "- Motomandado a domicilio\n" +
      "- Correo Argentino\n" +
      "- Via Cargo\n" +
      "- Retiro en local\n\n" +
      "Nombre:\n" +
      "Localidad:\n" +
      "Direccion (si corresponde):"
  )}`;

  const categoriasDestacadas = [
    {
      nombre: "Jeans",
      label: "Jeans",
      imagen: productos.find((item) => item.categoria === "Jeans" && item.imagen)?.imagen || "/productos/jeans-recto-black.jpeg",
    },
    {
      nombre: "Remeras",
      label: "Remeras",
      imagen: productos.find((item) => item.categoria === "Remeras" && item.imagen)?.imagen || "/productos/remera-boxy-fresh.jpeg",
    },
    {
      nombre: "Buzos",
      label: "Buzos",
      imagen: productos.find((item) => item.categoria === "Buzos" && item.imagen)?.imagen || "/productos/buzo-boxy-total-black.jpeg",
    },
    {
      nombre: "Accesorios",
      label: "Accesorios",
      imagen: productos.find((item) => item.categoria === "Accesorios" && item.imagen)?.imagen || "/productos/reloj-digital-1.jpeg",
    },
    {
      nombre: "Zapatillas",
      label: "Zapatillas",
      imagen: productos.find((item) => item.categoria === "Zapatillas" && item.imagen)?.imagen || "/productos sneakers/nike-sb-panda-1.jpeg",
    },
  ];

  return (
    <main className="page">
      <header className="heroHeader">
        <div className="heroContent">
          <div className="heroVisual">
            <Image
              className="brandLogo"
              src="/logo-good-style.jpeg"
              alt="Good Style"
              width={500}
              height={200}
              priority
            />
          </div>

          <div className="heroCopy">
            <h1>Calidad y estilo al mejor precio.</h1>
            <p className="heroSubtitle">
              Streetwear urbano, jeans, prendas oversize y accesorios seleccionados para destacar con identidad propia.
            </p>
          </div>
        </div>
      </header>

      <div className="promoStack">
        {promos.filter((promo) => promo.activa).map((promo) => (
          <div key={promo.id} className="promoCard">
            <strong>{promo.titulo}</strong>
            {promo.texto && <span>{promo.texto}</span>}
            <span className="promoPercent">{promo.descuento}% de descuento</span>
          </div>
        ))}
      </div>

      <section className="cartCard">
        <div className="cartHeader">
          <h2>Tu pedido ({carrito.length})</h2>
          <span>{carrito.length > 0 ? `${carrito.length} prendas` : "Vacio por ahora"}</span>
        </div>

        {carrito.length === 0 ? (
          <p className="cartEmpty">Agrega productos para armar tu pedido.</p>
        ) : (
          <>
            <div className="cartItems">
              {carrito.map((item, index) => (
                <div key={`${item.id}-${index}`} className="cartItem">
                  <span>{item.nombre} - {item.precio}</span>
                  <button onClick={() => setCarrito(carrito.filter((_, i) => i !== index))}>Eliminar</button>
                </div>
              ))}
            </div>
            <p className="cartTotal">Total: ${total.toLocaleString("es-AR")}</p>
            <button onClick={() => setCarrito([])} className="cartClear">Vaciar pedido</button>
            <a href={linkWhatsapp} target="_blank" rel="noreferrer" className="cartWhatsApp">Finalizar pedido por WhatsApp</a>
          </>
        )}
      </section>

      <section id="categorias" className="categoriesSection">
        <div className="sectionHeader sectionHeaderWide">
          <div>
            <p className="eyebrow">Categorias principales</p>
            <h2>Explora nuestras categorias</h2>
          </div>
          <p className="sectionText">Encontra la prenda ideal para cada dia con una mirada simple y directa.</p>
        </div>
        <div className="categoryGrid">
          {categoriasDestacadas.map((categoria) => (
            <button
              key={categoria.nombre}
              className={`categoryCard ${categoriaSeleccionada === categoria.nombre ? "active" : ""}`}
              onClick={() => {
                setCategoriaSeleccionada(categoria.nombre);
                setTalleSeleccionado("Todos");
                document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(18,18,18,0.78), rgba(18,18,18,0.35)), url(${categoria.imagen})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <span>{categoria.label}</span>
              <strong>Explorar</strong>
            </button>
          ))}
        </div>
      </section>

      <section id="catalogo" className="catalogSection">
        <div className="catalogTop">
          <div className="sectionHeader sectionHeaderWide">
            <div>
              <p className="eyebrow">Catalogo</p>
              <h2>Explora por categoria, talle y busqueda</h2>
            </div>
            <p className="sectionText">Encontra tu look ideal con filtros rapidos y una navegacion mas directa.</p>
          </div>
        </div>

        <div className="toolbar">
          {CATEGORIAS.map((categoria) => (
            <button
              key={categoria}
              className={`chip ${categoriaSeleccionada === categoria ? "active" : ""}`}
              onClick={() => {
                setCategoriaSeleccionada(categoria);
                setTalleSeleccionado("Todos");
              }}
            >
              {categoria}
            </button>
          ))}
        </div>

        <div className="searchWrap">
          <input
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar producto..."
            aria-label="Buscar producto"
          />
        </div>

        {categoriaSeleccionada !== "Todos" && (
          <div className="toolbar tallesToolbar">
            {tallesDisponibles.map((talle) => (
              <button
                key={talle}
                className={`chip sizeChip ${talleSeleccionado === talle ? "active" : ""}`}
                onClick={() => setTalleSeleccionado(talle)}
              >
                {talle === "Todos" ? "Todos los talles" : talle}
              </button>
            ))}
          </div>
        )}

        <div className="productGrid">
          {cargando ? (
            <div className="emptyState">Cargando productos...</div>
          ) : productosFiltrados.length === 0 ? (
            <div className="emptyState">No hay productos para ese filtro.</div>
          ) : (
            productosFiltrados.map((producto) => {
              const imagenes = obtenerImagenes(producto);
              const indiceImagen = imagenActual[producto.id] || 0;
              const imagen = imagenes[indiceImagen] || "/logo-good-style.jpeg";

              return (
                <article key={producto.id} className="productCard">
                  <div className="productImageWrap">
                    <img
                      src={imagen}
                      alt={producto.nombre}
                      onClick={() => setImagenGrande(imagen)}
                    />

                    {imagenes.length > 1 && (
                      <>
                        <button
                          onClick={() => {
                            setImagenActual({
                              ...imagenActual,
                              [producto.id]: (indiceImagen - 1 + imagenes.length) % imagenes.length,
                            });
                          }}
                          className="imageButton left"
                          aria-label="Imagen anterior"
                        >
                          {"<"}
                        </button>
                        <button
                          onClick={() => {
                            setImagenActual({
                              ...imagenActual,
                              [producto.id]: (indiceImagen + 1) % imagenes.length,
                            });
                          }}
                          className="imageButton right"
                          aria-label="Imagen siguiente"
                        >
                          {">"}
                        </button>
                      </>
                    )}
                  </div>

                  <div className="productBody">
                    <p className="productCategory">{producto.categoria}</p>
                    <h3>{producto.nombre}</h3>
                    <p className="productPrice">{producto.precio}</p>
                    {producto.descripcion && <p className="productDescription">{producto.descripcion}</p>}
                    {producto.talles && <p className="productSizes">Talles: {producto.talles}</p>}
                    <div className="productActions">
                      <button onClick={() => setCarrito((prev) => [...prev, producto])}>Agregar al carrito</button>
                      <a href={`https://wa.me/5493786411223?text=Hola,%20quiero%20comprar%20${encodeURIComponent(producto.nombre)}`} target="_blank" rel="noreferrer">Pedir por WhatsApp</a>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <footer className="footerSection">
        <div>
          <h3>Metodos de pago</h3>
          <p>Mercado Pago</p>
        </div>
        <div>
          <h3>Envios</h3>
          <p>Motomandado | Correo Argentino | Via Cargo</p>
        </div>
      </footer>

      {imagenGrande && (
        <div onClick={() => setImagenGrande(null)} className="modalOverlay">
          <img src={imagenGrande} alt="Imagen ampliada" />
        </div>
      )}

      <a href="https://wa.me/5493786411223" target="_blank" rel="noreferrer" className="waFab">Chat</a>
    </main>
  );
}
