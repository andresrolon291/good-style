"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getCatalogo } from "./productosStore";

const CATEGORIAS = [
  "Todos",
  "Jeans",
  "Buzos",
  "Remeras",
  "Accesorios",
  "Zapatillas",
];

const ORDEN_TALLES = [
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "44",
  "46",
];
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
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [imagenActual, setImagenActual] = useState({});
  const [imagenGrande, setImagenGrande] = useState(null);
  const [mostrarHistoria, setMostrarHistoria] = useState(false);
  const [historiaAbierta, setHistoriaAbierta] = useState(false);
  const [descripcionAbierta, setDescripcionAbierta] = useState({});
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
    const palabras = busqueda
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(
        (p) =>
          p &&
          ![
            "talle",
            "talles",
            "de",
            "para",
            "con",
            "el",
            "la",
            "los",
            "las",
            "un",
            "una",
            "quiero",
            "buscar"
          ].includes(p)
      );
  
    return productosCategoriaActual.filter((producto) => {
      const texto = `
      ${producto.nombre || ""}
      ${producto.categoria || ""}
      ${producto.descripcion || ""}
      ${obtenerTalles(producto).join(" ")}
      ${producto.contenido || ""}
    `.toLowerCase();
  
      const coincideBusqueda =
        palabras.length === 0 ||
        palabras.every((palabra) => texto.includes(palabra));
  
      const tallesProducto = obtenerTalles(producto);
      const coincideTalle =
        talleSeleccionado === "Todos" ||
        tallesProducto.includes(talleSeleccionado);
  
      return coincideBusqueda && coincideTalle;
    });
  }, [productosCategoriaActual, busqueda, talleSeleccionado]);
 
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
      imagen: productos.find((item) => item.categoria === "Zapatillas" && item.imagen)?.imagen || "vans-hylane-gris-39.jpeg",
    },
    {
      nombre: "Nuestra Historia",
      label: "Nuestra Historia",
      imagen: productos.find((item) => item.categoria === "Nuestra Historia" && item.imagen)?.imagen || "local-chido.jpeg",
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
          <h1
  style={{
    fontSize: "3rem",
    marginBottom: "15px",
  }}
>
  
</h1>

<p
  style={{
    color: "#555",
    lineHeight: "1.7",
    marginBottom: "25px",
  }}
> 
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

      <section id="categorias" className="categoriesSection">
        <div className="sectionHeader sectionHeaderWide">
          <div>
            <p className="eyebrow"></p>
            <h2></h2>
          </div>
          <p className="sectionText"></p>
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
              <strong></strong>
            </button>
          ))}
        </div>
      </section>

      <section id="catalogo" className="catalogSection">
        <div className="catalogTop">
          <div className="sectionHeader sectionHeaderWide">
            <div>
              <p className="eyebrow">Catalogo</p>
              <h2></h2>
            </div>
            <p className="sectionText"></p>
          </div>
        </div>


        <div className="searchWrap">
        <input
  type="text"
  placeholder="Buscar por nombre, talle, categoría, perfume, 100ml..."
  value={busqueda}
  onChange={(e) => setBusqueda(e.target.value)}
  className="searchInput"
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
{categoriaSeleccionada === "Nuestra Historia" ? (

<div
  style={{
    maxWidth: "950px",
    margin: "40px auto",
    background: "#fff",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 10px 30px rgba(0,0,0,.12)",
    lineHeight: "1.8",
  }}
>

<h2
  style={{
    textAlign: "center",
    fontSize: "30px",
    marginBottom: "20px",
  }}
>
Nuestra Historia
</h2>

<p
  style={{
    textAlign: "center",
    color: "#666",
    marginBottom: "50px",
    fontSize: "18px",
  }}
>
Conocé cómo nació Good Style y el camino que recorrimos hasta llegar a donde estamos hoy.
</p>

{/* ---------- IMAGEN 1 ---------- */}

<img
  src="inicios-good.jpeg"
  alt=""
  style={{
    width: "80%",
    borderRadius: "20px",
    marginBottom: "25px",
    srcAlign: "center",
  }}
/>

<h3 style={{ marginBottom: "15px" }}>
Los comienzos
</h3>

<p>
Good Style nació hace 4 años con un sueño, muchas ganas de salir adelante y pocos recursos.
</p>

<p>
Somos Andrés y Camila, dos mejores amigos que trabajaban todos los días, pero sabíamos que queríamos  construir algo propio. Empezamos vendiendo algunos buzos desde nuestro departamento, haciendo entregas a domicilio y apostando por un proyecto del que nadie nos aseguraba el éxito.
</p>

<p>
No teníamos un showroom, ni clientes fijos, ni siquiera tantos amigos a quienes venderles. Solo teníamos la convicción de intentarlo.
</p>

<p>
Con nuestros primeros ahorros hicimos un pedido a Buenos Aires. La emoción nos jugó una mala pasada y transferimos el dinero al alias equivocado. Era todo el dinero que teníamos. En ese momento sentimos que el sueño terminaba incluso antes de empezar. Pero apareció una persona que creyó en nosotros cuando nosotros mismos pensábamos que todo estaba perdido. Gracias a esa ayuda pudimos hacer nuestro primer pedido, devolver cada peso prestado y seguir adelante.
</p>

<p>
La ropa la teníamos que guardar en un bolso porque no contábamos con un lugar donde almacenarla, y aun así recibíamos a los clientes en el patio de nuestro departamento. Poco a poco comenzaron a llegar más personas, incluso desde barrios cada vez más lejanos, y entendimos que estábamos construyendo algo mucho más grande de lo que imaginábamos.
</p>

{/* ---------- IMAGEN 2 ---------- */}

<img
  src="primer-showrom.jpeg"
  alt=""
  style={{
    width: "80%",
    borderRadius: "20px",
    margin: "50px 0 25px",
  }}
/>

<h3 style={{ marginBottom: "30px" }}>
Primer showroom
</h3>

<p>
Con el tiempo llegó nuestro primer showroom, pero también aparecieron los desafíos. La competencia crecía, las ventas bajaban y todavía sentíamos que nos faltaba encontrar nuestra verdadera identidad.

</p>

<p>
Hasta que nació Good Style.
</p>

<p>
Encontramos el estilo que queríamos ofrecer: ropa urbana masculina, zapatillas y accesorios seleccionados con el mismo cuidado con el que elegimos cada paso de este camino.
</p>

<p>
Cuando apareció la oportunidad de abrir un local, decidimos volver a arriesgarnos. Andrés dejó su trabajo para dedicarse por completo al negocio. Lo que parecía una prueba de un mes terminó convirtiéndose en nuestro presente. Meses después, Camila también renunció para apostar todo por este sueño.
</p>

<img
  src="/historia3.jpeg"
  alt="Good Style Hoy"
  style={{
    width: "80%",
    borderRadius: "20px",
    margin: "50px 0 25px",
    imgAlign: "center",
  }}
/>

<h3 style={{ marginBottom: "30px" }}>
Good Style hoy
</h3>

<p>
Hoy cada uno tiene un rol que disfruta. Andrés es quien ves en los videos, quien te recibe en el local y elige las zapatillas y los accesorios. Camila está detrás de cada fotografía, cada diseño, cada contenido y de la selección de las prendas. Somos socios, mejores amigos y compartimos la misma visión desde el primer día.
</p>

<p>
Nuestro camino no siempre fue fácil. Cambiamos de local, enfrentamos momentos de incertidumbre y volvimos a empezar más de una vez. Pero nunca perdimos las ganas ni la fe. Creemos que Dios guía cada paso y que el esfuerzo, la constancia y el sacrificio siempre encuentran su recompensa.
</p>

<p>
Todavía nos emociona pensar que muchos de nuestros clientes nos acompañan desde aquella época en la que atendíamos en el patio de un departamento y preparábamos pedidos hasta la madrugada.
</p>

<p>
Hoy esa historia continúa en esta página web.
</p>

<p
  style={{
    marginTop: "30px",
    fontSize: "18px",
    fontWeight: "600",
    textAlign: "center",
    color: "#2f8f46",
  }}
>
Gracias por formar parte de Good Style. Cada compra no solo apoya un negocio; también acompaña el sueño de dos personas que un día decidieron animarse a empezar.
</p>

<p
  style={{
    marginTop: "20px",
    textAlign: "center",
    fontWeight: "bold",
    color: "#2f8f46",
  }}
>
Porque Good Style nunca fue solo un local de ropa. Siempre fue la historia de dos personas que eligieron creer en un sueño y que, gracias a ustedes, hoy pueden seguir viviéndolo.” ❤️❤️❤️
</p>

</div>

) : ( 
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
                    {producto.descripcion && (
  <>
    <p className="productDescription">
      {descripcionAbierta[producto.id]
        ? producto.descripcion
        : producto.descripcion.slice(0, 100)}

      {!descripcionAbierta[producto.id] &&
        producto.descripcion.length > 100 &&
        "..."}
    </p>

    {producto.descripcion.length > 100 && (
      <button
        onClick={() =>
          setDescripcionAbierta({
            ...descripcionAbierta,
            [producto.id]: !descripcionAbierta[producto.id],
          })
        }
        style={{
          background: "none",
          border: "none",
          color: "#2f8f46",
          cursor: "pointer",
          fontWeight: "bold",
          padding: 0,
          marginBottom: "10px",
        }}
      >
        {descripcionAbierta[producto.id]
          ? "Ver menos"
          : "Ver más"}
      </button>
    )}
  </>
)}
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
        )}
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
    {historiaAbierta && (
  <div
    onClick={() => setHistoriaAbierta(false)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 99999,
      padding: "30px",
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "white",
        maxWidth: "900px",
        width: "100%",
        maxHeight: "90vh",
        overflowY: "auto",
        borderRadius: "20px",
        padding: "30px",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Nuestra Historia</h2>

      {/* Imagen 1 */}
      <div>📷 ACÁ VA LA IMAGEN 1</div>

      <h3>Los comienzos</h3>

      <p>Good Style nació hace más de 4 años...</p>
      <p>Somos Andrés y Camila...</p>
      <p>No teníamos un showroom...</p>

      {/* Imagen 2 */}
      <div>📷 ACÁ VA LA IMAGEN 2</div>

      <h3>Primer showroom</h3>

      <p>Con nuestros primeros ahorros...</p>
      <p>La ropa la teníamos que guardar...</p>
      <p>Con el tiempo llegó nuestro primer showroom...</p>

      {/* Imagen 3 */}
      <div>📷 ACÁ VA LA IMAGEN 3</div>

      <h3>Good Style hoy</h3>

      <p>Cuando apareció la oportunidad de abrir un local...</p>
      <p>Hoy cada uno tiene un rol que disfruta...</p>
      <p>Nuestro camino no siempre fue fácil...</p>
      <p>Todavía nos emociona pensar...</p>
      <p>Hoy esa historia continúa en esta página web.</p>

      <p>
        <strong>
          Gracias por formar parte de Good Style. Cada compra no solo apoya un
          negocio; también acompaña el sueño de dos personas que un día decidieron
          animarse a empezar.
        </strong>
      </p>

      <button
        onClick={() => setHistoriaAbierta(false)}
        style={{
          marginTop: "30px",
          width: "100%",
          padding: "15px",
          background: "#111",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        Cerrar
      </button>

    </div>
  </div>
)}
<button
  onClick={() => setCarritoAbierto((prev) => !prev)}
></button>
<button
    onClick={() => setCarritoAbierto((prev) => !prev)}
    style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,

        display: "flex",
        alignItems: "center",
        gap: "10px",

        padding: "12px 18px",

        background: "#111",
        color: "white",

        border: "none",
        borderRadius: "999px",

        cursor: "pointer",

        boxShadow: "0 8px 25px rgba(0,0,0,.25)",
        fontWeight: "600",
    }}
>
    🛒

    {carrito.length === 0
        ? "Carrito vacío"
        : `Carrito (${carrito.length})`}
</button>
{carritoAbierto && (
  <div
    style={{
      position: "fixed",
      top: "80px",
      right: "20px",
      width: "350px",
      maxHeight: "80vh",
      overflowY: "auto",
      background: "white",
      padding: "20px",
      borderRadius: "15px",
      boxShadow: "0 10px 30px rgba(0,0,0,.25)",
      zIndex: 9999,
    }}
  >
    <h2>Mi carrito</h2>

    {carrito.length === 0 ? (
      <p>Tu carrito está vacío.</p>
    ) : (
      <>
       {carrito.map((producto, index) => (
  <div
    key={index}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "15px",
      borderBottom: "1px solid #ddd",
      paddingBottom: "10px",
    }}
  >
    <div>
      <strong>{producto.nombre}</strong>
      <br />
      {producto.precio}
    </div>

    <button
      onClick={() =>
        setCarrito(carrito.filter((_, i) => i !== index))
      }
      style={{
        background: "#ff4d4d",
        color: "white",
        border: "none",
        width: "35px",
        height: "35px",
        borderRadius: "50%",
        cursor: "pointer",
        fontSize: "18px",
        fontWeight: "bold",
      }}
    >
      ✕
    </button>
  </div>
))}

        <h3>Total: ${total.toLocaleString("es-AR")}</h3>

        <a
          href={linkWhatsapp}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            background: "#25D366",
            color: "white",
            padding: "12px",
            borderRadius: "10px",
            textDecoration: "none",
            fontWeight: "bold",
            marginTop: "15px",
          }}
        >
          Finalizar compra por WhatsApp
        </a>
      </>
    )}
  </div>
)}
      <a href="https://wa.me/5493786411223" target="_blank" rel="noreferrer" className="waFab">Chat</a>
    </main>
  );
}
