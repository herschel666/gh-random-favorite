/* global describe, it, expect, beforeEach, afterEach, sinon,
  API_URL, tmplStr, formatHeaderData, tmpl, fetch, getLastPage,
  getRandomPage, getRandomFav, apiHhead, apiBody, appendFav, sidebar */

(function () {
  'use strict';

  describe('GH-Random-favorite', function () {

    describe('misc', function () {
      it('should have API_URL', function () {
        expect(API_URL).to.equal('https://api.github.com/users/{{user}}/starred');
      });
      it('should have template-string', function () {
        var foo = document.createElement('foo');
        foo.innerHTML = tmplStr;
        expect(foo.querySelectorAll('.box-header').length).to.equal(1);
      });
    });

    describe('helpers', function () {

      describe('`formatHeaderData`', function () {
        var responseHeader = 'Cache-Control: public, max-age=60, s-maxage=60\r\n' +
            'Content-Encoding:gzip\r\n' +
            'Content-Security-Policy: default-src \'none\'\r\n' +
            'Content-Type: application/json; charset=utf-8\r\n' +
            'Date: Wed, 17 Jul 2014 19:05:18 GMT\r\n' +
            'ETag:"5698d6b34752de00e13a38145449cca9"\r\n' +
            'Link:<https://api.github.com/user/520258/starred?page=3>; rel="next", <https://api.github.com/user/123/starred?page=10>; rel="last", <https://api.github.com/user/123/starred?page=1>; rel="first", <https://api.github.com/user/123/starred?page=1>; rel="prev"\r\n' +
            'Server:GitHub.com\r\n' +
            'Status:200 OK\r\n';
        it('should have the correct keys and values', function () {
          var headers = formatHeaderData(responseHeader);
          expect(headers['Content-Encoding']).to.equal('gzip');
          expect(headers['Content-Security-Policy']).to.equal('default-src \'none\'');
          expect(headers.Date.getFullYear()).to.equal(2014);
          expect(headers.Date.getMonth()).to.equal(6);
          expect(headers.Date.getDate()).to.equal(17);
          expect(headers.Status).to.equal('200 OK');
        });
      });

      describe('`tmpl`', function () {
        it('should render a template from string an data', function () {
          var foo = document.createElement('foo');
          foo.innerHTML = tmpl('<p>{{foo}}</p>', {foo: 'bar'});
          expect(foo.querySelector('p').textContent).to.equal('bar');
        });
      });

      describe('`htmlEscape`', function () {
        it('should escape html-tags', function () {
          expect(htmlEscape('<p>Foo</p>')).to.equal('&lt;p&gt;Foo&lt;/p&gt;');
        });
      });

      describe('`fetch`', function () {
        var xhr, requests = [];
        beforeEach(function () {
          xhr = sinon.useFakeXMLHttpRequest();
          xhr.onCreate = function (_xhr) {
            requests.push(_xhr);
          };
        });
        afterEach(function () {
          xhr.restore();
          requests.length = 0;
        });
        it('should make async request', function () {
          var callback = sinon.spy();
          fetch({
            url: 'api/v1/foo',
            type: 'HEAD',
            state: 'HEADERS_RECEIVED',
            success: callback
          });
          expect(requests.length).to.equal(1);
          requests[0].respond(200, {
            'Content-type': 'application/json'
          }, '{"foo": "bar"}');
          expect(callback.called).to.equal(true);
          expect(callback.args[0][0].url).to.equal('api/v1/foo');
          expect(callback.args[0][0].method).to.equal('HEAD');
          expect(callback.args[0][0].responseText).to.equal('{"foo": "bar"}');
        });
        it('should fail when API-limit is reached', function () {
          var callback = sinon.spy();
          fetch({
            url: 'api/v1/foo',
            type: 'HEAD',
            state: 'HEADERS_RECEIVED',
            error: callback
          });
          expect(requests.length).to.equal(1);
          requests[0].respond(200, {
            'Content-type': 'application/json',
            'X-RateLimit-Remaining': 0
          });
          expect(callback.called).to.equal(true);
        });
      });

      describe('`getLastPage`', function () {
        var headerLink = '<https://api.github.com/user/123/starred?page=2>; rel="next", <https://api.github.com/user/123/starred?page=12>; rel="last"';
        it('should return the last page', function () {
          expect(getLastPage(headerLink)).to.equal(12);
        });
      });

      describe('`getRandomPage`', function () {
        it('should stick to the interval', function () {
          var val = getRandomPage(12);
          expect(val >= 1).to.equal(true);
          expect(val <= 12).to.equal(true);
        });
      });

      describe('`getRandomFav`', function () {
        it('should return an array-element', function () {
          var arr = ['L', 'o', 'r', 'e', 'm', ' ', 'i', 'p', 's', 'u', 'm'],
              item = getRandomFav(arr);
          expect(arr.indexOf(item) > -1).to.equal(true);
        });
      });

    });

    describe('extension', function () {

      describe('`apiHhead`', function () {
        var xhr, _fetch, _formatHeaderData, _getLastPage, _getRandomPage, requests = [];
        beforeEach(function () {
          xhr = sinon.useFakeXMLHttpRequest();
          _fetch = sinon.spy(window, 'fetch');
          _formatHeaderData = sinon.spy(window, 'formatHeaderData');
          _getLastPage = sinon.spy(window, 'getLastPage');
          _getRandomPage = sinon.stub(window, 'getRandomPage', function () { return 12; });
          xhr.onCreate = function (_xhr) {
            requests.push(_xhr);
          };
        });
        afterEach(function () {
          xhr.restore();
          _fetch.restore();
          _formatHeaderData.restore();
          _getLastPage.restore();
          _getRandomPage.restore();
          requests.length = 0;
        });
        it('should set a page and call the callback', function () {
          var callback = sinon.spy();
          apiHhead(callback);
          expect(requests.length).to.equal(1);
          requests[0].respond(200, {
            'Content-type': 'application/json',
            'Link': '<https://api.github.com/user/123/starred?page=2>; rel="next", <https://api.github.com/user/123/starred?page=12>; rel="last"'
          });
          expect(_fetch.called).to.equal(true);
          expect(_formatHeaderData.called).to.equal(true);
          expect(_getLastPage.called).to.equal(true);
          expect(_getRandomPage.called).to.equal(true);
          expect(callback.calledWith(12)).to.equal(true);
        });
      });

      describe('`apiBody`', function () {
        var xhr, fav, _fetch, _getRandomFav, requests = [];
        beforeEach(function () {
          fav = {
            name: 'foobar',
            'html_url': 'http://foo.bar'
          };
          xhr = sinon.useFakeXMLHttpRequest();
          _fetch = sinon.spy(window, 'fetch');
          _getRandomFav = sinon.stub(window, 'getRandomFav', function () { return fav; });
          xhr.onCreate = function (_xhr) {
            requests.push(_xhr);
          };
        });
        afterEach(function () {
          fav = null;
          xhr.restore();
          _fetch.restore();
          _getRandomFav.restore();
          requests.length = 0;
        });
        it('should return a random favorite', function () {
          var callback = sinon.spy();
          apiBody(9, callback);
          requests[0].respond(200, {
            'Content-type': 'application/json',
          }, '{}');
          expect(requests.length).to.equal(1);
          expect(callback.calledWith(fav)).to.equal(true);
        });
      });

      describe('`appendFav`', function () {
        var fav;
        beforeEach(function () {
          sidebar = document.createElement('div');
          sidebar.innerHTML = '<div></div>';
          fav = {
            name: 'Foobar',
            'html_url': 'http://foo.bar/',
            owner: {
              login: 'lorem',
            },
            description: 'lorem ipsum dolor'
          };
        });
        afterEach(function () {
          sidebar = null;
          fav = null;
        });
        it('should append the favorite', function () {
          var favElem, heading;
          appendFav(fav);
          favElem = sidebar.firstElementChild;
          heading = favElem.querySelector('.gh-random-favorite__sub-heading');
          expect(favElem.className).to.equal('gh-random-favorite box box-small');
          expect(heading.firstElementChild.href).to.equal(fav.html_url);
          expect(heading.textContent).to.equal(fav.owner.login + '/' + fav.name);
          expect(favElem.querySelector('.description').textContent).to.equal(fav.description);
        });
      });

    });

  });
})();
