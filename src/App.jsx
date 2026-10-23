import { Route, Routes } from 'react-router';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Deck from './pages/Deck.jsx';
import Study from './pages/Study.jsx';
import Words from './pages/Words.jsx';
import Word from './pages/Word.jsx';
import Settings from './pages/Settings.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="deck/:id" element={<Deck />} />
        <Route path="deck/:id/study" element={<Study />} />
        <Route path="words" element={<Words />} />
        <Route path="words/:word" element={<Word />} />
        <Route path="settings" element={<Settings />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
