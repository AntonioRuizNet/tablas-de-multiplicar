import {
  GiLion, GiWizardStaff, GiWolfHead, GiWyvern, GiZebraShield, GiYinYang,
  GiXylophone, GiZeppelin, GiWitchFace, GiWizardFace, GiWoodenHelmet, GiWorld,
  GiWolverineClaws, GiHummingbird, GiHorseHead, GiHoodedAssassin, GiHoneycomb,
  GiHydra, GiIceGolem, GiImperialCrown, GiIncomingRocket, GiInvisibleFace,
  GiJellyfish, GiLightningTrio,
} from "react-icons/gi";
import { FaCat, FaDog, FaDragon, FaFish, FaFrog, FaHippo, FaHorse, FaSpider } from "react-icons/fa";

export const AVATAR_COLORS = [
  "#5B8DEF", "#7C5CE7", "#E85D75", "#F28C4B", "#E5B83B", "#56B870",
  "#2FB7A8", "#2F9BD8", "#9B59B6", "#D96CBE", "#8B6F47", "#5F6B7A",
];

export const AVATARS = [
  ["GiLion", GiLion], ["GiWizardStaff", GiWizardStaff], ["GiWolfHead", GiWolfHead], ["GiWyvern", GiWyvern],
  ["GiZebraShield", GiZebraShield], ["GiYinYang", GiYinYang], ["GiXylophone", GiXylophone], ["GiZeppelin", GiZeppelin],
  ["GiWitchFace", GiWitchFace], ["GiWizardFace", GiWizardFace], ["GiWoodenHelmet", GiWoodenHelmet], ["GiWorld", GiWorld],
  ["GiWolverineClaws", GiWolverineClaws], ["GiHummingbird", GiHummingbird], ["GiHorseHead", GiHorseHead], ["GiHoodedAssassin", GiHoodedAssassin],
  ["GiHoneycomb", GiHoneycomb], ["GiHydra", GiHydra], ["GiIceGolem", GiIceGolem], ["GiImperialCrown", GiImperialCrown],
  ["GiIncomingRocket", GiIncomingRocket], ["GiInvisibleFace", GiInvisibleFace], ["GiJellyfish", GiJellyfish], ["GiLightningTrio", GiLightningTrio],
  ["FaCat", FaCat], ["FaDog", FaDog], ["FaDragon", FaDragon], ["FaFish", FaFish],
  ["FaFrog", FaFrog], ["FaHippo", FaHippo], ["FaHorse", FaHorse], ["FaSpider", FaSpider],
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
