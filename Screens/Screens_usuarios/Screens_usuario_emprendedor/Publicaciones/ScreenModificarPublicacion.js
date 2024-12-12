import React, { Component } from 'react';

//Componentes utilizados en React Native
import { TouchableOpacity, RefreshControl, View, SafeAreaView, Text, ScrollView, FlatList, Alert, Image, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Tab, TabView } from '@rneui/themed';

//Biblioteca para almacenamiento asincrono de datos
import AsyncStorage from '@react-native-async-storage/async-storage';

//Componente para mostrar iconos
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

//Iconos especificos de FontAwesome
import { faPhotoFilm, faMapLocationDot, faTrash } from '@fortawesome/free-solid-svg-icons';

//Componentes para reproducir videos y ajustar el tamaño del video
import { Video, ResizeMode } from 'expo-av';

// Biblioteca para seleccionar imágenes desde la galería o la cámara del dispositivo
import * as ImagePicker from 'expo-image-picker';

// Componente para mostrar un mapa y marcadores en la aplicación
import MapView, { Marker } from 'react-native-maps';

// Módulo para obtener y manejar la ubicación del dispositivo
import * as Location from 'expo-location';

//Archivo de estilos
import { styles } from '../../../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { validarArchivosPublicacion, mostrarMensaje, esImagen } from '../../../../config/funciones.js';

//Módulo para realizar consultas a las APIs relacionadas
import api_publicacion from '../../../../config/consultas_api/api_publicacion.js'

//Configuracion de URL y otros parametros
import { config_define } from '../../../../config/config_define.js';


export class ScreenModificarPublicacion extends Component {
    constructor(props) {
        super(props);
        this.state = {

            //Identificador del usuario actual
            id_usuario: null,
            tipo_usuario: null,

            id_publicacion: this.props.route.params.id_publicacion,//Identificador de la publicacion a modificar

            errorObtenerPublicacion: false,//Indiciar si hubo un error al obtener la informacion de la publicacion
            loading_inicio: true,//Indica cuando se esta cargando la informacion de la publicacion

            index: null,//Indice para manejo de vistas de pestañas

            descripcion: '',//Indica la descripcion de la publicacion
            detalles_publicacion_bd: [],//Indica la descripcion de la publicacion
            agregar_archivo: false,//Indica si se va agregar imagenes o videos a la publicacion o no 
            lista_archivos: [],//Lista de archivos que se mostraran
            loading_archivo: false,//Inidica cuando se este eliminando un archivo de la lista
            lista_archivos_bd: [],//Lista con los archivos actuales de la publicacion
            lista_nombre_archivos_bd: [],//Lista con los nombres de los archivos de los archivos actuales de la publicacion

            cargar_maps: false,
            agregar_ubicacion: false,//Indica si se va agregar la ubicacion a la publicacion o no 
            map_latitude: null, //Indica la latitude obtenida de la geolocalizacion
            map_longitude: null,//Indica la longitude obtenida de la geolocalizacion

            tipoMensaje: '', //Tipo de mensaje a mostrar dependiendo de lo que haga el usuario 
            mensaje: '', //Mensaje a mostrar dependiendo de lo que haga el usuario 

            loading_publicar: false, //Indica el estado al cargar al modificar la publicacion
            refreshing_publicacion: false//Indica el estado de actualizar toda la informacion de la publicacion
        };
    }

    //Metodo llamado cuando el componente se monta
    async componentDidMount() {
        //Se obtienen los datos de sesion almacenados en AsyncStorage
        const idUsuario = await AsyncStorage.getItem('idUsuario');
        const tipoUsuario = await AsyncStorage.getItem('tipoUsuario');

        //Se actualiza el estado con los datos de sesion
        //Despuesta la llama a la funcion para obtener la informacion de la publicacion
        this.setState({
            id_usuario: idUsuario,
            tipo_usuario: tipoUsuario,
        }, () => {
            this.obtenerPublicacionDelEmprendedor();

        });
    };

