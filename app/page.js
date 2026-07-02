"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getProductosPersistidos } from "./productosStore";
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

        const total = carrito.reduce(
            (acum, item) =>
                acum + Number(item.precio.replace("$", "").replace(".", "")),
            0
        );
    const productosConId = productos.map((producto, index) => ({
        ...producto,
        id: producto.id || index + 1,
    }));

    const textoBusqueda = busqueda.trim().toLowerCase();

    const productosCategoriaActual = productosConId.filter((producto) => {
        const coincideCategoria =
            categoriaSeleccionada === "Todos" ||
            producto.categoria === categoriaSeleccionada;

        const textoProducto = [
            producto.nombre,
            producto.descripcion,
            producto.talles,
            producto.categoria,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const coincideBusqueda =
            textoBusqueda === "" || textoProducto.includes(textoBusqueda);

        return coincideCategoria && coincideBusqueda;
    });

    const ordenTalles = ["S", "M", "L", "XL", "XXL", "38", "40", "42", "44", "46"];
    const tallesDisponibles = [
        "Todos",
        ...[...new Set(
            productosCategoriaActual
                .flatMap((producto) =>
                    producto.talles
                        ? producto.talles.split(",").map((talle) => talle.trim().toUpperCase())
                        : []
                )
                .filter(Boolean)
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

    const productosFiltrados = productosCategoriaActual.filter((producto) => {
        const tallesProducto = producto.talles
            ? producto.talles.split(",").map((talle) => talle.trim().toUpperCase())
            : [];

        return (
            talleSeleccionado === "Todos" || tallesProducto.includes(talleSeleccionado)
        );
    });

    useEffect(() => {
        const carritoGuardado = localStorage.getItem("goodStyleCarrito");

        if (carritoGuardado) {
            setCarrito(JSON.parse(carritoGuardado));
        }

        setProductos(getProductosPersistidos());

        const promosGuardadas = localStorage.getItem("goodStylePromos");
        if (promosGuardadas) {
            setPromos(JSON.parse(promosGuardadas));
        }

        setCarritoCargado(true);
    }, []);

    useEffect(() => {
    const actualizar = () => {
        setProductos(getProductosPersistidos());
    };

    window.addEventListener("productosActualizados", actualizar);
    window.addEventListener("storage", actualizar);

    return () => {
        window.removeEventListener("productosActualizados", actualizar);
        window.removeEventListener("storage", actualizar);
    };
}, []);

    useEffect(() => {
        const manejarPromos = () => {
            const promosGuardadas = localStorage.getItem("goodStylePromos");
            if (promosGuardadas) {
                setPromos(JSON.parse(promosGuardadas));
            }
        };

        window.addEventListener("storage", manejarPromos);
        window.addEventListener("promosActualizadas", manejarPromos);
        return () => {
            window.removeEventListener("storage", manejarPromos);
            window.removeEventListener("promosActualizadas", manejarPromos);
        };
    }, []);

    useEffect(() => {
        if (carritoCargado) {
            localStorage.setItem("goodStyleCarrito", JSON.stringify(carrito));
        }
    }, [carrito, carritoCargado]);

    const linkWhatsapp = `https://wa.me/5493786411223?text=${encodeURIComponent(
        "Hola Good Style!\n\n" +
        "Quiero comprar:\n\n" +
        carrito.map(item => `- ${item.nombre} - ${item.precio}`).join("\n") +
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

    const productosDestacados = [...productosConId]
        .filter((producto) => producto.imagen)
        .slice(0, 4);

    const categoriasDestacadas = [
        {
            nombre: "Jeans",
            label: "Jeans",
            imagen: productosConId.find((item) => item.categoria === "Jeans" && item.imagen)?.imagen || "/productos/jeans-recto-black.jpeg",
        },
        {
            nombre: "Remeras",
            label: "Remeras",
            imagen: productosConId.find((item) => item.categoria === "Remeras" && item.imagen)?.imagen || "/productos/remera-boxy-fresh.jpeg",
        },
        {
            nombre: "Buzos",
            label: "Buzos",
            imagen: productosConId.find((item) => item.categoria === "Buzos" && item.imagen)?.imagen || "/productos/buzo-boxy-total-black.jpeg",
        },
        {
            nombre: "Accesorios",
            label: "Accesorios",
            imagen: productosConId.find((item) => item.categoria === "Accesorios" && item.imagen)?.imagen || "/productos/reloj-digital-1.jpeg",
        },
        {
    nombre: "Zapatillas",
    label: "Zapatillas",
    imagen: productosConId.find((item) => item.categoria === "Zapatillas" && item.imagen)?.imagen || "/productos sneakers/nike-sb-black.jpeg",
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
                        <span>{promo.texto}</span>
                        <span className="promoPercent">{promo.descuento}% de descuento</span>
                    </div>
                ))}
            </div>

            <section className="cartCard">
                <div className="cartHeader">
                    <h2>Tu pedido ({carrito.length})</h2>
                    <span>{carrito.length > 0 ? `${carrito.length} prendas` : "Vacío por ahora"}</span>
                </div>

                {carrito.length === 0 ? (
                    <p className="cartEmpty">Agrega productos para armar tu pedido.</p>
                ) : (
                    <>
                        <div className="cartItems">
                            {carrito.map((item, index) => (
                                <div key={index} className="cartItem">
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
                        <p className="eyebrow">Categorías principales</p>
                        <h2>Explorá nuestras categorías</h2>
                    </div>
                    <p className="sectionText">Encontrá la prenda ideal para cada día con una mirada simple y directa.</p>
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
                            <p className="eyebrow">Catálogo</p>
                            <h2>Explorá por categoría, talle y búsqueda</h2>
                        </div>
                        <p className="sectionText">Encontrá tu look ideal con filtros rápidos y una navegación más directa.</p>
                    </div>
                </div>

                <div className="toolbar">
                    {['Todos', 'Jeans', 'Buzos', 'Remeras', 'Accesorios', 'Zapatillas'].map((categoria) => (
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
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar producto..."
                        aria-label="Buscar producto"
                    />
                </div>

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

                <div className="productGrid">
                    {productosFiltrados.length === 0 ? (
                        <div className="emptyState">
                            No hay productos para ese talle en esta categoría.
                        </div>
                    ) : (
                        productosFiltrados.map((producto) => (
                            <article key={producto.id} className="productCard">
                                <div className="productImageWrap">
                                    <img
                                        src={[
                                            producto.imagen,
                                            producto.imagen2,
                                            producto.imagen3,
                                        ].filter(Boolean)[imagenActual[producto.id] || 0]}
                                        alt={producto.nombre}
                                        onClick={() => setImagenGrande([
                                            producto.imagen,
                                            producto.imagen2,
                                            producto.imagen3,
                                        ].filter(Boolean)[imagenActual[producto.id] || 0])}
                                    />

                                    {[producto.imagen2, producto.imagen3].filter(Boolean).length > 0 && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    const imagenes = [producto.imagen, producto.imagen2, producto.imagen3].filter(Boolean);
                                                    setImagenActual({
                                                        ...imagenActual,
                                                        [producto.id]: ((imagenActual[producto.id] || 0) - 1 + imagenes.length) % imagenes.length,
                                                    });
                                                }}
                                                className="imageButton left"
                                            >
                                                ◀
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const imagenes = [producto.imagen, producto.imagen2, producto.imagen3].filter(Boolean);
                                                    setImagenActual({
                                                        ...imagenActual,
                                                        [producto.id]: ((imagenActual[producto.id] || 0) + 1) % imagenes.length,
                                                    });
                                                }}
                                                className="imageButton right"
                                            >
                                                ▶
                                            </button>
                                        </>
                                    )}
                                </div>

                                <div className="productBody">
                                    <p className="productCategory">{producto.categoria}</p>
                                    <h3>{producto.nombre}</h3>
                                    <p className="productPrice">{producto.precio}</p>
                                    <p className="productDescription">{producto.descripcion}</p>
                                    {producto.talles && <p className="productSizes">Talles: {producto.talles}</p>}
                                    <div className="productActions">
                                        <button onClick={() => setCarrito((prev) => [...prev, producto])}>Agregar al carrito</button>
                                        <a href={`https://wa.me/5493786411223?text=Hola,%20quiero%20comprar%20${encodeURIComponent(producto.nombre)}`} target="_blank" rel="noreferrer">Pedir por WhatsApp</a>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </section>

            <footer className="footerSection">
                <div>
                    <h3>Métodos de pago</h3>
                    <p>Mercado Pago</p>
                </div>
                <div>
                    <h3>Envíos</h3>
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


