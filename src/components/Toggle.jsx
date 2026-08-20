export default function Toggle({ on, onClick }) {
  return <button className={`toggle ${on ? "on" : ""}`} onClick={onClick} aria-pressed={on} />;
}
