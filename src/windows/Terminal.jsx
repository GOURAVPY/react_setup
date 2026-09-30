import { useRef } from "react";
import { Check, Flag } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { techStack } from "../constants/indax";
import Windowwappre from "../hoc/Windowwappre";
import { Windowcontrols } from "../components";
import useWindowStore from "../store/window";

const COMMAND = "show tech stack";

const Terminal = () => {
  const isOpen = useWindowStore((state) => state.windows.terminal.isOpen);
  const container = useRef(null);
  const command = useRef(null);

  // Replays every time the window opens: the command is typed out, then the
  // output prints line by line like a real terminal
  useGSAP(
    () => {
      if (!isOpen) return;

      const typed = { length: 0 };
      command.current.textContent = "";
      gsap.set(".line, .next-prompt", { autoAlpha: 0 });
      gsap.set(".content", { borderColor: "transparent" });

      gsap
        .timeline({ delay: 0.6 })
        .to(typed, {
          length: COMMAND.length,
          duration: COMMAND.length * 0.07,
          ease: `steps(${COMMAND.length})`,
          onUpdate: () => {
            command.current.textContent = COMMAND.slice(
              0,
              Math.round(typed.length),
            );
          },
        })
        .set(".typing-cursor", { display: "none" }, "+=0.35")
        .to(".line", { autoAlpha: 1, duration: 0.01, stagger: 0.12 }, "+=0.15")
        .set(".content", { clearProps: "borderColor" }, "<0.12")
        .set(".next-prompt", { autoAlpha: 1 }, "+=0.2");
    },
    { dependencies: [isOpen], scope: container, revertOnUpdate: true },
  );

  return (
    <>
      <div id="window-header">
        <Windowcontrols target="terminal" />
        <h2>Tech Stack</h2>
      </div>
      <div className="techstack" ref={container}>
        <p>
          <span>@gourav % </span>
          <span ref={command}>{COMMAND}</span>
          <span className="cursor typing-cursor" />
        </p>
        <div className="label line">
          <p className="w-32">Category</p>
          <p>Technologies</p>
        </div>
        <ul className="content">
          {techStack.map(({ category, items }) => (
            <li key={category} className="flex items-center line">
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
          <p className="line">
            <Check size={20} />
            {techStack.length} of {techStack.length} stacks loaded successfully
          </p>
          <p className="text-black line">
            <Flag size={15} fill="currentColor" />
            Render time : 6ms
          </p>
        </div>
        <p className="next-prompt mt-5">
          <span>@gourav % </span>
          <span className="cursor" />
        </p>
      </div>
    </>
  );
};

const TerminalWindow = Windowwappre(Terminal, "terminal");

export default TerminalWindow;
