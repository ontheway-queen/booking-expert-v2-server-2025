import AbstractRouter from '../../../abstract/abstract.router';

export default class B2CMainRouter extends AbstractRouter {
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/banners');
    this.router.route('/offers');
    this.router.route('/offers/:id');
    this.router.route('/blog');
    this.router.route('/blog/:slug');
    this.router.route('/announcement');
    this.router.route('/pop-up');
    this.router.route('/popular-routes');
    this.router.route('/popular-airlines');
  }
}
