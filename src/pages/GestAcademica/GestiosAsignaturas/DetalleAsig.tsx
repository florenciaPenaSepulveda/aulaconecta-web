import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { LISTAR_CURSOS } from "../../../graphql/queries/user";
import NavBar from "../../../components/NavBar";

const DetalleAsig: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useQuery(LISTAR_CURSOS);

  const subject = data?.listSubject?.find((subject: { id: string }) => subject.id === id);

  if (loading) return <p>Cargando...</p>;
  if (error || !subject) return <p>Error al cargar los detalles de la asignatura</p>;

  return (
    <div className="bg-[#DDE5B6] min-h-screen">
      <NavBar />
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-5xl font-bold text-[#1B4332] mb-8">Detalle de la Asignatura</h1>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold">{subject.name}</h3>
          <p className="text-gray-500">Cantidad de clases: {subject.numberOfClasses}</p>
        </div>
      </div>
    </div>
  );
};

export default DetalleAsig;
