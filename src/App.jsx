import { useState } from 'react';
import './App.css';

function App() {
  // 1. Agregamos la propiedad 'categoria' a cada producto
  const productos = [
    { id: 'T01', nombre: 'Toallón', colores: 'Negro, Beige, Crudo, Blanco', imagen: 'img/toallon.jpg', categoria: 'Baño' },
    { id: 'P01', nombre: 'Pareo', colores: 'Marrón, Negro, Blanco', imagen: 'img/pareo.jpg', categoria: 'Playa' },
    { id: 'V01', nombre: 'Vincha', colores: 'Blanco, Crudo, Lila, Marrón, Rosa', imagen: 'img/vincha.jpg', categoria: 'Spa' },
    { id: 'B01', nombre: 'Babero', colores: 'Negro, Blanco', imagen: 'img/babero.jpg', categoria: 'Bebés' },
    { id: 'T05', nombre: 'Toalla de mano', colores: 'Blanco, Gris, Rosa, Beige', imagen: 'img/toallita.jpg', categoria: 'Baño' }
  ];

  const categorias = ['Todos', 'Baño', 'Spa', 'Playa', 'Bebés'];

  // ESTADOS DE REACT (Para guardar información dinámica)
  const [filtro, setFiltro] = useState('Todos'); // Empieza mostrando "Todos"
  const [carrito, setCarrito] = useState([]);    // Empieza como una lista vacía
  const [mostrarCarrito, setMostrarCarrito] = useState(false); // Para abrir/cerrar el modal

  // FUNCIONES DEL CARRITO
  const agregarAlCarrito = (producto) => {
    // Nos fijamos si el producto ya está en el carrito
    const productoExistente = carrito.find(item => item.id === producto.id);
    
    if (productoExistente) {
      // Si está, le sumamos 1 a la cantidad
      setCarrito(carrito.map(item => 
        item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      // Si no está, lo agregamos con cantidad 1
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const vaciarCarrito = () => setCarrito([]);

  const enviarPedido = () => {
    const numero = "5491139061535";
    let textoPedido = "¡Hola Dolly Regalos! Me gustaría encargar el siguiente pedido:\n\n";
    
    // Armamos la lista de cosas
    carrito.forEach(item => {
      textoPedido += `• ${item.cantidad}x ${item.nombre}\n`;
    });

    textoPedido += "\n¿Me podrían pasar información sobre los colores y opciones de bordado disponibles?";
    
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(textoPedido)}`;
    window.open(url, '_blank');
    setMostrarCarrito(false);
    vaciarCarrito();
  };

  // Filtrar los productos según el botón seleccionado
  const productosFiltrados = productos.filter(p => filtro === 'Todos' || p.categoria === filtro);

  // Calcular la cantidad total de artículos en el carrito
  const totalArticulos = carrito.reduce((total, item) => total + item.cantidad, 0);

  return (
    <div className="main-wrapper">
      <header className="header">
        <div className="logo-container">
          <img src="img/logo.png" alt="Dolly Regalos Logo" className="logo-img" />
        </div>
        <h1 className="header-title">Dolly Regalos</h1>
        <h2 className="header-subtitle">Bordados Personalizados</h2>
        <p className="header-description">Elegí tus productos, sumalos al pedido y te armamos un presupuesto a medida.</p>
      </header>
      
      <main className="catalogo-container">
        
        {/* SECCIÓN DE FILTROS */}
        <div className="filtros-container">
          {categorias.map(cat => (
            <button 
              key={cat} 
              className={`btn-filtro ${filtro === cat ? 'activo' : ''}`}
              onClick={() => setFiltro(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* CATÁLOGO */}
        <section>
          <div className="titulo-seccion-container">
            <h3 className="titulo-seccion">Catálogo: {filtro}</h3>
          </div>
          
          <div className="grid-productos">
            {productosFiltrados.map((producto) => (
              <div key={producto.id} className="card">
                <div className="card-img-container">
                  <img src={producto.imagen} alt={producto.nombre} className="card-img" />
                </div>
                <div className="card-info">
                  <h4>{producto.nombre}</h4>
                  <p className="categoria-tag">{producto.categoria}</p>
                  <p><strong>Colores:</strong> {producto.colores}</p>
                  <button 
                    className="btn-agregar"
                    onClick={() => agregarAlCarrito(producto)}
                  >
                    + Agregar al pedido
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* BOTÓN FLOTANTE DEL CARRITO (Solo se muestra si hay cosas en el carrito) */}
      {totalArticulos > 0 && (
        <button className="btn-flotante" onClick={() => setMostrarCarrito(true)}>
          🛒 Ver mi pedido ({totalArticulos})
        </button>
      )}

      {/* MODAL / VENTANA DEL CARRITO */}
      {mostrarCarrito && (
        <div className="modal-fondo">
          <div className="modal-contenido">
            <h3>Tu Pedido</h3>
            <div className="lista-carrito">
              {carrito.map(item => (
                <div key={item.id} className="item-carrito">
                  <span>{item.cantidad}x {item.nombre}</span>
                </div>
              ))}
            </div>
            <div className="modal-botones">
              <button className="btn-whatsapp" onClick={enviarPedido}>
                Enviar pedido por WhatsApp
              </button>
              <button className="btn-cerrar" onClick={() => setMostrarCarrito(false)}>
                Seguir mirando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;