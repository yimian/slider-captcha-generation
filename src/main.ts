// @ts-nocheck

import './style.css'
import SliderCaptcha from './slidercaptcha'
import PddCaptcha from "./pddcaptcha";
import _ from 'lodash'

// @ts-ignore
window.captcha = new PddCaptcha({
    width: 640,
    height: 320,
    sliderL: Math.floor(_.random(100 * 0.8, 100 * 1.2)), // 滑块边长
    littleTriangle: Math.floor(15, 20),
    bigTriangle: Math.floor(_.random(16, 25)),
    littleRectangle: Math.floor(15, 20),
    bigRectangle: Math.floor(_.random(16, 25)),
    littleArc: Math.floor(15, 20),
    bigArc: Math.floor(16, 25),
    lineWidth: Math.floor(_.random(2, 5)),
    initialOffset: Math.floor(_.random(5, 30)),
    contrast: _.random(0.5, 1),
    alpha: _.random(0.5, 1.5),
}, true);
window.captcha.show('slider')