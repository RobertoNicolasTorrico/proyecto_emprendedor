
import React, { Component } from 'react';


//Componentes utilizados en React Native
import { ActivityIndicator, Image, TouchableOpacity, Alert, FlatList, RefreshControl, SafeAreaView, ScrollView, Text, View, Modal } from 'react-native';
import { PaperProvider, TextInput } from 'react-native-paper';
import { Card } from '@rneui/themed';

//Biblioteca para almacenamiento asincrono de datos
import AsyncStorage from '@react-native-async-storage/async-storage';

//Componente para mostrar iconos
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

//Iconos especificos de FontAwesome
import { faStar } from '@fortawesome/free-solid-svg-icons';

//Biblioteca para crear carruseles 
import Swiper from 'react-native-swiper';

//Archivo de estilos
import { styles } from '../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { mostrarMensaje, formatearFecha, formatPrecio, renderPreguntas } from '../../config/funciones.js';

//Configuracion de URL y otros parametros
import { config_define } from '../../config/config_define.js';

//Módulo para realizar consultas a las APIs relacionadas
import api_producto from '../../config/consultas_api/api_producto.js';
import api_preguntas from '../../config/consultas_api/api_preguntas.js';
import api_respuestas from '../../config/consultas_api/api_respuestas.js';

export class ScreenDetallesProducto extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //Identificador del usuario actual
            id_usuario_emprendedor: null,
            id_usuario: null,
            tipo_usuario: null,

            id_producto: this.props.route.params.id_producto,//Indica el id del producto a mostrar

            //Datos del producto
            detalles_producto: [], //Indica los detalles del producto
            archivos_producto: [], //Indica los archivos de la publicacion del producto
            refreshing_producto: false,//Indica el estado de actualizar toda la pestaña de productos
            mensajeErrorInicio: '',//Mensaje de error al obtener los datos del producto
            loading_inicio: true,//Indica cuando se esta cargando la informacion del producto

            estadoProductoFinalizado: false,//Indica si el estado del producto es finalizado
            elUsuarioPublico: false,//Indica si el usuario ingresado publico el producto
            usuarioValido: false,//Indica si el usuario ingresado es valido

            tipoMensajeAlertPreguntaRespuesta: '', //Tipo de mensaje a mostrar dependiendo de lo que haga el usuario 
            mensajeAlertPreguntaRespuesta: '', //Mensaje a mostrar dependiendo de lo que haga el usuario 

            //Modal para mostrar todas las preguntas al propietario del producto
            modalPreguntasPropietario: false,//Indica el estado del modal para mostrar todas las preguntas recibidas del producto
            alertModalErrorPreguntasProducto: '',//Mensaje de error al obtener las preguntas del producto
            loading_preguntas_producto: false,//Indica el estado al cargar todas las preguntas actualizadas del modal

            //Modal para mostrar todas las preguntas hechas al producto
            modalPreguntasGenerales: false,
            lista_preguntas_generales: [],//Indica las preguntas hechas por los usuarios

            //Modal para mostrar todas las preguntas hechas al producto por un usuario especifico
            modalPreguntasUsuario: false,
            lista_preguntas_usuario: [],//Indica las preguntas hechas por el usuario

            //Hacer una pregunta al producto
            loading_agregar_pregunta: false, // Indica el estado al agregar una nueva pregunta
            txtPregunta: '',    //Texto que contiene la pregunta que se va enviar
            loading_pregunta_respuesta: false, //Indica el estado al cargar las preguntas actualizadas

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
            loading_eliminar_respuesta: false// Indica el estado al eliminar una respuesta

        };
    }


    //Metodo llamado cuando el componente se monta
    async componentDidMount() {
        //Se obtienen los datos de sesion almacenados en AsyncStorage
        const idUsuario = await AsyncStorage.getItem('idUsuario');
        const tipoUsuario = await AsyncStorage.getItem('tipoUsuario');
        const idUsuarioEmprendedor = await AsyncStorage.getItem('idUsuarioEmprendedor');

        //Se actualiza el estado con los datos de sesion
        this.setState({
            id_usuario: idUsuario,
            tipo_usuario: tipoUsuario,
            id_usuario_emprendedor: idUsuarioEmprendedor
        }, () => {
            //Despues de actualizar el estado, se llaman a las funcion para obtener los datos del producto
            this.obtenerDetallesProducto();
        });
    }


    //Funcion para obtener una lista con las preguntas actualizadas del producto
    obtenerListaPreguntasActualizadas = async () => {
        const { id_usuario, tipo_usuario, id_producto } = this.state;

        try {
            //Actualiza el estado para cargar las preguntas ademas eliminar cualquier mensaje previo
            this.setState({ loading_pregunta_respuesta: true, mensajeAlertPreguntaRespuesta: '', tipoMensajeAlertPreguntaRespuesta: '' });

            //Se llama a la funcion que tiene la API para obtener una lista actualiza de las preguntas del producto
            const respuesta = await api_preguntas.obtenerListaPreguntasProducto(id_usuario, tipo_usuario, id_producto);

            //Se verifica que el estado del producto no esta pausado y que la cuenta del usuario este activada y no baneado
            if (respuesta.producto_valido) {
                var mensaje = "La publicacion del producto no se encuentra disponible por el momento";
                this.setState({ mensajeErrorInicio: mensaje }, () => {
                    Alert.alert("Aviso", mensaje);
                });
            } else {
                this.setState({
                    lista_preguntas_usuario: respuesta.preguntasUsuario,
                    lista_preguntas_generales: respuesta.preguntasGenerales,
                    elUsuarioPublico: respuesta.el_usuario_publico,
                    estadoProductoFinalizado: respuesta.estado_producto_finalizado,
                    usuarioValido: respuesta.usuario_valido,
                });
            }

        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensajeAlertPreguntaRespuesta: error.message, tipoMensajeAlertPreguntaRespuesta: 'danger'
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            //Finaliza el estado de cargar al obtetener las preguntas
            this.setState({ loading_pregunta_respuesta: false });
        }
    };


    //Funcion para obtener detalles del productos
    obtenerDetallesProducto = async () => {
        const { id_usuario, tipo_usuario, id_producto } = this.state;

        try {
            //Actualiza el estado para cargar la informacion del producto 
            this.setState({ loading_inicio: true, mensajeErrorInicio: '' });

            //Se llama a la funcion que tiene la API para obtener los datos del producto
            const respuesta = await api_producto.obtenerDatosProducto(id_usuario, tipo_usuario, id_producto);
            //Actualiza el estado de los detalles del producto, los archivos del mismo ademas de otros elementos necesarios para la interfaz
            this.setState({
                detalles_producto: respuesta.detalles_producto,
                archivos_producto: respuesta.archivos,
                lista_preguntas_usuario: respuesta.preguntasUsuario,
                lista_preguntas_generales: respuesta.preguntasGenerales,
                elUsuarioPublico: respuesta.el_usuario_publico,
                estadoProductoFinalizado: respuesta.estado_producto_finalizado,
                usuarioValido: respuesta.usuario_valido,
            });

        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensajeErrorInicio: error.message
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            //Finaliza el estado de carga y refresco de producto
            this.setState({ loading_inicio: false, refreshing_producto: false });
        }
    };


    //Funcion para enviar una pregunta al producto
    enviar_pregunta = async () => {

        try {
            const { id_usuario, tipo_usuario, txtPregunta, id_producto } = this.state;

            //Actualiza el estado para hacer otra pregunta para evitar errores cuando se este llamando a la API ademas de eliminar cualquier mensaje previo
            this.setState({ loading_agregar_pregunta: true, mensajeAlertPreguntaRespuesta: '' });


            //Se llama a la funcion que tiene la API para hacer mas preguntas al producto
            const resultado = await api_preguntas.altaPregunta(id_usuario, tipo_usuario, txtPregunta, id_producto);


            //Actualiza el estado para cerrar el modal ademas de borrar el campo de la pregunta
            //Despues se llama a la funcion para obtener una lista de preguntas actualizada
            this.setState({
                mensajeAlertPreguntaRespuesta: resultado.mensaje, tipoMensajeAlertPreguntaRespuesta: resultado.estado,
                txtPregunta: ''
            }, () => {
                Alert.alert("Exito", resultado.mensaje);
                this.obtenerListaPreguntasActualizadas();

            });

        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensajeAlertPreguntaRespuesta: error.message, tipoMensajeAlertPreguntaRespuesta: 'danger'
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            //Finaliza el estado de cargar enviar pregunta
            this.setState({ loading_agregar_pregunta: false });
        }
    };


    //Funcion que renderizar cada elemento de la lista de preguntas generales de un producto
    renderItemPreguntasGeneral = ({ item }) => {
        return (

            /*Componente View para mostrar la pregunta y respuesta */
            <View key={item.id_pregunta_respuesta} style={styles.ViewPreguntaRespuesta}>
                { /*Componente View que contiene la pregunta y la fecha que se hizo la pregunta*/}
                <View style={{ paddingLeft: 15 }}>
                    <Text style={[styles.tamanio_texto, { marginBottom: 5 }]}>
                        <Text>{item.pregunta}</Text>
                        <Text style={styles.text_fecha}>({formatearFecha(item.fecha_pregunta)})</Text>
                    </Text>
                </View>
                {/*Verifica si la pregunta fue respondida o no  */}
                {item.respuesta && (
                    /*Componente View que contiene la respuesta y la fecha que se respondio*/
                    <View style={{ paddingLeft: 25 }}>
                        <Text style={[styles.tamanio_texto, { marginBottom: 5 }]}>
                            <Text>{item.respuesta}</Text>
                            <Text style={styles.text_fecha}>({formatearFecha(item.fecha_respuesta)})</Text>
                        </Text>
                    </View>
                )}
            </View>
        );
    };


    //Funcion que renderizar cada elemento de la lista de preguntas de un producto
    renderItemPreguntasPropietario = ({ item }) => {
        const { loading_preguntas_producto } = this.state
        return (
            /*Componente Card para mostrar la informacion de las preguntas y respuestas recibidas del producto */
            <Card key={item.id_pregunta_respuesta} containerStyle={{ elevation: 5, marginBottom: 15 }}>
                {/*Informacion sobre el nombre del usuario que hizo la pregunta */}
                < Text style={[styles.tamanio_texto, { marginBottom: 5 }]} >
                    <Text style={styles.caracteristica}>Nombre de usuario:</Text> {item.nombre_usuario}
                </Text >

                { /*Componente View que contiene la pregunta y la fecha que se hizo la pregunta*/}
                <View >
                    <Text style={[styles.tamanio_texto, { marginBottom: 5 }]}>
                        <Text style={styles.caracteristica}>Pregunta:</Text>
                        <Text>{item.pregunta}</Text>
                        <Text style={styles.text_fecha}>({formatearFecha(item.fecha_pregunta)})</Text>
                    </Text>
                </View>

                {/*Verifica si la pregunta fue respondida o no  */}
                {item.respuesta && (
                    /*Componente View que contiene la respuesta y la fecha que se respondio*/
                    <View >
                        <Text style={[styles.tamanio_texto, { marginBottom: 5 }]}>
                            <Text style={styles.caracteristica}>Respuesta:</Text>
                            <Text>{item.respuesta}</Text>
                            <Text style={styles.text_fecha}>({formatearFecha(item.fecha_respuesta)})</Text>
                        </Text>
                    </View>
                )}
                <Card.Divider />

                {/*Componente View que contiene un TouchableOpacity que puede eliminar una respuesta o responder una pregunta  */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>

                    {/*Verifica si la pregunta fue respondida */}
                    {item.respuesta ? (
                        /*Componente TouchableOpacity para eliminar la respuesta */
                        <TouchableOpacity
                            style={[styles.boton, styles.botonBaja, loading_preguntas_producto && styles.botonDesactivado]}
                            disabled={loading_preguntas_producto}
                            onPress={() => this.setState({
                                modalPreguntasPropietario: false,
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
                        /*Componente TouchableOpacity para responder la pregunta */
                        <TouchableOpacity
                            style={[styles.boton, styles.botonConfirmacion, loading_preguntas_producto ? styles.botonDesactivado : null]}
                            disabled={loading_preguntas_producto}
                            onPress={() => this.setState({
                                modalPreguntasPropietario: false,
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
                </View>
            </Card>
        );
    };


    //Funcion para eliminar una respuesta de una pregunta recibida
    eliminar_respuesta = async () => {
        const { id_usuario, tipo_usuario, respuestaSeleccionada, modalPreguntasPropietario } = this.state;

        try {

            //Actualiza el estado para eliminar una respuesta para evitar errores cuando se este llamando a la API ademas de eliminar cualquier mensaje previo
            this.setState({ loading_eliminar_respuesta: true, alertModalErrorEliminarRespuesta: '' });

            //Se llama a la funcion que tiene la API para eliminar la respuesta
            const resultado = await api_respuestas.bajaRespuesta(id_usuario, tipo_usuario, respuestaSeleccionada.id_pregunta_respuesta, respuestaSeleccionada.id_producto);

            await new Promise(resolve => {
                Alert.alert("Exito", resultado.mensaje, [{ text: "OK", onPress: resolve }]);
            });
            //Despues que se elimina la respuesta se cierra el modal tambien se abre el modal donde se encuentra una lista de todoas las preguntas recibidas
            this.setState({
                modalEliminarRespuesta: false,
                modalPreguntasPropietario: true,
                loading_preguntas_producto: true
            });


            //Se llama a la funcion que tiene la API para una lista de preguntas actualizada
            const resultado_preguntas = await api_preguntas.obtenerListaPreguntasProducto(id_usuario, tipo_usuario, respuestaSeleccionada.id_producto);


            //Se actualiza los datos de las preguntas recibidas del producto
            this.setState({ lista_preguntas_generales: resultado_preguntas.preguntasGenerales });

        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            //Verifica que el modal de las preguntas del producto del usuario este activado
            if (modalPreguntasPropietario) {
                this.setState({ alertModalErrorPreguntasProducto: error.message, tipoMensaje: 'danger' });
            } else {
                this.setState({ alertModalErrorEliminarRespuesta: error.message, tipoMensaje: 'danger' });
            }
            Alert.alert("Aviso", error.message);


        } finally {

            //Finaliza el estado de cargar para eliminar la respuesta
            this.setState({ loading_eliminar_respuesta: false, loading_preguntas_producto: false });
        }
    };

    //Funcion para responder una pregunta recibida
    enviar_respuesta = async () => {

        const { id_usuario, tipo_usuario, texto_respuesta, preguntaSeleccionada, modalPreguntasPropietario } = this.state;

        try {

            //Actualiza el estado para responder una pregunta para evitar errores cuando se este llamando a la API ademas de eliminar cualquier mensaje previo
            this.setState({ loading_agregar_respuesta: true, alertModalErrorAgregarRespuesta: '' });


            //Se llama a la funcion que tiene la API para responder una pregunta
            const resultado = await api_respuestas.altaRespuesta(id_usuario, tipo_usuario, preguntaSeleccionada.id_pregunta_respuesta, texto_respuesta, preguntaSeleccionada.id_producto);
            await new Promise(resolve => {
                Alert.alert("Exito", resultado.mensaje, [{ text: "OK", onPress: resolve }]);
            });

            //Despues que se envie la respuesta se cierra el modal y se formatea todos los datos relacionados con la respuesta de la pregunta
            //Tambien se abre el modal donde se encuentra una lista de todoas las preguntas recibidas
            this.setState({
                modalResponderPreguntar: false,
                texto_respuesta: '',
                modalPreguntasPropietario: true,
                loading_preguntas_producto: true
            });


            //Se llama a la funcion que tiene la API para una lista de preguntas actualizada
            const resultado_preguntas = await api_preguntas.obtenerListaPreguntasProducto(id_usuario, tipo_usuario, preguntaSeleccionada.id_producto);
            //Se actualiza los datos de las preguntas recibidas del productos
            this.setState({
                lista_preguntas_generales: resultado_preguntas.preguntasGenerales,
                loading_preguntas_producto: false,
            });

        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            //Verifica que el modal de las preguntas del producto del usuario este activado
            if (modalPreguntasPropietario) {
                this.setState({ alertModalErrorPreguntasProducto: error.message, tipoMensaje: 'danger' });
            } else {
                this.setState({ alertModalErrorAgregarRespuesta: error.message, tipoMensaje: 'danger' });
            }
            Alert.alert("Aviso", error.message);
        } finally {
            //Finaliza el estado de cargar para responder una pregunta
            this.setState({ loading_agregar_respuesta: false, loading_preguntas_producto: false });
        }
    };

    //Funcion para restablecer los detalles del producto
    onRefreshDetallesProducto = () => {
        this.setState({ refreshing_producto: true }, () => {
            this.obtenerDetallesProducto();
        });
    };


    render() {
        const { mensajeErrorInicio, elUsuarioPublico, usuarioValido, refreshing_producto,
            archivos_producto, detalles_producto, loading_inicio, lista_preguntas_usuario,
            lista_preguntas_generales, mensajeAlertPreguntaRespuesta, tipoMensajeAlertPreguntaRespuesta,
            loading_agregar_pregunta, txtPregunta, estadoProductoFinalizado, loading_pregunta_respuesta,
            modalPreguntasUsuario, modalPreguntasGenerales, modalPreguntasPropietario,
            alertModalErrorPreguntasProducto, loading_preguntas_producto,
            loading_eliminar_respuesta, modalEliminarRespuesta, respuestaSeleccionada, alertModalErrorEliminarRespuesta,
            loading_agregar_respuesta, modalResponderPreguntar, preguntaSeleccionada, alertModalErrorAgregarRespuesta, texto_respuesta
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
                <ScrollView style={styles.container}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing_producto}// Estado que indica si el producto se está refrescando
                            onRefresh={this.onRefreshDetallesProducto}// Función que se llama cuando se realiza un gesto de refresco
                        />
                    }>
                    <View style={[styles.viewCard, { flex: 1, marginBottom: 40 }]}>

                        {/*Verifica la cargar de informacion */}
                        {loading_inicio ? (
                            <ActivityIndicator size="large" color="#0000ff" />
                        ) : (
                            <View>
                                {/*Verifica si no hubo problemas al obtener los datos del producto  */}
                                {mensajeErrorInicio ? (
                                    /*Se llama a la funcion para obtener un contenedor que muestra un mensaje de error*/
                                    mostrarMensaje(mensajeErrorInicio, 'danger')
                                ) : (
                                    <View>

                                        {/*Componente View que contiene el nombre del producto*/}
                                        <View style={{ marginBottom: 20 }}>
                                            <Text style={styles.textTitulo}>{detalles_producto.nombre_producto}</Text>
                                        </View>

                                        {/*Componente View que contiene las imagenes del producto*/}
                                        <View style={{ marginBottom: 20, width: "100%", height: 200, alignItems: "center", borderColor: "#cec8c8", borderWidth: 1 }}>
                                            {/*Componente Swiper utlizado para mostrar las imagenes del producto como un carrusel*/}
                                            <Swiper showsButtons={true} loop={false} showsPagination={false}>
                                                {archivos_producto.map((imagen, index) => (
                                                    <View key={index + "_" + imagen.nombre_archivo}>
                                                        <Image style={{ width: "100%", height: "100%" }} resizeMode="contain" source={{ uri: `${config_define.urlBase}/uploads/${detalles_producto.id_usuario_emprendedor}/publicaciones_productos/${imagen.nombre_carpeta}/${imagen.nombre_archivo}` }} />
                                                    </View>
                                                ))}
                                            </Swiper>
                                        </View>


                                        {/*Componente View que contiene detalles del producto*/}
                                        <View>

                                            {/*Descripcion del producto */}
                                            <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Descripcion:</Text>{detalles_producto.descripcion} </Text>

                                            {/*Informacion del estado del producto */}
                                            <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Estado del producto:</Text>{detalles_producto.estado} </Text>

                                            {/*Informacion del precio del producto */}
                                            <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Precio:</Text>{formatPrecio(detalles_producto.precio)}</Text>

                                            {/*Informacion de la categoria del producto */}
                                            <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Categoria:</Text> {detalles_producto.nombre_categoria} </Text>

                                            {/*Informacion del stock del producto */}
                                            <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Stock Disponible:</Text> {detalles_producto.stock} </Text>

                                            {/*Componente View que contiene la calificacion del producto*/}
                                            <View style={styles.starsContainer}>
                                                <Text style={styles.caracteristica}>Calificación del producto</Text>
                                                {/*Verifica la calificacion del producto  */}
                                                {detalles_producto.calificacion === null ?
                                                    /*En caso que no tenga una calificacion va a mostrar el siguiente mensaje */
                                                    (<Text style={styles.tamanio_texto}>Este producto aún no tiene una calificación</Text>)
                                                    :
                                                    /*Componente View que contiene las estrellas que tiene el producto*/
                                                    (<View style={styles.estrellas}>

                                                        {/*Se va a agregar estrellas dependiendo la cantidad maxima establecida en el sistema */}
                                                        {Array.from({ length: config_define.calificacion_max_producto }, (value, index) => (
                                                            <FontAwesomeIcon
                                                                key={index}
                                                                icon={faStar}
                                                                color={index < detalles_producto.calificacion ? '#ffd700' : '#dddddd'}
                                                                size={30}
                                                                style={{ marginRight: 2 }}
                                                            />
                                                        ))}
                                                    </View>)}
                                            </View>
                                        </View>

                                        {/* Componente View que contiene un TouchableOpacity para navegar hacia el perfil del emprendedor*/}
                                        <View style={{ marginTop: 20 }}>
                                            {/*Componente TouchableOpacity para navegar hacia el perfil del emprendedor */}
                                            <TouchableOpacity
                                                style={[styles.boton, styles.botonInfo]}
                                                onPress={() => {
                                                    this.props.navigation.navigate("PerfilEmprendedor", { id_usuario_emprendedor: detalles_producto.id_usuario_emprendedor, nombre_emprendimiento: detalles_producto.nombre_emprendimiento });
                                                }}
                                            >
                                                <Text style={[styles.textoBoton, styles.textoInfo]}>{this.state.id_usuario_emprendedor == detalles_producto.id_usuario_emprendedor ? ("Ver mi perfil") : ("Ver perfil del emprendedor")}</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Componente View que contiene las preguntas y respuesta del producto*/}
                                        <View style={{ marginTop: 20 }}>
                                            <Text style={styles.textSubTitulo}>Preguntas y respuesta</Text>

                                            {/*Verifica si hay un mensaje*/}
                                            {mensajeAlertPreguntaRespuesta && (
                                                /*Se llama a la funcion para obtener un contenedor que muestra un mensaje segun las acciones que realice el usuario*/
                                                mostrarMensaje(mensajeAlertPreguntaRespuesta, tipoMensajeAlertPreguntaRespuesta)
                                            )}

                                            <View style={{ marginTop: 10 }}>
                                                {/*Se verifica que el estado de no este finalizado y si el usuario es el que publico el producto*/}
                                                {!estadoProductoFinalizado && !elUsuarioPublico && (
                                                    /*Componente View que contiene las preguntas hechas ademas de un TextInput para hacer mas preguntas*/
                                                    <View>
                                                        <Text style={styles.tamanio_texto}>Pregúntale al vendedor</Text>

                                                        {/*Componente View que contiene un TextInput para agregar una pregunta al producto*/}
                                                        <View>
                                                            <TextInput
                                                                label="Escriba su pregunta"
                                                                maxLength={255}
                                                                value={txtPregunta}
                                                                onChangeText={(text) => this.setState({ txtPregunta: text })}
                                                                style={styles.input_paper}
                                                                theme={theme}
                                                                multiline
                                                                numberOfLines={3}
                                                                disabled={loading_agregar_pregunta}
                                                            />
                                                            <Text style={[styles.text_contador, { marginStart: 10 }]}>
                                                                Máximo 255 caracteres. {255 - txtPregunta.length} restantes
                                                            </Text>
                                                        </View>

                                                        {/*Componente TouchableOpacity para enviar la pregunta*/}
                                                        <TouchableOpacity
                                                            style={[{ alignSelf: 'flex-start', marginBottom: 20, marginTop: 10 }, styles.boton, styles.botonInfo, loading_agregar_pregunta && styles.botonDesactivado]}
                                                            onPress={() => this.enviar_pregunta()}
                                                            disabled={loading_agregar_pregunta}
                                                        >
                                                            <Text style={[styles.textoBoton, styles.textoInfo]}>Enviar Pregunta</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                )}

                                                {loading_pregunta_respuesta ? (
                                                    <ActivityIndicator size="large" color="#0000ff" />
                                                ) : (
                                                    <View style={{ marginTop: 10, marginBottom: 20 }}>
                                                        {/*Se verifica si el usuario publico el producto  */}
                                                        {elUsuarioPublico ? (
                                                            <View>
                                                                {/*Se verifica si el producto recibio preguntas de otros usuarios  */}
                                                                {lista_preguntas_generales.length > 0 ? (
                                                                    <TouchableOpacity
                                                                        style={[styles.boton, styles.botonInfo]}
                                                                        onPress={() => this.setState({
                                                                            modalPreguntasPropietario: true,
                                                                        })}
                                                                    >
                                                                        <Text style={[styles.textoBoton, styles.textoInfo]}>Ver todas las preguntas y respuestas de mi producto</Text>
                                                                    </TouchableOpacity>
                                                                ) : (
                                                                    <Text style={styles.tamanio_texto}>Este producto aún no recibió preguntas de otros usuarios</Text>
                                                                )}
                                                            </View>
                                                        ) : (
                                                            <View>
                                                                {/*Se verifica que el usuario ingresado sea valido y si hizo alguna pregunta al producto */}
                                                                {usuarioValido && lista_preguntas_usuario.length > 0 && (
                                                                    <View>
                                                                        <Text style={styles.tamanio_texto}>Tus preguntas</Text>
                                                                        {/*Muestra las hechas al producto por el usuario */}
                                                                        <View>
                                                                            {renderPreguntas(lista_preguntas_usuario, styles.ViewPreguntaRespuesta)}
                                                                        </View>
                                                                        {/*Se verifica si la cantidad de preguntas es mayor a 2 se muestra TouchableOpacity para ver todas las preguntas y respuesta del producto */}
                                                                        {lista_preguntas_usuario.length > 2 && (
                                                                            <View style={{ alignSelf: 'flex-start', marginBottom: 20, marginTop: 10 }}>
                                                                                <TouchableOpacity
                                                                                    style={[styles.boton, styles.botonInfo]}
                                                                                    onPress={() => this.setState({
                                                                                        modalPreguntasUsuario: true,
                                                                                    })}
                                                                                >
                                                                                    <Text style={[styles.textoBoton, styles.textoInfo]}>Ver todas mis preguntas</Text>
                                                                                </TouchableOpacity>
                                                                            </View>
                                                                        )}
                                                                    </View>

                                                                )}
                                                                {/*Se verifica las preguntas recibidas al producto sea mayor a 0  */}
                                                                {lista_preguntas_generales.length > 0 || lista_preguntas_usuario.length > 0 ? (
                                                                    <View>
                                                                        <Text style={styles.tamanio_texto}>Últimas preguntas realizadas</Text>
                                                                        {/*Muestra las hechas al producto por los usuarios */}
                                                                        <View>
                                                                            {renderPreguntas(lista_preguntas_generales, styles.ViewPreguntaRespuesta)}
                                                                        </View>

                                                                        {/*Se verifica si la cantidad de preguntas es mayor a 2 se muestra TouchableOpacity para ver todas las preguntas y respuesta del producto */}
                                                                        {lista_preguntas_generales.length > 2 && (
                                                                            <View style={{ marginTop: 10 }}>
                                                                                <TouchableOpacity
                                                                                    style={[styles.boton, styles.botonInfo, {}]}
                                                                                    onPress={() => this.setState({
                                                                                        modalPreguntasGenerales: true,
                                                                                    })}
                                                                                >
                                                                                    <Text style={[styles.textoBoton, styles.textoInfo]}>Ver todas las preguntas</Text>
                                                                                </TouchableOpacity>
                                                                            </View>
                                                                        )}
                                                                    </View>
                                                                ) : (
                                                                    <View>
                                                                        {/*Se verifica que el estado del producto no este finalizado */}
                                                                        {estadoProductoFinalizado ? (
                                                                            <Text style={styles.tamanio_texto}>Este producto no recibió preguntas</Text>
                                                                        ) : (
                                                                            <Text style={styles.tamanio_texto}>Nadie hizo preguntas todavía. ¡Hacé la primera!</Text>
                                                                        )}
                                                                    </View>
                                                                )}
                                                            </View>
                                                        )}
                                                    </View>
                                                )}

                                            </View>
                                        </View>
                                    </View>

                                )}
                            </View>)}


                        {/*Modal lista de preguntas del usuario*/}
                        <View >
                            {/* Proveedor de temas de Paper para estilos consistentes */}
                            <PaperProvider theme={theme}>
                                <Modal
                                    visible={modalPreguntasUsuario} // Controla si el modal está visible o no
                                    animationType="fade" // Tipo de animación cuando se muestra o se oculta el modal
                                    statusBarTranslucent={false} // Configuración translúcida para la barra de estado 
                                    transparent={true} // Hacer el fondo del modal transparente
                                >
                                    <View style={[styles.modalViewFondo, { flex: 1 }]}>
                                        <View style={[styles.modalView, { marginTop: 30, marginStart: 10, marginEnd: 10, flex: 1 }]}>
                                            <Text style={styles.textTitulo}>Tus preguntas</Text>

                                            {/*Componente View que contiene un FlatList para mostrar las preguntas*/}
                                            <View style={{ padding: 5, flex: 1 }}>
                                                <FlatList
                                                    data={lista_preguntas_usuario}// Datos de la lista que serán renderizados
                                                    renderItem={this.renderItemPreguntasGeneral}// Función que renderiza cada elemento de la lista
                                                    keyExtractor={(item, index) => index.toString()}// Función para extraer la clave única para cada elemento
                                                />
                                            </View>

                                            {/*Componente View que contiene un TouchableOpacity para cerrar el modal que contiene las preguntas*/}
                                            <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                                                <TouchableOpacity
                                                    style={[styles.boton, styles.botonInfo]}
                                                    onPress={() => this.setState({ modalPreguntasUsuario: false })}
                                                >
                                                    <Text style={[styles.textoBoton, styles.textoInfo]}>Cerrar</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>

                                </Modal>
                            </PaperProvider>
                        </View>


                        {/*Modal lista de preguntas de todos los usuarios*/}
                        <View >
                            {/* Proveedor de temas de Paper para estilos consistentes */}
                            <PaperProvider theme={theme}>
                                <Modal
                                    visible={modalPreguntasGenerales} // Controla si el modal está visible o no
                                    animationType="fade" // Tipo de animación cuando se muestra o se oculta el modal
                                    statusBarTranslucent={false} // Configuración translúcida para la barra de estado 
                                    transparent={true} // Hacer el fondo del modal transparente
                                >
                                    <View style={[styles.modalViewFondo, { flex: 1 }]}>
                                        <View style={[styles.modalView, { marginTop: 30, marginStart: 10, marginEnd: 10, flex: 1 }]}>
                                            <Text style={styles.textTitulo}>Últimas preguntas realizadas</Text>

                                            {/*Componente View que contiene un FlatList para mostrar las preguntas*/}
                                            <View style={{ padding: 5, flex: 1 }}>
                                                <FlatList
                                                    data={lista_preguntas_generales}// Datos de la lista que serán renderizados
                                                    renderItem={this.renderItemPreguntasGeneral}// Función que renderiza cada elemento de la lista
                                                    keyExtractor={(item, index) => index.toString()}// Función para extraer la clave única para cada elemento
                                                />
                                            </View>
                                            {/*Componente View que contiene un TouchableOpacity para cerrar el modal que contiene las preguntas*/}
                                            <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                                                <TouchableOpacity
                                                    style={[styles.boton, styles.botonInfo]}
                                                    onPress={() => this.setState({ modalPreguntasGenerales: false })}
                                                >
                                                    <Text style={[styles.textoBoton, styles.textoInfo]}>Cerrar</Text>
                                                </TouchableOpacity>

                                            </View>
                                        </View>
                                    </View>
                                </Modal>
                            </PaperProvider>
                        </View>



                        {/*Modal lista de preguntas de todos los usuarios para el propietario del producto*/}
                        <View >
                            {/* Proveedor de temas de Paper para estilos consistentes */}
                            <PaperProvider theme={theme}>
                                <Modal
                                    visible={modalPreguntasPropietario} // Controla si el modal está visible o no
                                    animationType="fade" // Tipo de animación cuando se muestra o se oculta el modal
                                    statusBarTranslucent={false} // Configuración translúcida para la barra de estado 
                                    transparent={true} // Hacer el fondo del modal transparente
                                >
                                    <View style={[styles.modalViewFondo, { flex: 1 }]}>
                                        <View style={[styles.modalView, { marginTop: 30, marginStart: 10, marginEnd: 10, flex: 1 }]}>
                                            <Text style={styles.textTitulo}>Lista de preguntas recibidas del producto</Text>
                                            <View style={{ padding: 5, flex: 1 }}>
                                                {loading_preguntas_producto && <ActivityIndicator size="large" color="#0000ff" />}
                                                {/*Verifica si hay un mensaje de error en el modal*/}
                                                {alertModalErrorPreguntasProducto && (
                                                    /*Se llama a la funcion para obtener un contenedor que muestra un mensaje de error*/
                                                    mostrarMensaje(alertModalErrorPreguntasProducto, 'danger')
                                                )}
                                                <FlatList
                                                    data={lista_preguntas_generales}// Datos de la lista que serán renderizados
                                                    renderItem={this.renderItemPreguntasPropietario}// Función que renderiza cada elemento de la lista
                                                    keyExtractor={(item, index) => index.toString()}// Función para extraer la clave única para cada elemento
                                                />
                                            </View>
                                            {/*Componente View que contiene un TouchableOpacity para cerrar el modal que contiene las preguntas*/}
                                            <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                                                <TouchableOpacity
                                                    style={[styles.boton, styles.botonInfo]}
                                                    onPress={() => this.setState({ modalPreguntasPropietario: false, alertModalErrorPreguntasProducto: '' })}
                                                >
                                                    <Text style={[styles.textoBoton, styles.textoInfo]}>Cerrar</Text>
                                                </TouchableOpacity>

                                            </View>
                                        </View>
                                    </View>
                                </Modal>
                            </PaperProvider>
                        </View>


                        {/*Modal responder pregunta*/}
                        <View>

                            {/* Proveedor de temas de Paper para estilos consistentes */}
                            <PaperProvider theme={theme}>
                                <Modal
                                    visible={modalResponderPreguntar} // Controla si el modal está visible o no
                                    animationType="fade" // Tipo de animación cuando se muestra o se oculta el modal
                                    statusBarTranslucent={false} // Configuración translúcida para la barra de estado 
                                    transparent={true} // Hacer el fondo del modal transparente
                                >
                                    <ScrollView style={styles.modalViewFondo}>
                                        <View style={[styles.modalView, { marginTop: '65%' }]}>
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
                                                    multiline={true}
                                                    disabled={loading_agregar_respuesta}//Desactiva el boton cuando se llama a la funcion que responde la pregunta
                                                />
                                                {/*Mostrar cantidad de caracteres maximo y restantes*/}
                                                <Text style={styles.text_contador}>
                                                    Máximo 255 caracteres. {255 - texto_respuesta.length} restantes
                                                </Text>
                                            </View>

                                            {/*Componente View que contiene dos TouchableOpacity uno responder la pregunta y otro para cancelar el proceso */}
                                            <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                                                <TouchableOpacity
                                                    style={[styles.boton, styles.botonBaja, loading_agregar_respuesta && styles.botonDesactivado]}
                                                    onPress={() => this.setState({ modalResponderPreguntar: false, texto_respuesta: '', alertModalErrorAgregarRespuesta: '', modalPreguntasPropietario: true })}
                                                    disabled={loading_agregar_respuesta}//Desactiva el boton cuando se llama a la funcion que responde la pregunta
                                                >
                                                    <Text style={[styles.textoBoton, styles.textoBaja]}>Cancelar</Text>
                                                </TouchableOpacity>


                                                <TouchableOpacity
                                                    style={[styles.boton, styles.botonConfirmacion, loading_agregar_respuesta ? styles.botonDesactivado : null]}
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
                            {/* Proveedor de temas de Paper para estilos consistentes */}
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
                                                <Text style={styles.tamanio_texto}>¿Esta seguro de querer eliminar la siguiente respuesta?</Text>

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
                                                    onPress={() => this.setState({ modalEliminarRespuesta: false, alertModalErrorEliminarRespuesta: '', modalPreguntasPropietario: true })}
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
                </ScrollView>
            </SafeAreaView >
        );
    }
}
