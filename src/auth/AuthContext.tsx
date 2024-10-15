import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define el tipo de datos que almacenará tu contexto
interface AuthContextType {
    user: any;
    login: (username: string, password: string) => void;
    logout: () => void;
}

// Crea el contexto con un valor por defecto
const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;  // Define el tipo de children como ReactNode
    }

// Componente proveedor del contexto
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<any>(null);

    const login = (username: string, password: string) => {
    // Aquí va tu lógica para el login
    setUser({ username, password }); // Simulación de un usuario logueado
    };

    const logout = () => {
    // Aquí va tu lógica para el logout
    setUser(null);
    };

    return (
    <AuthContext.Provider value={{ user, login, logout }}>
        {children}
    </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe estar dentro del proveedor AuthProvider');
    }
    return context;
};