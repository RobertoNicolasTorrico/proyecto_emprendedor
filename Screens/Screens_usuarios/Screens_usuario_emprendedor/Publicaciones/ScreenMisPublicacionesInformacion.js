import React, { Component } from 'react';

//Componentes utilizados en React Native
import { ActivityIndicator, Modal, View, SafeAreaView, Text, TouchableOpacity, ScrollView, FlatList, RefreshControl, Image, Alert } from 'react-native';
import { Card } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput, PaperProvider, List } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';

//Biblioteca para almacenamiento asincrono de datos
import AsyncStorage from '@react-native-async-storage/async-storage';

//Componente para mostrar iconos
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

//Iconos especificos de FontAwesome
import { faMapLocationDot } from '@fortawesome/free-solid-svg-icons';

//Biblioteca para crear carruseles 
import Swiper from 'react-native-swiper';

//Componentes para reproducir videos y ajustar el tamaño del video
import { Video, ResizeMode } from 'expo-av';

//Archivo de estilos
import { styles } from '../../../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { obtenerCantNotificacionesSinLeer, formatearFechaBusqueda, mostrarMensaje, formatearFecha, formatearFechaTextInput, esImagen, renderPaginationButtons } from '../../../../config/funciones.js';

//Módulo para realizar consultas a las APIs relacionadas
import api_publicacion from '../../../../config/consultas_api/api_publicacion.js'

//Configuracion de URL y otros parametros
import { config_define } from '../../../../config/config_define.js';


