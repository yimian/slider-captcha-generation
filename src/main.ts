// @ts-nocheck

import './style.css'
import SliderCaptcha from './slidercaptcha'
import PddCaptcha from "./pddcaptcha";
import _ from 'lodash'

// ks style
// @ts-ignore
// window.captcha = new SliderCaptcha({
//     width: 800,
//     height: 400,
//     sliderL: Math.floor(_.random(100 * 0.8, 100 * 1.2)),
//     sliderR: Math.floor(_.random(20 * 0.8, 20 * 1.2)),
//     lineWidth: Math.floor(_.random(2, 8)),
//     initialOffset: Math.floor(_.random(5, 30)),
//     contrast: _.random(0.5, 1),
//     alpha: _.random(0.5, 1.5),
// }, true);

// @ts-ignore
window.captcha = new PddCaptcha({
    width: 640,
    height: 320,
    sliderL: Math.floor(_.random(80 * 0.8, 80 * 1.2)), // 滑块边长
    littleTriangle: Math.floor(10, 15),
    bigTriangle: Math.floor(_.random(11, 20)),
    littleRectangle: Math.floor(10, 15),
    bigRectangle: Math.floor(_.random(11, 20)),
    littleArc: Math.floor(15, 20),
    bigArc: Math.floor(16, 25),
    lineWidth: Math.floor(_.random(2, 5)),
    initialOffset: Math.floor(_.random(5, 30)),
    contrast: _.random(0.5, 1),
    alpha: _.random(0.5, 1.5),
}, true);

window.captcha.show('slider')