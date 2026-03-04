import './App.css';

function App() {
  const productos = [
    { id: 'T01', nombre: 'Toallón', colores: 'Negro, Beige, Crudo, Blanco', imagen: '/img/toallon.jpeg' },
    { id: 'P01', nombre: 'Pareo', colores: 'Marrón, Negro, Blanco', imagen: '/img/pareo.jpeg' },
    { id: 'V01', nombre: 'Vincha', colores: 'Blanco, Crudo, Lila, Marrón, Rosa', imagen: '/img/vincha.jpeg' },
    { id: 'B01', nombre: 'Babero', colores: 'Negro, Blanco', imagen: '/img/babero.jpeg' },
    { id: 'T05', nombre: 'Toalla de mano', colores: 'Blanco, Gris, Rosa, Beige', imagen: '/img/toallita.jpg' }
  ];

  const abrirWhatsApp = (nombreProducto) => {
    const numero = "5491139061535"; 
    const mensaje = `¡Hola! Me interesa pedir información sobre el artículo: ${nombreProducto}. ¿Qué colores y opciones de bordado tienen?`;
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      <header className="header">
        <img src="/img/logo.png" alt="Dolly Regalos Logo" className="logo-img" />
        <h2>Bordados Personalizados</h2>
        <p>Toallas, toallones, delantales y más, con el diseño que vos elijas.</p>
      </header>
      
      <main className="catalogo-container">
        <section>
          <h3 className="titulo-seccion">Nuestro Catálogo</h3>
          
          <div className="grid-productos">
            {productos.map((producto) => (
              <div key={producto.id} className="card">
                <div className="card-img-container">
                  <img src={producto.imagen} alt={producto.nombre} className="card-img" />
                </div>
                
                <div className="card-info">
                  <h4>{producto.nombre}</h4>
                  <p><strong>Colores base:</strong> {producto.colores}</p>
                  <button 
                    className="btn-whatsapp"
                    onClick={() => abrirWhatsApp(producto.nombre)}
                  >
                    Consultar por WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;