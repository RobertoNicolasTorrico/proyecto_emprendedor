import React, { Component } from 'react';

//Componentes utilizados en React Native
import { SafeAreaView, Text, ScrollView, View, TouchableOpacity, Image, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { TextInput } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';

//Biblioteca para almacenamiento asincrono de datos
import AsyncStorage from '@react-native-async-storage/async-storage';

//Archivo de estilos
import { styles } from '../../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { mostrarMensaje, validarArchivosFotoPerfil } from '../../../config/funciones.js';

//Módulo para realizar consultas a las APIs relacionadas
import api_emprendedor from '../../../config/consultas_api/api_emprendedor.js';

//Configuracion de URL y otros parametros
import { config_define } from '../../../config/config_define.js';


export class ScreenDatosEmprendimiento extends Component {

    constructor(props) {
        super(props);
        this.state = {
            //Identificador del usuario actual
            id_usuario: null,
            tipo_usuario: null,


            tipoMensaje: '', //Tipo de mensaje a mostrar dependiendo de lo que haga el usuario 
            mensaje: '', //Mensaje a mostrar dependiendo de lo que haga el usuario 

            loading_modificar_datos: false, //Indica el estado al cargar la modificacion del emprendimiento
            refreshing_datos: false,//Indica el estado de actualizar toda la informacion del emprendimiento

            errorObtenerDatos: true,//Indiciar si hubo un error al obtener la informacion del emprendimiento
            loading_datos: false,//Indica cuando se esta cargando la informacion del emprendimiento

            DatosOriginales: [],//Lista con los detalles originales del emprendimiento

            nombre_emprendimiento: '',//Indica el nombre del emprendimiento
            descripcionEmprendimiento: '',//Indica la descripcion del emprendimiento
            select_calificacion: 'null',//Indica la calificacion del emprendimiento
            fotoPerfil: null,//Indica la URL de la imagen del emprendimiento
            nueva_imagen: [],//Lista con la informacion de la nueva imagen del emprendedor
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
            tipo_usuario: tipoUsuario
        }, () => {
            //Despues de actualizar el estado se llama a la funcion para obtener los datos del emprendimiento del usuario
            this.obtenerDatosDelEmpredimiento();
        });
    };


    //Funcion para obtener los datos del emprendimiento del usuario
    obtenerDatosDelEmpredimiento = async () => {
        try {
            const { tipo_usuario, id_usuario } = this.state;


            //Actualiza el estado para cargar la informacion del emprendimiento del usuario
            this.setState({ loading_datos: true });

            // Se llama a la función que tiene la API para obtener la información del emprendimiento del usuario
            const respuesta = await api_emprendedor.obtenerDatosPersonalesEmprendimiento(id_usuario, tipo_usuario);
            var datosUsuarioEmprendedor = respuesta.datosUsuarioEmprendedor;
            var uri_foto_perfil_bd = [];

            //Verifica si el usuario ya tiene una foto perfil agregado por el mismo 
            if (datosUsuarioEmprendedor.foto_perfil_nombre == null) {
                uri_foto_perfil_bd.push({ uri: config_define.urlUbicacionImagenPerfilPredeterminada });
            } else {
                uri_foto_perfil_bd.push({ uri: `${config_define.urlBase}/uploads/${datosUsuarioEmprendedor.id_usuario_emprendedor}/foto_perfil/${datosUsuarioEmprendedor.foto_perfil_nombre}` });
            }

            var descripcion = (datosUsuarioEmprendedor.descripcion == null ? '' : datosUsuarioEmprendedor.descripcion);

            // Actualiza los estados con los datos del emprendimiento del usaurio
            this.setState({
                nombre_emprendimiento: datosUsuarioEmprendedor.nombre_emprendimiento,
                descripcionEmprendimiento: descripcion,
                select_calificacion: datosUsuarioEmprendedor.calificacion_emprendedor,
                DatosOriginales: respuesta.datosUsuarioEmprendedor,
                fotoPerfil: uri_foto_perfil_bd,
                errorObtenerDatos: false,

            });
        } catch (error) {

            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensaje: error.message, tipoMensaje: 'danger', errorObtenerDatos: true,

            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            //Finaliza el estado de carga de los datos del emprendimiento del usuario y refresco de datos
            this.setState({ refreshing_datos: false, loading_datos: false });

        }
    };


    //Funcion para agregar imagenes 
    seleccionarImagen = async () => {

        // Solicita permisos para acceder a la galeria
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            // Si el permiso no es concedido muestra una alerta
            Alert.alert('Permiso necesario', 'Se necesita permiso para acceder a la galería.');
            return;
        }

        // Abre la biblioteca de imágenes del dispositivo para que el usuario seleccione las imagenes
        var result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // Permite seleccionar solo las imagenes
            allowsMultipleSelection: true,// Permite la selección múltiple
            allowsEditing: false,// No permite la edición de las imágenes seleccionadas
            selectionLimit: 1,// Límite de selección de 1 imagen
            quality: 1,// Calidad de las imagenes seleccionados
        });


        //Verifica si el usuario no cancelo la selección de imagenes
        if (!result.canceled) {

            // Verifica que la imagen seleccionada sea valida
            const imagenValida = validarArchivosFotoPerfil(result.assets);

            // Actualiza el estado con la imagen válida agregada
            if (imagenValida) {
                const source = { uri: result.assets[0].uri };
                this.setState({ fotoPerfil: source, nueva_imagen: result.assets });
            }
        }

    };


    //Funcion para restablecer los valores de los campos textinput con los datos originales del emprendedor
    restablecerCampos = async () => {
        const { DatosOriginales } = this.state;

        var uri_foto_perfil_bd = [];
        if (DatosOriginales.foto_perfil_nombre == null) {
            uri_foto_perfil_bd.push({ uri: config_define.urlUbicacionImagenPerfilPredeterminada });
        } else {
            uri_foto_perfil_bd.push({ uri: `${config_define.urlBase}/uploads/${DatosOriginales.id_usuario_emprendedor}/foto_perfil/${DatosOriginales.foto_perfil_nombre}` });
        }
        var descripcion = (DatosOriginales.descripcion == null ? '' : DatosOriginales.descripcion);
        this.setState({
            descripcionEmprendimiento: descripcion,
            fotoPerfil: uri_foto_perfil_bd,
            nueva_imagen: []
        });
    }


    //Funcion para modificar los datos del emprendimiento del usuario
    modifcarDatosEmprendimiento = async () => {

        try {

            const { tipo_usuario, id_usuario, descripcionEmprendimiento, nueva_imagen, DatosOriginales } = this.state;

            //Actualiza el estado para cargar el cambio en los datos del emprendimiento del usuario ademas de eliminar cualquier mensaje
            this.setState({ loading_modificar_datos: true, mensaje: '', tipoMensaje: '' });

            //Se llama a la funcion que tiene la API para modificar los datos del emprendimiento del usuario
            const respuesta = await api_emprendedor.modificarDatosEmprendimiento(id_usuario, tipo_usuario, descripcionEmprendimiento, nueva_imagen, DatosOriginales);


            //Actualiza el mensaje y tipo de mensaje a mostrar en la interfaz del usuario
            //Despues se llama a la funcion para obtener los datos actualizados del emprendimiento
            this.setState({
                mensaje: respuesta.mensaje, tipoMensaje: respuesta.estado, nueva_imagen: []
            }, () => {
                Alert.alert("Exito", respuesta.mensaje);
                this.obtenerDatosDelEmpredimiento();
            });

        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensaje: error.message, tipoMensaje: 'danger'
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {

            //Finaliza el estado de carga para modificar los datos del emprendimiento del usuario
            this.setState({ loading_modificar_datos: false });

        }
    };


    //Funcion para restablecer la informacion del emprendimiento del usuario
    onRefreshDatosPersonales = () => {
        //Establece el estado de refreshing_datos a true y elimina cualquier mensaje previo
        //Despues se llama a la funcion para obtener la informacion del emprendimiento del usuario
        this.setState({ refreshing_datos: true, nueva_imagen: [], mensaje: '', tipoMensaje: '' }, () => {
            this.obtenerDatosDelEmpredimiento();
        });
    };

    render() {
        const { errorObtenerDatos, nombre_emprendimiento, descripcionEmprendimiento, select_calificacion,
            loading_modificar_datos, refreshing_datos, fotoPerfil,
            mensaje, tipoMensaje, loading_datos } = this.state;
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
                <ScrollView
                    contentContainerStyle={{ padding: 10 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing_datos}// Estado que indica si el producto se está refrescando
                            onRefresh={this.onRefreshDatosPersonales}// Función que se llama cuando se realiza un gesto de refresco
                        />
                    }
                >
                    <View style={[styles.viewCard, { paddingBottom: 20 }]}>

                        {/*Verifica si hay un mensaje*/}
                        {mensaje && (
                            /*Se llama a la funcion para obtener un contenedor que muestra un mensaje segun las acciones que realice el usuario*/
                            mostrarMensaje(mensaje, tipoMensaje)
                        )}
                        {/*Verifica si se esta cargando los datos del emprendimento*/}
                        {loading_datos ? (
                            <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                        ) : (
                            //Verifica que no hubo problemas al obtener los datos del emprendimento para poder mostrar el formulario
                            !errorObtenerDatos && (
                                <ScrollView >

                                    {/*Componente View que contiene un Image con la foto del perfil del emprendedor*/}
                                    <View style={{ width: "100%", height: 200, alignItems: "center", borderColor: "#cec8c8", borderWidth: 1 }}>
                                        <Image
                                            style={{ width: "100%", height: "100%" }}
                                            resizeMode="contain"
                                            source={fotoPerfil}
                                        />
                                    </View>

                                    {/*Componente View que contiene un TouchableOpacity para cambiar la foto del perfil del emprendedor*/}
                                    <View style={{ marginBottom: 20, marginTop: 10 }}>
                                        <TouchableOpacity
                                            style={[styles.boton, styles.botonConfirmacion, loading_modificar_datos && styles.botonDesactivado]}
                                            onPress={this.seleccionarImagen}
                                            disabled={loading_modificar_datos}
                                        >
                                            <Text style={[styles.textoBoton, styles.textoConfirmacion]}>Cambiar foto de perfil</Text>
                                        </TouchableOpacity>
                                    </View>


                                    {/*Componente View que contiene un TextInput con el nombre del emprendimiento*/}
                                    <View style={{ marginBottom: 20 }}>
                                        <TextInput
                                            label="Nombre del emprendimiento"
                                            value={nombre_emprendimiento}
                                            disabled={true}
                                            onChangeText={(text) => this.setState({ nombre_emprendimiento: text })}
                                            maxLength={20}
                                            style={styles.input_paper}
                                            theme={theme}
                                        />
                                    </View>


                                    {/*Componente View que contiene un RNPickerSelect para selecionar la calificacion del emprendedor*/}
                                    <View style={{ marginBottom: 20 }}>
                                        <Text style={{ marginStart: 10, color: 'gray' }}>Calificacion del emprendedor</Text>
                                        <View style={{ borderWidth: 1, borderRadius: 5, borderColor: '#dee2e6' }}>
                                            <RNPickerSelect
                                                value={select_calificacion}
                                                disabled={true}
                                                onValueChange={() => { }}
                                                placeholder={{}}
                                                style={{ inputAndroid: styles.inputBusqueda }}
                                                items={[
                                                    { label: 'Sin calificacion', value: 'null' },
                                                    { label: '1', value: '1' },
                                                    { label: '2', value: '2' },
                                                    { label: '3', value: '3' },
                                                    { label: '4', value: '4' },
                                                    { label: '5', value: '5' },
                                                ]}
                                            />
                                        </View>
                                    </View>


                                    {/*Componente View que contiene un TextInput con la descripcion del emprendimiento*/}
                                    <View style={{ marginBottom: 20 }}>
                                        <TextInput
                                            label="Descripcion del emprendimiento"
                                            maxLength={150}
                                            multiline
                                            numberOfLines={5}
                                            style={styles.input_paper}
                                            theme={theme}
                                            disabled={loading_modificar_datos}
                                            value={descripcionEmprendimiento}
                                            onChangeText={(text) => this.setState({ descripcionEmprendimiento: text })}
                                        />
                                        <Text style={[styles.text_contador, { marginStart: 10 }]}>
                                            Máximo 150 caracteres. {150 - descripcionEmprendimiento.length} restantes
                                        </Text>
                                    </View>


                                    {/* Componente View que contiene dos TouchableOpacity uno guardar los cambios hechos y otro para restablecer los datos originales del empredimiento */}
                                    <View style={{ flexDirection: 'row', alignSelf: 'center' }}>

                                        {/*Componente TouchableOpacity para restablecer los datos del empredimiento  */}
                                        <TouchableOpacity
                                            style={[styles.boton, styles.botonInfo, loading_modificar_datos && styles.botonDesactivado]}
                                            onPress={this.restablecerCampos}
                                            disabled={loading_modificar_datos}
                                        >
                                            <Text style={[styles.textoBoton, styles.textoInfo]}>Restablecer campos</Text>
                                        </TouchableOpacity>

                                        {/*Componente TouchableOpacity guardar los cambios hechos en los datos del emprendimiento del usuario  */}
                                        <TouchableOpacity
                                            style={[styles.boton, styles.botonConfirmacion, loading_modificar_datos && styles.botonDesactivado]}
                                            onPress={this.modifcarDatosEmprendimiento}
                                            disabled={loading_modificar_datos}
                                        >
                                            <Text style={[styles.textoBoton, styles.textoConfirmacion]}>Guardar cambios</Text>
                                            {loading_modificar_datos &&
                                                <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                                            }
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            )
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}