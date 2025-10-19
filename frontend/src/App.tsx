import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthContainer from './containers/Auth';
import SlangDictionaryContainer from './containers/SlangDictionary';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/signup' element={<AuthContainer />} />
        <Route path='/' element={<SlangDictionaryContainer />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
