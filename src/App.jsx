import { useState } from 'react';
import './App.css';

function App() {
  const productos = [
    { id: 'T01', nombre: 'Toallón', colores: 'Negro, Beige, Crudo, Blanco', imagen: 'img/toallon.jpeg', categoria: 'Baño', etiqueta: 'Más vendido' },
    { id: 'P01', nombre: 'Pareo', colores: 'Marrón, Negro, Blanco', imagen: 'img/pareo.jpeg', categoria: 'Playa' },
    { id: 'V01', nombre: 'Vincha', colores: 'Blanco, Crudo, Lila, Marrón, Rosa', imagen: 'img/vincha.jpeg', categoria: 'Spa', etiqueta: 'Últimos' },
    { id: 'B01', nombre: 'Babero', colores: 'Negro, Blanco', imagen: 'img/babero.jpeg', categoria: 'Bebés' },
    { id: 'T05', nombre: 'Toalla de mano', colores: 'Blanco, Gris, Rosa, Beige', imagen: 'img/toallita.jpg', categoria: 'Baño' }
  ];

  const categorias = ['Todos', 'Baño', 'Spa', 'Playa', 'Bebés'];

  // Estados del Carrito y Filtros
  const [filtro, setFiltro] = useState('Todos');
  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  // NUEVOS: Estados para el Simulador
  const [productoSimulando, setProductoSimulando] = useState(null);
  const [textoBordado, setTextoBordado] = useState('');
  const [fuenteBordado, setFuenteBordado] = useState("'Dancing Script', cursive");
  const [colorHilo, setColorHilo] = useState('#D4AF37'); // Dorado por defecto

  // Lógica del Carrito
  const agregarAlCarrito = (producto, detallesBordado = null) => {
    // Si tiene bordado personalizado, lo guardamos como un item único generando un ID especial
    if (detallesBordado) {
      const itemPersonalizado = {
        ...producto,
        id: `${producto.id}-${Date.now()}`, // ID único para que no se agrupe con los comunes
        cantidad: 1,
        bordado: detallesBordado
      };
      setCarrito([...carrito, itemPersonalizado]);
      setProductoSimulando(null); // Cerramos el simulador
      setTextoBordado(''); // Limpiamos el texto para el próximo
    } else {
      // Lógica normal para productos sin personalizar
      const productoExistente = carrito.find(item => item.id === producto.id && !item.bordado);
      if (productoExistente) {
        setCarrito(carrito.map(item => 
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        ));
      } else {
        setCarrito([...carrito, { ...producto, cantidad: 1 }]);
      }
    }
  };

  const enviarPedido = () => {
    const numero = "5491139061535";
    let textoPedido = "¡Hola Dolly Regalos! Me gustaría encargar el siguiente pedido:\n\n";
    
    carrito.forEach(item => {
      textoPedido += `• ${item.cantidad}x ${item.nombre}\n`;
      if (item.bordado) {
        textoPedido += `  ↳ Bordado: "${item.bordado.texto}" | Letra: ${item.bordado.fuente === "'Dancing Script', cursive" ? 'Cursiva' : 'Imprenta'} | Hilo: ${item.bordado.colorNombre}\n`;
      }
    });

    textoPedido += "\n¿Me podrían confirmar el presupuesto?";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(textoPedido)}`;
    window.open(url, '_blank');
    setMostrarCarrito(false);
    setCarrito([]);
  };

  const productosFiltrados = productos.filter(p => filtro === 'Todos' || p.categoria === filtro);
  const totalArticulos = carrito.reduce((total, item) => total + item.cantidad, 0);

  // Opciones de colores de hilo para el simulador
  const opcionesHilos = [
    { codigo: '#D4AF37', nombre: 'Dorado' },
    { codigo: '#C0C0C0', nombre: 'Plateado' },
    { codigo: '#000000', nombre: 'Negro' },
    { codigo: '#FF69B4', nombre: 'Rosa' },
    { codigo: '#FFFFFF', nombre: 'Blanco' }
  ];

  return (
    <div className="main-wrapper">
      <header className="header">
        <div className="logo-container">
          <img src="img/logo.png" alt="Dolly Regalos Logo" className="logo-img" />
        </div>
        <h1 className="header-title">Dolly Regalos</h1>
        <h2 className="header-subtitle">Bordados Personalizados</h2>
        <p className="header-description">Elegí tus productos, diseñá tu bordado en vivo y armá tu pedido.</p>
      </header>
      
      <main className="catalogo-container">
        <div className="filtros-container">
          {categorias.map(cat => (
            <button key={cat} className={`btn-filtro ${filtro === cat ? 'activo' : ''}`} onClick={() => setFiltro(cat)}>
              {cat}
            </button>
          ))}
        </div>

        <section>
          <div className="titulo-seccion-container">
            <h3 className="titulo-seccion">Catálogo: {filtro}</h3>
          </div>
          
          <div className="grid-productos">
            {productosFiltrados.map((producto) => (
              <div key={producto.id} className="card">
                <div className="card-img-container">
                  {producto.etiqueta && <span className="badge">{producto.etiqueta}</span>}
                  <img src={producto.imagen} alt={producto.nombre} className="card-img" />
                </div>
                <div className="card-info">
                  <h4>{producto.nombre}</h4>
                  <p className="categoria-tag">{producto.categoria}</p>
                  
                  <div className="botones-card">
                    {/* Botón estrella: Abre el simulador */}
                    <button className="btn-simular" onClick={() => setProductoSimulando(producto)}>
                      ✨ Personalizar Bordado
                    </button>
                    {/* Botón secundario: Agrega liso, sin bordado */}
                    <button className="btn-agregar-simple" onClick={() => agregarAlCarrito(producto)}>
                      Llevar liso (sin bordar)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* MODAL DEL SIMULADOR DE BORDADO */}
      {productoSimulando && (
        <div className="modal-fondo">
          <div className="modal-contenido">
            <h3>Diseñá tu {productoSimulando.nombre}</h3>
            
            {/* Pantalla interactiva */}
            <div className="simulador-preview">
              <img src={productoSimulando.imagen} alt="Preview" className="simulador-img" />
              <div 
                className="simulador-texto-flotante"
                style={{ fontFamily: fuenteBordado, color: colorHilo }}
              >
                {textoBordado || 'Tu Nombre'}
              </div>
            </div>

            {/* Controles del usuario */}
            <div className="simulador-controles">
              <div className="control-grupo">
                <label>¿Qué le bordamos?</label>
                <input 
                  type="text" 
                  className="control-input" 
                  placeholder="Ej: Bauti, Feliz Día, etc." 
                  value={textoBordado}
                  onChange={(e) => setTextoBordado(e.target.value)}
                  maxLength={15}
                />
              </div>

              <div className="control-grupo">
                <label>Tipo de Letra</label>
                <select 
                  className="control-select"
                  value={fuenteBordado}
                  onChange={(e) => setFuenteBordado(e.target.value)}
                >
                  <option value="'Dancing Script', cursive">Cursiva (Elegante)</option>
                  <option value="'Montserrat', sans-serif">Imprenta (Moderna)</option>
                </select>
              </div>

              <div className="control-grupo">
                <label>Color del Hilo</label>
                <div className="hilos-container">
                  {opcionesHilos.map(hilo => (
                    <button
                      key={hilo.codigo}
                      className={`btn-hilo ${colorHilo === hilo.codigo ? 'seleccionado' : ''}`}
                      style={{ backgroundColor: hilo.codigo }}
                      title={hilo.nombre}
                      onClick={() => setColorHilo(hilo.codigo)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-botones">
              <button 
                className="btn-simular" 
                onClick={() => agregarAlCarrito(productoSimulando, { 
                  texto: textoBordado || 'Sin texto', 
                  fuente: fuenteBordado, 
                  colorNombre: opcionesHilos.find(h => h.codigo === colorHilo).nombre 
                })}
              >
                Sumar al pedido con este diseño
              </button>
              <button className="btn-cerrar" onClick={() => setProductoSimulando(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTÓN FLOTANTE Y MODAL DEL CARRITO (Igual que antes) */}
      {totalArticulos > 0 && (
        <button className="btn-flotante" onClick={() => setMostrarCarrito(true)}>
          🛒 Ver mi pedido ({totalArticulos})
        </button>
      )}

      {mostrarCarrito && (
        <div className="modal-fondo">
          <div className="modal-contenido">
            <h3>Tu Pedido</h3>
            <div className="lista-carrito">
              {carrito.map((item, index) => (
                <div key={index} className="item-carrito">
                  <span>{item.cantidad}x {item.nombre}</span>
                  {item.bordado && (
                    <div style={{ fontSize: '0.85rem', color: '#666', marginLeft: '20px' }}>
                      ↳ Bordado: "{item.bordado.texto}" ({item.bordado.colorNombre})
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="modal-botones">
              <button className="btn-whatsapp" onClick={enviarPedido}>Enviar pedido por WhatsApp</button>
              <button className="btn-cerrar" onClick={() => setMostrarCarrito(false)}>Seguir mirando</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;