import React, { Component } from 'react';

//Componentes utilizados en React Native
import { Alert, ActivityIndicator, TouchableOpacity, RefreshControl, SafeAreaView, Text, View, Image, FlatList } from 'react-native';
import { Tab, TabView, Card } from '@rneui/themed';

//Biblioteca para almacenamiento asincrono de datos
import AsyncStorage from '@react-native-async-storage/async-storage';

//Componente para mostrar iconos
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

//Iconos especificos de FontAwesome
import { faStar, faMapLocationDot } from '@fortawesome/free-solid-svg-icons';

//Biblioteca para crear carruseles 
import Swiper from 'react-native-swiper';

//Componentes para reproducir videos  y ajustar el tamaño del video
import { Video, ResizeMode } from 'expo-av';

//Archivo de estilos
import { styles } from '../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { formatPrecio, mostrarMensaje, esImagen, formatearFecha, obtenerCantNotificacionesSinLeer } from '../../config/funciones.js';

//Configuracion de URL y otros parametros
import { config_define } from '../../config/config_define.js';

//Módulo para realizar consultas a las APIs relacionadas
import api_producto from '../../config/consultas_api/api_producto.js';
import api_publicacion from '../../config/consultas_api/api_publicacion.js';

export class ScreenInicioUsuario extends Component {

  constructor(props) {
    super(props);
    this.state = {

      //Identificador del usuario actual
      id_usuario: null,
      tipo_usuario: null,

      index: 0,//Indice para manejo de vistas de pestañas

      cant_seguimiento: 0,//Cantidad de emprendedores que sigue el usuario

      /*Seccion Productos*/
      lista_productos: [], //Lista de productos que se mostraran
      pagina_producto: 1,//Pagina actual de productos para la paginacion
      mensajeAlertProducto: '',//Mensaje de error al obtener los datos de productos
      cargar_mas_productos: false, //Indica si se puede cargar mas productos
      loading_producto: false,//Indica el estado de cargar informacion de los productos
      refreshing_producto: false, //Indica el estado de actualizar toda la pestaña de producto

      /*Seccion Publicaciones*/
      lista_publicaciones: [], //Lista de publicaciones que se mostraran
      pagina_publicacion: 1, //Pagina actual de publicaciones para la paginacion
      mensajeAlertPublicacion: '', //Mensaje de error al obtener los datos de publicaciones
      cargar_mas_publicaciones: false, //Indica si se puede cargar mas publicaciones
      loading_publicacion: false, //Indica el estado de cargar informacion de las publicaciones
      refreshing_publicacion: false,//Indica el estado de actualizar toda la pestaña de publicaciones
    };

  }

  //Metodo llamado cuando el componente se monta
  async componentDidMount() {
    //Se obtienen los datos de sesion almacenados en AsyncStorage
    const idUsuario = await AsyncStorage.getItem('idUsuario');
    const tipoUsuario = await AsyncStorage.getItem('tipoUsuario');

    //Se actualiza el estado con los datos de sesion
    this.setState({
      id_usuario: idUsuario,
      tipo_usuario: tipoUsuario
    }, () => {
      //Despues de actualizar el estado, se llaman a las funciones para obtener productos y publicaciones
      this.obtenerProductosDeLosEmprendedoresQueSiSegue();
      this.obtenerPublicacionesDeLosEmprendedoresQueSiSegue();
    });

    //Agrega un listener para actualizar las notificaciones cuando la pantalla esta enfocada 
    this.focusListener = this.props.navigation.addListener('focus', () => {
      obtenerCantNotificacionesSinLeer(idUsuario, tipoUsuario, this.props.navigation);
    });

  };

  /*Seccion para las publicaciones de productos*/

