import { useCallback } from "react";
import { set, unset } from "sanity";

export function ColorStringInput(props) {
  const { elementProps, onChange, value } = props;
  const colorValue = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value || "") ? value : "#000000";

  const handleChange = useCallback(
    (event) => {
      const nextValue = event.currentTarget.value;
      onChange(nextValue ? set(nextValue) : unset());
    },
    [onChange]
  );

  return (
    <div style={{ display: "grid", gap: "0.5rem", gridTemplateColumns: "44px minmax(0, 1fr)", alignItems: "center" }}>
      <input
        aria-label={elementProps?.["aria-label"] || "Pick color"}
        type="color"
        value={colorValue}
        onChange={handleChange}
        style={{ width: 44, height: 34, padding: 0, border: "1px solid #cad0dc", borderRadius: 4, background: "transparent" }}
      />
      <input {...elementProps} type="text" value={value || ""} onChange={handleChange} placeholder="#e5d70c" />
    </div>
  );
}
