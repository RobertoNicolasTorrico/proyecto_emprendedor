import React, { Component } from 'react';

//Componentes utilizados en React Native
import { Image, TouchableOpacity, Alert, ActivityIndicator, FlatList, RefreshControl, SafeAreaView, ScrollView, Text, View, Modal } from 'react-native';
import { List, RadioButton, PaperProvider, TextInput } from 'react-native-paper';
import { Tab, TabView, Card, SearchBar } from '@rneui/themed';
import RNPickerSelect from 'react-native-picker-select';

//Biblioteca para almacenamiento asincrono de datos
import AsyncStorage from '@react-native-async-storage/async-storage';

//Componente para mostrar iconos
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

//Iconos especificos de FontAwesome
import { faMinus, faChevronRight, faStar, faMapLocationDot } from '@fortawesome/free-solid-svg-icons';

//Biblioteca para crear carruseles 
import Swiper from 'react-native-swiper';

//Componentes para reproducir videos  y ajustar el tamaño del video
import { Video, ResizeMode } from 'expo-av';

//Archivo de estilos
import { styles } from '../../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { formatPrecio, mostrarMensaje, formatearFecha, esImagen, renderPaginationButtons, obtenerCantNotificacionesSinLeer } from '../../../config/funciones.js';

//Configuracion de URL y otros parametros
import { config_define } from '../../../config/config_define.js';

//Módulo para realizar consultas a las APIs relacionadas
import api_publicacion from '../../../config/consultas_api/api_publicacion.js';
import api_seguidores_seguidos from '../../../config/consultas_api/api_seguidores_seguidos.js';
import api_producto from '../../../config/consultas_api/api_producto.js';
import api_emprendedor from '../../../config/consultas_api/api_emprendedor.js';



export class ScreenPerfilEmprendedor extends Component {
  constructor(props) {
    super(props);
    this.state = {

      //Identificador del usuario actual
      id_usuario: null,
      tipo_usuario: null,

      index: 0,//Indice para manejo de vistas de pestañas

      //Se obtiene datos del emprendedor a buscar
      id_usuario_emprendedor: this.props.route.params.id_usuario_emprendedor,
      nombre_emprendimiento: this.props.route.params.nombre_emprendimiento,

      mensajeErrorInicio: '',//Mensaje de error al obtener los datos iniciales

      /*Seccion Perfil*/
      detalles_perfil: [],//Lista de detalles del perfil del usuario 
      num_seguidores_perfil: 0,//Cantidad de usuarios  que lo siguen
      num_seguidos_perfil: 0,//Cantidad de emprendedores que sigue

      lista_categoria: [],//Lista de categorias de productos que se mostraran

      es_perfil_del_usuario: false,//Indica si es perfil del usuario
      lo_sigue: false,//Indica si sigue al emprendedor
      loading_inicio: false,//Indica el estado de cargar informacion del usuario



      //Filtro de busqueda de productos
      select_categoria: "0",
      select_estado: 'todos', //Indica el estado de los productos que se van a ver
      modalFiltroEstado: false, //Indica el estado del modal del filtro
      radio_ordenar_por: "1",
      precio_minimo: null,
      precio_maximo: null,
      input_calificacion: 'todos_calificacion',
      calificacion: "",


      //Busqueda predeterminada de producto
      busqueda_activa: false,
      search: "",


      /*Seccion Productos*/
      lista_productos: [],//Lista de productos que se mostraran
      pagina_actual_producto: 1,//Pagina actual de productos para la paginacion
      pagina: '',//Indicador que contiene en que pagina se encuentra el usuario y la cantidad de paginas que hay
      total_paginas: 0,//Indica la cantidad total de paginas para la paginacion
      cant_total_productos: 0,//Indica la cantidad total de productos
      mensajeProducto: '',//Mensaje de error al obtener los datos de productos
      refreshing_producto: false,//Indica el estado de actualizar toda la pestaña de productos
      loading_producto: false,//Indica el estado de cargar informacion de las productos


      /*Seccion Publicaciones*/
      videoRef: React.createRef(),//Referencia al componente de video
      lista_publicaciones: [], //Lista de publicaciones que se mostraran
      pagina_publicacion: 1, //Pagina actual de publicaciones para la paginacion
      mensajeAlertPublicacion: '', //Mensaje de error al obtener los datos de publicaciones
      cargar_mas_publicaciones: false, //Indica si se puede cargar mas publicaciones
      loading_publicacion: false, //Indica el estado de cargar informacion de las publicaciones
      refreshing_publicacion: false,//Indica el estado de actualizar toda la pestaña de publicaciones
      mensajePublicacion: '',//Mensaje de error al obtener los datos de la publicacion


    };

  }


