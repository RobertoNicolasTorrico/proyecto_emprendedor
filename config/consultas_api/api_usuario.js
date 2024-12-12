import axios from 'axios';
import { config_define } from '../config_define.js';

import { validarCampoEmail, validarCampoVacio, tieneEspacioEnBlaco, validarIgualdadPassword, listaTieneEspacioEnBlanco } from '../../config/funciones.js';

const api_usuario = {

    altaUsuario: async (nombre_usuario, nombre_emprendimiento, tipo_usuario, nombres, apellidos, email, password, confirmar_password) => {
        try {
            var campos_verificar = [nombre_usuario, tipo_usuario, nombres, apellidos, email, password, confirmar_password];

            var lista_detalles = {
                "Nombres": nombres,
                "Apellidos": apellidos
            };

            if (tipo_usuario == 2) {
                campos_verificar.push(nombre_emprendimiento);
                lista_detalles["Nombre del Emprendimiento"] = nombre_emprendimiento;
            }

            if (validarCampoVacio(campos_verificar)) {
                throw new Error("Por favor complete todos los campos");
                return;
            }
            if (tieneEspacioEnBlaco(nombre_usuario)) {
                throw new Error("El nombre de usuario no puede tener espacios en blanco");
                return;
            }
            if (!validarCampoEmail(email)) {
                throw new Error("Por favor ingrese un email con formato valido");
                return;
            }

            var lista_errores = listaTieneEspacioEnBlanco(lista_detalles);
            if (lista_errores.length > 0) {
                throw new Error("No se permite que los campos tengan espacios en blanco al inicio o al final. Los siguientes campos no cumplen con esto: " + lista_errores.join(", ") + ".");
                return;
            }


            if (tieneEspacioEnBlaco(password)) {
                throw new Error("El campo contraseña no puede tener espacios en blanco");
                return;
            }
            if (!validarIgualdadPassword(password, confirmar_password)) {
                throw new Error("Los campos contraseña y confirmacion de contraseña no son iguales");
                return;
            }

            const formData = new FormData();
            formData.append('nombre_usuario', nombre_usuario.trim());
            formData.append('nombres', nombres.trim());
            formData.append('apellidos', apellidos.trim());
            formData.append('email', email.trim());
            formData.append('password', password.trim());
            formData.append('confirmar_password', confirmar_password.trim());
            formData.append('tipo_usuario', tipo_usuario.trim());

            if (tipo_usuario == 2) {
                formData.append('nombre_emprendimiento', nombre_emprendimiento.trim());
            }
            const response = await axios.post(`${config_define.urlApi}/consultas_bd_usuario/api_altaUsuario.php`, formData
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

    desactivarCuentaUsuario: async (id_usuario, tipo_usuario, password) => {
        try {

            if (validarCampoVacio([password])) {
                throw new Error("Por favor complete el campo contraseña");
            }

            if (tieneEspacioEnBlaco(password)) {
                throw new Error("La contraseña no puede tener espacios en blanco");
            }

            const formData = new FormData();
            formData.append('id_usuario', id_usuario.trim());
            formData.append('tipo_usuario', tipo_usuario.trim());
            formData.append('password', password.trim());
            const response = await axios.post(`${config_define.urlApi}/consultas_bd_usuario/api_desactivarCuentaUsuario.php?`, formData
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

    modificarDatosPersonalesUsuario: async (id_usuario, tipo_usuario, nombres, apellidos, DatosOriginales) => {
        try {
            var campos_verificar = [id_usuario, tipo_usuario, nombres, apellidos];
            var lista_detalles = {
                "Nombres": nombres,
                "Apellidos": apellidos
            };

            if (validarCampoVacio(campos_verificar)) {
                throw new Error("Por favor complete todos los campos");
                return;
            }

            if (DatosOriginales.nombres == nombres && DatosOriginales.apellidos == apellidos) {
                throw new Error("No hubo cambios en los datos personales del usuario");
                return;
            }


            var lista_errores = listaTieneEspacioEnBlanco(lista_detalles);
            if (lista_errores.length > 0) {
                throw new Error("No se permite que los campos tengan espacios en blanco al inicio o al final. Los siguientes campos no cumplen con esto: " + lista_errores.join(", ") + ".");
                return;
            }

            const formData = new FormData();
            formData.append('id_usuario', id_usuario.trim());
            formData.append('tipo_usuario', tipo_usuario.trim());
            formData.append('nombres', nombres.trim());
            formData.append('apellidos', apellidos.trim());

            const response = await axios.post(`${config_define.urlApi}/consultas_bd_usuario/api_modificarDatosPersonales.php`, formData
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

    modificarEmailDelUsuario: async (id_usuario, tipo_usuario, email_nuevo, confirmar_password) => {
        try {

            var campos_verificar = [email_nuevo, confirmar_password];

            if (validarCampoVacio(campos_verificar)) {
                throw new Error("Por favor complete todos los campos");
                return;
            }

            if (!validarCampoEmail(email_nuevo)) {
                throw new Error("Por favor ingrese un email con formato valido");
                return;
            }
            if (tieneEspacioEnBlaco(confirmar_password)) {
                throw new Error("La contraseña no puede tener espacios en blanco");
                return;
            }

            const formData = new FormData();
            formData.append('id_usuario', id_usuario.trim());
            formData.append('tipo_usuario', tipo_usuario.trim());
            formData.append('email', email_nuevo.trim());
            formData.append('password', confirmar_password.trim());

            const response = await axios.post(`${config_define.urlApi}/consultas_bd_usuario/api_modificarEmail.php`, formData
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

    modificarPasswordDelUsuario: async (id_usuario, tipo_usuario, passwordActual, nuevaPassword, confirmarPassword) => {
        try {
            var campos_verificar = [passwordActual, nuevaPassword, confirmarPassword];

            if (validarCampoVacio(campos_verificar)) {
                throw new Error("Por favor complete todos los campos");
                return;
            }

   
            var lista_detalles = {
                "Contraseña actual": passwordActual,
                "Nueva contraseña": nuevaPassword,
                "Confirmar nueva contraseña": confirmarPassword,
            };


            var lista_errores = listaTieneEspacioEnBlanco(lista_detalles);
            if (lista_errores.length > 0) {
                throw new Error("No se permite que los campos tengan espacios en blanco. Los siguientes campos no cumplen con esto: " + lista_errores.join(", ") + ".");
                return;
            }

            if (tieneEspacioEnBlaco(nuevaPassword)) {
                throw new Error("La nueva contraseña no puede tener espacios en blanco");
                return;
            }
            if (!validarIgualdadPassword(nuevaPassword, confirmarPassword)) {
                throw new Error("Los campos nueva contraseña y confirmacion de nueva contraseña no son iguales");
                return;
            }


            const formData = new FormData();
            formData.append('id_usuario', id_usuario.trim());
            formData.append('tipo_usuario', tipo_usuario.trim());
            formData.append('password_actual', passwordActual.trim());
            formData.append('password_nueva', nuevaPassword.trim());
            formData.append('password_nueva_confirmacion', confirmarPassword.trim());

            const response = await axios.post(`${config_define.urlApi}/consultas_bd_usuario/api_modificarPassword.php`, formData
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

    loginUsuario: async (email, password) => {
        try {

            if (validarCampoVacio([email, password])) {
                throw new Error("Por favor complete todos los campos");
            }
            if (!validarCampoEmail(email)) {
                throw new Error("Por favor ingrese un email con formato valido");
            }

            if (tieneEspacioEnBlaco(password)) {
                throw new Error("La contraseña no puede tener espacios en blanco");
            }
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            const response = await axios.post(`${config_define.urlApi}/consultas_bd_usuario/api_loginUsuario.php?`, formData
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

    volverEnviarEmailActivacion: async (email) => {
        try {

            if (validarCampoVacio([email])) {
                throw new Error("Por favor complete el campo email");
            }
            if (!validarCampoEmail(email)) {
                throw new Error("Por favor ingrese un email con formato valido");
            }
            const formData = new FormData();
            formData.append('email', email.trim());
            const response = await axios.post(`${config_define.urlApi}/consultas_bd_usuario/api_volverEnviarEmailActivarCuentaUsuario.php`, formData
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

    verificarSiEsUsuarioValido: async (id_usuario, tipo_usuario) => {
        try {

            if (validarCampoVacio([id_usuario, tipo_usuario])) {
                return false;
            }
            const formData = new FormData();
            formData.append('id_usuario', id_usuario);
            formData.append('tipo_usuario', tipo_usuario);
            const response = await axios.post(`${config_define.urlApi}/consultas_bd_usuario/api_verificarSiEsUsuarioValido.php`, formData
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

    recuperarPasswordUsuario: async (email) => {
        try {

            if (validarCampoVacio([email])) {
                throw new Error("Por favor complete el campo Email");
            }
            if (!validarCampoEmail(email)) {
                throw new Error("Por favor ingrese un email con formato valido");
            }
            const formData = new FormData();
            formData.append('email', email.trim());
            const response = await axios.post(`${config_define.urlApi}/consultas_bd_usuario/api_enviarEmailRecuperarPassword.php`, formData
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

    obtenerDatosPersonalesUsuario: async (id_usuario, tipo_usuario) => {
        try {
            const response = await axios.get(`${config_define.urlApi}/consultas_bd_usuario/api_datosDeUsuario.php`, {
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

export default api_usuario;
