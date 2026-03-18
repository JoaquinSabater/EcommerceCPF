import Swal, { SweetAlertIcon } from 'sweetalert2';

const defaultOptions = {
  confirmButtonColor: '#ea580c',
  cancelButtonColor: '#6b7280',
  reverseButtons: true,
};

export function showSuccess(title: string, text?: string) {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    ...defaultOptions,
  });
}

export function showError(title: string, text?: string) {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    ...defaultOptions,
  });
}

export function showWarning(title: string, text?: string) {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    ...defaultOptions,
  });
}

export function showInfo(title: string, text?: string) {
  return Swal.fire({
    icon: 'info',
    title,
    text,
    ...defaultOptions,
  });
}

export async function confirmDialog(options: {
  title: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: SweetAlertIcon;
}) {
  const result = await Swal.fire({
    title: options.title,
    text: options.text,
    icon: options.icon ?? 'question',
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText ?? 'Confirmar',
    cancelButtonText: options.cancelButtonText ?? 'Cancelar',
    ...defaultOptions,
  });

  return result.isConfirmed;
}
