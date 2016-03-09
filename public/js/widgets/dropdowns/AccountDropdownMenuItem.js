Class(CV, 'AccountDropdownMenuItem').inherits(Widget).includes(CV.WidgetUtils)({
  HTML: '<li></li>',
  ELEMENT_CLASS: 'account-dropdown-menu__item -list-clean ui-vertical-list-item -rel',
  ANCHOR_TEMPLATE: '<a href="{href}" class="-tdn">{label}</a>',
  ARROW_TEMPLATE: '\
    <svg class="account-dropdown-menu__right-arrow -s10 -abs">\
      <use xlink:href="#svg-arrow-right"></use>\
    </svg>',

  prototype: {
    label: '',
    url: null,
    isOrganization: false,
    organizationData: null,

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._setup();
    },

    _setup: function _setup() {
      if (this.url) {
        var anchor = this.constructor.ANCHOR_TEMPLATE;
        anchor = anchor.replace(/{href}/, this.url);
        anchor = anchor.replace(/{label}/, this.label);
        this.el.insertAdjacentHTML('afterbegin', anchor);
        this.dom.addClass(this.el, ['-has-anchor']);
      } else {
        var label = '<p class="account-dropdown-menu__item-label -ellipsis"></p>';
        this.el.insertAdjacentHTML('afterbegin', label);
        this.dom.updateText(this.el.querySelector('.account-dropdown-menu__item-label'), this.label);
      }

      if (this.isOrganization) {
        this._addSubmenu();
      }
    },

    _addSubmenu: function _addSubmenu() {
      this.el.insertAdjacentHTML('beforeend', this.constructor.ARROW_TEMPLATE);
      this.dom.addClass(this.el, ['-has-submenu']);

      var list = document.createElement('ul');
      list.className = 'account-submenu ui-dropdown__body -btlr0 -bblr0';

      this.appendChild(new CV.AccountDropdownMenuItem({
        name: 'sub_profile',
        label: 'Profile',
        url: '/' + this.organizationData.profileName + '/'
      })).render(list);

      this.appendChild(new CV.AccountDropdownMenuItem({
        name: 'sub_manage',
        label: 'Manage',
        url: '/' + this.organizationData.profileName + '/edit/'
      })).render(list);

      this.el.appendChild(list);
    }
  }
});
