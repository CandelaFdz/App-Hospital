import Swal, { type SweetAlertResult } from 'sweetalert2';

// Opciones de configuración compartidas para mantener el diseño consistente con tu CSS
const defaultConfirmOptions = {
  showCancelButton: true,
  cancelButtonText: 'Cancelar',
  reverseButtons: true, 
  customClass: {
    popup: 'swal2-medical-popup',
    title: 'swal2-medical-title',
    confirmButton: 'btn btn-confirmar',
    cancelButton: 'btn'
  }
};

//notificacion estilo modal.

export const mostrarConfirmacion = (
  titulo: string, 
  mensaje: string, 
  textoConfirmar = 'Aceptar',
  tipo: 'warning' | 'question' | 'info' = 'warning'
): Promise<SweetAlertResult> => {
  return Swal.fire({
    ...defaultConfirmOptions,
    title: titulo,
    text: mensaje,
    icon: tipo,
    confirmButtonText: textoConfirmar,
  });
};

//notificación rápida

export const mostrarToast = (
  mensaje: string, 
  tipo: 'success' | 'error' | 'info' = 'success'
) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    customClass: {
      popup: 'swal2-medical-popup'
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  Toast.fire({
    icon: tipo,
    title: mensaje
  });
};