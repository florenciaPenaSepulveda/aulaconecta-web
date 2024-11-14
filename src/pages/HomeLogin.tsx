import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from '../components/NavBar';
import Swal from "sweetalert2";
import "../styles/banner.css";
import { useQuery } from "@apollo/client";
import { LISTAR_CURSOS } from "../graphql/queries/user";

function HomeLogin() {
  const navigate = useNavigate();
  const { data } = useQuery(LISTAR_CURSOS);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const isChangePassword = localStorage.getItem('isChangePassword') === 'true';

    if (!token) {
      Swal.fire({
        title: 'Error de autenticación',
        text: 'No se encontró un token válido. Inicia sesión nuevamente.',
        icon: 'warning',
        confirmButtonText: 'Ok'
      }).then(() => {
        navigate("/");
      });
    } else if (isChangePassword) {
      Swal.fire({
        title: 'Recuperación de contraseña detectada',
        text: 'Por seguridad, es necesario que cambie su contraseña.',
        icon: 'info',
        confirmButtonText: 'Ir a cambiar contraseña'
      }).then(() => {
        navigate("/ChangePassword");
      });
    }
  }, [navigate]);

  const handlePasswordChange = () => {
    navigate("/ChangePassword");
  };

  const userName = ""; 

  return (
    <div className="bg-[#DDE5B6] min-h-screen">
      <NavBar />
      <div className="container mx-auto py-12 text-center">
        <h3 className="text-3xl font-bold text-[#ADC178] text-center mt-4">Bienvenido {userName}!</h3>
        <h1 className="text-5xl font-bold text-[#1B4332] mb-8">Cursos Recientes</h1>
        <div className="text-left px-4 text-[#1B4332]">
          <button 
            className="bg-[#ADC178] text-white py-2 px-4 rounded-lg hover:bg-[#DDE5B6] mb-4"
            onClick={handlePasswordChange}
          >
            Cambiar Contraseña
          </button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data?.listSubject?.map((subject: { id: string; name: string; numberOfClasses: number }) => (
              <div key={subject.id} className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold">{subject.name}</h3>
                <p className="text-gray-500">Cantidad de clases: {subject.numberOfClasses}</p>
                <div className="mt-4 flex space-x-4">
                  <button className="bg-[#ADC178] text-white py-2 px-4 rounded-lg hover:bg-[#DDE5B6]">
                    Ver Asignatura
                  </button>
                  <button className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300">
                    Editar
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
