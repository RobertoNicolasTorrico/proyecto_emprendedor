import React, { Component } from 'react';

//Componentes utilizados en React Native
import { TouchableOpacity, View, SafeAreaView, Text, ScrollView, FlatList, Alert, Image, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';

//Biblioteca para almacenamiento asincrono de datos
import AsyncStorage from '@react-native-async-storage/async-storage';

//Componente para mostrar iconos
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

//Iconos especificos de FontAwesome
import { faImage, faTrash } from '@fortawesome/free-solid-svg-icons';

//Archivo de estilos
import { styles } from '../../../../estilos/estilos.js';

//Funciones reutilizables definidas en un archivo externo
import { validarArchivosProducto, mostrarMensaje, filtrarTextoSoloNumeros, filtrarTextoPrecio } from '../../../../config/funciones.js';

//Módulo para realizar consultas a las APIs relacionadas
import api_categoria from '../../../../config/consultas_api/api_categoria.js';
import api_producto from '../../../../config/consultas_api/api_producto.js';


export class ScreenNuevoProducto extends Component {
    constructor(props) {
        super(props);
        this.state = {

            //Identificador del usuario actual
            id_usuario: null,
            tipo_usuario: null,

            nombre_producto: '',//Indica el nombre del producto
            descripcion_producto: '',//Indica la descripcion del productp
            select_categoria: null,//Indica que categoria va ser el producto
            stock: '',//Indica el stock del producto
            precio: '',//Indica el precio del producto

            lista_imagenes: [],//Lista de imagenes del producto 
            loading_img: false,//Indica cuando se este eliminando una imagen de la lista

            lista_categoria: [],//Lista de categorias de productos que se puede publicar

            tipoMensaje: '', //Tipo de mensaje a mostrar dependiendo de lo que haga el usuario 
            mensaje: '', //Mensaje a mostrar dependiendo de lo que haga el usuario 

            loading_producto: false //Indica el estado al cargar la informacion del producto
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
            //Despues de actualizar el estado se llama a la funcion para obtener las categorias de los productos que se puede utilizar
            this.obtenerListaCategoria();

        });

    }


    //Actualiza el estado del componente de la categoria del producto
    handleCategoriaChange = (nueva_categoria) => {
        this.setState({ select_categoria: nueva_categoria });
    };


    //Actualiza el estado del componente del precio del producto
    handleCampoPrecioChange = (text) => {
        this.setState({ precio: filtrarTextoPrecio(text) });
    };

    //Actualiza el estado del componente del campo stock del producto
    handleCampoStockChange = (text) => {
        this.setState({ stock: filtrarTextoSoloNumeros(text) });
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
            selectionLimit: 5,// Límite de selección de 5 imagenes
            quality: 1,// Calidad de las imagenes seleccionados
        });


        // Establece el estado de carga a true mientras se procesan las imagenes seleccionados
        this.setState({ loading_img: true });


        //Verifica si el usuario no cancelo la selección de imagenes
        if (!result.canceled) {

            // Se calcula la cantidad total de imagenes actuales más los seleccionados
            const cantidad_imagenes = this.state.lista_imagenes.length + result.assets.length;

            //Verifica que la cantidad total supera 5 imagenes para mostrar un mensaje de aviso
            if (cantidad_imagenes > 5) {
                Alert.alert('Aviso', 'Solo se permite agregar 5 imágenes como máximo.');

                // Establece el estado de carga a false
                this.setState({ loading_img: false });
                return;
            }

            // Verifica que los archivos seleccionados sean validos
            const imagenesValidas = validarArchivosProducto(result.assets);

            // Actualiza el estado con los archivos válidos agregados a la lista existente y establece el estado de carga a false
            this.setState((prevState) => ({
                lista_imagenes: [...prevState.lista_imagenes, ...imagenesValidas],
                loading_img: false,
            }));
        } else {
            // Si el usuario canceló la selección, establece el estado de carga a false
            this.setState({ loading_img: false });
        }

    };

    //Funcion para eliminar la imagen seleccionada
    eliminarImagen = (uri) => {
        // Establece el estado de carga a true mientras se elimina la imagenes
        this.setState({ loading_img: true });

        // Usa un setTimeout de 300 ms para simular un pequeño retraso antes de actualizar el estado
        setTimeout(() => {

            // Filtra la lista de imagenes para excluir la imagen con el uri especificado y establece el estado de carga a false
            this.setState((prevState) => ({
                lista_imagenes: prevState.lista_imagenes.filter((imagen) => imagen.uri !== uri),
                loading_img: false,
            }));
        }, 300);
    };

    //Funcion que renderizar cada elemento de la lista de imagenes
    renderItemImagen = ({ item }) => {
        const { loading_producto } = this.state;
        return (
            //Componente View para mostrar imagenes de los productos
            <View style={styles.viewContainerArchivo}>
                <Image source={{ uri: item.uri }} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
                {/*Componente TouchableOpacity para eliminar la imagen */}
                <TouchableOpacity
                    style={[styles.botonBorrarArchivo, loading_producto ? styles.botonDesactivado : null]}
                    disabled={loading_producto}//Desactiva el boton cuando se llama a la funcion para publicar el producto
                    onPress={() => this.eliminarImagen(item.uri)}
                >
                    <FontAwesomeIcon icon={faTrash} size={24} color={'grey'} />
                </TouchableOpacity>
            </View>
        );
    };

    //Funcion para obtener las categorias de los productos que se puede publicar
    obtenerListaCategoria = async () => {
        try {

            //Se llama a la funcion que tiene la API para obtener las categorias de los productos que se puede publicar
            const respuesta = await api_categoria.obtenerListaCategoria();
            //Actualiza la lista de categorias de los productos 
            this.setState({ lista_categoria: respuesta.lista_categoria });
        } catch (error) {
            //Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensaje: error.message, tipoMensaje: 'danger'
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        }
    };

    //Funcion para publicar un producto
    publicarProducto = async () => {
        try {
            const { id_usuario, tipo_usuario, nombre_producto, descripcion_producto, precio, stock, select_categoria, lista_imagenes } = this.state;
            //Actualiza el estado para cargar el producto ademas de restablecer los valores del mensaje y tipo de mensaje
            this.setState({ loading_producto: true, mensaje: '', tipoMensaje: '' });

            //Se llama a la funcion que tiene la API para publicar el producto en la cuenta del emprendedor
            const respuesta = await api_producto.altaProducto(id_usuario, tipo_usuario, nombre_producto, descripcion_producto, select_categoria, precio, stock, lista_imagenes);

            //Actualiza el mensaje y tipo de mensaje a mostrar en la interfaz del usuario
            //Despues se llama a la funcion para restablecer los valores de los campos del producto
            this.setState({
                mensaje: respuesta.mensaje, tipoMensaje: respuesta.estado
            }, () => {
                Alert.alert("Aviso", respuesta.mensaje);
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

            //Finaliza el estado de carga
            this.setState({ loading_producto: false });
        }
    };


    //Funcion para restablecer los valores de todos los campos de la publicacion
    limpiarCampos() {
        this.setState({
            descripcion_producto: '',
            nombre_producto: '',
            stock: '',
            precio: '',
            lista_imagenes: [],
            select_categoria: null,
        });
    }

    render() {
        const { mensaje, tipoMensaje, lista_imagenes, nombre_producto, descripcion_producto, lista_categoria, select_categoria, stock, precio, loading_img, loading_producto } = this.state;
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
                <ScrollView style={[styles.container]}>
                    <View style={[styles.viewCard, { marginBottom: 40 }]}>
                        <Text style={{ fontSize: 20, marginBottom: 10, textAlign: 'center' }}>Datos del nuevo producto</Text>
                        {/*Verifica si hay un mensaje*/}
                        {mensaje && (
                            /*Se llama a la funcion para obtener un contenedor que muestra un mensaje segun las acciones que realice el usuario*/
                            mostrarMensaje(mensaje, tipoMensaje)
                        )}

                        {/*Componente View que contiene un TextInput para agregar el nombre del producto*/}
                        <View>
                            <TextInput
                                label="Nombre del producto"
                                maxLength={80}
                                disabled={loading_producto}//Desactiva el boton cuando se llama a la funcion para publicar un producto
                                value={nombre_producto}
                                onChangeText={(text) => this.setState({ nombre_producto: text })}
                                style={styles.input_paper}
                                theme={theme}
                            />
                            <Text style={styles.text_contador}>
                                Máximo 80 caracteres. {80 - nombre_producto.length} restantes
                            </Text>
                        </View>


                        {/*Componente View que contiene un TextInput para agregar la descripcion del producto*/}
                        <View>
                            <TextInput
                                label="Descripción del producto"
                                value={descripcion_producto}
                                onChangeText={(text) => this.setState({ descripcion_producto: text })}
                                style={styles.input_paper}
                                theme={theme}
                                disabled={loading_producto}//Desactiva el boton cuando se llama a la funcion para publicar un producto
                                maxLength={1000}
                                multiline
                                numberOfLines={5}
                            />
                            <Text style={styles.text_contador}>Máximo 1000 caracteres. {1000 - descripcion_producto.length} restantes</Text>
                        </View>

                        {/*Componente View que contiene un RNPickerSelect para selecionar la categoria del producto*/}
                        <View style={{ marginTop: 10, marginBottom: 10 }}>
                            <Text style={styles.tamanio_texto}>Categoria del producto</Text>
                            <View style={styles.viewSelect}>

                                <RNPickerSelect
                                    placeholder={{ label: "Seleccione una categoría", value: null }}
                                    value={select_categoria}
                                    disabled={loading_producto}//Desactiva el boton cuando se llama a la funcion para publicar un producto
                                    onValueChange={this.handleCategoriaChange}
                                    items={[
                                        ...lista_categoria.map((categoria) => ({
                                            label: categoria.nombre_categoria,
                                            value: categoria.id_categoria_producto,
                                        })),
                                    ]}
                                />
                            </View>
                        </View>

                        {/*Componente View que contiene dos TextInput uno para el precio y otro para el stock del producto*/}
                        <View style={{ flexDirection: 'row' }}>

                            {/*Componente View que contiene un TextInput para agregar el precio del producto*/}
                            <View style={{ width: '50%' }}>
                                <TextInput
                                    label="Precio"
                                    value={precio}
                                    disabled={loading_producto}//Desactiva el boton cuando se llama a la funcion para publicar un producto
                                    onChangeText={(num) => this.handleCampoPrecioChange(num)}
                                    style={styles.input_paper}
                                    theme={theme}
                                    keyboardType="numeric"
                                />
                            </View>

                            {/*Componente View que contiene un TextInput para agregar el stock del producto*/}
                            <View style={{ width: '50%' }}>
                                <TextInput
                                    label="Stock"
                                    value={stock}
                                    disabled={loading_producto}
                                    onChangeText={(num) => this.handleCampoStockChange(num)}
                                    style={styles.input_paper}
                                    theme={theme}
                                    keyboardType="numeric"
                                    maxLength={10}
                                />
                            </View>
                        </View>

                        {/*Componente View que contiene las imagenes del producto*/}
                        <View style={{ height: 500, width: "100%", }}>
                            <Text style={styles.tamanio_texto}>Imágenes del producto</Text>
                            <View style={styles.viewArchivos}>
                                <View style={{ alignItems: 'flex-start' }}>
                                    <TouchableOpacity
                                        disabled={loading_producto}//Desactiva el boton cuando se llama a la funcion para publicar un producto
                                        onPress={this.seleccionarImagen}
                                        style={[styles.boton, styles.botonConfirmacion, loading_producto ? styles.botonDesactivado : null]}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <FontAwesomeIcon icon={faImage} size={20} color={'#198754'} />
                                            <Text style={[styles.textoBoton, styles.textoConfirmacion]}> Agregar Imágenes</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>

                                {loading_img ? (
                                    <ActivityIndicator size="large" style={styles.indicador} color="#0000ff" />
                                ) : (
                                    <FlatList
                                        data={lista_imagenes} // Datos de la lista que serán renderizados
                                        renderItem={this.renderItemImagen} // Función que renderiza cada elemento de la lista
                                        keyExtractor={(item) => item.uri}// Función para extraer la clave única para cada elemento
                                        horizontal={true} // Hacer que la lista sea horizontal en lugar de vertical
                                        contentContainerStyle={{
                                            alignItems: 'center',
                                        }}
                                    />
                                )}
                            </View>
                            <Text style={styles.text_contador}>Agrega al menos una imagen y hasta un maximo de cinco(Formatos permitidos jpg, jpeg, png)</Text>
                        </View>

                        {/*Componente View que contiene dos TouchableOpacity uno para publicar un producto y otro para restablecer los campos*/}
                        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>

                            {/*Componente TouchableOpacity para publicar el producto  */}
                            <TouchableOpacity
                                style={[styles.boton, styles.botonConfirmacion, { marginVertical: 20 }, loading_producto ? styles.botonDesactivado : null]}
                                onPress={this.publicarProducto}
                                disabled={loading_producto}//Desactiva el boton cuando se llama a la funcion para publicar un producto
                            >
                                <Text style={[styles.textoBoton, styles.textoConfirmacion]}>Publicar</Text>
                                {loading_producto &&
                                    <ActivityIndicator style={{ position: 'absolute', left: '50%' }} size="large" color="#0000ff" />
                                }
                            </TouchableOpacity>

                            {/*Componente TouchableOpacity elimina cualquier contenido de los campos  */}
                            <TouchableOpacity
                                style={[styles.boton, styles.botonBaja, { marginVertical: 20 }, loading_producto ? styles.botonDesactivado : null]}
                                onPress={() => this.limpiarCampos()}
                                disabled={loading_producto}//Desactiva el boton cuando se llama a la funcion para publicar un producto
                            >
                                <Text style={[styles.textoBoton, styles.textoBaja]}>Restablecer campos</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView >
        );
    }
}