import tinycolor from "tinycolor2"
import _ from 'lodash'

class Config {
    public color: any;
    public mask_line_color: any;
    public line_width: number;
    public aspect_ratio: number;
    public image_width: number;
    public image_height: number;
    constructor(mask_color: string, mask_alpha: number, mask_line_color: string, line_width: number,
                aspect_ratio: number, image_width: number) {
        this.color = tinycolor(mask_color)
        this.color.setAlpha(mask_alpha)
        this.mask_line_color = tinycolor(mask_line_color)
        this.line_width = line_width
        this.aspect_ratio = aspect_ratio
        this.image_width = image_width
        this.image_height = Math.round(this.aspect_ratio * this.image_width)
    }

    static getConfig() {

    }

    static randomMaskColor() {
        let mask_colors = ['#000000', '#ffffff', '#141414']
        return mask_colors[_.random(0, mask_colors.length - 1)]
    }

    static randomMaskAlpha(): number {
        let alphas = [0.6, 0.7, 0.8]
        return alphas[_.random(0, alphas.length - 1)]
    }

    static randomLineWidth() {
        let widths = [0, 2, 3, 4]
        return widths[_.random(0, widths.length - 1)]
    }

    static randomAspectRatio() {
        let ratios = [1.7, 1.8, 2.0]
        return ratios[_.random(0, ratios.length - 1)]
    }

    static randomImageWidth() {
        let widths = [150, 200, 250, 300, 350, 400]
        return widths[_.random(0, widths.length - 1)]
    }
}

export default Config