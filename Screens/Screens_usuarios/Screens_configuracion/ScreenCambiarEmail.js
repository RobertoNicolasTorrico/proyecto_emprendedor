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


export class ScreenCambiarEmail extends Component {

    constructor(props) {
        super(props);
        this.state = {

            //Identificador del usuario actual
            id_usuario: null,
            tipo_usuario: null,

            email_nuevo: '',//Indica el nuevo email del usuario
            confirmar_password: '',//Indica la contraseña actual del usuario
            showConfirmPassword: false, //Indica si se va a mostrar la contraseña del usuario en la interfaz

            refreshing_datos: false,//Indica el estado de actualizar todos los campos del cambio del email
            loading_enviar_email: false,//Indica el estado al cargar el envio del email a la cuenta del usuario

            tipoMensaje: '', //Tipo de mensaje a mostrar dependiendo de lo que haga el usuario 
            mensaje: '', //Mensaje a mostrar dependiendo de lo que haga el usuario 

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


    //Funcion para alternar el estado de mostrar la contraseña
    alternarMostrarConfirmarPassword = () => {
        this.setState((prevState) => ({
            showConfirmPassword: !prevState.showConfirmPassword,
        }));
    };


    //Funcion para enviar un correo electronico al nuevo email del usuario
    modificarEmailUsuario = async () => {
        const { id_usuario, tipo_usuario, email_nuevo, confirmar_password } = this.state;

        try {

            //Actualiza el estado para cargar el envio del email ademas de restablecer los valores del mensaje y tipo de mensaje
            this.setState({ loading_enviar_email: true, mensaje: '', tipoMensaje: '' });

            //Se llama a la funcion que tiene la API para modificar el email del usuario
            const respuesta = await api_usuario.modificarEmailDelUsuario(id_usuario, tipo_usuario, email_nuevo, confirmar_password);

            //Actualiza el mensaje y tipo de mensaje a mostrar en la interfaz del usuario
            //Despues se llama a la funcion para restablecer los valores de los campos 
            this.setState({
                mensaje: respuesta.mensaje, tipoMensaje: respuesta.estado
            }, () => {
                this.limpiarCampos();
                Alert.alert("Exito", respuesta.mensaje);
            });
        } catch (error) {

            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensaje: error.message, tipoMensaje: 'danger'
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            //Finaliza el estado de carga del envio del email
            this.setState({ loading_enviar_email: false });

        }
    };


    //Funcion para restablecer la informacion de los campos
    onRefreshDatosEmail = () => {
        //Establece el estado de refreshing_datos a true y elimina cualquier mensaje previo
        //Despues se llama a la funcion para el contenido de todos los campos
        this.setState({ refreshing_datos: true, mensaje: '', tipoMensaje: '' }, () => {
            this.limpiarCampos();
        });
    };

    //Funcion para restablecer los valores de todos los campos
    limpiarCampos() {
        this.setState({
            showConfirmPassword: false,
            email_nuevo: '',
            confirmar_password: '',
            refreshing_datos: false
        });
    }

    render() {

        const { showConfirmPassword, confirmar_password, loading_enviar_email, refreshing_datos, mensaje, tipoMensaje, email_nuevo } = this.state;
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
                        <RefreshControl refreshing={refreshing_datos}
                            onRefresh={this.onRefreshDatosEmail} />
                    }
                >
                    <View style={[styles.viewCard, { paddingBottom: 20 }]}>
                        {/*Verifica si hay un mensaje*/}
                        {mensaje && (
                            /*Se llama a la funcion para obtener un contenedor que muestra un mensaje segun las acciones que realice el usuario*/
                            mostrarMensaje(mensaje, tipoMensaje)
                        )}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={styles.tamanio_texto}>Para hacer un cambio de E-mail se le enviara un correo electrónico al nuevo E-mail ingresado para verificar la validez y tu acceso al mismo.</Text>
                        </View>


                        {/*Componente View que contiene un TextInput para agregar el nuevo email del usuario*/}
                        <View style={{ marginBottom: 20 }}>
                            <TextInput
                                label="Nuevo Email"
                                maxLength={320}
                                disabled={loading_enviar_email}//Desactiva el boton cuando se llama a la funcion para enviar el email al usuario
                                keyboardType='email-address'
                                style={styles.input_paper}
                                theme={theme}
                                value={email_nuevo}
                                onChangeText={(text) => this.setState({ email_nuevo: text })}
                            />
                        </View>

                        {/*Componente View que contiene un TextInput para agregar la contraseña para confirmar el cambio del email*/}
                        <View style={{ marginBottom: 20, marginTop: 20 }}>
                            <TextInput
                                label="Contraseña para confirmar"
                                disabled={loading_enviar_email}//Desactiva el boton cuando se llama a la funcion para enviar el email al usuario
                                secureTextEntry={!showConfirmPassword}
                                value={confirmar_password}
                                maxLength={60}
                                size={20}
                                right={<TextInput.Icon icon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={30} onPress={this.alternarMostrarConfirmarPassword} />}
                                onChangeText={(text) => this.setState({ confirmar_password: text })}
                                style={styles.input_paper}
                                theme={theme}
                            />
                        </View>

                        {/*Componente View que contiene un TouchableOpacity para enviar el correo electronico al nuevo email del usuario */}
                        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                            <TouchableOpacity
                                style={[styles.boton, styles.botonConfirmacion, loading_enviar_email ? styles.botonDesactivado : null]}
                                onPress={this.modificarEmailUsuario}
                                disabled={loading_enviar_email}//Desactiva el boton cuando se llama a la funcion para enviar el email al usuario
                            >
                                {loading_enviar_email && (
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