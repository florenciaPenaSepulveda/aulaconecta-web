import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import ForgotPass from './pages/Login/ForgotPass';
import Register from './pages/Login/Register';
import HomeLogin from './pages/HomeLogin';
import RegisterEst from './pages/GestAcademica/RegistEstudiante/RegisterEst';
import CreateAsig from './pages/GestAcademica/GestiosAsignaturas/CreateAsig';
import Chat from './pages/ComunicacionApo/Chat';
import Anuncios from './pages/ComunicacionApo/Anuncios';
import ChangePassword from './pages/Login/ChangePassword';
import DetalleAsig from './pages/GestAcademica/GestiosAsignaturas/DetalleAsig';
import Notas from './pages/GestAcademica/GestiosAsignaturas/Notas';
const App = () => {
    return(
        <Router>
            <Routes>
                <Route path="/" element={<Login/>}/>
                <Route path="/ForgotPass" element={<ForgotPass/>} />
                <Route path='/Register' element ={<Register/>} />
                <Route path="/ChangePassword" element={<ChangePassword/>}/>
                <Route path="/HomeLogin" element={<HomeLogin/>} />
                <Route path="/RegisterEst" element={<RegisterEst/>}/>
                <Route path="/CreateAsig" element={<CreateAsig/>}/>
                <Route path="/Chat" element={<Chat/>}/>
                <Route path="/Anuncios" element={<Anuncios/>}/>
                <Route path="/DetalleAsig/:idSubject" element={<DetalleAsig/>}/>
                <Route path="/Notas/:idSubject" element={<Notas />} />

            </Routes>
        </Router>
    );
}

export default App;