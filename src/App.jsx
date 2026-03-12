import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('Todos');
  
  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  // Estados del Simulador
  const [productoSimulando, setProductoSimulando] = useState(null);
  const [textoBordado, setTextoBordado] = useState('');
  const [fuenteBordado, setFuenteBordado] = useState("'Dancing Script', cursive");
  const [colorHilo, setColorHilo] = useState('#D4AF37');
  const [cantidadSimulador, setCantidadSimulador] = useState(1);
  const [colorProducto, setColorProducto] = useState('');
  
  // NUEVO: Estado para el logo subido por el cliente
  const [logoSubido, setLogoSubido] = useState(null);

  const categorias = ['Todos', 'Baño', 'Spa', 'Playa', 'Bebés'];

  // --- MOTOR DE CONEXIÓN A GOOGLE SHEETS ---
  useEffect(() => {
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/1ME2WLpb7ZGr-biEz7dGLb-v5HVGhRMsPtJYaJdq8c4g/export?format=csv&gid=0';

    fetch(sheetUrl)
      .then(res => res.text())
      .then(csvText => {
        try {
          const lineas = [];
          for (let line of csvText.split('\n')) {
            const cleanLine = line.replace('\r', '');
            if (!cleanLine.trim() || cleanLine.replace(/,/g, '').trim() === '') continue;
            
            let row = [], inQuotes = false, value = '';
            for (let char of cleanLine) {
              if (char === '"') inQuotes = !inQuotes;
              else if (char === ',' && !inQuotes) { row.push(value.trim()); value = ''; }
              else value += char;
            }
            row.push(value.trim());
            lineas.push(row);
          }

          if (lineas.length === 0) throw new Error("El excel está vacío");

          let headerRowIndex = 0;
          let headers = [];
          for (let i = 0; i < lineas.length; i++) {
             const rowLower = lineas[i].map(h => h.toLowerCase());
             if (rowLower.includes('articulo') || rowLower.includes('id')) {
               headerRowIndex = i;
               headers = rowLower;
               break;
             }
          }

          const idxArticulo = headers.indexOf('articulo');
          const idxID = headers.indexOf('id');
          const idxColor = headers.indexOf('color');
          const idxCantidad = headers.indexOf('cantidad');

          const productosAgrupados = {};

          const imagenes = {
            'T01': 'img/toallon.jpeg',
            'T02': 'img/toallon.jpeg',
            'T03': 'img/toallon.jpeg',
            'T04': 'img/toallita.jpg',
            'T05': 'img/toallita.jpg',
            'P01': 'img/pareo.jpeg',
            'V01': 'img/vincha.jpeg',
            'B01': 'img/babero.jpeg',
            'D01': 'img/babero.jpeg'
          };

          lineas.slice(headerRowIndex + 1).forEach(fila => {
            const id = fila[idxID];
            const nombre = fila[idxArticulo];
            const color = fila[idxColor];
            const stock = parseInt(fila[idxCantidad]) || 0;

            if (!id || !nombre) return;

            let categoria = 'Baño';
            if(nombre.toLowerCase().includes('pareo')) categoria = 'Playa';
            if(nombre.toLowerCase().includes('vincha')) categoria = 'Spa';
            if(nombre.toLowerCase().includes('babero') || nombre.toLowerCase().includes('delantal')) categoria = 'Bebés';

            if (!productosAgrupados[id]) {
              productosAgrupados[id] = {
                id, nombre, categoria,
                imagen: imagenes[id] || 'img/logo.png',
                coloresDisponibles: [],
                stockTotal: 0
              };
            }
            
            if(color && stock > 0) {
              productosAgrupados[id].coloresDisponibles.push(color);
              productosAgrupados[id].stockTotal += stock;
            }
          });

          const arrayFinal = Object.values(productosAgrupados).map(prod => {
            const coloresUnicos = [...new Set(prod.coloresDisponibles)];
            return {
              ...prod,
              coloresDisponibles: coloresUnicos,
              colores: coloresUnicos.join(', ') || 'Consultar',
              etiqueta: prod.stockTotal < 15 ? 'Poco stock' : ''
            };
          });

          setProductos(arrayFinal);
          setCargando(false);
        } catch (error) {
          console.error("Error procesando los datos:", error);
          setCargando(false);
        }
      })
      .catch(err => {
        console.error("Error de conexión:", err);
        setCargando(false);
      });
  }, []);

  // --- NUEVA LÓGICA: LEER EL ARCHIVO DEL LOGO ---
  const handleSubirLogo = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader(); // La magia de JS para leer archivos locales
      reader.onload = (evento) => {
        setLogoSubido(evento.target.result); // Guardamos la imagen en código base64
        setTextoBordado(''); // Borramos el texto para que no se pise con el logo
      };
      reader.readAsDataURL(file);
    }
  };

  const agregarAlCarrito = (producto, detallesBordado = null, cantidad = 1, colorElegido = 'A convenir') => {
    if (detallesBordado) {
      const itemPersonalizado = {
        ...producto,
        idCarrito: `${producto.id}-${Date.now()}`, 
        cantidad: cantidad,
        bordado: detallesBordado,
        colorElegido: colorElegido
      };
      setCarrito([...carrito, itemPersonalizado]);
      setProductoSimulando(null);
      setTextoBordado('');
      setLogoSubido(null); // Limpiamos el logo para el próximo
      setCantidadSimulador(1);
    } else {
      const idLiso = `${producto.id}-liso`;
      const existe = carrito.find(item => item.idCarrito === idLiso);
      if (existe) {
        setCarrito(carrito.map(item => 
          item.idCarrito === idLiso ? { ...item, cantidad: item.cantidad + cantidad } : item
        ));
      } else {
        setCarrito([...carrito, { ...producto, idCarrito: idLiso, cantidad: cantidad, colorElegido: 'A convenir' }]);
      }
    }
  };

  const modificarCantidad = (idCarrito, delta) => {
    setCarrito(carrito.map(item => {
      if (item.idCarrito === idCarrito) {
        const nuevaCant = item.cantidad + delta;
        return { ...item, cantidad: nuevaCant > 0 ? nuevaCant : 1 };
      }
      return item;
    }));
  };

  const eliminarDelCarrito = (idCarrito) => {
    const nuevoCarrito = carrito.filter(item => item.idCarrito !== idCarrito);
    setCarrito(nuevoCarrito);
    if (nuevoCarrito.length === 0) setMostrarCarrito(false); 
  };

  const enviarPedido = () => {
    const numero = "5491139061535";
    let textoPedido = "¡Hola Dolly Regalos! Me gustaría encargar el siguiente pedido:\n\n";
    
    carrito.forEach(item => {
      textoPedido += `• ${item.cantidad}x ${item.nombre} (Color: ${item.colorElegido})\n`;
      if (item.bordado) {
        if (item.bordado.tieneLogo) {
          textoPedido += `  ↳ Bordado: LOGO PERSONALIZADO (A continuación te adjunto la imagen del logo por acá)\n`;
        } else {
          textoPedido += `  ↳ Bordado: "${item.bordado.texto}" | Letra: ${item.bordado.fuente === "'Dancing Script', cursive" ? 'Cursiva' : 'Imprenta'} | Hilo: ${item.bordado.colorNombre}\n`;
        }
      }
    });

    textoPedido += "\n¿Me podrían confirmar el presupuesto?";
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(textoPedido)}`, '_blank');
    setMostrarCarrito(false);
    setCarrito([]);
  };

  const productosFiltrados = productos.filter(p => filtro === 'Todos' || p.categoria === filtro);
  const totalArticulos = carrito.reduce((total, item) => total + item.cantidad, 0);

  const opcionesHilos = [
    { codigo: '#D4AF37', nombre: 'Dorado' },
    { codigo: '#C0C0C0', nombre: 'Plateado' },
    { codigo: '#000000', nombre: 'Negro' },
    { codigo: '#FF69B4', nombre: 'Rosa' },
    { codigo: '#FFFFFF', nombre: 'Blanco' },
    { codigo: '#FF5733', nombre: 'Naranja Fuerte' }, 
    { codigo: '#8E44AD', nombre: 'Violeta Oscuro' },
    { codigo: '#1ABC9C', nombre: 'Verde Agua' }
  ];

  const abrirSimulador = (producto) => {
    setProductoSimulando(producto);
    setColorProducto(producto.coloresDisponibles[0] || 'Consultar');
    setLogoSubido(null);
  };

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
          
          {cargando ? (
            <div style={{textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: '#5CBEBF'}}>
              ⏳ Conectando con el taller de Dolly Regalos...
            </div>
          ) : (
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
                    <p style={{fontSize: '0.85rem'}}><strong>Colores en stock:</strong> {producto.colores}</p>
                    
                    <div className="botones-card">
                      <button className="btn-simular" onClick={() => abrirSimulador(producto)}>
                        ✨ Personalizar Bordado
                      </button>
                      <button className="btn-agregar-simple" onClick={() => agregarAlCarrito(producto, null, 1, 'A convenir')}>
                        Llevar liso (sin bordar)
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* SIMULADOR */}
      {productoSimulando && (
        <div className="modal-fondo">
          <div className="modal-contenido">
            <h3>Diseñá tu {productoSimulando.nombre}</h3>
            
            <div className="simulador-preview">
              <img src={productoSimulando.imagen} alt="Preview" className="simulador-img" />
              
              {/* MAGIA ACÁ: Mostramos el logo o el texto */}
              {logoSubido ? (
                <img src={logoSubido} alt="Logo Subido" className="simulador-logo-flotante" />
              ) : (
                <div className="simulador-texto-flotante" style={{ fontFamily: fuenteBordado, color: colorHilo }}>
                  {textoBordado || 'Tu Nombre'}
                </div>
              )}
            </div>

            <div className="simulador-controles">
              <div className="control-grupo">
                <label>Color del {productoSimulando.nombre}</label>
                <select className="control-select" value={colorProducto} onChange={(e) => setColorProducto(e.target.value)}>
                  {productoSimulando.coloresDisponibles.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                  {productoSimulando.coloresDisponibles.length === 0 && (
                    <option value="Consultar">Consultar stock</option>
                  )}
                </select>
              </div>

              {/* SECCIÓN DE LOGO PROPIO */}
              <div className="control-grupo" style={{ background: '#f0fafa', padding: '10px', borderRadius: '8px', border: '1px dashed #5CBEBF' }}>
                <label style={{ color: '#5CBEBF' }}>📷 ¿Querés bordar el logo de tu empresa?</label>
                <input type="file" accept="image/*" onChange={handleSubirLogo} className="control-input" style={{ fontSize: '0.85rem' }} />
                {logoSubido && (
                  <button className="btn-eliminar" style={{ marginTop: '5px' }} onClick={() => setLogoSubido(null)}>
                    Quitar logo y usar texto
                  </button>
                )}
              </div>

              {/* Controles de texto (se ocultan si hay un logo subido) */}
              {!logoSubido && (
                <>
                  <div className="control-grupo">
                    <label>¿Qué le bordamos? (Texto)</label>
                    <input type="text" className="control-input" placeholder="Ej: Bauti, Feliz Día, etc." value={textoBordado} onChange={(e) => setTextoBordado(e.target.value)} maxLength={15} />
                  </div>
                  
                  <div className="control-grupo">
                    <label>Tipo de Letra</label>
                    <select className="control-select" value={fuenteBordado} onChange={(e) => setFuenteBordado(e.target.value)}>
                      <option value="'Dancing Script', cursive">Cursiva (Elegante)</option>
                      <option value="'Montserrat', sans-serif">Imprenta (Moderna)</option>
                    </select>
                  </div>

                  <div className="control-grupo">
                    <label>Color del Hilo</label>
                    <div className="hilos-container">
                      {opcionesHilos.map(hilo => (
                        <button key={hilo.codigo} className={`btn-hilo ${colorHilo === hilo.codigo ? 'seleccionado' : ''}`} style={{ backgroundColor: hilo.codigo }} title={hilo.nombre} onClick={() => setColorHilo(hilo.codigo)} />
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              <div className="control-grupo" style={{marginTop: '10px'}}>
                <label>Cantidad de unidades iguales:</label>
                <input type="number" min="1" className="control-input" style={{width: '80px'}} value={cantidadSimulador} onChange={(e) => setCantidadSimulador(parseInt(e.target.value) || 1)} />
              </div>
            </div>

            <div className="modal-botones">
              <button className="btn-simular" onClick={() => agregarAlCarrito(productoSimulando, { 
                texto: logoSubido ? 'Logo Personalizado' : (textoBordado || 'Sin texto'), 
                tieneLogo: !!logoSubido, // Booleano para saber si lleva foto
                fuente: fuenteBordado, 
                colorNombre: logoSubido ? 'Varios' : opcionesHilos.find(h => h.codigo === colorHilo).nombre 
              }, cantidadSimulador, colorProducto)}>
                Sumar al pedido con este diseño
              </button>
              <button className="btn-cerrar" onClick={() => setProductoSimulando(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* CARRITO Y MODAL */}
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
              {carrito.map((item) => (
                <div key={item.idCarrito} className="item-carrito">
                  <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>
                    {item.nombre} <span style={{fontWeight: 'normal', fontSize: '0.9rem', color: '#666'}}>- Color: {item.colorElegido}</span>
                  </div>
                  
                  {item.bordado && (
                    <div style={{ fontSize: '0.85rem', color: item.bordado.tieneLogo ? '#5CBEBF' : '#666', marginBottom: '5px', fontWeight: item.bordado.tieneLogo ? 'bold' : 'normal' }}>
                      {item.bordado.tieneLogo ? '↳ Bordado: Logo Personalizado' : `↳ Bordado: "${item.bordado.texto}" (${item.bordado.colorNombre})`}
                    </div>
                  )}
                  
                  <div className="carrito-acciones">
                    <button className="btn-cantidad" onClick={() => modificarCantidad(item.idCarrito, -1)}>-</button>
                    <span style={{fontWeight: 'bold', width: '25px', textAlign: 'center'}}>{item.cantidad}</span>
                    <button className="btn-cantidad" onClick={() => modificarCantidad(item.idCarrito, 1)}>+</button>
                    <button className="btn-eliminar" onClick={() => eliminarDelCarrito(item.idCarrito)}>🗑️ Borrar</button>
                  </div>
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