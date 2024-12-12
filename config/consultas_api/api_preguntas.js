import axios from 'axios';
import { config_define } from '../config_define.js';
import { validarCampoVacio, tieneEspaciosEnBlancoInicioOFinal } from '../../config/funciones.js';

const api_preguntas = {

    altaPregunta: async (id_usuario, tipo_usuario, txtPregunta, id_producto) => {
        try {
            if (id_usuario == null || tipo_usuario == null) {
                throw new Error("Debe iniciar sesion para poder hacer una pregunta");
            }
            if (validarCampoVacio([txtPregunta])) {
                throw new Error("Por favor complete el campo pregunta");
            }
            if (tieneEspaciosEnBlancoInicioOFinal(txtPregunta)) {
                throw new Error("La pregunta no puede tener espacios en blanco al inicio o al final");
            }

            const formData = new FormData();
            formData.append('id_usuario', id_usuario);
            formData.append('tipo_usuario', tipo_usuario);
            formData.append('txt_pregunta', txtPregunta);
            formData.append('id_producto', id_producto);

            const response = await axios.post(`${config_define.urlApi}/consultas_bd_preguntas/api_altaPregunta.php`, formData
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

    bajaPregunta: async (id_usuario, tipo_usuario, id_pregunta) => {
        try {

            const formData = new FormData();
            formData.append('id_usuario', id_usuario);
            formData.append('tipo_usuario', tipo_usuario);
            formData.append('id_pregunta', id_pregunta);

            const response = await axios.post(`${config_define.urlApi}/consultas_bd_preguntas/api_bajaPregunta.php`, formData
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

    obtenerListaPreguntasProducto: async (id_usuario, tipo_usuario, id_producto) => {

        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_preguntas/api_obtenerListaPreguntasDeProducto.php`, {
                params: {
                    id_usuario, tipo_usuario, id_producto
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

    obtenerListaPreguntasUsuario: async (id_usuario, tipo_usuario, campo_buscar, cant_registro, numero_pagina, cant_dias, estado) => {

        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_preguntas/api_obtenerListaPreguntasUsuario.php`, {
                params: {
                    id_usuario, tipo_usuario, campo_buscar, cant_registro, numero_pagina, cant_dias, estado
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

export default api_preguntas;