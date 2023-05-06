// @ts-nocheck

import './style.css'
import SliderCaptcha from './slidercaptcha'
import PddCaptcha from "./pddcaptcha.ts";

// @ts-ignore
window.captcha = new PddCaptcha(
    'slider', {});