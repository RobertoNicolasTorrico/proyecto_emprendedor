import React, { Component } from 'react';

//Componentes utilizados en React Native
import { TouchableOpacity, View, SafeAreaView, Text, ScrollView, FlatList, Alert, Image, ActivityIndicator } from 'react-native';
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
import { validarArchivosPublicacion, mostrarMensaje } from '../../../../config/funciones.js';

//Módulo para realizar consultas a las APIs relacionadas
import api_publicacion from '../../../../config/consultas_api/api_publicacion.js'


export class ScreenNuevaPublicacion extends Component {
    constructor(props) {
        super(props);
        this.state = {

            //Identificador del usuario actual
            id_usuario: null,
            tipo_usuario: null,
            index: null,//Indice para manejo de vistas de pestañas


            descripcion: '',//Indica la descripcion de la publicacion
            agregar_archivo: false,//Indica si se va agregar imagenes o videos a la publicacion o no 
            lista_archivos: [],//Lista de archivos que se mostraran
            loading_archivo: false,//Indica cuando se este eliminando un archivo de la lista


            cargar_maps: false,//Indica que se esta cargando la ubicacion del usuario
            agregar_ubicacion: false,//Indica si se va agregar la ubicacion a la publicacion o no 
            map_latitude: null, //Indica la latitude obtenida de la geolocalizacion
            map_longitude: null,//Indica la longitude obtenida de la geolocalizacion

            tipoMensaje: '', //Tipo de mensaje a mostrar dependiendo de lo que haga el usuario 
            mensaje: '', //Mensaje a mostrar dependiendo de lo que haga el usuario 

            loading_publicar: false //Indica el estado al cargar la informacion de la publicacion

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
        });
    };


    //Funcion para agregar archivos 
    selectArchivos = async () => {
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

    //Funcion para subir la publicacion a la cuenta del emprendedor
    subirPublicacion = async () => {
        try {
            const { id_usuario, tipo_usuario, descripcion, lista_archivos, map_latitude, map_longitude, agregar_archivo, agregar_ubicacion } = this.state;

            //Actualiza el estado para cargar la publicacion ademas de restablecer los valores del mensaje y tipo de mensaje
            this.setState({ loading_publicar: true, mensaje: '', tipoMensaje: '' });

            //Se llama a la funcion que tiene la API para publicar la publicacion en la cuenta del emprendedor
            const respuesta = await api_publicacion.altaPublicacion(id_usuario, tipo_usuario, descripcion, lista_archivos, map_latitude, map_longitude, agregar_archivo, agregar_ubicacion);

            //Actualiza el mensaje y tipo de mensaje a mostrar en la interfaz del usuario
            //Despues se llama a la funcion para restablecer los valores de los campos de la publicacion
            this.setState({
                mensaje: respuesta.mensaje, tipoMensaje: respuesta.estado
            }, () => {
                Alert.alert("Aviso", respuesta.mensaje);
                this.limpiarCampos();
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

    //Funcion para restablecer los valores de todos los campos de la publicacion
    limpiarCampos() {
        this.setState({
            descripcion: '',
            agregar_archivo: false,
            lista_archivos: [],
            agregar_ubicacion: false,
            map_latitude: null,
            map_longitude: null
        });
    }

    // Función para abrir/cerrar el contenedor de las imágenes/videos
    abrirCerrarGaleria = async () => {
        const { agregar_archivo } = this.state;

        // Solicita permisos para acceder a la biblioteca de medios
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            // Si el permiso no es concedido muestra una alerta
            Alert.alert('Permiso necesario', 'Se necesita permiso para acceder a la galería.');
            return;
        }

        // Actualiza el estado para alternar la vista de agregar archivos y resetea la lista de archivos
        this.setState({
            agregar_archivo: !agregar_archivo,
            lista_archivos: [],

        });
    };

    // Función para abrir/cerrar el contenedor de la ubicación del usuario
    abrirCerrarMaps = async () => {
        const { agregar_ubicacion } = this.state;
        var nuevoEstadoMaps = !agregar_ubicacion;
        var map_latitud = null;
        var map_longitud = null;

        //Actualiza el estado para cargar la ubicacion del usuario
        this.setState({ cargar_maps: true });

        //Verifica si el usuario va a agregar la ubicacion a la publicacion
        if (nuevoEstadoMaps) {
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
        // Actualiza el estado para alternar la vista de agregar ubicación establece las coordenadas del mapa
        this.setState({
            map_latitude: map_latitud,
            map_longitude: map_longitud,
            agregar_ubicacion: nuevoEstadoMaps,
            cargar_maps: false
        });
    };


    render() {
        const {
            index,
            //Detalles de la publicaciones
            descripcion, map_longitude, map_latitude, lista_archivos, cargar_maps,
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
                <ScrollView style={[styles.container]}>
                    <View style={[styles.viewCard, { marginBottom: 40 }]}>
                        <Text style={{ fontSize: 20, marginBottom: 10, textAlign: 'center' }}>Datos de la nueva publicacion</Text>

                        {/*Verifica si hay un mensaje*/}
                        {mensaje && (
                            /*Se llama a la funcion para obtener un contenedor que muestra un mensaje segun las acciones que realice el usuario*/
                            mostrarMensaje(mensaje, tipoMensaje)
                        )}


                        {/*Componente View que contiene un TextInput para agregar la descripcion de la publicacion*/}
                        <View>
                            <TextInput
                                label="Descripción"
                                value={descripcion}
                                onChangeText={(text) => this.setState({ descripcion: text })}
                                style={styles.input_paper}
                                theme={theme}
                                disabled={loading_publicar}//Desactiva el boton cuando se llama a la funcion para enviar la publicacion
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
                                    style={[styles.botonAgregar, agregar_archivo ? styles.botonAgregarActivar : styles.botonAgregarDesactivar, loading_publicar ? styles.botonDesactivado : null]}
                                    disabled={loading_publicar}//Desactiva el boton cuando se llama a la funcion para enviar la publicacion
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
                                    style={[styles.botonAgregar, agregar_ubicacion ? styles.botonAgregarActivar : styles.botonAgregarDesactivar, loading_publicar || cargar_maps ? styles.botonDesactivado : null]}
                                    disabled={loading_publicar || cargar_maps}//Desactiva el boton cuando se llama a la funcion para enviar la publicacion o cuando se obtiene la ubicacion de la publicacion
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

                            < View style={[styles.viewTab, { height: 550, marginTop: 20 }]}>
                                <Tab
                                    value={index}
                                    onChange={(newValue) => this.setState({ index: newValue })}
                                    indicatorStyle={{
                                        backgroundColor: 'grey',
                                        height: 3,
                                    }}
                                >
                                    {agregar_archivo && (
                                        <Tab.Item
                                            title="Imagenes/Videos"
                                            titleStyle={{ fontSize: 16, color: 'black' }}
                                        />)}
                                    {agregar_ubicacion && (
                                        <Tab.Item
                                            title="Ubicacion"
                                            titleStyle={{ fontSize: 16, color: 'black' }}
                                        />)}
                                </Tab>

                                {/*Componente TabView para mostrar el contenido de cada pestaña */}
                                <TabView value={index} disableSwipe={true} onChange={(newValue) => this.setState({ index: newValue })} animationType="spring" >

                                    {/*Pestaña Imagenes/videos*/}
                                    {/*Verifica si el usuario activo agregar imagenes/videos*/}
                                    {agregar_archivo && (
                                        <TabView.Item style={{ width: '100%' }}>

                                            <View style={{ height: "100%", width: "100%", padding: 10 }}>
                                                <View style={styles.viewArchivos}>

                                                    <View style={{ alignItems: 'flex-start', }}>
                                                        <TouchableOpacity
                                                            onPress={this.selectArchivos}
                                                            disabled={loading_publicar}//Desactiva el boton cuando se llama a la funcion para enviar la publicacion
                                                            style={[styles.boton, styles.botonConfirmacion, loading_publicar ? styles.botonDesactivado : null]}>
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
                                                <View style={{ borderWidth: 1, width: "100%", height: '100%' }}>
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


                        {/*Componente View que contiene un TouchableOpacity para publicar la informacion  */}
                        <View >
                            <TouchableOpacity
                                style={[styles.boton, styles.botonConfirmacion, { marginVertical: 20 }, loading_publicar ? styles.botonDesactivado : null]}
                                onPress={this.subirPublicacion}
                                disabled={loading_publicar}//Desactiva el boton cuando se llama a la funcion para enviar la publicacion
                            >
                                <Text style={[styles.textoBoton, styles.textoConfirmacion]}>Publicar</Text>

                            </TouchableOpacity>
                            {loading_publicar &&
                                <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                            }
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView >

        );
    }
}