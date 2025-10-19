import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SlangDictionaryContainer from './containers/SlangDictionary';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<SlangDictionaryContainer />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
