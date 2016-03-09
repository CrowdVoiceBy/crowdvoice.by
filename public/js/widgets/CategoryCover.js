/* jshint multistr: true */
/**
 * @data format
 * name         {String} category name
 * image_cover  {String} path to the main cover image
 * url          {String} topic's permalink
 */
Class(CV, 'CategoryCover').inherits(Widget).includes(CV.WidgetUtils)({
    HTML : '\
        <div class="homepage-category-list-item">\
            <a class="categories_link" href="#" alt="">\
                <div class="homepage-category-cover"></div>\
            </a>\
            <p class="categories_link-wrapper">\
                <a class="categories_link categories_title -font-bold" href="#" alt=""></a>\
            </p>\
        </div>\
    ',

    prototype : {

        name : null,
        slug : null,
        images : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];
            this.anchorElements = [].slice.call(this.el.querySelectorAll('.categories_link'), 0);

            this.dom.updateBgImage(this.el.querySelector('.homepage-category-cover'), this.images.icon.url);
            this.dom.updateText(this.el.querySelector('.categories_title'), this.name);

            this.anchorElements.forEach(function(anchor) {
                this.dom.updateAttr('href', anchor, '/topic/' + this.slug);
                this.dom.updateAttr('alt', anchor, this.name);
            }, this);
        }
    }
});
