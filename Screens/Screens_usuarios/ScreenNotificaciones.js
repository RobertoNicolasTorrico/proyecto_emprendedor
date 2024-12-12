
import React, { Component } from 'react';

//Componentes utilizados en React Native
import { TouchableOpacity, Alert, ActivityIndicator, FlatList, RefreshControl, SafeAreaView, ScrollView, Text, View, Modal } from 'react-native';
import { Card } from '@rneui/themed';
import { List, PaperProvider } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';

//Biblioteca para almacenamiento asincrono de datos
import AsyncStorage from '@react-native-async-storage/async-storage';

//Componente para mostrar iconos
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

//Iconos especificos de FontAwesome
import { faTrash, faCircle } from '@fortawesome/free-solid-svg-icons';

//Archivo de estilos
import { styles } from '../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { mostrarMensaje, obtenerTiempoTranscurrido } from '../../config/funciones.js';


//Módulo para realizar consultas a las APIs relacionadas
import api_notificacion from '../../config/consultas_api/api_notificacion.js';



export class ScreenNotificaciones extends Component {
    constructor(props) {
        super(props);
        this.state = {


            //Identificador del usuario actual
            id_usuario: null,
            tipo_usuario: null,


            mensajeNotificacion: '',  //Mensaje de error al obtener los datos de las notificaciones

            //Filtro del notificaciones
            selectMostrar: '0',//Indica desde que fecha se va a mostrar
            selectEstado: 'todos', //Indica el estado de los productos que se van a ver
            modalFiltroEstado: false, //Indica el estado del modal del filtro

            //Datos de las notificaciones
            lista_notificaciones: [],//Lista de notificaciones que se mostraran
            pagina_actual: 1,//Pagina actual de notificacion para la paginacion
            cargar_mas_notificaciones: false,//Indica si se puede cargar mas notificaciones
            loading_notificacion: true,//Indica el estado de cargar informacion de las notificaciones
            refreshing_notificacion: false, //Indica el estado de actualizar toda la pestaña de notificaciones
            busqueda_activa_notificacion: false,//Indica si el usuario buscar una notificacion


            //Modal eliminar notificacion
            modalEliminarNotificacion: false,//Indica el estado del modal para eliminar una notificacion
            loading_eliminar_notificacion: false,// Indica el estado al eliminar una notificacion
            alertModalErrorEliminarNotificacion: '',//Mensaje de error al eliminar una notificacion

            notificacionSeleccionado: {
                id_notificacion: null, //Indica el ID de la notificacion seleccionada para eliminar
                tipo_notificacion: '', //Indica que tipo de notificacion se va a eliminar
                nombre_usuario: '',//Indica el nombre de usuario
                nombre_producto: '', //Indica el nombre del producto 
                fecha_notificacion: '' //Indica la fecha que se recibio la notificacion
            }


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

            //Despues de actualizar el estado, se llama a la funcion para obtener las notificaciones 
            this.obtenerListaNotificaciones();
        });

