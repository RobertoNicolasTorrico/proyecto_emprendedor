import React, { Component } from 'react';


//Componentes utilizados en React Native
import { ActivityIndicator, Image, TouchableOpacity, Alert, FlatList, RefreshControl, SafeAreaView, ScrollView, Text, View, Modal } from 'react-native';
import { SearchBar, Card } from '@rneui/themed';
import { List, RadioButton, PaperProvider } from 'react-native-paper';

//Biblioteca para almacenamiento asincrono de datos
import AsyncStorage from '@react-native-async-storage/async-storage';

//Componente para mostrar iconos
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

//Iconos especificos de FontAwesome
import { faStar } from '@fortawesome/free-solid-svg-icons';

//Archivo de estilos
import { styles } from '../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { mostrarMensaje, renderPaginationButtons, obtenerCantNotificacionesSinLeer } from '../../config/funciones.js';

//Configuracion de URL y otros parametros
import { config_define } from '../../config/config_define.js';

//Módulo para realizar consultas a las APIs relacionadas
import api_emprendedor from '../../config/consultas_api/api_emprendedor.js';
import api_seguidores_seguidos from '../../config/consultas_api/api_seguidores_seguidos.js';



export class ScreenBuscarEmprendedor extends Component {
    constructor(props) {
        super(props);
        this.state = {

            //Identificador del usuario actual
            id_usuario: null,
            tipo_usuario: null,
            id_usuario_emprendedor: null,


            mensaje: '',  //Mensaje de error en caso de problemas al obtener los datos del emprendimiento

            //Datos de los emprendedores
            refreshing_emprendedor: false,//Indica el estado de actualizar toda la pestaña de emprendedores
            cantidad_total_emprendedores: 0,//Indica la cantidad total de emprendedores
            loading_emprendedor: false,//Indica el estado de cargar informacion de las emprendedores
            lista_emprendedores: [],//Lista de emprendedores que se mostraran
            pagina: '',//Indicador que contiene en que pagina se encuentra el usuario y la cantidad de paginas que hay
            pagina_actual: 1,//Pagina actual de emprendedores para la paginacion
            total_paginas: 0,//Indica la cantidad total de paginas para la paginacion

            //Filtro del estado de emprendedores
            modalFiltroEstado: false, //Indica el estado del modal del filtro
            radio_ordenar_por: "1",
            input_calificacion: 'todos_calificacion',
            calificacion: "todos_calificacion",

            //Busqueda predeterminada de emprendedores
            search: "",
            busqueda_activa: false,

            loading_seguir: false,// Indica el estado al seguidr o dejar de seguir a un emprendedor
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
            //Despues de actualizar el estado, se llaman a las funciones para obtener emprendedores
            this.obtenerEmprendedoresBuscador();
        });

