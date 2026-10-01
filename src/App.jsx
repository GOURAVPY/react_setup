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
  Settings,
  Arcade,
} from "./windows";
import {
  Navbar,
  Welcome,
  Dock,
  Home,
  Login,
  MobileHome,
} from "#components";

gsap.registerPlugin(Draggable);

const App = () => {
  return (
    <main>
      <Navbar />
      <Welcome />
      <Dock />
      <MobileHome />

      <Terminal />
      <Safari />
      <Resume />
      <Finder />
      <Text />
      <Image />
      <Photos />
      <Settings />
      <Arcade />
      <Contact />
      <Home />
      <Login />
    </main>
  );
};

export default App;
