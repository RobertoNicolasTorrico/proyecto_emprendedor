import React, { Component, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Collapsible from 'react-native-collapsible';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importa los componentes necesarios para las pantallas Drawer;
import { ScreenInicioUsuario } from '../Screens/Screens_usuarios/ScreenInicioUsuario';
import { ScreenBuscarProducto } from '../Screens/Screens_generales/ScreenBuscarProducto';
import { ScreenBuscarEmprendedor } from '../Screens/Screens_generales/ScreenBuscarEmprendedor';
import { ScreenConfiguracion } from '../Screens/Screens_usuarios/Screens_configuracion/ScreenConfiguracion';
import { ScreenMisPublicacionesProductos } from '../Screens/Screens_usuarios/Screens_usuario_emprendedor/Productos/ScreenMisPublicacionesProductos';
import { ScreenMisPublicacionesInformacion } from '../Screens/Screens_usuarios/Screens_usuario_emprendedor/Publicaciones/ScreenMisPublicacionesInformacion';
import { ScreenMisPreguntas } from '../Screens/Screens_usuarios/ScreenMisPreguntas';
import { ScreenPerfilEmprendedor } from '../Screens/Screens_usuarios/Screens_usuario_emprendedor/ScreenPerfilEmprendedor';
import { ScreenPreguntasRecibidas } from '../Screens/Screens_usuarios/Screens_usuario_emprendedor/ScreenPreguntasRecibidas';
import { ScreenSeguidosSeguidores } from '../Screens/Screens_usuarios/ScreenSeguidosSeguidores';


const Drawer = createDrawerNavigator();

export class DrawerNavigatorUsuarioEmprendedor extends Component {

    constructor(props) {
        super(props);
        this.state = {

            idUsuarioEmprendedor: null,
            nombreEmprendimiento: null,

            //Estado para determinar la pantalla de inicio del Drawer
            DrawerNavigator: '',
        };
    }

    //Metodo llamado cuando el componente se monta
    async componentDidMount() {

        //Se obtiene los valores almacenados en el AsynStorage
        const id_Usuario_Emprendedor = await AsyncStorage.getItem('idUsuarioEmprendedor');
        const nombre_Emprendimiento = await AsyncStorage.getItem('nombreEmprendimiento');

        var tipoDrawer = 'InicioSesion';

        this.setState({
            idUsuarioEmprendedor: id_Usuario_Emprendedor,
            nombreEmprendimiento: nombre_Emprendimiento,
            DrawerNavigator: tipoDrawer,
        });
    }

    render() {
        const { idUsuarioEmprendedor, nombreEmprendimiento, DrawerNavigator } = this.state;

        return (
            <Drawer.Navigator
                screenOptions={{
                    drawerStyle: {
                        width: 240,
                    },
                }}
                initialRouteName={DrawerNavigator}
                drawerContent={props => <CustomDrawerContent {...props} />}
            >
                <Drawer.Screen name="InicioSesion" component={ScreenInicioUsuario} options={{ title: 'Inicio', drawerItemStyle: { display: 'none' } }} />
                <Drawer.Screen name="BuscarProductos" component={ScreenBuscarProducto} options={{ title: 'Buscar Productos', drawerItemStyle: { display: 'none' } }} />
                <Drawer.Screen name="BuscarEmprendedores" component={ScreenBuscarEmprendedor} options={{ title: 'Buscar Emprendedores', drawerItemStyle: { display: 'none' } }} />
                <Drawer.Screen name="MiPerfilEmprendedor" component={ScreenPerfilEmprendedor} options={{ title: '', drawerItemStyle: { display: 'none' } }} initialParams={{ id_usuario_emprendedor: idUsuarioEmprendedor, nombre_emprendimiento: nombreEmprendimiento }} />
                <Drawer.Screen name="MisProductos" component={ScreenMisPublicacionesProductos} options={{ title: 'Mis Productos', drawerItemStyle: { display: 'none' } }} />
                <Drawer.Screen name="MisPublicaciones" component={ScreenMisPublicacionesInformacion} options={{ title: 'Mis Publicaciones', drawerItemStyle: { display: 'none' } }} />
                <Drawer.Screen name="MisPreguntas" component={ScreenMisPreguntas} options={{ title: 'Mis Preguntas', drawerItemStyle: { display: 'none' } }} />
                <Drawer.Screen name="MisPreguntasRecibidas" component={ScreenPreguntasRecibidas} options={{ title: 'Mis Preguntas Recibidas', drawerItemStyle: { display: 'none' } }} />
                <Drawer.Screen name="MisSeguidosSeguidores" component={ScreenSeguidosSeguidores} options={{ title: 'Lista de seguidos y seguidores', drawerItemStyle: { display: 'none' } }} />
                <Drawer.Screen name="Configuraciones" component={ScreenConfiguracion} options={{ title: 'Configuraciones', drawerItemStyle: { display: 'none' } }} />
            </Drawer.Navigator>
        );
    }
}

function CustomDrawerContent(props) {
    const [expandMis, setExpandMis] = useState(false);
    const [focusedItem, setFocusedItem] = useState(null);

    // Función para manejar la navegación cuando se presiona un ítem del drawer
    const handlePress = (screen) => {

        // Actualiza el estado del ítem enfocado
        setFocusedItem(screen);

        // Navega a la pantalla seleccionada
        props.navigation.navigate(screen);
    };

    return (
        <DrawerContentScrollView {...props}>
            {/* Renderiza la lista de ítems del drawer*/}
            <DrawerItemList {...props} />

            {/* Ítems del drawer para las diferentes pantallas visibles para todos los usuarios*/}
            <DrawerItem
                focused={focusedItem === 'InicioSesion'}
                label="Inicio"
                onPress={() => handlePress('InicioSesion')}
            />
            <DrawerItem
                focused={focusedItem === 'BuscarProductos'}
                label="Buscar Productos"
                onPress={() => handlePress('BuscarProductos')}
            />
            <DrawerItem
                focused={focusedItem === 'BuscarEmprendedores'}
                label="Buscar Emprendedores"
                onPress={() => handlePress('BuscarEmprendedores')}
            />
            {/* Sección que permite expandir y contraer la lista de ítems*/}
            <TouchableOpacity onPress={() => setExpandMis(!expandMis)} style={{ flexDirection: 'row', alignItems: 'center', margin: 16 }}>
                <Text style={{ fontSize: 15 }}>Ver mis</Text>
                <FontAwesomeIcon
                    icon={expandMis ? faChevronUp : faChevronDown}
                    size={15}
                    style={{ marginLeft: 8 }}
                />
            </TouchableOpacity>
            <Collapsible collapsed={!expandMis} style={{ marginLeft: 10 }}>
                <DrawerItem
                    focused={focusedItem === 'MisProductos'}
                    label="Productos"
                    onPress={() => handlePress('MisProductos')}
                />
                <DrawerItem
                    focused={focusedItem === 'MisPublicaciones'}
                    label="Publicaciones"
                    onPress={() => handlePress('MisPublicaciones')}
                />
                <DrawerItem
                    focused={focusedItem === 'MisPreguntas'}
                    label="Preguntas hechas"
                    onPress={() => handlePress('MisPreguntas')}
                />
                <DrawerItem
                    focused={focusedItem === 'MisPreguntasRecibidas'}
                    label="Preguntas recibidas"
                    onPress={() => handlePress('MisPreguntasRecibidas')}
                />
                <DrawerItem
                    focused={focusedItem === 'MisSeguidosSeguidores'}
                    label="Seguidos y Seguidores"
                    onPress={() => handlePress('MisSeguidosSeguidores')}
                />
            </Collapsible>
            {/* Ítem del drawer para entrar al perfil del usuario empendedor*/}
            <DrawerItem
                focused={focusedItem === 'MiPerfilEmprendedor'}
                label="Mi perfil"
                onPress={() => handlePress('MiPerfilEmprendedor')}
            />
            <DrawerItem
                focused={focusedItem === 'Configuraciones'}
                label="Configuraciones"
                onPress={() => handlePress('Configuraciones')}
                style={{ marginTop: 'auto' }}
            />
        </DrawerContentScrollView>
    );
}
