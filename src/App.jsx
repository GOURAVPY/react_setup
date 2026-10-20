import gsap from "gsap";
import Pixie from "./components/pixie/Pixie";
import Companions from "./components/pixie/Companions";
import CompanionPicker from "./components/pixie/CompanionPicker";
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
  PixieApp,
  Book,
  Music,
} from "./windows";
import {
  Navbar,
  Welcome,
  Dock,
  Home,
  Login,
  MobileHome,
  Spotlight,
} from "#components";

gsap.registerPlugin(Draggable);

const App = () => {
  return (
    <main>
      <Navbar />
      <Spotlight />
      <Welcome />
      <Dock />
      <MobileHome />
      <Pixie />
      <Companions />
      <CompanionPicker />

      <Terminal />
      <Safari />
      <Resume />
      <Finder />
      <Text />
      <Image />
      <Photos />
      <Settings />
      <Arcade />
      <PixieApp />
      <Book />
      <Music />
      <Contact />
      <Home />
      <Login />
    </main>
  );
};

export default App;
