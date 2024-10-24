import { useState, ChangeEvent, FormEvent } from 'react';
import Swal from 'sweetalert2';

const ChangePassword: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Manejar el cambio en el campo de la nueva contraseña
  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  // Manejar el cambio en el campo de confirmación de contraseña
  const handleConfirmPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.target.value);
  };

  // Enviar el formulario
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    
    // Validar si las contraseñas coinciden
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden. Por favor, inténtalo de nuevo.',
      });
      return;
    }

    // Aquí puedes agregar la lógica para enviar la nueva contraseña al backend
    // Por ejemplo, usando fetch o axios para hacer un POST con la nueva contraseña
    // a un endpoint que maneje el cambio de contraseña.

    Swal.fire({
      icon: 'success',
      title: '¡Contraseña actualizada!',
      text: 'Tu contraseña ha sido cambiada exitosamente.',
    }).then(() => {
      window.location.href = '/';  // Redirigir a la página principal o donde prefieras
    });
  };

  return (
    <div className="bg-[#DDE5B6] min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-[#1B4332] mb-6">Cambiar Contraseña</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Nueva Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa la nueva contraseña"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirmar Nueva Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Confirma la nueva contraseña"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-[#ADC178] hover:bg-[#DDE5B6] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cambiar Contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