  //Funcion para obtener productos de los emprendedores que sigue el usuario
  obtenerProductosDeLosEmprendedoresQueSiSegue = async () => {
    const { pagina_producto, tipo_usuario, id_usuario, lista_productos } = this.state;

    try {

      //Actualiza el estado del mensaje de error del producto eliminando cualquier mensaje de error previo
      this.setState({ mensajeAlertProducto: '' });

      //Si es la primera pagina se indica que se esta cargando la lista de productos
      if (pagina_producto == 1) {
        this.setState({ loading_producto: true });
      }

      //Se llama a la funcion que tiene la API para obtener los productos de los emprendedores que sigue el usuario
      const respuesta_producto = await api_producto.obtenerProductosDeLosEmprendedoresQueSiSegue(pagina_producto, id_usuario, tipo_usuario);
      //Actualiza el estado de la lista de productos recibidos y si se puede cargar mas productos
      this.setState({
        lista_productos: [...lista_productos, ...respuesta_producto.lista_productos],
        cargar_mas_productos: respuesta_producto.cargar_mas_productos,
        cant_seguimiento: respuesta_producto.cant_seguimiento
      });

    } catch (error) {

      //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
      this.setState({
        mensajeAlertProducto: error.message
      }, () => {
        Alert.alert("Aviso", error.message);
      });

    } finally {
      //Finaliza el estado de carga y refresco de productos
      this.setState({ refreshing_producto: false, loading_producto: false });

      //Actualiza el numero de notificaciones
      obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
    }
  };

  //Funcion que renderizar cada elemento de la lista de productos
  renderItemProducto = ({ item }) => {
    return (

      //Componente Card para mostrar la informacion del producto
      <Card key={item.detalles_producto.id_publicacion_producto}>

        {/*Componente TouchableOpacity para navegar al perfil del emprendedor */}
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate("PerfilEmprendedor", { id_usuario_emprendedor: item.detalles_producto.id_usuario_emprendedor, nombre_emprendimiento: item.detalles_producto.nombre_emprendimiento });
          }}
        >
          {/*Componente View que contiene la informacion del emprendedor y cuando publico el producto */}
          <View style={{ width: "auto", flexDirection: 'row', height: 50, backgroundColor: '#EBEBEB' }}>

            {/*Componente View para mostrar la imagen del perfil del emprendedor sino tiene una se utiliza una predeterminada por el sistema*/}
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
        </TouchableOpacity>

        {/*Separa la informacion del emprendedor del contenido del  producto*/}
        <Card.Divider />

        {/*Componente View que contiene las imagenes del producto*/}
        <View style={{ width: "100%", height: 200, alignItems: "center", borderColor: "#cec8c8", borderWidth: 1 }}>

          {/*Componente Swiper utlizado para mostrar las imagenes del producto como un carrusel*/}
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

  //Funcion que renderiza el pie de pagina de la lista de productos
  renderFooterProducto = () => {
    const { cargar_mas_productos, lista_productos } = this.state;
    return (
      <View style={{ padding: 10, marginBottom: 20, marginTop: 20 }}>
        {/*Muestra un mensaje en caso que no halla que cargar mas productos y la lista de productos sea mayor o igual 1 */}
        {!cargar_mas_productos && lista_productos.length >= 1 &&
          <Text style={styles.textTitulo}>No hay mas productos disponibles por el momento</Text>
        }

        {/*Muestra un indicador de carga si hay mas productos por cargar */}
        {cargar_mas_productos && (
          <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
        )}
      </View>
    );
  };

  //Funcion para manejar la carga de mas productos al final de la lista
  handleLoadMoreProducto = () => {
    const { cargar_mas_productos } = this.state;
    //Verifica primero si hay que cargar mas productos
    if (cargar_mas_productos) {
      //Incrementa el numero de pagina y llama a la funcion para obtener mas productos
      this.setState(prevState => ({
        pagina_producto: prevState.pagina_producto + 1,
        cargar_mas_productos: true,
      }), () => {
        this.obtenerProductosDeLosEmprendedoresQueSiSegue();
      });
    }
  };

  //Funcion para restablecer la lista de productos
  onRefreshProducto = () => {
    //Reinicia la pagina a 1 y establece el estado de refreshing_producto a verdadero
    this.setState({ refreshing_producto: true, pagina_producto: 1, lista_productos: [] }, () => {
      this.obtenerProductosDeLosEmprendedoresQueSiSegue();
    });
  };



  /*Seccion para las publicaciones de informacion*/

