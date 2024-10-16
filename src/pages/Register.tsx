import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from "@apollo/client";
import { REGISTER } from "../graphql/mutations/user";
import Loading from "./Loading";
import Swal from "sweetalert2";

function Register() {
    const [nombre, setNombre] = useState('');
    const [apellidos, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [passVerifi, setPassVerifi] = useState('');

    const navigate = useNavigate();

    const [register, { loading, error }] = useMutation(REGISTER, {
        onCompleted: () => {
            Swal.fire({
                title: '¡Registro Exitoso!',
                icon: 'success',
                confirmButtonText: 'Ok'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/');
                }
            });
        },
        onError: (e) => {
            console.log("Error de registro:", e);
            Swal.fire({
                title: 'Error en el registro',
                text: e.message || 'Ocurrió un error inesperado.',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
                    nombre,
                    apellidos,
                    email,
                    pass,
                }
            });
        } catch (e) {
            console.error(e);
        }
    };

    if (error) {
        console.error("GraphQL Error:", error);
        return <div>Error! {error.message}</div>;
    }

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
                            onChange={(e) => setApellido(e.target.value)}
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
}

export default Register;
