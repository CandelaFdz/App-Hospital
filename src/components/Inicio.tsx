import React, { useState, useEffect } from 'react';
import '../css/styles.css';
import { Header } from './Header';
import { BuscadorInicio } from './BuscadorInicio';
import { VisorProtocolo } from './VisorProtocolo';
import { FormularioCreacion } from './Formulario';
import { MenuFlotante } from './MenuFlotante';
import { GestionUsuarios } from './GestionUsuarios';
import { FormularioUsuario } from './FormUsuarios';
import { GestionEspecialidades } from './GestionEspecialidades';
import { obtenerDiagnosticosConProtocolos } from '../db/protocolos-repository';
import type { DiagnosticoConProtocolo } from '../db/types';

interface InicioProps {
  onNavigateToProtocols?: () => void;
}

export const Inicio: React.FC<InicioProps> = ({ onNavigateToProtocols }) => {
  const [vistaActual, setVistaActual] = useState<'inicio' | 'crear' | 'leer'>('inicio');
  const [tipoFormulario, setTipoFormulario] = useState<'protocolo' | 'diagnostico' | 'especialidad' | 'usuario' | 'crear_usuario'>('protocolo');
  const [protocoloSeleccionado, setProtocoloSeleccionado] = useState<any>(null);
  const [tarjetas, setTarjetas] = useState<DiagnosticoConProtocolo[]>([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState<any>(null);
  const [versionDatos, setVersionDatos] = useState(0);

  useEffect(() => {
    const cargarDatosLocales = async () => {
      try {
        setTarjetas(await obtenerDiagnosticosConProtocolos());
      } catch (error) {
        console.error('Error al cargar protocolos y diagnósticos locales:', error);
      }
    };

    cargarDatosLocales();
  }, [versionDatos]);


  const handleVolverDesdeFormulario = () => {
    setVersionDatos((version) => version + 1);
    setVistaActual('inicio');
  };

  const handleAbrirFormulario = (tipo: 'protocolo' | 'diagnostico' | 'especialidad' | 'usuario') => {
    setTipoFormulario(tipo);
    setModoEdicion(false);
    setDatosEdicion(null);
    setVistaActual('crear');
  };

  const handleCardClick = (tarjeta: any) => {
    setProtocoloSeleccionado(tarjeta);
    setModoEdicion(false);
    setVistaActual('leer');
    if (onNavigateToProtocols) onNavigateToProtocols();
  };

  return (
    <div className="app-wrapper">
      <Header />

      <main className={`main-content ${vistaActual !== 'inicio' ? 'modo-lectura' : ''}`}>

        {vistaActual === 'inicio' && (
          <BuscadorInicio tarjetas={tarjetas} onCardClick={handleCardClick} />
        )}

        {vistaActual === 'crear' && (
          tipoFormulario === 'usuario' ? (
            <GestionUsuarios
              onVolver={() => setVistaActual('inicio')}
              onCrearUsuario={() => setTipoFormulario('crear_usuario')}
            />
          ) : tipoFormulario === 'crear_usuario' ? (
            <FormularioUsuario
              onVolver={() => setTipoFormulario('usuario')}
            />
          ) : tipoFormulario === 'especialidad' ? (
            <GestionEspecialidades onVolver={() => setVistaActual('inicio')} />
          ) : (
            <FormularioCreacion
              tipoInicial={tipoFormulario}
              modoEdicion={modoEdicion}
              datosIniciales={datosEdicion}
              onVolver={handleVolverDesdeFormulario}
            />
          )
        )}

        {vistaActual === 'leer' && (
          <VisorProtocolo
            protocolo={protocoloSeleccionado}

            onEditarProtocolo={() => {
              setTipoFormulario('protocolo');
              setModoEdicion(true);
              setDatosEdicion({
                ...protocoloSeleccionado?.protocolo,
                diagnosticoTitulo: protocoloSeleccionado?.titulo
              });
              setVistaActual('crear');
            }}
            onEditarDiagnostico={() => {
              setTipoFormulario('diagnostico');
              setModoEdicion(true);
              setDatosEdicion(protocoloSeleccionado);
              setVistaActual('crear');
            }}
            onCrearProtocolo={() => {
              setTipoFormulario('protocolo');
              setModoEdicion(false);
              setDatosEdicion(null);
              setVistaActual('crear');
            }}

            onVolver={() => {
              setVistaActual('inicio');
              setProtocoloSeleccionado(null);
            }}
          />
        )}

      </main>

      {vistaActual === 'inicio' && (
        <MenuFlotante onAbrirFormulario={handleAbrirFormulario} />
      )}
    </div>
  );
};

export default Inicio;
