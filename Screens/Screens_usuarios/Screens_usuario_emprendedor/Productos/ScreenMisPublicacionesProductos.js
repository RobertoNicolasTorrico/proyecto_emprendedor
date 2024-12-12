import React, { Component } from 'react';

//Componentes utilizados en React Native
import { Modal, TouchableOpacity, View, ActivityIndicator, SafeAreaView, Text, ScrollView, FlatList, RefreshControl, Image, Alert } from 'react-native';
import { SearchBar, Card } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput, PaperProvider, List } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';

//Biblioteca para almacenamiento asincrono de datos
import AsyncStorage from '@react-native-async-storage/async-storage';

//Componente para mostrar iconos
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

//Iconos especificos de FontAwesome
import { faStar } from '@fortawesome/free-solid-svg-icons';

//Biblioteca para crear carruseles 
import Swiper from 'react-native-swiper';

//Archivo de estilos
import { styles } from '../../../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { formatPrecio, obtenerCantNotificacionesSinLeer, mostrarMensaje, formatearFecha, formatearFechaTextInput, renderPaginationButtons, formatearFechaBusqueda } from '../../../../config/funciones.js';

//Módulo para realizar consultas a las APIs relacionadas
import api_categoria from '../../../../config/consultas_api/api_categoria.js';
import api_producto from '../../../../config/consultas_api/api_producto.js';
import api_estado from '../../../../config/consultas_api/api_estado.js'
import api_respuestas from '../../../../config/consultas_api/api_respuestas.js';
import api_preguntas from '../../../../config/consultas_api/api_preguntas.js';

//Configuracion de URL y otros parametros
import { config_define } from '../../../../config/config_define.js';


