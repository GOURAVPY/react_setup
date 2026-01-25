import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
const renderText = (text, className, baseweight = 400) => {
  return [...text].map((char, i) => (
    <span
      key={i}
      className={className}
      style={{ fontVariationSettings: `'wght' ${baseweight}` }}
    >
      {char === "" ? "\u00A0" : char}
    </span>
  ));
};

const FONT_WEIGHTS = {
  subref: { min: 100, max: 400, default: 100 },
  pareref: { min: 400, max: 900, default: 400 },
};
const setuptexthovr = (container, type) => {
  if (!container) return;
  const letters = container.querySelectorAll("span");
  const { min, max, default: base } = FONT_WEIGHTS[type];
  const animeteletter = (letter, weight, duration = 0.25) => {
    return gsap.to(letter, {
      duration,
      ease: "power2.out",
      fontVariationSettings: `'wght' ${weight}`,
    });
  };
  const handleMouseMove = (e) => {
    const { left } = container.getBoundingClientRect();
    const mouseX = e.clientX - left;
    letters.forEach((letter) => {
      const { left: l, width: w } = letter.getBoundingClientRect();
      const distance = Math.abs(mouseX - (l - left + w / 2));
      const intensity = Math.exp(-(distance ** 2) / 2000);
      animeteletter(letter, min + (max - min) * intensity);
    });
  };
  const handleMouseLeave = () => {
    letters.forEach((letter) => animeteletter(letter, base, 0.3));
  };
  container.addEventListener("mousemove", handleMouseMove);
  container.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    container.removeEventListener("mousemove", handleMouseMove);
    container.removeEventListener("mouseleave", handleMouseLeave);
  };
};

const Welcome = () => {
  const pareref = useRef(null);
  const subref = useRef(null);

  useGSAP(() => {
    const parecleanUP = setuptexthovr(pareref.current, "pareref");
    const subcleanUP  = setuptexthovr(subref.current, "subref");
  
    return () => {
      parecleanUP()
      subcleanUP()
    }
  
  }, []);

  return (
    <section id="welcome">
      <p ref={subref}>
        {renderText(
          "Hi, i'm Gourav Welcome to my",
          "text-3xl font-georama",
          100,
        )}
      </p>
      <h1 ref={pareref} className="mt-7">
        {renderText("portfolio", "text-9xl italic font-georama")}
      </h1>

      <div className="small-screen">
        <p>This portfolio is designed for desktop/tabled screens only.</p>
      </div>
    </section>
  );
};

export default Welcome;
