import React, { Component } from 'react';

//Componentes utilizados en React Native
import { Alert, SafeAreaView, ScrollView, TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-paper';

//Archivo de estilos
import { styles } from '../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { mostrarMensaje } from '../../config/funciones.js';

//Módulo para realizar consultas a las APIs relacionadas
import api_usuario from '../../config/consultas_api/api_usuario.js';


export class ScreenEnviarEmailActivacion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",//Indica el email del usuario
            mensaje: '', //Mensaje a mostrar dependiendo de lo que haga el usuario 
            tipoMensaje: "",//Mensaje a mostrar dependiendo de lo que haga el usuario 
            loading_activar: false,//Indica el estado al cargar el envio del email de activacion del usuario
        };
    }

    //Funcion para enviar un email al usuario para que pueda activar su cuenta
    enviarEmailActivacionCuenta = async (email) => {
        try {
            //Actualiza el estado para enviar el email para evitar errores cuando se este llamando a la API ademas de eliminar cualquier mensaje previo
            this.setState({ loading_activar: true, mensaje: '', tipoMensaje: '' });


            //Se llama a la funcion que tiene la API para enviar un email a la cuenta del usuario
            const respuesta = await api_usuario.volverEnviarEmailActivacion(email);

            //Actualiza el estado del mensaje a mostrar en la interfaz ademas de eliminar el contenido del campo email
            this.setState({
                mensaje: respuesta.mensaje, tipoMensaje: respuesta.estado, email: ''
            }, () => {
                Alert.alert('Exito', respuesta.mensaje);
            });
        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensaje: error.message, tipoMensaje: 'danger'
            }, () => {
                Alert.alert('Aviso', error.message);
            });
        } finally {
            //Finaliza el estado de carga
            this.setState({ loading_activar: false });
        }
    };


    render() {
        const { loading_activar, email, mensaje, tipoMensaje, refreshing } = this.state;
        const theme = {
            colors: {
                text: 'black',
                placeholder: 'gray',
                primary: 'gray'
            },

        };
        return (
            <SafeAreaView style={styles.safeArea}>
                {/*Contenedor principal */}
                <View style={styles.container}>
                    <View style={styles.viewCard}>
                        <Text style={styles.textTitulo}>Enviar email de activacion</Text>

                        {/*Verifica si hay un mensaje*/}
                        {mensaje && (
                            /*Se llama a la funcion para obtener un contenedor que muestra un mensaje segun las acciones que realice el usuario*/
                            mostrarMensaje(mensaje, tipoMensaje)
                        )}

                        <Text style={styles.texto_mensaje}>Por favor, ingrese el correo electronico con el que esta registrado para enviarle los pasos necesarios para activar su cuenta.</Text>
                        {/*Componente View que contiene un TextInput para ingresar el email del usuario*/}
                        <View style={{ marginBottom: 20 }}>
                            <TextInput
                                label="Email"
                                value={email}
                                maxLength={320}
                                keyboardType='email-address'
                                onChangeText={(text) => this.setState({ email: text })}
                                style={styles.input_paper}
                                theme={theme}
                                disabled={loading_activar}//Desactiva el TextInput cuando se llama a la funcion para enviar el email de activacion
                            />
                        </View>

                        <View style={{ alignItems: 'center' }}>
                            {/*Componente TouchableOpacity para llamar la funcion para enviar el email de activacion de la cuenta */}
                            <TouchableOpacity onPress={() => this.enviarEmailActivacionCuenta(email)}
                                style={[styles.boton, loading_activar && styles.botonDesactivado]}
                                disabled={loading_activar}//Desactiva el boton cuando se llama a la funcion para enviar el email de activacion
                            >
                                {loading_activar && (
                                    <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                                )}
                                <Text style={styles.textoBoton}>Enviar</Text>
                            </TouchableOpacity>

                        </View>
                    </View >
                </View>
            </SafeAreaView >
        );
    }
}