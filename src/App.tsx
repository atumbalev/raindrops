import './App.css'
import hamster from './assets/hampter.png'
import Raindrops from './components/Raindrops';


function App() {
  return (
    <>
      <Raindrops />
      <main>
        <img src={hamster} width='100px'/>
      </main>
    </>
  );
}

export default App;
