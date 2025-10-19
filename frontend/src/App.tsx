import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SlangDictionaryContainer from './containers/SlangDictionary';
import AuthContainer from './containers/Auth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<SlangDictionaryContainer />} />
        <Route path='/signup' element={<AuthContainer />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
