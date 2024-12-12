import React, { Component } from 'react';

//Componentes utilizados en React Native
import { TouchableOpacity, SafeAreaView, Text, View, Alert, ActivityIndicator } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { TextInput } from 'react-native-paper';

//Biblioteca para almacenamiento asincrono de datos
import AsyncStorage from '@react-native-async-storage/async-storage';

//Archivo de estilos
import { styles } from '../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { mostrarMensaje } from '../../config/funciones.js';

//Módulo para realizar consultas a las APIs relacionadas
import api_usuario from '../../config/consultas_api/api_usuario.js';

export class ScreenIniciarSesion extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: "",//Indica el email del usuario
      showPassword: false,//Indica si se va a mostrar la contraseña del usuario en la interfaz
      password: '',//Indica la contraseña  del usuario
      loading_iniciar: false,//Indica el estado al cargar el inicio de sesion
      mensaje: '', //Mensaje a mostrar dependiendo de lo que haga el usuario 
    };
  }

  //Funcion para iniciar sesion en la cuenta del usuario
  iniciarSesion = async (email, password) => {

    try {

      // Actualiza el estado para eliminar cualquier mensaje previo y establece el estado de carga
      this.setState({ loading_iniciar: true, mensaje: ''});


      //Se llama a la funcion que tiene la API para iniciar sesion
      const respuesta = await api_usuario.loginUsuario(email, password);
      var usuario = respuesta.usuario;
      var id_usuario = usuario.id_usuario.toString();
      var id_tipo_usuario = usuario.id_tipo_usuario.toString();

      // Guarda el ID del usuario y el tipo de usuario en AsyncStorage
      await AsyncStorage.setItem('idUsuario', id_usuario);
      await AsyncStorage.setItem('tipoUsuario', id_tipo_usuario);
      var drawerNavigation = "DrawerNavigatorGeneral";


      // Configura la navegación condicional según el tipo de usuario
      if (id_tipo_usuario == "1") {
        drawerNavigation = "DrawerNavigatorUsuarioComun";
      } else {
        if (id_tipo_usuario == "2") {
          var id_usuario_emprendedor = usuario.id_usuario_emprendedor.toString();
          var nombre_emprendimiento = usuario.nombre_emprendimiento.toString();

          // Guarda datos adicionales relacionados con el emprendedor en AsyncStorage
          await AsyncStorage.setItem('idUsuarioEmprendedor', id_usuario_emprendedor);
          await AsyncStorage.setItem('nombreEmprendimiento', nombre_emprendimiento);
          drawerNavigation = "DrawerNavigatorUsuarioEmprendedor";
        }
      }

      // Reiniciar la navegación y redirige al usuario a DrawerNavigator segun el tipo de usuario
      this.props.navigation.dispatch(
        CommonActions.reset({
          index: 0, // Establecer el índice inicial de la pila de navegación en 0
          routes: [{ name: drawerNavigation }], // Redirige a la pantalla DrawerNavigator segun el tipo de usuario
        })
      );

    } catch (error) {

      //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
      this.setState({
        mensaje: error.message
      }, () => {
        Alert.alert('Aviso', error.message);
      });

    } finally {
      //Finaliza el estado de carga 
      this.setState({ loading_iniciar: false });
    }

  };

  //Funcion para alternar el estado de mostrar la contraseña
  alternarMostrarPassword = () => {
    this.setState((prevState) => ({
      showPassword: !prevState.showPassword,
    }));
  };

  render() {
    const { showPassword, password, loading_iniciar, email, mensaje } = this.state;
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
        <View style={styles.container}>
          <View style={styles.viewCard}>
            {/* Mostrar mensaje de error si está presente en el estado */}
            {mensaje && (
              mostrarMensaje(mensaje, 'danger')
            )}


            {/*Componente View que contiene dos TextInput uno para el email del usuario y otro para la contraseña del usuario*/}
            <View style={{ marginBottom: 10 }}>

              {/*Componente TextInput que contiene el email del usuario*/}
              <TextInput
                label="Email"
                value={email}
                maxLength={320}
                keyboardType='email-address'
                onChangeText={(text) => this.setState({ email: text })}
                style={styles.input_paper}
                theme={theme}
                disabled={loading_iniciar}//Desactiva el TextInput cuando se llama a la funcion para iniciar sesion
              />

              {/*Componente TextInput que contiene la contraseña del usuario*/}
              <TextInput
                label="Contraseña"
                disabled={loading_iniciar}//Desactiva el TextInput cuando se llama a la funcion para iniciar sesion
                secureTextEntry={!showPassword}
                maxLength={60}
                value={password}
                right={<TextInput.Icon icon={showPassword ? 'eye-off-outline' : 'eye-outline'} size={30} onPress={this.alternarMostrarPassword} />}
                onChangeText={(text) => this.setState({ password: text })}
                theme={theme}
                style={styles.input_paper}
              />


            </View>


            {/*Componente View que contiene tres TouchableOpacity uno para navegar al registro del usuario, para recuperar la contraseña y para ingresar a la cuenta del usuario */}
            <View style={{ alignItems: 'center' }}>


              {/*Componente TouchableOpacity para iniciar sesion en la cuenta del usuario */}
              <TouchableOpacity
                onPress={() => this.iniciarSesion(email, password)}
                style={[styles.boton, loading_iniciar && styles.botonDesactivado]}
                disabled={loading_iniciar}//Desactiva el boton cuando se llama a la funcion para iniciar sesion
              >
                {loading_iniciar && (
                  <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                )}
                <Text style={styles.textoBoton}>Ingresar</Text>
              </TouchableOpacity>

              {/*Componente TouchableOpacity para navegar a los registros del usuario */}
              <TouchableOpacity style={{ marginBottom: 10, marginTop: 10 }}
                onPress={() => this.props.navigation.navigate("Registrarse")}
                disabled={loading_iniciar}//Desactiva el boton cuando se llama a la funcion para iniciar sesion
              >
                <Text style={styles.enlace}>¿No tenés cuenta? Crear cuenta</Text>
              </TouchableOpacity>


              {/*Componente TouchableOpacity para navegar la ventana para recuperar la contraseña */}
              <TouchableOpacity style={{ marginBottom: 10 }}
                onPress={() => { this.props.navigation.navigate("ScreenRecuperarPassword") }}
                disabled={loading_iniciar}//Desactiva el boton cuando se llama a la funcion para iniciar sesion
              >
                <Text style={styles.enlace}>¿Olvidaste tu Contraseña?</Text>
              </TouchableOpacity>


              {/*Componente TouchableOpacity para navegar la ventana para enviar email de activacion */}
              <TouchableOpacity
                onPress={() => { this.props.navigation.navigate("ScreenEnviarEmailActivacion") }}
                disabled={loading_iniciar}//Desactiva el boton cuando se llama a la funcion para iniciar sesion
              >
                <Text style={styles.enlace}>¿No recibiste tu correo de activación o tu cuenta está desactivada?</Text>
              </TouchableOpacity>

            </View>
          </View >
        </View >
      </SafeAreaView >
    );
  }
}
