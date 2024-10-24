import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from "@apollo/client";
import { REGISTER } from "../../graphql/mutations/user";
import Loading from "../../components/Loading";
import Swal from "sweetalert2";

const Register: React.FC = () => {
  const [nombre, setNombre] = useState<string>('');
  const [apellidos, setApellidos] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [pass, setPass] = useState<string>('');
  const [passVerifi, setPassVerifi] = useState<string>('');
  const [rut, setRut] = useState<string>(''); // Añadir el RUT al formulario
  const [role, setRole] = useState<string>('Student'); // Establecer un valor por defecto

  const navigate = useNavigate();
  
  const [register, { loading }] = useMutation(REGISTER, {
    onCompleted: () => {
      Swal.fire({
        title: 'Registro exitoso',
        icon: 'success',
        confirmButtonText: 'Ok'
      }).then(() => {
        navigate('/');
      });
    },
    onError: (error) => {
      console.error("Error en el registro:", error);
      Swal.fire({
        title: 'Error en el registro',
        text: error.message,
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    }
  });

  // Función para formatear el RUT en tiempo real
  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\./g, '').replace(/-/g, ''); // Eliminar puntos y guiones

    // Limitar el RUT a 9 caracteres (sin contar puntos y guion)
    if (value.length > 9) {
      value = value.slice(0, 9);
    }

    let formattedRut = value;

    // Agregar los puntos y guion según la longitud del RUT
    if (value.length > 1) {
      formattedRut = value.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + '-' + value.slice(-1);
    }

    setRut(formattedRut);
  };

  // Manejar el envío del formulario
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (pass !== passVerifi) {
      Swal.fire({
        title: 'Error',
        text: 'Las contraseñas no coinciden',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      return;
    }

    try {
      await register({
        variables: {
          firstName: nombre,
          lastName: apellidos,
          rut: rut, // Eliminar formato antes de enviar
          email: email,
          role: role,
          password: pass,
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <h1 className="bg-[#ADC178] text-white text-center text-5xl font-bold py-4">
        CloseIA
      </h1>
      <div className="bg-[#DDE5B6] min-h-screen flex items-center justify-center">
        {loading && <Loading />}
        <div className="bg-[#ADC178] w-96 p-6 shadow-lg rounded-xl flex flex-col gap-4 justify-center">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 justify-center">
            <h1 className="text-black text-2xl">Primera vez por aquí? ¡Regístrate!</h1>
            <label className="text-white">Nombre</label>
            <input
              className="p-2 rounded-xl border"
              placeholder="Ingresa tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <label className="text-white">Apellido</label>
            <input
              className="p-2 rounded-xl border"
              placeholder="Ingresa tu apellido"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              required
            />
            <label className="text-white">RUT</label>
            <input
              className="p-2 rounded-xl border"
              placeholder="Ingresa tu RUT"
              value={rut}
              onChange={handleRutChange}
              required
            />
            <label className="text-white">Email:</label>
            <input
              className="p-2 rounded-xl border"
              placeholder="Ingresa tu Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="text-white">Rol:</label>
            <select
              className="p-2 rounded-xl border"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="Teacher">Profesor</option>
              <option value="Parents">Padre/Tutor</option>
            </select>
            <label className="text-white">Contraseña:</label>
            <input
              className="p-2 rounded-xl border"
              placeholder="Ingresa tu contraseña"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />
            <label className="text-white">Repetir Contraseña:</label>
            <input
              className="p-2 rounded-xl border"
              placeholder="Repite tu contraseña"
              type="password"
              value={passVerifi}
              onChange={(e) => setPassVerifi(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-[#DDE5B6] rounded-xl text-2xl text-black py-2 hover:scale-105 duration-300 w-full"
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Registrar'}
            </button>
            <p className="text-white">¿Ya tienes una cuenta? <Link className="text-black underline" to={"/"}>Ingresa aquí!</Link></p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