export class ScreenMisPublicacionesInformacion extends Component {
    constructor(props) {
        super(props);
        this.state = {

            //Identificador del usuario actual
            id_usuario: null,
            tipo_usuario: null,


            //Datos de las publicaicones
            refreshing_publicacion: false,//Indica el estado de actualizar toda la pestaña de publicaciones
            cantidad_total_publicaciones: 0,//Indica la cantidad total de publicaciones
            cantidad_actual_publicacion: 0,//Indica la cantidad actual de publicaciones
            loading_publicaciones: false,//Indica el estado de  informacion de las publicaciones
            lista_publicaciones: [],//Lista de publicaciones recibidas que se mostraran
            pagina: '',//Indicador que contiene en que pagina se encuentra el usuario y la cantidad de paginas que hay
            registro: '', //Indicador que muestra la cantidad de elementos que se ve en la interfaz
            pagina_actual: 1,//Pagina actual de publicaciones para la paginacion
            total_paginas: 0,//Indica la cantidad total de paginas para la paginacion

            //Busqueda predeterminada de publicaciones
            search: "",
            busqueda_activa: false,//Indica si el usuario buscar una publicaciones recibida

            //Filtro de producto
            select_cant_publicaciones: '5',//Indicador de cantidad de productos que se mostraran
            modalFiltroEstado: false, //Indica el estado del modal del filtro

            //Datos de la fecha
            date: '',
            fechaBusqueda: '',
            modalFiltroEstadoFecha: false,//Indica el estado del modal del filtro de fecha

            mensajePublicacion: '',//Mensaje de error al obtener los datos de las publicaciones

            //Modal eliminar publicacion
            modalEliminarPublicacion: false,//Indica el estado del modal para eliminar una publicacion
            publicacionSeleccionada: {
                id_publicacion: null,//Indica el ID de la publicacion seleccionada al eliminar
                descripcion: null,//Indica descripcion de la publicacion que se va eliminar
            },
            alertModalErrorEliminarPublicacion: '',//Mensaje de error al eliminar una respuesta
            loading_eliminar_producto: false,// Indica el estado al eliminar una publicacion

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
            //Despues de actualizar el estado se llama a la funcion para obtener los datos de las publicacion del emprendedor
            this.obtenerPublicacionesWhereBuscadorEmprendedor();

        });
        //Agrega un listener para actualizar las publicaciones del emprendedor cuando la pantalla esta enfocada 
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.obtenerPublicacionesWhereBuscadorEmprendedor();

        });
    }

    //Funcion para obtener las publicaciones del emprendedor
    obtenerPublicacionesWhereBuscadorEmprendedor = async () => {
        const { id_usuario, tipo_usuario, fechaBusqueda, pagina_actual, select_cant_publicaciones } = this.state;

        try {
            //Actualiza el estado para obtener las publicaciones del usuario ademas de eliminar cualquier mensaje previo
            this.setState({ loading_publicaciones: true, mensajePublicacion: '', lista_publicaciones: [] });

            //Se llama a la funcion que tiene la API para obtener las publicaciones del emprendedor
            const respuesta = await api_publicacion.obtenerPublicacionesWhereBuscadorEmprendedor(id_usuario, tipo_usuario, fechaBusqueda, pagina_actual, select_cant_publicaciones);

            //Actualiza el estado de la lista de publicaciones ademas de otros elementos necesarios para la interfaz
            this.setState({
                lista_publicaciones: respuesta.lista_publicaciones,
                cantidad_actual_publicacion: respuesta.cantidad_actual,
                cantidad_total_publicaciones: respuesta.cantidad_total_publicacion,
                busqueda_activa: respuesta.busqueda_activa,
                pagina: respuesta.pagina,
                total_paginas: respuesta.totalPaginas,
                registro: respuesta.registro,
            });
        }
        catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({ mensajePublicacion: error.message }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            //Finaliza el estado de carga y refresco de publicacion
            this.setState({ refreshing_publicacion: false, loading_publicaciones: false });

            //Actualiza el numero de notificaciones
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
        }
    };

    //Actualiza el componente de la fecha de busqueda
    handleDateChanger = (event, selectedDate) => {

        // Verifica si el evento es de tipo set lo que indica que se ha seleccionado una fecha
        if (event.type === 'set') {
            // Obtiene la fecha seleccionada o la fecha actual del estado si no hay fecha seleccionada
            const currentDate = selectedDate || this.state.date;

            // Actualiza el estado del componente de la fecha, se cierra el modal de seleccion de fecha y formatear la fecha para la vista del usuario
            //Despues se llama a la funcion para obtener las publicaciones que cumplen los criterios de busqueda
            this.setState({ pagina_actual: 1, date: currentDate, modalFiltroEstadoFecha: false, fechaBusqueda: formatearFechaBusqueda(currentDate) }, () => {
                this.obtenerPublicacionesWhereBuscadorEmprendedor();
            });
        } else {
            // Si el evento no es de tipo set se solo cierra el modal de selección de fecha
            this.setState({ modalFiltroEstadoFecha: false });
        }
    };

    //Funcion para restablecer los valores del elemento fecha
    restablecer_valor_fecha() {

        //Establece la pagina a 1 ademas de cambiar el valor de cantidad de publicaciones a mostrar
        //Despues se llama a la funcion para obtener las publicaciones que cumplen los criterios de busqueda
        this.setState({ date: '', fechaBusqueda: '', pagina_actual: 1 }, () => {
            this.obtenerPublicacionesWhereBuscadorEmprendedor();
        });
    }


    //Actualiza el estado del componente de cantidad de publicaciones a mostrar
    handleCantPublicacionChange = (nuevo_cantidad) => {
        //Establece la pagina a 1 ademas de cambiar el valor de cantidad de publicaciones a mostrar
        //Despues se llama a la funcion para obtener las publicaciones que cumplen los criterios de busqueda

        this.setState({
            pagina_actual: 1,
            select_cant_publicaciones: nuevo_cantidad
        }, () => {
            this.obtenerPublicacionesWhereBuscadorEmprendedor();
        });
    };

    //Funcion para restablecer los valores del filtro del modal
    restablecer_valores_modal() {
        //Restablece los valores del modal y tambien la pagina a 1
        //Despues se llama a la funcion para obtener las publicaciones que cumplen los criterios de busqueda

        this.setState({
            pagina_actual: 1, fechaBusqueda: '', date: '', select_cant_publicaciones: "5"
        }, () => {
            this.obtenerPublicacionesWhereBuscadorEmprendedor();
        });
    };


    //Funcion que renderizar cada elemento de la lista de publicaciones
    renderItemPublicacion = ({ item }) => {
        return (

            //Componente Card para mostrar la informacion de la publicacion
            <Card key={item.detalles_publicaciones.id_publicacion_informacion}>

                {/*Verifica que la publicacion tenga archivos */}
                {item.archivos.length > 0 &&
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

                {/*Componente View que contiene la descripcion y la fecha de la publicacion */}
                <View style={{ marginTop: 20, marginBottom: 10 }}>
                    <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Fecha de publicacion:</Text> {formatearFecha(item.detalles_publicaciones.fecha_publicacion)} </Text>
                    <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Descripcion:</Text> {item.detalles_publicaciones.descripcion} </Text>
                </View>

                {/*Verifica que halla cordenadas para mostrar el TouchableOpacity de ubicacion */}
                {item.detalles_publicaciones.map_latitud != null && item.detalles_publicaciones.map_longitud != null &&
                    (<View style={{ alignItems: 'flex-start', marginTop: 10, marginBottom: 10 }}>
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
                <Card.Divider />


                {/* Componente View que contiene dos TouchableOpacity uno para eliminar una publicacion y el otro para modificar la publicacion */}
                <View style={{ flexDirection: 'row', alignSelf: 'center' }}>

                    {/*Componente TouchableOpacity para navegar hacia la modificacion de la publicacion */}
                    <TouchableOpacity
                        style={[styles.boton, styles.botonModificacion]}
                        onPress={() => {
                            this.props.navigation.navigate("ScreenModificarPublicacion", { id_publicacion: item.detalles_publicaciones.id_publicacion_informacion });
                        }}
                    >
                        <Text style={[styles.textoBoton, styles.textoModificacion]}>Modificar</Text>
                    </TouchableOpacity>


                    {/*Componente TouchableOpacity para abrir el modal para eliminar la publicacion */}
                    <TouchableOpacity
                        style={[styles.boton, styles.botonBaja]}
                        onPress={() => this.setState({
                            modalEliminarPublicacion: true,
                            publicacionSeleccionada: {
                                id_publicacion: item.detalles_publicaciones.id_publicacion_informacion,
                                descripcion: item.detalles_publicaciones.descripcion
                            }
                        })}
                    >
                        <Text style={[styles.textoBoton, styles.textoBaja]}>Eliminar</Text>
                    </TouchableOpacity>
                </View>
            </Card>
        );
    };


    //Funcion para cambiar la pagina actual
    cambiarPagina = (pagina) => {
        //Despues de actualizar el numero de pagina se llama a la funcion para obtener las publicaciones
        this.setState({ pagina_actual: pagina }, () => {
            this.obtenerPublicacionesWhereBuscadorEmprendedor();
        });
    };


    //Funcion para eliminar la publicacion del emprendedor
    eliminar_publicacion = async () => {
        const { id_usuario, tipo_usuario, publicacionSeleccionada, cantidad_actual_publicacion, pagina_actual } = this.state;

        try {
            //Actualiza el estado para eliminar una publicaciion para evitar errores cuando se este llamando a la API ademas de eliminar cualquier mensaje previo
            this.setState({ loading_eliminar_producto: true, alertModalErrorEliminarPublicacion: '' });
            var pagina = pagina_actual;

            //Se llama a la funcion que tiene la API para eliminar la publicacion
            const resultado = await api_publicacion.bajaPublicacion(id_usuario, tipo_usuario, publicacionSeleccionada.id_publicacion);


            //En caso que la cantidad de publicaciones que se ve en la interfaz sea igual 1 y la pagina actual es mayor a 1
            //Se va restar uno a la pagina debido a la eliminacion de la publicacion
            if (cantidad_actual_publicacion == 1 && pagina_actual > 1) {
                pagina = pagina - 1;
            }

            //Actualiza el estado para cerrar el modal de eliminar la publicacion 
            //Despues se llama a la funcion para obtener una lista de publicaciones
            this.setState({
                modalEliminarPublicacion: false, pagina_actual: pagina
            }, () => {
                this.obtenerPublicacionesWhereBuscadorEmprendedor();
                Alert.alert("Exito", resultado.mensaje);
            });

        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                alertModalErrorEliminarPublicacion: error.message
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            //Finaliza el estado de carga para eliminar la publicacion
            this.setState({ loading_eliminar_producto: false });

            //Actualiza el numero de notificaciones
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
        }

    };


    //Funcion para restablecer la lista publicaciones
    onRefreshPublicacion = () => {
        //Reinicia la pagina a 1 y establece el estado de refreshing_publicacion a true
        //Despues se llama a la funcion para obtener las publicaciones que cumplen los criterios de busqueda
        this.setState({ refreshing_publicacion: true, pagina_actual: 1 }, () => {
            this.obtenerPublicacionesWhereBuscadorEmprendedor();
        });
    };


    render() {
        const {
            //Busqueda
            cantidad_total_publicaciones, busqueda_activa,
            //Lista de publicaciones
            loading_publicaciones, lista_publicaciones, refreshing_publicacion, pagina_actual, mensajePublicacion, total_paginas, registro, pagina,
            //Modal eliminar publicacion
            alertModalErrorEliminarPublicacion, modalEliminarPublicacion, loading_eliminar_producto, publicacionSeleccionada,
            //Modal filtro 
            date, modalFiltroEstado, modalFiltroEstadoFecha, select_cant_publicaciones
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
                    <View style={[styles.viewCard, { flex: 1 }]}>

                        {/*Componente View que contiene dos TouchableOpacity uno para abrir el modal de filtro y otro para hacer una nueva publicacion*/}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 }}>
                            {/*Componente TouchableOpacity para abrir el modal de filtro*/}
                            <TouchableOpacity
                                style={styles.boton}
                                onPress={() => this.setState({ modalFiltroEstado: true })}
                            >
                                <Text style={styles.textoBoton}>Filtros</Text>
                            </TouchableOpacity>

                            {/*Componente TouchableOpacity para navegar a la pantalla para hacer una nueva publicacion */}
                            <TouchableOpacity
                                style={[styles.boton, styles.botonConfirmacion]} onPress={() => {
                                    this.props.navigation.navigate("ScreenNuevaPublicacion");
                                }}
                            >
                                <Text style={[styles.textoBoton, styles.textoConfirmacion]}>Nueva publicacion</Text>
                            </TouchableOpacity>

                        </View>
                        {/*Verifica que el usuario inicio una busqueda y que la lista de publicaciones sea mayor a 0 para mostrar la cantidad de resultados de busqueda o la cantidad de publicaciones si no se esta buscando una publicacion*/}
                        {!loading_publicaciones && lista_publicaciones.length > 0 && (
                            busqueda_activa ?
                                <Text style={{ fontSize: 25, marginStart: 15 }}>Resultados: {cantidad_total_publicaciones}</Text> :
                                <Text style={{ fontSize: 25, marginStart: 15 }}>Publicaciones: {cantidad_total_publicaciones}</Text>
                        )}

                        {loading_publicaciones && <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />}

                        {/*Verifica si hay un mensaje de error*/}
                        {mensajePublicacion && (
                            /*Se llama a la funcion para obtener un contenedor que muestra un mensaje de error*/
                            mostrarMensaje(mensajePublicacion, 'danger')
                        )}

                        <FlatList
                            // Componente que se renderiza al comienzo de la lista
                            ListHeaderComponent={
                                <View style={{ paddingStart: 10, paddingEnd: 10, paddingTop: 10 }}>
                                    <Text style={styles.texto_mensaje}>Las publicaciones pueden ser modificadas y eliminadas en cualquier momento por el usuario.</Text>
                                </View>
                            }
                            data={lista_publicaciones}// Datos de la lista que serán renderizados
                            renderItem={this.renderItemPublicacion}// Función que renderiza cada elemento de la lista
                            keyExtractor={(item, index) => index.toString()}// Función para extraer la clave única para cada elemento
                            onEndReachedThreshold={0.5}// Umbral que determina cuánto antes del final de la lista se debe llamar a onEndReached
                            ListFooterComponent={lista_publicaciones.length > 0 && (renderPaginationButtons(total_paginas, pagina_actual, registro, pagina, this.cambiarPagina))}// Componente que se renderiza al final de la lista
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing_publicacion}// Estado que indica si la lista se está refrescando
                                    onRefresh={this.onRefreshPublicacion}// Función que se llama cuando se realiza un gesto de refresco
                                />
                            }
                            // Componente que se muestra cuando la lista está vacía
                            ListEmptyComponent={
                                !loading_publicaciones && !mensajePublicacion && (
                                    busqueda_activa ?
                                        <Text style={styles.textoBusqueda}>Sin resultados</Text> :
                                        <Text style={styles.textoBusqueda}>No hay publicaciones registradas</Text>)
                            }
                        />

                        {/*Modal Filtro de publicaciones por fecha*/}
                        {modalFiltroEstadoFecha && (
                            <DateTimePicker
                                mode="date" // Configura el selector en modo fecha
                                value={date || new Date()} // Establece el valor inicial como la fecha actual o date si está definido
                                onChange={this.handleDateChanger} // Maneja el cambio de fecha llamando al método handleDateChanger
                            />
                        )}

                        {/*Modal Filtro de publicacion*/}
                        <View>
                            <PaperProvider theme={theme}>
                                <Modal
                                    visible={modalFiltroEstado} // Controla si el modal está visible o no
                                    animationType="fade" // Tipo de animación cuando se muestra o se oculta el modal
                                    statusBarTranslucent={false} // Configuración translúcida para la barra de estado 
                                    transparent={true} // Hacer el fondo del modal transparente
                                >
                                    <ScrollView style={styles.modalViewFondo}>
                                        <View style={styles.modalView}>

                                            {/* Sección de filtros */}
                                            <List.Section titleStyle={{ fontSize: 25 }} title="Filtro" >
                                                <View style={{ borderRadius: 6, borderColor: '#dee2e6', borderWidth: 1, marginBottom: 20 }}>

                                                    {/* Acordeón para la cantidad de publicaciones a mostrar */}
                                                    <List.Accordion title="Mostrar cantidad de publicaciones"
                                                        theme={{ colors: { primary: 'black' } }}
                                                        style={{ borderColor: '#dee2e6', borderTopWidth: 1 }}
                                                    >
                                                        <View style={styles.lista_acordeon}>
                                                            <View style={styles.viewSelectFiltro}>

                                                                {/* Select para la cantidad de preguntas a mostrar */}
                                                                <RNPickerSelect
                                                                    value={select_cant_publicaciones} // Valor actual seleccionado
                                                                    onValueChange={this.handleCantPublicacionChange} // Función que maneja el cambio de select
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


                                                    {/* Acordeón para mostrar las publicaciones basada en las fecha*/}
                                                    <List.Accordion title="Fecha de publicacion"
                                                        theme={{ colors: { primary: 'black' } }}
                                                        style={{ borderColor: '#dee2e6', borderTopWidth: 1 }}
                                                    >
                                                        {/*Componente View que contiene el boton para abrir el modal de fecha y borrar la fecha seleccionada */}
                                                        <View style={styles.lista_acordeon}>
                                                            <View style={{ marginStart: 10, marginTop: 10, width: '90%' }}>
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

                                                </View>
                                            </List.Section>


                                            {/*Componente View que contiene dos TouchableOpacity para restablecer los valores del modal y cerrar el modal */}
                                            <View style={{ flexDirection: 'row', alignSelf: 'center' }}>

                                                {/*Componente TouchableOpacity restablecer los valores del modal  */}
                                                <TouchableOpacity
                                                    style={styles.boton}
                                                    onPress={() => this.restablecer_valores_modal()}// Función para restablecer los valores del filtro
                                                >
                                                    <Text style={styles.textoBoton}>Restablecer Filtro</Text>
                                                </TouchableOpacity>

                                                {/*Componente TouchableOpacity para cerrar el modal  */}
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

                        {/*Modal eliminar publicacion*/}
                        <View >
                            <PaperProvider theme={theme}>
                                <Modal
                                    visible={modalEliminarPublicacion} // Controla si el modal está visible o no
                                    animationType="fade" // Tipo de animación cuando se muestra o se oculta el modal
                                    statusBarTranslucent={false} // Configuración translúcida para la barra de estado 
                                    transparent={true} // Hacer el fondo del modal transparente
                                >
                                    <ScrollView style={styles.modalViewFondo}>
                                        <View style={[styles.modalView, { marginTop: '65%' }]}>
                                            <Text style={styles.textTitulo}>Eliminar publicacion</Text>
                                            <View style={{ marginBottom: 20, padding: 10 }}>

                                                {/*Verifica si hay un mensaje de error en el modal*/}
                                                {alertModalErrorEliminarPublicacion && (
                                                    /*Se llama a la funcion para obtener un contenedor que muestra un mensaje de error*/
                                                    mostrarMensaje(alertModalErrorEliminarPublicacion, 'danger')
                                                )}
                                                <Text style={styles.tamanio_texto}>¿Estas seguro de querer eliminar la siguiente publicacion?</Text>

                                                {/*Detalles de la publicacion a eliminar*/}
                                                <Text style={[styles.tamanio_texto, { paddingLeft: 15, marginBottom: 5 }]}>
                                                    <Text style={styles.caracteristica}>Descripcion:</Text>
                                                    <Text>{publicacionSeleccionada.descripcion}</Text>
                                                </Text>
                                            </View>


                                            {/* Componente View que contiene dos TouchableOpacity uno para eliminar la publicacion y otro para cancelar el proceso */}
                                            <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                                                <TouchableOpacity
                                                    style={[styles.boton, styles.botonInfo, loading_eliminar_producto && styles.botonDesactivado]}
                                                    onPress={() => this.setState({ modalEliminarPublicacion: false, alertModalErrorEliminarPublicacion: '' })}
                                                    disabled={loading_eliminar_producto}//Desactiva el boton cuando se llama a la funcion para eliminar la publicacion
                                                >
                                                    <Text style={[styles.textoBoton, styles.textoInfo]}>Cancelar</Text>
                                                </TouchableOpacity>


                                                <TouchableOpacity
                                                    style={[styles.boton, styles.botonBaja, loading_eliminar_producto && styles.botonDesactivado]}
                                                    onPress={() => this.eliminar_publicacion()}
                                                    disabled={loading_eliminar_producto}//Desactiva el boton cuando se llama a la funcion para eliminar la publicacion
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
                </View>
            </SafeAreaView>
        );
    }
}