    // Función para obtener la información de la publicación
    obtenerPublicacionDelEmprendedor = async () => {
        try {
            const { id_usuario, tipo_usuario, id_publicacion } = this.state;

            // Se llama a la función que tiene la API para obtener la información de la publicación
            const respuesta = await api_publicacion.obtenerDatosPublicacion(id_usuario, tipo_usuario, id_publicacion);
            var detalles_publicacion = respuesta.detalles_publicacion;
            var archivos_publicacion = respuesta.archivos;

            var lista_uri_archivos_bd = [];
            var nombre_bd_archivos = [];
            var agregar_img = false;

            // Actualiza la descripción y los detalles de la publicación 
            this.setState({
                descripcion: detalles_publicacion.descripcion,
                detalles_publicacion_bd: detalles_publicacion
            });

            // Procesa la lista de archivos de la publicación
            if (archivos_publicacion.length > 0) {
                var tipo_archivo;
                for (var i = 0; i < archivos_publicacion.length; i++) {
                    if (esImagen(archivos_publicacion[i].nombre_archivo)) {
                        tipo_archivo = 'image';
                    } else {
                        tipo_archivo = 'video';
                    }
                    lista_uri_archivos_bd.push({ type: tipo_archivo, uri: `${config_define.urlBase}/uploads/${detalles_publicacion.id_usuario_emprendedor}/publicaciones_informacion/${archivos_publicacion[i].nombre_carpeta}/${archivos_publicacion[i].nombre_archivo}` });
                    nombre_bd_archivos.push(archivos_publicacion[i].nombre_archivo);
                }
                agregar_img = true;
            }

            // Actualiza el estado con la lista de archivos y sus nombres
            this.setState({
                lista_archivos: lista_uri_archivos_bd,
                lista_archivos_bd: lista_uri_archivos_bd,
                lista_nombre_archivos_bd: nombre_bd_archivos,
                agregar_archivo: agregar_img,
            });

            var agregar_maps = false;
            var latitud = null;
            var longitud = null;

            // Verifica si hay coordenadas de mapa en los detalles de la publicación
            if (detalles_publicacion.map_latitud != null && detalles_publicacion.map_longitud != null) {
                //Se guarda la ubicación actual de la publicación
                latitud = detalles_publicacion.map_latitud;
                longitud = detalles_publicacion.map_longitud;
                agregar_maps = true;
            }

            // Actualiza el estado con las coordenadas del mapa y el indicador de agregar ubicación
            this.setState({
                map_latitude: latitud,
                map_longitude: longitud,
                agregar_ubicacion: agregar_maps,
            });

        } catch (error) {
            // Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensaje: error.message, tipoMensaje: 'danger', errorObtenerPublicacion: true
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            // Finaliza el estado de carga y refresco de publicaciones
            this.setState({ refreshing_publicacion: false, loading_inicio: false });
        }
    };

    //Funcion para agregar archivos 
    selectArchivos = async () => {

        // Solicita permisos para acceder a la biblioteca de medios
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            // Si el permiso no es concedido muestra una alerta
            Alert.alert('Permiso necesario', 'Se necesita permiso para acceder a la galería.');
            return;
        }

