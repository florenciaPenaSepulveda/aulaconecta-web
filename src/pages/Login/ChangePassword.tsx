import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useMutation } from '@apollo/client';
import { CHANGE_PASSWORD_MUTATION } from '../../graphql/mutations/user';

const ChangePassword: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const token = localStorage.getItem('authToken'); 

  const [changePassword, { loading, error }] = useMutation(CHANGE_PASSWORD_MUTATION, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    Swal.fire({
      title: 'Cambio de contraseña',
      text: 'Por motivos de seguridad, por favor cambie su contraseña.',
      icon: 'info',
      confirmButtonText: 'Entendido'
    });
  }, []);

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.target.value);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden. Por favor, inténtalo de nuevo.',
      });
      return;
    }

    try {
      const { data } = await changePassword({
        variables: {
          newPassword: password, 
        },
      });

      if (data?.changePassword?.message) {
        Swal.fire({
          icon: 'success',
          title: '¡Contraseña actualizada!',
          text: data.changePassword.message,
        }).then(() => {
          localStorage.removeItem('isChangePassword'); 
          window.location.href = '/'; 
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data?.changePassword?.message || 'Hubo un problema al cambiar la contraseña.',
        });
      }
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar la contraseña. Por favor, inténtalo más tarde.',
      });
    }
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
              disabled={loading}
            >
              {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs mt-2">Error: {error.message}</p>}
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
