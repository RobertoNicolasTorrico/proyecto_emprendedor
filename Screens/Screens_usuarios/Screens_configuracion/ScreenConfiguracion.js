
import React, { Component } from 'react';

//Componentes utilizados en React Native
import { SafeAreaView, ScrollView, Text, View, TouchableOpacity, Modal } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';

//Biblioteca para almacenamiento asincrono de datos
import AsyncStorage from '@react-native-async-storage/async-storage';

//Componente para mostrar iconos
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

//Iconos especificos de FontAwesome
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

//Archivo de estilos
import { styles } from '../../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { obtenerCantNotificacionesSinLeer } from '../../../config/funciones.js';


export class ScreenConfiguracion extends Component {

  constructor(props) {
    super(props);
    this.state = {
      //Identificador del usuario actual
      id_usuario: null,
      tipo_usuario: null,

      modalCerrarSesion: false,//Indica el estado del modal para cerrar sesion
      loading_cerrarSesion: false//Indica el estado al cargar cuando se cierra la sesion del usuario
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
      //Despues de actualizar el estado, se llaman a las funcion para obtener las notificaciones del usuario
      obtenerCantNotificacionesSinLeer(idUsuario, tipoUsuario, this.props.navigation);
    });

    //Agrega un listener para actualizar las notificaciones cuando la pantalla esta enfocada 
    this.focusListener = this.props.navigation.addListener('focus', () => {
      obtenerCantNotificacionesSinLeer(idUsuario, tipoUsuario, this.props.navigation);
    });

  };

  //Funcion para cerrar la sesion del usuario
  cerrarSesion = async () => {

    this.setState({ loading_cerrarSesion: true });

    // Eliminar la sesión del usuario de AsyncStorage
    await AsyncStorage.removeItem('idUsuario');
    await AsyncStorage.removeItem('tipoUsuario');
    await AsyncStorage.removeItem('idUsuarioEmprendedor');
    await AsyncStorage.removeItem('nombreEmprendimiento');

    // Reiniciar la navegación y redirige al usuario a DrawerNavigatorGeneral
    this.props.navigation.dispatch(
      CommonActions.reset({
        index: 0, // Establecer el índice inicial de la pila de navegación en 0
        routes: [{ name: 'DrawerNavigatorGeneral' }], // Redirige a la pantalla DrawerNavigatorGeneral
      })
    );
  };



  render() {
    const { modalCerrarSesion, loading_cerrarSesion, tipo_usuario } = this.state;
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
          <ScrollView contentContainerStyle={styles.scrollViewContent} >
            <View style={styles.viewCard}>

              {/*Componente View que contiene un TouchableOpacity para navegar a los detalles personales del usuario */}
              <View style={{ marginBottom: 30, borderWidth: 1, borderRadius: 10 }}>
                <TouchableOpacity
                  style={[{ paddingVertical: 10, paddingHorizontal: 15 }]}
                  onPress={() => { this.props.navigation.navigate("ScreenDatosPersonales"); }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={[styles.tamanio_texto, { fontWeight: 'bold' }]}>Datos Personales</Text>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </View>
                </TouchableOpacity>
              </View>

              {/*Verifica si el usuario es un emprendedor */}
              {tipo_usuario == 2 && (

                /*Componente View que contiene un TouchableOpacity para navegar a los detalles personales del emprendimiento */
                < View style={{ marginBottom: 30, borderWidth: 1, borderRadius: 10 }}>
                  <TouchableOpacity
                    style={{ paddingVertical: 10, paddingHorizontal: 15 }}
                    onPress={() => { this.props.navigation.navigate("ScreenDatosEmprendimiento"); }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={[styles.tamanio_texto, { fontWeight: 'bold' }]}>Datos del emprendimiento</Text>
                      <FontAwesomeIcon icon={faChevronRight} />
                    </View>
                  </TouchableOpacity>
                </View>
              )}


              { /*Componente View que contiene un TouchableOpacity para navegar al cambio de email del usuario */}
              <View style={{ marginBottom: 30, borderWidth: 1, borderRadius: 10 }}>
                <TouchableOpacity
                  style={{ paddingVertical: 10, paddingHorizontal: 15 }}
                  onPress={() => { this.props.navigation.navigate("ScreenCambiarEmail"); }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={[styles.tamanio_texto, { fontWeight: 'bold' }]}>Cambiar Email</Text>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </View>
                </TouchableOpacity>
              </View>


              { /*Componente View que contiene un TouchableOpacity para navegar al cambio de la contraseña del usuario */}
              <View style={{ marginBottom: 30, borderWidth: 1, borderRadius: 10 }}>
                <TouchableOpacity
                  style={{ paddingVertical: 10, paddingHorizontal: 15 }}
                  onPress={() => { this.props.navigation.navigate("ScreenCambiarPassword"); }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={[styles.tamanio_texto, { fontWeight: 'bold' }]}>Cambiar Contraseña</Text>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </View>
                </TouchableOpacity>
              </View>


              { /*Componente View que contiene un TouchableOpacity para abrir el modal para cerrar sesion */}
              <View>
                <TouchableOpacity style={[styles.boton, styles.botonBaja]} onPress={() => this.setState({ modalCerrarSesion: true })} >
                  <Text style={[styles.textoBoton, styles.tamanio_texto, styles.textoBaja]}>Cerrar sesion</Text>
                </TouchableOpacity>
              </View>



              {/*Modal para cerrar sesion */}
              <View>
                {/* Proveedor de temas de Paper para estilos consistentes */}
                <PaperProvider theme={theme}>
                  <Modal
                    visible={modalCerrarSesion} // Controla si el modal está visible o no
                    animationType="fade" // Tipo de animación cuando se muestra o se oculta el modal
                    statusBarTranslucent={false} // Configuración translúcida para la barra de estado 
                    transparent={true} // Hacer el fondo del modal transparente
                  >

                    <ScrollView style={styles.modalViewFondo}>
                      <View style={[styles.modalView, { marginTop: '50%', margin: 20 }]}>
                        <Text style={styles.textTitulo}>Aviso</Text>
                        <View style={{ marginBottom: 20, padding: 10 }}>
                          <Text style={[styles.tamanio_texto, { textAlign: 'center', fontWeight: 'bold', }]}>¿Estas seguro de querer cerrar sesion?</Text>
                        </View>


                        {/*Componente View que contiene dos TouchableOpacity uno para cerrar sesion y otro para cerrar el modal*/}
                        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>


                          {/*Componente TouchableOpacity para cerrar el modal*/}
                          <TouchableOpacity
                            style={[styles.boton, loading_cerrarSesion && styles.botonDesactivado]}
                            disabled={loading_cerrarSesion}//Desactiva el boton cuando se llama a la funcion para cerrar el sesion
                            onPress={() => this.setState({ modalCerrarSesion: false })}// Función para cerrar el modal
                          >
                            <Text style={styles.textoBoton}>Cancelar</Text>
                          </TouchableOpacity>

                          {/*Componente TouchableOpacity para cerrar la sesion del usuario */}
                          <TouchableOpacity
                            disabled={loading_cerrarSesion}//Desactiva el boton cuando se llama a la funcion para cerrar el sesion
                            style={[styles.boton, styles.botonBaja, loading_cerrarSesion && styles.botonDesactivado]}
                            onPress={() => this.cerrarSesion()}
                          >
                            <Text style={[styles.textoBoton, styles.textoBaja]}>Confirmar</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </ScrollView>

                  </Modal>
                </PaperProvider>
              </View>

            </View>
          </ScrollView>
        </View >

      </SafeAreaView >
    );
  }
}
