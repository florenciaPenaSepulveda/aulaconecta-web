import React, { useState } from "react";
import { useMutation} from "@apollo/client";
import { FORGOT_PASS } from "../graphql/mutations/user";
import Loading from "./Loading";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";

function ForgotPass(){

    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const [forgotPass, { loading, error }] = useMutation(FORGOT_PASS, {
        onCompleted: () => {
            // muestra el SweetAlert2 antes de redirigir
            Swal.fire({
                title: 'Éxito!',
                text: 'Tu nueva contraseña fue enviada a tu correo',
                icon: 'success',
                confirmButtonText: 'Ok'
            }).then((result) => {
                // redirige a la página de login
                if (result.isConfirmed) {
                    navigate('/');
                }
            });
        },
        onError: (e) => {
            console.log("Correo no encontrado", e);
        }
    });

    const handleSubmit =  async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
            try{
                await forgotPass({
                    variables:{
                        email:email,
                    }
                });
            }catch(e){
                console.log("Correo no encontrado")
            }
        };
    
    if (error){
        return <div>`Error! ${error.message}`</div>;
    }

    return(
        <>
        <h1 className="bg-[#1B4332] text-white text-center text-5xl font-bold py-4">
                CloseIA
        </h1>
        <div className='bg-[#95D5B2] flex justify-center items-center h-screen'>
            {loading && <Loading />}
                <div className="bg-[#1B4332] w=96 p-6 shadow-lg rounded-xl flex flex-col gap-4 justify-center">
                    <h1 className="text-3xl block text-white text-center font-semibold">Recuperar Contraseña</h1>
                        <form onSubmit={handleSubmit} className="space-y-4">
                        <label className="text-white" htmlFor="email">Correo Electronico:</label>
                            <input className="rounded-xl border w-full text-base px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-600" placeholder="Ingresa tu Correo Electronico"
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            />
                            
                            <div>
                                <button type="submit" className="bg-[#95D5B2] rounded-xl text-2xl text-white py-2 hover:scale-105 duration-300 w-full">Recuperar Contraseña</button>
                            </div>
                        </form>
                </div>
        </div>
        </>
    )
}

export default ForgotPass;