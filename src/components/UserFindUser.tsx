import React from 'react';
import './ServiceFind.css';
import { Link } from 'react-router-dom';


const UserFindUser: React.FC = () => {
  const initialUsers = [
    { 
      id_servicio: 1, 
      name: 'Syket', 
      age: 20, 
      designation: 'Software Engineer', 
      direction: [-29.964266320209205, -71.34929533552395],
      ventas: [12, 19, 3, 5, 2, 3], // Datos de ventas mensuales
      ganancias: [50, 25, 80, 60, 35, 70], // Datos de ganancias mensuales
    },
    { 
      id_servicio: 2, 
      name: 'Sakib', 
      age: 25, 
      designation: 'Programmer', 
      direction: [-29.964266320209205, -71.34929533552395],
      ventas: [8, 15, 5, 3, 1, 4], // Datos de ventas mensuales
      ganancias: [45, 30, 60, 50, 25, 55], // Datos de ganancias mensuales
    },
    { 
      id_servicio: 3, 
      name: 'Jamy', 
      age: 30, 
      designation: 'Designer', 
      direction: [-29.964266320209205, -71.34929533552395],
      ventas: [10, 18, 4, 6, 3, 2], // Datos de ventas mensuales
      ganancias: [55, 28, 75, 65, 40, 60], // Datos de ganancias mensuales
    },
    { 
      id_servicio: 4, 
      name: 'Hanif', 
      age: 20, 
      designation: 'UX Writer', 
      direction: [-29.964266320209205, -71.34929533552395],
      ventas: [15, 22, 7, 4, 3, 5], // Datos de ventas mensuales
      ganancias: [60, 35, 90, 70, 45, 80], // Datos de ganancias mensuales
    },
  ];

  const [userList, setUserList] = React.useState(initialUsers);

  const handleDelete = (id_servicio: number) => {
    const updatedUsers = userList.filter((user) => user.id_servicio !== id_servicio);
    setUserList(updatedUsers);
  };

  return (
    <div className='bg-[#95D5B2]'>
      <div className="body">
        {userList.length === 0 && (
          <div className="notFound">No User Found</div>
        )}

        {userList.length > 0 && userList.map((user) => {
          return (
            <div className="body__item" key={user.id_servicio}>
              <p>Servicio: {user.designation}</p>
              <Link to={`/ServiceStats/${user.id_servicio}`}>
                <button type="submit" className="bg-[#95D5B2] rounded-md text-[#1B4332] py-1 hover:scale-105 duration-300 w-full">
                  Ver Servicio
                </button>
              </Link>
              <Link to={`/EditarServicio/${user.id_servicio}`}>
                <button type="button" className="bg-[#FFC107] rounded-md text-[#1B4332] py-1 hover:scale-105 duration-300 w-full mt-2">
                  Editar
                </button>
              </Link>
              <button 
                type="button" 
                onClick={() => handleDelete(user.id_servicio)} 
                className="bg-[#DC3545] rounded-md text-black py-1 hover:scale-105 duration-300 w-full mt-2">
                Eliminar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserFindUser;


