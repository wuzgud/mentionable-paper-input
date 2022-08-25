import Route from '@ember/routing/route';

export default class Usage extends Route {
  setupController(controller, _) {
    super.setupController(...arguments);
    controller.value = '';
    controller.selectedTab = 0;
  }
}
