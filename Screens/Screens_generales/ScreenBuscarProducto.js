
import React, { Component } from 'react';

//Componentes utilizados en React Native
import { Image, TouchableOpacity, Alert, ActivityIndicator, FlatList, RefreshControl, SafeAreaView, ScrollView, Text, View, Modal } from 'react-native';
import { SearchBar, Card } from '@rneui/themed';
import { List, RadioButton, PaperProvider, TextInput } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';

//Biblioteca para almacenamiento asincrono de datos
import AsyncStorage from '@react-native-async-storage/async-storage';

//Componente para mostrar iconos
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

//Iconos especificos de FontAwesome
import { faMinus, faStar, faChevronRight } from '@fortawesome/free-solid-svg-icons';

//Biblioteca para crear carruseles 
import Swiper from 'react-native-swiper';

//Archivo de estilos
import { styles } from '../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { formatPrecio, mostrarMensaje, formatearFecha, renderPaginationButtons, obtenerCantNotificacionesSinLeer } from '../../config/funciones.js';

//Configuracion de URL y otros parametros
import { config_define } from '../../config/config_define.js';

//Módulo para realizar consultas a las APIs relacionadas
import api_categoria from '../../config/consultas_api/api_categoria.js';
import api_producto from '../../config/consultas_api/api_producto.js';


