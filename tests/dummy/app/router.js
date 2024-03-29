import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
import config from 'dummy/config/environment';

const Router = AddonDocsRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function() {
  docsRoute(this, function() {
    this.route('index', { path: '/intro' });
    this.route('caveats');
    this.route('demo');
    this.route('install');
    this.route('usage');
  });
  this.route('not-found', { path: '/*path' });
});

export default Router;
