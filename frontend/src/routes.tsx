import { Routes, Route, Navigate } from 'react-router-dom';
import SlangDictionaryContainer from './containers/SlangDictionary';
import AuthContainer from './containers/Auth';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<SlangDictionaryContainer />} />
      <Route path='/signup' element={<AuthContainer />} />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}
