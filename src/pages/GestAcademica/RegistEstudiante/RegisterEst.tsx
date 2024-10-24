import NavBar from "../../../components/NavBar";

const RegisterEst: React.FC = () => {
    return (
        <div className="bg-[#DDE5B6] min-h-screen">
        <NavBar />
        <div className="container mx-auto py-12 text-center">
            <h1 className="text-5xl font-bold text-[#1B4332] mb-8">Registro de Estudiantes</h1>
            <div className="text-left px-4 text-[#1B4332]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold">Agregar Estudiante</h3>
                <p className="text-gray-500">Ingrese los datos del estudiante</p>
                {/* Formulario para ingresar datos del estudiante */}
                <button className="bg-[#ADC178] text-white py-2 px-4 rounded-lg hover:bg-[#DDE5B6] mt-4">
                    Registrar
                </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold">Lista de Estudiantes</h3>
                <p className="text-gray-500">Ver y modificar estudiantes registrados</p>
                <button className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 mt-4">
                    Ver Estudiantes
                </button>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}
    
export default RegisterEst;