        // Abre la biblioteca de imágenes/videos del dispositivo para que el usuario seleccione archivos
        var result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All, // Permite seleccionar todos los tipos de medios
            allowsMultipleSelection: true, // Permite la selección múltiple
            selectionLimit: 5, // Límite de selección de 5 archivos
            quality: 1, // Calidad de los archivos seleccionados
        });


        // Establece el estado de carga a true mientras se procesan los archivos seleccionados
        this.setState({ loading_archivo: true });

        //Verifica si el usuario no cancelo la selección de archivos
        if (!result.canceled) {

            // Se calcula la cantidad total de archivos actuales más los seleccionados
            const cantidad_archivos = this.state.lista_archivos.length + result.assets.length;

            //Verifica que la cantidad total supera 5 archivos para mostrar un mensaje de aviso
            if (cantidad_archivos > 5) {
                Alert.alert('Aviso', 'Solo se permite agregar 5 imágenes/videos como máximo.');
                // Establece el estado de carga a false
                this.setState({ loading_archivo: false });
                return;
            }

            // Verifica que los archivos seleccionados sean validos
            const archivos_validos = validarArchivosPublicacion(result.assets);
            // Actualiza el estado con los archivos válidos agregados a la lista existente y establece el estado de carga a false
            this.setState((prevState) => ({
                lista_archivos: [...prevState.lista_archivos, ...archivos_validos],
                loading_archivo: false,
            }));
        } else {
            // Si el usuario canceló la selección, establece el estado de carga a false
            this.setState({ loading_archivo: false });
        }


    };

    //Funcion para eliminar el archivo seleccionado
    eliminarArchivo = (uri) => {
        // Establece el estado de carga a true mientras se elimina el archivo
        this.setState({ loading_archivo: true });

        // Usa un setTimeout de 300 ms para simular un pequeño retraso antes de actualizar el estado
        setTimeout(() => {

            // Filtra la lista de archivos para excluir el archivo con el uri especificado y establece el estado de carga a false
            this.setState((prevState) => ({
                lista_archivos: prevState.lista_archivos.filter((archivo) => archivo.uri !== uri),
                loading_archivo: false,
            }));
        }, 300);
    };

    //Funcion que renderizar cada elemento de la lista de archivos
    renderItemArchivo = ({ item }) => {
        const { loading_publicar } = this.state;
        return (
            //Componente View para mostrar videos o imagenes para la publicacion
            <View style={styles.viewContainerArchivo}>
                {/*Verifica que el archivo sea una imagen */}
                {item.type == 'image' ?
                    //Componente View para mostrar imagenes para la publicacion
                    (<View style={{ width: "100%", height: "100%" }}>
                        <Image source={{ uri: item.uri }} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
                        {/*Componente TouchableOpacity para eliminar el archivo */}
                        <TouchableOpacity
                            style={styles.botonBorrarArchivo}
                            onPress={() => this.eliminarArchivo(item.uri)}
                            disabled={loading_publicar}//Desactiva el boton cuando se llama a la funcion para enviar la publicacion

                        >
                            <FontAwesomeIcon icon={faTrash} size={24} color={'grey'} />
                        </TouchableOpacity>
                    </View>)
                    :
                    //Componente View para mostrar videos para la publicacion
                    (<View style={{ width: "100%", height: "100%" }}>
                        <Video
                            source={{ uri: item.uri }} // URI del video
                            rate={1.0} // Velocidad de reproducción del video
                            volume={1.0} // Volumen del video
                            useNativeControls={true} // Muestra los controles nativos del reproductor de video
                            isMuted={false} // El video no está silenciado
                            resizeMode={ResizeMode.CONTAIN} // Ajusta el tamaño del video para que se contenga dentro del contenedor
                            shouldPlay={false} // El video no se reproducirá automáticamente
                            isLooping={false} // El video no se repetirá en bucle
                            style={{ width: "100%", height: "100%" }} // Estilo del video, ocupando todo el ancho y alto del contenedor
                        />
                        {/*Componente TouchableOpacity para eliminar el archivo */}
                        <TouchableOpacity
                            style={styles.botonBorrarArchivo}
                            onPress={() => this.eliminarArchivo(item.uri)}
                            disabled={loading_publicar}//Desactiva el boton cuando se llama a la funcion para enviar la publicacion
                        >
                            <FontAwesomeIcon icon={faTrash} size={24} color={'grey'} />
                        </TouchableOpacity>
                    </View>)
                }
            </View >
        );
    };

    //Funcionar para modificar la publicacion de la cuenta del emprendedor
    modificarPublicacion = async () => {
        const { id_publicacion, id_usuario, tipo_usuario, descripcion, lista_archivos, map_latitude, map_longitude, agregar_archivo, agregar_ubicacion, lista_nombre_archivos_bd, detalles_publicacion_bd } = this.state;
        try {
            //Actualiza el estado para cargar la modificacion de la publicacion 
            this.setState({ loading_publicar: true, mensaje: '', tipoMensaje: '' });

            //Se llama a la funcion que tiene la API para modificar la publicacion de la cuenta del emprendedor
            const respuesta = await api_publicacion.modificarPublicacion(id_publicacion, id_usuario, tipo_usuario, descripcion, lista_archivos, map_latitude, map_longitude, agregar_archivo, agregar_ubicacion, lista_nombre_archivos_bd, detalles_publicacion_bd);

            //Actualiza el mensaje y tipo de mensaje a mostrar en la interfaz del usuario
            //Despues se llama a la funcion para obtener los datos actualizados de la publicacion
            this.setState({
                mensaje: respuesta.mensaje, tipoMensaje: respuesta.estado
            }, () => {
                Alert.alert("Exito", respuesta.mensaje);
                this.obtenerPublicacionDelEmprendedor();
            });

        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensaje: error.message, tipoMensaje: 'danger'
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            //Finaliza el estado de carga
            this.setState({ loading_publicar: false });
        }

    };

    //Funcion para restablecer los valores originales de la publicacion
    restablecerCampos() {
        const { detalles_publicacion_bd, lista_archivos_bd } = this.state;

        // Actualiza la descripción con el contenido original de la descripcion
        this.setState({ descripcion: detalles_publicacion_bd.descripcion });

        var lista_archivos = [];
        var estado_agregar_ubicacion = false;

        // Verifica si hay archivos en la publicacion
        if (lista_archivos_bd.length > 0) {
            //Se guarda los archivos originales de la publicacion
            lista_archivos = lista_archivos_bd;
            estado_agregar_ubicacion = true;
        }

        // Actualiza la lista de archivos y el indicador de agregar archivo
        this.setState({
            lista_archivos: lista_archivos,
            lista_archivos_bd: lista_archivos,
            agregar_archivo: estado_agregar_ubicacion,
        });

        var map_latitud = null;
        var map_longitud = null;
        var estado_agregar_ubicacion = false;

        // Verifica si hay coordenadas de mapa en los detalles de la publicación
        if (detalles_publicacion_bd.map_latitud != null && detalles_publicacion_bd.map_longitud != null) {
            //Se guarda la ubicacion actual de la publicacion
            map_latitud = detalles_publicacion_bd.map_latitud;
            map_longitud = detalles_publicacion_bd.map_longitud;
            estado_agregar_ubicacion = true;
        }

        // Actualiza el estado con las coordenadas del mapa y el indicador de agregar ubicación
        this.setState({
            map_latitude: map_latitud,
            map_longitude: map_longitud,
            agregar_ubicacion: estado_agregar_ubicacion,
        });
    };

    // Función para abrir/cerrar el contenedor de las imágenes/videos
    abrirCerrarGaleria = async () => {
        const { agregar_archivo, lista_archivos_bd, lista_nombre_archivos_bd } = this.state;
        var nuevoEstadoGaleria = !agregar_archivo;
        var lista_archivos = [];
        var lista_nombre_archivos = lista_nombre_archivos_bd;

        //Verifica si el usuario va a agregar imagenes/videos a la publicacion
        if (nuevoEstadoGaleria) {
            //Verifica si la publicacion originalmente tenia imagenes/videos
            if (lista_archivos_bd.length > 0) {
                lista_archivos = lista_archivos_bd;
                lista_nombre_archivos = [];
            } else {
                // Solicita permisos para acceder a la biblioteca de medios
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    // Si el permiso no es concedido muestra una alerta
                    Alert.alert('Permiso necesario', 'Se necesita permiso para acceder a la galería.');
                    return;
                }
            }
        }

        // Actualiza el estado para alternar la vista de agregar archivos y resetea la lista de archivos
        this.setState({
            agregar_archivo: nuevoEstadoGaleria,
            lista_archivos: lista_archivos,
            lista_nombre_archivos: lista_nombre_archivos

        });
    };

    // Función para abrir/cerrar el contenedor de la ubicación del usuario
    abrirCerrarMaps = async () => {
        try {
            const { agregar_ubicacion, detalles_publicacion_bd } = this.state;
            var nuevoEstadoMaps = !agregar_ubicacion;
            var map_latitud = null;
            var map_longitud = null;

            // Actualiza el estado para cargar la ubicación del usuario
            this.setState({ cargar_maps: true });

            // Verifica si el usuario va a agregar la ubicación a la publicación
            if (nuevoEstadoMaps) {
                // Verifica si la publicación originalmente tenía una ubicación o no
                if (detalles_publicacion_bd.map_latitud != null && detalles_publicacion_bd.map_longitud != null) {
                    map_latitud = detalles_publicacion_bd.map_latitud;
                    map_longitud = detalles_publicacion_bd.map_longitud;
                } else {
                    // Solicita permisos para acceder a la ubicación en primer plano
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        // Si el permiso no es concedido muestra una alerta
                        Alert.alert('Permiso necesario', 'Se necesita permiso para acceder a la ubicación.');
                        this.setState({ cargar_maps: false });
                        return;
                    }

                    // Se obtiene la ubicación actual del dispositivo
                    const location = await Location.getCurrentPositionAsync({});
                    map_latitud = location.coords.latitude;
                    map_longitud = location.coords.longitude;
                }
            }

            // Actualiza el estado para alternar la vista de agregar ubicación y establece las coordenadas del mapa
            this.setState({
                map_latitude: map_latitud,
                map_longitude: map_longitud,
                agregar_ubicacion: nuevoEstadoMaps,
                cargar_maps: false
            });
        } catch (error) {
            // Maneja los errores, como la falla en la configuración del dispositivo
            Alert.alert('Error al obtener la ubicación', 'No se pudo obtener la ubicación debido a la configuración del dispositivo.');
            this.setState({ cargar_maps: false }); // Asegúrate de detener la carga del mapa si ocurre un error
        }
    };

    //Funcion para actualizar la ubicacion de la publicacion
    actualizarUbicacion = async () => {
        try {
            // Solicita permisos para acceder a la ubicación en primer plano
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                // Si el permiso no es concedido muestra una alerta
                Alert.alert('Permiso necesario', 'Se necesita permiso para acceder a la ubicación.');
                return;
            }

            // Se obtiene la ubicación actual del dispositivo
            const location = await Location.getCurrentPositionAsync({});

            // Actualiza el estado con las coordenadas de la ubicación
            this.setState({
                map_latitude: location.coords.latitude,
                map_longitude: location.coords.longitude
            });
        } catch (error) {
            // Maneja los errores como la falla en la configuración del dispositivo
            Alert.alert('Error al obtener la ubicación', 'No se pudo obtener la ubicación debido a la configuración del dispositivo.');
        }
    };






    //Funcion para restablecer la informacion de la publicacion
    onRefreshPublicacion = () => {
        //Establece el estado de refreshing_publicacion a true y elimina cualquier mensaje previo
        //Despues se llama a la funcion para obtener la informacion de la publicacion
        this.setState({
            refreshing_publicacion: true, loading_inicio: true, mensaje: '', tipoMensaje: ''
        }, () => {
            this.obtenerPublicacionDelEmprendedor();
        });
    };

    render() {
        const { index, errorObtenerPublicacion, loading_inicio, descripcion, map_longitude, map_latitude, lista_archivos, cargar_maps, refreshing_publicacion,
            mensaje, tipoMensaje, loading_archivo, loading_publicar, agregar_archivo, agregar_ubicacion
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
                <ScrollView style={[styles.container]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing_publicacion}// Estado que indica si la lista se está refrescando
                            onRefresh={this.onRefreshPublicacion}// Función que se llama cuando se realiza un gesto de refresco
                        />
                    }>
                    <View style={[styles.viewCard, { marginBottom: 40 }]}>
                        <Text style={{ fontSize: 20, marginBottom: 10, textAlign: 'center' }}>Datos de la publicacion</Text>

                        {/*Verifica la carga de informacion */}
                        {loading_inicio ?
                            (
                                <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                            ) : (
                                <View>
                                    {/*Verifica si hay un mensaje*/}
                                    {mensaje && (
                                        /*Se llama a la funcion para obtener un contenedor que muestra un mensaje segun las acciones que realice el usuario*/
                                        mostrarMensaje(mensaje, tipoMensaje)
                                    )}
                                    {/*Verifica si no hubo problemas al obtener los datos de la publicacion  */}
                                    {!errorObtenerPublicacion && (
                                        <View>
                                            {/*Componente View que contiene un TextInput para agregar la descripcion de la publicacion*/}
                                            <View>
                                                <TextInput
                                                    label="Descripción"
                                                    value={descripcion}
                                                    onChangeText={(text) => this.setState({ descripcion: text })}
                                                    style={styles.input_paper}
                                                    theme={theme}
                                                    disabled={loading_publicar}//Desactiva el TextInput cuando se llama a la funcion para modificar los datos de la publicacion
                                                    maxLength={255}
                                                    multiline
                                                    numberOfLines={5}
                                                />
                                                <Text style={styles.text_contador}>Máximo 255 caracteres. {255 - descripcion.length} restantes</Text>
                                            </View>

                                            {/*Componente View que contiene TouchableOpacity para abrir o cerrar el contenedor ubicacion y galeria*/}
                                            <View >
                                                <Text style={[styles.text_aviso]}>Agrega a tu publicacion</Text>
                                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>

                                                    {/*Componente TouchableOpacity que contiene para abrir o cerrar el contenedor galeria*/}
                                                    <TouchableOpacity
                                                        onPress={this.abrirCerrarGaleria}
                                                        style={[styles.botonAgregar, agregar_archivo ? styles.botonAgregarActivar : styles.botonAgregarDesactivar, loading_publicar && styles.botonDesactivado]}
                                                        disabled={loading_publicar}//Desactiva el boton cuando se llama a la funcion para modificar los datos de la publicacion
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faPhotoFilm}
                                                            size={40}
                                                            color={agregar_archivo ? 'white' : 'black'}
                                                        />
                                                    </TouchableOpacity>

                                                    {/*Componente TouchableOpacity que contiene para abrir o cerrar el contenedor ubicacion*/}
                                                    <TouchableOpacity
                                                        onPress={this.abrirCerrarMaps}
                                                        style={[styles.botonAgregar, agregar_ubicacion ? styles.botonAgregarActivar : styles.botonAgregarDesactivar, loading_publicar || cargar_maps && styles.botonDesactivado]}
                                                        disabled={loading_publicar || cargar_maps}//Desactiva el boton cuando se llama a la funcion para modificar los datos de la publicacion o cuando se obtiene la ubicacion de la publicacion
                                                    >
                                                        {cargar_maps &&
                                                            <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                                                        }
                                                        <FontAwesomeIcon
                                                            icon={faMapLocationDot}
                                                            size={40}
                                                            color={agregar_ubicacion ? 'white' : 'black'}
                                                        />
                                                    </TouchableOpacity>

                                                </View>
                                            </View>

                                            {/*Componente View que contiene el Tab para la navegacion entre galeria y ubicacion */}
                                            {(agregar_archivo || agregar_ubicacion) && (

                                                <View style={[styles.viewTab, { height: 600, marginTop: 20 }]}>

                                                    <Tab
                                                        value={index}
                                                        onChange={(newValue) => this.setState({ index: newValue })}
                                                        indicatorStyle={{
                                                            backgroundColor: 'grey',
                                                            height: 2,
                                                        }}
                                                        style={{ backgroundColor: 'white' }}
                                                    >
                                                        {agregar_archivo && (
                                                            <Tab.Item
                                                                title="Imagenes/Videos"
                                                                titleStyle={styles.tabTitle}
                                                            />)}
                                                        {agregar_ubicacion && (
                                                            <Tab.Item
                                                                title="Ubicacion"
                                                                titleStyle={styles.tabTitle}
                                                            />)}
                                                    </Tab>

                                                    {/*Componente TabView para mostrar el contenido de cada pestaña */}
                                                    <TabView
                                                        value={index}
                                                        disableSwipe={true}
                                                        onChange={(newValue) => this.setState({ index: newValue })}
                                                        animationType="spring"
                                                    >

                                                        {/*Pestaña Imagenes/videos*/}
                                                        {/*Verifica si el usuario activo agregar imagenes/videos*/}
                                                        {agregar_archivo && (
                                                            <TabView.Item style={{ width: '100%' }}>
                                                                <View style={{ height: "100%", width: "100%", padding: 10 }}>
                                                                    <View style={styles.viewArchivos}>

                                                                        <View style={{ alignItems: 'flex-start' }}>
                                                                            <TouchableOpacity onPress={this.selectArchivos}
                                                                                disabled={loading_publicar}//Desactiva el TouchableOpacity cuando se llama a la funcion para modificar los datos de la publicacion
                                                                                style={[styles.boton, styles.botonConfirmacion, loading_publicar && styles.botonDesactivado]}>
                                                                                <Text style={[styles.textoBoton, styles.textoConfirmacion]}>Agregar archivos</Text>
                                                                            </TouchableOpacity>
                                                                        </View>

                                                                        {loading_archivo ? (
                                                                            <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                                                                        ) : (
                                                                            <FlatList
                                                                                data={lista_archivos} // Datos de la lista que serán renderizados
                                                                                renderItem={this.renderItemArchivo} // Función que renderiza cada elemento de la lista
                                                                                keyExtractor={(item) => item.uri}// Función para extraer la clave única para cada elemento
                                                                                horizontal={true} // Hacer que la lista sea horizontal en lugar de vertical
                                                                                contentContainerStyle={{
                                                                                    alignItems: 'center',
                                                                                }}
                                                                            />

                                                                        )}
                                                                    </View>
                                                                    <Text style={styles.text_contador}>Maximo 5 archivos(Imagen limite 10 MB, Video limite 100 MB)</Text>
                                                                </View>
                                                            </TabView.Item>

                                                        )}

                                                        {/*Pestaña de ubicacion*/}
                                                        {/*Verifica si el usuario activo agregar ubicacion*/}
                                                        {agregar_ubicacion && (
                                                            <TabView.Item style={{ width: '100%' }}>
                                                                <View style={{ height: "100%", width: "100%", padding: 10 }}>
                                                                    <View style={{ height: '10%', width: "100%" }}>
                                                                        <TouchableOpacity
                                                                            style={[styles.boton, styles.botonConfirmacion, loading_publicar && styles.botonDesactivado]}
                                                                            onPress={this.actualizarUbicacion}
                                                                            disabled={loading_publicar}//Desactiva el TouchableOpacity cuando se llama a la funcion para modificar los datos de la publicacion
                                                                        >
                                                                            <Text style={[styles.textoBoton, styles.textoConfirmacion]}>Actualizar Ubicacion</Text>
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                    <View style={{ borderWidth: 1, width: "100%", height: '90%' }}>
                                                                        <MapView
                                                                            style={{
                                                                                width: '100%',
                                                                                height: '100%',
                                                                            }}
                                                                            initialRegion={{
                                                                                latitude: map_latitude, // Latitud inicial del centro del mapa
                                                                                longitude: map_longitude, // Longitud inicial del centro del mapa
                                                                                latitudeDelta: 0.0062, // Rango de latitud visible en el mapa
                                                                                longitudeDelta: 0.0061, // Rango de longitud visible en el mapa
                                                                            }}
                                                                        >
                                                                            <Marker
                                                                                coordinate={{ latitude: map_latitude, longitude: map_longitude }} // Coordenadas del marcador
                                                                                title={"Mi Ubicación"} // Título que se mostrará al hacer clic en el marcador
                                                                            />
                                                                        </MapView>
                                                                    </View>
                                                                </View>
                                                            </TabView.Item>
                                                        )}

                                                    </TabView>

                                                </View>
                                            )}

                                            {/*Componente View que contiene dos TouchableOpacity el primero para guardar los cambios hechos y el segundo para restablecer los valores originales de la publicacion  */}
                                            <View style={{ flexDirection: 'row', alignSelf: 'center' }}>


                                                {/*Componente TouchableOpacity guardar los cambios hechos en la publicacion  */}
                                                <TouchableOpacity
                                                    style={[styles.boton, styles.botonConfirmacion, { marginVertical: 20 }, loading_publicar && styles.botonDesactivado]}
                                                    onPress={this.modificarPublicacion}
                                                    disabled={loading_publicar}//Desactiva el boton cuando se llama a la funcion para modificar los datos de la publicacion
                                                >
                                                    <Text style={[styles.textoBoton, styles.textoConfirmacion]}>Guardar Cambios</Text>
                                                    {loading_publicar &&
                                                        <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                                                    }
                                                </TouchableOpacity>


                                                {/*Componente TouchableOpacity para restablecer los valores originales de la publicacion  */}
                                                <TouchableOpacity
                                                    style={[styles.boton, styles.botonInfo, { marginVertical: 20 }, loading_publicar && styles.botonDesactivado]}
                                                    onPress={() => this.restablecerCampos()}
                                                    disabled={loading_publicar}//Desactiva el boton cuando se llama a la funcion para modificar los datos de la publicacion
                                                >
                                                    <Text style={[styles.textoBoton, styles.textoInfo]}>Restablecer campos</Text>
                                                </TouchableOpacity>
                                            </View>

                                        </View>
                                    )}
                                </View>
                            )
                        }
                    </View>
                </ScrollView>
            </SafeAreaView >
        );
    }
}