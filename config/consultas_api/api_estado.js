import axios from 'axios';
import { config_define } from '../config_define.js';

const api_estado = {

    obtenerListaEstados: async () => {
        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_estado/api_obtenerEstadosProducto.php`);
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

};

export default api_estado;