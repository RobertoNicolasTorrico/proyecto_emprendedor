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


export class ScreenRecuperarPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',//Indica el email del usuario
      loading_enviar_email: false,//Indica el estado al cargar el envio del email de usuario
      tipoMensaje: '', //Tipo de mensaje a mostrar dependiendo de lo que haga el usuario 
      mensaje: '', //Mensaje a mostrar dependiendo de lo que haga el usuario 

    };
  }

  //Funcion para enviar un email para crear una nueva contraseña del usuario
  enviarEmailRecuperacionPassword = async () => {
    try {
      const { email } = this.state;

      //Actualiza el estado para cargar el envio del email ademas de eliminar cualquier mensaje previo
      this.setState({ loading_enviar_email: true, mensaje: '', tipoMensaje: '' });

      //Se llama a la funcion que tiene la API para enviar el email de recuperacion de la contraseña del usuario
      const respuesta = await api_usuario.recuperarPasswordUsuario(email);

      //Actualiza el mensaje y tipo de mensaje a mostrar en la interfaz del usuario ademas eliminar el contenido del TextInput del email
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
      //Finaliza el estado de carga para enviar el email para cambiar la contraseña del usuario
      this.setState({ loading_enviar_email: false });
    }
  };

  render() {
    const { loading_enviar_email, email, mensaje, tipoMensaje } = this.state;
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
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={styles.viewCard}>
            <Text style={styles.textTitulo}>Enviar email de recuperar contraseña</Text>


            {/*Verifica si hay un mensaje*/}
            {mensaje && (
              /*Se llama a la funcion para obtener un contenedor que muestra un mensaje segun las acciones que realice el usuario*/
              mostrarMensaje(mensaje, tipoMensaje)
            )}

            <Text style={styles.texto_mensaje}>Por favor, ingrese el correo electrónico con el que está registrado para enviarle los pasos necesarios para crear una nueva contraseña.</Text>

            {/*Componente View que contiene un TextInput con el email del usuario*/}
            <View style={{ marginBottom: 20 }}>
              <TextInput
                label="Email"
                value={email}
                maxLength={320}
                keyboardType='email-address'
                onChangeText={(text) => this.setState({ email: text })}
                style={styles.input_paper}
                theme={theme}
                disabled={loading_enviar_email}
              />
            </View>

            {/*Componente View que contiene un TouchableOpacity para enviar un email al usuario para recuperar su contraseña*/}
            <View style={{ alignItems: 'center' }}>

              <TouchableOpacity
                onPress={() => this.enviarEmailRecuperacionPassword()}
                style={[styles.boton, loading_enviar_email && styles.botonDesactivado]}
                disabled={loading_enviar_email}
              >
                <Text style={styles.textoBoton}>Enviar</Text>
                {loading_enviar_email &&
                  <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                }
              </TouchableOpacity>
            </View>
          </View >
        </ScrollView>
      </SafeAreaView >
    );
  }

}