  //Metodo llamado cuando el componente se monta
  async componentDidMount() {

    this.props.navigation.setOptions({
      title: this.state.nombre_emprendimiento,
    });

    //Se obtienen los datos de sesion almacenados en AsyncStorage
    const idUsuario = await AsyncStorage.getItem('idUsuario');
    const tipoUsuario = await AsyncStorage.getItem('tipoUsuario');

    //Se actualiza el estado con los datos de sesion
    this.setState({
      id_usuario: idUsuario,
      tipo_usuario: tipoUsuario
    }, () => {
      //Despues de actualizar el estado, se llaman a las funciones para obtener los detalles del perfil del usuario
      this.obtenerDatosPerfilEmprendedor();
    });

    //Agrega un listener para actualizar las notificaciones cuando la pantalla esta enfocada 
    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.handleRefresh();
    });

  };


  /*Seccion para los datos personales del emprendedor*/


  //Funcion para restablecer los datos del perfil del emprendedor ademas de restablecer la lista de productos y publicaciones
  handleRefresh = () => {

    //Reinicia la pagina de productos y publicaicones a 1 y establece el estado de refreshing_publicacion y refreshing_producto a verdadero
    //Despues se llama a la funcion para obtener todos los datos del perfil usuario emprendedor
    this.setState({
      pagina_actual_producto: 1,
      refreshing_producto: true,
      pagina_publicacion: 1,
      refreshing_publicacion: true
    }, () => {
      this.obtenerDatosPerfilEmprendedor();
    });
  };

  //Metodo para obtener los datos del perfil del emprendedor tambien obtener los productos y publicaciones del emprendedor
  obtenerDatosPerfilEmprendedor = async () => {
    const { id_usuario_emprendedor, id_usuario, tipo_usuario } = this.state;

    try {
      this.setState({ loading_inicio: true });
      const respuesta_perfil = await api_emprendedor.obtenerDetallesPerfilEmprendedor(id_usuario_emprendedor, id_usuario, tipo_usuario);
      this.setState({
        detalles_perfil: respuesta_perfil.usuario_emprendedor_perfil,
        num_seguidores_perfil: respuesta_perfil.usuario_emprendedor_perfil.cant_seguidores,
        num_seguidos_perfil: respuesta_perfil.usuario_emprendedor_perfil.cant_seguidor,
        lista_categoria: respuesta_perfil.categorias_producto,
        es_perfil_del_usuario: respuesta_perfil.es_perfil_del_usuario,
        lo_sigue: respuesta_perfil.lo_sigue,
      }, () => {
        this.obtenerProductosBuscadorDelPerfilEmprendedor();
        this.obtenerPublicacionesDelPerfilEmprendedor();
      });

    }
    catch (error) {
      this.setState({
        mensajeErrorInicio: error.message
      }, () => {
        Alert.alert("Aviso", error.message);
      });
    } finally {
      this.setState({ loading_inicio: false });

    }
  };



  /*Seccion para los productos del emprendedor*/

  //Metodo para obtener los productos del perfil del emprendedor
  obtenerProductosBuscadorDelPerfilEmprendedor = async () => {
    const { id_usuario, tipo_usuario, id_usuario_emprendedor, search, pagina_actual_producto, radio_ordenar_por, precio_minimo, precio_maximo, calificacion, select_categoria, select_estado } = this.state;

    try {

      //Actualiza el estado para cargar mas productos
      this.setState({ loading_producto: true, mensajeProducto: '', lista_productos: [] });

      //Se llama a la funcion que tiene la API para obtener los productos de los emprendedores del perfil del emprendedor
      const respuesta = await api_producto.obtenerProductosBuscadorDelPerfilEmprendedor(id_usuario_emprendedor, search, pagina_actual_producto, radio_ordenar_por, precio_minimo, precio_maximo, calificacion, select_categoria, select_estado);


      //Actualiza el estado de la lista de producto ademas de otros elementos necesarios para la interfaz
      this.setState({
        busqueda_activa: respuesta.busqueda_activa,
        lista_productos: respuesta.lista_productos,
        pagina: respuesta.pagina,
        total_paginas: respuesta.totalPaginas,
        cant_total_productos: respuesta.cant_total_productos
      });
    }
    catch (error) {

      //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
      this.setState({
        mensajeProducto: error.message
      }, () => {
        Alert.alert("Aviso", error.message);
      });
    } finally {

      //Finaliza el estado de carga y refresco de productos
      this.setState({ refreshing_producto: false, loading_producto: false });

      //Actualiza el numero de notificaciones en caso que el usuario halla iniciado sesion
      if (id_usuario && tipo_usuario) {
        obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
      }
    }
  };

  //Funcion para cambiar la pagina actual del producto
  cambiarPagina = (pagina) => {

    //Despues de actualizar el numero de pagina se llama a la funcion para obtener una lista productos
    this.setState({
      pagina_actual_producto: pagina
    }, () => {
      this.obtenerProductosBuscadorDelPerfilEmprendedor();
    });
  };

  //Actualiza el estado del componente del precio minimo
  handleChangeMinimo = (precio) => {
    this.setState({ input_precio_minimo: precio });
  };

  //Actualiza el estado del componente del precio maximo
  handleChangeMaximo = (tprecioext) => {
    this.setState({ input_precio_maximo: precio });
  };

  //Actualiza el estado del componente de la categoria del producto
  handleCategoriaChange = (nueva_categoria) => {
    //Establece la pagina a 1 ademas de cambiar la categoria a buscar del producto
    //Despues se llama a la funcion para obtener una lista de productos
    this.setState({
      pagina_actual_producto: 1,
      select_categoria: nueva_categoria
    }, () => {
      this.obtenerProductosBuscadorDelPerfilEmprendedor();
    });
  };

  //Actualiza el estado del componente del orden de los productos
  setChecked = (num_ordenar) => {
    //Establece la pagina a 1 ademas de cambiar el radio_ordenar_por por el nuevo valor
    //Despues se llama a la funcion para obtener una lista de productos
    this.setState({ pagina_actual_producto: 1, radio_ordenar_por: num_ordenar }, () => {
      this.obtenerProductosBuscadorDelPerfilEmprendedor();
    });
  };

  // Función para establecer la calificación seleccionada
  setCheckedCalificacion = (value) => {
    var nueva_calificacion;
    // Si el valor es num_calificacion se asigna 0 a la nueva calificación
    if (value === "num_calificacion") {
      nueva_calificacion = 0;
    } else {
      //se asigna el valor proporcionado
      nueva_calificacion = value;
    }

    // Actualiza el estado con la nueva calificación y establece la página a 1
    //Despues se llama a la funcion para obtener una lista de productos
    this.setState({
      input_calificacion: value,
      calificacion: nueva_calificacion,
      pagina_actual_producto: 1
    }, () => {
      this.obtenerProductosBuscadorDelPerfilEmprendedor();
    });
  };

  // Función para manejar el clic en una estrella de calificación
  handleStarClick = (index) => {
    const { calificacion } = this.state;
    var nueva_calificacion;
    //Se verifica si la calificación actual es igual al índice de la estrella clicada  se asigna 0 a la nueva calificación
    if (calificacion == index) {
      nueva_calificacion = 0;
    } else {
      // Se asigna el índice de la estrella clicada
      nueva_calificacion = index;
    }

    // Actualiza el estado con la nueva calificación y establece la página a 1
    //Despues se llama a la funcion para obtener una lista de productos
    this.setState({
      input_calificacion: 'num_calificacion',
      calificacion: nueva_calificacion,
      pagina_actual_producto: 1
    }, () => {
      this.obtenerProductosBuscadorDelPerfilEmprendedor();
    });
  };

  //Actualiza el estado del componente del texto de busqueda
  handleTextSearch = (texto) => {
    //Establece la pagina a 1 ademas de agregar el valor en el campo de busqueda
    //Despues se llama a la funcion para obtener una lista de productos
    this.setState({ search: texto, pagina_actual_producto: 1 }, () => {
      this.obtenerProductosBuscadorDelPerfilEmprendedor();
    });
  };

  //Actualiza el estado del componente del estado del producto
  handleEstadoChange = (nuevo_estado) => {
    //Establece la pagina a 1 ademas de cambiar el estado a buscar del producto
    //Despues se llama a la funcion para obtener una lista de productos
    this.setState({
      pagina_actual_producto: 1,
      select_estado: nuevo_estado
    }, () => {
      this.obtenerProductosBuscadorDelPerfilEmprendedor();
    });
  };

  //Funcion para restablecer los valores del filtro del modal
  restablecer_valores_modal() {

    //Restablece los valores del modal y tambien la pagina a 1
    //Despues se llama a la funcion para obtener una lista de productos
    this.setState({
      pagina_actual_producto: 1,
      radio_ordenar_por: "1",
      precio_minimo: null,
      precio_maximo: null,
      input_precio_minimo: null,
      input_precio_maximo: null,
      input_calificacion: "todos_calificacion",
      calificacion: "",
      select_categoria: 0,
      select_estado: 'todos',
    }, () => {
      this.obtenerProductosBuscadorDelPerfilEmprendedor();
    });
  };

  //Funcion para comprobar que los valores de los precios sean validos
  guardarValoresRangoPrecio = () => {
    const { input_precio_maximo, input_precio_minimo } = this.state;
    const min = parseInt(input_precio_minimo);
    const max = parseInt(input_precio_maximo);

    // Verifica que ambos valores sean números válidos
    if (!isNaN(min) && !isNaN(max)) {
      // Verifica que el mínimo no sea mayor que el máximo
      if (min <= max) {
        // Actualiza el estado con el nuevo precio minimo y maximo ademas establece la página a 1
        //Despues se llama a la funcion para obtener una lista de productos
        this.setState({
          pagina_actual_producto: 1,
          precio_minimo: min,
          precio_maximo: max
        }, () => {
          this.obtenerProductosBuscadorDelPerfilEmprendedor();
        });
      } else {
        // Muestra una alerta si el mínimo es mayor que el máximo
        Alert.alert('Error', 'El valor máximo debe ser mayor o igual al valor mínimo.');
      }
    } else {
      // Muestra una alerta si alguno de los campos no es un número válido
      Alert.alert('Error', 'Por complete los dos campos para buscar un producto por el rango de precio.');
    }
  };


  //Funcion que renderizar cada elemento de la lista de productos
  renderItemProducto = ({ item }) => {
    return (

      //Componente Card para mostrar la informacion del producto
      <Card key={item.detalles_producto.id_publicacion_producto}>

        {/*Componente View que contiene la informacion del emprendedor y cuando publico el producto */}
        <View style={{ width: "auto", flexDirection: 'row', height: 50, backgroundColor: '#EBEBEB' }}>

          {/*Componente View para mostrar la imagen del perfil del emprendedore sino tiene una se utiliza una predeterminada por el sistema*/}
          <View style={{ width: "20%", alignItems: "center", borderColor: "#cec8c8", borderWidth: 1 }}>
            <Image
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
              source={{
                uri: item.detalles_producto.foto_perfil_nombre
                  ? `${config_define.urlBase}/uploads/${item.detalles_producto.id_usuario_emprendedor}/foto_perfil/${item.detalles_producto.foto_perfil_nombre}`
                  : config_define.urlUbicacionImagenPerfilPredeterminada,
              }}
            />
          </View>
          {/*Componente View que contiene el nombre del emprendimiento y la fecha de publicacion del producto*/}
          <View style={{ width: "80%", marginStart: 10 }}>
            <Text style={styles.text_emprendimiento}>{item.detalles_producto.nombre_emprendimiento}</Text>
            <Text style={styles.text_fecha}>{formatearFecha(item.detalles_producto.fecha_publicacion)}</Text>
          </View>
        </View>

        {/*Separa la informacion del emprendedor del contenido del  producto*/}
        <Card.Divider />

        {/*Componente View que contiene las imagenes del producto*/}
        <View style={{ width: "100%", height: 200, alignItems: "center", borderColor: "#cec8c8", borderWidth: 1 }}>

          {/*Componente Swiper utlizado para mostrar las imagenes del producto  como un carrusel*/}
          <Swiper showsButtons={true} loop={false} showsPagination={false}>
            {item.archivos.map((imagen, index) => (
              <View key={index + "_" + imagen.nombre_archivo}>
                <Image style={{ width: "100%", height: "100%" }}
                  resizeMode="contain"
                  source={{ uri: `${config_define.urlBase}/uploads/${item.detalles_producto.id_usuario_emprendedor}/publicaciones_productos/${imagen.nombre_carpeta}/${imagen.nombre_archivo}` }} />
              </View>
            ))}
          </Swiper>
        </View>

        {/*Componente View que contiene la informacion del producto*/}
        <View>

          {/*Componente TouchableOpacity para navegar a los detalles del producto */}
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate("DetallesProducto", { id_producto: item.detalles_producto.id_publicacion_producto });
            }}
          >
            <Card.Title style={{ fontSize: 22 }}>{item.detalles_producto.nombre_producto}</Card.Title>
          </TouchableOpacity>

          {/*Informacion del estado del producto */}
          <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Estado:</Text> {item.detalles_producto.estado} </Text>


          {/*Informacion del precio del producto */}
          <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Precio:</Text>{formatPrecio(item.detalles_producto.precio)}</Text>

          {/*Informacion de la categoria del producto */}
          <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Categoria:</Text> {item.detalles_producto.nombre_categoria} </Text>

          {/*Informacion del stock del producto */}
          <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Stock:</Text> {item.detalles_producto.stock} </Text>

          {/*Componente View que contiene la calificacion del producto*/}
          <View style={styles.starsContainer}>
            <Text style={styles.caracteristica}>Calificación del producto</Text>

            {/*Verifica la calificacion del producto  */}
            {item.detalles_producto.calificacion === null ?
              (
                /*En caso que no tenga una calificacion va a mostrar el siguiente mensaje */
                < Text style={styles.tamanio_texto}>Este producto aún no tiene una calificación</Text>
              )
              :
              (
                /*Componente View que contiene las estrellas que tiene el producto*/
                < View style={styles.estrellas}>
                  {/*Se va a agregar estrellas dependiendo la cantidad maxima establecida en el sistema */}
                  {Array.from({ length: config_define.calificacion_max_producto }, (value, index) => (
                    <FontAwesomeIcon
                      key={index}
                      icon={faStar}
                      color={index < item.detalles_producto.calificacion ? '#ffd700' : '#dddddd'}
                      size={30}
                      style={{ marginRight: 2 }}
                    />
                  ))}
                </View>
              )
            }
          </View>
        </View>
      </Card >
    );
  };

  //Funcion para restablecer la lista de productos
  onRefreshProducto = () => {
    //Reinicia la pagina a 1 y establece el estado de refreshing_producto a verdadero
    //Despues se llama a la funcion para obtener una lista de productos
    this.setState({ refreshing_producto: true, pagina_producto: 1 }, () => {
      this.obtenerProductosBuscadorDelPerfilEmprendedor();
    });
  };


  /*Seccion para las publicaciones de informacion del emprendedor*/


  //Metodo para obtener las publicaciones del perfil del emprendedor
  obtenerPublicacionesDelPerfilEmprendedor = async () => {
    const { id_usuario, tipo_usuario, id_usuario_emprendedor, pagina_publicacion, lista_publicaciones } = this.state;

    try {
      //Actualiza el estado del mensaje de error de publicacion eliminando cualquier mensaje de error previo
      this.setState({ mensajeAlertPublicacion: '' });

      //Si es la primera pagina se indica que se esta cargando la lista de publicacion 
      if (pagina_publicacion == 1) {
        this.setState({ loading_publicacion: true });
      }

      //Se llama a la funcion que tiene la API para obtener las publicaciones del perfil del emprendedor
      const respuesta = await api_publicacion.obtenerPublicacionesDelPerfilEmprendedor(id_usuario_emprendedor, pagina_publicacion);

      //Actualiza el estado de la lista de publicaciones recibidas y si se puede cargar mas publicaciones
      this.setState({
        lista_publicaciones: [...lista_publicaciones, ...respuesta.lista_publicaciones],
        cargar_mas_publicaciones: respuesta.cargar_mas_publicaciones,
      });

    } catch (error) {

      //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
      this.setState({
        mensajeAlertPublicacion: error.message
      }, () => {
        Alert.alert("Aviso", error.message);
      });
    } finally {

      //Finaliza el estado de carga y refresco de productos
      this.setState({ refreshing_publicacion: false, loading_publicacion: false });

      //Actualiza el numero de notificaciones en caso que el usuario halla iniciado sesion
      if (id_usuario && tipo_usuario) {
        obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
      }
    }
  };


  //Funcion que renderizar cada elemento de la lista de publicaciones
  renderItemPublicacion = ({ item }) => {
    return (

      //Componente Card para mostrar la informacion de la publicacion
      <Card key={item.detalles_publicaciones.id_publicacion_informacion}>


        {/*Componente View que contiene la informacion del emprendedor y cuando hizo la publico  */}
        <View style={{ width: "auto", flexDirection: 'row', height: 50, backgroundColor: '#EBEBEB' }}>

          {/*Componente View para mostrar la imagen del perfil del emprendedore sino tiene una se utiliza una predeterminada por el sistema*/}
          <View style={{ width: "20%", alignItems: "center", borderColor: "#cec8c8", borderWidth: 1 }}>
            <Image
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
              source={{
                uri: item.detalles_publicaciones.foto_perfil_nombre
                  ? `${config_define.urlBase}/uploads/${item.detalles_publicaciones.id_usuario_emprendedor}/foto_perfil/${item.detalles_publicaciones.foto_perfil_nombre}`
                  : config_define.urlUbicacionImagenPerfilPredeterminada,
              }}
            />
          </View>

          {/*Componente View que contiene el nombre del emprendimiento y la fecha de publicacion*/}
          <View style={{ width: "80%", marginStart: 10 }}>
            <Text style={styles.text_emprendimiento}>{item.detalles_publicaciones.nombre_emprendimiento}</Text>
            <Text style={styles.text_fecha}>{formatearFecha(item.detalles_publicaciones.fecha_publicacion)}</Text>
          </View>
        </View>

        {/*Separa la informacion del emprendedor del contenido de la publicacion*/}
        <Card.Divider />

        {/*Se verifica que la publicacion tenga archivos */}
        {item.archivos.length > 0 &&

          /*Componente View que contiene las imagenes/videos de la publicacion*/
          (<View style={{ width: "100%", height: 400 }}>

            {/*Componente Swiper utlizado para mostrar las imagenes/videos de las publicacion como un carrusel*/}
            <Swiper showsButtons={true} loop={false} showsPagination={true} paginationStyle={{ marginBottom: -28 }} >
              {item.archivos.map((archivo, index) => (
                <View key={index} style={{ width: "100%", height: 390, alignItems: "center", borderColor: "#cec8c8", borderWidth: 1 }}>

                  {/*Verifica que el archivo recibido sea una imagen o video*/}
                  {esImagen(archivo.nombre_archivo) ? (
                    <Image
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="contain"
                      source={{ uri: `${config_define.urlBase}/uploads/${item.detalles_publicaciones.id_usuario_emprendedor}/publicaciones_informacion/${archivo.nombre_carpeta}/${archivo.nombre_archivo}` }}
                    />
                  ) : (
                    <View style={{ width: "100%", height: "100%"}}>
                      <Video
                        source={{ uri: `${config_define.urlBase}/uploads/${item.detalles_publicaciones.id_usuario_emprendedor}/publicaciones_informacion/${archivo.nombre_carpeta}/${archivo.nombre_archivo}` }}// URI del video
                        rate={1.0} // Velocidad de reproducción del video
                        volume={1.0} // Volumen del video
                        useNativeControls={true} // Muestra los controles nativos del reproductor de video
                        isMuted={false} // El video no está silenciado
                        resizeMode={ResizeMode.CONTAIN} // Ajusta el tamaño del video para que se contenga dentro del contenedor
                        shouldPlay={false} // El video no se reproducirá automáticamente
                        isLooping={false} // El video no se repetirá en bucle
                        style={{ width: "100%", height: "100%" }} // Estilo del video, ocupando todo el ancho y alto del contenedor


                      />
                    </View>
                  )}
                </View>
              ))}
            </Swiper>
          </View>)
        }

        {/*Componente View que contiene la descripcion de la publicacion */}
        <View>
          <Text style={styles.tamanio_texto}>{item.detalles_publicaciones.descripcion}</Text>
        </View>

        {/*Verifica que halla cordenadas para mostrar el boton de ubicacion */}
        {item.detalles_publicaciones.map_latitud != null && item.detalles_publicaciones.map_longitud != null &&
          (<View style={{ alignItems: 'flex-start', marginTop: 10 }}>

            {/*Componente TouchableOpacity para navegar a la ubicacion de la publicacion */}
            <TouchableOpacity
              style={styles.boton}
              onPress={() => {
                this.props.navigation.navigate("VerUbicacion", { map_latitud: item.detalles_publicaciones.map_latitud, map_longitud: item.detalles_publicaciones.map_longitud });
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesomeIcon
                  key={2}
                  icon={faMapLocationDot}
                  color={'black'}
                  size={20}
                  style={{ marginRight: 2 }}
                />
                <Text style={[styles.textoBoton, styles.tamanio_texto]}>Ver ubicación</Text>
              </View>
            </TouchableOpacity>
          </View>)
        }
      </Card>
    );
  };

  //Funcion que renderiza el pie de pagina de la lista de publicaciones
  renderFooterPublicacion = () => {
    const { cargar_mas_publicaciones, lista_publicaciones } = this.state;
    return (
      <View style={{ padding: 10, marginBottom: 20, marginTop: 20 }}>

        {/*Muestra un mensaje en caso que no halla que cargar mas publicaciones y la lista de publicaciones sea mayor o igual 1 */}
        {!cargar_mas_publicaciones && lista_publicaciones.length >= 1 &&
          <Text style={styles.textTitulo}>No hay mas publicaciones disponibles por el momento</Text>
        }

        {/*Muestra un indicador de carga si hay mas publicaciones por cargar */}
        {cargar_mas_publicaciones && (
          <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
        )}
      </View>
    );
  };

  //Funcion para manejar la carga de mas publicaciones al final de la lista
  handleLoadMorePublicacion = () => {
    const { cargar_mas_publicaciones } = this.state;

    //Verifica primero si hay que cargar mas publicaciones
    if (cargar_mas_publicaciones) {

      //Incrementa el numero de pagina y llama a la funcion para obtener mas publicaciones
      this.setState(prevState => ({
        pagina_publicacion: prevState.pagina_publicacion + 1,
        cargar_mas_publicaciones: true,
      }), () => {
        this.obtenerPublicacionesDelPerfilEmprendedor();
      });
    }
  };

  //Funcion para restablecer la lista de publicaciones
  onRefreshPublicacion = () => {

    //Reinicia la pagina a 1 y establece el estado de refreshing_publicacion a verdadero
    this.setState({ refreshing_publicacion: true, pagina_publicacion: 1, lista_publicaciones: [] }, () => {
      this.obtenerPublicacionesDelPerfilEmprendedor();
    });
  };

  // Función para seguir a un emprendedor
  seguirUsuario = async () => {
    try {
      const { id_usuario_emprendedor, id_usuario, tipo_usuario } = this.state;

      //Se llama a la funcion que tiene la API para seguir a un emprendedor
      const respuesta = await api_seguidores_seguidos.altaSeguirUsuarioEmprendedor(id_usuario_emprendedor, id_usuario, tipo_usuario);

      // Actualiza  la cantidad de seguidores, la cantidad  de seguidos del emprendedor y cambiar el valor que el usuario sigue al emprendedor
      this.setState({
        lo_sigue: true,
        num_seguidores_perfil: respuesta.num_seguidores,
        num_seguidos_perfil: respuesta.num_seguidos
      });
    } catch (error) {

      // Muestra una alerta en caso de error
      Alert.alert("Aviso", error.message);
    }
  };


  // Función para dejar de seguir a un emprendedor
  dejarSeguirUsuario = async () => {
    try {
      const { id_usuario_emprendedor, id_usuario, tipo_usuario } = this.state;

      //Se llama a la funcion que tiene la API para dejar seguir a un emprendedor
      const respuesta = await api_seguidores_seguidos.bajaSeguirUsuarioEmprendedor(id_usuario_emprendedor, id_usuario, tipo_usuario);

      // Actualiza  la cantidad de seguidores, la cantidad  de seguidos del emprendedor y cambiar el valor que el usuario dejo de seguir al emprendedor
      this.setState({
        lo_sigue: false,
        num_seguidores_perfil: respuesta.num_seguidores,
        num_seguidos_perfil: respuesta.num_seguidos
      });
    } catch (error) {
      // Muestra una alerta en caso de error
      Alert.alert("Aviso", error.message);
    }
  };



  render() {
    const {
      //Indice para manejo de vistas de pestañas
      index,
      //Datos del perfil
      mensajeErrorInicio, loading_inicio, detalles_perfil,
      es_perfil_del_usuario, lo_sigue, num_seguidores_perfil, num_seguidos_perfil,

      //Lista de las categorias de los producto del emprendedor 
      lista_categoria,
      //Busqueda
      busqueda_activa, search,

      //Modal filtro
      modalFiltroEstado, radio_ordenar_por, input_precio_maximo, input_precio_minimo, select_estado, select_categoria, calificacion, input_calificacion,

      //Datos de publicaciones
      pagina_publicacion, loading_publicacion, refreshing_publicacion, lista_publicaciones, mensajeProducto,

      //Datos del productos
      lista_productos, refreshing_producto, pagina, total_paginas, pagina_actual_producto, mensajeAlertPublicacion, loading_producto, cant_total_productos
    } = this.state;

    const theme = {
      colors: {
        primary: '#0d6efd',
        accent: 'white',
        activeAccordion: 'white',
      },
    };
    return (
      <SafeAreaView style={styles.safeArea}>
        {/*Contenedor principal */}
        <View style={styles.container}>

          {/*Indicador de carga de los datos del usuario*/}
          {loading_inicio ? (
            <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
          ) : (
            <>
              {/*Verifica si hay un mensaje de alerta*/}
              {mensajeErrorInicio ? (
                /*Se llama a la funcion para obtener un contenedor que muestra un mensaje de error*/
                mostrarMensaje(mensajeErrorInicio, 'danger')
              ) : (
                <>

                  {/*Componente View que contiene los detalles del perfil del emprendedor*/}
                  <View style={[styles.viewCard]}>


                    {/*Componente View para mostrar la imagen del perfil del emprendedor, la cantidad de productos disponibles, la cantidad de seguidores y seguidos del emprendedor */}
                    <View style={{ flexDirection: 'row', height: 80, alignItems: 'center' }}>

                      {/*Componente View para mostrar la imagen del perfil del emprendedor sino tiene una se utiliza una predeterminada por el sistema*/}
                      <View style={{ width: "20%", marginRight: 10, borderColor: "#cec8c8", borderWidth: 1 }}>
                        <Image
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="contain"
                          source={{
                            uri: detalles_perfil.foto_perfil_nombre
                              ? `${config_define.urlBase}/uploads/${detalles_perfil.id_usuario_emprendedor}/foto_perfil/${detalles_perfil.foto_perfil_nombre}`
                              : config_define.urlUbicacionImagenPerfilPredeterminada,
                          }}
                        />
                      </View>

                      {/*Componente View que contiene la cantidad de productos disponibles, la cantidad de seguidores y seguidos del emprendedor*/}
                      <View style={{ flexDirection: 'column', width: "80%" }}>
                        <View style={{ flexDirection: 'row', marginTop: 15, justifyContent: 'space-between' }}>

                          {/*Informacion sobre los productos disponibles que tiene el emprendedor  */}
                          <View style={{ flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                            <Text style={{ fontSize: 18 }}>{detalles_perfil.productos_disponibles}</Text>
                            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Productos disponibles</Text>
                          </View>

                          {/*Informacion sobre la cantidad de usuarios que siguen al emprendedor  */}
                          <View style={{ flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                            <Text style={{ fontSize: 18 }}>{num_seguidores_perfil}</Text>
                            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Seguidores</Text>
                          </View>

                          {/*Informacion sobre cantidad de emprendedores que sigue el usuario */}
                          <View style={{ flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                            <Text style={{ fontSize: 18 }}>{num_seguidos_perfil}</Text>
                            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Seguidos</Text>
                          </View>
                        </View>
                      </View>

                    </View>

                    {/*Informacion del nombre del usuario del emprendedor */}
                    <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Nombre de usuario:</Text>{detalles_perfil.nombre_usuario}</Text>

                    {/*Informacion de la descripcion del emprendedor */}
                    <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Descripcion:</Text>{detalles_perfil.descripcion ? detalles_perfil.descripcion : "Sin descripcion"}</Text>


                    {/*Componente View que contiene la calificacion del emprendedor*/}
                    <View style={styles.starsContainer}>
                      <Text style={styles.caracteristica}>Calificación del emprendedor</Text>

                      {/*Verifica la calificacion del emprendedor  */}
                      {detalles_perfil.calificacion_emprendedor === null ?
                        (
                          /*En caso que no tenga una calificacion va a mostrar el siguiente mensaje */
                          <Text style={styles.tamanio_texto}>El emprendedor aún no tiene una calificación</Text>) :
                        (
                          /*Componente View que contiene las estrellas que tiene el emprendedor*/
                          <View style={styles.estrellas}>
                            {/*Se va a agregar estrellas dependiendo la cantidad maxima establecida en el sistema */}
                            {Array.from({ length: config_define.calificacion_max_emprendedor }, (value, index) => (
                              <FontAwesomeIcon
                                key={index}
                                icon={faStar}
                                color={index < detalles_perfil.calificacion_emprendedor ? '#ffd700' : '#ddd'}
                                size={30}
                                style={{ marginRight: 2 }}
                              />
                            ))}
                          </View>
                        )}
                    </View>

                    {/*Se verifica si el usuario entro a su perfil*/}
                    {!es_perfil_del_usuario &&
                      <View style={{ justifyContent: 'center', alignItems: 'center' }}>

                        {/*Se verifica si el usuario sigue al emprendedor*/}
                        {lo_sigue ?
                          /*Componente TouchableOpacity para dejar de seguir al emprendedor */
                          (<TouchableOpacity style={[styles.boton, styles.botonBaja]}
                            onPress={this.dejarSeguirUsuario}>
                            <Text style={[styles.textoBoton, styles.textoBaja]}>Dejar de seguir</Text>
                          </TouchableOpacity>)
                          :
                          /*Componente TouchableOpacity para seguir al emprendedor */
                          (<TouchableOpacity style={[styles.boton, styles.botonConfirmacion]}
                            onPress={this.seguirUsuario}
                          >
                            <Text style={[styles.textoBoton, styles.textoConfirmacion]} >Seguir</Text>
                          </TouchableOpacity>)
                        }
                      </View>
                    }

                  </View>

                  {/*Componente View que contiene el Tab para la navegacion entre productos y publicaciones */}
                  <View style={styles.viewTab}>
                    <Tab
                      value={index}
                      onChange={(newValue) => this.setState({ index: newValue })}
                      indicatorStyle={{
                        backgroundColor: 'grey',
                        height: 3,
                      }}
                    >
                      <Tab.Item
                        title="Productos"
                        titleStyle={styles.tabTitle}
                      />
                      <Tab.Item
                        title="Publicaciones"
                        titleStyle={styles.tabTitle}
                      />
                    </Tab>

                    {/*Componente TabView para mostrar el contenido de cada pestaña */}
                    <TabView
                      value={index}
                      disableSwipe={true}
                      onChange={(newValue) => this.setState({ index: newValue })}
                      animationType="spring"
                    >
                      {/*Pestaña Productos*/}

                      <TabView.Item style={{
                        width: '100%',
                      }}>
                        <View style={{ flex: 1 }}>
                          {/*Verifica si hay un mensaje de error*/}
                          {mensajeProducto && mostrarMensaje(mensajeProducto, 'danger')}

                          {/*Indicador de carga de los datos*/}
                          {loading_producto &&
                            <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                          }


                          {/*Se verifica si es el perfil del usuario */}
                          {es_perfil_del_usuario &&

                            <View style={{ paddingTop: 10, paddingEnd: 10, paddingStart: 10 }}>
                              {/*Componente TouchableOpacity para navegar a la pantalla de publicar un nuevo producto */}
                              <TouchableOpacity
                                style={[styles.boton, styles.botonConfirmacion, { marginBottom: 10 }]} onPress={() => {
                                  this.props.navigation.navigate("ScreenNuevoProducto");
                                }}
                              >
                                <Text style={[styles.textoBoton, styles.textoConfirmacion]}>Publicar un nuevo producto</Text>
                              </TouchableOpacity>
                            </View>

                          }

                          <FlatList
                            // Componente que se renderiza al comienzo de la lista
                            ListHeaderComponent={
                              <View style={{ padding: 10 }}>
                                {/*Componente SearchBar que se utiliza para buscar productos en el perfil del emprendedor*/}
                                <SearchBar
                                  placeholder="Buscar por nombre de producto"
                                  value={search}
                                  onChangeText={this.handleTextSearch.bind(this)}
                                  round={true}
                                  lightTheme={true}
                                  containerStyle={styles.container_search}
                                  inputContainerStyle={styles.input_Container_Style}
                                  inputStyle={{ color: 'black' }}
                                />


                                {/*Componente View que contiene el boton para abrir el modal de filtro*/}
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 }}>
                                  <TouchableOpacity
                                    style={styles.boton}
                                    onPress={() => this.setState({ modalFiltroEstado: true })}
                                  >
                                    <Text style={styles.textoBoton}>Filtros</Text>
                                  </TouchableOpacity>
                                </View>


                                {/*Verifica que el usuario inicio una busqueda y que la lista de productos sea mayor a 0 para mostrar la cantidad de resultados de busqueda o la cantidad de productos publicados si no se esta buscando productos*/}
                                {!loading_producto && lista_productos.length > 0 && (
                                  busqueda_activa ?
                                    <Text style={{ fontSize: 25, marginStart: 15 }}>Resultados: {cant_total_productos}</Text> :
                                    <Text style={{ fontSize: 25, marginStart: 15 }}>Productos disponibles: {cant_total_productos}</Text>
                                )}

                              </View>

                            }
                            data={lista_productos}// Datos de la lista que serán renderizados
                            renderItem={this.renderItemProducto}// Función que renderiza cada elemento de la lista
                            keyExtractor={(item, index) => index.toString()}// Función para extraer la clave única para cada elemento
                            onEndReachedThreshold={0.5}// Umbral que determina cuánto antes del final de la lista se debe llamar a onEndReached
                            ListFooterComponent={lista_productos.length > 0 && (renderPaginationButtons(total_paginas, pagina_actual_producto, '', pagina, this.cambiarPagina))}// Componente que se renderiza al final de la lista
                            refreshControl={
                              <RefreshControl
                                refreshing={refreshing_producto}// Estado que indica si la lista se está refrescando
                                onRefresh={this.onRefreshProducto}// Función que se llama cuando se realiza un gesto de refresco
                              />
                            }
                            // Componente que se muestra cuando la lista está vacía
                            ListEmptyComponent={
                              !loading_producto && !mensajeProducto && (
                                busqueda_activa ?
                                  <Text style={styles.textoBusqueda}>Sin resultados</Text> :
                                  <Text style={styles.textoBusqueda}>No hay productos disponibles por el momento</Text>
                              )
                            }
                          />

                        </View>
                      </TabView.Item>

                      {/*Pestaña Publicaciones*/}
                      <TabView.Item style={{
                        width: '100%',
                      }}>
                        <View style={{ flex: 1 }}>

                          {/*Verifica si hay un mensaje de alerta*/}
                          {mensajeAlertPublicacion && mostrarMensaje(mensajeAlertPublicacion, 'danger')}

                          {/*Indicador de carga si esta cargando datos*/}
                          {loading_publicacion && (
                            <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                          )}
                          {/*Se verifica si es el perfil del usuario */}
                          {es_perfil_del_usuario &&

                            <View style={{ paddingTop: 10, paddingEnd: 10, paddingStart: 10 }}>
                              {/*Componente TouchableOpacity para navegar a la pantalla de hacer una nueva publicacion */}
                              <TouchableOpacity
                                style={[styles.boton, styles.botonConfirmacion, { marginBottom: 10 }]} onPress={() => {
                                  this.props.navigation.navigate("ScreenNuevaPublicacion");
                                }}
                              >
                                <Text style={[styles.textoBoton, styles.textoConfirmacion]}>Nueva publicacion</Text>
                              </TouchableOpacity>
                            </View>

                          }
                          <FlatList
                            data={lista_publicaciones}// Datos de la lista que serán renderizados
                            renderItem={this.renderItemPublicacion}// Función que renderiza cada elemento de la lista
                            keyExtractor={(item, index) => index.toString()}// Función para extraer la clave única para cada elemento
                            onEndReached={this.handleLoadMorePublicacion} // Función que se llama cuando se alcanza el final de la lista
                            onEndReachedThreshold={0.5}// Umbral que determina cuánto antes del final de la lista se debe llamar a onEndReached
                            ListFooterComponent={this.renderFooterPublicacion}// Componente que se renderiza al final de la lista
                            refreshControl={
                              <RefreshControl
                                refreshing={refreshing_publicacion}// Estado que indica si la lista se está refrescando
                                onRefresh={this.onRefreshPublicacion}// Función que se llama cuando se realiza un gesto de refresco
                              />
                            }
                            // Componente que se muestra cuando la lista está vacía
                            ListEmptyComponent={
                              !loading_publicacion && pagina_publicacion == 1 && !mensajeAlertPublicacion && (
                                <Text style={styles.textTitulo}>No hay publicaciones disponibles por el momento</Text>
                              )
                            }
                          />
                        </View>
                      </TabView.Item>
                    </TabView>
                  </View>
                </>
              )}
            </>
          )}


          {/*Modal filtro del producto*/}
          <View>
            {/* Proveedor de temas de Paper para estilos consistentes */}

            <PaperProvider theme={theme}>
              <Modal
                visible={modalFiltroEstado} // Controla si el modal está visible o no
                animationType="fade" // Tipo de animación cuando se muestra o se oculta el modal
                statusBarTranslucent={false} // Configuración translúcida para la barra de estado 
                transparent={true} // Hacer el fondo del modal transparente
              >
                <ScrollView style={styles.modalViewFondo}>
                  <View style={[styles.modalView, { marginTop: '20%' }]}>

                    {/* Sección de filtros */}
                    <List.Section titleStyle={{ fontSize: 25 }} title="Filtros" >
                      <View style={{ borderRadius: 6, borderColor: '#dee2e6', borderWidth: 1, marginBottom: 20 }}>


                        {/* Acordeón para filtrar los productos*/}
                        <List.Accordion title="Ordenar por"
                          theme={{ colors: { primary: 'black' } }}
                        >
                          <View style={styles.lista_acordeon}>
                            <RadioButton.Group
                              onValueChange={radio_ordenar_por => this.setChecked(radio_ordenar_por)}
                              value={radio_ordenar_por}
                            >
                              <RadioButton.Item label="Fecha de publicación: más reciente" value="1" />
                              <RadioButton.Item label="Fecha de publicación: más antigua" value="2" />
                              <RadioButton.Item label="Mayor precio" value="3" />
                              <RadioButton.Item label="Menor precio" value="4" />

                            </RadioButton.Group>
                          </View>
                        </List.Accordion>

                        {/* Acordeón para el rango de precio de los productos*/}
                        <List.Accordion title="Rango de precio"
                          theme={{ colors: { primary: 'black' } }}
                          style={{ borderColor: '#dee2e6', borderTopWidth: 1 }}
                        >
                          <View style={styles.lista_acordeon}>
                            <View style={styles.container_precio}>
                              <TextInput
                                placeholder="Minimo"
                                keyboardType="numeric"
                                value={input_precio_minimo}
                                onChangeText={this.handleChangeMinimo}
                                style={styles.input_precio}
                              />
                              <FontAwesomeIcon
                                icon={faMinus}
                                style={{ marginRight: 2, marginLeft: 2 }} // Espacio entre las estrellas
                              />
                              <TextInput
                                value={input_precio_maximo}
                                onChangeText={this.handleChangeMaximo}
                                placeholder="Maximo"
                                keyboardType="numeric"
                                style={styles.input_precio}
                              />
                              <TouchableOpacity
                                style={styles.buscarRangoPrecio}
                                onPress={() => this.guardarValoresRangoPrecio()}

                              >
                                <FontAwesomeIcon
                                  icon={faChevronRight}
                                  size={30}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>

                        </List.Accordion>

                        {/* Acordeón para la calificacion del producto*/}
                        <List.Accordion title="Calificacion"
                          theme={{ colors: { primary: 'black' } }}
                          style={{ borderColor: '#dee2e6', borderTopWidth: 1 }}
                        >
                          <View style={styles.lista_acordeon}>
                            <RadioButton.Group
                              onValueChange={input_calificacion => this.setCheckedCalificacion(input_calificacion)}
                              value={input_calificacion}
                            >
                              <RadioButton.Item label="Todos" value="todos_calificacion" />
                              <RadioButton.Item label="Sin calificacion" value="sin_calificacion" />
                              <RadioButton.Item label="Por calificacion" value="num_calificacion" />
                            </RadioButton.Group>

                            <View style={styles.starsContainer}>
                              <View style={styles.estrellas}>
                                {Array.from({ length: config_define.calificacion_max_producto }, (value, index) => (
                                  <TouchableOpacity key={index + 1} onPress={() => this.handleStarClick(index + 1)}>
                                    <FontAwesomeIcon
                                      icon={faStar}
                                      color={calificacion >= index + 1 ? '#f8b71b' : '#ddd'}
                                      size={55}
                                      style={{ marginRight: 2 }}
                                    />
                                  </TouchableOpacity>
                                ))}
                              </View>
                            </View>
                          </View>
                        </List.Accordion>

                        {/* Acordeón para la categoria del producto*/}
                        <List.Accordion title="Categoria"
                          theme={{ colors: { primary: 'black' } }}
                          style={{ borderColor: '#dee2e6', borderTopWidth: 1 }}
                        >
                          <View style={styles.lista_acordeon}>
                            <View style={styles.viewSelectFiltro}>
                              {/* Select para la categoria del producto*/}
                              <RNPickerSelect
                                value={select_categoria} // Valor actual seleccionado
                                onValueChange={this.handleCategoriaChange} // Función que maneja el cambio de select
                                placeholder={{}} // Espacio reservado en el select
                                style={{ inputAndroid: styles.inputBusqueda }} // Estilo para el select en Android
                                items={[
                                  { label: 'Todos', value: '0' }, // Opción para mostrar todas las publicaciones
                                  // Opciones dinámicas basadas en las categorias disponibles
                                  ...(
                                    lista_categoria.length > 0
                                      ? lista_categoria.map((categoria) => ({
                                        label: categoria.nombre_categoria,
                                        value: categoria.id_categoria_producto,
                                      }))
                                      : []
                                  ),
                                ]}
                              />
                            </View>
                          </View>
                        </List.Accordion>


                        {/* Acordeón para el estado de la publicación del producto */}
                        <List.Accordion title="Estado"
                          theme={{ colors: { primary: 'black' } }}
                          style={{ borderColor: '#dee2e6', borderTopWidth: 1 }}
                        >
                          <View style={styles.lista_acordeon}>
                            <View style={styles.viewSelectFiltro}>
                              {/* Select para el estado de la publicación del producto*/}
                              <RNPickerSelect
                                value={select_estado}// Valor actual seleccionado
                                onValueChange={this.handleEstadoChange}// Función que maneja el cambio de select
                                placeholder={{}}// Espacio reservado en el select
                                style={{ inputAndroid: styles.inputBusqueda }} // Estilo para el select en Android
                                items={[
                                  { label: 'Todos', value: 'todos' },// Opción para mostrar todas los productos
                                  { label: 'Disponible', value: 'disponible' },// Opción para mostrar todas los productos disponibles
                                  { label: 'Finalizado', value: 'finalizado' }// Opción para mostrar todas los productos finalizados

                                ]}
                              />
                            </View>
                          </View>

                        </List.Accordion>

                      </View>
                    </List.Section>


                    {/* Botones para restablecer y cerrar el modal */}
                    <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                      <TouchableOpacity
                        style={styles.boton}
                        onPress={() => this.restablecer_valores_modal()}// Función para restablecer los valores del filtro
                      >
                        <Text style={styles.textoBoton}>Restablecer Filtro</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.boton}
                        onPress={() => this.setState({ modalFiltroEstado: false })}// Función para cerrar el modal
                      >
                        <Text style={styles.textoBoton}>Cerrar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>


                </ScrollView>
              </Modal>
            </PaperProvider>
          </View>
        </View >
      </SafeAreaView >
    );
  }
}