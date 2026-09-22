import React, { useState, useEffect } from 'react';
import '../css/styles.css';
import { Header } from './Header';
import { BuscadorInicio } from './BuscadorInicio';
import { VisorProtocolo } from './VisorProtocolo';
import { FormularioCreacion } from './Formulario';
import { MenuFlotante } from './MenuFlotante';

interface InicioProps {
  onNavigateToProtocols?: () => void;
}

export const Inicio: React.FC<InicioProps> = ({ onNavigateToProtocols }) => {
  const [vistaActual, setVistaActual] = useState<'inicio' | 'crear' | 'leer'>('inicio');
  const [tipoFormulario, setTipoFormulario] = useState<'protocolo' | 'diagnostico' | 'especialidad' | 'usuario'>('protocolo');
  
  const [protocoloSeleccionado, setProtocoloSeleccionado] = useState<any>(null);
  const [tarjetas, setTarjetas] = useState<any[]>([]);

  //esta temporalmente para probar la conexion y que no me de error el typiscript
  useEffect(() => {
    const cargarDatosBackend = async () => {
      try {
        // Hacemos ambas peticiones en paralelo (al mismo tiempo)
        const [resProtocolos, resDiagnosticos] = await Promise.all([
          fetch('http://localhost:3000/protocolos'),
          fetch('http://localhost:3000/diagnosticos')
        ]);

        if (resProtocolos.ok && resDiagnosticos.ok) {
          const dataProtocolos = await resProtocolos.json();
          const dataDiagnosticos = await resDiagnosticos.json();
          
          const todoJunto = [...dataDiagnosticos, ...dataProtocolos];
          
          setTarjetas(todoJunto); 
        }
      } catch (error) {
        console.error("Error al hacer el GET al backend:", error);
      }
    };

    cargarDatosBackend();
  }, []);

  const handleAbrirFormulario = (tipo: 'protocolo' | 'diagnostico' | 'especialidad' | 'usuario') => {
    setTipoFormulario(tipo);
    setVistaActual('crear');
  };

  const handleCardClick = (tarjeta: any) => {
    setProtocoloSeleccionado(tarjeta);
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
  <FormularioCreacion 
    tipoInicial={tipoFormulario} 
    onVolver={() => setVistaActual('inicio')}
  />
)}

        {vistaActual === 'leer' && (
          <VisorProtocolo 
            protocolo={protocoloSeleccionado} 
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
