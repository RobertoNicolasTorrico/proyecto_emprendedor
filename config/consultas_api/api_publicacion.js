import axios from 'axios';
import { config_define } from '../config_define.js';
import { validarCampoVacio, tieneEspaciosEnBlancoInicioOFinal, validadCantidadArchivos } from '../funciones.js';

const api_publicacion = {

    altaPublicacion: async (id_usuario, tipo_usuario, descripcion, lista_archivos, map_latitude, map_longitude, agregar_imagenes, agregar_ubicacion) => {
        try {
            var cantMinArchivos = 1;
            var cantMaxArchivos = 5;

            if (validarCampoVacio([descripcion])) {
                throw new Error("El campo descripcion no puede estar vacio");
                return;
            }
            if (tieneEspaciosEnBlancoInicioOFinal(descripcion)) {
                throw new Error("El campo descripcion no puede tener espacios en blanco al inicio o al final");
            }

            if (agregar_ubicacion) {
                if (map_latitude == null || map_longitude == null) {
                    throw new Error("Ubicación desactivada.Para agregar la ubicación a tu publicación, por favor activa los servicios de ubicación en la configuración de tu dispositivo.");
                    return;
                }
            }


            if (agregar_imagenes) {
                if (!validadCantidadArchivos(lista_archivos.length, cantMinArchivos, cantMaxArchivos)) {
                    throw new Error("La cantidad de imagenes no cumplen con los requisitos.Debe ser al menos " + cantMinArchivos + " archivo y como maximo " + cantMaxArchivos + " archivos.");
                    return;
                }
            }

            const formData = new FormData();
            formData.append('id_usuario', id_usuario);
            formData.append('tipo_usuario', tipo_usuario);
            formData.append('descripcion', descripcion);
            formData.append('map_latitude', map_latitude);
            formData.append('map_longitude', map_longitude);

            lista_archivos.forEach((archivo, index) => {
                formData.append(`files[]`, {
                    uri: archivo.uri,
                    name: archivo.fileName,
                    type: archivo.mimeType,
                });
            });

            const response = await axios.post(`${config_define.urlApi}/consultas_bd_publicacion/api_altaPublicacionDelEmprendedor.php`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data;

        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    throw new Error("Recurso no encontrado: Verifica la URL y los parámetros.");
                } else {
                    throw new Error(`Error del servidor: ${error.response.data.mensaje}`);
                }
            } else if (error.request) {
                throw new Error("No se recibió respuesta del servidor. Verifica tu conexión de red.");
            } else {
                throw new Error(`Error: ${error.message}`);
            }
        }

    },

    modificarPublicacion: async (id_publicacion, id_usuario, tipo_usuario, descripcion, lista_archivos, map_latitude, map_longitude, agregar_imagenes, agregar_ubicacion, lista_nombre_archivos_bd, detalles_publicacion_bd) => {
        try {
            var cantMinArchivos = 1;
            var cantMaxArchivos = 5;
            const imagenes_eliminadas = lista_nombre_archivos_bd.filter(nombre_bd =>
                !lista_archivos.some(archivo => archivo.uri.includes(nombre_bd))
            );
            const nueva_imagenes = lista_archivos.filter(archivo =>
                archivo.uri.startsWith('file:///')
            );

            if (detalles_publicacion_bd.map_latitud == map_latitude && detalles_publicacion_bd.map_longitud == map_longitude && detalles_publicacion_bd.descripcion == descripcion && nueva_imagenes.length == 0 && imagenes_eliminadas.length == 0) {
                throw new Error("No hubo cambios en los datos de la publicacion");
                return;
            }

            if (validarCampoVacio([descripcion])) {
                throw new Error("El campo descripcion no puede estar vacio");
                return;
            }
            if (tieneEspaciosEnBlancoInicioOFinal(descripcion)) {
                throw new Error("El campo descripcion no puede tener espacios en blanco al inicio o al final");
            }

            if (agregar_ubicacion) {
                if (map_latitude == null || map_longitude == null) {
                    throw new Error("Ubicación desactivada.Para agregar la ubicación a tu publicación, por favor activa los servicios de ubicación en la configuración de tu dispositivo.");
                    return;
                }
            }

            if (agregar_imagenes) {
                if (!validadCantidadArchivos(lista_archivos.length, cantMinArchivos, cantMaxArchivos)) {
                    throw new Error("La cantidad de imagenes no cumplen con los requisitos.Debe ser al menos " + cantMinArchivos + " archivo y como maximo " + cantMaxArchivos + " archivos.");
                    return;
                }
            }
            const formData = new FormData();
            formData.append('id_publicacion_modificar', id_publicacion);
            formData.append('id_usuario', id_usuario);
            formData.append('tipo_usuario', tipo_usuario);
            formData.append('txt_descripcion_modificar', descripcion);
            formData.append('map_latitude', map_latitude);
            formData.append('map_longitude', map_longitude);

            nueva_imagenes.forEach((archivo, index) => {
                formData.append(`files[]`, {
                    uri: archivo.uri,
                    name: archivo.fileName,
                    type: archivo.mimeType,
                });
            });

            for (let nombre_file of imagenes_eliminadas) {
                formData.append('nombres_files_bd[]', nombre_file);
            }

            const response = await axios.post(`${config_define.urlApi}/consultas_bd_publicacion/api_modificarPublicacionDelEmprendedor.php`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data;

        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    throw new Error("Recurso no encontrado: Verifica la URL y los parámetros.");
                } else {
                    throw new Error(`Error del servidor: ${error.response.data.mensaje}`);
                }
            } else if (error.request) {
                throw new Error("No se recibió respuesta del servidor. Verifica tu conexión de red.");
            } else {
                throw new Error(`Error: ${error.message}`);
            }
        }

    },

    bajaPublicacion: async (id_usuario, tipo_usuario, id_publicacion) => {
        try {
            const formData = new FormData();
            formData.append('id_usuario', id_usuario);
            formData.append('tipo_usuario', tipo_usuario);
            formData.append('id_publicacion', id_publicacion);
            const response = await axios.post(`${config_define.urlApi}/consultas_bd_publicacion/api_bajaPublicacionDelEmprendedor.php`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data;

        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    throw new Error("Recurso no encontrado: Verifica la URL y los parámetros.");
                } else {
                    throw new Error(`Error del servidor: ${error.response.data.mensaje}`);
                }
            } else if (error.request) {
                throw new Error("No se recibió respuesta del servidor. Verifica tu conexión de red.");
            } else {
                throw new Error(`Error: ${error.message}`);
            }
        }

    },

    obtenerDatosPublicacion: async (id_usuario, tipo_usuario, id_publicacion) => {

        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_publicacion/api_obtenerDatosPublicacion.php`, {
                params: {
                    id_usuario, tipo_usuario, id_publicacion
                }
            });
            return response.data;

        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    throw new Error("Recurso no encontrado: Verifica la URL y los parámetros.");
                } else {
                    throw new Error(`Error del servidor: ${error.response.data.mensaje}`);
                }
            } else if (error.request) {
                throw new Error("No se recibió respuesta del servidor. Verifica tu conexión de red.");
            } else {
                throw new Error(`Error: ${error.message}`);
            }
        }
    },

    obtenerPuInformacionDeLosEmprendedoresQueSiSegue: async (pagina_publicacion, id_usuario, tipo_usuario) => {
        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_publicacion/api_obtenerPuInformacionDeLosEmprendedoresQueSiSegue.php`, {
                params: {
                    id_usuario, tipo_usuario, pagina_publicacion
                }
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    throw new Error("Recurso no encontrado: Verifica la URL y los parámetros.");
                } else {
                    throw new Error(`Error del servidor: ${error.response.data.mensaje}`);
                }
            } else if (error.request) {
                throw new Error("No se recibió respuesta del servidor. Verifica tu conexión de red.");
            } else {
                throw new Error(`Error: ${error.message}`);
            }
        }
    },

    obtenerListaUltimasPublicacionesGeneral: async (pagina_publicacion) => {

        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_publicacion/api_obtenerListaUltimasPublicacionesGeneral.php`, {
                params: {
                    pagina_publicacion
                }
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    throw new Error("Recurso no encontrado: Verifica la URL y los parámetros.");
                } else {
                    throw new Error(`Error del servidor: ${error.response.data.mensaje}`);
                }
            } else if (error.request) {
                throw new Error("No se recibió respuesta del servidor. Verifica tu conexión de red.");
            } else {
                throw new Error(`Error: ${error.message}`);
            }
        }
    },

    obtenerPublicacionesDelPerfilEmprendedor: async (id_usuario_emprendedor, pagina_actual) => {
        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_publicacion/api_obtenerPublicacionesPerfilEmprendedor.php`, {
                params: {
                    id_usuario_emprendedor, pagina_actual
                }
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    throw new Error("Recurso no encontrado: Verifica la URL y los parámetros.");
                } else {
                    throw new Error(`Error del servidor: ${error.response.data.mensaje}`);
                }
            } else if (error.request) {
                throw new Error("No se recibió respuesta del servidor. Verifica tu conexión de red.");
            } else {
                throw new Error(`Error: ${error.message}`);
            }
        }
    },

    obtenerPublicacionesWhereBuscadorEmprendedor: async (id_usuario, tipo_usuario, fecha, pagina_actual, cant_registro) => {
        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_publicacion/api_obtenerPublicacionesWhereBuscadorEmprendedor.php`, {
                params: {
                    id_usuario, tipo_usuario, fecha, pagina_actual, cant_registro
                }
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    throw new Error("Recurso no encontrado: Verifica la URL y los parámetros.");
                } else {
                    throw new Error(`Error del servidor: ${error.response.data.mensaje}`);
                }
            } else if (error.request) {
                throw new Error("No se recibió respuesta del servidor. Verifica tu conexión de red.");
            } else {
                throw new Error(`Error: ${error.message}`);
            }
        }
    },

};

export default api_publicacion;

