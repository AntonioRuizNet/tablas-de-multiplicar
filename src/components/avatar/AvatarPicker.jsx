import React from "react";
import PropTypes from "prop-types";
import { AVATARS, AVATAR_COLORS } from "../../lib/avatars";
import { UserAvatar } from "./UserAvatar";
import styles from "./AvatarPicker.module.css";

export function AvatarPicker({ icon, color, onIconChange, onColorChange, disabled = false }) {
  return (
    <div className={styles.picker}>
      <div className={styles.previewRow}>
        <UserAvatar icon={icon} color={color} size={76} />
        <div><strong>Tu avatar</strong><p>Elige un personaje y un color.</p></div>
      </div>
      <div className={styles.icons} role="list" aria-label="Avatares disponibles">
        {AVATARS.map(([name, Icon]) => (
          <button
            key={name}
            type="button"
            className={`${styles.iconButton} ${name === icon ? styles.selected : ""}`}
            onClick={() => onIconChange(name)}
            aria-label={`Seleccionar ${name}`}
            aria-pressed={name === icon}
            disabled={disabled}
          ><Icon /></button>
        ))}
      </div>
      <div className={styles.colors} aria-label="Colores disponibles">
        {AVATAR_COLORS.map((item) => (
          <button
            key={item}
            type="button"
            className={`${styles.colorButton} ${item === color ? styles.selectedColor : ""}`}
            style={{ backgroundColor: item }}
            onClick={() => onColorChange(item)}
            aria-label={`Color ${item}`}
            aria-pressed={item === color}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

AvatarPicker.propTypes = {
  icon: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  onIconChange: PropTypes.func.isRequired,
  onColorChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
