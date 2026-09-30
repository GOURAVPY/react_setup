import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import {
  Terminal,
  Safari,
  Resume,
  Finder,
  Text,
  Contact,
  Image,
  Photos,
} from "./windows";
import { Navbar, Welcome, Dock, Home, Login } from "#components";

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
      <Text />
      <Image />
      <Photos />
      <Contact />
      <Home />
      <Login />
    </main>
  );
};

export default App;
