import axios from 'axios';
import { config_define } from '../config_define.js';
import { tieneEspaciosEnBlancoInicioOFinal, validarCampoVacio } from '../funciones.js';

const api_respuestas = {

    altaRespuesta: async (id_usuario, tipo_usuario, id_pregunta, respuesta_pregunta, id_producto) => {
        try {
            if (validarCampoVacio([respuesta_pregunta])) {
                throw new Error("Por favor complete el campo respuesta");
            }
            if (tieneEspaciosEnBlancoInicioOFinal(respuesta_pregunta)) {
                throw new Error("La respuesta no puede tener espacios en blanco al inicio o al final");
            }

            const formData = new FormData();
            formData.append('id_usuario', id_usuario);
            formData.append('tipo_usuario', tipo_usuario);
            formData.append('id_pregunta', id_pregunta);
            formData.append('respuesta_pregunta', respuesta_pregunta);
            formData.append('id_producto', id_producto);
            const response = await axios.post(`${config_define.urlApi}/consultas_bd_respuestas/api_altaRespuesta.php`, formData
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
                throw new Error(`Error: ${error.message}`);
            }
        }
    },

    bajaRespuesta: async (id_usuario, tipo_usuario, id_pregunta, id_producto) => {
        try {

            const formData = new FormData();
            formData.append('id_usuario', id_usuario);
            formData.append('tipo_usuario', tipo_usuario);
            formData.append('id_pregunta', id_pregunta);
            formData.append('id_producto', id_producto);
            const response = await axios.post(`${config_define.urlApi}/consultas_bd_respuestas/api_bajaRespuesta.php`, formData
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
                throw new Error(`Error: ${error.message}`);
            }
        }
    },

    obtenerListaPreguntasRespuestasEmprendedor: async (id_usuario, tipo_usuario, fecha, campo_buscar_producto, campo_buscar_usuario, pagina_actual, estado, cant_registro, filtro_preguntas) => {
        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_respuestas/api_obtenerListaPreguntasRespuesta.php`, {
                params: {
                    id_usuario, tipo_usuario, fecha, campo_buscar_producto, campo_buscar_usuario, pagina_actual, estado, cant_registro, filtro_preguntas
                }
            });
            return response.data;

        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    throw new Error("Recurso no encontrado: Verifica la URL y los parámetros.");
                } else {
                    console.log(error.response.data);
                    throw new Error(`Error del servidor: ${error.response.data.mensaje}`);
                }
            } else if (error.request) {
                throw new Error("No se recibió respuesta del servidor. Verifica tu conexión de red.");
            } else {
                throw new Error(`Error en la configuración de la solicitud: ${error.message}`);
            }
        }
    },

};

export default api_respuestas;