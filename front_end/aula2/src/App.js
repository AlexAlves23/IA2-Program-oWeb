import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/navbar';
import Produtos from './components/pages/produtos';
import Home from './components/pages/home';
import Painel from './components/pages/painel';


function App() {
  return (
    <div className="App">
      <Router>
        <NavBar />
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/produtos" element={<Produtos />} />
          <Route path="/home" element={<Painel />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
