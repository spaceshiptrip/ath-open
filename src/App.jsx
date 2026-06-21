import { HashRouter, Routes, Route } from 'react-router-dom'
import Header  from './components/Header'
import Footer  from './components/Footer'
import Home     from './pages/Home'
import Register from './pages/Register'
import Teams    from './pages/Teams'
import Schedule from './pages/Schedule'
import Scores   from './pages/Scores'
import Rules    from './pages/Rules'

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/"         element={<Home />}     />
            <Route path="/register" element={<Register />} />
            <Route path="/teams"    element={<Teams />}    />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/scores"   element={<Scores />}   />
            <Route path="/rules"    element={<Rules />}    />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  )
}
