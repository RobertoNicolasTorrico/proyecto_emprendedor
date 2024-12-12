import React, { Component } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importa los componentes necesarios para las pantallas del Stack


//Drawer general para los usuarios que no iniciaron sesion
import { DrawerNavigatorGeneral } from './Navigators/DrawerNavigatorGeneral';

//Drawer para usuarios emprendedores 
import { DrawerNavigatorUsuarioEmprendedor } from './Navigators/DrawerNavigatorUsuarioEmprendedor';

//Drawer para usuarios comunes 
import { DrawerNavigatorUsuarioComun } from './Navigators/DrawerNavigatorUsuarioComun';


//Screens generales
import { ScreenVerUbicacion } from './Screens/Screens_generales/ScreenVerUbicacion';
import { ScreenPerfilEmprendedor } from './Screens/Screens_usuarios/Screens_usuario_emprendedor/ScreenPerfilEmprendedor';
import { ScreenDetallesProducto } from './Screens/Screens_generales/ScreenDetallesProducto';
import { ScreenRecuperarPassword } from './Screens/Screens_generales/ScreenRecuperarPassword';
import { ScreenIniciarSesion } from './Screens/Screens_generales/ScreenIniciarSesion';
import { ScreenRegistrarse } from './Screens/Screens_generales/ScreenRegistrarse';
import { ScreenEnviarEmailActivacion } from './Screens/Screens_generales/ScreenEnviarEmailActivacion';

//Screens que usan todos los usuarios
import { ScreenDatosPersonales } from './Screens/Screens_usuarios/Screens_configuracion/ScreenDatosPersonales';
import { ScreenCambiarEmail } from './Screens/Screens_usuarios/Screens_configuracion/ScreenCambiarEmail';
import { ScreenCambiarPassword } from './Screens/Screens_usuarios/Screens_configuracion/ScreenCambiarPassword';
import { ScreenNotificaciones } from './Screens/Screens_usuarios/ScreenNotificaciones';

//Screens que solo pueden usar los usuarios emprendedores
import { ScreenNuevoProducto } from './Screens/Screens_usuarios/Screens_usuario_emprendedor/Productos/ScreenNuevoProducto';
import { ScreenModificarProducto } from './Screens/Screens_usuarios/Screens_usuario_emprendedor/Productos/ScreenModificarProducto';
import { ScreenNuevaPublicacion } from './Screens/Screens_usuarios/Screens_usuario_emprendedor/Publicaciones/ScreenNuevaPublicacion';
import { ScreenModificarPublicacion } from './Screens/Screens_usuarios/Screens_usuario_emprendedor/Publicaciones/ScreenModificarPublicacion';
import { ScreenDatosEmprendimiento } from './Screens/Screens_usuarios/Screens_configuracion/ScreenDatosEmprendimiento';


//Ubicacion de las funciones donde estan las llamadas a las api
import api_usuario from './config/consultas_api/api_usuario';


