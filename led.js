// This is unused for now, make the code cluaner by using this in the future
module.exports = class led {
    constructor(hue, saturation, value) {
        this.hue = hue;
        this.saturation = saturation;
        this.value = value;
    }

    setHue(hue) {
        this.hue = hue;
    }

    getHue() {
        return this.hue;
    }

    setSaturation(saturation) {
        this.saturation = saturation;
    }

    getSaturation() {
        return this.saturation;
    }

    setValue(value) {
        this.value = value;
    }

    getValue() {
        return this.value;
    }
}