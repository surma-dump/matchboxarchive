if(!this.hasOwnProperty('visible')) {
    this.visible = false;
}

var validMainImage = false;
for(var i in this.images) {
    validMainImage = validMainImage || (this.images[i].id == this.mainImage);
}
if(!validMainImage) {
    error('mainImage', 'No such key found in images');
}
