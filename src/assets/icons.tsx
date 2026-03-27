import type { LucideIcon } from 'lucide-react';
import {
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  HelpCircle,
  LogOut,
  ThumbsUp,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React from 'react';

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
import close from '@/assets/svg/close.svg';
import closeCircle from '@/assets/svg/close-circle.svg';
import coin from '@/assets/svg/coin.svg';
import creaditCard from '@/assets/svg/creadit-card.svg';
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
import google from '@/assets/svg/google.svg';
import heart from '@/assets/svg/heart.svg';
import heartSolid from '@/assets/svg/heart-solid.svg';
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
import music from '@/assets/svg/music.svg';
import paper from '@/assets/svg/paper.svg';
import play from '@/assets/svg/play.svg';
import playSolid from '@/assets/svg/play-solid.svg';
import plus from '@/assets/svg/plus.svg';
import plusCircle from '@/assets/svg/plus-circle.svg';
import reload from '@/assets/svg/reload.svg';
import search from '@/assets/svg/search.svg';
import security from '@/assets/svg/security.svg';
import sound from '@/assets/svg/sound.svg';
import spinner from '@/assets/svg/spinner.svg';
import star from '@/assets/svg/star.svg';
import trash from '@/assets/svg/trash.svg';
import twitter from '@/assets/svg/twitter.svg';
import twitterFill from '@/assets/svg/twitter-fill.svg';
import unlink from '@/assets/svg/unlink.svg';
import up from '@/assets/svg/up.svg';
import upload from '@/assets/svg/upload.svg';
import videoOff from '@/assets/svg/video-off.svg';
import wallet from '@/assets/svg/wallet.svg';
import warning from '@/assets/svg/warning.svg';
import X from '@/assets/svg/X.svg';
import xBold from '@/assets/svg/x_bold.svg';
import youtube from '@/assets/svg/youtube.svg';

export type Icon = LucideIcon;
// Inlined to avoid SVGR defaultProps warning (deprecated in React 18)
const volumeXFill = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
  </svg>
);
const volume2Fill = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
    <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.061z" />
  </svg>
);
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
  heart,
  heartSolid,
  volumeXFill,
  volume2Fill,
  videoOff,
};

export const Icons = IconList as Record<keyof typeof IconList, Icon>;
