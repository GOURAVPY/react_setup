import { useRef } from "react";
import { dockApps } from "#constants/indax.js";
import { Tooltip } from "react-tooltip";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import useWindowStore from "../store/window";

const Dock = () => {
  const { openWindow, focusWindow, windows } = useWindowStore();
  const Dockref = useRef(null);

  useGSAP(() => {
    const dock = Dockref.current;
    if (!dock) return;

    const icons = dock.querySelectorAll(".dock-icon");

    const animateIcons = (mouseX) => {
      const { left: dockLeft } = dock.getBoundingClientRect();

      icons.forEach((icon) => {
        const { left: iconLeft, width } = icon.getBoundingClientRect();
        const center = iconLeft - dockLeft + width / 2;
        const distance = Math.abs(mouseX - center);

        const intensity = Math.exp(-(distance ** 2.5) / 20000);

        gsap.to(icon, {
          scale: 1 + 0.25 * intensity,
          y: -15 * intensity,
          duration: 0.2,
          ease: "power1.out",
        });
      });
    };

    const handleMouseMove = (e) => {
      const { left } = dock.getBoundingClientRect();
      animateIcons(e.clientX - left);
    };

    const resetIcons = () => {
      icons.forEach((icon) =>
        gsap.to(icon, {
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "power1.out",
        }),
      );
    };

    dock.addEventListener("mousemove", handleMouseMove);
    dock.addEventListener("mouseleave", resetIcons);

    return () => {
      dock.removeEventListener("mousemove", handleMouseMove);
      dock.removeEventListener("mouseleave", resetIcons);
    };
  }, []);

  const bounceIcon = (button) => {
    gsap.to(button.querySelector("img"), {
      y: -18,
      duration: 0.22,
      ease: "power2.out",
      yoyo: true,
      repeat: 3,
    });
  };

  // Like the macOS dock: opens the app, restores it if minimized, or brings
  // an already open window to the front. Windows close with their red button.
  const launchApp = (app, button) => {
    if (!app.canOpen) return;

    const window = windows[app.id];

    if (window.isOpen && !window.isMinimized) {
      focusWindow(app.id);
    } else {
      if (!window.isOpen) bounceIcon(button);
      openWindow(app.id);
    }
  };

  return (
    <section id="dock">
      <div ref={Dockref} className="dock-container">
        {dockApps.map(({ id, name, icon, canOpen }) => (
          <div key={id} className="relative flex justify-center">
            {" "}
            <button
              type="button"
              className="dock-icon"
              aria-label={name}
              data-app={id}
              data-tooltip-id="dock-tooltip"
              data-tooltip-content={name}
              data-tooltip-delay-show={150}
              disabled={!canOpen}
              onClick={(e) => launchApp({ id, canOpen }, e.currentTarget)}
            >
              {" "}
              <img
                src={`/images/${icon}`}
                alt={name}
                loading="lazy"
                className={canOpen ? "" : "opacity-60"}
              />{" "}
            </button>{" "}
            {windows[id]?.isOpen && <span className="dock-dot" />}
          </div>
        ))}
        <Tooltip id="dock-tooltip" place="top" className="tooltip" />
      </div>
    </section>
  );
};

export default Dock;
