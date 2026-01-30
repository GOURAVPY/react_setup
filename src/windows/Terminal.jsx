import { Check, Flag } from "lucide-react";
import { techStack } from "../constants/indax";
import Windowwappre from "../hoc/Windowwappre";
import { Windowcontrols } from "../components";

const Terminal = () => {
  return (
    <>
      <div id="window-header">
        <Windowcontrols target="terminal" />
        <h2>Tech Stack</h2>
      </div>
      <div className="techstack">
        <p>
          <span>@gourav %</span>
          show tech stack
        </p>
        <div className="label">
          <p className="w-32">Category</p>
          <p>Technologies</p>
        </div>
        <ul className="content">
          {techStack.map(({ category, items }) => (
            <li key={category} className="flex items-center">
              <Check className="check" size={20} />
              <h3>{category}</h3>
              <ul>
                {items.map((item, i) => (
                  <li key={i}>
                    {item}
                    {i < items.length - 1 ? "," : ""}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <div className="footnote">
          <p>
            <Check size={20} />5 of 5 stacks loaded successfully
          </p>
          <p className="text-black">
            <Flag size={15} fill="black" />
            Rendar time : 6ms
          </p>
        </div>
      </div>
    </>
  );
};

const TerminalWindow = Windowwappre(Terminal, "terminal");

export default TerminalWindow;
