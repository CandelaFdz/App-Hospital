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
import { Login } from './Login';
import { obtenerDiagnosticosConProtocolos } from '../db/protocolos-repository';
import { sincronizarDatos } from '../services/sync-service';
import type { DiagnosticoConProtocolo } from '../db/types';

interface InicioProps {
  onNavigateToProtocols?: () => void;
}

type DatosEdicion = Partial<DiagnosticoConProtocolo> & {
  diagnosticoTitulo?: string;
  id_diagnostico?: string;
  subtitulo?: string;
};

type EstadoSincronizacion = 'exito' | 'actualizado' | 'error';

export const Inicio: React.FC<InicioProps> = ({ onNavigateToProtocols }) => {
  const [vistaActual, setVistaActual] = useState<'inicio' | 'crear' | 'leer'>('inicio');
  const [tipoFormulario, setTipoFormulario] = useState<'protocolo' | 'diagnostico' | 'especialidad' | 'usuario' | 'crear_usuario'>('protocolo');
  const [protocoloSeleccionado, setProtocoloSeleccionado] = useState<Awaited<ReturnType<typeof obtenerDiagnosticosConProtocolos>>[number] | null>(null);
  const [tarjetas, setTarjetas] = useState<Awaited<ReturnType<typeof obtenerDiagnosticosConProtocolos>>>([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState<DatosEdicion | null>(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [mensajeSincronizacion, setMensajeSincronizacion] = useState('');
  const [estadoSincronizacion, setEstadoSincronizacion] = useState<EstadoSincronizacion | null>(null);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [usuarioLogueado, setUsuarioLogueado] = useState<any>(() => {
  const usuarioGuardado = localStorage.getItem('usuario_hospital');
  return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
});

  useEffect(() => {
    let activo = true;

    const cargarDatosLocales = async () => {
      try {
        const datosLocales = await obtenerDiagnosticosConProtocolos();
        if (activo) {
          setTarjetas(datosLocales);
        }
      } catch (error) {
        console.error('No se pudieron leer los datos locales:', error);
      }
    };

    const sincronizarYRecargar = async (mostrarResultado = false) => {
      if (sincronizando) return;

      setSincronizando(true);
      try {
        await sincronizarDatos();
        if (mostrarResultado && activo) {
          setMensajeSincronizacion('Datos sincronizados correctamente.');
        }
      } catch (error) {
        console.error('No se pudo sincronizar; se usarán los datos locales:', error);
        if (mostrarResultado && activo) {
          setMensajeSincronizacion(
            navigator.onLine
              ? 'No se pudo sincronizar. Revisa la URL y el usuario configurados.'
              : 'Sin conexión. Se conservan los datos locales.'
          );
        }
      }
      await cargarDatosLocales();
      if (activo) {
        setSincronizando(false);
      }
    };

    void cargarDatosLocales();
    void sincronizarYRecargar();

    return () => {
      activo = false;
    };
  }, []);

  const handleCardClick = (tarjeta: DiagnosticoConProtocolo) => {
    setProtocoloSeleccionado(tarjeta);
    setVistaActual('leer');
    if (onNavigateToProtocols) onNavigateToProtocols();
  };

  const handleVolverDesdeFormulario = () => {
    setVistaActual('inicio');
    void obtenerDiagnosticosConProtocolos().then(setTarjetas);
  };

  const handleAbrirFormulario = (tipo: 'protocolo' | 'diagnostico' | 'especialidad' | 'usuario') => {
    setTipoFormulario(tipo);
    setModoEdicion(false);
    setDatosEdicion(null);
    setVistaActual('crear');
  };

  return (
    <div className="app-wrapper">
      <Header
        usuario={usuarioLogueado}
        onAbrirLogin={() => setMostrarLogin(true)}
        onCerrarSesion={() => {
          setUsuarioLogueado(null);
          localStorage.removeItem('usuario_hospital');
          setVistaActual('inicio');
        }}
        ocultarBotonLogin={mostrarLogin}
      />

      <main className={`main-content ${vistaActual !== 'inicio' || mostrarLogin ? 'modo-lectura' : ''}`}>
        {mostrarLogin ? (
          <Login
            onLoginSuccess={(usuario) => {
              setUsuarioLogueado(usuario);
              setMostrarLogin(false);
              localStorage.setItem('usuario_hospital', JSON.stringify(usuario));
              setMostrarLogin(false);
            }}
            onCancelar={() => setMostrarLogin(false)}
          />
        ) : (
          <>
            {vistaActual === 'inicio' && (
              <>
                <div className="sync-actions">
                  <button
                    className="btn"
                    type="button"
                    onClick={() => {
                      setMensajeSincronizacion('');
                      setEstadoSincronizacion(null);
                      void (async () => {
                        setSincronizando(true);
                        try {
                          const resultado = await sincronizarDatos();
                          setMensajeSincronizacion(
                            resultado.huboCambios
                              ? 'Datos sincronizados correctamente.'
                              : 'Ya estás en la última versión.'
                          );
                          setEstadoSincronizacion(resultado.huboCambios ? 'actualizado' : 'exito');
                        } catch (error) {
                          console.error('No se pudo sincronizar manualmente:', error);
                          setMensajeSincronizacion(
                            navigator.onLine
                              ? 'No se pudo sincronizar. Revisa la URL y el usuario configurados.'
                              : 'No se puede sincronizar, usando datos locales.'
                          );
                          setEstadoSincronizacion('error');
                        } finally {
                          setTarjetas(await obtenerDiagnosticosConProtocolos());
                          setSincronizando(false);
                        }
                      })();
                    }}
                    disabled={sincronizando}
                  >
                    {sincronizando ? 'Sincronizando...' : 'Sincronizar ahora'}
                  </button>
                  {mensajeSincronizacion && (
                    <div className={`sync-message sync-message-${estadoSincronizacion ?? 'exito'}`} role="status">
                      <span className="sync-message-icon" aria-hidden="true">
                        {estadoSincronizacion === 'error' ? '!' : estadoSincronizacion === 'exito' ? '✓' : '↻'}
                      </span>
                      <span>{mensajeSincronizacion}</span>
                    </div>
                  )}
                </div>
                <BuscadorInicio tarjetas={tarjetas} onCardClick={handleCardClick} />
              </>
            )}

            {vistaActual === 'crear' && Boolean(usuarioLogueado?.is_admin) && (
              tipoFormulario === 'usuario' ? (
              <GestionUsuarios 
                onVolver={() => setVistaActual('inicio')}
                onCrearUsuario={() => {
                setModoEdicion(false);
                setDatosEdicion(null);
                setTipoFormulario('crear_usuario');
              }} 
              onEditarUsuario={(usuarioSeleccionado) => {
                setModoEdicion(true);
                setDatosEdicion(usuarioSeleccionado);
                setTipoFormulario('crear_usuario');
              }}
              />
              ) : tipoFormulario === 'crear_usuario' ? (
                <FormularioUsuario 
                onVolver={() => setTipoFormulario('usuario')} 
                modoEdicion={modoEdicion}
                datosIniciales={datosEdicion}
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
                  if (!usuarioLogueado?.is_admin) return;
                  setTipoFormulario('protocolo');
                  setModoEdicion(true);
                  setDatosEdicion({
                    ...protocoloSeleccionado?.protocolo,
                    titulo: protocoloSeleccionado?.protocolo?.subtitulo ?? '',
                    diagnosticoTitulo: protocoloSeleccionado?.titulo
                  });
                  setVistaActual('crear');
                }}
                onEditarDiagnostico={() => {
                  if (!usuarioLogueado?.is_admin) return;
                  setTipoFormulario('diagnostico');
                  setModoEdicion(true);
                  setDatosEdicion(protocoloSeleccionado);
                  setVistaActual('crear');
                }}
                onCrearProtocolo={() => {
                  if (!usuarioLogueado?.is_admin) return;
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
          </>
        )}
      </main>

      {!mostrarLogin && vistaActual === 'inicio' && Boolean(usuarioLogueado?.is_admin) && (
        <MenuFlotante onAbrirFormulario={handleAbrirFormulario} />
      )}
    </div>
  );
};

export default Inicio;