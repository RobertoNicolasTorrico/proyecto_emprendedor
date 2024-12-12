import axios from 'axios';
import { config_define } from '../config_define.js';

const api_seguidores_seguidos = {

    altaSeguirUsuarioEmprendedor: async (id_usuario_emprendedor, id_usuario, tipo_usuario) => {
        try {
            if (id_usuario == null && tipo_usuario == null) {
                throw new Error("Debe estar registrado para poder seguir a un emprendedor.");
            }

            const formData = new FormData();
            formData.append('id_usuario', id_usuario);
            formData.append('tipo_usuario', tipo_usuario);
            formData.append('id_usuario_emprendedor', id_usuario_emprendedor);

            const response = await axios.post(`${config_define.urlApi}/consultas_bd_seguidores_seguidos/api_altaSeguirUsuarioEmprendedor.php`, formData
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

    bajaSeguirUsuarioEmprendedor: async (id_usuario_emprendedor, id_usuario, tipo_usuario) => {
        try {
            const formData = new FormData();
            formData.append('id_usuario', id_usuario);
            formData.append('tipo_usuario', tipo_usuario);
            formData.append('id_usuario_emprendedor', id_usuario_emprendedor);

            const response = await axios.post(`${config_define.urlApi}/consultas_bd_seguidores_seguidos/api_bajaSeguirUsuarioEmprendedor.php`, formData
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

    bajaSeguidor: async (id_usuario_eliminar, id_usuario_emprendedor, id_usuario, tipo_usuario) => {
        try {
            const formData = new FormData();
            formData.append('id_usuario_emprendedor', id_usuario_emprendedor);
            formData.append('id_usuario', id_usuario);
            formData.append('tipo_usuario', tipo_usuario);
            formData.append('id_usuario_eliminar', id_usuario_eliminar);

            const response = await axios.post(`${config_define.urlApi}/consultas_bd_seguidores_seguidos/api_bajaSeguidor.php`, formData
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

    obtenerListaSeguidosUsuario: async (id_usuario, tipo_usuario, pagina_actual, campo_buscar_emprendedor) => {
        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_seguidores_seguidos/api_obtenerListaSeguidos.php`, {
                params: {
                    id_usuario, tipo_usuario, pagina_actual, campo_buscar_emprendedor
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

    obtenerListaSeguidoresEmprendedor: async (id_usuario, tipo_usuario, pagina_actual, campo_buscar_seguidor) => {
        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_seguidores_seguidos/api_obtenerListaSeguidores.php`, {
                params: {
                    id_usuario, tipo_usuario, pagina_actual, campo_buscar_seguidor
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

export default api_seguidores_seguidos;