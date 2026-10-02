// An on/off switch like the ones in macOS System Settings
const Toggle = ({ checked, onChange, label, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    className="switch"
    onClick={() => onChange(!checked)}
  >
    <span />
  </button>
);

export default Toggle;