const Stack = createStackNavigator();

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      //Estado para determinar la pantalla de inicio del Drawer
      DrawerNavigator: null,
    };
  }


  //Metodo llamado cuando el componente se monta
  async componentDidMount() {
    var tipoDrawer = 'DrawerNavigatorGeneral';

    try {
      //Se obtiene los valores almacenados en el AsynStorage
      const idUsuario = await AsyncStorage.getItem('idUsuario');
      const tipoUsuario = await AsyncStorage.getItem('tipoUsuario');
      // Verifica si hay una sesión activa en AsyncStorage
      if (idUsuario != null && tipoUsuario != null) {

        //Verifica si el usuario es valido
        var respuesta = await api_usuario.verificarSiEsUsuarioValido(idUsuario, tipoUsuario);
        if (respuesta.usuario) {

          // Asignar el tipo de drawer según el tipo de usuario
          if (tipoUsuario == 1) {
            tipoDrawer = "DrawerNavigatorUsuarioComun";
          } else {
            if (tipoUsuario == 2) {
              tipoDrawer = "DrawerNavigatorUsuarioEmprendedor";
            }
          }
        } else {
          // Mostrar un alert si el usuario no es valido
          Alert.alert("Aviso", "La cuenta del usuario ya no es valida debido a que la cuenta no esta activada o esta baneada");

          // Se elimina los datos de sesion que quedaron
          await AsyncStorage.removeItem('idUsuario');
          await AsyncStorage.removeItem('tipoUsuario');
        }
      }
    } catch (error) {
      // Se elimina los datos de sesion que quedaron
      await AsyncStorage.removeItem('idUsuario');
      await AsyncStorage.removeItem('tipoUsuario');

      // Mostrar un alert en caso de error
      Alert.alert("Aviso", error.message);
    } finally {
      this.setState({
        DrawerNavigator: tipoDrawer
      });
    }
  }


  render() {
    const { DrawerNavigator } = this.state;
    //No se va a renderizar nada mientras que se determine el drawer
    if (!DrawerNavigator) {
      return null;
    }
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName={DrawerNavigator} >

          {/*Drawer general para los usuarios que no iniciaron sesion*/}
          <Stack.Screen name="DrawerNavigatorGeneral" component={DrawerNavigatorGeneral} options={{ headerShown: false }} />

          {/*Drawer para usuarios emprendedores*/}
          <Stack.Screen name="DrawerNavigatorUsuarioEmprendedor" component={DrawerNavigatorUsuarioEmprendedor} options={{ headerShown: false }} />

          {/*Drawer para usuarios comunes*/}
          <Stack.Screen name="DrawerNavigatorUsuarioComun" component={DrawerNavigatorUsuarioComun} options={{ headerShown: false }} />

          {/*Screens generales*/}
          <Stack.Screen name="VerUbicacion" component={ScreenVerUbicacion} options={{ title: "Ver Ubicacion" }} />
          <Stack.Screen name="PerfilEmprendedor" component={ScreenPerfilEmprendedor} options={{ title: "" }} />
          <Stack.Screen name="DetallesProducto" component={ScreenDetallesProducto} options={{ title: "Detalles del producto" }} />
          <Stack.Screen name="ScreenRecuperarPassword" component={ScreenRecuperarPassword} options={{ title: 'Recuperar contraseña' }} />
          <Stack.Screen name="IniciarSesion" component={ScreenIniciarSesion} />
          <Stack.Screen name="Registrarse" component={ScreenRegistrarse} options={{ title: 'Crear Cuenta' }} />
          <Stack.Screen name="ScreenEnviarEmailActivacion" component={ScreenEnviarEmailActivacion} options={{ title: 'Activar Cuenta' }} />

          {/*Screens que usan todos los usuarios*/}
          <Stack.Screen name="ScreenDatosPersonales" component={ScreenDatosPersonales} options={{ title: 'Datos Personales' }} />
          <Stack.Screen name="ScreenCambiarEmail" component={ScreenCambiarEmail} options={{ title: 'Cambiar email' }} />
          <Stack.Screen name="ScreenCambiarPassword" component={ScreenCambiarPassword} options={{ title: 'Cambiar contraseña' }} />
          <Stack.Screen name="ScreenNotificaciones" component={ScreenNotificaciones} options={{ title: 'Notificaciones' }} />

          { /*Screens que solo pueden usar los usuarios emprendedores*/}
          <Stack.Screen name="ScreenNuevoProducto" component={ScreenNuevoProducto} options={{ title: 'Registar un nuevo producto' }} />
          <Stack.Screen name="ScreenModificarProducto" component={ScreenModificarProducto} options={{ title: 'Modificar Producto' }} />
          <Stack.Screen name="ScreenNuevaPublicacion" component={ScreenNuevaPublicacion} options={{ title: 'Nueva publicacion' }} />
          <Stack.Screen name="ScreenModificarPublicacion" component={ScreenModificarPublicacion} options={{ title: 'Modificar Publicacion' }} />
          <Stack.Screen name="ScreenDatosEmprendimiento" component={ScreenDatosEmprendimiento} options={{ title: 'Datos del Emprendimiento' }} />

        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}