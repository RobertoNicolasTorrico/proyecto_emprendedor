
import React, { Component } from 'react';

//Componentes utilizados en React Native
import { Image, TouchableOpacity, Alert, ActivityIndicator, FlatList, RefreshControl, SafeAreaView, ScrollView, Text, View, Modal } from 'react-native';
import { Tab, TabView, Card, SearchBar } from '@rneui/themed';
import { PaperProvider } from 'react-native-paper';

//Biblioteca para almacenamiento asincrono de datos
import AsyncStorage from '@react-native-async-storage/async-storage';

//Archivo de estilos
import { styles } from '../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { mostrarMensaje, obtenerCantNotificacionesSinLeer } from '../../config/funciones.js';

//Configuracion de URL y otros parametros
import { config_define } from '../../config/config_define.js';


//Módulo para realizar consultas a las APIs relacionadas
import api_seguidores_seguidos from '../../config/consultas_api/api_seguidores_seguidos.js';


export class ScreenSeguidosSeguidores extends Component {
    constructor(props) {
        super(props);
        this.state = {

            //Identificador del usuario actual
            id_usuario: null,
            tipo_usuario: null,
            id_usuario_emprendedor: null,

            index: 0,//Indice para manejo de vistas de pestañas


            //Seccion seguidos
            lista_seguidos: [],//Lista de emprendedores que se mostraran
            pagina_seguidos: 1,//Pagina actual de emprendedores para la paginacion
            cargar_mas_seguidos: false,//Indica si se puede cargar mas emprendedores
            loading_seguidos: false,//Indica el estado de cargar informacion de los emprendedores
            refreshing_seguidos: false,//Indica el estado de actualizar toda la pestaña de seguidos
            mensajeAlertSeguidos: '',//Mensaje de error al obtener los datos de emprendedores
            cantidad_total_seguidos: 0,//Indica la cantidad total de emprendedores
            cantidad_actual_seguidos: 0,//Indica la cantidad actual de emprendedores
            loading_seguir: false,// Indica el estado al seguir al usuario 
            //Busqueda predeterminada de un emprendedor
            buscarSeguido: '',
            busqueda_activa_seguidos: false,



            //Seccion seguidores
            lista_seguidores: [],//Lista de seguidores que se mostraran
            pagina_seguidores: 1,//Pagina actual de seguidores para la paginacion
            cargar_mas_seguidores: false,//Indica si se puede cargar mas seguidores
            loading_seguidores: false,//Indica el estado de cargar informacion de los seguidores
            refreshing_seguidores: false,//Indica el estado de actualizar toda la pestaña de seguidores
            mensajeAlertSeguidores: '',//Mensaje de error al obtener los datos de seguidores
            cantidad_total_seguidores: 0,//Indica la cantidad total de seguidores
            cantidad_actual_seguidores: 0,//Indica la cantidad actual de seguidores

            //Busqueda predeterminada de un emprendedor
            buscarSeguidor: '',
            busqueda_activa_seguidores: false,


            //Modal para eliminar al seguidor
            modalEliminarSeguidor: false,//Indica el estado del modal para eliminar al seguidor
            alertModalErrorEliminarSeguidor: '', //Mensaje de error al eliminar seguidor
            loading_eliminar_seguidor: false,// Indica el estado al eliminar al seguidor
            seguidorSeleccionado: {
                id_seguimiento: null, //Indica el ID del seguimiendo
                id_usuario_eliminar: null, //Indica el ID del usuario a eliminar
                nombreUsuario: '', //Indica el nombre del usuario que se va eliminar
            },



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
            id_usuario_emprendedor: idUsuarioEmprendedor,
        }, () => {
            //Despues de actualizar el estado, se llaman a las funciones para obtener a los emprendedores que sigue el usuario
            //En caso que sea un usuario emprendedor tambien se va obtener una lista de usuarios que lo siguen
            this.obtenerListaSeguidosUsuario();
            if (tipoUsuario == 2 && idUsuarioEmprendedor != null) {
                this.obtenerListaSeguidoresUsuario();
            }
        });