        //Agrega un listener para actualizar a lista de emprendedores y notificaciones cuando la pantalla esta enfocada
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.obtenerEmprendedoresBuscador();

        });

    }


    //Funcion para obtener emprendedores
    obtenerEmprendedoresBuscador = async () => {
        const { id_usuario, tipo_usuario, search, pagina_actual, radio_ordenar_por, calificacion } = this.state;

        try {
            //Actualiza el estado para cargar mas emprendedores
            this.setState({ loading_emprendedor: true, mensaje: '', lista_emprendedores: [] });

            //Se llama a la funcion que tiene la API para obtener emprendedores
            const respuesta = await api_emprendedor.obtenerListaEmprendedoresBuscador(id_usuario, tipo_usuario, search, pagina_actual, radio_ordenar_por, calificacion);

            //Actualiza el estado de la lista de emprendedores  ademas de otros elementos necesarios para la interfaz
            this.setState({
                lista_emprendedores: respuesta.lista_emprendedores,
                cantidad_total_emprendedores: respuesta.cantidad_total_emprendedores,
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

            //Finaliza el estado de carga y refresco de emprendedor
            this.setState({ refreshing_emprendedor: false, loading_emprendedor: false });

            //Actualiza el numero de notificaciones en caso que el usuario halla iniciado sesion
            if (id_usuario != null && tipo_usuario != null) {
                obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
            }
        }
    };

    //Actualiza el estado del componente del texto de busqueda
    handleSearch = (text) => {
        //Establece la pagina a 1 ademas de agregar el valor en el campo de busqueda
        //Despues se llama a la funcion para obtener una lista de emprendedores
        this.setState({ search: text, pagina_actual: 1 }, () => {
            this.obtenerEmprendedoresBuscador();
        });
    };

    //Funcion para cambiar la pagina actual
    cambiarPagina = (pagina) => {
        //Despues de actualizar el numero de pagina se llama a la funcion para obtener una lista de emprendedores
        this.setState({ pagina_actual: pagina }, () => {
            this.obtenerEmprendedoresBuscador();
        });

    };

    //Actualiza el estado del componente del orden de los emprendedores
    setChecked = (num_ordenar) => {
        //Establece la pagina a 1 ademas de cambiar el radio_ordenar_por por el nuevo valor
        //Despues se llama a la funcion para obtener una lista de emprendedores
        this.setState({ pagina_actual: 1, radio_ordenar_por: num_ordenar }, () => {
            this.obtenerEmprendedoresBuscador();
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

        // Actualiza el estado con la nueva calificación y establece la página 1
        //Despues se llama a la funcion para obtener una lista de emprendedores
        this.setState({
            input_calificacion: value,
            calificacion: nueva_calificacion,
            pagina_actual: 1
        }, () => {
            this.obtenerEmprendedoresBuscador();
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

        // Actualiza el estado con la nueva calificación y establece la página 1
        //Despues se llama a la funcion para obtener una lista de emprendedores
        this.setState({
            input_calificacion: 'num_calificacion',
            calificacion: nueva_calificacion,
            pagina_actual: 1
        }, () => {
            this.obtenerEmprendedoresBuscador();
        });
    };


    //Funcion para restablecer los valores del filtro del modal
    restablecer_valores_modal() {

        //Restablece los valores del modal y tambien la pagina a 1
        //Despues se llama a la funcion para obtener una lista de emprendedores
        this.setState({
            pagina_actual: 1,
            radio_ordenar_por: "1",
            input_calificacion: "todos_calificacion",
            calificacion: "todos_calificacion",
        }, () => {
            this.obtenerEmprendedoresBuscador();
        });
    }

    //Funcion que renderizar cada elemento de la lista de emprendedores
    renderItemEmprendedor = ({ item }) => {
        const { id_usuario, tipo_usuario, id_usuario_emprendedor, loading_seguir } = this.state;
        return (
            //Componente Card para mostrar la informacion del emprendedor
            <Card key={item.id_usuario_emprendedor}>


                {/*Componente View para mostrar la imagen del perfil del emprendedore sino tiene una se utiliza una predeterminada por el sistema*/}
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
                    {/*Informacion del nombre del emprendimiento */}
                    <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Emprendimiento:</Text> {item.nombre_emprendimiento} </Text>

                    {/*Informacion de nombre de usuario */}
                    <Text style={styles.tamanio_texto}><Text style={styles.caracteristica}>Nombre de usuario:</Text> {item.nombre_usuario} </Text>

                    {/*Informacion de productos disponibles */}
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


                {/*Componente View que contiene el boton para seguir o dejar de seguir al usuario y para entrar al perfil del emprendedor*/}
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    {id_usuario != null && tipo_usuario != null && id_usuario_emprendedor != item.id_usuario_emprendedor && (
                        //Se verifica si el usuario sigue al emprendedor
                        item.lo_sigue ? (
                            /*Componente TouchableOpacity para dejar de seguir al emprendedor */
                            <TouchableOpacity
                                style={[styles.boton, styles.botonBaja, loading_seguir && styles.botonDesactivado]}
                                onPress={() => this.dejarSeguirUsuario(item.id_usuario_emprendedor)}
                                disabled={loading_seguir}
                            >
                                <Text style={[styles.textoBoton, styles.textoBaja]}>Dejar de seguir</Text>
                            </TouchableOpacity>
                        ) : (

                            /*Componente TouchableOpacity para seguir al emprendedor */
                            < TouchableOpacity
                                style={[styles.boton, styles.botonConfirmacion, loading_seguir && styles.botonDesactivado]}
                                onPress={() => this.seguirUsuario(item.id_usuario_emprendedor)}
                                disabled={loading_seguir}
                            >
                                <Text style={[styles.textoBoton, styles.textoConfirmacion]}>Seguir</Text>
                            </TouchableOpacity>
                        )
                    )}

                    {/*Componente TouchableOpacity para navegar al perfil del emprendedor */}
                    <TouchableOpacity
                        style={[styles.boton, styles.botonInfo]}
                        onPress={() => {
                            this.props.navigation.navigate("PerfilEmprendedor", { id_usuario_emprendedor: item.id_usuario_emprendedor, nombre_emprendimiento: item.nombre_emprendimiento });
                        }}
                    >
                        <Text style={[styles.textoBoton, styles.textoInfo]}>{id_usuario_emprendedor == item.id_usuario_emprendedor ? ("Mi perfil") : ("Ver perfil")}</Text>
                    </TouchableOpacity>
                </View>
            </Card >
        );
    };

    // Función para seguir a un emprendedor
    seguirUsuario = async (id_usuario_emprendedor) => {
        const { id_usuario, tipo_usuario } = this.state;
        try {

            // Indicar que se está procesando la solicitud de seguimiento
            this.setState({ loading_seguir: true });

            //Se llama a la funcion que tiene la API para seguir a un emprendedor
            const respuesta = await api_seguidores_seguidos.altaSeguirUsuarioEmprendedor(id_usuario_emprendedor, id_usuario, tipo_usuario);
            this.setState(prevState => {
                // Actualiza la lista de emprendedores en el estado, marcando al emprendedor como seguido
                const lista_emprendedores = prevState.lista_emprendedores.map(emprendedor => {
                    if (emprendedor.id_usuario_emprendedor === id_usuario_emprendedor) {
                        return { ...emprendedor, lo_sigue: true };
                    }
                    return emprendedor;
                });
                return { lista_emprendedores };
            });
        } catch (error) {
            // Muestra una alerta en caso de error
            Alert.alert("Aviso", error.message);
        } finally {

            // Finaliza el estado de carga
            this.setState({ loading_seguir: false });

            // Actualiza el número de notificaciones no leídas
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
        }
    };

    // Función para dejar de seguir a un emprendedor
    dejarSeguirUsuario = async (id_usuario_emprendedor) => {
        const { id_usuario, tipo_usuario } = this.state;

        try {

            // Indicar que se está procesando la solicitud de baja del seguimiento
            this.setState({ loading_seguir: true });

            //Se llama a la funcion que tiene la API para dejar seguir a un emprendedor
            const respuesta = await api_seguidores_seguidos.bajaSeguirUsuarioEmprendedor(id_usuario_emprendedor, id_usuario, tipo_usuario);
            this.setState(prevState => {
                // Actualiza la lista de emprendedores en el estado, marcando al emprendedor como no seguido
                const lista_emprendedores = prevState.lista_emprendedores.map(emprendedor => {
                    if (emprendedor.id_usuario_emprendedor === id_usuario_emprendedor) {
                        return { ...emprendedor, lo_sigue: false };
                    }
                    return emprendedor;
                });
                return { lista_emprendedores };
            });
        } catch (error) {
            // Muestra una alerta en caso de error
            Alert.alert("Aviso", error.message);
        } finally {

            // Finaliza el estado de carga
            this.setState({ loading_seguir: false });

            // Actualiza el número de notificaciones no leídas
            obtenerCantNotificacionesSinLeer(id_usuario, tipo_usuario, this.props.navigation);
        }
    };

    //Funcion para restablecer la lista de emprendedores
    onRefresh = () => {
        //Reinicia la pagina a 1 y establece el estado de refreshing_emprendedor a verdadero
        this.setState({ refreshing_emprendedor: true, pagina_actual: 1 }, () => {
            this.obtenerEmprendedoresBuscador();
        });

    };

    render() {
        const { mensaje, pagina, loading_emprendedor,
            lista_emprendedores, busqueda_activa, refreshing_emprendedor,
            calificacion, input_calificacion, radio_ordenar_por, cantidad_total_emprendedores,
            search, modalFiltroEstado, total_paginas, pagina_actual } = this.state;
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

                    {/*Componente View que contiene la lista de emprendedores, un boton de filtro y una barras de busqueda */}
                    <View style={[styles.viewCard, { flex: 1 }]}>
                        <SearchBar
                            placeholder="Buscar por nombre emprendimiento/usuario"
                            style={{ fontSize: 14 }}
                            value={search}
                            onChangeText={this.handleSearch.bind(this)}
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
                            {loading_emprendedor &&
                                <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                            }
                            <View>

                                {/*Verifica que el usuario inicio una busqueda y que la lista de emprendedores  sea mayor a 0 para mostrar la cantidad de resultados de busqueda*/}
                                {busqueda_activa && lista_emprendedores.length > 0 && <Text style={{ fontSize: 25, marginStart: 15 }}>Resultados:{cantidad_total_emprendedores}</Text>}
                                <FlatList


                                    data={lista_emprendedores}// Datos de la lista que serán renderizados
                                    renderItem={this.renderItemEmprendedor}// Función que renderiza cada elemento de la lista
                                    keyExtractor={(item, index) => index.toString()}// Función para extraer la clave única para cada elemento
                                    onEndReachedThreshold={0.5}// Umbral que determina cuánto antes del final de la lista se debe llamar a onEndReached
                                    ListFooterComponent={lista_emprendedores.length > 0 && (renderPaginationButtons(total_paginas, pagina_actual, '', pagina, this.cambiarPagina))}// Componente que se renderiza al final de la lista
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing_emprendedor}// Estado que indica si la lista se está refrescando
                                            onRefresh={this.onRefresh}// Función que se llama cuando se realiza un gesto de refresco
                                        />
                                    }
                                    // Componente que se muestra cuando la lista está vacía
                                    ListEmptyComponent={
                                        !loading_emprendedor && !mensaje && (
                                            busqueda_activa ?
                                                <Text style={styles.textoBusqueda}>Sin resultados</Text> :
                                                <Text style={styles.textoBusqueda}>No hay emprendedores disponibles</Text>)
                                    }

                                />
                            </View>
                        </View>
                    </View >


                    {/*Modal filtro*/}

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
                                        <List.Section titleStyle={{ fontSize: 25 }} title="Filtro" >
                                            <View style={{ borderRadius: 6, borderColor: '#dee2e6', borderWidth: 1, marginBottom: 20 }}>

                                                {/* Acordeón para ordenar emprendedores */}
                                                <List.Accordion title="Ordenar por"
                                                    theme={{ colors: { primary: 'black' } }}
                                                >
                                                    <View style={styles.lista_acordeon}>
                                                        <RadioButton.Group
                                                            onValueChange={radio_ordenar_por => this.setChecked(radio_ordenar_por)}
                                                            value={radio_ordenar_por}
                                                        >
                                                            <RadioButton.Item label="Fecha de registro: más reciente" value="1" />
                                                            <RadioButton.Item label="Fecha de registro: más antigua" value="2" />
                                                        </RadioButton.Group>
                                                    </View>
                                                </List.Accordion>

                                                {/* Acordeón para la calificacion del emprendedor */}
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
                                                                            style={{ marginRight: 2 }} // Espacio entre las estrellas
                                                                        />
                                                                    </TouchableOpacity>
                                                                ))}
                                                            </View>
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


                </View>

            </SafeAreaView >
        );
    }
}