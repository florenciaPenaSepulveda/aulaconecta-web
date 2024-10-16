import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_USER_DATA } from "../graphql/queries/user"; // Asegúrate de que la ruta sea correcta
import NavBar from '../components/NavBar';
import Loading from "./Loading";
import Swal from "sweetalert2";
import "../styles/banner.css";

function HomeLogin() {
  // Usa la query para obtener los datos del usuario
  const { loading, error, data } = useQuery(GET_USER_DATA);

  useEffect(() => {
    if (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo obtener la información del usuario.',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    }
  }, [error]);

  if (loading) return <Loading />;

  const userName = data?.me?.name || "Usuario"; // Si no hay nombre, muestra "Usuario"

  return (
    <div className="bg-[#DDE5B6] h-screen">
      <NavBar />
      <h3 className="text-3xl font-bold text-[#ADC178] text-center mt-4">Inicio de sesión Exitoso</h3>
      <h3 className="text-3xl font-bold text-[#ADC178] text-center mt-4">Bienvenido, {userName}!</h3>
    </div>
  );
}

export default HomeLogin;
