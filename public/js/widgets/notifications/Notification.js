Class(CV, 'Notification').inherits(Widget).includes(CV.WidgetUtils, BubblingSupport)({
  ELEMENT_CLASS: 'cv-notification',

  create: function create(config, notificationId) {
    return new CV.NotificationItem({
      name: notificationId,
      data: config,
      notificationId: notificationId
    });
  }
});
