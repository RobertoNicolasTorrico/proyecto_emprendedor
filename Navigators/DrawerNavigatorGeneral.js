import React, { Component } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Importa los componentes necesarios para las pantallas del Drawer
import { ScreenIniciarSesion } from '../Screens/Screens_generales/ScreenIniciarSesion';
import { ScreenInicioGeneral } from '../Screens/Screens_generales/ScreenInicioGeneral';
import { ScreenBuscarProducto } from "../Screens/Screens_generales/ScreenBuscarProducto";
import { ScreenBuscarEmprendedor } from "../Screens/Screens_generales/ScreenBuscarEmprendedor";


const Drawer = createDrawerNavigator();

export class DrawerNavigatorGeneral extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //Estado para determinar la pantalla de inicio del Drawer
      DrawerNavigator: "InicioGeneral",
    };
  }


  render() {
    const {  DrawerNavigator } = this.state;
    return (
      <Drawer.Navigator initialRouteName={DrawerNavigator}>
        <Drawer.Screen name="InicioGeneral" component={ScreenInicioGeneral} options={{ title: 'Inicio' }} />
        <Drawer.Screen name="BuscarProductos" component={ScreenBuscarProducto} options={{ title: 'Buscar Productos' }} />
        <Drawer.Screen name="BuscarEmprendedores" component={ScreenBuscarEmprendedor} options={{ title: 'Buscar Emprendedores' }} />
        <Drawer.Screen name="IniciarSesion" component={ScreenIniciarSesion} options={{ title: 'Iniciar Sesion' }} />
      </Drawer.Navigator>
    );
  }
}