        //Agrega un listener para actualizar las notificaciones cuando la pantalla esta enfocada 
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.obtenerListaNotificaciones();
        });
    }


    //Metodo para obtener las notificaciones del usuario
    obtenerListaNotificaciones = async () => {
        try {
            const { tipo_usuario, id_usuario, pagina_actual, selectMostrar, selectEstado, lista_notificaciones } = this.state;


            //Actualiza el estado del mensaje de error de notificaciones a vacio eliminando cualquier mensaje de error previo
            this.setState({ mensajeNotificacion: '' });


            //Si es la primera pagina se indica que se esta cargando la lista de notificaciones ademas que se vacia la lista de notificaciones previa 
            if (pagina_actual == 1) {
                this.setState({ loading_notificacion: true, lista_notificaciones: [] });
            }


            //Se llama a la funcion que tiene la API para obtener los datos de las notificaciones
            const respuesta = await api_notificacion.obtenerListaNotificaciones(id_usuario, tipo_usuario, pagina_actual, selectMostrar, selectEstado);

            //Actualiza el estado de la lista de notificaciones, si se puede cargar mas notificaciones y si el usuario esta buscando una notificacion
            this.setState({
                lista_notificaciones: [...lista_notificaciones, ...respuesta.lista_notificaciones],
                cargar_mas_notificaciones: respuesta.cargar_mas_notificaciones,
                busqueda_activa_notificacion: respuesta.busqueda_activa,
            });
        } catch (error) {

            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensajeNotificacion: error.message
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            //Finaliza el estado de carga y refresco de notificaciones
            this.setState({ refreshing_notificacion: false, loading_notificacion: false });

            //Actualiza las notificaciones obtenidas que no estan leidas a leidas
            this.marcarNotificacionesComoLeidas();
        }
    };

    //Funcion que renderizar cada elemento de la lista de notificaciones
    renderItemNotificaciones = ({ item }) => {
        return (
            //Componene View  que contiene la card con la informacion de la notificacion y un icono sino fue leida
            <View style={{ paddingBottom: 15, position: 'relative' }}>
                {/*Verifica que la notificacion fue leida por el usuario o no */}
                {item.leido === 0 && (
                    //Componene View que contiene un cirulo para mostrar que no fue leida la notificacion
                    <View style={{
                        position: 'absolute',
                        top: 8,
                        right: 10,
                        zIndex: 1
                    }}>
                        <FontAwesomeIcon icon={faCircle} size={20} color="red" />
                    </View>
                )}


                {/* Componente Card para mostrar la informacion de la notificacion */}
                <Card key={item.id_notificacion} style={{ position: 'relative' }}>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                        {/* Componente View para mostrar las notificacion */}
                        <View style={{ flex: 4 }}>
                            {
                                //Se verifica que tipo de notificacion se va a mostrar y que mensaje debe tener
                                item.tipo_notificacion == "Seguimiento" ? (
                                    <Text style={styles.tamanio_texto}><Text style={{ fontWeight: 'bold' }}>{item.nombre_usuario}</Text> comenzó a seguirte. <Text style={styles.text_fecha}>{obtenerTiempoTranscurrido(item.fecha_notificacion)}</Text></Text>
                                ) : item.tipo_notificacion == "Pregunta" ? (
                                    <Text style={styles.tamanio_texto}>Recibiste una nueva pregunta sobre tu producto <Text style={{ fontWeight: 'bold' }}>{item.nombre_producto}</Text> del usuario <Text style={{ fontWeight: 'bold' }}>{item.nombre_usuario}</Text>. <Text style={styles.text_fecha}>{obtenerTiempoTranscurrido(item.fecha_notificacion)}</Text></Text>
                                ) : item.tipo_notificacion == "Respuesta" && (
                                    <Text style={styles.tamanio_texto}>Recibiste una respuesta sobre el producto <Text style={{ fontWeight: 'bold' }}>{item.nombre_producto}</Text> del usuario <Text style={{ fontWeight: 'bold' }}>{item.nombre_usuario}</Text>. <Text style={styles.text_fecha}>{obtenerTiempoTranscurrido(item.fecha_notificacion)}</Text></Text>
                                )
                            }
                        </View>

                        {/* Componente View que contiene un TouchableOpacity para eliminar la notificacion */}
                        <View >

                            {/*Componente TouchableOpacity para abrir el modal para eliminar la notificaicon */}
                            <TouchableOpacity
                                style={[styles.botonBaja, {
                                    backgroundColor: 'transparent',
                                    paddingVertical: 10,
                                    paddingHorizontal: 15,
                                    borderRadius: 5,
                                    borderWidth: 1,
                                }]}
                                onPress={() => this.setState({
                                    modalEliminarNotificacion: true,
                                    notificacionSeleccionado: {
                                        id_notificacion: item.id_notificacion,
                                        tipo_notificacion: item.tipo_notificacion,
                                        nombre_usuario: item.nombre_usuario,
                                        nombre_producto: item.nombre_producto,
                                        fecha_notificacion: obtenerTiempoTranscurrido(item.fecha_notificacion)
                                    }
                                })}

                            >
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    color={'#dc3545'}
                                    size={20}
                                />
                            </TouchableOpacity>
                        </View>


                    </View>
                </Card>
            </View>

        );
    };

    //Funcion para pasar todas las notificaciones vista en la interfaz a leidas
    marcarNotificacionesComoLeidas = async () => {

        try {
            const { tipo_usuario, id_usuario, lista_notificaciones } = this.state;

            //Array para almacenar las ID de las notificaciones no leidas
            var id_notificaciones = [];


            for (var i = 0; i < lista_notificaciones.length; i++) {

                //Se verifica que la notificacion no este leida en caso que no se agrega su ID al array
                if (!lista_notificaciones[i]['leido']) {
                    id_notificaciones.push(lista_notificaciones[i]['id_notificacion']);
                }

            }
            //Se verifica que el array tengo un elemento para poder llamar a la funcion
            if (id_notificaciones.length > 0) {
                //Se llama a la funcion que tiene la API para modificar el valor de las notificacion no leidas a leidas
                await api_notificacion.modificarNotificacionALeida(id_usuario, tipo_usuario, id_notificaciones);
            }

        } catch (error) {
            //Manejo de errores: Muestra un alert 
            Alert.alert("Aviso", error.message);
        }
    };

    //Funcion que renderiza el pie de pagina de la lista de notificaciones
    renderFooterNotificaciones = () => {
        const { cargar_mas_notificaciones, lista_notificaciones, loading_notificacion } = this.state;
        return (
            <View style={{ padding: 10, marginBottom: 20, marginTop: 20 }}>

                {/*Muestra un mensaje en caso que no halla que cargar mas notificaciones y la lista de notificaciones sea mayor o igual 1 */}
                {!cargar_mas_notificaciones && lista_notificaciones.length >= 1 &&
                    <Text style={styles.textTitulo}>No hay mas notificaciones por el momento</Text>
                }

                {/*Muestra un indicador de carga si hay mas notificaciones por cargar */}
                {cargar_mas_notificaciones && !loading_notificacion && (
                    <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                )}
            </View>
        );
    };

    //Funcion para manejar la carga de mas notificaciones al final de la lista
    handleLoadMoreNotificaciones = () => {
        const { cargar_mas_notificaciones } = this.state;

        //Verifica primero si hay que cargar mas notificaciones
        if (cargar_mas_notificaciones) {

            //Incrementa el numero de pagina y llama a la funcion para obtener mas notificaciones
            this.setState(prevState => ({
                pagina_actual: prevState.pagina_actual + 1,
                cargar_mas_notificaciones: true,
            }), () => {
                this.obtenerListaNotificaciones();
            });
        }
    };

    //Funcion para restablecer la lista de notificaciones
    onRefreshNotificaciones = () => {
        //Reinicia la pagina a 1 y establece el estado de refreshing_notificacion a verdadero
        this.setState({ refreshing_notificacion: true, pagina_actual: 1 }, () => {
            this.obtenerListaNotificaciones();
        });
    };

    //Actualiza el estado del componente del estado la notificaciones
    handleEstadoChange = (nuevo_estado) => {
        //Establece la pagina a 1 ademas de cambiar el estado de la notificacion
        //Despues se llama a la funcion para obtener la lista de notificaciones
        this.setState({
            pagina_actual: 1,
            selectEstado: nuevo_estado,
        }, () => {
            this.obtenerListaNotificaciones();
        });
    };

    //Actualiza el estado del componente para mostrar desde que fecha mostrar
    handleMostrarChange = (nuevo_mostrar) => {
        //Establece la pagina a 1 ademas de cambiar el estado de la notificacion
        //Despues se llama a la funcion para obtener la lista de notificaciones
        this.setState({
            pagina_actual: 1,
            selectMostrar: nuevo_mostrar,
        }, () => {
            this.obtenerListaNotificaciones();
        });
    };

    //Funcion para restablecer los valores del filtro del modal
    restablecer_valores_modal() {
        //Restablece los valores del modal y tambien la pagina a 1
        //Despues se llama a la funcion para obtener la lista de notificaciones
        this.setState({
            pagina_actual: 1,
            selectEstado: 'todos',
            selectMostrar: '0',
        }, () => {
            this.obtenerListaNotificaciones();
        });
    };


    //Funcion para eliminar una notificacion
    eliminar_notificacion = async () => {

        try {
            const { id_usuario, tipo_usuario, notificacionSeleccionado } = this.state;

            //Actualiza el estado para eliminar la notificacion para evitar errores cuando se este llamando a la API ademas de eliminar cualquier mensaje previo
            this.setState({ loading_eliminar_notificacion: true, alertModalErrorEliminarNotificacion: '' });

            //Se llama a la funcion que tiene la API para eliminar la notificacion
            const resultado = await api_notificacion.bajaNotificacion(id_usuario, tipo_usuario, notificacionSeleccionado.id_notificacion);

            //Actualiza el estado para eliminar la notificion de la lista de notificaciones
            this.setState(prevState => {
                const lista_notificaciones = prevState.lista_notificaciones.filter(
                    notificacion => notificacion.id_notificacion !== notificacionSeleccionado.id_notificacion);
                return { lista_notificaciones };
            });

            //Actualiza el estado para cerrar el modal y despues muestra un alert
            this.setState({
                modalEliminarNotificacion: false
            }, () => {
                Alert.alert("Exito", resultado.mensaje);
            });

        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                alertModalErrorEliminarNotificacion: error.message, tipoMensaje: 'danger'
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            //Finaliza el estado de carga para eliminar la notificacion
            this.setState({ loading_eliminar_notificacion: false });
        }

    };


    render() {
        const {

            //Lista de notificaciones recibidas
            lista_notificaciones, pagina_actual, mensajeNotificacion, loading_notificacion, refreshing_notificacion,
            //Busqueda
            busqueda_activa_notificacion,
            //Modal filtro
            modalFiltroEstado, selectEstado, selectMostrar,
            //Modal eliminar notificacion
            modalEliminarNotificacion, alertModalErrorEliminarNotificacion, loading_eliminar_notificacion, notificacionSeleccionado
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

                    {/*Componente View que contiene la lista de notificaciones, un boton de filtro */}
                    <View style={[styles.viewCard, { flex: 1 }]}>

                        {/*Componente View que contiene el boton para abrir el modal de fikltro*/}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 }}>
                            <TouchableOpacity
                                style={styles.boton}
                                onPress={() => this.setState({ modalFiltroEstado: true })}
                            >
                                <Text style={styles.textoBoton}>Filtros</Text>
                            </TouchableOpacity>
                        </View>

                        {/*Mensaje de alerta si hay uno*/}
                        {mensajeNotificacion && (
                            mostrarMensaje(mensajeNotificacion, 'danger')
                        )}

                        {/*Indicador de carga si esta cargando datos*/}
                        {loading_notificacion && (
                            <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                        )}


                        <FlatList
                            data={lista_notificaciones}// Datos de la lista que serán renderizados
                            renderItem={this.renderItemNotificaciones} // Función que renderiza cada elemento de la lista
                            keyExtractor={(item, index) => index.toString()}// Función para extraer la clave única para cada elemento
                            ListFooterComponent={this.renderFooterNotificaciones}// Componente que se renderiza al final de la lista
                            onEndReached={this.handleLoadMoreNotificaciones}// Función que se llama cuando se alcanza el final de la lista
                            onEndReachedThreshold={0.5}// Umbral que determina cuánto antes del final de la lista se debe llamar a onEndReached
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing_notificacion}// Estado que indica si la lista se está refrescando
                                    onRefresh={this.onRefreshNotificaciones}// Función que se llama cuando se realiza un gesto de refresco
                                />
                            }
                            // Componente que se muestra cuando la lista está vacía
                            ListEmptyComponent={
                                (!loading_notificacion && pagina_actual == 1 && !mensajeNotificacion) && (
                                    busqueda_activa_notificacion ?
                                        <Text style={styles.textoBusqueda}>Sin resultados</Text> :
                                        <Text style={styles.textoBusqueda}>Sin notificaciones por el momento</Text>
                                )
                            }
                        />


                    </View>


                    { /*Modal Filtro de notificacion*/}
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


                                                {/* Acordeón para mostrar notificaciones basada en las fecha*/}
                                                <List.Accordion title="Mostrar"
                                                    theme={{ colors: { primary: 'black' } }}
                                                    style={{ borderColor: '#dee2e6', borderTopWidth: 1 }}
                                                >
                                                    <View style={styles.lista_acordeon}>
                                                        <View style={styles.viewSelectFiltro}>
                                                            {/* Select para mostrar las notificaciones basadas en la fecha */}
                                                            < RNPickerSelect
                                                                value={selectMostrar} // Valor actual seleccionado
                                                                onValueChange={this.handleMostrarChange} // Función que maneja el cambio de select
                                                                placeholder={{}} // Espacio reservado en el select
                                                                style={{ inputAndroid: styles.inputBusqueda }} // Estilo para el select en Android
                                                                items={[
                                                                    { label: 'Todas las fechas', value: '0' },
                                                                    { label: 'Últimos 5 dias', value: '5' },
                                                                    { label: 'Últimos 10 dias', value: '10' },
                                                                    { label: 'Últimos 20 dias', value: '20' },
                                                                    { label: 'Últimos 40 dias', value: '40' },
                                                                    { label: 'Últimos 60 dias', value: '60' },
                                                                ]}
                                                            />

                                                        </View>
                                                    </View>
                                                </List.Accordion>


                                                {/* Acordeón para el estado de las notificaciones */}
                                                <List.Accordion title="Estado"
                                                    theme={{ colors: { primary: 'black' } }}
                                                    style={{ borderColor: '#dee2e6', borderTopWidth: 1 }}
                                                >
                                                    <View style={styles.lista_acordeon}>
                                                        <View style={styles.viewSelectFiltro}>
                                                            {/* Select para el estado de la notificacion*/}
                                                            <RNPickerSelect
                                                                value={selectEstado} // Valor actual seleccionado
                                                                onValueChange={this.handleEstadoChange} // Función que maneja el cambio de select
                                                                placeholder={{}} // Espacio reservado en el select
                                                                style={{ inputAndroid: styles.inputBusqueda }} // Estilo para el select en Android
                                                                items={[

                                                                    { label: 'Todos', value: 'todos' },
                                                                    { label: 'Leidos', value: '1' },
                                                                    { label: 'Sin leer', value: '0' },
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



                    {/*Modal eliminar notificacion */}
                    <View >

                        {/* Proveedor de temas de Paper para estilos consistentes */}
                        <PaperProvider theme={theme}>
                            <Modal visible={modalEliminarNotificacion} animationType="fade" statusBarTranslucent={false} transparent={true} >
                                <ScrollView style={styles.modalViewFondo}>
                                    <View style={[styles.modalView, { marginTop: '65%', margin: 20 }]}>
                                        <Text style={styles.textTitulo}>Eliminar notificacion</Text>
                                        <View style={{ marginBottom: 20, padding: 10 }}>
                                            {/*Mensaje de alerta si hay uno*/}
                                            {alertModalErrorEliminarNotificacion && (
                                                mostrarMensaje(alertModalErrorEliminarNotificacion, 'danger')
                                            )}
                                            <Text style={styles.tamanio_texto}>¿Estas seguro de querer eliminar la siguiente notificacion?</Text>

                                            {/*Detalles de la notificacion a eliminar dependiendo de que sea*/}
                                            {
                                                notificacionSeleccionado.tipo_notificacion == "Seguimiento" ? (
                                                    <Text style={styles.tamanio_texto}><Text style={{ fontWeight: 'bold' }}>{notificacionSeleccionado.nombre_usuario}</Text> comenzó a seguirte. <Text style={styles.text_fecha}>{notificacionSeleccionado.fecha_notificacion}</Text></Text>
                                                ) : notificacionSeleccionado.tipo_notificacion == "Pregunta" ? (
                                                    <Text style={styles.tamanio_texto}>Recibiste una nueva pregunta sobre tu producto <Text style={{ fontWeight: 'bold' }}>{notificacionSeleccionado.nombre_producto}</Text> del usuario <Text style={{ fontWeight: 'bold' }}>{notificacionSeleccionado.nombre_usuario}</Text>. <Text style={styles.text_fecha}>{notificacionSeleccionado.fecha_notificacion}</Text></Text>
                                                ) : notificacionSeleccionado.tipo_notificacion == "Respuesta" && (
                                                    <Text style={styles.tamanio_texto}>Recibiste una respuesta sobre el producto <Text style={{ fontWeight: 'bold' }}>{notificacionSeleccionado.nombre_producto}</Text> del usuario <Text style={{ fontWeight: 'bold' }}>{notificacionSeleccionado.nombre_usuario}</Text>. <Text style={styles.text_fecha}>{notificacionSeleccionado.fecha_notificacion}</Text></Text>
                                                )
                                            }

                                        </View>

                                        {/* Botones para eliminar la respuesta o cancelar el proceso */}
                                        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                                            <TouchableOpacity
                                                style={[styles.boton, styles.botonInfo, loading_eliminar_notificacion ? styles.botonDesactivado : null]}
                                                onPress={() => this.setState({ modalEliminarNotificacion: false, alertModalErrorEliminarNotificacion: '' })}
                                                disabled={loading_eliminar_notificacion}//Desactiva el boton cuando se llama a la funcion de eliminar la notificacion
                                            >
                                                <Text style={[styles.textoBoton, styles.textoInfo]}>Cancelar</Text>
                                            </TouchableOpacity>


                                            <TouchableOpacity
                                                style={[styles.boton, styles.botonBaja, loading_eliminar_notificacion ? styles.botonDesactivado : null]}
                                                onPress={() => this.eliminar_notificacion()}// Función para eliminar la notificacion 
                                                disabled={loading_eliminar_notificacion}//Desactiva el boton cuando se llama a la funcion de eliminar la notificacion
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