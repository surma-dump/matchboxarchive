if(!this.hasOwnProperty('visible')) {
    this.visible = false;
}

var validPicture = false;
for(var i in this.pictures) {
    validPicture = validPicture || (this.pictures[i].id == this.mainPicture);
}
if(!validPicture) {
    error('mainPicture', 'No such key found in pictures');
}