export class ScreenBuscarProducto extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //Identificador del usuario actual
            id_usuario: null,
            tipo_usuario: null,


            mensaje: '',  //Mensaje de error en caso de problemas al obtener los datos del emprendimiento

            //Datos de los productos
            refreshing_producto: false,//Indica el estado de actualizar toda la pestaña de productos
            cantidad_total_productos: 0,//Indica la cantidad total de productos
            loading_producto: false,//Indica el estado de cargar informacion de las productos
            lista_productos: [],//Lista de productos que se mostraran
            pagina: '',//Indicador que contiene en que pagina se encuentra el usuario y la cantidad de paginas que hay
            pagina_actual: 1,//Pagina actual de productos para la paginacion
            total_paginas: 0,//Indica la cantidad total de paginas para la paginacion

            //Filtro del estado de productos
            modalFiltroEstado: false, //Indica el estado del modal del filtro
            radio_ordenar_por: "1",
            input_calificacion: 'todos_calificacion',
            calificacion: "todos_calificacion",
            precio_minimo: null,
            precio_maximo: null,
            select_categoria: "0",

            //Busqueda predeterminada de productos
            search: "",
            busqueda_activa: false,

            lista_categoria: [],//Lista de categorias que se mostraran

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
            tipo_usuario: tipoUsuario,

        }, () => {
            //Despues de actualizar el estado, se llaman a las funciones para obtener a los productos
            this.obtenerDatosIniciales();
        });

        //Agrega un listener para actualizar las categorias,productos y notificaciones cuando la pantalla esta enfocada
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.obtenerDatosInicialesPantallaEnfocada();
        });

    }

    //Funcion para obtener categorias de productos cuando la pantalla esta enfocada
    obtenerDatosInicialesPantallaEnfocada = async () => {
        const { id_usuario, tipo_usuario } = this.state;
        try {

            //Actualiza el estado para cargar mas categorias
            this.setState({ loading_producto: true, lista_categoria: [], mensaje: '' });
            //Se llama a la funcion que tiene la API para obtener categorias de productos
            const respuesta_categoria = await api_categoria.obtenerListaCategoria();
            //Actualiza el estado de la lista de categorias
            this.setState({ lista_categoria: respuesta_categoria.lista_categoria });
        }
        catch (error) {

            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensaje: error.message
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {

            //Finaliza el estado de carga y refresco de producto
            this.setState({ refreshing_producto: false, loading_producto: false });

            //Actualiza el numero de notificaciones en caso que el usuario halla iniciado sesion
            if (id_usuario && tipo_usuario) {
                obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
            }
        }
    };

    //Funcion para obtener categorias de productos y los productos disponibles
    obtenerDatosIniciales = async () => {
        const { id_usuario, tipo_usuario, search, pagina_actual, radio_ordenar_por, precio_minimo, precio_maximo, calificacion, select_categoria } = this.state;
        try {

            //Actualiza el estado para cargar mas productos y categorias
            this.setState({ loading_producto: true, mensaje: '', lista_categoria: [], lista_productos: [] });

            //Se llama a la funcion que tiene la API para obtener categorias de productos
            const respuesta_categoria = await api_categoria.obtenerListaCategoria();
            //Actualiza el estado de la lista de categorias
            this.setState({ lista_categoria: respuesta_categoria.lista_categoria });


            //Se llama a la funcion que tiene la API para obtener productos
            const respuesta_producto = await api_producto.obtenerListaProductosConImagenesBuscador(search, pagina_actual, radio_ordenar_por, precio_minimo, precio_maximo, calificacion, select_categoria);

            //Actualiza el estado de la lista de producto ademas de otros elementos necesarios para la interfaz
            this.setState({
                lista_productos: respuesta_producto.lista_productos,
                cantidad_total_productos: respuesta_producto.cantidad_total_productos,
                busqueda_activa: respuesta_producto.busqueda_activa,
                total_paginas: respuesta_producto.total_paginas,
                pagina: respuesta_producto.pagina,
            });
        }
        catch (error) {

            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensaje: error.message
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {

            //Finaliza el estado de carga y refresco de producto
            this.setState({ refreshing_producto: false, loading_producto: false });

            //Actualiza el numero de notificaciones en caso que el usuario halla iniciado sesion
            if (id_usuario && tipo_usuario) {
                obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
            }
        }
    };


    //Funcion para obtener los productos disponibles
    obtenerListaProductosBuscador = async () => {
        const { id_usuario, tipo_usuario, search, pagina_actual, radio_ordenar_por, precio_minimo, precio_maximo, calificacion, select_categoria } = this.state;

        try {
            //Actualiza el estado para cargar mas productos
            this.setState({ loading_producto: true, mensaje: '', lista_productos: [] });

            //Se llama a la funcion que tiene la API para obtener productos
            const respuesta = await api_producto.obtenerListaProductosConImagenesBuscador(search, pagina_actual, radio_ordenar_por, precio_minimo, precio_maximo, calificacion, select_categoria);

            //Actualiza el estado de la lista de producto ademas de otros elementos necesarios para la interfaz
            this.setState({
                lista_productos: respuesta.lista_productos,
                cantidad_total_productos: respuesta.cantidad_total_productos,
                busqueda_activa: respuesta.busqueda_activa,
                total_paginas: respuesta.total_paginas,
                pagina: respuesta.pagina,
            });
        }
        catch (error) {

            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensaje: error.message
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {

            //Finaliza el estado de carga y refresco de producto
            this.setState({ refreshing_producto: false, loading_producto: false });

            //Actualiza el numero de notificaciones en caso que el usuario halla iniciado sesion
            if (id_usuario && tipo_usuario) {
                obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
            }
        }
    };


    //Actualiza el estado del componente del texto de busqueda
    handleTextSearch = (texto) => {
        //Establece la pagina a 1 ademas de agregar el valor en el campo de busqueda
        //Despues se llama a la funcion para obtener una lista de productos
        this.setState({ search: texto, pagina_actual: 1 }, () => {
            this.obtenerListaProductosBuscador();
        });
    };

    //Actualiza el estado del componente del precio minimo
    handleChangeMinimo = (precio) => {
        this.setState({ input_precio_minimo: precio });
    };

    //Actualiza el estado del componente del precio maximo
    handleChangeMaximo = (precio) => {
        this.setState({ input_precio_maximo: precio });
    };

    //Actualiza el estado del componente de la categoria del producto
    handleCategoriaChange = (nueva_categoria) => {

        //Establece la pagina a 1 ademas de cambiar la categoria a buscar del producto
        //Despues se llama a la funcion para obtener una lista de productos
        this.setState({
            pagina_actual: 1,
            select_categoria: nueva_categoria
        }, () => {
            this.obtenerListaProductosBuscador();
        });
    };

    //Funcion para cambiar la pagina actual
    cambiarPagina = (pagina) => {
        //Despues de actualizar el numero de pagina se llama a la funcion para obtener una lista de productos
        this.setState({ pagina_actual: pagina }, () => {
            this.obtenerListaProductosBuscador();
        });

    };

    //Actualiza el estado del componente del orden de los productos
    setChecked = (num_ordenar) => {
        //Establece la pagina a 1 ademas de cambiar el radio_ordenar_por por el nuevo valor
        //Despues se llama a la funcion para obtener una lista de productos
        this.setState({ pagina_actual: 1, radio_ordenar_por: num_ordenar }, () => {
            this.obtenerListaProductosBuscador();
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
            pagina_actual: 1
        }, () => {
            this.obtenerListaProductosBuscador();
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
            pagina_actual: 1
        }, () => {
            this.obtenerListaProductosBuscador();
        });
    };


    //Funcion para restablecer los valores del filtro del modal
    restablecer_valores_modal() {

        //Restablece los valores del modal y tambien la pagina a 1
        //Despues se llama a la funcion para obtener una lista de productos
        this.setState({
            pagina_actual: 1,
            radio_ordenar_por: "1",
            precio_minimo: null,
            precio_maximo: null,
            input_precio_minimo: null,
            input_precio_maximo: null,
            input_calificacion: "todos_calificacion",
            calificacion: "todos_calificacion",
            select_categoria: 0
        }, () => {
            this.obtenerListaProductosBuscador();
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
                    pagina_actual: 1,
                    precio_minimo: min,
                    precio_maximo: max
                }, () => {
                    this.obtenerListaProductosBuscador();
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

        const { id_usuario, tipo_usuario } = this.state;

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
                </TouchableOpacity>

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

                {/*Verifica que el usuario sea un emprendedor */}
                {tipo_usuario == 2 && id_usuario == item.detalles_producto.id_usuario &&
                    (
                        /*Componente View que muestra que el usuario lo publico*/
                        < View style={{ marginTop: 20, height: 50, paddingTop: 10, backgroundColor: '#EBEBEB' }}>
                            <Text style={{
                                color: '#6c757d',
                                fontSize: 16,
                                textAlign: 'center',
                            }}>Es uno de tus productos</Text>
                        </View>
                    )
                }
            </Card >
        );
    };

    //Funcion para restablecer la lista de productos
    onRefresh = () => {
        //Reinicia la pagina a 1 y establece el estado de refreshing_producto a verdadero
        //Despues se llama a la funcion para obtener una lista de productos
        this.setState({ refreshing_producto: true, pagina_actual: 1 }, () => {
            this.obtenerDatosIniciales();
        });
    };

    render() {
        const { mensaje, loading_producto, lista_categoria, lista_productos,


            cantidad_total_productos, refreshing_producto,
            busqueda_activa, search, modalFiltroEstado, total_paginas, pagina_actual, pagina,
            radio_ordenar_por, input_calificacion, calificacion, select_categoria, input_precio_minimo, input_precio_maximo
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
                <View style={[styles.container, { paddingStart: 8, paddingEnd: 8, paddingBottom: 0, paddingTop: 10 }]}>

                    {/*Componente View que contiene la lista de productos, un boton de filtro y una barras de busqueda */}
                    <View style={[styles.viewCard, { flex: 1 }]}>
                        <SearchBar
                            placeholder="Buscar producto"
                            value={search}
                            onChangeText={this.handleTextSearch.bind(this)}
                            round={true}
                            lightTheme={true}
                            containerStyle={styles.container_search}
                            inputContainerStyle={{ backgroundColor: 'white' }}
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

                        <View style={{ flex: 1 }}>
                            {/*Mensaje de alerta si hay uno*/}
                            {mensaje && (
                                mostrarMensaje(mensaje, 'danger')
                            )}

                            {/*Indicador de carga si esta cargando datos*/}
                            {loading_producto &&
                                <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                            }

                            <View>

                                {/*Verifica que el usuario inicio una busqueda y que la lista de productos  sea mayor a 0 para mostrar la cantidad de resultados de busqueda*/}
                                {busqueda_activa && lista_productos.length > 0 && <Text style={{ fontSize: 25, marginStart: 15 }}>Resultados:{cantidad_total_productos}</Text>}
                                <FlatList
                                    data={lista_productos}// Datos de la lista que serán renderizados
                                    renderItem={this.renderItemProducto}// Función que renderiza cada elemento de la lista
                                    keyExtractor={(item, index) => index.toString()}// Función para extraer la clave única para cada elemento
                                    onEndReachedThreshold={0.5}// Umbral que determina cuánto antes del final de la lista se debe llamar a onEndReached
                                    ListFooterComponent={lista_productos.length > 0 && (renderPaginationButtons(total_paginas, pagina_actual, '', pagina, this.cambiarPagina))}// Componente que se renderiza al final de la lista
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing_producto}// Estado que indica si la lista se está refrescando
                                            onRefresh={this.onRefresh}// Función que se llama cuando se realiza un gesto de refresco
                                        />
                                    }
                                    // Componente que se muestra cuando la lista está vacía
                                    ListEmptyComponent={
                                        !loading_producto && !mensaje && (
                                            busqueda_activa ?
                                                <Text style={styles.textoBusqueda}>Sin resultados</Text> :
                                                <Text style={styles.textoBusqueda}>No hay productos disponibles</Text>)
                                    }
                                />
                            </View>
                        </View>
                    </View>

                </View>


                {/*Modal filtro*/}

                <View>
                    <PaperProvider theme={theme}>
                        {/* Proveedor de temas de Paper para estilos consistentes */}

                        <Modal
                            visible={modalFiltroEstado} // Controla si el modal está visible o no
                            animationType="fade" // Tipo de animación cuando se muestra o se oculta el modal
                            statusBarTranslucent={false} // Configuración translúcida para la barra de estado 
                            transparent={true} // Hacer el fondo del modal transparente
                        >

                            <ScrollView style={styles.modalViewFondo}>
                                <View style={[styles.modalView, { marginTop: '10%' }]}>


                                    {/* Sección de filtros */}
                                    <List.Section titleStyle={{ fontSize: 25 }} title="Filtros" >
                                        <View style={{ borderRadius: 6, borderColor: '#dee2e6', borderWidth: 1, marginBottom: 20 }}>


                                            {/* Acordeón para ordenar productos */}
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

                                            {/* Acordeón para el rango de precio*/}
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


                                            {/* Acordeón para la calificacion del productos */}
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
                                                            {Array.from({ length: 5 }, (value, index) => (
                                                                <TouchableOpacity key={index + 1}
                                                                    onPress={() => this.handleStarClick(index + 1)}>
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

                                            {/* Acordeón para la categooria del productos*/}
                                            <List.Accordion title="Categoria"
                                                theme={{ colors: { primary: 'black' } }}
                                                style={{ borderColor: '#dee2e6', borderTopWidth: 1 }}
                                            >
                                                <View style={styles.lista_acordeon}>
                                                    <View style={styles.viewSelectFiltro}>
                                                        <RNPickerSelect
                                                            value={select_categoria}
                                                            onValueChange={this.handleCategoriaChange}
                                                            placeholder={{}}
                                                            style={{ inputAndroid: styles.inputBusqueda }}
                                                            items={[
                                                                { label: 'Todos', value: '0' },
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
                                        </View>
                                    </List.Section>

                                    {/*Componente View que contiene dos TouchableOpacity para restablecer los valores del modal y cerrar el modal */}
                                    <View style={{ flexDirection: 'row', alignSelf: 'center' }}>

                                        {/*Componente TouchableOpacity para restablecer los valores del modal*/}
                                        <TouchableOpacity
                                            style={styles.boton}
                                            onPress={() => this.restablecer_valores_modal()}
                                        >
                                            <Text style={styles.textoBoton}>Restablecer Filtro</Text>
                                        </TouchableOpacity>

                                        {/*Componente TouchableOpacity cerrar el modal */}
                                        <TouchableOpacity
                                            style={styles.boton}
                                            onPress={() => this.setState({ modalFiltroEstado: false })}
                                        >
                                            <Text style={styles.textoBoton}>Cerrar</Text>
                                        </TouchableOpacity>
                                    </View>

                                </View>
                            </ScrollView>

                        </Modal>
                    </PaperProvider>
                </View>
            </SafeAreaView >
        );
    }
}