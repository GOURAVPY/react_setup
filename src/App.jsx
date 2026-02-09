import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import {
  Terminal,
  Safari,
  Resume,
  Finder,
  Text,
  Contact,

} from "./windows";
import { Navbar, Welcome, Dock ,  Home, } from "#components";

gsap.registerPlugin(Draggable);

const App = () => {
  return (
    <main>
      <Navbar />
      <Welcome />
      <Dock />

      <Terminal />
      <Safari />
      <Resume />
      <Finder />
      {/* <Text /> */}
      <Contact />
      <Home />
    </main>
  );
};

export default App;
