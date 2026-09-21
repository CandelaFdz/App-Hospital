import React, { useState } from 'react';
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
  const [tarjetas, setTarjetas] = useState<any[]>([
    {
      id: 'demo-1',
      titulo: 'PROTOCOLO DEL MANEJO DE CRISIS ASMATICA EN LA URGENCIA',
      subtitulo: 'subtitulo o breve descripción del protocolo'
    }
  ]);

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