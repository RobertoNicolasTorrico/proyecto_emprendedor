import React, { Component } from 'react';

//Componentes utilizados en React Native
import { TouchableOpacity, RefreshControl, View, SafeAreaView, Text, ScrollView, FlatList, Alert, Image, ActivityIndicator } from 'react-native';
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
import { mostrarMensaje, validarArchivosProducto, filtrarTextoSoloNumeros, filtrarTextoPrecio } from '../../../../config/funciones.js';

//Módulo para realizar consultas a las APIs relacionadas
import api_estado from '../../../../config/consultas_api/api_estado.js'
import api_categoria from '../../../../config/consultas_api/api_categoria.js';
import api_producto from '../../../../config/consultas_api/api_producto.js';

//Configuracion de URL y otros parametros
import { config_define } from '../../../../config/config_define.js';


export class ScreenModificarProducto extends Component {
    constructor(props) {
        super(props);
        this.state = {

            //Identificador del usuario actual
            id_usuario: null,
            tipo_usuario: null,
            id_producto: this.props.route.params.id_producto,//Identificador del producto a modificar

            detalles_producto_bd: [],//Lista con los detalles originales del producto
            nombre_producto: '',//Indica el nombre del producto
            descripcion_producto: '',//Indica la descripcion del productp
            select_categoria: null,//Indica que categoria va ser el producto
            select_estado: null,//Indica el estado que se encuentra el producto
            stock: '',//Indica el stock del producto
            precio: '',//Indica el precio del producto

            lista_imagenes: [],//Lista de imagenes que se mostraran
            lista_imagenes_bd: [],//Lista con las imagenes actuales del producto
            lista_nombres_bd: [],//Lista con los nombres de los archivos actuales del producto

            loading_img: false,//Indica cuando se este eliminando una imagen de la lista

            lista_categoria: [],//Lista de categorias de productos que se puede publicar

            lista_estado: [],//Lista de estado que puede estar el producto

            tipoMensaje: '', //Tipo de mensaje a mostrar dependiendo de lo que haga el usuario 
            mensaje: '', //Mensaje a mostrar dependiendo de lo que haga el usuario 

            loading_modificar_producto: false, //Indica el estado al cargar la modificacion del producto
            refreshing_producto: false,//Indica el estado de actualizar toda la informacion del producto
            errorObtenerProducto: false,//Indiciar si hubo un error al obtener la informacion del producto
            loading_inicio: true,//Indica cuando se esta cargando la informacion del producto
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
            //Despues de actualizar el estado se llama a la funcion para obtener las categorias que se puede registrar un producto, los estados de un producto y los detalles del producto
            this.obtenerDatosIniciales();
        });
    }


    // Función para obtener la informacion del producto, las categorias en las que se puede registrar y el estado del mismo
    obtenerDatosIniciales = async () => {

        try {

            const { id_usuario, tipo_usuario, id_producto } = this.state;

            // Se llama a la función que tiene la API para obtener los estados que puede tener un producto
            const respuesta_estado = await api_estado.obtenerListaEstados();
            this.setState({ lista_estado: respuesta_estado.lista_estado });

            // Se llama a la función que tiene la API para obtener las categorias en las que se puede publicar un producto
            const respuesta_categoria = await api_categoria.obtenerListaCategoria();
            this.setState({ lista_categoria: respuesta_categoria.lista_categoria });


            // Se llama a la función que tiene la API para obtener la información del producto
            const respuesta_productos = await api_producto.obtenerDatosProducto(id_usuario, tipo_usuario, id_producto);
            var detalles_producto = respuesta_productos.detalles_producto;
            var archivos_producto = respuesta_productos.archivos;

            var lista_uri_imagenes_bd = [];
            var nombre_bd_archivos = [];
            for (var i = 0; i < archivos_producto.length; i++) {
                lista_uri_imagenes_bd.push({ uri: `${config_define.urlBase}/uploads/${detalles_producto.id_usuario_emprendedor}/publicaciones_productos/${archivos_producto[i].nombre_carpeta}/${archivos_producto[i].nombre_archivo}` });
                nombre_bd_archivos.push(archivos_producto[i].nombre_archivo);
            }
            this.setState({
                nombre_producto: detalles_producto.nombre_producto,
                descripcion_producto: detalles_producto.descripcion,
                select_estado: detalles_producto.id_estado_producto,
                stock: detalles_producto.stock.toString(),
                precio: detalles_producto.precio.toString(),
                select_categoria: detalles_producto.id_categoria_producto,
                detalles_producto_bd: detalles_producto,
                lista_imagenes: lista_uri_imagenes_bd,
                lista_imagenes_bd: lista_uri_imagenes_bd,
                lista_nombres_bd: nombre_bd_archivos,
                errorObtenerProducto: false,
            });
        }
        catch (error) {
            // Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensaje: error.message, tipoMensaje: 'danger', errorObtenerProducto: true
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            // Finaliza el estado de carga y refresco de producto
            this.setState({ refreshing_producto: false, loading_inicio: false });
        }
    };

    //Funcion para obtener los datos de la publicacion del producto
    obtenerDatosDelProductoModificado = async () => {

        try {
            const { id_usuario, tipo_usuario, id_producto } = this.state;

            // Se llama a la función que tiene la API para obtener la información del producto
            const respuesta_productos = await api_producto.obtenerDatosProducto(id_usuario, tipo_usuario, id_producto);
            var detalles_producto = respuesta_productos.detalles_producto;
            var archivos_producto = respuesta_productos.archivos;

            var lista_uri_imagenes_bd = [];
            var nombre_bd_archivos = [];
            for (var i = 0; i < archivos_producto.length; i++) {
                lista_uri_imagenes_bd.push({ uri: `${config_define.urlBase}/uploads/${detalles_producto.id_usuario_emprendedor}/publicaciones_productos/${archivos_producto[i].nombre_carpeta}/${archivos_producto[i].nombre_archivo}` });
                nombre_bd_archivos.push(archivos_producto[i].nombre_archivo);
            }
            this.setState({
                nombre_producto: detalles_producto.nombre_producto,
                descripcion_producto: detalles_producto.descripcion,
                select_estado: detalles_producto.id_estado_producto,
                stock: detalles_producto.stock.toString(),
                precio: detalles_producto.precio.toString(),
                select_categoria: detalles_producto.id_categoria_producto,
                detalles_producto_bd: detalles_producto,
                lista_imagenes: lista_uri_imagenes_bd,
                lista_imagenes_bd: lista_uri_imagenes_bd,
                lista_nombres_bd: nombre_bd_archivos,
                errorObtenerProducto: false,

            });

        } catch (error) {
            // Manejo de errores: Actualiza el estado con el mensaje de error y muestra un alert
            this.setState({
                mensaje: error.message, tipoMensaje: 'danger', errorObtenerProducto: true
            }, () => {
                Alert.alert("Aviso", error.message);
            });
        } finally {
            // Finaliza el estado de carga 
            this.setState({ loading_inicio: false });
        }
    };


    //Actualiza el estado del componente del estado del producto
    handleEstadoChange = (nuevo_estado) => {
        this.setState({ select_estado: nuevo_estado });
    };


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
        const { loading_modificar_producto } = this.state;
        return (
            //Componente View para mostrar imagenes de los productos
            <View style={styles.viewContainerArchivo}>
                <Image source={{ uri: item.uri }} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
                {/*Componente TouchableOpacity para eliminar la imagen */}
                <TouchableOpacity
                    style={[styles.botonBorrarArchivo, loading_modificar_producto && styles.botonDesactivado]}
                    disabled={loading_modificar_producto}//Desactiva el boton cuando se llama a la funcion para modificar el producto//Desactiva el boton cuando se llama a la funcion para publicar el producto
                    onPress={() => this.eliminarImagen(item.uri)}
                >
                    <FontAwesomeIcon icon={faTrash} size={24} color={'grey'} />
                </TouchableOpacity>
            </View>
        );
    };

    //Funcionar para modificar la informacion del producto de la cuenta del emprendedor
    modificarProducto = async () => {
        try {
            const { id_producto, id_usuario, tipo_usuario, nombre_producto, descripcion_producto, precio, stock, select_categoria, select_estado, lista_imagenes, lista_nombres_bd, detalles_producto_bd } = this.state;

            //Actualiza el estado para cargar la modificacion del producto ademas de eliminar cualquier mensaje previo
            this.setState({ loading_modificar_producto: true, mensaje: '', tipoMensaje: '' });

            //Se llama a la funcion que tiene la API para modificar el producto de la cuenta del emprendedor
            const respuesta = await api_producto.modificarProducto(id_producto, id_usuario, tipo_usuario, nombre_producto, descripcion_producto, precio, stock, select_categoria, select_estado, lista_imagenes, lista_nombres_bd, detalles_producto_bd);


            //Actualiza el mensaje y tipo de mensaje a mostrar en la interfaz del usuario
            //Despues se llama a la funcion obtener los datos actualizados del producto
            this.setState({
                mensaje: respuesta.mensaje, tipoMensaje: respuesta.estado
            }, () => {
                Alert.alert("Exito", respuesta.mensaje);
                this.obtenerDatosDelProductoModificado();
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
            this.setState({ loading_modificar_producto: false });
        }
    };


    //Funcion para restablecer los valores originales del producto
    restablecerCampos() {
        const { detalles_producto_bd, lista_imagenes_bd } = this.state;

        // Actualiza todos los detalles del producto al estado original del producto
        this.setState({
            nombre_producto: detalles_producto_bd.nombre_producto,
            descripcion_producto: detalles_producto_bd.descripcion,
            select_estado: detalles_producto_bd.id_estado_producto,
            stock: detalles_producto_bd.stock.toString(),
            precio: detalles_producto_bd.precio.toString(),
            select_categoria: detalles_producto_bd.id_categoria_producto,
            lista_imagenes: lista_imagenes_bd,
        });

    };


    //Funcion para restablecer la informacion del producto
    onRefreshProducto = () => {
        //Establece el estado de refreshing_producto a true y elimina cualquier mensaje previo
        //Despues se llama a la funcion para obtener la informacion del producto
        this.setState({
            refreshing_producto: true, loading_inicio: true, mensaje: '', tipoMensaje: ''
        }, () => {
            this.obtenerDatosIniciales();
        });
    };



    render() {
        const { lista_estado, refreshing_producto, mensaje, errorObtenerProducto, select_estado, loading_inicio, tipoMensaje, lista_imagenes, nombre_producto, descripcion_producto, lista_categoria, select_categoria, stock, precio, loading_img, loading_modificar_producto } = this.state;
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
                <ScrollView style={[styles.container]} refreshControl={
                    <RefreshControl
                        refreshing={refreshing_producto}// Estado que indica si el producto se está refrescando
                        onRefresh={this.onRefreshProducto}// Función que se llama cuando se realiza un gesto de refresco
                    />
                }>
                    <View style={[styles.viewCard, { marginBottom: 40, flex: 1 }]}>
                        <Text style={{ fontSize: 20, marginBottom: 10, textAlign: 'center' }}>Datos del producto</Text>

                        {/*Verifica la cargar de informacion */}
                        {loading_inicio ?
                            (
                                <ActivityIndicator style={styles.indicador} size="large" color="#0000ff" />
                            ) : (
                                <View>
                                    {/*Verifica si hay un mensaje*/}
                                    {mensaje && (
                                        /*Se llama a la funcion para obtener un contenedor que muestra un mensaje segun las acciones que realice el usuario*/
                                        mostrarMensaje(mensaje, tipoMensaje)
                                    )}

                                    {/*Verifica si no hubo problemas al obtener los datos del producto  */}
                                    {!errorObtenerProducto && (
                                        <View>

                                            {/*Componente View que contiene un RNPickerSelect para selecionar el estado del producto*/}
                                            <View style={{ marginTop: 10, marginBottom: 10 }}>
                                                <Text style={styles.tamanio_texto}>Estado del producto</Text>

                                                <View style={styles.viewSelect}>

                                                    <RNPickerSelect
                                                        placeholder={{ label: "Seleccione un estado", value: null }}
                                                        value={select_estado}
                                                        disabled={loading_modificar_producto}//Desactiva el boton cuando se llama a la funcion para modificar el producto
                                                        onValueChange={this.handleEstadoChange}
                                                        items={[
                                                            ...lista_estado.map((estado_productos) => ({
                                                                label: estado_productos.estado,
                                                                value: estado_productos.id_estado_producto,
                                                            })),
                                                        ]}
                                                    />
                                                </View>
                                            </View>


                                            {/*Componente View que contiene un TextInput para el nombre del producto*/}
                                            <View>
                                                <TextInput
                                                    label="Nombre del producto"
                                                    maxLength={80}
                                                    disabled={loading_modificar_producto}//Desactiva el boton cuando se llama a la funcion para modificar el producto
                                                    value={nombre_producto}
                                                    onChangeText={(text) => this.setState({ nombre_producto: text })}
                                                    style={styles.input_paper}
                                                    theme={theme}
                                                />
                                                <Text style={styles.text_contador}>
                                                    Máximo 80 caracteres. {80 - nombre_producto.length} restantes
                                                </Text>
                                            </View>


                                            {/*Componente View que contiene un TextInput para la descripcion del producto*/}
                                            <View>
                                                <TextInput
                                                    label="Descripción del producto"
                                                    value={descripcion_producto}
                                                    onChangeText={(text) => this.setState({ descripcion_producto: text })}
                                                    style={styles.input_paper}
                                                    theme={theme}
                                                    disabled={loading_modificar_producto}//Desactiva el boton cuando se llama a la funcion para modificar el producto
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
                                                        disabled={loading_modificar_producto}//Desactiva el boton cuando se llama a la funcion para modificar el producto
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

                                                {/*Componente View que contiene un TextInput para el precio del producto*/}
                                                <View style={{ width: '50%' }}>
                                                    <TextInput
                                                        label="Precio"
                                                        value={precio}
                                                        disabled={loading_modificar_producto}//Desactiva el boton cuando se llama a la funcion para modificar el producto
                                                        onChangeText={(num) => this.handleCampoPrecioChange(num)}
                                                        style={styles.input_paper}
                                                        theme={theme}
                                                        keyboardType="numeric"
                                                    />
                                                </View>

                                                {/*Componente View que contiene un TextInput para el stock del producto*/}
                                                <View style={{ width: '50%' }}>
                                                    <TextInput
                                                        label="Stock"
                                                        value={stock}
                                                        disabled={loading_modificar_producto}
                                                        onChangeText={(num) => this.handleCampoStockChange(num)}//Desactiva el boton cuando se llama a la funcion para modificar el producto
                                                        style={styles.input_paper}
                                                        theme={theme}
                                                        keyboardType="numeric"
                                                        maxLength={10}
                                                    />
                                                </View>
                                            </View>


                                            {/*Componente View que contiene las imagenes del producto*/}
                                            <View style={{ height: 500, width: "100%" }}>
                                                <Text style={styles.tamanio_texto}>Imágenes del producto</Text>
                                                <View style={styles.viewArchivos}>
                                                    <View style={{ alignItems: 'flex-start', }}>
                                                        <TouchableOpacity
                                                            disabled={loading_modificar_producto}//Desactiva el boton cuando se llama a la funcion para modificar el producto
                                                            onPress={this.seleccionarImagen}
                                                            style={[styles.boton, styles.botonConfirmacion, loading_modificar_producto && styles.botonDesactivado]}>
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


                                            {/*Componente View que contiene dos TouchableOpacity el primero para guardar los cambios hechos y el segundo para restablecer los valores originales de la publicacion  */}
                                            <View style={{ flexDirection: 'row', alignSelf: 'center' }}>

                                                {/*Componente TouchableOpacity guardar los cambios hechos en la publicacion  del producto */}
                                                <TouchableOpacity
                                                    style={[styles.boton, styles.botonConfirmacion, { marginVertical: 20 }, loading_modificar_producto && styles.botonDesactivado]}
                                                    onPress={this.modificarProducto}
                                                    disabled={loading_modificar_producto}//Desactiva el boton cuando se llama a la funcion para modificar el producto
                                                >
                                                    <Text style={[styles.textoBoton, styles.textoConfirmacion]}>Guardar Cambios</Text>
                                                    {loading_modificar_producto &&
                                                        <ActivityIndicator style={{ position: 'absolute', left: '50%' }} size="large" color="#0000ff" />
                                                    }
                                                </TouchableOpacity>

                                                {/*Componente TouchableOpacity para restablecer los valores originales del producto  */}
                                                <TouchableOpacity
                                                    style={[styles.boton, styles.botonInfo, { marginVertical: 20 }, loading_modificar_producto && styles.botonDesactivado]}
                                                    onPress={() => this.restablecerCampos()}
                                                    disabled={loading_modificar_producto}//Desactiva el boton cuando se llama a la funcion para modificar el producto
                                                >
                                                    <Text style={[styles.textoBoton, styles.textoInfo]}>Restablecer campos</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )
                        }
                    </View>
                </ScrollView>
            </SafeAreaView >
        );
    }
}