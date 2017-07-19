function ClozeCard (fullText, cloze) {
    this.fullText = fullText;
    this.cloze = cloze;
    this.getPartialText = function () {
        var re = new RegExp(this.cloze)
        return this.fullText.replace(re, "...");
    };
    this.partialText = this.getPartialText();
}

module.exports = ClozeCard;