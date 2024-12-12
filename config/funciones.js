import React from 'react';
import { ScrollView, View, TouchableOpacity, Text, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { styles } from '../estilos/estilos.js';
import api_notificacion from '../config/consultas_api/api_notificacion.js';

export function validarCampoEmail(valor) {

  var expresion_regular = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return expresion_regular.test(valor);
}


export function validarCampoVacio(campos) {
  for (let i = 0; i < campos.length; i++) {
    if (campos[i].trim() === '') {
      return true;
    }
  }
  return false;
}

export function tieneEspacioEnBlancoPassword(password) {
  return password.includes(' ');
}


export const renderPaginationButtons = (total_paginas, pagina_actual, registro, pagina, cambiarPagina) => {
  const visiblePages = 5;
  let startPage = Math.max(1, pagina_actual - Math.floor(visiblePages / 2));
  let endPage = Math.min(total_paginas, pagina_actual + Math.floor(visiblePages / 2));

  if (endPage - startPage + 1 < visiblePages) {
    if (pagina_actual < total_paginas / 2) {
      endPage = Math.min(total_paginas, startPage + visiblePages - 1);
    } else {
      startPage = Math.max(1, endPage - visiblePages + 1);
    }
  }

  let pages = [];

  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) {
      pages.push('...');
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < total_paginas) {
    if (endPage < total_paginas - 1) {
      pages.push('...');
    }
    pages.push(total_paginas);
  }
  var estadoHorizontal = (total_paginas > 6);
  return (
    <View>
      <Text style={{ paddingStart: 15, marginTop: 5, fontSize: 16 }}>{pagina}</Text>
      {registro && (
        <Text style={{ paddingStart: 15, marginTop: 5, marginBottom: 10, fontSize: 16 }}>{registro}</Text>
      )}
      <ScrollView horizontal={estadoHorizontal} showsHorizontalScrollIndicator={estadoHorizontal}>
        <View style={styles.paginacionContainer}>
          {pages.map((page, index) => (
            <TouchableOpacity
              key={index}
              style={pagina_actual === page ? styles.paginaActiva : styles.paginaInactiva}
              onPress={() => typeof page === 'number' && cambiarPagina(page)}
              underlayColor="white"
            >
              <Text style={pagina_actual === page ? styles.TextoActivo : styles.TextoInactivo}>{page}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export const mostrarMensaje = (mensaje, tipo) => {
  let viewEstiloMensaje = {};
  let textEstiloMensaje = {};

  switch (tipo) {
    case 'danger':
      viewEstiloMensaje = styles.view_mensaje_error;
      textEstiloMensaje = styles.text_mensaje_error;
      break;
    case 'success':
      viewEstiloMensaje = styles.view_mensaje_confirmacion;
      textEstiloMensaje = styles.text_mensaje_confirmacion;

      break;
    case 'info':
      viewEstiloMensaje = styles.view_mensaje_info;
      textEstiloMensaje = styles.text_mensaje_info;

      break;
  }
  return (
    <View style={[viewEstiloMensaje, styles.view_mensaje]}>
      <Text style={[textEstiloMensaje, styles.view_mensaje_tamanio_text]}>
        {mensaje}
      </Text>
    </View>
  );
};


export const obtenerCantNotificacionesSinLeer = async (id_usuario, tipo_usuario, navigation) => {
  let notificacionSinLeer = 0;
  try {
    const respuesta = await api_notificacion.obtenerCandidadNotificacionesSinLeer(id_usuario, tipo_usuario);
    notificacionSinLeer = respuesta.notificacionesSinLeer;
  } catch (error) {
    Alert.alert("Aviso", error.message);
  } finally {
    headerNotificaciones(notificacionSinLeer, navigation);
  }
};


export const headerNotificaciones = (cantNotificaciones, navigation) => {
  let cantidadNotificacionSinLeer;
  if (cantNotificaciones > 99) {
    cantidadNotificacionSinLeer = '+99';
  } else {
    cantidadNotificacionSinLeer = cantNotificaciones;
  }
  navigation.setOptions({
    headerRight: () => (
      <View style={{ marginRight: 20 }}>
        <TouchableOpacity
          underlayColor="grey"
          onPress={() => {
            navigation.navigate("ScreenNotificaciones");
          }}>
          <View style={{ position: 'relative' }}>
            <FontAwesomeIcon icon={faBell} size={27} color="black" />
            {cantNotificaciones > 0 && (
              <View style={{
                position: 'absolute',
                top: -5,
                right: -5,
                backgroundColor: 'red',
                borderRadius: 10,
                width: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 'bold',
                }}>{cantidadNotificacionSinLeer}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    ),
  })
};



export const obtenerTiempoTranscurrido = (fecha) => {
  const fecha_actual = new Date();
  const marcar_tiempo = new Date(fecha);

  const diferencia = Math.floor((fecha_actual - marcar_tiempo) / 1000);

  if (diferencia < 60) { // Menos de un minuto
    return "Hace unos segundos";
  } else
    if (diferencia < 3600) { // Menos de una hora
      const minutos = Math.floor(diferencia / 60);
      if (minutos == 1) {
        return `Hace 1 minuto`;
      } else {
        return `Hace ${minutos} minutos`;
      }
    } else
      // Calcular el tiempo transcurrido en días, semanas o meses
      if (diferencia < 86400) { // Menos de un día
        const horas = Math.floor(diferencia / 3600);
        if (horas == 1) {
          return `Hace 1 hora`;
        } else {
          return `Hace ${horas} horas`;
        }
      } else
        if (diferencia < 604800) { // Menos de una semana
          const dias = Math.floor(diferencia / 86400);

          if (dias == 1) {
            return `Hace 1 día`;
          } else {
            return `Hace ${dias} dias`;
          }
        } else
          if (diferencia < 2592000) { // Menos de un mes
            const semanas = Math.floor(diferencia / 604800);

            if (semanas == 1) {
              return `Hace 1 semana`;
            } else {
              return `Hace ${semanas} semanas`;
            }
          } else { // Más de un mes
            const meses = Math.floor(diferencia / 2592000);

            if (meses == 1) {
              return `Hace 1 mes`;
            } else {
              return `Hace ${meses} meses`;
            }
          }
};




export const formatearFecha = (fecha) => {
  const date = new Date(fecha);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0'); // Los meses en JavaScript son 0-11
  const año = date.getFullYear();
  const horas = String(date.getHours()).padStart(2, '0');
  const minutos = String(date.getMinutes()).padStart(2, '0');
  const segundos = String(date.getSeconds()).padStart(2, '0');

  return `${dia}/${mes}/${año} ${horas}:${minutos}:${segundos}`;
};

export const formatearFechaPost = (fecha) => {
  const date = new Date(fecha);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0'); // Los meses en JavaScript son 0-11
  const año = date.getFullYear();
  const horas = String(date.getHours()).padStart(2, '0');
  const minutos = String(date.getMinutes()).padStart(2, '0');
  const segundos = String(date.getSeconds()).padStart(2, '0');

  return `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
};



export const formatPrecio = (precio) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(precio).replace(',', '.');
};


export const formatearDia = (fecha) => {
  const date = new Date(fecha);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const año = date.getFullYear();
  return `${dia}/${mes}/${año}`;
};

export const formatearFechaBusqueda = (fecha) => {
  const date = new Date(fecha);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const año = date.getFullYear();
  return `${año}/${mes}/${dia}`;
};
export const formatearHora = (fecha) => {
  const date = new Date(fecha);
  let hours = String(date.getHours());
  let minutes = String(date.getMinutes());
  return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
};

export const pasarStringsADate = (fecha, horario) => {
  let [dia, mes, anio] = fecha.split('/').map(Number);
  let [hora, minutos] = horario.split(':').map(Number);

  let date = new Date(anio, mes - 1, dia, hora, minutos);
  return date;
};



export function esImagen(nombreArchivo) {
  const extensionesImagenes = ['jpg', 'jpeg', 'png'];
  const extension = nombreArchivo.split('.').pop().toLowerCase();
  return extensionesImagenes.includes(extension);
};

export function formatearFechaTextInput(date) {
  if (!date) {
    return 'dd/mm/aaaa';
  }
  const opciones = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return date.toLocaleDateString('es-ES', opciones);
};

export function validarArchivosFotoPerfil(archivo) {
  const extensionesImagen = ["/jpg", "/jpeg", "/png"];
  const tamanioMaxImg = 10 * 1024 * 1024;
  if (archivo.length > 1) {
    Alert.alert('Aviso', `Solo se puede subir una imagen.`);
    return false;
  }
  const extension = `/${archivo[0].mimeType.split('/').pop()}`;
  if (extensionesImagen.includes(extension)) {
    if (archivo[0].filesize <= tamanioMaxImg) {
      return true;
    } else {
      Alert.alert('Aviso', `La imagen ${archivo[0].fileName} excede el tamaño maximo permido de 10 MB.`);
      return false;
    }
  } else {
    Alert.alert('Aviso', `El formato del archivo ${archivo[0].fileName} no es valido. Formatos permitidos: JPEG, JPG y PNG.`);
    return false;
  }
  return true
}



export function validarArchivosProducto(lista_archivos) {
  const archivosValidos = [];
  const extensionesImagen = ["/jpg", "/jpeg", "/png"];
  const tamanioMaxImg = 10 * 1024 * 1024;

  lista_archivos.forEach(archivo => {
    const extension = `/${archivo.mimeType.split('/').pop()}`;
    if (extensionesImagen.includes(extension)) {
      if (archivo.filesize <= tamanioMaxImg) {
        archivosValidos.push(archivo);
      } else {
        Alert.alert('Aviso', `La imagen ${archivo.fileName} pesa más de 10 MB y no será agregada.`);
      }
    } else {
      Alert.alert('Aviso', `La imagen ${archivo.fileName} no es una imagen con un formato valido(.jpeg/.jpg/.png/) y no sera agregada.`);
    }
  });

  return archivosValidos;
}

export function validarArchivosPublicacion(lista_archivos) {
  const archivosValidos = [];
  const extensionesImagen = ["/jpg", "/jpeg", "/png"];
  const extensionesVideo = ["/mp4", "/mkv", "/avi"];
  const tamanioMaxImg = 10 * 1024 * 1024;
  const tamanioMaxVideo = 100 * 1024 * 1024;

  lista_archivos.forEach(archivo => {
    const extension = `/${archivo.mimeType.split('/').pop()}`;
    if (extensionesImagen.includes(extension)) {
      if (archivo.filesize <= tamanioMaxImg) {
        archivosValidos.push(archivo);
      } else {
        Alert.alert('Aviso', `La imagen ${archivo.fileName} pesa más de 10 MB y no será agregada.`);
      }

    } else {
      if (extensionesVideo.includes(extension)) {
        if (archivo.filesize <= tamanioMaxVideo) {
          archivosValidos.push(archivo);
        } else {
          Alert.alert('Aviso', `El video ${archivo.fileName} pesa más de 100 MB y no será agregada.`);
        }
      } else {
        Alert.alert('Aviso', `El archivo ${archivo.fileName} no tiene un formato válido(.jpeg/.jpg/.png/.mp4/.avi/.mov) y no será agregado.`);
      }
    }

  });

  return archivosValidos;
}



export function tieneEspacioEnBlaco(campo) {
  return campo.includes(' ');
}

export function validarIgualdadPassword(password1, password2) {
  return password1.trim() === password2.trim();
}

export function listaTieneEspacioEnBlanco(lista) {

  var errores = [];
  for (let key in lista) {
    if (lista[key].trim() !== lista[key]) {
      errores.push(key);
    }
  }
  return errores;
}

export function tieneEspaciosEnBlancoInicioOFinal(elemento) {
  return elemento.trim() !== elemento;
}


export function validadCantidadArchivos(cantidad, cant_min, cant_max) {
  return cantidad >= cant_min && cantidad <= cant_max;
}


export function listaNumNoPositivo(lista) {
  var errores = [];
  for (let key in lista) {
    if (!(lista[key].trim() >= 0)) {
      errores.push(key);
    }
  }
  return errores;
}

export function listaValorNoNumerico(lista) {
  var errores = [];
  for (let key in lista) {
    if (isNaN(lista[key].trim())) {
      errores.push(key);
    }
  }
  return errores;
}

export function listaNumEmpiezaConPunto(lista) {
  var errores = [];
  for (let key in lista) {
    if ((lista[key].trim().startsWith('.'))) {
      errores.push(key);
    }
  }
  return errores;
}


export function filtrarTextoSoloNumeros(texto) {
  var textoFiltrado = texto.replace(/[^0-9]/g, '');

  if (textoFiltrado > 2147483647) {
    textoFiltrado = "2147483647";
  }
  return textoFiltrado;
}


export function filtrarTextoPrecio(texto) {

  var formato_precio = texto.replace(/[^0-9.]/g, '');

  // Evita más de un punto decimal
  const parte = formato_precio.split('.');
  if (parte.length > 2) {
    formato_precio = parte[0] + '.' + parte.slice(1).join('');
  }

  // Limita a dos decimales
  if (parte[1] && parte[1].length > 2) {
    formato_precio = parte[0] + '.' + parte[1].substring(0, 2);
  }

  return formato_precio;
}


export const renderPreguntas = (lista_preguntas, estiloVista) => {
  return lista_preguntas.slice(0, 2).map((item, index) => (

    /*Componente View para mostrar la pregunta y respuesta */
    <View key={index} style={estiloVista}>

      { /*Componente View que contiene la pregunta y la fecha que se hizo la pregunta*/}
      <View style={{ paddingLeft: 15 }}>
        <Text style={[styles.tamanio_texto, { marginBottom: 5 }]}>
          {item.pregunta}
          <Text style={styles.text_fecha}>({formatearFecha(item.fecha_pregunta)})</Text>
        </Text>
      </View>

      {/*Verifica si la pregunta fue respondida o no  */}
      {item.respuesta && (
        /*Componente View que contiene la respuesta y la fecha que se respondio*/
        <View style={{ paddingLeft: 25 }}>
          <Text style={[styles.tamanio_texto, { marginBottom: 5 }]}>
            {item.respuesta}
            <Text style={styles.text_fecha}>({formatearFecha(item.fecha_respuesta)})</Text>
          </Text>
        </View>
      )}
    </View>
  ));
};