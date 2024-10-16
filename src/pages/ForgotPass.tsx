import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { FORGOT_PASS } from "../graphql/mutations/user";
import Loading from "./Loading";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";

function ForgotPass() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const [forgotPass, { loading }] = useMutation(FORGOT_PASS, {
    onCompleted: () => {
      Swal.fire({
        title: '¡Éxito!',
        text: 'Se ha enviado un enlace de recuperación de contraseña a tu correo.',
        icon: 'success',
        confirmButtonText: 'Ok'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/');
        }
      });
    },
    onError: (e) => {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo enviar el correo de recuperación. Verifica tu email.',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    }
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await forgotPass({
        variables: { email },
      });
    } catch (e) {
      console.log("Correo no encontrado");
    }
  };

  return (
    <>
      <h1 className="bg-[#ADC178] text-white text-center text-5xl font-bold py-4">
        CloseIA
      </h1>
      <div className='bg-[#DDE5B6] flex justify-center items-center h-screen'>
        {loading && <Loading />}
        <div className="bg-[#ADC178] w=96 p-6 shadow-lg rounded-xl flex flex-col gap-4 justify-center">
          <h1 className="text-3xl block text-black text-center font-semibold">Recuperar Contraseña</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="text-white" htmlFor="email">Correo Electrónico:</label>
            <input
              className="rounded-xl border w-full text-base px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-600"
              placeholder="Ingresa tu Correo Electrónico"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div>
              <button
                type="submit"
                className="bg-[#DDE5B6] rounded-xl text-2xl text-black py-2 hover:scale-105 duration-300 w-full"
                disabled={loading}
              >
                {loading ? 'Cargando...' : 'Recuperar Contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ForgotPass;