  //Funcion para obtener publicaciones de los emprendedores que sigue el usuario
  obtenerPublicacionesDeLosEmprendedoresQueSiSegue = async () => {
    const { pagina_publicacion, tipo_usuario, id_usuario, lista_publicaciones } = this.state;

    try {
      //Actualiza el estado del mensaje de error de publicacion eliminando cualquier mensaje de error previo
      this.setState({ mensajeAlertPublicacion: '' });

      //Si es la primera pagina se indica que se esta cargando la lista de publicaciones
      if (pagina_publicacion == 1) {
        this.setState({ loading_publicacion: true });
      }

      //Se llama a la funcion que tiene la API para obtener las publicaciones de los emprendedores que sigue el usuario
      const respuesta_publicacion = await api_publicacion.obtenerPuInformacionDeLosEmprendedoresQueSiSegue(pagina_publicacion, id_usuario, tipo_usuario);


      //Actualiza el estado de la lista de publicaciones recibidas y si se puede cargar mas publicaciones
      this.setState({
        lista_publicaciones: [...lista_publicaciones, ...respuesta_publicacion.lista_publicaciones],
        cargar_mas_publicaciones: respuesta_publicacion.cargar_mas_publicaciones,
        cant_seguimiento: respuesta_publicacion.cant_seguimiento

      });

    } catch (error) {

      //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
      this.setState({
        mensajeAlertPublicacion: error.message
      }, () => {
        Alert.alert("Aviso", error.message);
      });

    } finally {

      //Finaliza el estado de carga y refresco de publicaciones
      this.setState({ refreshing_publicacion: false, loading_publicacion: false });

      //Actualiza el numero de notificaciones
      obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);

    }
  };

  //Funcion que renderizar cada elemento de la lista de publicaciones
  renderItemPublicacion = ({ item }) => {
    return (

      //Componente Card para mostrar la informacion de la publicaciones
      <Card key={item.detalles_publicaciones.id_publicacion_informacion}>

        {/*Componente TouchableOpacity para navegar al perfil del emprendedor */}
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate("PerfilEmprendedor", { id_usuario_emprendedor: item.detalles_publicaciones.id_usuario_emprendedor, nombre_emprendimiento: item.detalles_publicaciones.nombre_emprendimiento });
          }}
        >

          {/*Componente View que contiene la informacion del emprendedor y cuando hizo la publicacion  */}
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
        </TouchableOpacity>

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
                    <View style={{ width: "100%", height: "100%" }}>
                      <Video
                        source={{ uri: `${config_define.urlBase}/uploads/${item.detalles_publicaciones.id_usuario_emprendedor}/publicaciones_informacion/${archivo.nombre_carpeta}/${archivo.nombre_archivo}` }} // URI del video
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
          <Text style={styles.textoBusqueda}>No hay mas publicaciones disponibles por el momento</Text>
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
        this.obtenerPublicacionesDeLosEmprendedoresQueSiSegue();
      });
    }
  };

  //Funcion para restablecer la lista de publicaciones
  onRefreshPublicacion = () => {

    //Reinicia la pagina a 1 y establece el estado de refreshing_publicacion a verdadero
    this.setState({ refreshing_publicacion: true, pagina_publicacion: 1, lista_publicaciones: [] }, () => {
      this.obtenerPublicacionesDeLosEmprendedoresQueSiSegue();
    });
  };

  render() {
    const {
      //Cantidad de emprendedores que sigue el usuario
      cant_seguimiento,
      //Indice para manejo de vistas de pestañas
      index,
      //Datos de publicaciones
      loading_publicacion, mensajeAlertPublicacion, pagina_publicacion, refreshing_publicacion, lista_publicaciones,
      //Datos de productos
      loading_producto, mensajeAlertProducto, pagina_producto, refreshing_producto, lista_productos
    } = this.state;
    return (
      <SafeAreaView style={styles.safeArea}>
        {/*Contenedor principal */}
        <View style={[styles.container, { paddingStart: 10, paddingEnd: 10, paddingTop: 10, marginBottom: 20 }]}>

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
                titleStyle={{ fontSize: 16, color: 'black' }}
              />
              <Tab.Item
                title="Publicaciones"
                titleStyle={{ fontSize: 16, color: 'black' }}
              />
            </Tab>


            {/*Componente TabView para mostrar el contenido de cada pestaña */}
            <TabView value={index} disableSwipe={true} onChange={(newValue) => this.setState({ index: newValue })} animationType="spring" >

              {/*Pestaña Productos*/}
              <TabView.Item style={{ width: '100%' }}>
                <View style={{ marginBottom: 20 }}>
                  <View style={{ padding: 10 }}>

                    {/*Mensaje de alerta si hay uno*/}
                    {mensajeAlertProducto && (
                      mostrarMensaje(mensajeAlertProducto, 'danger')
                    )}

                    {/*Indicador de carga si esta cargando datos*/}
                    {loading_producto && (
                      <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                    )}
                  </View>
                  <FlatList
                    data={lista_productos} // Datos de la lista que serán renderizados
                    renderItem={this.renderItemProducto} // Función que renderiza cada elemento de la lista
                    keyExtractor={(item, index) => index.toString()}// Función para extraer la clave única para cada elemento
                    ListFooterComponent={this.renderFooterProducto} // Componente que se renderiza al final de la lista
                    onEndReached={this.handleLoadMoreProducto} // Función que se llama cuando se alcanza el final de la lista
                    onEndReachedThreshold={0.5} // Umbral que determina cuánto antes del final de la lista se debe llamar a onEndReached
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing_producto} // Estado que indica si la lista se está refrescando
                        onRefresh={this.onRefreshProducto}  // Función que se llama cuando se realiza un gesto de refresco
                      />
                    }
                    // Componente que se muestra cuando la lista está vacía
                    ListEmptyComponent={
                      !loading_producto && pagina_producto === 1 && !mensajeAlertProducto && (
                        cant_seguimiento == 0 ?
                          (
                            <Text style={styles.textoBusqueda}>¡Empieza a seguir a tus emprendedores favoritos para ver sus últimos productos!</Text>
                          ) : (
                            <Text style={styles.textoBusqueda}>No hay productos disponibles por el momento</Text>
                          )
                      )
                    }
                  />

                </View>
              </TabView.Item>

              {/*Pestaña Publicaciones*/}
              <TabView.Item style={{ width: '100%' }}>
                <View style={{ marginBottom: 20 }}>
                  <View style={{ padding: 10 }}>

                    {/*Mensaje de alerta si hay uno*/}
                    {mensajeAlertPublicacion && (
                      mostrarMensaje(mensajeAlertPublicacion, 'danger')
                    )}


                    {/*Indicador de carga si esta cargando */}
                    {loading_publicacion && (
                      <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                    )}

                  </View>
                  <FlatList
                    data={lista_publicaciones} // Datos de la lista que serán renderizados
                    renderItem={this.renderItemPublicacion} // Función que renderiza cada elemento de la lista
                    keyExtractor={(item, index) => index.toString()} // Función para extraer la clave única para cada elemento
                    onEndReached={this.handleLoadMorePublicacion} // Función que se llama cuando se alcanza el final de la lista
                    ListFooterComponent={this.renderFooterPublicacion} // Componente que se renderiza al final de la lista
                    onEndReachedThreshold={0.5} // Umbral que determina cuánto antes del final de la lista se debe llamar a onEndReached
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing_publicacion} // Estado que indica si la lista se está refrescando
                        onRefresh={this.onRefreshPublicacion} // Función que se llama cuando se realiza un gesto de refresco
                      />
                    }
                    // Componente que se muestra cuando la lista está vacía
                    ListEmptyComponent={
                      !loading_publicacion && pagina_publicacion === 1 && !mensajeAlertPublicacion && (
                        cant_seguimiento == 0 ?
                          (
                            <Text style={styles.textoBusqueda}>¡Empieza a seguir a tus emprendedores favoritos para ver sus últimas publicaciones!</Text>
                          ) : (
                            <Text style={styles.textoBusqueda}>No hay publicaciones disponibles por el momento</Text>
                          )
                      )
                    }
                  />

                </View>
              </TabView.Item>

            </TabView>

          </View>

        </View>

      </SafeAreaView>
    );
  }
}