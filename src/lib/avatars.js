import {
  GiLion, GiFox, GiPanda, GiRabbit, GiOwl, GiTurtle, GiOctopus, GiSharkFin,
  GiDragonHead, GiDinosaurBones, GiUnicorn, GiRobotGolem, GiAstronautHelmet,
  GiRocket, GiCrownedSkull, GiCrown, GiShield, GiSoccerBall, GiBasketballBall,
  GiTennisRacket, GiLightningTrio, GiStarSwirl, GiFire, GiCrystalBall,
  GiPirateFlag, GiNinjaHeroicStance, GiWizardStaff, GiKnightBanner,
  GiPlanetCore, GiCometSpark,
} from "react-icons/gi";

export const AVATAR_COLORS = [
  "#5B8DEF", "#7C5CE7", "#E85D75", "#F28C4B", "#E5B83B", "#56B870",
  "#2FB7A8", "#2F9BD8", "#9B59B6", "#D96CBE", "#8B6F47", "#5F6B7A",
];

export const AVATARS = [
  ["GiLion", GiLion], ["GiFox", GiFox], ["GiPanda", GiPanda], ["GiRabbit", GiRabbit],
  ["GiOwl", GiOwl], ["GiTurtle", GiTurtle], ["GiOctopus", GiOctopus], ["GiSharkFin", GiSharkFin],
  ["GiDragonHead", GiDragonHead], ["GiDinosaurBones", GiDinosaurBones], ["GiUnicorn", GiUnicorn], ["GiRobotGolem", GiRobotGolem],
  ["GiAstronautHelmet", GiAstronautHelmet], ["GiRocket", GiRocket], ["GiCrownedSkull", GiCrownedSkull], ["GiCrown", GiCrown],
  ["GiShield", GiShield], ["GiSoccerBall", GiSoccerBall], ["GiBasketballBall", GiBasketballBall], ["GiTennisRacket", GiTennisRacket],
  ["GiLightningTrio", GiLightningTrio], ["GiStarSwirl", GiStarSwirl], ["GiFire", GiFire], ["GiCrystalBall", GiCrystalBall],
  ["GiPirateFlag", GiPirateFlag], ["GiNinjaHeroicStance", GiNinjaHeroicStance], ["GiWizardStaff", GiWizardStaff], ["GiKnightBanner", GiKnightBanner],
  ["GiPlanetCore", GiPlanetCore], ["GiCometSpark", GiCometSpark],
];

export const AVATAR_ICON_NAMES = AVATARS.map(([name]) => name);
export const DEFAULT_AVATAR_ICON = "GiLion";
export const DEFAULT_AVATAR_COLOR = "#5B8DEF";

export function normalizeAvatar(icon, color) {
  return {
    icon: AVATAR_ICON_NAMES.includes(icon) ? icon : DEFAULT_AVATAR_ICON,
    color: AVATAR_COLORS.includes(color) ? color : DEFAULT_AVATAR_COLOR,
  };
}

export function avatarComponent(name) {
  return AVATARS.find(([iconName]) => iconName === name)?.[1] || GiLion;
}
