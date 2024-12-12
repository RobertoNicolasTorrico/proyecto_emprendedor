import React, { Component } from 'react';

//Componentes utilizados en React Native
import { SafeAreaView, Text, ScrollView, View, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Modal } from 'react-native';
import { TextInput, PaperProvider } from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';

//Biblioteca para almacenamiento asincrono de datos
import AsyncStorage from '@react-native-async-storage/async-storage';

//Archivo de estilos
import { styles } from '../../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { mostrarMensaje } from '../../../config/funciones.js';

//Módulo para realizar consultas a las APIs relacionadas
import api_usuario from '../../../config/consultas_api/api_usuario.js';


export class ScreenDatosPersonales extends Component {

    constructor(props) {
        super(props);
        this.state = {
            //Identificador del usuario actual
            id_usuario: null,
            tipo_usuario: null,

            tipoMensaje: '', //Tipo de mensaje a mostrar dependiendo de lo que haga el usuario 
            mensaje: '', //Mensaje a mostrar dependiendo de lo que haga el usuario 

            nombre_usuario: '',//Indica el nombre del usuario
            nombres: '',//Indica los nombres del usuario
            apellidos: '',//Indica los apellidos del usuario
            email: '',//Indica el email actual del usuario
            fechaRegistro: '',//Indica la fecha de registro del usuario

            loading_modificar_datos: false, //Indica el estado al cargar la modificacion de los datos usuario
            refreshing_datos: false,//Indica el estado de actualizar toda la informacion del usuario
            DatosOriginales: [],//Lista con los detalles originales del usuario
            loading_datos: false,//Indica cuando se esta cargando la informacion del usuario
            errorObtenerDatos: true,//Indiciar si hubo un error al obtener la informacion del usuario

            //Modal para desactivar la cuenta usuario
            modalDesactivarCuenta: false,//Indica el estado del modal para desactivar la cuenta del usuario 
            alertModalMensajeDesactivarCuenta: '', //Mensaje a mostrar dependiendo de lo que haga el usuario 
            alertModalTipoMensajeDesactivarCuenta: '', //Tipo de mensaje a mostrar dependiendo de lo que haga el usuario 
            confirmar_password: '',//Indica la contraseña para confirmar la desactivacion del usuario
            showConfirmPassword: false,//Indica el estado al mostrar/ocultar la contraseña del usuario
            loading_desactivarCuenta: false,// Indica el estado al desactivar la cuenta del usuario

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
        }, () => {
            //Despues de actualizar el estado se llama a la funcion para obtener los datos personales del usuario
            this.obtenerDatosPersonalesDelUsuario();
        });
    }


    //Funcion para obtener la informacion de los datos personales del usuario
    obtenerDatosPersonalesDelUsuario = async () => {

        try {
            const { tipo_usuario, id_usuario } = this.state;

            //Actualiza el estado para cargar la informacion personal del usuario
            this.setState({ loading_datos: true });


            // Se llama a la función que tiene la API para obtener la información personal del usuario
            const respuesta = await api_usuario.obtenerDatosPersonalesUsuario(id_usuario, tipo_usuario);
            var datosUsuario = respuesta.datosUsuario;

            // Actualiza los estados con los datos personales del usuario
            this.setState({
                nombre_usuario: datosUsuario.nombre_usuario,
                nombres: datosUsuario.nombres,
                apellidos: datosUsuario.apellidos,
                fechaRegistro: datosUsuario.fecha,
                email: datosUsuario.email,
                DatosOriginales: respuesta.datosUsuario,
                errorObtenerDatos: false,
            });
        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensaje: error.message, tipoMensaje: 'danger', errorObtenerDatos: true
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            //Finaliza el estado de carga de los datos personales del usuario y refresco de datos
            this.setState({ refreshing_datos: false, loading_datos: false });
        }
    };

    //Funcion para alternar el estado de mostrar la contraseña
    alternarMostrarConfirmarPassword = () => {
        this.setState((prevState) => ({
            showConfirmPassword: !prevState.showConfirmPassword,
        }));
    };


    //Funcion para modificar los datos personales del usuario
    modifcarDatosPersonales = async () => {

        try {
            const { tipo_usuario, id_usuario, nombres, apellidos, DatosOriginales } = this.state;
            //Actualiza el estado para cargar el cambio en los datos personales del usuario ademas de eliminar cualquier mensaje
            this.setState({ loading_modificar_datos: true, mensaje: '', tipoMensaje: '' });

            //Se llama a la funcion que tiene la API para modificar los datos personales del usuario
            const respuesta = await api_usuario.modificarDatosPersonalesUsuario(id_usuario, tipo_usuario, nombres, apellidos, DatosOriginales);

            //Actualiza el mensaje y tipo de mensaje a mostrar en la interfaz del usuario
            //Despues se llama a la funcion para obtener los datos personales actualizados
            this.setState({ mensaje: respuesta.mensaje, tipoMensaje: respuesta.estado }, () => {
                Alert.alert("Exito", respuesta.mensaje);
                this.obtenerDatosPersonalesDelUsuario();
            });
        } catch (error) {

            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensaje: error.message, tipoMensaje: 'danger'
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            //Finaliza el estado de carga para modificar los datos personales del usuario
            this.setState({ loading_modificar_datos: false });
        }
    };

    //Funcion para restablecer la informacion del usuario
    onRefreshDatosPersonales = () => {
        //Establece el estado de refreshing_datos a true y elimina cualquier mensaje previo
        //Despues se llama a la funcion para obtener la informacion del usuario
        this.setState({ refreshing_datos: true, mensaje: '', tipoMensaje: '' }, () => {
            this.obtenerDatosPersonalesDelUsuario();
        });
    };

    //Funcion para desactivar la cuenta del usuario
    desactivarCuenta = async () => {
        try {

            const { tipo_usuario, id_usuario, confirmar_password } = this.state;

            //Actualiza el estado para cargar la desactivacion de la cuenta del usuario
            this.setState({ loading_desactivarCuenta: true });


            //Se llama a la funcion que tiene la API para desactivar los datos personales del usuario
            const respuesta = await api_usuario.desactivarCuentaUsuario(id_usuario, tipo_usuario, confirmar_password);
            this.setState({
                alertModalMensajeDesactivarCuenta: respuesta.mensaje, alertModalTipoMensajeDesactivarCuenta: respuesta.estado
            }, async () => {

                // Eliminar la sesión del usuario de AsyncStorage
                await AsyncStorage.removeItem('idUsuario');
                await AsyncStorage.removeItem('tipoUsuario');
                await AsyncStorage.removeItem('idUsuarioEmprendedor');
                await AsyncStorage.removeItem('nombreEmprendimiento');
                Alert.alert("Exito", respuesta.mensaje);
                const timer = setTimeout(() => {
                    // Reiniciar la navegación y redirige al usuario a DrawerNavigatorGeneral
                    this.props.navigation.dispatch(
                        CommonActions.reset({
                            index: 0,// Establecer el índice inicial de la pila de navegación en 0
                            routes: [{ name: 'DrawerNavigatorGeneral' }],// Redirige a la pantalla DrawerNavigatorGeneral
                        })
                    );
                }, 1500);
            });
        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert en el modal
            this.setState({
                alertModalMensajeDesactivarCuenta: error.message, alertModalTipoMensajeDesactivarCuenta: 'danger', loading_desactivarCuenta: false
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            //Finaliza el estado de carga al desactivar la cuenta
            this.setState({ loading_desactivarCuenta: false });
        }
    };


    render() {

        const { errorObtenerDatos, loading_desactivarCuenta, showConfirmPassword, confirmar_password, loading_modificar_datos, refreshing_datos, alertModalTipoMensajeDesactivarCuenta
            , modalDesactivarCuenta, fechaRegistro, alertModalMensajeDesactivarCuenta, mensaje, tipoMensaje, nombre_usuario, nombres, apellidos, email, loading_datos } = this.state;
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
                        {/*Verifica si se esta cargando los datos del usuario*/}
                        {loading_datos ? (
                            <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                        ) : (
                            //Verifica que no hubo problemas al obtener los datos del usuario para poder mostrar el formulario
                            !errorObtenerDatos && (
                                <View>
                                    {/*Componente View que contiene un TextInput con el nombre del usuario*/}
                                    <View style={{ marginBottom: 20 }}>
                                        <TextInput
                                            label="Nombre de usuario"
                                            value={nombre_usuario}
                                            disabled={true}
                                            onChangeText={(text) => this.setState({ nombre_usuario: text })}
                                            maxLength={20}
                                            style={styles.input_paper}
                                            theme={theme}
                                        />
                                    </View>

                                    {/*Componente View que contiene un TextInput con los nombres*/}
                                    <View style={{ marginBottom: 20 }}>
                                        <TextInput
                                            label="Nombres"
                                            disabled={loading_modificar_datos}//Desactiva el TextInput cuando se llama a la funcion para modificar los datos personales del usuario
                                            maxLength={100}
                                            value={nombres}
                                            onChangeText={(text) => this.setState({ nombres: text })}
                                            style={styles.input_paper}
                                            theme={theme}
                                        />
                                        <Text style={styles.text_contador}>Máximo 100 caracteres. {100 - nombres.length} restantes</Text>
                                    </View>


                                    {/*Componente View que contiene un TextInput con los apellidos*/}
                                    <View style={{ marginBottom: 20 }}>
                                        <TextInput
                                            maxLength={100}
                                            label="Apellidos"
                                            disabled={loading_modificar_datos}//Desactiva el TextInput cuando se llama a la funcion para modificar los datos personales del usuario
                                            value={apellidos}
                                            onChangeText={(text) => this.setState({ apellidos: text })}
                                            style={styles.input_paper}
                                            theme={theme}
                                        />
                                        <Text style={styles.text_contador}>Máximo 100 caracteres. {100 - apellidos.length} restantes</Text>
                                    </View>

                                    {/*Componente View que contiene un TextInput con la fecha de registro del usuario*/}
                                    <View style={{ marginBottom: 20 }}>
                                        <TextInput
                                            label="Fecha de registro"
                                            maxLength={320}
                                            disabled={true}
                                            style={styles.input_paper}
                                            theme={theme}
                                            value={fechaRegistro}
                                            onChangeText={(text) => this.setState({ fechaRegistro: text })}
                                        />
                                    </View>


                                    {/*Componente View que contiene un TextInput con el email del usuario*/}
                                    <View style={{ marginBottom: 20 }}>
                                        <TextInput
                                            label="Email"
                                            maxLength={320}
                                            disabled={true}
                                            keyboardType='email-address'
                                            style={styles.input_paper}
                                            theme={theme}
                                            value={email}
                                            onChangeText={(text) => this.setState({ email: text })}
                                        />
                                    </View>


                                    {/* Componente View que contiene dos TouchableOpacity uno guardar los cambios hechos y otro para desactivar la cuenta del usuario */}
                                    <View style={{ flexDirection: 'row', alignSelf: 'center' }}>

                                        {/*Componente TouchableOpacity guardar los cambios hechos en los datos personales del usuario  */}
                                        <TouchableOpacity
                                            style={[styles.boton, styles.botonConfirmacion, loading_modificar_datos && styles.botonDesactivado]}
                                            onPress={this.modifcarDatosPersonales}
                                            disabled={loading_modificar_datos}//Desactiva el boton cuando se llama a la funcion para modificar los datos personales del usuario
                                        >
                                            <Text style={[styles.textoBoton, styles.textoConfirmacion]}>Guardar cambios</Text>
                                            {loading_modificar_datos &&
                                                <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                                            }
                                        </TouchableOpacity>


                                        {/*Componente TouchableOpacity para abrir el modal para desactivar la cuenta del usuario  */}
                                        <TouchableOpacity
                                            style={[styles.boton, styles.botonBaja, loading_modificar_datos && styles.botonDesactivado]}
                                            disabled={loading_modificar_datos}//Desactiva el boton cuando se llama a la funcion para modificar los datos personales del usuario
                                            onPress={() => this.setState({ modalDesactivarCuenta: true })}
                                        >
                                            <Text style={[styles.textoBoton, styles.textoBaja]}>Desactivar Cuenta</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )
                        )}


                        {/*Modal para desactivar la cuenta del usuario*/}
                        <View>
                            {/* Proveedor de temas de Paper para estilos consistentes */}
                            <PaperProvider theme={theme}>
                                <Modal
                                    visible={modalDesactivarCuenta} // Controla si el modal está visible o no
                                    animationType="fade" // Tipo de animación cuando se muestra o se oculta el modal
                                    statusBarTranslucent={false} // Configuración translúcida para la barra de estado 
                                    transparent={true} // Hacer el fondo del modal transparente
                                >
                                    <ScrollView style={styles.modalViewFondo}>
                                        <View style={[styles.modalView, { marginTop: '10%', margin: 20 }]}>
                                            <Text style={styles.textTitulo}>Aviso</Text>
                                            <View style={{ marginBottom: 20, padding: 10 }}>

                                                {/*Verifica si hay un mensaje en el modal*/}
                                                {alertModalMensajeDesactivarCuenta && (
                                                    /*Se llama a la funcion para obtener un contenedor que muestra un mensaje segun las acciones del usuario*/
                                                    mostrarMensaje(alertModalMensajeDesactivarCuenta, alertModalTipoMensajeDesactivarCuenta)
                                                )}

                                                <Text style={styles.tamanio_texto}>¿Estás seguro de querer desactivar su cuenta? Tenga en cuenta que si es un usuario emprendedor, todos sus productos pasarán al estado finalizado y no se veran sus publicaciones.</Text>

                                                <Text style={styles.tamanio_texto}>Para volver a reactivar su cuenta, vaya a la pantalla de enviar email de activacion y siga los pasos que aparecen para volver a reactivar su cuenta.</Text>





                                                {/*Componente View que contiene un TextInput para agregar la contraseña del usuario*/}
                                                <View style={{ marginBottom: 20, marginTop: 20 }}>
                                                    <TextInput
                                                        label="Contraseña"
                                                        disabled={loading_desactivarCuenta}//Desactiva el boton cuando se llama a la funcion para desactivar la cuenta del usuario
                                                        secureTextEntry={!showConfirmPassword}
                                                        value={confirmar_password}
                                                        maxLength={60}
                                                        right={<TextInput.Icon icon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={30} onPress={this.alternarMostrarConfirmarPassword} />}
                                                        onChangeText={(text) => this.setState({ confirmar_password: text })}
                                                        style={styles.input_paper}
                                                        theme={theme}
                                                    />
                                                </View>
                                            </View>

                                            {/* Componente View que contiene dos TouchableOpacity uno para cerrar el modal y otro para desactivar la cuenta del usuario */}
                                            <View style={{ flexDirection: 'row', alignSelf: 'center' }}>

                                                {/*Componente TouchableOpacity para cancelar el proceso y cerrar el modal  */}
                                                <TouchableOpacity
                                                    style={[styles.boton, loading_desactivarCuenta && styles.botonDesactivado]}
                                                    onPress={() => this.setState({
                                                        modalDesactivarCuenta: false, confirmar_password: '', showConfirmPassword: false, alertModalMensajeDesactivarCuenta: '', alertModalTipoMensajeDesactivarCuenta: ''
                                                    })}
                                                    disabled={loading_desactivarCuenta}//Desactiva el TouchableOpacity cuando se llama a la funcion para desactivar la cuenta del usuario
                                                >
                                                    <Text style={styles.textoBoton}>Cancelar</Text>
                                                </TouchableOpacity>


                                                {/*Componente TouchableOpacity para desactivar la cuenta del usuario  */}
                                                <TouchableOpacity
                                                    disabled={loading_desactivarCuenta}//Desactiva el TouchableOpacity cuando se llama a la funcion para desactivar la cuenta del usuario
                                                    style={[styles.boton, styles.botonBaja, loading_desactivarCuenta && styles.botonDesactivado]}
                                                    onPress={() => this.desactivarCuenta()}
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
            </SafeAreaView>
        );
    }

}