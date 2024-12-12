import React, { Component } from 'react';

//Componentes utilizados en React Native
import { SafeAreaView, ActivityIndicator } from 'react-native';

// Componente para mostrar un mapa y marcadores en la aplicación
import MapView, { Marker } from 'react-native-maps';

//Archivo de estilos
import { styles } from '../../estilos/estilos.js';


export class ScreenVerUbicacion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            map_latitude: null,
            map_longitude: null,
            loading: true, // Estado inicial de carga
        };
    }

    componentDidMount() {
        const { map_latitud, map_longitud } = this.props.route.params;

        // Establecer las coordenadas desde props y desactivar el estado de carga
        this.setState({
            map_latitude: map_latitud,
            map_longitude: map_longitud,
            loading: false,
        });
    }

    render() {
        const { map_latitude, map_longitude, loading } = this.state;

        if (loading) {
            // Mostrar indicador de carga mientras se procesan los datos
            return (
                <SafeAreaView style={styles.safeArea}>
                    <ActivityIndicator size="large" color="#0000ff" style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }} />
                </SafeAreaView>
            );
        }

        return (
            <SafeAreaView style={styles.safeArea}>
                <MapView
                    style={{ width: '100%', height: '100%' }}
                    initialRegion={{
                        latitude: map_latitude, // Latitud inicial del centro del mapa
                        longitude: map_longitude, // Longitud inicial del centro del mapa
                        latitudeDelta: 0.0062, // Rango de latitud visible en el mapa
                        longitudeDelta: 0.0061, // Rango de longitud visible en el mapa
                    }}
                >
                    <Marker
                        coordinate={{ latitude: map_latitude, longitude: map_longitude }}// Coordenadas del marcador
                        title="Ubicación" // Título que se mostrará al hacer clic en el marcador
                    />
                </MapView>
            </SafeAreaView>
        );
    }
}

