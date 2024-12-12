import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        borderWidth: 1
    },
    container: {
        flex: 1,
        padding: 20
    },


    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 15,
        backgroundColor: '#f5f5f5',
    },


    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingTop: 0,
        paddingBottom: 0,
    },
    input_Container_Style: {
        backgroundColor: 'white',
        borderRadius: 10,
    },
    container_search: {
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'gray',
        padding: 0,
    }, boton: {
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: 'transparent',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        borderWidth: 1,
    },
    botonConfirmacion: {
        borderColor: '#198754'
    },
    botonBaja: {
        borderColor: '#dc3545'
    },
    botonModificacion: {
        borderColor: '#ffc107'
    },

    botonInfo: {
        borderColor: '#0d6efd'
    },
    TextoActivo: {
        color: 'white',
        fontSize: 16
    },
    TextoInactivo: {
        color: '#0d6efd',
        fontSize: 16
    },
    textoBoton: {
        textAlign: 'center',
        fontWeight: 'bold'
    },
    textoConfirmacion: {
        color: '#198754'
    },
    textoBaja: {
        color: '#dc3545'
    },
    textoInfo: {
        color: '#0d6efd',
    },
    textoModificacion: {
        color: '#ffc107',
    },

    subtitulo: {
        fontSize: 25,
        marginStart: 15
    },

    container_precio: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        width: '95%',
        marginStart: 10,
    },
    input_precio: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    buscarRangoPrecio: {
        backgroundColor: 'transparent',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'black'
    },

    starsContainer: {
        alignItems: 'center',
        alignContent: 'center'
    },
    estrellas: {
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'center'
    },


    lista_acordeon: {
        marginBottom: 10,
        paddingBottom: 10,
        borderTopWidth: 1,
        borderColor: '#dee2e6'
    },
    paginacionContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
    },
    paginaActiva: {
        backgroundColor: '#0d6efd',
        padding: 15,
        marginHorizontal: 5,
        borderRadius: 5,

    },
    paginaInactiva: {
        backgroundColor: 'white',
        padding: 15,
        marginHorizontal: 5,
        borderRadius: 5,
    }
    , caracteristica: {
        fontWeight: 'bold',
        fontSize: 16
    },
    tamanio_texto: {
        fontSize: 16
    }, input_paper: {
        backgroundColor: '#FFFFFF',
        borderRadius: 5,
        margin: 5,
        borderWidth: 1,
        borderColor: 'gray',
        paddingHorizontal: 10,

    },
    enlace: {
        color: 'blue',
        textDecorationLine: 'underline',
        fontSize: 16,
    },
    view_error: {
        borderColor: '#f1aeb5',
        backgroundColor: '#f8d7da',
    },
    view_correcto: {
        borderColor: '#f1aeb0',
        backgroundColor: '#f8d1da',
    }, view_text_correcto: {
        color: '#11151c',
        fontSize: 16,
    },
    texto_mensaje: {
        fontSize: 16,
    },
    // Estilos específicos para cada tipo de mensaje
    view_mensaje: {
        marginBottom: 15,
        paddingStart: 15,
        paddingEnd: 15,
        paddingBottom: 10,
        paddingTop: 10,
        borderRadius: 4,
    },
    view_mensaje_tamanio_text: {
        fontSize: 16,
    },
    view_mensaje_error: {
        borderColor: '#f1aeb5',
        backgroundColor: '#f8d7da',
        padding: 10,
        margin: 10
    },
    text_mensaje_error: {
        color: '#58151c',
    },

    view_mensaje_confirmacion: {
        borderColor: '#a3cfbb',
        backgroundColor: '#d1e7dd',
    },
    text_mensaje_confirmacion: {
        color: '#0a3622',
    },
    view_mensaje_info: {
        borderColor: '#9eeaf9',
        backgroundColor: '#cff4fc',
    },
    text_mensaje_info: {
        color: '#055160',
    },
    text_fecha: {
        color: '#6c757d',
        fontSize: 16,
    },
    text_seguidos: {
        color: '#6c757d',
        fontSize: 16,
    },
    text_emprendimiento: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    text_aviso: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    tabTitle: {
        fontSize: 16,
        color: 'black',
    },

    inputBusqueda: {
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: 'white',
        color: '#000',
    },
    inputBusquedaFecha: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: 'white'
    },
    filtroBusqueda: {
        fontSize: 20,
        color: 'black',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 20,
        margin: 40,
        paddingTop: 20,
        paddingBottom: 20,
        elevation: 5,
    },
    modalViewFondo: {
        backgroundColor: 'rgba(128,128,128,0.5)'
    },
    text_contador: {
        color: '#212529bf',
        fontSize: 13
    },
    viewSelect: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#dee2e6'
    },
    viewSelectFiltro: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#dee2e6',
        marginTop: 20,
        marginEnd: 10,
        marginStart: 10
    },
    viewArchivos: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 15,
        width: "100%",
        padding: 10,
    },

    viewContainerArchivo: {
        position: 'relative',
        width: 300,
        height: 350,
        borderColor: "#cec8c8",
        borderWidth: 1,
        borderRadius: 1,
        overflow: 'hidden',
        margin: 10,
    },
    botonBorrarArchivo: {
        position: 'absolute',
        top: 5,
        right: 5,
        borderRadius: 10,
        padding: 5,
    },
    viewCard: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        elevation: 5,
        marginBottom: 10,
        borderColor: "#cec8c8",
        borderWidth: 1,
    },
    viewTab: {
        flex: 1,
        borderColor: "#cec8c8",
        width: '100%',
        borderWidth: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        elevation: 5,
    },
    botonAgregar: {
        borderWidth: 1,
        borderColor: "black",
        padding: 10,
        borderRadius: 50,
        marginTop: 10,
        marginStart: 20,
        marginEnd: 20,
    },
    botonAgregarActivar: {
        backgroundColor: 'black'

    }, botonAgregarDesactivar: {
        backgroundColor: 'white'

    },
    botonDesactivado: {
        backgroundColor: '#F2F2F2',
    },
    textTitulo: {
        fontSize: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    textSubTitulo: {
        fontSize: 19,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    indicador: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    ViewPreguntaRespuesta: {
        borderWidth: 1,
        marginTop: 20,
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 10,
        borderColor: '#dee2e6'
    },
    textoBusqueda: {
        marginTop: 15,
        fontSize: 17,
        textAlign: "center",
    },



});