        //Agrega un listener para actualizar la lista de seguidos del usuario 
        //Ademas de actualizar la lista de seguidores del usuario emprendedor en caso que sea uno
        //Se actualiza cuando la pantalla esta enfocada 
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onRefreshSeguidos();
            if (tipoUsuario == 2) {
                this.onRefreshSeguidores();
            }
        });
    }


    /*Seccion Seguidos*/


    //Metodo para obtener usuarios emprendedores que sigue el usuario
    obtenerListaSeguidosUsuario = async () => {
        const { tipo_usuario, id_usuario, lista_seguidos, buscarSeguido, pagina_seguidos } = this.state;

        try {
            //Actualiza el estado del mensaje de error de los seguidos a vacio eliminando cualquier mensaje de error previo
            this.setState({ mensajeAlertSeguidos: '' });

            //Si es la primera pagina se indica que se esta cargando la lista de seguidos ademas que se vacia la lista de seguidos previa 
            if (pagina_seguidos == 1) {
                this.setState({ loading_seguidos: true, lista_seguidos: [] });
            }


            //Se llama a la funcion que tiene la API para obtener a los usuarios emprendedores que sigue el usuario
            const respuesta_seguidos = await api_seguidores_seguidos.obtenerListaSeguidosUsuario(id_usuario, tipo_usuario, pagina_seguidos, buscarSeguido);
            //Actualiza el estado de la lista de seguidos, si se puede cargar mas seguidos, la cantidad total y si se esta buscando uno
            this.setState({
                lista_seguidos: [...lista_seguidos, ...respuesta_seguidos.lista_seguidos],
                cargar_mas_seguidos: respuesta_seguidos.cargar_mas_seguidos,
                busqueda_activa_seguidos: respuesta_seguidos.busqueda_activa,
                cantidad_total_seguidos: respuesta_seguidos.cant_total_seguidos,
                cantidad_actual_seguidos: respuesta_seguidos.cant_seguidos,
            });

        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensajeAlertSeguidos: error.message
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            //Finaliza el estado de carga y refresco de seguidos
            this.setState({ refreshing_seguidos: false, loading_seguidos: false });

            //Actualiza el numero de notificaciones
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
        }
    };

    //Actualiza el estado del componente del texto de busqueda
    handleTextSearchSeguidos(texto) {
        //Establece la pagina a 1 ademas de agregar el valor en el campo de busqueda
        //Despues se llama a la funcion para obtener una lista de usuarios emprendedores
        this.setState({
            buscarSeguido: texto,
            pagina_seguidos: 1,
            lista_seguidos: []
        }, () => {
            this.obtenerListaSeguidosUsuario();
        });
    };

    //Funcion que renderizar cada elemento de la lista de seguidos
    renderItemSeguidos = ({ item }) => (
        //Componente Card para mostrar la informacion del usuario emprendedor
        <Card key={item.id_seguimiento}>
            {/*Componente TouchableOpacity para navegar al perfil del emprendedor */}
            <TouchableOpacity
                onPress={() => {
                    this.props.navigation.navigate("PerfilEmprendedor", { id_usuario_emprendedor: item.id_usuario_emprendedor, nombre_emprendimiento: item.nombre_emprendimiento });
                }}
            >

                {/*Componente View que contiene la informacion del emprendedor y elementos TouchableOpacity para seguir y dejar de seguir al usuario emprendedor  */}
                <View style={{ width: "auto", flexDirection: 'row', height: 60 }}>

                    {/*Componente View para mostrar la imagen del perfil del emprendedore sino tiene una se utiliza una predeterminada por el sistema*/}
                    <View style={{ width: "20%", alignItems: "center", borderColor: "#cec8c8", borderWidth: 1 }}>
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

                    {/*Componente View que contiene el nombre del emprendimiento y el nombre de usuario*/}
                    <View style={{ width: "40%", marginStart: 10 }}>
                        <Text>{item.nombre_emprendimiento}</Text>
                        <Text style={styles.text_seguidos}>{item.nombre_usuario}</Text>
                    </View>


                    {/*Componente View que contiene los elementos TouchableOpacity dependiendo si sigue al usuario o no*/}
                    <View style={{ width: "40%" }}>

                        {/*Se verifica si se sigue actualmente al usuario emprendedor */}
                        {item.lo_sigue ? (
                            /*Componente TouchableOpacity que llama a la funcion para dejar de seguir al usuario emprendedor */
                            <TouchableOpacity
                                style={[styles.boton, styles.botonBaja, this.state.loading_seguidos && styles.botonDesactivado]}
                                onPress={() => this.dejarSeguirUsuario(item.id_usuario_emprendedor)}
                                disabled={this.state.loading_seguir}
                            >
                                <Text style={[styles.textoBoton, styles.textoBaja]}>Dejar de seguir</Text>
                            </TouchableOpacity>
                        ) : (
                            /*Componente TouchableOpacity que llama a la funcion para seguir al usuario emprendedor */
                            < TouchableOpacity
                                style={[styles.boton, styles.botonConfirmacion, this.state.loading_seguidos && styles.botonDesactivado]}
                                onPress={() => this.seguirUsuario(item.id_usuario_emprendedor)}
                                disabled={this.state.loading_seguir}
                            >
                                <Text style={[styles.textoBoton, styles.textoConfirmacion]}>Seguir</Text>
                            </TouchableOpacity>
                        )
                        }

                    </View>

                </View>
            </TouchableOpacity>
        </Card>
    );




    //Funcion que renderiza el pie de pagina de la lista de seguidos
    renderFooterSeguidos = () => {
        const { cargar_mas_seguidos, lista_seguidos } = this.state;
        return (
            <View style={{ padding: 10, marginBottom: 20, marginTop: 20 }}>

                {/*Muestra un mensaje en caso que no halla que cargar mas seguidos y la lista de seguidos sea mayor o igual 1 */}
                {!cargar_mas_seguidos && lista_seguidos.length >= 1 &&
                    <Text style={styles.textTitulo}>No seguis a mas emprendedores por el momento</Text>
                }
                {/*Muestra un indicador de carga si hay mas seguidos por cargar */}
                {cargar_mas_seguidos && (
                    <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                )}
            </View>
        );
    };

    //Funcion para manejar la carga de mas seguidos al final de la lista
    handleLoadMoreSeguidos = () => {
        const { cargar_mas_seguidos } = this.state;

        //Verifica primero si hay que cargar mas seguidos
        if (cargar_mas_seguidos) {
            //Incrementa el numero de pagina y llama a la funcion para obtener mas seguidos

            this.setState(prevState => ({
                pagina_seguidos: prevState.pagina_seguidos + 1,
                cargar_mas_seguidos: true,
            }), () => {
                this.obtenerListaSeguidosUsuario();
            });
        }
    };

    //Funcion para restablecer la lista de seguidos
    onRefreshSeguidos = () => {
        //Reinicia la pagina a 1 y establece el estado de refreshing_seguidos a verdadero
        this.setState({
            refreshing_seguidos: true, pagina_seguidos: 1, lista_seguidos: []
        }, () => {
            this.obtenerListaSeguidosUsuario();
        });
    };


    //Funcion para seguir al usuario emprendedor 
    seguirUsuario = async (id_usuario_emprendedor) => {
        const { id_usuario, tipo_usuario, buscarSeguido } = this.state;
        try {

            // Indicar que se está procesando la solicitud de seguimiento
            this.setState({ loading_seguir: true });

            //Se llama a la funcion que tiene la API para seguir al usuario emprendedor
            const respuesta = await api_seguidores_seguidos.altaSeguirUsuarioEmprendedor(id_usuario_emprendedor, id_usuario, tipo_usuario);

            this.setState(prevState => {
                const lista_seguidos = prevState.lista_seguidos.map(seguidos => {
                    if (seguidos.id_usuario_emprendedor === id_usuario_emprendedor) {
                        return { ...seguidos, lo_sigue: true };
                    }
                    return seguidos;
                });
                return { lista_seguidos };
            });


            //Se verifica que el usuario estaba buscando aun emprendedor
            if (buscarSeguido) {
                //Se actualiza el estado de la cantidad total de seguidos sumando  1
                this.setState((prevState) => ({
                    cantidad_total_seguidos: prevState.cantidad_total_seguidos - 1
                }));
            } else {
                //Se actualiza el estado de la cantidad total de seguidos obtenida de la funcion
                this.setState({
                    cantidad_total_seguidos: respuesta.numero_seguidos_usuario
                });
            }

        } catch (error) {

            //Manejo de errores: Muestra un alert
            Alert.alert("Aviso", error.message);
        } finally {

            //Finaliza el estado de carga 
            this.setState({ loading_seguir: false });

            //Actualiza el numero de notificaciones
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
        }
    };

    //Funcion para dejar de seguir al usuario emprendedor 
    dejarSeguirUsuario = async (id_usuario_emprendedor) => {
        const { id_usuario, tipo_usuario, buscarSeguido } = this.state;
        try {

            // Indicar que se está procesando la solicitud de dejar de seguir al usuario
            this.setState({ loading_seguir: true });

            //Se llama a la funcion que tiene la API dejar de seguir al usuario emprendedor
            const respuesta = await api_seguidores_seguidos.bajaSeguirUsuarioEmprendedor(id_usuario_emprendedor, id_usuario, tipo_usuario);

            // Actualizar el estado de la lista de seguidos
            this.setState(
                prevState => {
                    const lista_seguidos = prevState.lista_seguidos.map(seguidos => {
                        if (seguidos.id_usuario_emprendedor === id_usuario_emprendedor) {
                            return { ...seguidos, lo_sigue: false };
                        }
                        return seguidos;
                    });
                    return { lista_seguidos };
                });

            //Se verifica que el usuario estaba buscando aun emprendedor
            if (buscarSeguido) {
                //Se actualiza el estado de la cantidad actual de seguidos restando 1
                this.setState((prevState) => ({
                    cantidad_actual_seguidos: prevState.cantidad_actual_seguidos - 1
                }));
            } else {
                //Se actualiza el estado de la cantidad total de seguidos obtenida de la funcion
                this.setState({
                    cantidad_total_seguidos: respuesta.numero_seguidos_usuario
                });
            }

        } catch (error) {
            //Manejo de errores: Muestra un alert
            Alert.alert("Aviso", error.message);
        } finally {

            //Finaliza el estado de carga 
            this.setState({ loading_seguir: false });

            //Actualiza el numero de notificaciones
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
        }
    };

    /*Seccion Seguidores*/


    //Metodo para obtener usuarios que siguen al usuario emprendedor
    obtenerListaSeguidoresUsuario = async () => {
        const { tipo_usuario, id_usuario, lista_seguidores, buscarSeguidor, pagina_seguidores } = this.state;

        try {
            //Actualiza el estado del mensaje de error de los seguidores a vacio eliminando cualquier mensaje de error previo
            this.setState({ mensajeAlertSeguidores: '' });

            //Si es la primera pagina se indica que se esta cargando la lista de seguidores ademas que se vacia la lista de seguidores previa 
            if (pagina_seguidores == 1) {
                this.setState({ loading_seguidores: true, lista_seguidores: [] });
            }


            //Se llama a la funcion que tiene la API para obtener a los usuarios que siguen al emprendedor
            const respuesta_seguidores = await api_seguidores_seguidos.obtenerListaSeguidoresEmprendedor(id_usuario, tipo_usuario, pagina_seguidores, buscarSeguidor);

            //Actualiza el estado de la lista de seguidores, si se puede cargar mas seguidores, la cantidad total y si se esta buscando uno
            this.setState({
                lista_seguidores: [...lista_seguidores, ...respuesta_seguidores.lista_seguidores],
                cargar_mas_seguidores: respuesta_seguidores.cargar_mas_seguidores,
                busqueda_activa_seguidores: respuesta_seguidores.busqueda_activa,
                cantidad_total_seguidores: respuesta_seguidores.cant_total_seguidores,
                cantidad_actual_seguidores: respuesta_seguidores.cant_seguidores
            });

        } catch (error) {

            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensajeAlertSeguidores: error.message
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {

            //Finaliza el estado de carga y refresco de seguidores
            this.setState({ refreshing_seguidores: false, loading_seguidores: false });

            //Actualiza el numero de notificaciones
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);

        }
    };

    //Actualiza el estado del componente del texto de busqueda
    handleTextSearchSeguidor(texto) {
        //Establece la pagina a 1 ademas de agregar el valor en el campo de busqueda
        //Despues se llama a la funcion para obtener una lista de usuarios que siguen al emprendedor
        this.setState({
            buscarSeguidor: texto,
            pagina_seguidores: 1,
            lista_seguidores: []
        }, () => {
            this.obtenerListaSeguidoresUsuario();
        });
    };

    //Funcion que renderizar cada elemento de la lista de seguidores
    renderItemSeguidores = ({ item }) => (

        //Componente Card para mostrar la informacion del seguidor
        <Card key={item.id_seguimiento}>
            <View style={{ width: "auto", flexDirection: 'row', height: 60 }}>
                {/*Componente View que contiene el nombbre de usuario y el nombre completo */}
                <View style={{ width: "60%", marginStart: 10 }}>
                    <Text style={styles.tamanio_texto}>{item.nombre_usuario}</Text>
                    <Text style={styles.text_seguidos}>{item.nombre_completo}</Text>
                </View>

                {/* Componente View que contiene un TouchableOpacity para eliminar al seguidor */}
                <View style={{ width: "40%" }}>
                    {/*Componente TouchableOpacity para abrir el modal para eliminar al seguidor */}
                    <TouchableOpacity
                        style={[styles.boton, styles.botonBaja]}
                        onPress={() => this.setState({
                            modalEliminarSeguidor: true,
                            seguidorSeleccionado: {
                                id_seguimiento: item.id_seguimiento,
                                id_usuario_eliminar: item.id_usuario,
                                nombreUsuario: item.nombre_usuario

                            }
                        })}
                    >
                        <Text style={[styles.textoBoton, styles.textoBaja]}>Eliminar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Card>
    );

    //Funcion que renderiza el pie de pagina de la lista de seguidores
    renderFooterSeguidores = () => {
        const { cargar_mas_seguidores, lista_seguidores } = this.state;
        return (
            <View style={{ padding: 10, marginBottom: 20, marginTop: 20 }}>

                {/*Muestra un mensaje en caso que no halla que cargar mas seguidores y la lista de seguidores sea mayor o igual 1 */}
                {!cargar_mas_seguidores && lista_seguidores.length >= 1 &&
                    <Text style={styles.textTitulo}>No hay mas usuarios que te sigan</Text>
                }
                {/*Muestra un indicador de carga si hay mas seguidores por cargar */}
                {cargar_mas_seguidores && (
                    <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                )}
            </View>
        );
    };

    //Funcion para manejar la carga de mas seguidores al final de la lista
    handleLoadMoreSeguidores = () => {
        const { cargar_mas_seguidores } = this.state;
        //Verifica primero si hay que cargar mas seguidores
        if (cargar_mas_seguidores) {
            //Incrementa el numero de pagina y llama a la funcion para obtener mas seguidores
            this.setState(prevState => ({
                pagina_seguidores: prevState.pagina_seguidores + 1,
                cargar_mas_seguidores: true,
            }), () => {
                this.obtenerListaSeguidoresUsuario();
            });
        }
    };

    //Funcion para restablecer la lista de seguidores
    onRefreshSeguidores = () => {
        //Reinicia la pagina a 1 y establece el estado de refreshing_seguidores a verdadero
        this.setState({ refreshing_seguidores: true, pagina_seguidores: 1, lista_seguidores: [] }, () => {
            this.obtenerListaSeguidoresUsuario();
        });
    };

    //Funcion para eliminar un seguidor de la lista de seguidores del emprendedor
    eliminar_seguidor = async () => {
        const { id_usuario, tipo_usuario, id_usuario_emprendedor, seguidorSeleccionado, buscarSeguidor } = this.state;
        try {

            // Indicar que se está procesando la solicitud para eliminar al seguidor
            this.setState({ loading_eliminar_seguidor: true });


            //Se llama a la funcion que tiene la API para eliminar a un usuario de la lista de seguidores del emprendedor
            const respuesta = await api_seguidores_seguidos.bajaSeguidor(seguidorSeleccionado.id_usuario_eliminar, id_usuario_emprendedor, id_usuario, tipo_usuario);

            // Actualizar el estado de la lista de seguidores
            this.setState(prevState => {
                const lista_seguidores = prevState.lista_seguidores.filter(
                    seguidor => seguidor.id_seguimiento !== seguidorSeleccionado.id_seguimiento);
                return { lista_seguidores };
            });

            //Se verifica que el usuario estaba buscando aun usuario
            if (buscarSeguidor) {
                //Se actualiza el estado de la cantidad actual de seguidores restando 1
                this.setState((prevState) => ({
                    cantidad_actual_seguidores: prevState.cantidad_actual_seguidores - 1
                }));
            } else {
                //Se actualiza el estado de la cantidad total de seguidores obtenida de la funcion
                this.setState({
                    cantidad_total_seguidores: respuesta.num_seguidores
                });
            }

            this.setState({
                modalEliminarSeguidor: false
            }, () => {
                Alert.alert("Exito", respuesta.mensaje);
            });

        } catch (error) {
            //Manejo de errores: Muestra un alert
            Alert.alert("Aviso", error.message);
        } finally {

            //Finaliza el estado de carga 
            this.setState({ loading_eliminar_seguidor: false });

            //Actualiza el numero de notificaciones
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);


        }
    };

    render() {
        const {
            tipo_usuario,

            //Indice para manejo de vistas de pestañas
            index,
            //Datos de seguidos
            mensajeAlertSeguidos, cantidad_actual_seguidos, buscarSeguido, lista_seguidos, refreshing_seguidos, loading_seguidos, pagina_seguidos, busqueda_activa_seguidos, cantidad_total_seguidos,
            //Datos de seguidres
            mensajeAlertSeguidores, cantidad_actual_seguidores, buscarSeguidor, lista_seguidores, refreshing_seguidores, loading_seguidores, pagina_seguidores, busqueda_activa_seguidores, cantidad_total_seguidores,

            //Modal para eliminar al seguidor
            modalEliminarSeguidor, loading_eliminar_seguidor, alertModalErrorEliminarSeguidor, seguidorSeleccionado } = this.state;
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
                <View style={[styles.container, { paddingStart: 8, paddingEnd: 8, paddingBottom: 20, paddingTop: 10 }]}>


                    {/*Componente View que contiene el Tab para la navegacion seguidos y si es emprendedor se muestra los seguidores */}
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
                                title="Seguidos"
                                titleStyle={{ fontSize: 16, color: 'black' }}
                            />
                            {/*Se verifica que sea un usario emprendedor */}
                            {tipo_usuario == 2 && (
                                <Tab.Item
                                    title="Seguidores"
                                    titleStyle={{ fontSize: 16, color: 'black' }}
                                />
                            )}
                        </Tab>

                        {/*Componente TabView para mostrar el contenido de cada pestaña */}
                        <TabView value={index} disableSwipe={true} onChange={(newValue) => this.setState({ index: newValue })} animationType="spring" >


                            {/*Pestaña Seguidos*/}
                            <TabView.Item style={{ width: '100%' }}>
                                <View style={{ flex: 1 }}>
                                    <View style={{ padding: 10 }}>

                                        {/*Componente SearchBar que se utiliza para buscar al emprendedor*/}
                                        <SearchBar
                                            placeholder="Nombre del emprendimiento/usuario"
                                            value={buscarSeguido}
                                            onChangeText={this.handleTextSearchSeguidos.bind(this)}
                                            round={true}
                                            lightTheme={true}
                                            containerStyle={styles.container_search}
                                            inputContainerStyle={{ backgroundColor: 'white' }}
                                        />

                                        {/*Mensaje de alerta si hay uno*/}
                                        {mensajeAlertSeguidos && (
                                            mostrarMensaje(mensajeAlertSeguidos, 'danger')
                                        )}
                                        {/*Verifica que el usuario inicio una busqueda  y que la lista de seguidos sea mayor a 0 para mostrar la cantidad de resultados de busqueda*/}
                                        {!loading_seguidos && !refreshing_seguidos && lista_seguidos.length > 0 && (
                                            busqueda_activa_seguidos ?
                                                (<Text style={{ fontSize: 25, marginStart: 15 }}>Resultados:{cantidad_actual_seguidos}</Text>)
                                                :
                                                (<Text style={styles.text_aviso}>Cantidad de emprendedores que seguis:{cantidad_total_seguidos}</Text>)
                                        )}


                                    </View>
                                    {/*Indicador de carga si esta cargando datos*/}
                                    {loading_seguidos && (
                                        <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                                    )}
                                    <FlatList
                                        data={lista_seguidos}// Datos de la lista que serán renderizados
                                        renderItem={this.renderItemSeguidos}// Función que renderiza cada elemento de la lista
                                        keyExtractor={(item, index) => index.toString()}// Función para extraer la clave única para cada elemento
                                        ListFooterComponent={this.renderFooterSeguidos} // Componente que se renderiza al final de la lista
                                        onEndReached={this.handleLoadMoreSeguidos}// Función que se llama cuando se alcanza el final de la lista
                                        onEndReachedThreshold={0.5} // Umbral que determina cuánto antes del final de la lista se debe llamar a onEndReached
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={refreshing_seguidos}// Estado que indica si la lista se está refrescando
                                                onRefresh={this.onRefreshSeguidos} // Función que se llama cuando se realiza un gesto de refresco
                                            />
                                        }
                                        // Componente que se muestra cuando la lista está vacía
                                        ListEmptyComponent={
                                            (!loading_seguidos && !mensajeAlertSeguidos && pagina_seguidos == 1) && (
                                                busqueda_activa_seguidos ?
                                                    <Text style={styles.textoBusqueda}>Sin resultados</Text> :
                                                    <Text style={styles.textoBusqueda}>No seguis a algun emprendedor por el momento</Text>
                                            )
                                        }
                                    />

                                </View>
                            </TabView.Item>

                            {/*Se verifica que sea un usuario emprendedor*/}
                            {tipo_usuario == 2 && (
                                /*Pestaña Seguidores*/
                                <TabView.Item style={{ width: '100%' }}>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ padding: 10 }}>
                                            {/*Componente SearchBar que se utiliza para buscar al emprendedor*/}
                                            <SearchBar
                                                placeholder="Nombre de usuario"
                                                value={buscarSeguidor}
                                                onChangeText={this.handleTextSearchSeguidor.bind(this)}
                                                round={true}
                                                lightTheme={true}
                                                containerStyle={styles.container_search}
                                                inputContainerStyle={{ backgroundColor: 'white' }}
                                            />

                                            {/*Mensaje de alerta si hay uno*/}
                                            {mensajeAlertSeguidores && (
                                                mostrarMensaje(mensajeAlertSeguidores, 'danger')
                                            )}
                                            {/*Verifica que el usuario inicio una busqueda y que la lista de seguidores sea mayor a 0 para mostrar la cantidad de resultados de busqueda*/}
                                            {!loading_seguidores && !refreshing_seguidores && lista_seguidores.length > 0 && (
                                                busqueda_activa_seguidores ?
                                                    (<Text style={{ fontSize: 25, marginStart: 15 }}>Resultados:{cantidad_actual_seguidores}</Text>)
                                                    :
                                                    (<Text style={styles.text_aviso}>Cantidad de usuarios que te siguen:{cantidad_total_seguidores}</Text>)
                                            )}

                                        </View>
                                        {/*Indicador de carga si esta cargando datos*/}
                                        {loading_seguidores && (
                                            <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                                        )}

                                        <FlatList
                                            data={lista_seguidores}// Datos de la lista que serán renderizados
                                            renderItem={this.renderItemSeguidores}// Función que renderiza cada elemento de la lista
                                            keyExtractor={(item, index) => index.toString()}// Función para extraer la clave única para cada elemento
                                            ListFooterComponent={this.renderFooterSeguidores}// Componente que se renderiza al final de la lista
                                            onEndReached={this.handleLoadMoreSeguidores}// Función que se llama cuando se alcanza el final de la lista
                                            onEndReachedThreshold={0.5}// Umbral que determina cuánto antes del final de la lista se debe llamar a onEndReached

                                            refreshControl={
                                                <RefreshControl
                                                    refreshing={refreshing_seguidores}// Estado que indica si la lista se está refrescando
                                                    onRefresh={this.onRefreshSeguidores}// Función que se llama cuando se realiza un gesto de refresco
                                                />
                                            }
                                            // Componente que se muestra cuando la lista está vacía
                                            ListEmptyComponent={
                                                (!loading_seguidores && !mensajeAlertSeguidores && pagina_seguidores == 1) && (
                                                    busqueda_activa_seguidores ?
                                                        <Text style={styles.textoBusqueda}>Sin resultados</Text> :
                                                        <Text style={styles.textoBusqueda}>Por el momento no hay usuarios que te sigan</Text>
                                                )
                                            }
                                        />
                                    </View>
                                </TabView.Item>
                            )}
                        </TabView>
                    </View>



                    { /*Modal para eliminar al seguidor*/}
                    <View >
                        {/* Proveedor de temas de Paper para estilos consistentes */}
                        <PaperProvider theme={theme}>
                            <Modal visible={modalEliminarSeguidor} animationType="fade" statusBarTranslucent={false} transparent={true} >
                                <ScrollView style={styles.modalViewFondo}>
                                    <View style={[styles.modalView, { marginTop: '65%' }]}>
                                        <Text style={styles.textTitulo}>Aviso</Text>
                                        <View style={{ marginBottom: 20, padding: 10 }}>

                                            {/*Mensaje de alerta si hay uno*/}
                                            {alertModalErrorEliminarSeguidor && (
                                                mostrarMensaje(alertModalErrorEliminarSeguidor, 'danger')
                                            )}
                                            <Text style={styles.tamanio_texto}>¿Estas seguro de querer eliminar la siguiente seguidor?</Text>

                                            {/*Detalles de seguidor a eliminar*/}
                                            <Text style={[styles.tamanio_texto, { paddingLeft: 15, marginBottom: 5 }]}>
                                                <Text style={styles.caracteristica}>Nombre de usuario:</Text>
                                                <Text>{seguidorSeleccionado.nombreUsuario}</Text>
                                            </Text>

                                        </View>

                                        {/* Botones para eliminar al seguidor o cancelar el proceso */}
                                        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                                            <TouchableOpacity
                                                style={[styles.boton, styles.botonInfo, loading_eliminar_seguidor ? styles.botonDesactivado : null]}
                                                onPress={() => this.setState({ modalEliminarSeguidor: false, alertModalErrorEliminarSeguidor: '' })}
                                                disabled={loading_eliminar_seguidor}//Desactiva el boton cuando se llama a la funcion para eliminar al seguidor
                                            >
                                                <Text style={[styles.textoBoton, styles.textoInfo]}>Cancelar</Text>
                                            </TouchableOpacity>


                                            <TouchableOpacity
                                                style={[styles.boton, styles.botonBaja, loading_eliminar_seguidor ? styles.botonDesactivado : null]}
                                                onPress={() => this.eliminar_seguidor()}// Función para eliminar al seguidor 
                                                disabled={loading_eliminar_seguidor}//Desactiva el boton cuando se llama a la funcion para eliminar al seguidor
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