"use client";
import { useState } from "react";
import { productos } from "./productos";
import Image from "next/image";
export default function Home() {

    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
    const [carrito, setCarrito] = useState([]);
    const [imagenActual, setImagenActual] = useState({});
    const [imagenGrande, setImagenGrande] = useState(null);

        const total = carrito.reduce(
            (acum, item) =>
                acum + Number(item.precio.replace("$", "").replace(".", "")),
            0
        );

        const productosFiltrados =
            categoriaSeleccionada === "Todos"
                ? productos
                : productos.filter(
                    (producto) =>
                        producto.categoria === categoriaSeleccionada
                );

        return (
        <main style={{ background: "#ffffff", minHeight: "100vh", color: "#111", padding: "20px" }}>


            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <Image
                    src="/logo-good-style.jpeg"
                    alt="Good Style"
                    width={500}
                    height={200}
                    style={{
                        maxWidth: "100%",
                        height: "auto",
                    }}
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

                <p>
                    🚚 Motomandado a domicilio • 📮 Correo Argentino • 📦 Vía Cargo • 🏪 Retiro en local
                </p>
            </div>
            <p style={{ textAlign: "center", color: "#7cff7c" }}>

            </p>
            <div
                style={{
                    maxWidth: "600px",
                    margin: "20px auto",
                    padding: "20px",
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
                    🛒 Tu Pedido ({carrito.length})
                </h2>

                {carrito.length === 0 ? (
                    <p>No hay productos seleccionados</p>
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
                                    ❌
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
                    </>
                )}
            </div>
            <a
                href={`https://wa.me/5493786411223?text=${encodeURIComponent(
                    "Hola Good Style! 👋\n\n" +
                    "Quiero comprar:\n\n" +
                    carrito.map(item => `• ${item.nombre} - ${item.precio}`).join("\n") +
                    "\n\n💰 Total: $" +
                    total.toLocaleString("es-AR") +
                    "\n\n📦 Método de entrega:\n" +
                    "☐ Motomandado a domicilio\n" +
                    "☐ Correo Argentino\n" +
                    "☐ Vía Cargo\n" +
                    "☐ Retiro en local\n\n" +
                    "👤 Nombre:\n" +
                    "📍 Localidad:\n" +
                    "🏠 Dirección (si corresponde):"
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
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                    margin: "30px 0",
                }}
            >
                {["Todos", "Jeans", "Buzos", "Remeras", "Accesorios"].map((categoria) => (
                    <button
                        key={categoria}
                        onClick={() => setCategoriaSeleccionada(categoria)}
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
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "20px",
                    marginTop: "40px",
                }}
            >
                {productosFiltrados.map((producto) => (
                    <div
                        key={producto.nombre}
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
                                    ].filter(Boolean)[imagenActual[producto.nombre] || 0]
                                }
                                alt={producto.nombre}
                                onClick={() =>
                                    setImagenGrande(
                                        [
                                            producto.imagen,
                                            producto.imagen2,
                                            producto.imagen3,
                                        ].filter(Boolean)[imagenActual[producto.nombre] || 0]
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
                                                [producto.nombre]:
                                                    ((imagenActual[producto.nombre] || 0) - 1 + imagenes.length) %
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
                                                [producto.nombre]:
                                                    ((imagenActual[producto.nombre] || 0) + 1) %
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
                            onClick={() => setCarrito([...carrito, producto])}
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
            </div>

            <div style={{ marginTop: "50px", textAlign: "center" }}>
                <h3>Métodos de pago</h3>
                <p>Mercado Pago</p>

                <h3>Envíos</h3>
                <p>Motomandado • Correo Argentino • Vía Cargo</p>
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
                💬
            </a>
        </main>
    );
}