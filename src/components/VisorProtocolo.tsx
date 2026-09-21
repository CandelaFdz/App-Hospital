import React from 'react';

interface VisorProtocoloProps {
  protocolo: any;
  onVolver: () => void;
}

export const VisorProtocolo: React.FC<VisorProtocoloProps> = ({ protocolo, onVolver }) => {
  return (
    <section className="protocol-info-">
      <button className="btn" onClick={onVolver}>
        ⬅ Volver al inicio
      </button>

     <div className="protocol-texto" >
                   <h2>PROTOCOLO DEL MANEJO DE CRISIS ASMATICA  EN LA URGENCIA </h2>
                   <h3>Subtitulo ejemplo</h3>
                   <p>La crisis asmática o reagudización del asma  es un episodio agudo o subagudo que se caracteriza por el aumento progresivo de la dificultad para respirar con disnea, tos, opresión torácica mayor a la habitual , sibilancias y disminución del flujo espiratorio. Puede variar desde episodios leves hasta otros muy graves o fatales que pueden llevarlo a la muerte, para ellos debemos clasificarlo.Los síntomas dependen de cómo los diversos desencadenantes, como los alergenos, la polución ambiental y/o laboral, las infecciones del tracto respiratorio (sobre todo las virales), los cambios climáticos, el estrés emocional, el consumo de drogas y otros, actúan sobre la vía aérea poniendo en marcha los mecanismos inflamatorios y la broncoconstricción, lo que da como resultado la obstrucción de la vía aérea. Durante la crisis asmática no sólo se observa broncoconstricción, sino que se destacan la inflamación, el edema de la mucosa y el aumento de la producción de secreciones. Estos mecanismos generan aumento de la resistencia y del trabajo respiratorio, ineficiencia del intercambio gaseoso y fatiga muscular, lo que puede causar insuficiencia respiratoria</p>
                 </div>
                 <div className="protocol-multi" >
                   <h3>Imagenes o cuadros van aca con un subtitulo</h3>
                 </div>
    </section>
  );
};