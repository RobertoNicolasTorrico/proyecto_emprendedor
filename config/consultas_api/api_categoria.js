import axios from 'axios';
import { config_define } from '../config_define.js';


const api_categoria = {


    obtenerListaCategoria: async () => {
        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_categoria/api_obtenerCategoriasProducto.php`);
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
                throw new Error(`Error en la configuración de la solicitud: ${error.message}`);
            }
        }
    },

    obtenerListaCategoriaProductosEmprendedor: async (id_usuario) => {
        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_categoria/api_obtenerCategoriasDeProductosEmprendedor.php`, {
                params: {
                    id_usuario
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
                throw new Error(`Error en la configuración de la solicitud: ${error.message}`);
            }
        }
    },
};

export default api_categoria;


