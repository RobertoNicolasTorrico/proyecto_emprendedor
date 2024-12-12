import React, { Component } from 'react';

//Componentes utilizados en React Native
import { Image, TouchableOpacity, Alert, ActivityIndicator, FlatList, RefreshControl, SafeAreaView, ScrollView, Text, View, Modal } from 'react-native';
import { SearchBar, Card } from '@rneui/themed';
import { List, PaperProvider, TextInput } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';

//Biblioteca para almacenamiento asincrono de datos
import AsyncStorage from '@react-native-async-storage/async-storage';

//Componente para mostrar iconos
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

//Iconos especificos de FontAwesome
import { faCircle } from '@fortawesome/free-solid-svg-icons';

//Archivo de estilos
import { styles } from '../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { formatPrecio, mostrarMensaje, formatearFecha, renderPaginationButtons, obtenerCantNotificacionesSinLeer } from '../../config/funciones.js';

//Configuracion de URL y otros parametros
import { config_define } from '../../config/config_define.js';

//Módulo para realizar consultas a las APIs relacionadas
import api_preguntas from '../../config/consultas_api/api_preguntas.js';
import api_estado from '../../config/consultas_api/api_estado.js';

export class ScreenMisPreguntas extends Component {
    constructor(props) {
        super(props);
        this.state = {

            //Identificador del usuario actual
            id_usuario: null,
            tipo_usuario: null,

            mensajePregunta: '',  //Mensaje de error al obtener los datos de las preguntas

            //Datos de las preguntas
            refreshing_preguntas: false,//Indica el estado de actualizar toda la pestaña de preguntas
            cantidad_total_preguntas: 0,//Indica la cantidad total de pregunta
            cantidad_actual_preguntas: 0,//Indica la actual total de pregunta
            loading_preguntas: false,//Indica el estado de cargar informacion de las preguntas
            lista_preguntas: [],//Lista de preguntas que se mostraran
            pagina: '',//Indicador que contiene en que pagina se encuentra el usuario y la cantidad de paginas que hay
            registro: '', //Indicador que muestra la cantidad de elementos que se ve en la interfaz
            pagina_actual: 1,//Pagina actual de preguntas para la paginacion
            total_paginas: 0,//Indica la cantidad total de paginas para la paginacion

            //Filtro del estado de preguntas
            select_cant_preguntas: '5',//Indicador de cantidad de preguntas que se mostraran
            select_ult_fecha: '0', //Indica desde que fecha se va a mostrar
            select_estado: '0', //Indica el estado de los productos que se van a ver
            modalFiltroEstado: false, //Indica el estado del modal del filtro

            //Busqueda predeterminada de producto
            search: "",
            busqueda_activa: false,//Indica si el usuario buscar una pregunta hecha


            lista_estado: [],//Lista de estados de productos que se mostraran

            //Modal para hacer otra pregunta
            id_productoSeleccionado: null,//Indica el ID producto seleccionado para hacer otra pregunta
            modalHacerOtraPregunta: false,//Indica el estado del modal para hacer otra pregunta
            loading_agregar_pregunta: false, // Indica el estado al agregar una nueva pregunta
            txtPregunta: '',    //Texto que contiene la pregunta que se va enviar
            alertModalErrorAgregarPregunta: '',//Mensaje de error al hacer otra pregunta


            //Modal para eliminar una pregunta
            modalEliminarPregunta: false,//Indica el estado del modal para eliminar una pregunta
            preguntaSeleccionada: {
                id_pregunta_respuesta: null, //Indica el ID de la pregunta seleccionada para eliminar
                pregunta: '', //Indica la pregunta que se va eliminar
                fechaPregunta: '', //Indica la fecha de la pregunta que se va a eliminar
            },
            alertModalErrorEliminarPregunta: '',//Mensaje de error al eliminar la pregunta
            loading_eliminar_pregunta: false,// Indica el estado al eliminar una pregunta
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
            //Despues de actualizar el estado, se llama a la funcion para obtener el estado de los productos, las preguntas y las notificaciones
            this.obtenerDatosIniciales();
        });

