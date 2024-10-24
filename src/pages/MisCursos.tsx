import NavBar from '../components/NavBar';
import "../../styles/banner.css";

function MisCursos() {
    
  return (
    <div className="bg-[#DDE5B6] min-h-screen">
      <NavBar />
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-5xl font-bold text-[#1B4332] mb-8">Cursos Inscritos</h1>
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

export default MisCursos;