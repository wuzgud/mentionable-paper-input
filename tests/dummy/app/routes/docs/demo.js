import Route from '@ember/routing/route';

export default class Demo extends Route {
  setupController(controller, _) {
    super.setupController(...arguments);
    controller.value = '';
  }
}