        //Agrega un listener para actualizar las notificaciones y las preguntas hechas cuando la pantalla esta enfocada 
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.obtenerDatosIniciales();
        });
    };


    //Se obtiene los datos iniciales necesarios para la interfaz del usuario
    obtenerDatosIniciales = async () => {
        const { id_usuario, tipo_usuario, search, select_cant_preguntas, pagina_actual, select_ult_fecha, select_estado } = this.state;
        try {
            this.setState({ loading_preguntas: true, lista_preguntas: [], mensajePregunta: '' });

            //Se llama a la funcion que tiene la API para obtener los estados de los productos
            const respuesta_estado = await api_estado.obtenerListaEstados();

            //Actualiza el estado de la lista de los estados que puede tener un producto
            this.setState({ lista_estado: respuesta_estado.lista_estado });

            //Se llama a la funcion que tiene la API para obtener las preguntas que hizo el usuario
            const respuesta = await api_preguntas.obtenerListaPreguntasUsuario(id_usuario, tipo_usuario, search, select_cant_preguntas, pagina_actual, select_ult_fecha, select_estado);

            //Actualiza el estado de la lista de preguntas ademas de otros elementos necesarios para la interfaz
            this.setState({
                lista_preguntas: respuesta.lista_pregunta,
                cantidad_total_preguntas: respuesta.cant_total_preguntas,
                cantidad_actual_preguntas: respuesta.cantidad_actual,
                busqueda_activa: respuesta.busqueda_activa,
                total_paginas: respuesta.totalPaginas,
                pagina: respuesta.pagina,
                registro: respuesta.registro
            });

        }
        catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensajePregunta: error.message
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            //Finaliza el estado de carga y refresco de preguntas
            this.setState({ refreshing_preguntas: false, loading_preguntas: false });

            //Actualiza el numero de notificaciones
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
        }
    };

    //Actualiza el estado del componente del estado del producto
    handleEstadoChange = (nuevo_estado) => {
        //Establece la pagina a 1 ademas de cambiar el estado a buscar del producto
        //Despues se llama a la funcion para obtener las preguntas hechas que cumplen los criterios de busqueda

        this.setState({
            pagina_actual: 1, select_estado: nuevo_estado
        }, () => {
            this.obtenerListaMisPreguntas();
        });
    };

    //Actualiza el estado del componente del texto de busqueda
    handleTextSearch(texto) {
        //Establece la pagina a 1 ademas de agregar el valor en el campo de busqueda
        //Despues se llama a la funcion para obtener las preguntas hechas que cumplen los criterios de busqueda

        this.setState({ search: texto, pagina_actual: 1 }, () => {
            this.obtenerListaMisPreguntas();
        });
    };

    //Actualiza el estado del componente de cantidad de preguntas a mostrar
    handleCantPreguntasChange = (nuevo_cantidad) => {
        //Establece la pagina a 1 ademas de cambiar el valor de cantidad de preguntas a mostrar
        //Despues se llama a la funcion para obtener las preguntas hechas que cumplen los criterios de busqueda
        this.setState({ pagina_actual: 1, select_cant_preguntas: nuevo_cantidad }, () => {
            this.obtenerListaMisPreguntas();
        });
    };

    //Actualiza el estado del componente para mostrar desde que fecha mostrar
    handleMostrarPreguntasChange = (dias) => {

        //Establece la pagina a 1 ademas de cambiar el valor de fecha 
        //Despues se llama a la funcion para obtener las preguntas hechas que cumplen los criterios de busqueda
        this.setState({ pagina_actual: 1, select_ult_fecha: dias }, () => {
            this.obtenerListaMisPreguntas();
        });
    };

    //Funcion para restablecer los valores del filtro del modal
    restablecer_valores_modal() {

        //Restablece los valores del modal y tambien la pagina a 1
        //Despues se llama a la funcion para obtener las preguntas hechas que cumplen los criterios de busqueda

        this.setState({
            pagina_actual: 1,
            select_cant_preguntas: '5',
            select_ult_fecha: '0',
            select_estado: '0',
        }, () => {
            this.obtenerListaMisPreguntas();
        });
    };

    //Funcion para obtener las preguntas hechas por el usuario
    obtenerListaMisPreguntas = async () => {
        const { id_usuario, tipo_usuario, search, select_cant_preguntas, pagina_actual, select_ult_fecha, select_estado } = this.state;

        try {
            //Actualiza el estado para cargar las preguntas ademas de eliminar cualquier mensaje de error previo
            this.setState({ loading_preguntas: true, lista_preguntas: [], mensajePregunta: '' });

            //Se llama a la funcion que tiene la API para obtener las preguntas que hizo el usuario
            const respuesta = await api_preguntas.obtenerListaPreguntasUsuario(id_usuario, tipo_usuario, search, select_cant_preguntas, pagina_actual, select_ult_fecha, select_estado);


            //Actualiza el estado de la lista de preguntas ademas de otros elementos necesarios para la interfaz
            this.setState({
                lista_preguntas: respuesta.lista_pregunta,
                cantidad_total_preguntas: respuesta.cant_total_preguntas,
                cantidad_actual_preguntas: respuesta.cantidad_actual,
                busqueda_activa: respuesta.busqueda_activa,
                total_paginas: respuesta.totalPaginas,
                pagina: respuesta.pagina,
                registro: respuesta.registro
            });

        }
        catch (error) {

            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensajePregunta: error.message
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {

            //Finaliza el estado de carga y refresco de preguntas
            this.setState({ refreshing_preguntas: false, loading_preguntas: false });

            //Actualiza el numero de notificaciones
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);

        }
    };

    //Funcion para restablecer la lista de preguntas
    onRefreshPreguntas = () => {
        //Reinicia la pagina a 1 y establece el estado de refreshing_preguntas a verdadero
        //Despues se llama a la funcion para obtener las preguntas hechas que cumplen los criterios de busqueda
        this.setState({ refreshing_preguntas: true, pagina_actual: 1 }, () => {
            this.obtenerDatosIniciales();
        });
    };


    //Funcion para cambiar la pagina actual
    cambiarPagina = (pagina) => {
        //Despues de actualizar el numero de pagina se llama a la funcion para obtener una lista de preguntas
        this.setState({ pagina_actual: pagina }, () => {
            this.obtenerListaMisPreguntas();
        });
    };

    //Funcion para enviar otra pregunta al producto
    enviar_pregunta = async () => {
        const { id_usuario, tipo_usuario, txtPregunta, id_productoSeleccionado } = this.state;

        try {
            //Actualiza el estado para hacer otra pregunta para evitar errores cuando se este llamando a la API ademas de eliminar cualquier mensaje previo
            this.setState({ loading_agregar_pregunta: true, alertModalErrorAgregarPregunta: '' });

            //Se llama a la funcion que tiene la API para hacer mas preguntas al producto
            const resultado = await api_preguntas.altaPregunta(id_usuario, tipo_usuario, txtPregunta, id_productoSeleccionado);

            //Actualiza el estado para cerrar el modal ademas de borrar el campo de la pregunta
            //Despues se llama a la funcion para obtener las preguntas hechas que cumplen los criterios de busqueda

            this.setState({
                modalHacerOtraPregunta: false, txtPregunta: ''
            }, () => {
                this.obtenerListaMisPreguntas();
                Alert.alert("Exito", resultado.mensaje);
            });


        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                alertModalErrorAgregarPregunta: error.message
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {

            //Finaliza el estado de carga enviar pregunta
            this.setState({ loading_agregar_pregunta: false });

            //Actualiza el numero de notificaciones
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);

        }
    };

    //Funcion que renderizar cada elemento de la lista de pregunta
    renderItemPreguntasProducto = ({ item }) => {
        return (
            //Componente Card para mostrar la informacion sobre el producto y las preguntas qur hizo el usuario
            <Card key={item.detalles_producto.id_producto}>

                {/*Componente View que contiene la informacion del producto*/}
                <View style={{ backgroundColor: '#F1F1F1', width: '100%', padding: 10 }}>
                    <View style={{ width: '100%', flexDirection: 'row' }}>
                        {/*Componente View para mostrar una imagen del producto*/}
                        <View style={{ width: '30%', borderColor: "#CEC8C8", borderWidth: 1 }}>
                            <Image
                                style={{ width: "100%", height: 70 }}
                                resizeMode="contain"
                                source={{
                                    uri: `${config_define.urlBase}/uploads/${item.detalles_producto.id_usuario_emprendedor}/publicaciones_productos/${item.detalles_producto.nombre_carpeta}/${item.detalles_producto.nombre_archivo}`
                                }}
                            />
                        </View>

                        {/*Componente View que contiene el nombre del producto*/}
                        <View style={{ width: '70%' }}>
                            <Text style={styles.textTitulo}>{item.detalles_producto.nombre_producto}</Text>
                        </View>
                    </View>
                    <View style={{ width: '100%' }}>
                        {/*Stock del producto */}
                        <Text style={[styles.tamanio_texto, { marginTop: 10, marginBottom: 10 }]}>
                            <Text style={styles.caracteristica}>Stock:</Text>{item.detalles_producto.stock}
                        </Text>


                        {/* Precio del producto */}
                        <Text style={[styles.tamanio_texto, { marginTop: 10, marginBottom: 10 }]}>
                            <Text style={styles.caracteristica}>Precio:</Text>{formatPrecio(item.detalles_producto.precio)}
                        </Text>

                        {/* Estado del producto */}
                        <Text style={[styles.tamanio_texto, { marginTop: 10, marginBottom: 10 }]}>
                            <Text style={styles.caracteristica}>Estado:</Text>{item.detalles_producto.estado}
                        </Text>
                    </View>


                </View>

                {/*Separa los botones para hacer otra pregunta o navegar hacia los detalles del producto*/}
                <Card.Divider />

                {/*Se verifica que el estado del producto este disponible para hacer otra pregunta o ver el detalles del producto */}
                {item.detalles_producto.estado === 'Disponible' && (

                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>

                        {/*Componente TouchableOpacity para hacer otra pregunta al producto */}
                        <TouchableOpacity
                            style={[styles.boton, styles.botonConfirmacion]}
                            onPress={() => this.setState({
                                modalHacerOtraPregunta: true,
                                id_productoSeleccionado: item.detalles_producto.id_producto
                            })}
                        >
                            <Text style={[styles.textoBoton, styles.textoConfirmacion]}>Hacer otra pregunta</Text>
                        </TouchableOpacity>

                        {/*Componente TouchableOpacity para navegar a los detalles del producto */}
                        <TouchableOpacity
                            style={[styles.boton, styles.botonInfo]}
                            onPress={() => {
                                this.props.navigation.navigate("DetallesProducto", { id_producto: item.detalles_producto.id_producto });
                            }}
                        >
                            <Text style={[styles.textoBoton, styles.textoInfo]}>Ver producto</Text>
                        </TouchableOpacity>

                    </View>
                )}

                {/*Separa la informacion de las preguntas del producto*/}
                <Card.Divider />


                {/*Componente View que contiene las preguntas y respuestas del producto*/}
                {item.preguntas_hechas.map(preguntaHecha =>
                    //Componente View que contiene la pregunta y respuesta del producto en caso que fue respondida
                    <View key={preguntaHecha.id_pregunta_respuesta}
                        style={[
                            {
                                borderWidth: 1,
                                marginBottom: 20,
                                paddingTop: 20,
                                paddingBottom: 20,
                                borderRadius: 10,
                                borderColor: '#dee2e6'
                            },
                            !preguntaHecha.respuesta && { backgroundColor: '#0000000a' }
                        ]}
                    >
                        { /*Componente View que contiene la pregunta y la fecha que se hizo la pregunta*/}
                        <View style={{ paddingLeft: 15, flexDirection: 'row', alignItems: 'center' }}>
                            <FontAwesomeIcon
                                icon={faCircle}
                                color={'black'}
                                size={7}
                                style={{ marginRight: 5 }}
                            />
                            <Text style={[styles.tamanio_texto, { marginBottom: 5 }]}>
                                <Text>{preguntaHecha.pregunta}</Text>
                                <Text style={styles.text_fecha}>({formatearFecha(preguntaHecha.fecha_pregunta)})</Text>
                            </Text>
                        </View>

                        { /*Se verifica que se halla respondido  la pregunta en caso que no va a poder eliminar la pregunta*/}
                        {preguntaHecha.respuesta ? (

                            //Componente View que contiene la respuesta y la fecha que fue respondida  
                            < View style={{ paddingLeft: 25, flexDirection: 'row', alignItems: 'center' }}>
                                <FontAwesomeIcon
                                    icon={faCircle}
                                    color={'black'}
                                    size={7}
                                    style={{ marginRight: 5 }}
                                />
                                <Text style={[styles.tamanio_texto, { marginBottom: 5 }]}>
                                    <Text>{preguntaHecha.respuesta}</Text>
                                    <Text style={styles.text_fecha}>({formatearFecha(preguntaHecha.fecha_respuesta)})</Text>
                                </Text>
                            </View>
                        ) :
                            <View style={{ marginTop: 10 }}>
                                {/*Componente TouchableOpacity para abrir el modal para eliminar la pregunta */}
                                <TouchableOpacity
                                    style={[styles.boton, styles.botonBaja]}
                                    onPress={() => this.setState({
                                        modalEliminarPregunta: true,
                                        preguntaSeleccionada: {
                                            id_pregunta_respuesta: preguntaHecha.id_pregunta_respuesta,
                                            pregunta: preguntaHecha.pregunta,
                                            fechaPregunta: formatearFecha(preguntaHecha.fecha_pregunta),
                                        },
                                    })}
                                >
                                    <Text style={[styles.textoBoton, styles.textoBaja]}>Eliminar Pregunta</Text>
                                </TouchableOpacity>
                            </View>

                        }
                    </View>
                )
                }
            </Card >
        );
    };

    //Funcion para eliminar una pregunta hecha mientras que no este respondida 
    eliminar_pregunta = async () => {
        const { id_usuario, tipo_usuario, preguntaSeleccionada, cantidad_actual_preguntas, pagina_actual } = this.state;

        try {
            //Actualiza el estado para eliminar una preguntar para evitar errores cuando se este llamando a la API ademas de eliminar cualquier mensaje previo
            this.setState({ loading_eliminar_pregunta: true, alertModalErrorEliminarPregunta: '' });

            var pagina = pagina_actual;

            //Se llama a la funcion que tiene la API para eliminar la pregunta
            const resultado = await api_preguntas.bajaPregunta(id_usuario, tipo_usuario, preguntaSeleccionada.id_pregunta_respuesta);


            //En caso que la cantidad de preguntas que se ve en la interfaz sea igual 1 y la pagina actual es mayor a 1
            //Se va restar uno a la pagina debido a la eliminacion de pregunta
            if (cantidad_actual_preguntas == 1 && pagina_actual > 1) {
                pagina = pagina - 1;
            }

            //Actualiza el estado para cerrar el modal de eliminar la pregunta 
            //Despues se llama a la funcion para obtener las preguntas hechas que cumplen los criterios de busqueda
            this.setState({
                modalEliminarPregunta: false, pagina_actual: pagina
            }, () => {
                this.obtenerListaMisPreguntas();
                Alert.alert("Exito", resultado.mensaje);
            });

        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                alertModalErrorEliminarPregunta: error.message
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {

            //Finaliza el estado de carga para eliminar la pregunta
            this.setState({ loading_eliminar_pregunta: false });

            //Actualiza el numero de notificaciones
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
        }
    };

    render() {
        const {
            preguntaSeleccionada,
            //Busqueda
            cantidad_total_preguntas, busqueda_activa, search,
            //Lista de estado de los productos
            lista_estado,
            //Lista de preguntas recibidas
            lista_preguntas, loading_preguntas, mensajePregunta, refreshing_preguntas, pagina_actual, registro, pagina, total_paginas,
            //Modal filtro
            modalFiltroEstado, select_estado, select_cant_preguntas, select_ult_fecha,
            //Modal otra pregunta
            modalHacerOtraPregunta, loading_agregar_pregunta, alertModalErrorAgregarPregunta, txtPregunta,
            //Modal eliminar
            modalEliminarPregunta, loading_eliminar_pregunta, alertModalErrorEliminarPregunta
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

                    {/*Componente View que contiene la lista de preguntas, un boton de filtro y una barra de busqueda */}
                    <View style={[styles.viewCard, { flex: 1 }]}>

                        {/*Componente SearchBar que se utiliza para buscar las preguntas hechas del producto escrito*/}
                        <SearchBar
                            placeholder="Nombre del producto"
                            value={search}
                            onChangeText={this.handleTextSearch.bind(this)}
                            round={true}
                            lightTheme={true}
                            containerStyle={styles.container_search}
                            inputContainerStyle={{ backgroundColor: 'white' }}
                        />

                        {/*Componente View que contiene un TouchableOpacity para abrir el modal de filtro*/}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 }}>
                            <TouchableOpacity
                                style={styles.boton}
                                onPress={() => this.setState({ modalFiltroEstado: true })}
                            >
                                <Text style={styles.textoBoton}>Filtros</Text>
                            </TouchableOpacity>
                        </View>

                        {/*Componente View que contiene la lista de preguntas para mostrar*/}
                        <View style={{ flex: 1 }}>
                            {/*Verifica si hay un mensaje de error*/}
                            {mensajePregunta && (
                                /*Se llama a la funcion para obtener un contenedor que muestra un mensaje de error*/
                                mostrarMensaje(mensajePregunta, 'danger')
                            )}

                            {loading_preguntas && <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />}


                            <View >

                                {/*Verifica que el usuario inicio una busqueda y que la lista de preguntas sea mayor a 0 para mostrar la cantidad de resultados de busqueda*/}
                                {busqueda_activa && lista_preguntas.length > 0 && <Text style={{ fontSize: 25, marginStart: 15 }}>Resultados:{cantidad_total_preguntas}</Text>}
                                <FlatList
                                    data={lista_preguntas}// Datos de la lista que serán renderizados
                                    renderItem={this.renderItemPreguntasProducto}// Función que renderiza cada elemento de la lista
                                    keyExtractor={(item, index) => index.toString()}// Función para extraer la clave única para cada elemento
                                    onEndReachedThreshold={0.5} // Umbral que determina cuánto antes del final de la lista se debe llamar a onEndReached
                                    ListFooterComponent={lista_preguntas.length > 0 && (renderPaginationButtons(total_paginas, pagina_actual, registro, pagina, this.cambiarPagina))}// Componente que se renderiza al final de la lista
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing_preguntas}// Estado que indica si la lista se está refrescando
                                            onRefresh={this.onRefreshPreguntas} // Función que se llama cuando se realiza un gesto de refresco

                                        />
                                    }
                                    // Componente que se muestra cuando la lista está vacía
                                    ListEmptyComponent={
                                        !loading_preguntas && !mensajePregunta && (
                                            busqueda_activa ?
                                                <Text style={styles.textoBusqueda}>Sin resultados</Text> :
                                                <Text style={styles.textoBusqueda}>Por el momento no hiciste alguna pregunta</Text>)
                                    }
                                />
                            </View>
                        </View>
                    </View>

                    {/*Modal Filtro de preguntas*/}
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
                                    <View style={[styles.modalView, { marginTop: '15%' }]}>

                                        {/* Sección de filtros */}
                                        <List.Section titleStyle={{ fontSize: 25 }} title="Filtros">
                                            <View style={{ borderRadius: 6, borderColor: '#dee2e6', borderWidth: 1, marginBottom: 20 }}>
                                                {/* Acordeón para el estado de la publicación del producto */}
                                                <List.Accordion
                                                    title="Estado de la publicación"
                                                    theme={{ colors: { primary: 'black' } }}
                                                >
                                                    <View style={styles.lista_acordeon}>
                                                        <View style={styles.viewSelectFiltro}>
                                                            {/* Select para el estado de la publicación del producto*/}
                                                            <RNPickerSelect
                                                                value={select_estado} // Valor actual seleccionado
                                                                onValueChange={this.handleEstadoChange} // Función que maneja el cambio de select
                                                                placeholder={{}} // Espacio reservado en el select
                                                                style={{ inputAndroid: styles.inputBusqueda }} // Estilo para el select en Android
                                                                items={[
                                                                    { label: 'Todos', value: '0' }, // Opción para mostrar todas las publicaciones
                                                                    // Opciones dinámicas basadas en los estados disponibles
                                                                    ...(lista_estado.length > 0
                                                                        ? lista_estado.map((estado_producto) => ({
                                                                            label: estado_producto.estado,
                                                                            value: estado_producto.id_estado_producto,
                                                                        }))
                                                                        : []
                                                                    ),
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>
                                                </List.Accordion>

                                                {/* Acordeón para mostrar preguntas basada en las fecha*/}
                                                <List.Accordion
                                                    title="Mostrar:"
                                                    theme={{ colors: { primary: 'black' } }}
                                                    style={{ borderColor: '#dee2e6', borderTopWidth: 1 }}
                                                >
                                                    <View style={styles.lista_acordeon}>
                                                        <View style={styles.viewSelectFiltro}>
                                                            {/* Select para mostrar preguntas basadas en la fecha */}
                                                            <RNPickerSelect
                                                                value={select_ult_fecha} // Valor actual seleccionado
                                                                onValueChange={this.handleMostrarPreguntasChange} // Función que maneja el cambio de select
                                                                placeholder={{}} // Espacio reservado en el select
                                                                style={{ inputAndroid: styles.inputBusqueda }} // Estilo para el select en Android
                                                                items={[
                                                                    { label: 'Todas las fechas', value: '0' },
                                                                    { label: 'Últimos 5 días', value: '5' },
                                                                    { label: 'Últimos 10 días', value: '10' },
                                                                    { label: 'Últimos 20 días', value: '20' },
                                                                    { label: 'Últimos 40 días', value: '40' },
                                                                    { label: 'Últimos 60 días', value: '60' },
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>
                                                </List.Accordion>

                                                {/* Acordeón para la cantidad de preguntas a mostrar */}
                                                <List.Accordion
                                                    title="Cantidad de preguntas:"
                                                    theme={{ colors: { primary: 'black' } }}
                                                    style={{ borderColor: '#dee2e6', borderTopWidth: 1 }}
                                                >
                                                    <View style={styles.lista_acordeon}>
                                                        <View style={styles.viewSelectFiltro}>

                                                            {/* Select para la cantidad de preguntas a mostrar */}
                                                            <RNPickerSelect
                                                                value={select_cant_preguntas} // Valor actual seleccionado
                                                                onValueChange={this.handleCantPreguntasChange} // Función que maneja el cambio de select
                                                                placeholder={{}} // Espacio reservado en el select
                                                                style={{ inputAndroid: styles.inputBusqueda }} // Estilo para el select en Android
                                                                items={[
                                                                    { label: '5', value: '5' },
                                                                    { label: '10', value: '10' },
                                                                    { label: '25', value: '25' },
                                                                    { label: '50', value: '50' },
                                                                    { label: '100', value: '100' },
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

                    {/*Modal hacer otra pregunta*/}
                    <View>
                        {/* Proveedor de temas de Paper para estilos consistentes */}
                        <PaperProvider theme={theme}>
                            <Modal
                                visible={modalHacerOtraPregunta} // Controla si el modal está visible o no
                                animationType="fade" // Tipo de animación cuando se muestra o se oculta el modal
                                statusBarTranslucent={false} // Configuración translúcida para la barra de estado 
                                transparent={true} // Hacer el fondo del modal transparente
                            >

                                <ScrollView style={styles.modalViewFondo}>
                                    <View style={[styles.modalView, { marginTop: '50%' }]}>
                                        <Text style={styles.textTitulo}>Hacer otra pregunta</Text>
                                        <View style={{ marginBottom: 20, padding: 10 }}>

                                            {/*Verifica si hay un mensaje de error*/}
                                            {alertModalErrorAgregarPregunta && (
                                                /*Se llama a la funcion para obtener un contenedor que muestra un mensaje de error*/
                                                mostrarMensaje(alertModalErrorAgregarPregunta, 'danger')
                                            )}

                                            {/*Componente View que contiene un TextInput con la pregunta a modificar*/}
                                            <View>
                                                {/*Campo TextInput para ingresar una nueva pregunta*/}
                                                <TextInput
                                                    label="Escriba su pregunta"
                                                    maxLength={255}
                                                    value={txtPregunta}
                                                    onChangeText={(text) => this.setState({ txtPregunta: text })}
                                                    style={styles.input_paper}
                                                    theme={theme}
                                                    multiline={true}
                                                    numberOfLines={3}
                                                    disabled={loading_agregar_pregunta}//Desactiva el boton cuando se llama a la funcion que envia la pregunta
                                                />

                                                {/*Mostrar cantidad de caracteres maximo y restantes*/}
                                                <Text style={[styles.text_contador, { marginStart: 10 }]}>
                                                    Máximo 255 caracteres. {255 - txtPregunta.length} restantes
                                                </Text>
                                            </View>
                                        </View>
                                        {/*Componente View que contiene dos TouchableOpacity uno para cancelar el proceso y otro para hacer una nueva pregunta */}
                                        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>


                                            {/*Componente TouchableOpacity para cancelar el proceso */}
                                            <TouchableOpacity
                                                style={[styles.boton, styles.botonBaja, loading_agregar_pregunta && styles.botonDesactivado]}
                                                onPress={() => this.setState({ modalHacerOtraPregunta: false, txtPregunta: '', alertModalErrorAgregarPregunta: '' })}
                                                disabled={loading_agregar_pregunta}//Desactiva el boton cuando se llama a la funcion que envia la pregunta
                                            >
                                                <Text style={[styles.textoBoton, styles.textoBaja]}>Cancelar</Text>
                                            </TouchableOpacity>

                                            {/*Componente TouchableOpacity para enviar la nueva pregunta al producto */}
                                            <TouchableOpacity
                                                style={[styles.boton, styles.botonConfirmacion, loading_agregar_pregunta && styles.botonDesactivado]}
                                                onPress={() => this.enviar_pregunta()} // Función para enviar la pregunta para el producto 
                                                disabled={loading_agregar_pregunta}//Desactiva el boton cuando se llama a la funcion que envia la pregunta
                                            >
                                                <Text style={[styles.textoBoton, styles.textoConfirmacion]}>Enviar Pregunta</Text>
                                            </TouchableOpacity>
                                        </View>

                                    </View>
                                </ScrollView>

                            </Modal>
                        </PaperProvider>
                    </View>

                    {/*Modal eliminar pregunta*/}
                    <View >
                        {/* Proveedor de temas de Paper para estilos consistentes */}
                        <PaperProvider theme={theme}>
                            <Modal
                                visible={modalEliminarPregunta} // Controla si el modal está visible o no
                                animationType="fade" // Tipo de animación cuando se muestra o se oculta el modal
                                statusBarTranslucent={false} // Configuración translúcida para la barra de estado 
                                transparent={true} // Hacer el fondo del modal transparente
                            >
                                <ScrollView style={styles.modalViewFondo}>
                                    <View style={[styles.modalView, { marginTop: '65%' }]}>
                                        <Text style={styles.textTitulo}>Eliminar pregunta</Text>
                                        <View style={{ marginBottom: 20, padding: 10 }}>

                                            {/*Mensaje de alerta si hay uno*/}
                                            {alertModalErrorEliminarPregunta && (
                                                mostrarMensaje(alertModalErrorEliminarPregunta, 'danger')
                                            )}
                                            <Text style={styles.tamanio_texto}>¿Estas seguro de querer eliminar la siguiente pregunta?</Text>

                                            {/*Detalles de pregunta a eliminar*/}
                                            <Text style={[styles.tamanio_texto, { paddingLeft: 15, marginBottom: 5 }]}>
                                                <Text style={styles.caracteristica}>Pregunta:</Text>
                                                <Text>{preguntaSeleccionada.pregunta}</Text>
                                                <Text style={styles.text_fecha}>({preguntaSeleccionada.fechaPregunta})</Text>
                                            </Text>

                                        </View>


                                        {/*Componente View que contiene dos TouchableOpacity uno para cancelar el proceso y otro para confirmar la eliminacion de la pregunta */}
                                        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>

                                            {/*Componente TouchableOpacity para cancelar el proceso */}
                                            <TouchableOpacity
                                                style={[styles.boton, styles.botonInfo, loading_eliminar_pregunta && styles.botonDesactivado]}
                                                onPress={() => this.setState({ modalEliminarPregunta: false, alertModalErrorEliminarPregunta: '' })}
                                                disabled={loading_eliminar_pregunta}//Desactiva el boton cuando se llama a la funcion de eliminar la pregunta
                                            >
                                                <Text style={[styles.textoBoton, styles.textoInfo]}>Cancelar</Text>
                                            </TouchableOpacity>


                                            {/*Componente TouchableOpacity para confirmar la eliminacion */}
                                            <TouchableOpacity
                                                style={[styles.boton, styles.botonBaja, loading_eliminar_pregunta && styles.botonDesactivado]}
                                                onPress={() => this.eliminar_pregunta()}// Función para eliminar la pregunta 
                                                disabled={loading_eliminar_pregunta}//Desactiva el boton cuando se llama a la funcion de eliminar la pregunta
                                            >
                                                <Text style={[styles.textoBoton, styles.textoBaja]}>Confirmar</Text>
                                            </TouchableOpacity>

                                        </View>
                                    </View>
                                </ScrollView>

                            </Modal>
                        </PaperProvider>
                    </View>
                </View>
            </SafeAreaView >
        );
    }
}