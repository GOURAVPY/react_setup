import { socials } from "../constants/indax";
import Windowcontrols from "../components/Windowcontrols";
import WindowWrapper from "../hoc/Windowwappre";

const Contact = () => {
  return (
    <>
      <div id="window-header">
        <Windowcontrols target="contact" />
        <h2>Contact Me</h2>
      </div>
      <div className="p-5 space-y-5 ">
        <img
          src="/images/adrian.jpg"
          alt="Adeian"
          className="w-20 rounded-full"
        />
        <h3>Let's connect!</h3>

        <p>Got an idea or a project in mind? Feel free to reach out!</p>

        <ul>
          {socials.map(({ id, bg, link, icon, text }) => (
            <li key={id} style={{ background: bg }}>
              {" "}
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                title={text}
              >
                <img src={icon} alt={text} className="size-6" />
                <p>{text}</p>
              </a>
            </li>
          ))}{" "}
        </ul>
      </div>
    </>
  );
};

const ContactWindow = WindowWrapper(Contact, "contact");

export default ContactWindow;
