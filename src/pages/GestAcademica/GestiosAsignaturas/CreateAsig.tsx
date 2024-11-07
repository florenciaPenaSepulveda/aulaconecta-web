import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import NavBar from "../../../components/NavBar";
import { CREATE_SUBJECT } from "../../../graphql/mutations/user";
import { LISTAR_CURSOS } from "../../../graphql/queries/user";
import Swal from "sweetalert2";

const CreateAsig: React.FC = () => {
  const [subjectName, setSubjectName] = useState("");
  const [numberOfClasses, setNumberOfClasses] = useState<number | "">("");
  const { data, refetch } = useQuery(LISTAR_CURSOS);
  const [createSubject] = useMutation(CREATE_SUBJECT);
  const navigate = useNavigate();

  const handleCreateSubject = async () => {
    if (!subjectName.trim()) {
      Swal.fire({
        title: "Error",
        text: "El nombre de la asignatura no puede estar vacío",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    if (!numberOfClasses || numberOfClasses <= 0) {
      Swal.fire({
        title: "Error",
        text: "La cantidad de clases debe ser un número mayor a 0",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    try {
      const { data } = await createSubject({
        variables: {
          createSubjectInput: {
            name: subjectName,
            numberOfClasses: Number(numberOfClasses),
          },
        },
      });

      if (data?.createSubject?.isCreateSubject) {
        Swal.fire({
          title: "Asignatura creada",
          text: `La asignatura "${subjectName}" con ${numberOfClasses} clases se ha creado correctamente.`,
          icon: "success",
          confirmButtonText: "Ok",
        });
        setSubjectName("");
        setNumberOfClasses("");
        refetch();
      } else {
        throw new Error("Error en la creación de asignatura");
      }
    } catch (error) {
      console.error("Error al crear la asignatura:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo crear la asignatura. Inténtalo nuevamente.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  const handleViewSubject = (id: string) => {
    navigate(`/DetalleAsig/${id}`);
  };

  return (
    <div className="bg-[#DDE5B6] min-h-screen">
      <NavBar />
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-5xl font-bold text-[#1B4332] mb-8">Gestión de Asignaturas</h1>
        
        <div className="text-left px-4 text-[#1B4332] flex flex-col items-center">
          <div className="mb-8 w-full max-w-md">
            <input
              type="text"
              placeholder="Nombre de la asignatura"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="rounded-xl border w-full text-base px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-600 mb-4"
            />
            <input
              type="number"
              placeholder="Cantidad de clases"
              value={numberOfClasses}
              onChange={(e) => setNumberOfClasses(Number(e.target.value) || "")}
              className="rounded-xl border w-full text-base px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-600 mb-4"
            />
            <button
              onClick={handleCreateSubject}
              className="bg-[#ADC178] text-black py-2 px-4 rounded-lg hover:bg-[#DDE5B6] hover:border-2 hover:border-[#ADC178] w-full "
            >
              Crear Asignatura
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {data?.listSubject?.map((subject: { id: string; name: string; numberOfClasses: number }) => (
              <div key={subject.id} className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold">{subject.name}</h3>
                <p className="text-gray-500">Cantidad de clases: {subject.numberOfClasses}</p>
                <div className="mt-4 flex space-x-4">
                  <button 
                    className="bg-[#ADC178] text-gray-700 py-2 px-4 rounded-lg hover:bg-[#DDE5B6] hover:border-[#ADC178] hover:border-2"
                    onClick={() => handleViewSubject(subject.id)}
                  >
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
};

export default CreateAsig;
