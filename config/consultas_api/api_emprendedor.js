
import axios from 'axios';
import { config_define } from '../config_define.js';
import { tieneEspaciosEnBlancoInicioOFinal } from '../funciones.js';

const api_emprendedor = {


    modificarDatosEmprendimiento: async (id_usuario, tipo_usuario, descripcionEmprendimiento, nueva_imagen, DatosOriginales) => {
        try {

            let descripcion_actual = (DatosOriginales.descripcion == null ? '' : DatosOriginales.descripcion);
            if (descripcionEmprendimiento == descripcion_actual && nueva_imagen.length == 0) {
                throw new Error("No hubo cambios en los datos del emprendimiento");
                return;
            }

            if (descripcionEmprendimiento != '') {
                if (tieneEspaciosEnBlancoInicioOFinal(descripcionEmprendimiento)) {
                    throw new Error("El campo descripcion del empredimiento no puede tener espacios en el blanco al inicio o al final");
                }
            }
            const formData = new FormData();
            formData.append('id_usuario', id_usuario);
            formData.append('tipo_usuario', tipo_usuario);

            if (descripcionEmprendimiento != '') {
                formData.append('descripcion', descripcionEmprendimiento);
            }

            if (nueva_imagen.length == 1) {
                formData.append(`file`, {
                    uri: nueva_imagen[0].uri,
                    name: nueva_imagen[0].fileName,
                    type: nueva_imagen[0].mimeType,
                });
            }
            const response = await axios.post(`${config_define.urlApi}/consultas_bd_usuario_emprendedor/api_modificarDatosEmprendimiento.php`, formData
                , {
                    headers: {
                        'Content-Type': 'multipart/form-data',
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
                throw new Error(`${error.message}`);
            }
        }
    },


    obtenerListaEmprendedoresBuscador: async (id_usuario, tipo_usuario, campo_buscar_emprendedor, numero_pagina, num_ordenamiento, calificacion) => {
        try {

            const params = {
                campo_buscar_emprendedor,
                numero_pagina,
                num_ordenamiento,
                calificacion,
            };
            if (id_usuario != null && tipo_usuario != null) {
                params.id_usuario = id_usuario;
                params.tipo_usuario = tipo_usuario;
            }
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_usuario_emprendedor/api_obtenerListaBusquedaEmprendedoresWhereASCDESCLimit.php`, { params });

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

    obtenerListaEmprendedoresActivosParaIndex: async () => {
        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_usuario_emprendedor/api_obtenerListaEmprendedoresActivosParaIndex.php`);
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

    obtenerDetallesPerfilEmprendedor: async (id_usuario_emprendedor, id_usuario, tipo_usuario) => {
        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_usuario_emprendedor/api_obtenerPerfilDelEmprendedor.php`, {
                params: {
                    id_usuario_emprendedor, id_usuario, tipo_usuario
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

    obtenerDatosPersonalesEmprendimiento: async (id_usuario, tipo_usuario) => {
        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_usuario_emprendedor/api_obtenerDatosUsuarioEmprendedor.php`, {
                params: {
                    id_usuario, tipo_usuario
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

export default api_emprendedor;