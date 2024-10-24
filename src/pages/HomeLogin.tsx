import { useEffect } from "react";
import NavBar from '../components/NavBar';
import Swal from "sweetalert2";
import "../styles/banner.css";

function HomeLogin() {
  // Verificar si el token está presente en localStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      Swal.fire({
        title: 'Error de autenticación',
        text: 'No se encontró un token válido. Inicia sesión nuevamente.',
        icon: 'warning',
        confirmButtonText: 'Ok'
      }).then(() => {
        window.location.href = "/";
      });
    } else {
      // Mostrar el mensaje de cambio de contraseña una vez que el usuario inicia sesión
      Swal.fire({
        title: '¿Necesitas cambiar la contraseña?',
        showDenyButton: true,
        confirmButtonText: 'Sí',
        denyButtonText: 'No',
      }).then((result) => {
        if (result.isConfirmed) {
          // Redirigir a la página de cambio de contraseña
          window.location.href = "/ChangePassword"; // Cambia esta ruta según tu configuración
        }
      });
    }
  }, []);

  // Como ya no se obtienen datos del usuario, solo un mensaje general
  const userName = ""; // Puedes reemplazarlo con un valor si lo deseas

  return (
    <div className="bg-[#DDE5B6] min-h-screen">
      <NavBar />
      <div className="container mx-auto py-12 text-center">
        <h3 className="text-3xl font-bold text-[#ADC178] text-center mt-4">Bienvenido {userName}!</h3>
        <h1 className="text-5xl font-bold text-[#1B4332] mb-8">Cursos Recientes</h1>
        <div className="text-left px-4 text-[#1B4332]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["Asignatura 1", "Asignatura 2", "Asignatura 3", "Asignatura 4", "Asignatura 5", "Asignatura 6"].map((course, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold">{course}</h3>
                <p className="text-gray-500">Description</p>
                <div className="flex items-center mt-4">
                  <div className="ml-4">
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-4">
                  <button className="bg-[#ADC178] text-white py-2 px-4 rounded-lg hover:bg-[#DDE5B6]">
                    Ver Curso
                  </button>
                  <button className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300">
                    Editar Curso
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeLogin;
