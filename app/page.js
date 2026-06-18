"use client";
import { useEffect, useState } from "react";
import { productos } from "./productos";
import Image from "next/image";
export default function Home() {

    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
    const [busqueda, setBusqueda] = useState("");
    const [talleSeleccionado, setTalleSeleccionado] = useState("Todos");
    const [carrito, setCarrito] = useState([]);
    const [carritoCargado, setCarritoCargado] = useState(false);
    const [imagenActual, setImagenActual] = useState({});
    const [imagenGrande, setImagenGrande] = useState(null);

        const total = carrito.reduce(
            (acum, item) =>
                acum + Number(item.precio.replace("$", "").replace(".", "")),
            0
        );
    const productosConId = productos.map((producto, index) => ({
        ...producto,
        id: index + 1,
    }));

    const textoBusqueda = busqueda.trim().toLowerCase();

    const ordenTalles = ["S", "M", "L", "XL", "XXL", "38", "40", "42", "44", "46"];
    const tallesDisponibles = [
        "Todos",
        ...[...new Set(
            productosConId
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

    const productosFiltrados = productosConId.filter((producto) => {
        const coincideCategoria =
            categoriaSeleccionada === "Todos" ||
            producto.categoria === categoriaSeleccionada;

        const tallesProducto = producto.talles
            ? producto.talles.split(",").map((talle) => talle.trim().toUpperCase())
            : [];

        const coincideTalle =
            talleSeleccionado === "Todos" || tallesProducto.includes(talleSeleccionado);

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

        return coincideCategoria && coincideTalle && coincideBusqueda;
    });

    useEffect(() => {
        const carritoGuardado = localStorage.getItem("goodStyleCarrito");

        if (carritoGuardado) {
            setCarrito(JSON.parse(carritoGuardado));
        }

        setCarritoCargado(true);
    }, []);

    useEffect(() => {
        if (carritoCargado) {
            localStorage.setItem("goodStyleCarrito", JSON.stringify(carrito));
        }
    }, [carrito, carritoCargado]);

        return (
        <main className="page">


            <div className="heroHeader">
                <Image
                    className="brandLogo"
                    src="/logo-good-style.jpeg"
                    alt="Good Style"
                    width={500}
                    height={200}
                />

                <p
                    style={{
                        color: "#2f8f46",
                        fontWeight: "600",
                        marginTop: "10px",
                    }}
                >
                    Streetwear urbano masculino
                </p>

                <p className="shippingInfo">
                    Motomandado a domicilio | Correo Argentino | Via Cargo | Retiro en local
                </p>
            </div>
            <p style={{ textAlign: "center", color: "#7cff7c" }}>

            </p>
            <div
                style={{
                    maxWidth: "600px",
                    margin: "20px auto",
                    padding: carrito.length === 0 ? "14px 16px" : "20px",
                    border: "2px solid #2f8f46",
                    borderRadius: "15px",
                    background: "#f8fff8",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
                }}
            >
                <h2
                    style={{
                        color: "#2f8f46",
                        marginBottom: "15px",
                    }}
                >
                    Tu Pedido ({carrito.length})
                </h2>

                {carrito.length === 0 ? (
                    <p style={{ margin: "8px 0 0", color: "#555" }}>
                        Agrega productos para armar tu pedido.
                    </p>
                ) : (
                    <>
                        {carrito.map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "5px",
                                }}
                            >
        <span>
            {item.nombre} - {item.precio}
        </span>

                                <button
                                    onClick={() =>
                                        setCarrito(carrito.filter((_, i) => i !== index))
                                    }
                                    style={{
                                        background: "#ff4d4d",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "5px",
                                        padding: "4px 8px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        ))}
                    <p
                    style={{
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    marginTop: "10px",
                    color: "#2f8f46",
                }}
                    >
                    Total: ${total.toLocaleString("es-AR")}
                    </p>
                    <button
                        onClick={() => setCarrito([])}
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "8px",
                            background: "#ffffff",
                            color: "#ff4d4d",
                            border: "1px solid #ff4d4d",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "700",
                        }}
                    >
                        Vaciar pedido
                    </button>
                    </>
                )}
            </div>
            {carrito.length > 0 && (
            <a
                href={`https://wa.me/5493786411223?text=${encodeURIComponent(
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
                )}`}
                target="_blank"
                style={{
                    display: "inline-block",
                    marginTop: "10px",
                    background: "#25D366",
                    color: "white",
                    padding: "10px 15px",
                    borderRadius: "8px",
                    textDecoration: "none",
                }}
            >
                Finalizar pedido por WhatsApp
            </a>
            )}
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 20,
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                    margin: "30px -20px 18px",
                    padding: "12px 20px",
                    background: "rgba(255,255,255,0.96)",
                    borderBottom: "1px solid #eeeeee",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
            >
                {["Todos", "Jeans", "Buzos", "Remeras", "Accesorios"].map((categoria) => (
                    <button
                        key={categoria}
                        onClick={() => {
                            setCategoriaSeleccionada(categoria);
                            setTalleSeleccionado("Todos");
                        }}
                        style={{
                            padding: "10px 15px",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            background:
                                categoriaSeleccionada === categoria
                                    ? "#2f8f46"
                                    : "#e5e5e5",
                            color:
                                categoriaSeleccionada === categoria
                                    ? "white"
                                    : "#111",
                            fontWeight: "bold",
                        }}
                    >
                        {categoria}
                    </button>
                ))}
            </div>
            <div
                style={{
                    maxWidth: "600px",
                    margin: "0 auto 25px",
                }}
            >
                <input
                    type="search"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar producto..."
                    aria-label="Buscar producto"
                    style={{
                        width: "100%",
                        padding: "14px 16px",
                        border: "2px solid #e5e5e5",
                        borderRadius: "12px",
                        fontSize: "16px",
                        outline: "none",
                        color: "#111",
                        background: "#ffffff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    }}
                />
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                    margin: "0 0 25px",
                }}
            >
                {tallesDisponibles.map((talle) => (
                    <button
                        key={talle}
                        onClick={() => {
                            setTalleSeleccionado(talle);
                            setCategoriaSeleccionada("Todos");
                        }}
                        style={{
                            padding: "8px 12px",
                            border: "none",
                            borderRadius: "999px",
                            cursor: "pointer",
                            background:
                                talleSeleccionado === talle
                                    ? "#111"
                                    : "#f0f0f0",
                            color:
                                talleSeleccionado === talle
                                    ? "white"
                                    : "#111",
                            fontWeight: "700",
                            fontSize: "0.9rem",
                        }}
                    >
                        {talle === "Todos" ? "Todos los talles" : talle}
                    </button>
                ))}
            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "20px",
                    marginTop: "40px",
                }}
            >
                {productosFiltrados.map((producto) => (
                    <div
                        key={producto.id}
                        style={{
                            background: "#ffffff",
                            boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
                            borderRadius: "15px",
                            padding: "15px",
                        }}
                    >
                        <div style={{ position: "relative" }}>
                            <img
                                src={
                                    [
                                        producto.imagen,
                                        producto.imagen2,
                                        producto.imagen3,
                                    ].filter(Boolean)[imagenActual[producto.id] || 0]
                                }
                                alt={producto.nombre}
                                onClick={() =>
                                    setImagenGrande(
                                        [
                                            producto.imagen,
                                            producto.imagen2,
                                            producto.imagen3,
                                        ].filter(Boolean)[imagenActual[producto.id] || 0]
                                    )
                                }
                                style={{
                                    width: "100%",
                                    height: "300px",
                                    objectFit: "cover",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                }}
                            />

                            {[producto.imagen2, producto.imagen3].filter(Boolean).length > 0 && (
                                <>
                                    <button
                                        onClick={() => {
                                            const imagenes = [
                                                producto.imagen,
                                                producto.imagen2,
                                                producto.imagen3,
                                            ].filter(Boolean);

                                            setImagenActual({
                                                ...imagenActual,
                                                [producto.id]:
                                                    ((imagenActual[producto.id] || 0) - 1 + imagenes.length) %
                                                    imagenes.length,
                                            });
                                        }}
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            left: "5px",
                                            transform: "translateY(-50%)",
                                            border: "none",
                                            borderRadius: "50%",
                                            width: "30px",
                                            height: "30px",
                                            cursor: "pointer",
                                            background: "rgba(0,0,0,0.5)",
                                            color: "white",
                                        }}
                                    >
                                        ◀
                                    </button>

                                    <button
                                        onClick={() => {
                                            const imagenes = [
                                                producto.imagen,
                                                producto.imagen2,
                                                producto.imagen3,
                                            ].filter(Boolean);

                                            setImagenActual({
                                                ...imagenActual,
                                                [producto.id]:
                                                    ((imagenActual[producto.id] || 0) + 1) %
                                                    imagenes.length,
                                            });
                                        }}
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            right: "5px",
                                            transform: "translateY(-50%)",
                                            border: "none",
                                            borderRadius: "50%",
                                            width: "30px",
                                            height: "30px",
                                            cursor: "pointer",
                                            background: "rgba(0,0,0,0.5)",
                                            color: "white",
                                        }}
                                    >
                                        ▶
                                    </button>
                                </>
                            )}
                        </div>

                        <h2>{producto.nombre}</h2>
                        <p
                            style={{
                                color: "#2f8f46",
                                fontWeight: "700",
                                fontSize: "1.1rem"
                            }}
                        >
                            {producto.precio}
                        </p>
                        <p
                            style={{
                                color: "#666",
                                fontSize: "0.9rem",
                                marginBottom: "10px",
                            }}
                        >
                            {producto.descripcion && (
                                <div
                                    style={{
                                        fontSize: "14px",
                                        color: "#666",
                                        marginTop: "8px",
                                        lineHeight: "1.4",
                                    }}
                                >
                                    {producto.descripcion}
                                    {producto.contenido && (
                                        <span>Contenido: {producto.contenido}</span>
                                    )}
                                </div>
                            )}
                            {producto.talles && (
                                <p>Talles: {producto.talles}</p>
                            )}
                        </p>
                        <button
                            onClick={() =>
                                setCarrito((prev) => [...prev, producto])
                            }
                            style={{
                                width: "100%",
                                padding: "10px",
                                marginBottom: "10px",
                                background: "#111",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                            }}
                        >
                            Agregar al carrito
                        </button>
                        <a
                            href={`https://wa.me/5493786411223?text=Hola,%20quiero%20comprar%20${encodeURIComponent(
                                producto.nombre
                            )}`}
                            target="_blank"
                            style={{
                                display: "block",
                                textAlign: "center",
                                background: "#25D366",
                                color: "white",
                                padding: "10px",
                                borderRadius: "8px",
                                textDecoration: "none",
                            }}
                        >
                            Pedir por WhatsApp
                        </a>
                    </div>
                ))}
                {productosFiltrados.length === 0 && (
                    <p
                        style={{
                            gridColumn: "1 / -1",
                            textAlign: "center",
                            color: "#666",
                            fontSize: "1rem",
                        }}
                    >
                        No encontramos productos con esa busqueda.
                    </p>
                )}
            </div>

            <div style={{ marginTop: "50px", textAlign: "center" }}>
                <h3>Metodos de pago</h3>
                <p>Mercado Pago</p>

                <h3>Envios</h3>
                <p>Motomandado | Correo Argentino | Via Cargo</p>
            </div>
            {imagenGrande && (
                <div
                    onClick={() => setImagenGrande(null)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.9)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                        cursor: "pointer",
                    }}
                >
                    <img
                        src={imagenGrande}
                        alt="Imagen ampliada"
                        style={{
                            maxWidth: "95%",
                            maxHeight: "95%",
                            objectFit: "contain",
                        }}
                    />
                </div>
            )}
            <a
                href="https://wa.me/5493786411223"
                target="_blank"
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "#25D366",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "30px",
                    textDecoration: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    zIndex: 999,
                }}
            >
                Chat
            </a>
        </main>
    );
}


