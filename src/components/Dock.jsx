import { useEffect, useRef, useState } from "react";
import { dockApps } from "#constants/indax.js";
import { Tooltip } from "react-tooltip";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import clsx from "clsx";
import useWindowStore from "../store/window";
import useLaunchApp from "../store/launch";
import useDockStore from "../store/dock";
import AppIcon from "./AppIcon";

const MAGNIFY = 0.25; // how much bigger the icon under the pointer grows
const LIFT = 15; // px the icon under the pointer rises out of the dock
const HIDE_DELAY = 400; // ms before an auto-hiding dock slides away

const Dock = () => {
  const windows = useWindowStore((state) => state.windows);
  const launch = useLaunchApp();
  const autohide = useDockStore((state) => state.autohide);
  const indicators = useDockStore((state) => state.indicators);
  const Dockref = useRef(null);
  const hideTimer = useRef(null);
  const [revealed, setRevealed] = useState(false);

  // Magnification: icons near the pointer grow and lift out of the dock
  useGSAP(() => {
    const dock = Dockref.current;
    if (!dock) return;

    // One reusable tween per icon and property, retargeted on every mouse
    // move, instead of piling up a new tween each time. quickTo needs real
    // properties, so scale is driven as its two halves.
    const icons = [...dock.querySelectorAll(".dock-icon")].map((icon) => ({
      scaleX: gsap.quickTo(icon, "scaleX", { duration: 0.2, ease: "power2.out" }),
      scaleY: gsap.quickTo(icon, "scaleY", { duration: 0.2, ease: "power2.out" }),
      y: gsap.quickTo(icon, "y", { duration: 0.2, ease: "power2.out" }),
      icon,
    }));

    // Where each icon's centre sits, read once when the pointer arrives.
    // Reading it on every move would force the browser to lay the page out
    // again between frames, which makes the hover stutter.
    let centers = [];
    const measure = () => {
      centers = icons.map(({ icon }) => {
        const box = icon.getBoundingClientRect();
        return box.left + box.width / 2;
      });
    };

    const handleMouseMove = (e) => {
      if (!centers.length) measure();
      icons.forEach(({ scaleX, scaleY, y }, i) => {
        const distance = Math.abs(e.clientX - centers[i]);
        const intensity = Math.exp(-(distance ** 2.5) / 20000);
        scaleX(1 + MAGNIFY * intensity);
        scaleY(1 + MAGNIFY * intensity);
        y(-LIFT * intensity);
      });
    };

    const resetIcons = () =>
      icons.forEach(({ scaleX, scaleY, y }) => {
        scaleX(1);
        scaleY(1);
        y(0);
      });

    dock.addEventListener("mouseenter", measure);
    dock.addEventListener("mousemove", handleMouseMove);
    dock.addEventListener("mouseleave", resetIcons);

    return () => {
      dock.removeEventListener("mouseenter", measure);
      dock.removeEventListener("mousemove", handleMouseMove);
      dock.removeEventListener("mouseleave", resetIcons);
    };
  }, []);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const reveal = () => {
    clearTimeout(hideTimer.current);
    setRevealed(true);
  };

  const hideSoon = () => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setRevealed(false), HIDE_DELAY);
  };

  const bounceIcon = (button) => {
    gsap.to(button.querySelector(".app-icon"), {
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

    if (windows[app.id] && !windows[app.id].isOpen) bounceIcon(button);
    launch(app.id);
  };

  return (
    <>
      {/* an auto-hiding dock comes back when the pointer reaches the bottom */}
      {autohide && (
        <div className="dock-hotzone" onMouseEnter={reveal} aria-hidden="true" />
      )}

      <section
        id="dock"
        className={clsx(autohide && "autohide", revealed && "revealed")}
        onMouseEnter={autohide ? reveal : undefined}
        onMouseLeave={autohide ? hideSoon : undefined}
      >
        <div ref={Dockref} className="dock-container">
          {dockApps.map(({ id, name, icon, canOpen }) => (
            <div key={id} className="dock-item">
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
                onFocus={autohide ? reveal : undefined}
                onBlur={autohide ? hideSoon : undefined}
              >
                <AppIcon
                  id={id}
                  image={icon}
                  className={clsx(!canOpen && "opacity-60")}
                />
              </button>
              {indicators && windows[id]?.isOpen && (
                <span className="dock-dot" />
              )}
            </div>
          ))}
          <Tooltip id="dock-tooltip" place="top" className="tooltip" />
        </div>
      </section>
    </>
  );
};

export default Dock;
