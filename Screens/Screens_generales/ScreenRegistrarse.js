import React, { Component } from 'react';

//Componentes utilizados en React Native
import { SafeAreaView, Text, ScrollView, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { TextInput, RadioButton } from 'react-native-paper';

//Archivo de estilos
import { styles } from '../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { mostrarMensaje } from '../../config/funciones.js';

//Módulo para realizar consultas a las APIs relacionadas
import api_usuario from '../../config/consultas_api/api_usuario.js';


export class ScreenRegistrarse extends Component {

    constructor(props) {
        super(props);
        this.state = {

            nombre_emprendimiento: '',//Indica el nombre del emprendimiento del usuario

            nombre_usuario: '',//Indica el nombre del usuario

            nombres: '',//Indica los nombres del usuario

            apellidos: '',//Indica los apellidos del usuario

            email: '',//Indica el email del usuario

            password: '',//Indica la contraseña del usuario
            showPassword: false,//Indica si se va a mostrar la  contraseña del usuario en la interfaz

            confirmar_password: '',//Indica la confirmacion de la contraseña
            showConfirmPassword: false,//Indica si se va a mostrar la confirmacion de la contraseña del usuario en la interfaz

            tipo_usuario: "1",//Indica que tipo de usuario va ser 


            loading_registro: false,//Indica el estado al cargar el registro del usuario

            tipoMensaje: '', //Tipo de mensaje a mostrar dependiendo de lo que haga el usuario 
            mensaje: '', //Mensaje a mostrar dependiendo de lo que haga el usuario 
        };
    }
    //Actualiza el estado del componente tipo de usuario demas de eliminar cualquier contenido del nombre del emprendimiento
    handleRadioButtonIsEmprendedor = (value) => {
        this.setState({
            tipo_usuario: value,
            nombre_emprendimiento: '',
        });
    };


    //Funcion para alternar el estado de mostrar la contraseña depediendo cual se halla elegido
    alternarMostrarPassword = (campo) => {
        this.setState((prevState) => ({
            [campo]: !prevState[campo],
        }));
    };


    //Funcion para registrar a un usuario al sistema
    crearCuenta = async () => {

        try {
            const { nombre_usuario, nombre_emprendimiento, tipo_usuario, nombres, apellidos, email, password, confirmar_password } = this.state;

            //Actualiza el estado para cargar los datos personales del usuario ademas de eliminar cualquier mensaje previo
            this.setState({ loading_registro: true, mensaje: '', tipoMensaje: '' });

            //Se llama a la funcion que tiene la API para registrar los datos personales del usuario
            const resultado = await api_usuario.altaUsuario(nombre_usuario, nombre_emprendimiento, tipo_usuario, nombres, apellidos, email, password, confirmar_password);

            //Actualiza el mensaje y tipo de mensaje a mostrar en la interfaz del usuario
            //Despues se llama a la funcion restablecer los valores del formulario 
            this.setState({
                mensaje: resultado.mensaje, tipoMensaje: resultado.estado
            }, () => {
                Alert.alert("Exito", resultado.mensaje);
                this.restablecer_formulario();
            });
        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensaje: error.message, tipoMensaje: 'danger'
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            //Finaliza el estado de carga para crear la cuenta del usuario
            this.setState({ loading_registro: false });
        }

    };


    //Funcion para restablecer todos los valores del formulario de registro
    restablecer_formulario() {
        this.setState({
            nombre_emprendimiento: '',
            nombre_usuario: '',
            nombres: '',
            apellidos: '',
            email: '',
            password: '',
            showPassword: false,
            confirmar_password: '',
            showConfirmPassword: false,
            tipo_usuario: "1",
        });
    }

    render() {
        const { mensaje, tipoMensaje, nombre_emprendimiento, nombre_usuario, nombres, apellidos, email, password, confirmar_password, showPassword, showConfirmPassword, tipo_usuario, loading_registro } = this.state;
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
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <View style={styles.viewCard}>

                        {/*Verifica si hay un mensaje*/}
                        {mensaje && (
                            /*Se llama a la funcion para obtener un contenedor que muestra un mensaje segun las acciones que realice el usuario*/
                            mostrarMensaje(mensaje, tipoMensaje)
                        )}

                        {/*Componente View que contiene un RadioButton para saber si el usuario se quiere registrar como emprendedor*/}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={styles.tamanio_texto}>¿Quiere registrarse como emprendedor para publicar sus productos y hacer publicaciones?</Text>
                            <RadioButton.Group onValueChange={this.handleRadioButtonIsEmprendedor} value={tipo_usuario} >
                                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <RadioButton value="1" color="black" disabled={loading_registro} />
                                        <Text>No</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <RadioButton value="2" color="black" disabled={loading_registro} />
                                        <Text>Si</Text>
                                    </View>
                                </View>
                            </RadioButton.Group>
                        </View>

                        {/*Verifica que el tipo de usuario elegido sea un emprendedor para mostrar el TextInput */}
                        {tipo_usuario === '2' && (
                            /*Componente View que contiene un TextInput con el nombre del emprendimiento*/
                            < View style={{ marginBottom: 20 }}>
                                <TextInput
                                    label="Nombre del emprendimiento"
                                    value={nombre_emprendimiento}
                                    disabled={loading_registro}
                                    onChangeText={(text) => this.setState({ nombre_emprendimiento: text })}
                                    maxLength={50}
                                    style={styles.input_paper}
                                    theme={theme}
                                />
                                <Text style={styles.text_contador}>El nombre del emprendimiento no puede ser cambiado y solo se permite un máximo de 50 caracteres</Text>
                            </View>
                        )}


                        {/*Componente View que contiene un TextInput con el nombre del usuario*/}
                        <View style={{ marginBottom: 20 }}>
                            <TextInput
                                label="Nombre de usuario"
                                value={nombre_usuario}
                                disabled={loading_registro}
                                onChangeText={(text) => this.setState({ nombre_usuario: text })}
                                maxLength={20}
                                style={styles.input_paper}
                                theme={theme}
                            />
                            <Text style={styles.text_contador}>El nombre de usuario no puede ser cambiado y debe tener un mínimo de 5 caracteres y un máximo de 20</Text>
                        </View>

                        {/*Componente View que contiene un TextInput con los nombres del usuario*/}
                        <View style={{ marginBottom: 20 }}>
                            <TextInput
                                label="Nombres"
                                disabled={loading_registro}
                                maxLength={100}
                                value={nombres}
                                onChangeText={(text) => this.setState({ nombres: text })}
                                style={styles.input_paper}
                                theme={theme}
                            />
                            <Text style={styles.text_contador}>Máximo 100 caracteres. {100 - nombres.length} restantes</Text>
                        </View>


                        {/*Componente View que contiene un TextInput con los apellidos del usuario*/}
                        <View style={{ marginBottom: 20 }}>
                            <TextInput
                                maxLength={100}
                                label="Apellidos"
                                disabled={loading_registro}
                                value={apellidos}
                                onChangeText={(text) => this.setState({ apellidos: text })}
                                style={styles.input_paper}
                                theme={theme}
                            />
                            <Text style={styles.text_contador}>Máximo 100 caracteres. {100 - apellidos.length} restantes</Text>

                        </View>

                        {/*Componente View que contiene un TextInput con el email del usuario*/}
                        <View style={{ marginBottom: 20 }}>
                            <TextInput
                                label="Email"
                                maxLength={320}
                                disabled={loading_registro}
                                keyboardType='email-address'
                                style={styles.input_paper}
                                theme={theme}
                                value={email}
                                onChangeText={(text) => this.setState({ email: text })}
                            />
                        </View>


                        {/*Componente View que contiene un TextInput con la contraseña del usuario*/}
                        <View style={{ marginBottom: 20 }}>
                            <TextInput
                                label="Contraseña"
                                disabled={loading_registro}
                                secureTextEntry={!showPassword}
                                value={password}
                                maxLength={60}
                                right={<TextInput.Icon icon={showPassword ? 'eye-off-outline' : 'eye-outline'} size={30} onPress={() => this.alternarMostrarPassword('showPassword')} />}
                                onChangeText={(text) => this.setState({ password: text })}
                                style={styles.input_paper}
                                theme={theme}
                            />
                            <Text style={styles.text_contador}>La contraseña debe tener minimo 6 caracteres</Text>
                        </View>

                        {/*Componente View que contiene un TextInput con la confirmacion de la contraseña del usuario*/}
                        <View>
                            <TextInput
                                label="Confirmar Contraseña"
                                disabled={loading_registro}
                                maxLength={60}
                                secureTextEntry={!showConfirmPassword}
                                value={confirmar_password}
                                right={<TextInput.Icon icon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={30} onPress={() => this.alternarMostrarPassword('showConfirmPassword')} />}
                                onChangeText={(text) => this.setState({ confirmar_password: text })}
                                style={styles.input_paper}
                                theme={theme}
                            />
                        </View>


                        {/*Componente TouchableOpacity para registrar los datos en el sistema  */}
                        <TouchableOpacity
                            style={[styles.boton, styles.botonInfo, { marginTop: 10, marginBottom: 10 }, loading_registro && styles.botonDesactivado]}
                            onPress={this.crearCuenta}
                            disabled={loading_registro}
                        >
                            <Text style={[styles.textoBoton, styles.textoInfo]}>Crear cuenta</Text>
                            {loading_registro &&
                                <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                            }
                        </TouchableOpacity>

                    </View>
                </ScrollView>
            </SafeAreaView >
        );
    }
}

