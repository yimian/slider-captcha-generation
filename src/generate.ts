// @ts-nocheck
import PddCaptcha from './pddcaptcha'
import SliderCaptcha from "./slidercaptcha"
import _ from 'lodash'

const fs = require('fs')
const CryptoLib = require('crypto')
const PathLib = require('path')
const {XMLBuilder} = require('fast-xml-parser')
const {program} = require('commander')

class VocWriter {
    constructor(path, width, height) {
        let absPath = PathLib.resolve(path)
        this.jsObj = {
            annotation: {
                folder: PathLib.basename(PathLib.dirname(absPath)),
                filename: PathLib.basename(absPath),
                path: absPath,
                source: {
                    database: 'Unknown',
                },
                size: {
                    width: width,
                    height: height,
                    depth: 3,
                },
                segmented: 0,
                object: []
            },
        }
    }

    addObject(name, xmin, ymin, xmax, ymax) {
        this.jsObj.annotation.object.push({
            name: name,
            pose: 'Unspecified',
            truncated: 0,
            difficult: 0,
            bndbox: {
                xmin: xmin,
                ymin: ymin,
                xmax: xmax,
                ymax: ymax,
            },
        })
    }

    save(annotation_path) {
        const builder = new XMLBuilder({
            format: true,
            ignoreAttributes: true
        })
        const xmlStr = builder.build(this.jsObj)
        fs.writeFileSync(annotation_path, xmlStr)
    }
}

enum SliderType {
    Ks,
    Pdd
}

function generateSliderCaptcha(type: SliderType, options, debug: boolean = false) {
    let captcha
    switch (type) {
        case SliderType.Ks:
            captcha = new SliderCaptcha(options, debug)
            break
        case SliderType.Pdd:
        default:
            captcha = new PddCaptcha(options, debug)
            break
    }
    captcha.resolver.then(() => {
        const buffer = captcha.canvas.toBuffer('image/jpeg', {quality: 0.8})
        const uuid = CryptoLib.randomUUID()
        if (!fs.existsSync('dist/JPEGImages')) {
            fs.mkdirSync('dist/JPEGImages')
        }
        const name = `${SliderType[type]}_${uuid}`
        const imgPath = `dist/JPEGImages/${name}.jpg`
        fs.writeFileSync(imgPath, buffer)
        const writer = new VocWriter(imgPath, captcha.options.width, captcha.options.height)
        writer.addObject('ground_truth', captcha.gtBndBox.left, captcha.gtBndBox.top,
            captcha.gtBndBox.right, captcha.gtBndBox.bottom)
        writer.addObject('target', captcha.targetBndBox.left, captcha.targetBndBox.top,
            captcha.targetBndBox.right, captcha.targetBndBox.bottom)
        if (captcha.hasFakeSlider()) {
            writer.addObject('interference', captcha.fakeBndBox.left, captcha.fakeBndBox.top,
                captcha.fakeBndBox.right, captcha.fakeBndBox.bottom)
        }
        if (!fs.existsSync('dist/Annotations')) {
            fs.mkdirSync('dist/Annotations')
        }
        const annoPath = `dist/Annotations/${name}.xml`
        writer.save(annoPath)
    })
}


function generateRandomCaptcha(type: SliderType, debug: boolean = false) {
    let options = []
    if (type == SliderType.Ks) {
        options = [
            {
                width: 800,
                height: 400,
                sliderL: Math.floor(_.random(100 * 0.8, 100 * 1.2)),
                sliderR: Math.floor(_.random(20 * 0.8, 20 * 1.2)),
                lineWidth: Math.floor(_.random(2, 8)),
                initialOffset: Math.floor(_.random(5, 30)),
                contrast: _.random(0.5, 1),
                alpha: _.random(0.5, 1.5),
            },
            {
                width: 720,
                height: 360,
                sliderL: Math.floor(_.random(90 * 0.8, 90 * 1.2)),
                sliderR: Math.floor(_.random(15 * 0.8, 15 * 1.2)),
                lineWidth: Math.floor(_.random(2, 5)),
                initialOffset: Math.floor(_.random(5, 30)),
                contrast: _.random(0.5, 1),
                alpha: _.random(0.5, 1.5),
            },
            {
                width: 640,
                height: 320,
                sliderL: Math.floor(_.random(80 * 0.8, 80 * 1.2)),
                sliderR: Math.floor(_.random(10 * 0.8, 10 * 1.2)),
                lineWidth: Math.floor(_.random(2, 5)),
                initialOffset: Math.floor(_.random(5, 30)),
                contrast: _.random(0.5, 1),
                alpha: _.random(0.5, 1.5),
            }
        ]
    } else if (type == SliderType.Pdd) {
        options = [
            {
                width: 800,
                height: 400,
                sliderL: Math.floor(_.random(100 * 0.8, 100 * 1.2)), // 滑块边长
                littleTriangle: Math.floor(15, 20),
                bigTriangle: Math.floor(_.random(16, 25)),
                littleRectangle: Math.floor(15, 20),
                bigRectangle: Math.floor(_.random(16, 25)),
                littleArc: Math.floor(15, 20),
                bigArc: Math.floor(16, 25),
                lineWidth: Math.floor(_.random(2, 8)),
                initialOffset: Math.floor(_.random(5, 30)),
                contrast: _.random(0.5, 1),
                alpha: _.random(0.5, 1.5),
            },
            {
                width: 720,
                height: 360,
                sliderL: Math.floor(_.random(90 * 0.8, 90 * 1.2)), // 滑块边长
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
            },
            {
                width: 640,
                height: 320,
                sliderL: Math.floor(_.random(80 * 0.8, 80 * 1.2)), // 滑块边长
                littleTriangle: Math.floor(8, 12),
                bigTriangle: Math.floor(_.random(12, 16)),
                littleRectangle: Math.floor(8, 12),
                bigRectangle: Math.floor(_.random(12, 16)),
                littleArc: Math.floor(8, 12),
                bigArc: Math.floor(12, 16),
                lineWidth: Math.floor(_.random(2, 5)),
                initialOffset: Math.floor(_.random(5, 30)),
                contrast: _.random(0.5, 1),
                alpha: _.random(0.5, 1.5),
            }
        ]
    }
    generateSliderCaptcha(type, options[Math.floor(Math.random() * options.length)], debug)
}

program
    .option('-t, --type <type>', 'captcha type', /(ks|pdd)/, 'pdd')
    .option('-c, --count <count>', 'captcha count to be generated', 100)
    .option('-d, --debug', 'whether to add bounding rect on output image', false)
    .description('generate captcha jpegs and annotation xml files')

program.parse()

const options = program.opts()
console.log(options)
const type = options.type == 'ks' ? SliderType.Ks : SliderType.Pdd
const debug = options.debug
for (let i = 0; i < options.count; i++) {
    generateRandomCaptcha(type, debug)
}


