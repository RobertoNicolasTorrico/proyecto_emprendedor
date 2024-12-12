import React, { Component } from 'react';

//Componentes utilizados en React Native
import { SafeAreaView, Text, ScrollView, View, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { TextInput } from 'react-native-paper';

//Biblioteca para almacenamiento asincrono de datos
import AsyncStorage from '@react-native-async-storage/async-storage';

//Archivo de estilos
import { styles } from '../../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { mostrarMensaje } from '../../../config/funciones.js';

//Módulo para realizar consultas a las APIs relacionadas
import api_usuario from '../../../config/consultas_api/api_usuario.js';

export class ScreenCambiarPassword extends Component {

    constructor(props) {
        super(props);
        this.state = {

            //Identificador del usuario actual
            id_usuario: null,
            tipo_usuario: null,

            tipoMensaje: '', //Tipo de mensaje a mostrar dependiendo de lo que haga el usuario 
            mensaje: '', //Mensaje a mostrar dependiendo de lo que haga el usuario 

            refreshing_datos: false,//Indica el estado de actualizar todos los campos del cambio de la contraseña del usuario
            loading_modificar_password: false,//Indica el estado al cargar  el cambio de la contraseña del usuario

            passwordActual: '',//Indica la contraseña actual del usuario
            showPasswordActual: false,//Indica si se va a mostrar la contraseña actual del usuario en la interfaz

            nuevaPassword: '',//Indica la nueva contraseña del usuario
            showNuevaPassword: false,//Indica si se va a mostrar la nueva contraseña del usuario en la interfaz

            confirmarPassword: '',//Indica la confirmacion de la contraseña
            showConfirmPassword: false,//Indica si se va a mostrar la confirmacion de la nueva contraseña del usuario en la interfaz

        };
    }


    //Metodo llamado cuando el componente se monta
    async componentDidMount() {
        //Se obtienen los datos de sesion almacenados en AsyncStorage
        const idUsuario = await AsyncStorage.getItem('idUsuario');
        const tipoUsuario = await AsyncStorage.getItem('tipoUsuario');

        //Se actualiza el estado con los datos de sesion
        this.setState({ id_usuario: idUsuario, tipo_usuario: tipoUsuario });
    };


    //Funcion para alternar el estado de mostrar la contraseña depediendo cual se halla elegido
    alternarMostrarPassword = (campo) => {
        this.setState((prevState) => ({
            [campo]: !prevState[campo],
        }));
    };


    //Funcion para modificar la contraseña del usuario
    modificarPasswordUsuario = async () => {
        try {
            const { id_usuario, tipo_usuario, passwordActual, nuevaPassword, confirmarPassword } = this.state;

            //Actualiza el estado para cargar el cambio de contraseña ademas de restablecer los valores del mensaje y tipo de mensaje
            this.setState({ loading_modificar_password: true, mensaje: '', tipoMensaje: '' });

            //Se llama a la funcion que tiene la API para modificar la contraseña del usuario
            const respuesta = await api_usuario.modificarPasswordDelUsuario(id_usuario, tipo_usuario, passwordActual, nuevaPassword, confirmarPassword);

            //Actualiza el mensaje y tipo de mensaje a mostrar en la interfaz del usuario
            //Despues se llama a la funcion para restablecer los valores de los campos 
            this.setState({ mensaje: respuesta.mensaje, tipoMensaje: respuesta.estado }, () => {
                Alert.alert("Exito", respuesta.mensaje);
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
            //Finaliza el estado de carga del cambio de contraseña
            this.setState({ loading_modificar_password: false });
        }
    };



    //Funcion para restablecer la informacion de los campos
    onRefreshDatosPassword = () => {
        //Establece el estado de refreshing_datos a true y elimina cualquier mensaje previo
        //Despues se llama a la funcion para el contenido de todos los campos
        this.setState({ refreshing_datos: true, mensaje: '', tipoMensaje: '' }, () => {
            this.limpiarCampos();
        });
    };

    //Funcion para restablecer los valores de todos los campos
    limpiarCampos() {
        this.setState({
            passwordActual: '', showPasswordActual: false,
            nuevaPassword: '', showNuevaPassword: false,
            confirmarPassword: '', showConfirmPassword: false,
            refreshing_datos: false
        });
    };



    render() {
        const { passwordActual, showPasswordActual, nuevaPassword, showNuevaPassword, confirmarPassword, showConfirmPassword, loading_modificar_password, refreshing_datos, mensaje, tipoMensaje } = this.state;
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
                    contentContainerStyle={{ padding: 20, flex: 1 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing_datos}// Estado que indica si la lista se está refrescando
                            onRefresh={this.onRefreshDatosPassword}// Función que se llama cuando se realiza un gesto de refresco
                        />
                    }
                >
                    <View style={[styles.viewCard, { paddingBottom: 20 }]}>

                        {/*Verifica si hay un mensaje*/}
                        {mensaje && (
                            /*Se llama a la funcion para obtener un contenedor que muestra un mensaje segun las acciones que realice el usuario*/
                            mostrarMensaje(mensaje, tipoMensaje)
                        )}

                        {/*Componente View que contiene un TextInput para agregar la contraseña actual de usuario*/}
                        <View style={{ marginBottom: 20 }}>

                            <TextInput
                                label="Contraseña actual"
                                disabled={loading_modificar_password}
                                secureTextEntry={!showPasswordActual}
                                value={passwordActual}
                                maxLength={60}
                                size={20}
                                right={<TextInput.Icon icon={showPasswordActual ? 'eye-off-outline' : 'eye-outline'} size={30} onPress={() => this.alternarMostrarPassword('showPasswordActual')} />}
                                onChangeText={(text) => this.setState({ passwordActual: text })}
                                style={styles.input_paper}
                                theme={theme}
                            />
                        </View>


                        {/*Componente View que contiene un TextInput para agregar la nueva contraseña del usuario*/}
                        <View style={{ marginBottom: 20 }}>
                            <TextInput
                                label="Nueva contraseña"
                                disabled={loading_modificar_password}
                                secureTextEntry={!showNuevaPassword}
                                value={nuevaPassword}
                                maxLength={60}
                                size={20}
                                right={<TextInput.Icon icon={showNuevaPassword ? 'eye-off-outline' : 'eye-outline'} size={30} onPress={() => this.alternarMostrarPassword('showNuevaPassword')} />}
                                onChangeText={(text) => this.setState({ nuevaPassword: text })}
                                style={styles.input_paper}
                                theme={theme}
                            />
                            <Text style={styles.text_contador}>La nueva contraseña debe tener minimo 6 caracteres</Text>
                        </View>

                        {/*Componente View que contiene un TextInput para agregar la confirmacion de la nueva contraseña del usuario*/}
                        <View style={{ marginBottom: 20 }}>
                            <TextInput
                                label="Confirmar nueva contraseña"
                                disabled={loading_modificar_password}
                                secureTextEntry={!showConfirmPassword}
                                value={confirmarPassword}
                                maxLength={60}
                                size={20}
                                right={<TextInput.Icon icon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={30} onPress={() => this.alternarMostrarPassword('showConfirmPassword')} />}
                                onChangeText={(text) => this.setState({ confirmarPassword: text })}
                                style={styles.input_paper}
                                theme={theme}
                            />
                        </View>

                        {/*Componente View que contiene un TouchableOpacity para cambiar la contraseña del usuario */}
                        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                            <TouchableOpacity
                                style={[styles.boton, styles.botonConfirmacion, loading_modificar_password && styles.botonDesactivado]}
                                onPress={this.modificarPasswordUsuario}
                                disabled={loading_modificar_password}
                            >
                                {loading_modificar_password && (
                                    <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                                )}
                                <Text style={[styles.textoBoton, styles.textoConfirmacion]}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

}