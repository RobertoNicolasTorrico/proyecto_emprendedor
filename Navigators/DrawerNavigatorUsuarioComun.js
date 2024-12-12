import React, { Component, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';

import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem, } from '@react-navigation/drawer';
import Collapsible from 'react-native-collapsible';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

// Importa los componentes necesarios para las pantallas Drawer;
import { ScreenInicioUsuario } from '../Screens/Screens_usuarios/ScreenInicioUsuario';
import { ScreenBuscarProducto } from '../Screens/Screens_generales/ScreenBuscarProducto';
import { ScreenBuscarEmprendedor } from '../Screens/Screens_generales/ScreenBuscarEmprendedor';
import { ScreenConfiguracion } from '../Screens/Screens_usuarios/Screens_configuracion/ScreenConfiguracion';
import { ScreenMisPreguntas } from '../Screens/Screens_usuarios/ScreenMisPreguntas';
import { ScreenSeguidosSeguidores } from '../Screens/Screens_usuarios/ScreenSeguidosSeguidores';


const Drawer = createDrawerNavigator();

export class DrawerNavigatorUsuarioComun extends Component {

    constructor(props) {
        super(props);
        this.state = {
            //Estado para determinar la pantalla de inicio del Drawer
            DrawerNavigator: 'InicioSesion',
        };
    }

    render() {
        const { DrawerNavigator } = this.state
        return (
            <Drawer.Navigator screenOptions={{
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
                <Drawer.Screen name="MisPreguntas" component={ScreenMisPreguntas} options={{ title: 'Mis Preguntas', drawerItemStyle: { display: 'none' } }} />
                <Drawer.Screen name="MisSeguidosSeguidores" component={ScreenSeguidosSeguidores} options={{ title: 'Lista de seguidos', drawerItemStyle: { display: 'none' } }} />
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
                    focused={focusedItem === 'MisPreguntas'}
                    label="Preguntas hechas"
                    onPress={() => handlePress('MisPreguntas')}
                />
                <DrawerItem
                    focused={focusedItem === 'MisSeguidosSeguidores'}
                    label="Seguidos"
                    onPress={() => handlePress('MisSeguidosSeguidores')}
                />
            </Collapsible>

            <DrawerItem
                focused={focusedItem === 'Configuraciones'}
                label="Configuraciones"
                onPress={() => handlePress('Configuraciones')}
                style={{ marginTop: 'auto' }}
            />
        </DrawerContentScrollView>
    );
}