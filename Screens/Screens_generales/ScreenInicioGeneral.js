import React, { Component } from 'react';

//Componentes utilizados en React Native
import {ActivityIndicator, TouchableOpacity, View, Image, SafeAreaView, Text, FlatList, RefreshControl, ScrollView } from 'react-native';
import { Tab, TabView, Card } from '@rneui/themed';

//Componente para mostrar iconos
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

//Iconos especificos de FontAwesome
import { faStar, faMapLocationDot, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';

//Biblioteca para crear carruseles 
import Swiper from 'react-native-swiper';

//Componentes para reproducir videos y ajustar el tamaño del video
import { Video, ResizeMode } from 'expo-av';

//Archivo de estilos
import { styles } from '../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { mostrarMensaje, esImagen, formatearFecha, formatPrecio } from '../../config/funciones.js';

//Módulo para realizar consultas a las APIs relacionadas
import api_emprendedor from '../../config/consultas_api/api_emprendedor.js';
import api_producto from '../../config/consultas_api/api_producto.js';
import api_publicacion from '../../config/consultas_api/api_publicacion.js';

//Configuracion de URL y otros parametros
import { config_define } from '../../config/config_define.js';


export class ScreenInicioGeneral extends Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,//Indice para manejo de vistas de pestañas

      expandViewCard: false, // Estado inicial de la vista de publicaciones
      expandViewTab: false,  // Estado inicial de la vista de tabs

      /*Seccion Publicaciones*/
      lista_publicaciones: [], //Lista de publicaciones que se mostraran
      pagina_publicacion: 1, //Pagina actual de publicaciones para la paginacion
      mensajePublicacion: '', //Mensaje de error al obtener los datos de publicaciones
      cargar_mas_publicaciones: false, //Indica si se puede cargar mas publicaciones
      loading_publicacion: false, //Indica el estado de cargar informacion de las publicaciones
      refreshing_publicacion: false,//Indica el estado de actualizar toda la pestaña de publicaciones


      /*Seccion Productos*/
      lista_productos: [], //Lista de productos que se mostraran
      mensajeProducto: '',//Mensaje de error al obtener los datos de productos
      loading_producto: false,//Indica el estado de cargar informacion de los productos
      refreshing_producto: false, //Indica el estado de actualizar toda la pestaña de producto


      /*Seccion Emprendedores*/
      lista_emprendedores: [], //Lista de emprendedores que se mostraran
      mensajeEmprendedor: '',//Mensaje de error al obtener los datos de los emprendedores
      loading_emprendedor: false,//Indica el estado al cargar la informacion de los emprendedores
      refreshing_emprendedor: false//Indica el estado de actualizar toda la pestaña de emprendedores
    };
  }

  //Metodo llamado cuando el componente se monta
  componentDidMount() {
    //Funcion para obtener una lista de emprendedores
    this.obtenerListaEmprendedoresActivosParaIndex();

    //Funcion para obtener las ultimas publicaciones de distintos emprendedores
    this.obtenerListaUltimasPublicacionesGeneral();

    //Funcion para obtener una lista de productos de los emprendedores
    this.obtenerListaProductosDisponiblesParaIndex();
  }



  /*Seccion para las publicaciones de productos*/

  //Funcion para obtener productos de los emprendedores
  obtenerListaProductosDisponiblesParaIndex = async () => {
    try {

      //Actualiza el estado del mensaje de error del producto eliminando cualquier mensaje de error previo
      this.setState({ loading_producto: true, mensajeProducto: '' });

      //Se llama a la funcion que tiene la API para obtener los productos de los emprendedores
      const respuesta = await api_producto.obtenerListaProductosDisponiblesParaIndex();
      this.setState({ lista_productos: respuesta.lista_productos });
    } catch (error) {
      //Manejo de errores: Actualiza el estado con el mensaje de error 
      this.setState({ mensajeProducto: error.message });
    } finally {
      //Finaliza el estado de carga y refresco de productos
      this.setState({ refreshing_producto: false, loading_producto: false });
    }
  };

  //Funcion que renderizar cada elemento de la lista de productos
  renderItemProducto = ({ item }) => {
    return (

      //Componente Card para mostrar la informacion del producto
      <Card key={item.detalles_producto.id_publicacion_producto} containerStyle={{ marginBottom: 20 }}>

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

          {/*Informacion de la categoria del producto */}
          <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Categoria:</Text> {item.detalles_producto.nombre_categoria} </Text>

          {/*Informacion del precio del producto */}
          <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Precio:</Text>{formatPrecio(item.detalles_producto.precio)}</Text>

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
      </Card>
    );
  };


  //Funcion para restablecer la lista de productos
  onRefreshProductos = () => {
    //Establece el estado de refreshing_producto a verdadero
    this.setState({ refreshing_producto: true, lista_productos: [] }, () => {
      this.obtenerListaProductosDisponiblesParaIndex();
    });
  };


  /*Seccion para los emprendedores*/

  //Funcion para obtener emprendedores
  obtenerListaEmprendedoresActivosParaIndex = async () => {
    try {

      //Actualiza el estado del mensaje de error de los emprendedores eliminando cualquier mensaje de error previo
      this.setState({ loading_emprendedor: true, mensajeEmprendedor: '' });

      //Se llama a la funcion que tiene la API para obtener a los emprendedores disponibles
      const respuesta = await api_emprendedor.obtenerListaEmprendedoresActivosParaIndex();
      this.setState({ lista_emprendedores: respuesta.lista_emprendedores });
    } catch (error) {
      //Manejo de errores: Actualiza el estado con el mensaje de error 
      this.setState({ mensajeEmprendedor: error.message });
    } finally {
      //Finaliza el estado de carga y refresco de emprendedores
      this.setState({ refreshing_emprendedor: false, loading_emprendedor: false });
    }
  };

  //Funcion que renderizar cada elemento de la lista de emprendedores
  renderItemEmprendedor = ({ item }) => {
    return (

      //Componente Card para mostrar la informacion del emprendedor
      <Card key={item.id_usuario_emprendedor} containerStyle={{ marginBottom: 20 }}>

        {/*Componente TouchableOpacity para navegar al perfil del emprendedor */}
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate("PerfilEmprendedor", { id_usuario_emprendedor: item.id_usuario_emprendedor, nombre_emprendimiento: item.nombre_emprendimiento });
          }}
        >
          {/*Componente View que contiene toda la informacion del emprendimiento*/}
          <View>

            {/*Componente View que contiene el nombre del emprendimiento*/}
            <View style={{ width: "100%", height: 40, backgroundColor: '#EBEBEB', justifyContent: "center", alignItems: "center" }}>
              <Text style={[styles.text_emprendimiento, { textAlign: 'center' }]}>{item.nombre_emprendimiento} </Text>
            </View>


            {/*Componente View para mostrar la imagen del perfil del emprendedor sino tiene una se utiliza una predeterminada por el sistema*/}
            <View style={{ width: "100%", height: 200, alignItems: "center", borderColor: "#cec8c8", borderWidth: 1 }}>
              <Image
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
                source={{
                  uri: item.foto_perfil_nombre
                    ? `${config_define.urlBase}/uploads/${item.id_usuario_emprendedor}/foto_perfil/${item.foto_perfil_nombre}`
                    : config_define.urlUbicacionImagenPerfilPredeterminada,
                }}
              />
            </View>

            {/*Componente View que contiene la informacion del emprendedor*/}
            <View>

              {/*Informacion del nombre del usuario */}
              <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Nombre de usuario:</Text> {item.nombre_usuario} </Text>

              {/*Informacion de los productos disponibles del emprendedor */}
              <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Productos disponibles:</Text> {item.cant_productos_publicados} </Text>

              {/*Componente View que contiene la calificacion del emprendedor*/}
              <View style={styles.starsContainer}>
                <Text style={styles.caracteristica}>Calificación del emprendedor</Text>

                {/*Verifica la calificacion del emprendedor  */}
                {item.calificacion_emprendedor === null ? (

                  /*En caso que no tenga una calificacion va a mostrar el siguiente mensaje */
                  <Text style={styles.tamanio_texto}>El emprendedor aún no tiene una calificación</Text>
                ) : (

                  /*Componente View que contiene las estrellas que tiene el emprendedor*/
                  <View style={styles.estrellas}>
                    {/*Se va a agregar estrellas dependiendo la cantidad maxima establecida en el sistema */}
                    {Array.from({ length: config_define.calificacion_max_emprendedor }, (value, index) => (
                      <FontAwesomeIcon
                        key={index}
                        icon={faStar}
                        color={index < item.calificacion_emprendedor ? '#ffd700' : '#dddddd'}
                        size={30}
                        style={{ marginRight: 2 }}
                      />
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  //Funcion para restablecer la lista de emprendedores
  onRefresEmprendedor = () => {

    //Establece el estado de refreshing_emprendedor a verdadero
    this.setState({ refreshing_emprendedor: true, lista_emprendedores: [] }, () => {
      this.obtenerListaEmprendedoresActivosParaIndex();
    });
  };




  /*Seccion para las publicaciones*/

  //Funcion para obtener publicaciones de los emprendedores
  obtenerListaUltimasPublicacionesGeneral = async () => {
    try {
      const { pagina_publicacion, lista_publicaciones } = this.state;


      //Actualiza el estado del mensaje de error de publicacion a vacio eliminando cualquier mensaje de error previo
      this.setState({ mensajePublicacion: '' });

      //Si es la primera pagina se indica que se esta cargando la lista de publicaciones
      if (pagina_publicacion == 1) {
        this.setState({ loading_publicacion: true });
      }

      //Se llama a la funcion que tiene la API para obtener las publicaciones de los emprendedores
      const respuesta = await api_publicacion.obtenerListaUltimasPublicacionesGeneral(pagina_publicacion);

      //Actualiza el estado de la lista de publicaciones recibidas y si se puede cargar mas publicaciones
      this.setState({
        lista_publicaciones: [...lista_publicaciones, ...respuesta.lista_publicaciones],
        cargar_mas_publicaciones: respuesta.cargar_mas_publicaciones,
      });
    } catch (error) {
      //Manejo de errores: Actualiza el estado con el mensaje de error
      this.setState({ mensajePublicacion: error.message });
    } finally {
      //Finaliza el estado de carga y refresco de productos
      this.setState({ refreshing_publicacion: false, loading_publicacion: false });
    }
  };

  //Funcion que renderizar cada elemento de la lista de publicaciones
  renderItemPublicacion = ({ item }) => {
    return (

      //Componente Card para mostrar la informacion del producto
      <Card key={item.detalles_publicaciones.id_publicacion_infomracion}>
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate("PerfilEmprendedor", { id_usuario_emprendedor: item.detalles_publicaciones.id_usuario_emprendedor, nombre_emprendimiento: item.detalles_publicaciones.nombre_emprendimiento });
          }}
        >
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
        </TouchableOpacity>

        {/*Separa la informacion del emprendedor del contenido de la publicacion*/}
        <Card.Divider />


        {/*Se verifica que la publicacion tenga archivos */}
        {item.archivos.length > 0 &&

          /*Componente View que contiene las imagenes/videos de la publicacion*/
          (<View style={{ width: "100%", height: 300 }}>

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
                    <View style={{ width: "100%", height: "90%" ,paddingBottom:50}}>
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

  //Funcion para restablecer la lista de publicaciones
  onRefreshPublicacion = () => {

    //Reinicia la pagina a 1 y establece el estado de refreshing_publicacion a verdadero
    this.setState({ refreshing_publicacion: true, pagina_publicacion: 1, lista_publicaciones: [] }, () => {
      this.obtenerListaUltimasPublicacionesGeneral();
    });
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
        this.obtenerListaUltimasPublicacionesGeneral();
      });
    }
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

  //Funcion para expandir el View de un elemento  
  alternarView = (view) => {
    this.setState((prevState) => ({
      expandViewCard: view === 'card' ? !prevState.expandViewCard : false,
      expandViewTab: view === 'tab' ? !prevState.expandViewTab : false,
    }));
  };

  render() {
    const { index, expandViewCard, expandViewTab,
      //Emprendedores
      lista_emprendedores, loading_emprendedor, mensajeEmprendedor, refreshing_emprendedor,
      //Productos 
      lista_productos, loading_producto, mensajeProducto, refreshing_producto,
      //Publicaciones
      lista_publicaciones, loading_publicacion, mensajePublicacion, refreshing_publicacion, pagina_publicacion
    } = this.state;

    return (
      
      <SafeAreaView style={styles.safeArea}>

        {/*Contenedor principal */}
        <View style={styles.container}>

          {/*Componente View que contiene las ultimas publicaciones del emprendedor*/}
          <View style={[styles.viewCard, { width: '100%', flex: expandViewCard ? 6 : 2 }]}>

            {/*Componente TouchableOpacity para expandir la vista de las publicaciones del emprendedor*/}
            <TouchableOpacity style={styles.header} onPress={() => this.alternarView('card')}>
              <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
                Últimas publicaciones de distintos emprendedores
              </Text>
              <FontAwesomeIcon icon={expandViewCard ? faChevronUp : faChevronDown} size={20} />
            </TouchableOpacity>


            {/*Verifica si hay un mensaje de error*/}
            {mensajePublicacion && (
              /*Se llama a la funcion para obtener un contenedor que muestra un mensaje de error*/
              mostrarMensaje(mensajePublicacion, 'danger')
            )}
            {loading_publicacion && <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />}


            <FlatList
              data={lista_publicaciones}// Datos de la lista que serán renderizados
              renderItem={this.renderItemPublicacion}// Función que renderiza cada elemento de la lista
              keyExtractor={(item, index) => index.toString()}// Función para extraer la clave única para cada elemento
              onEndReachedThreshold={0.5}// Umbral que determina cuánto antes del final de la lista se debe llamar a onEndReached
              onEndReached={this.handleLoadMorePublicacion} // Función que se llama cuando se alcanza el final de la lista
              ListFooterComponent={this.renderFooterPublicacion()}// Componente que se renderiza al final de la lista
              refreshControl={
                <RefreshControl
                  refreshing={refreshing_publicacion}// Estado que indica si la lista se está refrescando
                  onRefresh={this.onRefreshPublicacion}// Función que se llama cuando se realiza un gesto de refresco
                />
              }
              // Componente que se muestra cuando la lista está vacía
              ListEmptyComponent={
                !loading_publicacion && pagina_publicacion === 1 && !mensajePublicacion && (
                  <Text style={styles.textoBusqueda}>No hay publicaciones disponibles</Text>
                )
              }

            />
          </View>

          {/*Componente View que contiene el Tab para la navegacion entre productos y emprendedores */}
          <View style={[styles.viewTab, { width: '100%', flex: expandViewTab ? 6 : 2 }]}>
            <View style={{ width: '100%', flexDirection: 'row', alignSelf: 'center' }}>


              {/*Componente View que contiene el Tab Item para la navegacion entre productos y emprendedores */}
              <View style={{ width: '90%' }}>
                <Tab
                  value={index}
                  onChange={(newValue) => this.setState({ index: newValue })}
                  indicatorStyle={{
                    backgroundColor: 'grey',
                    height: 3,
                  }}
                  style={{ backgroundColor: 'white' }}
                >
                  <Tab.Item title="Productos" titleStyle={styles.tabTitle} />
                  <Tab.Item title="Emprendedores" titleStyle={styles.tabTitle} />
                </Tab>
              </View>

              {/*Componente TouchableOpacity para expandir el Tab de navegacion*/}
              <View style={{ width: '10%' }}>

                <TouchableOpacity style={styles.header} onPress={() => this.alternarView('tab')}>
                  <FontAwesomeIcon
                    icon={expandViewTab ? faChevronUp : faChevronDown}
                    size={20}
                    color="#000"
                  />
                </TouchableOpacity>

              </View>
            </View>

            {/*Componente TabView para mostrar el contenido de cada pestaña */}
            <TabView
              value={index}
              disableSwipe={true}
              onChange={(newValue) => this.setState({ index: newValue })}
              animationType="spring"
            >
              {/* Pestaña Productos */}
              <TabView.Item style={{ width: '100%' }}>
                <View style={{ flex: 1 }}>

                  {/*Verifica si hay un mensaje de error*/}
                  {mensajeProducto && mostrarMensaje(mensajeProducto, 'danger')}

                  {/*Indicador de carga de los datos*/}
                  {loading_producto &&
                    <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                  }

                  {/*Verifica que halla terminado de cargar los productos, que la lista tenga un producto y que no halla un mensaje de error */}
                  {!loading_producto && !mensajeProducto && lista_productos.length > 0 && (
                    <Text style={{ textAlign: 'center', fontSize: 17, fontWeight: 'bold', marginBottom: 10 }}>
                      Algunos productos de los emprendedores registrados
                    </Text>
                  )}
                  <FlatList
                    data={lista_productos}// Datos de la lista que serán renderizados
                    renderItem={this.renderItemProducto}// Función que renderiza cada elemento de la lista
                    keyExtractor={(item, index) => index.toString()}// Función para extraer la clave única para cada elemento
                    onEndReachedThreshold={0.5}// Umbral que determina cuánto antes del final de la lista se debe llamar a onEndReached
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing_producto}// Estado que indica si la lista se está refrescando
                        onRefresh={this.onRefreshProductos}// Función que se llama cuando se realiza un gesto de refresco
                      />
                    }
                    // Componente que se muestra cuando la lista está vacía
                    ListEmptyComponent={
                      !loading_producto && !mensajeProducto && (
                        <Text style={styles.textTitulo}>No hay productos disponibles por el momento</Text>
                      )
                    }
                  />
                </View>
              </TabView.Item>

              {/* Pestaña Emprendedores */}
              <TabView.Item style={{ width: '100%' }}>
                <View style={{ flex: 1 }}>

                  {/*Verifica si hay un mensaje de error*/}
                  {mensajeEmprendedor && mostrarMensaje(mensajeEmprendedor, 'danger')}

                  {/*Indicador de carga de los datos*/}
                  {loading_emprendedor &&
                    <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                  }
                  <FlatList
                    data={lista_emprendedores}// Datos de la lista que serán renderizados
                    renderItem={this.renderItemEmprendedor}// Función que renderiza cada elemento de la lista
                    keyExtractor={(item, index) => index.toString()}// Función para extraer la clave única para cada elemento
                    onEndReachedThreshold={0.5}// Umbral que determina cuánto antes del final de la lista se debe llamar a onEndReached
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing_emprendedor}// Estado que indica si la lista se está refrescando
                        onRefresh={this.onRefresEmprendedor}// Función que se llama cuando se realiza un gesto de refresco
                      />
                    }
                    // Componente que se muestra cuando la lista está vacía
                    ListEmptyComponent={
                      !loading_emprendedor && !mensajeEmprendedor && (
                        <Text style={styles.textoBusqueda}>No hay emprendedores registrados</Text>
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
