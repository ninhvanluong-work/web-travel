import type { LucideIcon } from 'lucide-react';
import {
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  HelpCircle,
  ImageIcon,
  LogOut,
  Package,
  ThumbsUp,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';

import angleDown from '@/assets/svg/angle-down-solid.svg';
import arrowDown from '@/assets/svg/arrow-down.svg';
import arrowLeft from '@/assets/svg/arrow-left.svg';
import arrowRight from '@/assets/svg/arrow-right.svg';
import bell from '@/assets/svg/bell.svg';
import book1 from '@/assets/svg/book1.svg';
import book2 from '@/assets/svg/book2.svg';
import book3 from '@/assets/svg/book3.svg';
import bookmark from '@/assets/svg/bookmark.svg';
import calendar from '@/assets/svg/calendar.svg';
import check from '@/assets/svg/check.svg';
import checkCircle from '@/assets/svg/check-circle.svg';
import checkCircleXs from '@/assets/svg/check-circle-xs.svg';
import clock from '@/assets/svg/clock.svg';
import close from '@/assets/svg/close.svg';
import closeCircle from '@/assets/svg/close-circle.svg';
import clothingWear from '@/assets/svg/clothing-wear.svg';
import coin from '@/assets/svg/coin.svg';
import creaditCard from '@/assets/svg/creadit-card.svg';
import culturalSmile from '@/assets/svg/cultural-smile.svg';
import discord from '@/assets/svg/discord.svg';
import dollar from '@/assets/svg/dollar.svg';
import dots from '@/assets/svg/dots.svg';
import down from '@/assets/svg/down.svg';
import edit from '@/assets/svg/edit.svg';
import exclamationMarkBold from '@/assets/svg/exclamation_mark_bold.svg';
import exclamationMark from '@/assets/svg/exclamation-mark.svg';
import expend1 from '@/assets/svg/expend-1.svg';
import expend2 from '@/assets/svg/expend-2.svg';
import eye from '@/assets/svg/eye.svg';
import eyeHidden from '@/assets/svg/eye-hidden.svg';
import facebook from '@/assets/svg/facebook.svg';
import facebookCircle from '@/assets/svg/facebook_circle.svg';
import globe from '@/assets/svg/globe.svg';
import google from '@/assets/svg/google.svg';
import groupPeople from '@/assets/svg/group-people.svg';
import heart from '@/assets/svg/heart.svg';
import heartSolid from '@/assets/svg/heart-solid.svg';
import hearthFire from '@/assets/svg/hearth-fire.svg';
import houseBring from '@/assets/svg/house-bring.svg';
import image from '@/assets/svg/image.svg';
import image1 from '@/assets/svg/image_1.svg';
import information from '@/assets/svg/information.svg';
import informationBold from '@/assets/svg/information_bold.svg';
import insecurity from '@/assets/svg/insecurity.svg';
import left from '@/assets/svg/left.svg';
import link from '@/assets/svg/link.svg';
import location from '@/assets/svg/location.svg';
import menu from '@/assets/svg/menu.svg';
import message from '@/assets/svg/message.svg';
import metamask from '@/assets/svg/metamask.svg';
import moneyBag from '@/assets/svg/money-bag.svg';
import mountain from '@/assets/svg/mountain.svg';
import music from '@/assets/svg/music.svg';
import paper from '@/assets/svg/paper.svg';
import personBest from '@/assets/svg/person-best.svg';
import personHome from '@/assets/svg/person-home.svg';
import personPickup from '@/assets/svg/person-pickup.svg';
import play from '@/assets/svg/play.svg';
import playSolid from '@/assets/svg/play-solid.svg';
import playTriangleFill from '@/assets/svg/play-triangle-fill.svg';
import plus from '@/assets/svg/plus.svg';
import plusCircle from '@/assets/svg/plus-circle.svg';
import reload from '@/assets/svg/reload.svg';
import search from '@/assets/svg/search.svg';
import security from '@/assets/svg/security.svg';
import sound from '@/assets/svg/sound.svg';
import spinner from '@/assets/svg/spinner.svg';
import star from '@/assets/svg/star.svg';
import sunRise from '@/assets/svg/sun-rise.svg';
import trash from '@/assets/svg/trash.svg';
import trekMountain from '@/assets/svg/trek-mountain.svg';
import twitter from '@/assets/svg/twitter.svg';
import twitterFill from '@/assets/svg/twitter-fill.svg';
import unlink from '@/assets/svg/unlink.svg';
import up from '@/assets/svg/up.svg';
import upload from '@/assets/svg/upload.svg';
import videoOff from '@/assets/svg/video-off.svg';
import volume2Fill from '@/assets/svg/volume-2-fill.svg';
import volumeXFill from '@/assets/svg/volume-x-fill.svg';
import wallet from '@/assets/svg/wallet.svg';
import warning from '@/assets/svg/warning.svg';
import warningCircle from '@/assets/svg/warning-circle.svg';
import X from '@/assets/svg/X.svg';
import xBold from '@/assets/svg/x_bold.svg';
import youtube from '@/assets/svg/youtube.svg';

export type Icon = LucideIcon;
// Inlined to avoid SVGR defaultProps warning (deprecated in React 18) - but now extracted per user request
const IconList = {
  user: User,
  edit,
  check,
  playSolid,
  angleDown,
  warning,
  eyeHidden,
  insecurity,
  arrowLeft,
  arrowRight,
  unlink,
  X,
  facebookCircle,
  twitter,
  eye,
  camera: Camera,
  link,
  bookmark,
  search,
  closeCircle,
  reload,
  checkCircle,
  upload,
  metamask,
  trash,
  plusCircle,
  security,
  star,
  plus,
  location,
  moneyBag,
  message,
  bell,
  spinner,
  arrowDown,
  dollar,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  copy: Copy,
  logout: LogOut,
  helpCircle: HelpCircle,
  google,
  facebook,
  twitterFill,
  discord,
  youtube,
  menu,
  close,
  calendar,
  checkCircleXs,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  book1,
  book2,
  book3,
  coin,
  creaditCard,
  dots,
  down,
  exclamationMark,
  exclamationMarkBold,
  expend1,
  expend2,
  image,
  image1,
  information,
  informationBold,
  left,
  music,
  paper,
  play,
  sound,
  up,
  wallet,
  x: X,
  xBold,
  thumbsUp: ThumbsUp,
  volume2: Volume2,
  volumeX: VolumeX,
  imageIcon: ImageIcon,
  packageIcon: Package,
  heart,
  heartSolid,
  volumeXFill,
  volume2Fill,
  playTriangleFill,
  videoOff,
  clock,
  globe,
  groupPeople,
  personPickup,
  mountain,
  trekMountain,
  hearthFire,
  personHome,
  sunRise,
  personBest,
  warningCircle,
  houseBring,
  clothingWear,
  culturalSmile,
};

export const Icons = IconList as Record<keyof typeof IconList, Icon>;
