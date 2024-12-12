import axios from 'axios';
import { config_define } from '../config_define.js';
import {validarCampoVacio, listaTieneEspacioEnBlanco, listaNumEmpiezaConPunto, validadCantidadArchivos, listaValorNoNumerico, listaNumNoPositivo } from '../../config/funciones.js';

const api_producto = {

    altaProducto: async (id_usuario, tipo_usuario, nombre_producto, descripcion, categoria_producto, precio, stock, lista_imagenes) => {
        try {
            var cantMinArchivos = 1;
            var cantMaxArchivos = 5;
            var campos_verificar_text = [nombre_producto, descripcion];
            var campos_verificar_num = [precio, stock];
            var lista_detalles_num = {
                "Precio": precio,
                "Stock": stock
            };
            var lista_detalles = {
                "Nombre del producto": nombre_producto,
                "Descripción del producto": descripcion
            };

            if (validarCampoVacio(campos_verificar_text) || (categoria_producto == null) || validarCampoVacio(campos_verificar_num)) {
                throw new Error("Por favor complete todos los campos");
                return;
            }

            if (!validadCantidadArchivos(lista_imagenes.length, cantMinArchivos, cantMaxArchivos)) {
                throw new Error("La cantidad de imagenes no cumplen con los requisitos.Debe ser al menos " + cantMinArchivos + " imagen y como maximo " + cantMaxArchivos + " imagenes.");
                return;
            }

            var lista_errores = listaTieneEspacioEnBlanco(lista_detalles);
            if (lista_errores.length > 0) {
                throw new Error("No se permite que los campos tengan espacios en blanco al inicio o al final. Los siguientes campos no cumplen con esto: " + lista_errores.join(", ") + ".");
                return;
            }
            var lista_errores = listaNumEmpiezaConPunto(lista_detalles_num);
            if (lista_errores.length > 0) {
                throw new Error("Los campos numericos no pueden comenzar con un punto.Los siguientes campos no cumplen con esto:  " + lista_errores.join(", ") + ".");
                return;
            }

            var lista_errores = listaValorNoNumerico(lista_detalles_num);
            if (lista_errores.length > 0) {
                throw new Error("Solo se perimite ingresar valores numericos en los siguientes campos:  " + lista_errores.join(", ") + ".");
                return;
            }

            var lista_errores = listaNumNoPositivo(lista_detalles_num);
            if (lista_errores.length > 0) {
                throw new Error("Solo se perimite ingresar valores numericos positivos. Los siguientes campos no cumplen eso: " + lista_errores.join(", ") + ".");
                return;
            }
            const formData = new FormData();
            formData.append('id_usuario', id_usuario);
            formData.append('tipo_usuario', tipo_usuario);
            formData.append('nombre_producto', nombre_producto);
            formData.append('descripcion', descripcion);
            formData.append('categoria_producto', categoria_producto);
            formData.append('precio', precio);
            formData.append('stock', stock);
            lista_imagenes.forEach((imagen, index) => {
                formData.append(`files[]`, {
                    uri: imagen.uri,
                    name: imagen.fileName,
                    type: imagen.mimeType,
                });
            });
            const response = await axios.post(`${config_define.urlApi}/consultas_bd_producto/api_altaProductoDelEmprendedor.php`, formData, {
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

    modificarProducto: async (id_producto, id_usuario, tipo_usuario, nombre_producto, descripcion, precio, stock, categoria_producto, estado_productos, lista_imagenes, lista_imagenes_bd, detalles_producto_bd) => {
        try {


            var cantMinArchivos = 1;
            var cantMaxArchivos = 5;

            var campos_verificar_text = [nombre_producto, descripcion];

            var campos_verificar_num = [precio, stock];

            var lista_detalles_num = {
                "Precio": precio,
                "Stock": stock
            };
            var lista_detalles = {
                "Nombre del producto": nombre_producto,
                "Descripción del producto": descripcion
            };

            const imagenes_eliminadas = lista_imagenes_bd.filter(nombre_bd =>
                !lista_imagenes.some(imagen => imagen.uri.includes(nombre_bd))
            );

            const nueva_imagenes = lista_imagenes.filter(imagen =>
                imagen.uri.startsWith('file:///')
            );

            if (detalles_producto_bd.nombre_producto == nombre_producto && detalles_producto_bd.descripcion == descripcion && detalles_producto_bd.precio == precio && detalles_producto_bd.stock == stock && detalles_producto_bd.id_categoria_producto == categoria_producto && detalles_producto_bd.id_estado_producto == estado_productos && nueva_imagenes.length == 0 && imagenes_eliminadas.length == 0) {
                throw new Error("No hubo cambios en los datos del producto");
                return;
            }

            if (validarCampoVacio(campos_verificar_text) || (categoria_producto == null) || (estado_productos == null) || validarCampoVacio(campos_verificar_num)) {
                throw new Error("Por favor complete todos los campos");
                return;
            }

            if (!validadCantidadArchivos(lista_imagenes.length, cantMinArchivos, cantMaxArchivos)) {
                throw new Error("La cantidad de imagenes no cumplen con los requisitos.Debe ser al menos " + cantMinArchivos + " imagen y como maximo " + cantMaxArchivos + " imagenes.");
                return;
            }

            var lista_errores = listaTieneEspacioEnBlanco(lista_detalles);
            if (lista_errores.length > 0) {
                throw new Error("No se permite que los campos tengan espacios en blanco al inicio o al final. Los siguientes campos no cumplen con esto: " + lista_errores.join(", ") + ".");
                return;
            }
            var lista_errores = listaNumEmpiezaConPunto(lista_detalles_num);
            if (lista_errores.length > 0) {
                throw new Error("Los campos numericos no pueden comenzar con un punto.Los siguientes campos no cumplen con esto:  " + lista_errores.join(", ") + ".");
                return;
            }

            var lista_errores = listaValorNoNumerico(lista_detalles_num);
            if (lista_errores.length > 0) {
                throw new Error("Solo se perimite ingresar valores numericos en los siguientes campos:  " + lista_errores.join(", ") + ".");
                return;
            }

            var lista_errores = listaNumNoPositivo(lista_detalles_num);
            if (lista_errores.length > 0) {
                throw new Error("Solo se perimite ingresar valores numericos positivos. Los siguientes campos no cumplen eso: " + lista_errores.join(", ") + ".");
                return;
            }

            const formData = new FormData();

            formData.append('id_producto', id_producto);
            formData.append('id_usuario', id_usuario);
            formData.append('tipo_usuario', tipo_usuario);
            formData.append('nombre_producto', nombre_producto);
            formData.append('descripcion', descripcion);
            formData.append('categoria_producto', categoria_producto);
            formData.append('estado_producto', estado_productos);
            formData.append('precio', precio);
            formData.append('stock', stock);

            nueva_imagenes.forEach((imagen, index) => {
                formData.append(`files[]`, {
                    uri: imagen.uri,
                    name: imagen.fileName,
                    type: imagen.mimeType,
                });
            });

            for (let nombre_file of imagenes_eliminadas) {
                formData.append('nombres_files_bd[]', nombre_file);
            }
            const response = await axios.post(`${config_define.urlApi}/consultas_bd_producto/api_modificarProductoDelEmprendedor.php`, formData, {
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

    bajaProducto: async (id_usuario, tipo_usuario, id_producto) => {
        try {
            const formData = new FormData();
            formData.append('id_usuario', id_usuario);
            formData.append('tipo_usuario', tipo_usuario);
            formData.append('id_producto_eliminar', id_producto);
            const response = await axios.post(`${config_define.urlApi}/consultas_bd_producto/api_bajaProductoDelEmprendedor.php`, formData, {
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

    obtenerListaProductosConImagenesBuscador: async (campo_buscar, numero_pagina, num_ordenamiento, precio_minimo, precio_maximo, calificacion, num_categoria) => {
        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_producto/api_obtenerListaBusquedaProductoWhereASCDESCLimit.php`, {
                params: {
                    campo_buscar, numero_pagina, num_ordenamiento, precio_minimo, precio_maximo, calificacion, num_categoria
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

    obtenerDatosProducto: async (id_usuario, tipo_usuario, id_producto) => {

        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_producto/api_obtenerDatosProducto.php`, {
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

    obtenerProductosDeLosEmprendedoresQueSiSegue: async (pagina_producto, id_usuario, tipo_usuario) => {
        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_producto/api_obtenerProductosDeLosEmprendedoresQueSiSegue.php`, {
                params: {
                    pagina_producto, id_usuario, tipo_usuario
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

    obtenerListaProductosDisponiblesParaIndex: async () => {
        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_producto/api_obtenerListaProductosDisponiblesParaIndex.php`);

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

    obtenerProductoWhereBuscadorEmprendedor: async (id_usuario, tipo_usuario, campo_buscar, categoria, estado, fecha, pagina_actual, cant_registro) => {
        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_producto/api_obtenerProductoWhereBuscadorEmprendedor.php`, {
                params: {
                    id_usuario, tipo_usuario, campo_buscar, categoria, estado, fecha, pagina_actual, cant_registro
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


    obtenerProductosBuscadorDelPerfilEmprendedor: async (id_usuario_emprendedor, campo_buscar, numero_pagina, num_ordenamiento, precio_minimo, precio_maximo, calificacion, num_categoria, estado) => {
        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_producto/api_obtenerProductosPerfilEmprendedor.php`, {
                params: {
                    id_usuario_emprendedor, campo_buscar, numero_pagina, num_ordenamiento, precio_minimo, precio_maximo, calificacion, num_categoria, estado
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

export default api_producto;