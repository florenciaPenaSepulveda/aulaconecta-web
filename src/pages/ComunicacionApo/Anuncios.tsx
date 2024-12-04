import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import NavBar from "../../components/NavBar";
import { CREATE_NOTICE, GET_ALL_NOTICES } from "../../graphql/queries/user/index";
import Swal from "sweetalert2";

const Anuncios: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);

  // Mutations y Queries
  const [createNotice] = useMutation(CREATE_NOTICE);
  const { data: noticesData, loading, error, refetch } = useQuery(GET_ALL_NOTICES);

  // Función para enviar el anuncio
  const handleSendNotification = async () => {
    if (!title.trim() || !description.trim()) {
      Swal.fire("Error", "Por favor, complete todos los campos antes de enviar.", "error");
      return;
    }
  
    setIsSending(true);
  
    try {
      const { data } = await createNotice({
        variables: {
          title,
          description,
          imageUrl: imageUrl.trim() || null, // Envía null si está vacío
        },
      });
  
      if (data.createNotice.isCreateNotice) {
        Swal.fire("Éxito", "Notificación enviada correctamente.", "success");
        setTitle("");
        setDescription("");
        setImageUrl("");
        refetch(); // Actualiza la lista de anuncios
      } else {
        Swal.fire("Error", "Hubo un problema al enviar la notificación.", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Hubo un problema al enviar la notificación.", "error");
    } finally {
      setIsSending(false);
    }
  };
  

  // Muestra estado de carga o errores
  if (loading) return <p className="text-gray-500">Cargando anuncios...</p>;
  if (error) {
    console.error(error);
    return <p className="text-red-500">Error al cargar anuncios. Por favor, intente de nuevo.</p>;
  }

  return (
    <div className="bg-[#DDE5B6] min-h-screen">
      <NavBar />
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-5xl font-bold text-[#1B4332] mb-8">Publicar Anuncio</h1>
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto mb-12">
          <div className="mb-4">
            <label htmlFor="title" className="block text-left text-lg font-medium text-gray-700">
              Título:
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-[#ADC178] focus:border-[#ADC178]"
              placeholder="Escribe el título de la notificación"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-left text-lg font-medium text-gray-700">
              Descripción:
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-[#ADC178] focus:border-[#ADC178] resize-none"
              rows={5}
              placeholder="Escribe el mensaje para los usuarios"
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="imageUrl" className="block text-left text-lg font-medium text-gray-700">
              URL de Imagen (opcional):
            </label>
            <input
              type="text"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-[#ADC178] focus:border-[#ADC178]"
              placeholder="Escribe la URL de la imagen"
            />
          </div>
          <button
            onClick={handleSendNotification}
            className={`bg-[#ADC178] text-white py-2 px-6 rounded-lg hover:bg-[#DDE5B6] transition-all ${
              isSending ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isSending}
          >
            {isSending ? "Enviando..." : "Enviar Notificación"}
          </button>
        </div>

        {/* Lista de anuncios publicados */}
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1B4332] mb-4">Anuncios Publicados</h2>
          {noticesData?.getAllNotices?.length > 0 ? (
            <div className="grid gap-6">
            {noticesData.getAllNotices.map((notice: any) => (
              <div key={notice.id} className="p-4 border border-gray-300 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-[#1B4332]">{notice.title}</h3>
                <p className="text-gray-700">{notice.description}</p>
                {notice.imageUrl ? (
                  <img
                    src={notice.imageUrl}
                    alt="Imagen del anuncio"
                    className="mt-4 rounded-lg w-full max-h-64 object-cover"
                  />
                ) : (
                  <p className="text-gray-500 italic">Sin imagen</p> 
                )}
              </div>
            ))}
          </div>
          
          ) : (
            <p className="text-gray-500">No hay anuncios publicados.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Anuncios;
