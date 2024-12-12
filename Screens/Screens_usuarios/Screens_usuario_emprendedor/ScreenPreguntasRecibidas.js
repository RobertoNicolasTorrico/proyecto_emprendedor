import React, { Component } from 'react';

//Componentes utilizados en React Native
import { Image, Alert, ActivityIndicator, FlatList, RefreshControl, SafeAreaView, ScrollView, Text, View, Modal, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
import { styles } from '../../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { obtenerCantNotificacionesSinLeer, mostrarMensaje, formatearFechaBusqueda, formatearFecha, formatearFechaTextInput, formatearDia, renderPaginationButtons } from '../../../config/funciones.js';

//Configuracion de URL y otros parametros
import { config_define } from '../../../config/config_define.js';

//Módulo para realizar consultas a las APIs relacionadas
import api_respuestas from '../../../config/consultas_api/api_respuestas.js';
import api_estado from '../../../config/consultas_api/api_estado.js';


export class ScreenPreguntasRecibidas extends Component {
    constructor(props) {
        super(props);
        this.state = {

            //Identificador del usuario actual
            id_usuario: null,
            tipo_usuario: null,

            //Datos de las preguntas
            refreshing_preguntas: false,//Indica el estado de actualizar toda la pestaña de preguntas
            cantidad_total_preguntas: 0,//Indica la cantidad total de pregunta
            loading_preguntas: false,//Indica el estado de cargar informacion de las preguntas
            lista_preguntas: [],//Lista de preguntas recibidas que se mostraran
            pagina: '',//Indicador que contiene en que pagina se encuentra el usuario y la cantidad de paginas que hay
            registro: '', //Indicador que muestra la cantidad de elementos que se ve en la interfaz
            pagina_actual: 1,//Pagina actual de preguntas para la paginacion
            total_paginas: 0,//Indica la cantidad total de paginas para la paginacion

            //Datos de la fecha
            date: '',
            fechaBusqueda: '',
            modalFiltroEstadoFecha: false,//Indica el estado del modal del filtro de fecha


            //Filtro del estado de preguntas
            select_cant_preguntas: '10',//Indicador de cantidad de preguntas que se mostraran
            select_respondidas: 'Todas', //Indica que tipo de preguntas mostrar
            select_estado: '0', //Indica el estado de los productos que se van a ver
            modalFiltroEstado: false, //Indica el estado del modal del filtro

            mensaje: '',  //Mensaje de error en caso de problemas al obtener los datos de las preguntas

            //Busqueda predeterminada de pregunta
            search_producto: "",
            search_usuario: "",
            busqueda_activa: false,//Indica si el usuario buscar una pregunta recibida

            lista_estado: [],//Lista de estados de productos que se mostraran

            //Modal para responder una pregunta
            modalResponderPreguntar: false,//Indica el estado del modal para responder una pregunta 
            preguntaSeleccionada: {
                id_pregunta_respuesta: null, //Indica el ID de la pregunta seleccionada para responder
                id_producto: null,//Indica el ID del producto que pertenece la pregunta seleccionada para responder
                nombre_usuario_pregunta: '', //Indica el nombre del usuario que hizo la pregunta
                pregunta: '', //Indica la pregunta que se va responder
                fechaPregunta: '', //Indica la fecha de la pregunta que se va a responder
            },
            texto_respuesta: '',//Texto que contiene la respuesta que se va enviar
            alertModalErrorAgregarRespuesta: '',//Mensaje de error al eliminar la respuesta
            loading_agregar_respuesta: false,// Indica el estado al eliminar una respuesta

            //Modal para eliminar una respuesta
            modalEliminarRespuesta: false,//Indica el estado del modal para eliminar la respuesta
            respuestaSeleccionada: {
                id_pregunta_respuesta: null, //Indica el ID de la respuesta seleccionada para eliminar
                id_producto: null,//Indica el ID del producto que pertenece la respuesta seleccionada para eliminar
                respuesta: '', //Indica la respuesta que se va eliminar
                fechaRespuesta: '', //Indica la fecha de la respuesta que se va a eliminar
            },
            alertModalErrorEliminarRespuesta: '',//Mensaje de error al eliminar la respuesta
            loading_eliminar_respuesta: false,// Indica el estado al eliminar una respuesta

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
            //Despues de actualizar el estado, se llama a la funcion para obtener los estados de los productos y las preguntas recibidas
            this.obtenerDatosIniciales();

        });
        //Agrega un listener para actualizar las notificaciones y las preguntas recibidas hechas ademas de los estados de los productos cuando la pantalla esta enfocada 
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.obtenerDatosIniciales();

        });
    }


    //Se obtiene los datos iniciales necesarios para la interfaz del usuario
    obtenerDatosIniciales = async () => {
        const { id_usuario, tipo_usuario, fechaBusqueda, search_producto, search_usuario, pagina_actual, select_estado, select_cant_preguntas, select_respondidas } = this.state;

        try {
            this.setState({ loading_preguntas: true, lista_preguntas: [], lista_estado: [], mensaje: '' });

            //Se llama a la funcion que tiene la API para obtener los estados de los productos
            const respuesta_estado = await api_estado.obtenerListaEstados();

            //Actualiza el estado de la lista de estados que puede tener un producto
            this.setState({ lista_estado: respuesta_estado.lista_estado });


            //Se llama a la funcion que tiene la API para obtener las preguntas recibidas
            const respuesta_preguntas = await api_respuestas.obtenerListaPreguntasRespuestasEmprendedor(id_usuario, tipo_usuario, fechaBusqueda, search_producto, search_usuario, pagina_actual, select_estado, select_cant_preguntas, select_respondidas);

            //Actualiza el estado de la lista de preguntas recibidas ademas de otros elementos necesarios para la interfaz del usuario
            this.setState({
                lista_preguntas: respuesta_preguntas.lista_preguntas,
                total_paginas: respuesta_preguntas.totalPaginas,
                pagina: respuesta_preguntas.pagina,
                cantidad_total_preguntas: respuesta_preguntas.cant_total_preguntas,
                registro: respuesta_preguntas.registro,
                busqueda_activa: respuesta_preguntas.busqueda_activa
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

            //Finaliza el estado de carga
            this.setState({ loading_preguntas: false });

            //Actualiza el numero de notificaciones
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
        }
    };


    //Actualiza el estado del componente del estado del producto
    handleEstadoChange = (nuevo_estado) => {
        //Establece la pagina a 1 ademas de cambiar el estado a buscar del producto
        //Despues se llama a la funcion para obtener una lista de preguntas recibidas
        this.setState({
            pagina_actual: 1,
            select_estado: nuevo_estado
        }, () => {
            this.obtenerListaPreguntasRecibidas();
        });
    };

    //Actualiza el estado del componente del texto de busqueda
    handleTextSearch(tipo, texto) {
        //Establece la pagina a 1 ademas de agregar el valor en el campo de busqueda seleccionado
        //Despues se llama a la funcion para obtener una lista de preguntas recibidas
        this.setState({
            [tipo]: texto,
            pagina_actual: 1
        }, () => {
            this.obtenerListaPreguntasRecibidas();
        });
    };

    //Actualiza el componente de la fecha de busqueda
    handleDateChanger = (event, selectedDate) => {
        // Verifica si el evento es de tipo set  lo que indica que se ha seleccionado una fecha
        if (event.type === 'set') {
            // Obtiene la fecha seleccionada o la fecha actual del estado si no hay fecha seleccionada
            const currentDate = selectedDate || this.state.date;

            // Actualiza el estado del componente de la fecha, se cierra el modal de seleccion de fecha y formatear la fecha para la vista del usuario
            //Despues se llama a la funcion para obtener una lista de preguntas recibidas
            this.setState(
                {
                    pagina_actual: 1,
                    date: currentDate,
                    modalFiltroEstadoFecha: false,
                    fechaBusqueda: formatearFechaBusqueda(currentDate)
                },
                () => {
                    this.obtenerListaPreguntasRecibidas();
                }
            );
        } else {
            // Si el evento no es de tipo set se solo cierra el modal de selección de fecha
            this.setState({ modalFiltroEstadoFecha: false });
        }
    };

    //Actualiza el estado del componente de cantidad de preguntas a mostrar
    handleCantPreguntasChange = (nuevo_cantidad) => {
        //Establece la pagina a 1 ademas de cambiar el valor de cantidad de preguntas a mostrar
        //Despues se llama a la funcion para obtener una lista de preguntas recibidas
        this.setState({
            pagina_actual: 1,
            select_cant_preguntas: nuevo_cantidad
        }, () => {
            this.obtenerListaPreguntasRecibidas();
        });
    };

    //Actualiza el estado del componente del filtro de preguntas
    handleFiltrarPreguntasChange = (tipo_preguntas) => {
        //Establece la pagina a 1 ademas de cambiar el valor del filtro de preguntas a mostrar
        //Despues se llama a la funcion para obtener una lista de preguntas recibidas
        this.setState({
            pagina_actual: 1,
            select_respondidas: tipo_preguntas
        }, () => {
            this.obtenerListaPreguntasRecibidas();
        });
    };

    //Funcion para restablecer los valores del filtro de la fecha
    restablecer_valor_fecha() {
        //Restablece los valores del modal de fecha y tambien la pagina a 1
        this.setState({ date: '', fechaBusqueda: '', pagina_actual: 1 }, () => {
            this.obtenerListaPreguntasRecibidas();
        });
    };

    //Funcion para restablecer los valores del filtro del modal
    restablecer_valores_modal() {
        //Restablece los valores del modal y tambien la pagina a 1
        //Despues se llama a la funcion para obtener una lista de preguntas recibidas
        this.setState({
            pagina_actual: 1,
            date: '',
            fechaBusqueda: '',
            select_estado: '0',
            select_cant_preguntas: '10',
            select_respondidas: 'Todas',
        }, () => {
            this.obtenerListaPreguntasRecibidas();
        });
    };

    //Funcion para obtener las preguntas recibidas
    obtenerListaPreguntasRecibidas = async () => {
        const { id_usuario, tipo_usuario, fechaBusqueda, search_producto, search_usuario, pagina_actual, select_estado, select_cant_preguntas, select_respondidas } = this.state;

        try {
            //Actualiza el estado para cargar mas preguntas
            this.setState({ loading_preguntas: true, mensaje: '', lista_preguntas: [] });

            //Se llama a la funcion que tiene la API para obtener las preguntas recibidas
            const respuesta_preguntas = await api_respuestas.obtenerListaPreguntasRespuestasEmprendedor(id_usuario, tipo_usuario, fechaBusqueda, search_producto, search_usuario, pagina_actual, select_estado, select_cant_preguntas, select_respondidas);

            //Actualiza el estado de la lista de preguntas recibidas ademas de otros elementos necesarios para la interfaz
            this.setState({
                lista_preguntas: respuesta_preguntas.lista_preguntas,
                total_paginas: respuesta_preguntas.totalPaginas,
                pagina: respuesta_preguntas.pagina,
                cantidad_total_preguntas: respuesta_preguntas.cant_total_preguntas,
                registro: respuesta_preguntas.registro,
                busqueda_activa: respuesta_preguntas.busqueda_activa

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

            //Finaliza el estado de carga y refresco de preguntas
            this.setState({ refreshing_preguntas: false, loading_preguntas: false });

            //Actualiza el numero de notificaciones
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
        }
    };

    //Funcion para restablecer la lista de preguntas
    onRefresh = () => {
        //Reinicia la pagina a 1 y establece el estado de refreshing_preguntas a true
        //Despues se llama a la funcion para obtener una lista de preguntas recibidas
        this.setState({ refreshing_preguntas: true, pagina_actual: 1 }, () => {
            this.obtenerListaPreguntasRecibidas();
        });
    };

    //Funcion para cambiar la pagina actual
    cambiarPagina = (pagina) => {
        //Despues de actualizar el numero de pagina se llama a la funcion para obtener una lista de preguntas recibidas
        this.setState({
            pagina_actual: pagina
        }, () => {
            this.obtenerListaPreguntasRecibidas();
        });
    };

    //Funcion para eliminar una respuesta de una pregunta recibida
    eliminar_respuesta = async () => {

        const { id_usuario, tipo_usuario, respuestaSeleccionada } = this.state;

        try {
            //Actualiza el estado para eliminar una respuesta para evitar errores cuando se este llamando a la API ademas de eliminar cualquier mensaje previo
            this.setState({ loading_eliminar_respuesta: true, alertModalErrorEliminarRespuesta: '' });

            //Se llama a la funcion que tiene la API para eliminar la respuesta
            const resultado = await api_respuestas.bajaRespuesta(id_usuario, tipo_usuario, respuestaSeleccionada.id_pregunta_respuesta, respuestaSeleccionada.id_producto);

            //Actualiza el estado para cerrar el modal de eliminar la respuesta 
            //Despues se llama a la funcion para obtener la lista de preguntas recibidas
            this.setState({
                modalEliminarRespuesta: false
            }, () => {
                this.obtenerListaPreguntasRecibidas();
                Alert.alert("Exito", resultado.mensaje);
            });

        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                alertModalErrorEliminarRespuesta: error.message
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            //Finaliza el estado de carga para eliminar la respuesta
            this.setState({ loading_eliminar_respuesta: false });

            //Actualiza el numero de notificaciones
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
        }

    };


    //Funcion para responder una pregunta recibida
    enviar_respuesta = async () => {
        const { id_usuario, tipo_usuario, texto_respuesta, preguntaSeleccionada } = this.state;

        try {

            //Actualiza el estado para responder una pregunta para evitar errores cuando se este llamando a la API ademas de eliminar cualquier mensaje previo
            this.setState({ loading_agregar_respuesta: true, alertModalErrorAgregarRespuesta: '' });

            //Se llama a la funcion que tiene la API para responder una pregunta
            const resultado = await api_respuestas.altaRespuesta(id_usuario, tipo_usuario, preguntaSeleccionada.id_pregunta_respuesta, texto_respuesta, preguntaSeleccionada.id_producto);


            //Actualiza el estado para cerrar el modal de responder pregunta y elimina el contenido del campo de la respuesta 
            //Despues se llama a la funcion para obtener la lista de preguntas recibidas
            this.setState({
                modalResponderPreguntar: false, texto_respuesta: ''
            }, () => {
                this.obtenerListaPreguntasRecibidas();
                Alert.alert("Exito", resultado.mensaje);
            });

        } catch (error) {

            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                alertModalErrorAgregarRespuesta: error.message
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {

            //Finaliza el estado de carga para responder una pregunta
            this.setState({ loading_agregar_respuesta: false });

            //Actualiza el numero de notificaciones
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);

        }

    }

    //Funcion que renderizar cada elemento de la lista de preguntas
    renderItemPreguntasProducto = ({ item }) => {
        return (
            <View>
                {/*Verifica si el item tiene el elemento fecha_diferente para mostrar un texto con las preguntas recibidas ese dia */}
                {item.fecha_diferente && (
                    <Text style={styles.textTitulo}>Preguntas recibidas el {formatearDia(item.fecha_pregunta)}</Text>
                )}

                {  /*Componente Card para mostrar la informacion sobre el producto, pregunta y respuesta */}
                <Card key={item.id_pregunta_respuesta}>

                    {  /*Componente View para mostrar la imagen del producto y detalles sobre el mismo */}
                    <View style={{ backgroundColor: '#21252908', width: '100%', padding: 10 }}>

                        {/*Componente View para mostrar una imagen del producto*/}
                        <View style={{ width: '100%', flexDirection: 'row' }}>
                            <View style={{ width: '30%', borderColor: "#cec8c8", borderWidth: 1 }}>
                                <Image
                                    style={{ width: "100%", height: 70 }}
                                    resizeMode="contain"
                                    source={{
                                        uri: `${config_define.urlBase}/uploads/${item.id_usuario_emprendedor}/publicaciones_productos/${item.nombre_carpeta}/${item.nombre_archivo}`
                                    }}
                                />
                            </View>

                            {/*Componente View que contiene el nombre del producto*/}
                            <View style={{ width: '70%' }}>
                                <Text style={styles.textTitulo}>{item.nombre_producto}</Text>
                            </View>
                        </View>
                        {/*Componente View que contiene el estado del producto*/}
                        <View style={{ width: '100%' }}>
                            <Text style={[styles.tamanio_texto, { marginTop: 10, marginBottom: 10 }]}>
                                <Text style={styles.caracteristica}>Estado:</Text> {item.estado}
                            </Text>
                        </View>
                    </View>
                    <Card.Divider />


                    <View>
                        {/*Nombre de usuario que hizo la pregunta */}
                        <Text style={[styles.tamanio_texto, { marginBottom: 5 }]}>
                            <Text style={styles.caracteristica}>Nombre de usuario:</Text> {item.nombre_usuario}
                        </Text>

                        { /*Componente View que contiene la pregunta y la fecha que se hizo la pregunta*/}
                        <View style={{ paddingLeft: 15, flexDirection: 'row', alignItems: 'center' }}>
                            <FontAwesomeIcon
                                icon={faCircle}
                                color={'black'}
                                size={7}
                                style={{ marginRight: 5 }}
                            />
                            <Text style={[styles.tamanio_texto, { marginBottom: 5 }]}>
                                <Text style={styles.caracteristica}>Pregunta:</Text>
                                <Text>{item.pregunta}</Text>
                                <Text style={styles.text_fecha}>({formatearFecha(item.fecha_pregunta)})</Text>
                            </Text>
                        </View>

                        {/*Verifica si la pregunta fue respondida o no  */}
                        {item.respuesta && (
                            /*Componente View que contiene la respuesta y la fecha que se respondio*/
                            <View style={{ paddingLeft: 25, flexDirection: 'row', alignItems: 'center' }}>
                                <FontAwesomeIcon
                                    icon={faCircle}
                                    color={'black'}
                                    size={7}
                                    style={{ marginRight: 5 }}
                                />
                                <Text style={[styles.tamanio_texto, { marginBottom: 5 }]}>
                                    <Text style={styles.caracteristica}>Respuesta:</Text>
                                    <Text>{item.respuesta}</Text>
                                    <Text style={styles.text_fecha}>({formatearFecha(item.fecha_respuesta)})</Text>
                                </Text>
                            </View>
                        )}
                    </View>

                    <Card.Divider />

                    {/*Componente View que contiene un TouchableOpacity que puede eliminar una respuesta o responder una pregunta  */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        {/*Verifica si la pregunta fue respondida */}
                        {item.respuesta ? (
                            /*Componente TouchableOpacity para eliminar una respuesta */
                            <TouchableOpacity
                                style={[styles.boton, styles.botonBaja]}
                                onPress={() => this.setState({
                                    modalEliminarRespuesta: true,
                                    respuestaSeleccionada: {
                                        id_pregunta_respuesta: item.id_pregunta_respuesta,
                                        id_producto: item.id_producto,
                                        respuesta: item.pregunta,
                                        fechaRespuesta: formatearFecha(item.fecha_pregunta),
                                    }
                                })}
                            >
                                <Text style={[styles.textoBoton, styles.textoBaja]}>Eliminar Respuesta</Text>
                            </TouchableOpacity>
                        ) : (
                            /*Componente TouchableOpacity para responder una pregunta */
                            <TouchableOpacity
                                style={[styles.boton, styles.botonConfirmacion]}
                                onPress={() => this.setState({
                                    modalResponderPreguntar: true,
                                    preguntaSeleccionada: {
                                        id_pregunta_respuesta: item.id_pregunta_respuesta,
                                        id_producto: item.id_producto,
                                        nombre_usuario_pregunta: item.nombre_usuario,
                                        pregunta: item.pregunta,
                                        fechaPregunta: formatearFecha(item.fecha_pregunta),
                                    }
                                })}
                            >
                                <Text style={[styles.textoBoton, styles.textoConfirmacion]}>Responder</Text>
                            </TouchableOpacity>
                        )}

                        {/*Componente TouchableOpacity para navegar a los detalles del producto */}
                        <TouchableOpacity
                            style={[styles.boton, styles.botonInfo]}
                            onPress={() => {
                                this.props.navigation.navigate("DetallesProducto", { id_producto: item.id_producto });
                            }}
                        >
                            <Text style={[styles.textoBoton, styles.textoInfo]}>Ver producto</Text>
                        </TouchableOpacity>
                    </View>
                </Card >
            </View >
        );
    };



    render() {
        const { mensaje,

            //Busqueda
            cantidad_total_preguntas, busqueda_activa, search_producto, search_usuario,

            //Lista de estado de los productos
            lista_estado,

            //Lista de preguntas recibidas
            lista_preguntas, loading_preguntas, pagina_actual, registro, pagina, total_paginas, refreshing_preguntas,

            //Modal filtro
            modalFiltroEstado, select_estado, select_cant_preguntas, select_respondidas,
            modalFiltroEstadoFecha, date,

            //Modal responder pregunta
            modalResponderPreguntar, texto_respuesta, loading_agregar_respuesta, alertModalErrorAgregarRespuesta, preguntaSeleccionada,

            //Modal eliminar respuesta
            modalEliminarRespuesta, respuestaSeleccionada, alertModalErrorEliminarRespuesta, loading_eliminar_respuesta


        } = this.state;

        const theme = {
            colors: {
                text: 'black',
                placeholder: 'gray',
                primary: 'gray',
            },

        };
        return (
            <SafeAreaView style={styles.safeArea}>

                {/*Contenedor principal */}
                <View style={[styles.container, { paddingStart: 8, paddingEnd: 8, paddingBottom: 0, paddingTop: 10 }]}>

                    {/*Componente View que contiene la lista de preguntas recibidas, un TouchableOpacity para abrir el filtro y dos barras de busqueda */}
                    <View style={[styles.viewCard, { flex: 1 }]}>

                        {/*Componente SearchBar que se utiliza para buscar las preguntas recibidas del producto escrito*/}
                        <SearchBar
                            placeholder="Nombre del producto"
                            value={search_producto}
                            onChangeText={(texto) => this.handleTextSearch('search_producto', texto)} round={true}
                            lightTheme={true}
                            containerStyle={styles.container_search}
                            inputContainerStyle={{ backgroundColor: 'white' }}
                        />


                        {/*Componente SearchBar que se utiliza para buscar las preguntas recibidas hecho por el usuario escrito*/}
                        <SearchBar
                            placeholder="Nombre del usuario"
                            value={search_usuario}
                            onChangeText={(texto) => this.handleTextSearch('search_usuario', texto)} round={true}
                            lightTheme={true}
                            containerStyle={[styles.container_search, { marginTop: 20 }]}
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

                        <View style={{ flex: 1 }}>

                            {/*Verifica si hay un mensaje de error*/}
                            {mensaje && (
                                /*Se llama a la funcion para obtener un contenedor que muestra un mensaje de error*/
                                mostrarMensaje(mensaje, 'danger')
                            )}

                            {/*Verifica si se esta cargando los datos*/}
                            {loading_preguntas &&
                                <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                            }

                            <View style={{ marginBottom: 20 }}>

                                {/*Verifica que el usuario inicio una busqueda  y que la lista de preguntas recibidas sea mayor a 0 para mostrar la cantidad de resultados de busqueda*/}
                                {busqueda_activa && lista_preguntas.length > 0 && <Text style={{ fontSize: 25, marginStart: 15 }}>Resultados:{cantidad_total_preguntas}</Text>}

                                <FlatList
                                    data={lista_preguntas}// Datos de la lista que serán renderizados
                                    renderItem={this.renderItemPreguntasProducto}// Función que renderiza cada elemento de la lista
                                    keyExtractor={(item, index) => index.toString()}// Función para extraer la clave única para cada elemento
                                    onEndReachedThreshold={0.5}// Umbral que determina cuánto antes del final de la lista se debe llamar a onEndReached
                                    ListFooterComponent={lista_preguntas.length > 0 && (renderPaginationButtons(total_paginas, pagina_actual, registro, pagina, this.cambiarPagina))}// Componente que se renderiza al final de la lista
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing_preguntas}// Estado que indica si la lista se está refrescando
                                            onRefresh={this.onRefresh}// Función que se llama cuando se realiza un gesto de refresco
                                        />
                                    }
                                    // Componente que se muestra cuando la lista está vacía
                                    ListEmptyComponent={
                                        !loading_preguntas && !mensaje && (
                                            busqueda_activa ?
                                                <Text style={styles.textoBusqueda}>Sin resultados</Text> :
                                                <Text style={styles.textoBusqueda}>Por el momento no se recibio alguna pregunta</Text>)
                                    }
                                />
                            </View>
                        </View>
                    </View>

                    {/*Modal Filtro de preguntas por fecha*/}
                    {modalFiltroEstadoFecha && (
                        <DateTimePicker
                            mode="date" // Configura el selector en modo fecha
                            value={date || new Date()} // Establece el valor inicial como la fecha actual o date si está definido
                            onChange={this.handleDateChanger} // Maneja el cambio de fecha llamando al método handleDateChanger
                        />
                    )}

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
                                    <View style={[styles.modalView, { marginTop: '10%' }]}>

                                        {/* Sección de filtros */}
                                        <List.Section titleStyle={{ fontSize: 25 }} title="Filtros" >
                                            <View style={{ borderRadius: 6, borderColor: '#dee2e6', borderWidth: 1, marginBottom: 20 }}>


                                                {/* Acordeón para el estado de la publicación del producto */}
                                                <List.Accordion title="Estado del producto"
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
                                                <List.Accordion title="Preguntas recibidas"
                                                    theme={{ colors: { primary: 'black' } }}
                                                    style={{ borderColor: '#dee2e6', borderTopWidth: 1 }}
                                                >
                                                    {/*Componente View que contiene el boton para abrir el modal de fecha y borrar la fecha seleccionada */}
                                                    <View style={styles.lista_acordeon}>
                                                        <View style={{ marginStart: 10, marginTop: 10, width: '90%' }} >
                                                            <TouchableOpacity
                                                                onPress={() => this.setState({ modalFiltroEstadoFecha: true })}
                                                                style={{ paddingBottom: 10 }}
                                                            >
                                                                <TextInput
                                                                    value={formatearFechaTextInput(date)}
                                                                    style={styles.inputBusquedaFecha}
                                                                    editable={false}
                                                                    pointerEvents="none"
                                                                />
                                                            </TouchableOpacity>
                                                            <TouchableOpacity
                                                                style={styles.boton}
                                                                onPress={() => this.restablecer_valor_fecha()}
                                                            >
                                                                <Text style={styles.textoBoton}>Borrar Fecha</Text>
                                                            </TouchableOpacity>

                                                        </View>
                                                    </View>
                                                </List.Accordion>

                                                {/* Acordeón para mostrar preguntas basado en que si fue respondida o no*/}
                                                <List.Accordion title="Filtrar preguntas"
                                                    theme={{ colors: { primary: 'black' } }}
                                                    style={{ borderColor: '#dee2e6', borderTopWidth: 1 }}
                                                >
                                                    <View style={styles.lista_acordeon}>
                                                        <View style={styles.viewSelectFiltro}>
                                                            {/* Select para filtrar las preguntas a mostrar */}
                                                            <RNPickerSelect
                                                                value={select_respondidas} // Valor actual seleccionado
                                                                onValueChange={this.handleFiltrarPreguntasChange}// Función que maneja el cambio de select
                                                                placeholder={{}}// Espacio reservado en el select
                                                                style={{ inputAndroid: styles.inputBusqueda }}// Estilo para el select en Android
                                                                items={[
                                                                    { label: 'Todas', value: 'Todas' },
                                                                    { label: 'Respondidas', value: 'Respondidas' },
                                                                    { label: 'No Respondidas', value: 'NoRespondidas' }
                                                                ]}
                                                            />

                                                        </View>
                                                    </View>
                                                </List.Accordion>


                                                {/* Acordeón para la cantidad de preguntas a mostrar */}
                                                <List.Accordion title="Mostrar"
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
                                                                    { label: '10', value: '10' },
                                                                    { label: '25', value: '25' },
                                                                    { label: '50', value: '50' },
                                                                    { label: '100', value: '100' }
                                                                ]}
                                                            />

                                                        </View>
                                                    </View>
                                                </List.Accordion>

                                            </View>
                                        </List.Section>

                                        {/*Componente View que contiene dos TouchableOpacity para restablecer los valores del modal y cerrar el modal */}
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


                    {/*Modal responder pregunta*/}
                    <View>
                        <PaperProvider theme={theme}>
                            {/* Proveedor de temas de Paper para estilos consistentes */}
                            <Modal
                                visible={modalResponderPreguntar} // Controla si el modal está visible o no
                                animationType="fade" // Tipo de animación cuando se muestra o se oculta el modal
                                statusBarTranslucent={false} // Configuración translúcida para la barra de estado 
                                transparent={true} // Hacer el fondo del modal transparente
                            >
                                <ScrollView style={styles.modalViewFondo}>
                                    <View style={[styles.modalView, { marginTop: '20%' }]}>
                                        <Text style={styles.textTitulo}>Responder</Text>
                                        <View style={{ marginBottom: 20, padding: 10 }}>
                                            {/*Verifica si hay un mensaje de error*/}
                                            {alertModalErrorAgregarRespuesta && (
                                                /*Se llama a la funcion para obtener un contenedor que muestra un mensaje de error*/
                                                mostrarMensaje(alertModalErrorAgregarRespuesta, 'danger')
                                            )}
                                            <Text style={[styles.tamanio_texto, { marginBottom: 5 }]}><Text style={styles.caracteristica}>Nombre de usuario:</Text>{preguntaSeleccionada.nombre_usuario_pregunta} </Text>
                                            <Text style={[styles.tamanio_texto, { paddingLeft: 15, marginBottom: 5 }]}>
                                                <Text style={styles.caracteristica}>Pregunta:</Text>
                                                <Text>{preguntaSeleccionada.pregunta}</Text>
                                                <Text style={styles.text_fecha}>({preguntaSeleccionada.fechaPregunta})</Text>
                                            </Text>

                                            {/*Campo de texto para ingresar la respuesta de la pregunta*/}
                                            <TextInput
                                                label="Respuesta"
                                                maxLength={255}
                                                value={texto_respuesta}
                                                onChangeText={(text) => this.setState({ texto_respuesta: text })}
                                                style={styles.input_paper}
                                                theme={theme}
                                                multiline
                                                numberOfLines={3}
                                                disabled={loading_agregar_respuesta}//Desactiva el boton cuando se llama a la funcion que responde la pregunta

                                            />
                                            {/*Mostrar cantidad de caracteres maximo y restantes*/}
                                            <Text style={styles.text_contador}>
                                                Máximo 255 caracteres. {255 - texto_respuesta.length} restantes
                                            </Text>
                                        </View>

                                        {/*Componente View que contiene dos TouchableOpacity uno responder la pregunta y  otro para cancelar el proceso */}
                                        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                                            <TouchableOpacity
                                                style={[styles.boton, styles.botonBaja, loading_agregar_respuesta && styles.botonDesactivado]}
                                                onPress={() => this.setState({ modalResponderPreguntar: false, texto_respuesta: '', alertModalErrorAgregarRespuesta: '' })}
                                                disabled={loading_agregar_respuesta}//Desactiva el boton cuando se llama a la funcion que responde la pregunta
                                            >
                                                <Text style={[styles.textoBoton, styles.textoBaja]}>Cancelar</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.boton, styles.botonConfirmacion, loading_agregar_respuesta && styles.botonDesactivado]}
                                                onPress={() => this.enviar_respuesta()}// Función para responder la pregunta
                                                disabled={loading_agregar_respuesta}//Desactiva el boton cuando se llama a la funcion que responde la pregunta
                                            >

                                                <Text style={[styles.textoBoton, styles.textoConfirmacion]}>Enviar Respuesta</Text>

                                            </TouchableOpacity>
                                        </View>

                                    </View>
                                </ScrollView>

                            </Modal>
                        </PaperProvider>
                    </View>



                    {/*Modal eliminar respuesta*/}
                    <View >
                        <PaperProvider theme={theme}>
                            <Modal
                                visible={modalEliminarRespuesta} // Controla si el modal está visible o no
                                animationType="fade" // Tipo de animación cuando se muestra o se oculta el modal
                                statusBarTranslucent={false} // Configuración translúcida para la barra de estado 
                                transparent={true} // Hacer el fondo del modal transparente 
                            >
                                <ScrollView style={styles.modalViewFondo}>
                                    <View style={[styles.modalView, { marginTop: '65%' }]}>
                                        <Text style={styles.textTitulo}>Eliminar respuesta</Text>
                                        <View style={{ marginBottom: 20, padding: 10 }}>

                                            {/*Verifica si hay un mensaje de error*/}
                                            {alertModalErrorEliminarRespuesta && (
                                                /*Se llama a la funcion para obtener un contenedor que muestra un mensaje de error*/
                                                mostrarMensaje(alertModalErrorEliminarRespuesta, 'danger')
                                            )}
                                            <Text style={styles.tamanio_texto}>¿Estas seguro de querer eliminar la siguiente respuesta?</Text>

                                            {/*Detalles de respuesta a eliminar*/}
                                            <Text style={[styles.tamanio_texto, { paddingLeft: 15, marginBottom: 5 }]}>
                                                <Text style={styles.caracteristica}>Respuesta:</Text>
                                                <Text>{respuestaSeleccionada.respuesta}</Text>
                                                <Text style={styles.text_fecha}>({respuestaSeleccionada.fechaRespuesta})</Text>
                                            </Text>

                                        </View>

                                        {/* Componente View que contiene dos TouchableOpacity para eliminar la respuesta y cancelar el proceso */}
                                        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                                            <TouchableOpacity
                                                style={[styles.boton, styles.botonInfo, loading_eliminar_respuesta && styles.botonDesactivado]}
                                                onPress={() => this.setState({ modalEliminarRespuesta: false, alertModalErrorEliminarRespuesta: '' })}
                                                disabled={loading_eliminar_respuesta}//Desactiva el boton cuando se llama a la funcion para eliminar la respuesta
                                            >
                                                <Text style={[styles.textoBoton, styles.textoInfo]}>Cancelar</Text>
                                            </TouchableOpacity>


                                            <TouchableOpacity
                                                style={[styles.boton, styles.botonBaja, loading_eliminar_respuesta && styles.botonDesactivado]}
                                                onPress={() => this.eliminar_respuesta()}
                                                disabled={loading_eliminar_respuesta}//Desactiva el boton cuando se llama a la funcion para eliminar la respuesta
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