export class ScreenMisPublicacionesProductos extends Component {
    constructor(props) {
        super(props);
        this.state = {

            //Identificador del usuario actual
            id_usuario: null,
            tipo_usuario: null,

            //Datos de las productos
            refreshing_producto: false,//Indica el estado de actualizar toda la pestaña de productos
            cantidad_total_productos: 0,//Indica la cantidad total de productos
            cantidad_actual_producto: 0,//Indica la cantidad actual de productos
            loading_producto: false,//Indica el estado de cargar informacion de las productos
            lista_productos: [],//Lista de productos recibidas que se mostraran
            pagina: '',//Indica en que pagina se encuentra el usuario y la cantidad de paginas que hay
            registro: '', //Indica la cantidad de elementos que se ve en la interfaz
            pagina_actual: 1,//Pagina actual de productos para la paginacion
            total_paginas: 0,//Indica la cantidad total de paginas para la paginacion


            //Datos de la fecha
            date: '',
            fechaBusqueda: '',
            modalFiltroEstadoFecha: false,//Indica el estado del modal del filtro de fecha


            //Busqueda predeterminada de producto
            search: "",
            busqueda_activa: false,//Indica si el usuario buscar un producto 


            //Filtro de producto
            select_cant_productos: '5',//Indicador de cantidad de productos que se mostraran
            select_categoria: '0',//Indica la categoria del producto que se van a mostrar
            select_estado: '0', //Indica el estado de los productos que se van a ver
            modalFiltroEstado: false, //Indica el estado del modal del filtro

            lista_categoria: [],//Lista de categorias de productos que se mostraran

            mensajeProducto: '',//Mensaje de error al obtener los datos de los productos


            //Modal para eliminar un producto
            modalEliminarProducto: false,//Indica el estado del modal para eliminar un producto 
            alertModalErrorEliminarProducto: '',//Mensaje de error al eliminar un producto
            loading_eliminar_producto: false,// Indica el estado al eliminar un producto
            productoSeleccionado: {
                id_producto: null,//Indica el ID del producto seleccionado para eliminar
                nombreProducto: '',//Indica el nombre del producto que se va a eliminar
            },

            //Modal de las preguntas de un producto
            modalPreguntasProducto: false,//Indica el estado del modal para mostrar las preguntas de los producto 
            alertModalErrorPreguntasProducto: '',//Mensaje de error al obtener las preguntas del producto
            loading_preguntas_producto: false,// Indica el estado al obtener las preguntas del producto
            lista_preguntas: [],//Lista de preguntas del producto

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
            alertModalErrorAgregarRespuesta: '',//Mensaje de error al agregar una respuesta
            loading_agregar_respuesta: false,// Indica el estado al agregar una respuesta

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
            //Despues de actualizar el estado se llama a la funcion para obtener las categorias de los productos publicados, los estado del producto y la lista de productos del emprendedor
            this.obtenerDatosIniciales();

        });
        //Agrega un listener para actualizar los productos publicacions,las categorias de los productos y los estados de los producto cuando la pantalla esta enfocada 
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.obtenerDatosIniciales();
        });
    }

    //Se obtiene los datos iniciales necesarios para la interfaz del usuario
    obtenerDatosIniciales = async () => {
        const { id_usuario, tipo_usuario, fechaBusqueda, pagina_actual, search, select_cant_productos, select_categoria, select_estado } = this.state;

        try {
            //Actualiza el estado para cargar los productos
            this.setState({ loading_producto: true, lista_productos: [], mensajeProducto: '' });

            //Se llama a la funcion que tiene la API para obtener los estados de los productos
            const respuesta_estado = await api_estado.obtenerListaEstados();
            //Actualiza el estado de la lista de los estados que puede tener un producto
            this.setState({ lista_estado: respuesta_estado.lista_estado });


            //Se llama a la funcion que tiene la API para obtener las categorias de los productos que publico el emprendedor
            const respuesta_categoria = await api_categoria.obtenerListaCategoriaProductosEmprendedor(id_usuario);
            //Actualiza la lista de categorias de los productos que publico el emprendedor
            this.setState({ lista_categoria: respuesta_categoria.categorias_producto });


            //Se llama a la funcion que tiene la API para obtener los productos publicados por el emprendedor
            const respuesta_productos = await api_producto.obtenerProductoWhereBuscadorEmprendedor(id_usuario, tipo_usuario, search, select_categoria, select_estado, fechaBusqueda, pagina_actual, select_cant_productos);
            //Actualiza el estado de la lista de productos ademas de otros elementos necesarios para la interfaz
            this.setState({
                lista_productos: respuesta_productos.lista_productos,
                cantidad_total_productos: respuesta_productos.cantidad_total_productos,
                busqueda_activa: respuesta_productos.busqueda_activa,
                pagina: respuesta_productos.pagina,
                total_paginas: respuesta_productos.totalPaginas,
                registro: respuesta_productos.registro,
                cantidad_actual_producto: respuesta_productos.cantidad_actual,
            });
        }
        catch (error) {

            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({ mensajeProducto: error.message }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            //Finaliza el estado de carga de los productos y refresco de producto
            this.setState({ refreshing_producto: false, loading_producto: false });

            //Actualiza el numero de notificaciones
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
        }
    };


    //Funcion para obtener los datos de los productos del emprendedor
    obtenerProductoWhereBuscadorEmprendedor = async () => {
        const { id_usuario, tipo_usuario, fechaBusqueda, pagina_actual, search, select_cant_productos, select_categoria, select_estado } = this.state;

        try {
            //Actualiza el estado para cargar los productos
            this.setState({ loading_producto: true, lista_productos: [], mensajeProducto: '' });

            //Se llama a la funcion que tiene la API para obtener los productos publicados por el emprendedor
            const respuesta = await api_producto.obtenerProductoWhereBuscadorEmprendedor(id_usuario, tipo_usuario, search, select_categoria, select_estado, fechaBusqueda, pagina_actual, select_cant_productos);

            //Actualiza el estado de la lista de productos ademas de otros elementos necesarios para la interfaz
            this.setState({
                lista_productos: respuesta.lista_productos,
                cantidad_total_productos: respuesta.cantidad_total_productos,
                busqueda_activa: respuesta.busqueda_activa,
                pagina: respuesta.pagina,
                total_paginas: respuesta.totalPaginas,
                registro: respuesta.registro,
                cantidad_actual_producto: respuesta.cantidad_actual,
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

            //Finaliza el estado de carga de los productos
            this.setState({ loading_producto: false });

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
            //Despues se llama a la funcion para obtener los productos que cumplen los criterios de busqueda
            this.setState({ pagina_actual: 1, date: currentDate, modalFiltroEstadoFecha: false, fechaBusqueda: formatearFechaBusqueda(currentDate) }, () => {
                this.obtenerProductoWhereBuscadorEmprendedor();
            });
        } else {
            // Si el evento no es de tipo set se solo cierra el modal de selección de fecha
            this.setState({ modalFiltroEstadoFecha: false });
        }
    };


    //Actualiza el estado del componente de la categoria del producto
    handleCategoriaChange = (nueva_categoria) => {
        //Establece la pagina a 1 ademas de cambiar la categoria del producto a buscar
        //Despues se llama a la funcion para obtener los productos que cumplen los criterios de busqueda
        this.setState({ pagina_actual: 1, select_categoria: nueva_categoria }, () => {
            this.obtenerProductoWhereBuscadorEmprendedor();
        });
    };

    //Actualiza el estado del componente del estado del producto
    handleEstadoChange = (nuevo_estado) => {
        //Establece la pagina a 1 ademas de cambiar el estado a buscar del producto
        //Despues se llama a la funcion para obtener los productos que cumplen los criterios de busqueda
        this.setState({ pagina_actual: 1, select_estado: nuevo_estado }, () => {
            this.obtenerProductoWhereBuscadorEmprendedor();
        });
    };


    //Actualiza el estado del componente de cantidad de productos a mostrar
    handleCantProductosChange = (nuevo_cantidad) => {
        //Establece la pagina a 1 ademas de cambiar el valor de cantidad de productos a mostrar
        //Despues se llama a la funcion para obtener los productos que cumplen los criterios de busqueda
        this.setState({ pagina_actual: 1, select_cant_productos: nuevo_cantidad }, () => {
            this.obtenerProductoWhereBuscadorEmprendedor();
        });
    };


    //Actualiza el estado del componente del texto de busqueda
    handleTextSearch(texto) {
        //Establece la pagina a 1 ademas de agregar el valor en el campo de busqueda
        //Despues se llama a la funcion para obtener los productos que cumplen los criterios de busqueda
        this.setState({ search: texto, pagina_actual: 1 }, () => {
            this.obtenerProductoWhereBuscadorEmprendedor();
        });
    };


    //Funcion para restablecer los valores del elemento fecha
    restablecer_valor_fecha() {
        //Restablece los valores del modal y tambien la pagina a 1
        //Despues se llama a la funcion para obtener los productos que cumplen los criterios de busqueda
        this.setState({ date: '', fechaBusqueda: '', pagina_actual: 1 }, () => {
            this.obtenerProductoWhereBuscadorEmprendedor();
        });
    };


    //Funcion para restablecer los valores del filtro del modal
    restablecer_valores_modal() {

        //Restablece los valores del modal y tambien la pagina a 1
        //Despues se llama a la funcion para obtener los productos que cumplen los criterios de busqueda
        this.setState({
            fechaBusqueda: '',
            date: '',
            select_cant_productos: 5,
            select_estado: 0,
            select_categoria: 0,
            pagina_actual: 1,
        }, () => {
            this.obtenerProductoWhereBuscadorEmprendedor();
        });
    };


    //Funcion que renderizar cada elemento de la lista de preguntas de un producto
    renderItemPreguntas = ({ item }) => {
        const { loading_preguntas_producto } = this.state
        return (

            /*Componente Card para mostrar la informacion de las preguntas y respuestas recibidas del producto */
            < Card key={item.id_pregunta_respuesta} containerStyle={{ elevation: 5, marginBottom: 15 }}>
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
                                modalPreguntasProducto: false,
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
                                modalPreguntasProducto: false,
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
            </Card >
        );
    };


    //Funcion que renderizar cada elemento de la lista de productos
    renderItemProducto = ({ item }) => {
        return (

            //Componente Card para mostrar la informacion del producto
            <Card key={item.detalles_producto.id_publicacion_producto} >

                {/*Componente View que contiene las imagenes del producto*/}
                <View style={{ width: "100%", height: 200, alignItems: "center", borderColor: "#cec8c8", borderWidth: 1 }}>

                    {/*Componente Swiper utlizado para mostrar las imagenes del producto como un carrusel*/}
                    <Swiper showsButtons={true} loop={false} showsPagination={false}>
                        {item.archivos.map((imagen, index) => (
                            <View key={index + "_" + imagen.nombre_archivo}>
                                <Image style={{ width: "100%", height: "100%" }} resizeMode="contain" source={{ uri: `${config_define.urlBase}/uploads/${item.detalles_producto.id_usuario_emprendedor}/publicaciones_productos/${imagen.nombre_carpeta}/${imagen.nombre_archivo}` }} />
                            </View>
                        ))}
                    </Swiper>
                </View>


                {/*Componente View que contiene la informacion del producto*/}
                <View style={{ paddingBottom: 20 }}>
                    {/*Componente TouchableOpacity para navegar a los detalles del producto */}
                    <TouchableOpacity
                        onPress={() => {
                            this.props.navigation.navigate("DetallesProducto", { id_producto: item.detalles_producto.id_publicacion_producto });
                        }}
                    >
                        <Card.Title style={{ fontSize: 22 }}>{item.detalles_producto.nombre_producto}</Card.Title>
                    </TouchableOpacity>

                    {/*Descripcion del producto */}
                    <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Descripcion:</Text>{item.detalles_producto.descripcion} </Text>

                    {/*Fecha de publicacion del producto*/}
                    <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Fecha de publicacion:</Text>{item.detalles_producto.fecha_publicacion}</Text>

                    {/*Verifica si hubo fecha de modificacion en el producto */}
                    {item.detalles_producto.fecha_modificacion && (

                        /*Fecha de nodificacion del producto*/
                        <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Fecha de modificacion:</Text>{item.detalles_producto.fecha_modificacion}</Text>
                    )}

                    {/*Estado del producto */}
                    <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Estado:</Text>{item.detalles_producto.estado} </Text>

                    {/*Precio del producto */}
                    <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Precio:</Text>{formatPrecio(item.detalles_producto.precio)}</Text>

                    {/*Categoria del producto */}
                    <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Categoria:</Text> {item.detalles_producto.nombre_categoria} </Text>

                    {/*Stock del producto */}
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
                <Card.Divider />

                {/* Componente View que contiene tres TouchableOpacity uno para eliminar el producto, modificar el producto y para abrir el modal de las preguntas del productos*/}
                <View style={{ flexDirection: 'row', alignSelf: 'center' }}>

                    {/*Componente TouchableOpacity para navegar hacia la modificacion del producto */}
                    <TouchableOpacity
                        style={[styles.boton, styles.botonModificacion]}
                        onPress={() => {
                            this.props.navigation.navigate("ScreenModificarProducto", { id_producto: item.detalles_producto.id_publicacion_producto });
                        }}
                    >
                        <Text style={[styles.textoBoton, styles.textoModificacion]}>Modificar</Text>
                    </TouchableOpacity>


                    {/*Verifica si el producto recibio preguntas de otros usuarios */}
                    {item.lista_preguntas.length > 0 ?

                        /*Componente TouchableOpacity para abrir el modal de las preguntas recibidas del producto */
                        < TouchableOpacity
                            style={[styles.boton, styles.botonInfo]}
                            onPress={() => this.setState({
                                modalPreguntasProducto: true,
                                lista_preguntas: item.lista_preguntas,
                            })}
                        >
                            <Text style={[styles.textoBoton, styles.textoInfo]}>Preguntas</Text>
                        </TouchableOpacity>
                        :
                        /*Componente TouchableOpacity para eliminar el producto de la cuenta del emprendedor */
                        <TouchableOpacity
                            style={[styles.boton, styles.botonBaja]}
                            onPress={() => this.setState({
                                modalEliminarProducto: true,
                                productoSeleccionado: {
                                    id_producto: item.detalles_producto.id_publicacion_producto,
                                    nombreProducto: item.detalles_producto.nombre_producto
                                }
                            })}
                        >
                            <Text style={[styles.textoBoton, styles.textoBaja]}>Eliminar</Text>
                        </TouchableOpacity>
                    }
                </View>
            </Card >
        );
    };


    //Funcion para restablecer la lista de productos
    onRefreshProducto = () => {
        //Reinicia la pagina a 1 y establece el estado de refreshing_producto a true
        //Despues se llama a la funcion para obtener los productos que cumplen los criterios de busqueda
        this.setState({ refreshing_producto: true, pagina_actual: 1 }, () => {
            this.obtenerDatosIniciales();
        });
    };


    //Funcion para cambiar la pagina actual
    cambiarPagina = (pagina) => {
        //Despues de actualizar el numero de pagina se llama a la funcion para obtener los productos
        this.setState({ pagina_actual: pagina }, () => {
            this.obtenerProductoWhereBuscadorEmprendedor();
        });
    };


    //Funcion para eliminar un producto del emprendedor
    eliminar_producto = async () => {
        const { id_usuario, tipo_usuario, productoSeleccionado, pagina_actual, cantidad_actual_producto } = this.state;

        try {

            //Actualiza el estado para eliminar un producto para evitar errores cuando se este llamando a la API ademas de eliminar cualquier mensaje previo
            this.setState({ loading_eliminar_producto: true, alertModalErrorEliminarProducto: '' });
            var pagina = pagina_actual;


            //Se llama a la funcion que tiene la API para eliminar un producto
            const resultado = await api_producto.bajaProducto(id_usuario, tipo_usuario, productoSeleccionado.id_producto);

            //En caso que la cantidad actual de los productos que se ve en la interfaz sea igual 1 y la pagina actual es mayor a 1
            //Se va restar uno a la pagina debido a la eliminacion del producto
            if (cantidad_actual_producto == 1 && pagina_actual > 1) {
                pagina = pagina - 1;
            }

            //Actualiza el estado para cerrar el modal de eliminar el producto 
            //Despues se llama a la funcion para obtener los productos que cumplen los criterios de busqueda
            this.setState({ modalEliminarProducto: false, pagina_actual: pagina }, () => {
                this.obtenerDatosIniciales();
                Alert.alert("Exito", resultado.mensaje);

            });

        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                alertModalErrorEliminarProducto: error.message
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            //Finaliza el estado de carga para eliminar un producto
            this.setState({ loading_eliminar_producto: false });

            //Actualiza el numero de notificaciones
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);

        }

    };

    //Funcion para eliminar una respuesta de una pregunta recibida
    eliminar_respuesta = async () => {

        const { id_usuario, tipo_usuario, respuestaSeleccionada, modalPreguntasProducto } = this.state;

        try {

            //Actualiza el estado para eliminar una respuesta para evitar errores cuando se este llamando a la API ademas de eliminar cualquier mensaje previo
            this.setState({ loading_eliminar_respuesta: true, alertModalErrorEliminarRespuesta: '' });

            //Se llama a la funcion que tiene la API para eliminar la respuesta
            const resultado = await api_respuestas.bajaRespuesta(id_usuario, tipo_usuario, respuestaSeleccionada.id_pregunta_respuesta, respuestaSeleccionada.id_producto);

            //Actualiza el estado para cerrar el modal de eliminar la respuesta  ademas de abrir el modal donde estan todas las preguntas del producto
            //Despues se muestra un mensaje de alert indicando el exito de la operacion para eliminar la respuesta
            this.setState({
                modalEliminarRespuesta: false,
                modalPreguntasProducto: true,
                loading_preguntas_producto: true
            }, () => {
                Alert.alert("Exito", resultado.mensaje);
            });


            //Se llama a la funcion que tiene la API para obtener una lista actualizada de las preguntas del producto
            const resultado_preguntas = await api_preguntas.obtenerListaPreguntasProducto(id_usuario, tipo_usuario, respuestaSeleccionada.id_producto);

            //Actualiza la lista de preguntas del modal de las preguntas del producto
            this.setState({ lista_preguntas: resultado_preguntas.preguntasGenerales });

        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert dependiendo el modal que esta activo
            if (modalPreguntasProducto) {
                this.setState({ alertModalErrorPreguntasProducto: error.message });
            } else {
                this.setState({ alertModalErrorEliminarRespuesta: error.message });
            }
            Alert.alert("Aviso", error.message);
        } finally {
            //Finaliza el estado de cargar para eliminar la respuesta y para cargar la lista de preguntas del producto
            this.setState({ loading_eliminar_respuesta: false, loading_preguntas_producto: false });

            //Actualiza el numero de notificaciones
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
        }

    };

    //Funcion para responder una pregunta recibida
    enviar_respuesta = async () => {

        const { id_usuario, tipo_usuario, texto_respuesta, preguntaSeleccionada, modalPreguntasProducto } = this.state;
        try {

            //Actualiza el estado para responder una pregunta para evitar errores cuando se este llamando a la API ademas de eliminar cualquier mensaje previo
            this.setState({ loading_agregar_respuesta: true, alertModalErrorAgregarRespuesta: '' });


            //Se llama a la funcion que tiene la API para responder una pregunta
            const resultado = await api_respuestas.altaRespuesta(id_usuario, tipo_usuario, preguntaSeleccionada.id_pregunta_respuesta, texto_respuesta, preguntaSeleccionada.id_producto);

            //Actualiza el estado para cerrar el modal de agregar respuesta ademas de abrir el modal donde estan todas las preguntas del producto
            //Despues se muestra un mensaje de alert indicando el exito de la operacion para responder una pregunta
            this.setState({
                modalResponderPreguntar: false,
                texto_respuesta: '',
                modalPreguntasProducto: true,
                loading_preguntas_producto: true
            }, () => {
                Alert.alert("Exito", resultado.mensaje);
            });


            //Se llama a la funcion que tiene la API para obtener una lista actualiza de las preguntas del producto
            const resultado_preguntas = await api_preguntas.obtenerListaPreguntasProducto(id_usuario, tipo_usuario, preguntaSeleccionada.id_producto);

            //Actualiza la lista de preguntas del modal de las preguntas del producto
            this.setState({ lista_preguntas: resultado_preguntas.preguntasGenerales });

        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert dependiendo el modal que esta activo
            if (modalPreguntasProducto) {
                this.setState({ alertModalErrorPreguntasProducto: error.message });
            } else {
                this.setState({ alertModalErrorAgregarRespuesta: error.message });
            }
            Alert.alert("Aviso", error.message);
        } finally {

            //Finaliza el estado de cargar para agregar la respuesta y para cargar la lista de preguntas del producto
            this.setState({ loading_agregar_respuesta: false, loading_preguntas_producto: false });

            //Actualiza el numero de notificaciones
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);

        }
    };


    render() {
        const { lista_productos, modalFiltroEstado,
            total_paginas, pagina, registro,
            lista_estado, cantidad_total_productos, lista_categoria, date, search,
            modalFiltroEstadoFecha, select_estado, select_categoria, select_cant_productos,
            busqueda_activa, loading_producto, mensajeProducto, refreshing_producto, pagina_actual,
            modalEliminarProducto, productoSeleccionado, loading_eliminar_producto, alertModalErrorEliminarProducto,
            modalPreguntasProducto, lista_preguntas, loading_preguntas_producto,
            modalResponderPreguntar, texto_respuesta, preguntaSeleccionada, alertModalErrorPreguntasProducto,
            alertModalErrorAgregarRespuesta, loading_agregar_respuesta, modalEliminarRespuesta, respuestaSeleccionada, alertModalErrorEliminarRespuesta, loading_eliminar_respuesta
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

                    {/*Componente View que contiene la lista de productos, un boton de filtro y otro boton para agregar otro producto */}
                    <View style={[styles.viewCard, { flex: 1 }]}>

                        {/*Componente SearchBar que se utiliza para buscar los productos escrito*/}
                        <SearchBar
                            placeholder="Nombre del producto"
                            value={search}
                            onChangeText={this.handleTextSearch.bind(this)}
                            round={true}
                            lightTheme={true}
                            containerStyle={styles.container_search}
                            inputContainerStyle={styles.input_Container_Style}
                            inputStyle={{ color: 'black' }}
                        />

                        {/*Componente View que contiene dos TouchableOpacity uno para abrir el modal de filtro y otro para publicar un nuevo producto*/}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 }}>

                            {/*Componente TouchableOpacity para abrir el modal de filtro*/}
                            <TouchableOpacity
                                style={styles.boton}
                                onPress={() => this.setState({ modalFiltroEstado: true })}
                            >
                                <Text style={styles.textoBoton}>Filtros</Text>
                            </TouchableOpacity>


                            {/*Componente TouchableOpacity para navegar a la pantalla para publicar un nuevo producto */}
                            <TouchableOpacity
                                style={[styles.boton, styles.botonConfirmacion]} onPress={() => {
                                    this.props.navigation.navigate("ScreenNuevoProducto");
                                }}
                            >
                                <Text style={[styles.textoBoton, styles.textoConfirmacion]}>Publicar un nuevo producto</Text>
                            </TouchableOpacity>
                        </View>


                        {/*Verifica que el usuario inicio una busqueda y que la lista de productos sea mayor a 0 para mostrar la cantidad de resultados de busqueda o la cantidad de productos si no se esta buscando un producto*/}
                        {!loading_producto && lista_productos.length > 0 && (
                            busqueda_activa ?
                                <Text style={{ fontSize: 25, marginStart: 15 }}>Resultados: {cantidad_total_productos}</Text> :
                                <Text style={{ fontSize: 25, marginStart: 15 }}>Productos publicados: {cantidad_total_productos}</Text>
                        )}
                        {loading_producto && <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />}

                        {/*Verifica si hay un mensaje de error*/}
                        {mensajeProducto && (
                            /*Se llama a la funcion para obtener un contenedor que muestra un mensaje de error*/
                            mostrarMensaje(mensajeProducto, 'danger')
                        )}


                        <FlatList
                            // Componente que se renderiza al comienzo de la lista
                            ListHeaderComponent={
                                <View style={{ paddingStart: 10, paddingEnd: 10 }}>
                                    <Text style={[styles.texto_mensaje, { padding: 1 }]}>
                                        Los productos publicados solo se podrán eliminar si no recibieron alguna pregunta, pero pueden ser modificados en cualquier momento.
                                    </Text>
                                    <Text style={[styles.texto_mensaje, { paddingBottom: 15 }]}>
                                        En caso de querer evitar que se muestre un producto a los demás usuarios cambie el producto a un estado pausado.
                                    </Text>
                                </View>
                            }

                            data={lista_productos}// Datos de la lista que serán renderizados
                            renderItem={this.renderItemProducto}// Función que renderiza cada elemento de la lista
                            keyExtractor={(item, index) => index.toString()}// Función para extraer la clave única para cada elemento
                            onEndReachedThreshold={0.5}// Umbral que determina cuánto antes del final de la lista se debe llamar a onEndReached
                            ListFooterComponent={lista_productos.length > 0 && (renderPaginationButtons(total_paginas, pagina_actual, registro, pagina, this.cambiarPagina))}// Componente que se renderiza al final de la lista
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
                                        <Text style={styles.textoBusqueda}>No hay productos disponibles por el momento</Text>)
                            }
                        />
                    </View>



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
                        {/* Proveedor de temas de Paper para estilos consistentes */}
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

                                                {/* Acordeón para la categoria del producto */}
                                                <List.Accordion title="Categoría de mis productos"
                                                    theme={{ colors: { primary: 'black' } }}
                                                    style={{ borderColor: '#dee2e6', borderTopWidth: 1 }}
                                                >
                                                    <View style={styles.lista_acordeon}>
                                                        <View style={styles.viewSelectFiltro}>

                                                            {/* Select para  cambiar la categoria de productos a mostrar */}
                                                            <RNPickerSelect
                                                                value={select_categoria} // Valor actual seleccionado
                                                                onValueChange={this.handleCategoriaChange} // Función que maneja el cambio de select
                                                                placeholder={{}} // Espacio reservado en el select
                                                                style={{ inputAndroid: styles.inputBusqueda }} // Estilo para el select en Android
                                                                items={[
                                                                    { label: 'Todos', value: '0' },
                                                                    ...lista_categoria.map((categoria) => ({
                                                                        label: categoria.nombre_categoria,
                                                                        value: categoria.id_categoria_producto,
                                                                    })),
                                                                ]}
                                                            />

                                                        </View>
                                                    </View>
                                                </List.Accordion>


                                                {/* Acordeón para la cantidad de productos a mostrar */}
                                                <List.Accordion title="Mostrar cantidad de productos"
                                                    theme={{ colors: { primary: 'black' } }}
                                                    style={{ borderColor: '#dee2e6', borderTopWidth: 1 }}
                                                >
                                                    <View style={styles.lista_acordeon}>
                                                        <View style={styles.viewSelectFiltro}>
                                                            {/* Select para la cantidad de producto a mostrar */}
                                                            <RNPickerSelect
                                                                value={select_cant_productos} // Valor actual seleccionado
                                                                onValueChange={this.handleCantProductosChange} // Función que maneja el cambio de select
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


                                                {/* Acordeón para el estado de la publicación del producto */}
                                                <List.Accordion title="Estado del producto"
                                                    theme={{ colors: { primary: 'black' } }}
                                                    style={{ borderColor: '#dee2e6', borderTopWidth: 1 }}
                                                >
                                                    <View style={styles.lista_acordeon}>
                                                        <View style={styles.viewSelectFiltro}>

                                                            {/* Select para el estado del producto a mostrar */}
                                                            <RNPickerSelect
                                                                value={select_estado} // Valor actual seleccionado
                                                                onValueChange={this.handleEstadoChange} // Función que maneja el cambio de select
                                                                placeholder={{}} // Espacio reservado en el select
                                                                style={{ inputAndroid: styles.inputBusqueda }} // Estilo para el select en Android
                                                                items={[
                                                                    { label: 'Todos', value: '0' },
                                                                    ...lista_estado.map((estado_productos) => ({
                                                                        label: estado_productos.estado,
                                                                        value: estado_productos.id_estado_producto,
                                                                    })),
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>
                                                </List.Accordion>


                                                {/* Acordeón para mostrar las publicaciones basada en la fecha de publicacion*/}
                                                <List.Accordion title="Fecha de publicacion"
                                                    theme={{ colors: { primary: 'black' } }}
                                                    style={{ borderColor: '#dee2e6', borderTopWidth: 1 }}
                                                >

                                                    {/*Componente View que contiene el boton para abrir el modal de fecha y borrar la fecha seleccionada */}
                                                    <View style={styles.lista_acordeon}>
                                                        <View style={{ marginStart: 10, marginTop: 10, width: '90%' }}  >
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


                    {/*Modal eliminar producto*/}
                    <View>
                        {/* Proveedor de temas de Paper para estilos consistentes */}
                        <PaperProvider theme={theme}>
                            <Modal
                                visible={modalEliminarProducto} // Controla si el modal está visible o no
                                animationType="fade" // Tipo de animación cuando se muestra o se oculta el modal
                                statusBarTranslucent={false} // Configuración translúcida para la barra de estado 
                                transparent={true} // Hacer el fondo del modal transparente
                            >
                                <ScrollView style={styles.modalViewFondo}>
                                    <View style={[styles.modalView, { marginTop: '65%' }]}>
                                        <Text style={styles.textTitulo}>Aviso</Text>
                                        <View style={{ marginBottom: 20, padding: 10 }}>

                                            {/*Verifica si hay un mensaje de error en el modal*/}
                                            {alertModalErrorEliminarProducto && (
                                                /*Se llama a la funcion para obtener un contenedor que muestra un mensaje de error*/
                                                mostrarMensaje(alertModalErrorEliminarProducto, 'danger')
                                            )}
                                            <Text style={styles.tamanio_texto}>¿Estas seguro de querer eliminar la siguiente publicacion del producto?</Text>

                                            {/*Detalles del producto a eliminar*/}
                                            <Text style={[styles.tamanio_texto, { paddingLeft: 15, marginBottom: 5 }]}>
                                                <Text style={styles.caracteristica}>Nombre del producto:</Text>
                                                <Text>{productoSeleccionado.nombreProducto}</Text>
                                            </Text>
                                        </View>

                                        {/* Componente View que contiene dos TouchableOpacity para eliminar el producto y cancelar el proceso */}
                                        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                                            <TouchableOpacity
                                                style={[styles.boton, styles.botonInfo, loading_eliminar_producto && styles.botonDesactivado]}
                                                onPress={() => this.setState({ modalEliminarProducto: false, alertModalErrorEliminarProducto: '' })}
                                                disabled={loading_eliminar_producto}//Desactiva el TouchableOpacity cuando se llama a la funcion para eliminar el producto
                                            >
                                                <Text style={[styles.textoBoton, styles.textoInfo]}>Cancelar</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.boton, styles.botonBaja, loading_eliminar_producto && styles.botonDesactivado]}
                                                onPress={() => this.eliminar_producto()}
                                                disabled={loading_eliminar_producto} //Desactiva el TouchableOpacity cuando se llama a la funcion para eliminar el producto
                                            >
                                                <Text style={[styles.textoBoton, styles.textoBaja]}>Confirmar</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </ScrollView>

                            </Modal>
                        </PaperProvider>
                    </View>

                    {/*Modal lista de preguntas de producto */}
                    <View>
                        {/* Proveedor de temas de Paper para estilos consistentes */}
                        <PaperProvider theme={theme}>
                            <Modal
                                visible={modalPreguntasProducto} // Controla si el modal está visible o no
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
                                                data={lista_preguntas}// Datos de la lista que serán renderizados
                                                renderItem={this.renderItemPreguntas}// Función que renderiza cada elemento de la lista
                                                keyExtractor={(item, index) => index.toString()}// Función para extraer la clave única para cada elemento
                                            />
                                        </View>
                                        {/*Componente View que contiene un TouchableOpacity para cerrar el modal que contiene las preguntas*/}
                                        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                                            <TouchableOpacity
                                                style={[styles.boton, styles.botonInfo]}
                                                onPress={() => this.setState({ modalPreguntasProducto: false, alertModalErrorPreguntasProducto: '' })}
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
                                                multiline={true}
                                                disabled={loading_agregar_respuesta}//Desactiva el TextInput cuando se llama a la funcion que responde la pregunta
                                            />
                                            {/*Mostrar la cantidad de caracteres maximo y restantes*/}
                                            <Text style={styles.text_contador}>
                                                Máximo 255 caracteres. {255 - texto_respuesta.length} restantes
                                            </Text>

                                        </View>

                                        {/*Componente View que contiene dos TouchableOpacity uno responder la pregunta y  otro para cancelar el proceso */}
                                        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                                            <TouchableOpacity
                                                style={[styles.boton, styles.botonBaja, loading_agregar_respuesta && styles.botonDesactivado]}
                                                onPress={() => this.setState({ modalResponderPreguntar: false, texto_respuesta: '', alertModalErrorAgregarRespuesta: '', modalPreguntasProducto: true })}
                                                disabled={loading_agregar_respuesta}//Desactiva el TouchableOpacity cuando se llama a la funcion que responde la pregunta
                                            >
                                                <Text style={[styles.textoBoton, styles.textoBaja]}>Cancelar</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.boton, styles.botonConfirmacion, loading_agregar_respuesta && styles.botonDesactivado]}
                                                onPress={() => this.enviar_respuesta()}// Función para responder la pregunta
                                                disabled={loading_agregar_respuesta}//Desactiva el TouchableOpacity cuando se llama a la funcion que responde la pregunta
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
                    <View>
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
                                            <Text style={styles.tamanio_texto}>¿Estas seguro de querer eliminar la siguiente respuesta?</Text>

                                            {/*Detalles de respuesta a eliminar*/}
                                            <Text style={[styles.tamanio_texto, { paddingLeft: 15, marginBottom: 5 }]}>
                                                <Text style={styles.caracteristica}>Respuesta:</Text>
                                                <Text>{respuestaSeleccionada.respuesta}</Text>
                                                <Text style={styles.text_fecha}>({respuestaSeleccionada.fechaRespuesta})</Text>
                                            </Text>

                                        </View>


                                        {/* Componente View que contiene dos TouchableOpacity uno para eliminar la respuesta y otro para cancelar el proceso */}
                                        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>

                                            {/*Componente TouchableOpacity para cerrar el modal */}
                                            <TouchableOpacity
                                                style={[styles.boton, styles.botonInfo, loading_eliminar_respuesta && styles.botonDesactivado]}
                                                onPress={() => this.setState({ modalEliminarRespuesta: false, alertModalErrorEliminarRespuesta: '', modalPreguntasProducto: true })}
                                                disabled={loading_eliminar_respuesta}//Desactiva el boton cuando se llama a la funcion para eliminar la respuesta
                                            >
                                                <Text style={[styles.textoBoton, styles.textoInfo]}>Cancelar</Text>
                                            </TouchableOpacity>

                                            {/*Componente TouchableOpacity para eliminar la respuesta */}
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
            </SafeAreaView>
        );
    }
}
