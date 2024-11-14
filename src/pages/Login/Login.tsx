import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import Loading from "../../components/Loading";
import { useMutation } from "@apollo/client";
import { INICIO_SESION } from "../../graphql/mutations/user/index";

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const navigate = useNavigate();

    const [login, { loading }] = useMutation(INICIO_SESION);

    const handleLogin = async (email: string, pass: string) => {
        try {
            const { data } = await login({
                variables: {
                    email,
                    password: pass
                }
            });
    
            const token = data?.login?.token;
            const isChangePassword = data?.login?.isChangePassword;
    
            if (token) {
                console.log("Token recibido:", token);
    
                localStorage.setItem('authToken', token);
                localStorage.setItem('isChangePassword', isChangePassword ? 'true' : 'false');
    
                if (isChangePassword) {
                    navigate('/ChangePassword'); 
                } else {
                    Swal.fire({
                        title: '¡Éxito!',
                        text: 'Inicio de Sesión correcto',
                        icon: 'success',
                        confirmButtonText: 'Ok'
                    }).then(() => {
                        navigate(`/HomeLogin`);
                    });
                }
            } else {
                throw new Error("Token no recibido");
            }
    
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Email o contraseña incorrectos',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    };
    
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleLogin(email, pass);  
    };

    return (
        <>
            <h1 className="bg-[#ADC178] text-white text-center text-5xl font-bold py-4">
                CloseAI
            </h1>
            <div className='bg-[#DDE5B6] flex justify-center items-center h-screen'>
                {loading && <Loading />}
                <div className="bg-[#ADC178] w-96 p-6 shadow-lg rounded-xl flex flex-col gap-4 justify-center">
                    <h1 className="text-3xl block text-black text-center underline font-semibold">Login</h1>
                    <form onSubmit={handleSubmit} className="px-5">
                        <div className="items-center space-y-4 py-4">
                            <h1 className="text-white">Email:</h1>
                            <label htmlFor="email"></label>
                            <input
                                className="rounded-xl border w-full text-base px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-600"
                                placeholder="Ingresa tu Correo"
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <h1 className="text-white">Contraseña:</h1>
                            <label htmlFor="password"></label>
                            <input
                                className="rounded-xl border w-full text-base px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-600"
                                placeholder="Ingresa tu Contraseña"
                                type="password"
                                id="password"
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                required
                            />
                            <p className="text-white">Olvidé la contraseña.
                                <Link className='text-black underline' to={"./ForgotPass"}> Recuperar</Link>
                            </p>
                            <button
                            type="submit"
                            className="bg-[#DDE5B6] rounded-xl text-2xl text-black py-2 hover:scale-105 duration-300 w-full"
                            disabled={loading}>
                            {loading ? 'Cargando...' : 'Iniciar Sesión'}
                            </button>
                            <p className="text-white">No tienes cuenta?
                                <Link className='text-black underline' to={"./Register"}> Regístrate</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Login;
