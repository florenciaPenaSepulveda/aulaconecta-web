import React from 'react';
import '../styles/loading.css'; // Asegúrate de crear este archivo CSS para los estilos

const Loading: React.FC = () => {
    return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
        </div>
    );
};

export default Loading;
