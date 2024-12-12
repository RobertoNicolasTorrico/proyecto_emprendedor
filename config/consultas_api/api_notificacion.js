import axios from 'axios';
import { config_define } from '../config_define.js';

const api_notificacion = {

    modificarNotificacionALeida: async (id_usuario, tipo_usuario, array_id_notificaciones) => {
        try {
            const formData = new FormData();
            formData.append('id_usuario', id_usuario);
            formData.append('tipo_usuario', tipo_usuario);
            for (let id_notificacion of array_id_notificaciones) {
                formData.append('id_notificaciones[]', id_notificacion);
            }
            const response = await axios.post(`${config_define.urlApi}/consultas_bd_notificacion/api_modificarNotificacionALeida.php`, formData
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

    bajaNotificacion: async (id_usuario, tipo_usuario, id_notificacion) => {
        try {
            const formData = new FormData();
            formData.append('id_usuario', id_usuario);
            formData.append('tipo_usuario', tipo_usuario);
            formData.append('id_notificacion', id_notificacion);

            const response = await axios.post(`${config_define.urlApi}/consultas_bd_notificacion/api_bajaNotificacion.php`, formData
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

    obtenerCandidadNotificacionesSinLeer: async (id_usuario, tipo_usuario) => {
        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_notificacion/api_obtenerCantidadNotificacionesSinLeerUsuario.php`, {
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

    obtenerListaNotificaciones: async (id_usuario, tipo_usuario, numero_pagina, cant_dias, estado) => {
        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_notificacion/api_obtenerNotificaciones.php`, {
                params: {
                    id_usuario, tipo_usuario, numero_pagina, cant_dias, estado
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

export default api_notificacion;