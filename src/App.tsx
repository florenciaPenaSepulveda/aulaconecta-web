import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import ForgotPass from './pages/Login/ForgotPass';
import Register from './pages/Login/Register';
import HomeLogin from './pages/HomeLogin';
import RegisterEst from './pages/GestAcademica/RegistEstudiante/RegisterEst';
import CreateAsig from './pages/GestAcademica/GestiosAsignaturas/CreateAsig';
import TomaAsistencia from './pages/GestAcademica/ControlDeAsistencia/TomaAsistencia';
import Chat from './pages/ComunicacionApo/Chat';
import ChangePassword from './pages/Login/ChangePassword';

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
                <Route path="/TomaAsistencia" element={<TomaAsistencia/>}/>
                <Route path="/Chat" element={<Chat/>}/>
            </Routes>
        </Router>
    );
}

export default App;