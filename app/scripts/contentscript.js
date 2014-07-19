'use strict';

/**
 * API-Url for fetching starred repos.
 *
 * @const
 * @type {string}
 */
var API_URL = 'https://api.github.com/users/{{user}}/starred';

var metaLogin = document.querySelector('[name="octolytics-actor-login"]'),
    sidebar = document.querySelector('.dashboard-sidebar'),
    userName,
    favsUrl;

/**
 * Template of the displayed favorite.
 *
 * @type {string}
 */
var tmplStr = '<div class="box-header">' +
  '<h3 class="gh-random-favorite__heading box-title">From your favorites</h3>' +
'</div>' +
'<div class="box-body starred-repo public source">' +
  '<span class="mega-octicon octicon-repo"></span>' +
  '<span class="starring-container">' +
    '<h4 class="gh-random-favorite__sub-heading"><a href="{{html_url}}" class="js-navigation-open"><i>{{user}}</i>/{{name}}</a></h4>' +
    '<p class="description">{{description}}</p>' +
  '</span>' +
'</div>';

/**
 * Takes a header data string and converts
 * it into an object.
 *
 * @param  {string} str Header data string
 * @return {object}
 */
function formatHeaderData(str) {
  var rows = str.split(/\r\n/),
      ret = {};
  rows.forEach(function (row) {
    var tmp = row.split(/\:\s*?/);
    if ( !tmp[0] ) {
      return;
    }
    if ( tmp[0] === 'Date' || tmp[0] === 'Last-Modified' ) {
      ret[tmp[0]] = new Date(tmp[1].trim());
      return;
    }
    ret[tmp[0]] = tmp[1].trim();
  });
  return ret;
}

/**
 * Tiny templating
 * (http://mir.aculo.us/2011/03/09/little-helpers-a-tweet-sized-javascript-templating-engine/)
 *
 * @param  {string} str Template string
 * @param  {object} obj Data object
 * @return {string}     Rendered template
 */
function tmpl(str, obj) {
  for ( var j in  obj ) {
    str = str.replace(new RegExp('{{' + j + '}}', 'g'), obj[j]);
  }
  return str;
}

/**
 * Escapes HTML tags in a given string.
 *
 * @param  {string} str
 * @return {string}
 */
function htmlEscape(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Fetches async data; has an eye on the GitHub-
 * API-limit.
 *
 * @param  {object}    args           Hashed function arguments
 * @param  {string}    [args.type]    Request method
 * @param  {string}    args.url       Request url
 * @param  {function}  [args.success] Success-Callback
 * @param  {function}  [args.error]   Error-Callback
 * @param  {string}    [args.state]   Targetted request state
 * @return {undefined}
 */
function fetch(args) {
  var xhr = new XMLHttpRequest();
  args.type = args.type || 'GET';
  args.state = args.state || 'DONE';
  args.success = args.success || function () {};
  args.error = args.error || function () {};
  xhr.open(args.type, args.url);
  xhr.onreadystatechange = function () {
    if ( this.readyState !== XMLHttpRequest[args.state] ) {
      return;
    }
    if ( this.status === 200 && !/X-RateLimit-Remaining:\s0/.test(xhr.getAllResponseHeaders()) ) {
      args.success.call(null, this);
    } else {
      args.error.call(null, this);
    }
  };
  xhr.send();
}

/**
 * Takes the Link-property of the header data and returns
 * the last page of the paginated favorites.
 *
 * @param  {string} str Link-property
 * @return {number}     The last page
 */
function getLastPage(str) {
  var result = /(\d+?)[^0-9]+$/.exec(str);
  return result && result.length > 1 ? parseInt(result[1], 10) : result;
}

/**
 * Takes the last page of the paginated favorites
 * and generates a random page number in the interval
 * of first and last page.
 *
 * @param  {number} lastPage Number of the last page
 * @return {number}          Random page
 */
function getRandomPage(lastPage) {
  return Math.ceil(Math.random() * lastPage);
}

/**
 * Takes an array of starred repos and returns
 * a random item.
 *
 * @param  {array}  favs All starred repos
 * @return {object}      Random repo
 */
function getRandomFav(favs) {
  var index = Math.floor(Math.random() * favs.length);
  return favs[index];
}

/**
 * Requests the header data of the starred repos
 * to get the amount of pages and randomly
 * select one for the actual GET-request.
 *
 * @param  {function}  cb The callback function
 * @return {undefined}
 */
function apiHhead(cb) {
  fetch({
    url: favsUrl,
    type: 'HEAD',
    state: 'HEADERS_RECEIVED',
    success: function (xhr) {
      var headers = formatHeaderData(xhr.getAllResponseHeaders()),
          lastPage = getLastPage(headers.Link),
          page = getRandomPage(lastPage);
      cb.call(xhr, page);
    }
  });
}

/**
 * Gets all starred repos from a certain page. Selects
 * a single one randomly.
 *
 * @param  {number}    page The relevant page
 * @param  {function}  cb   The callback function
 * @return {undefined}
 */
function apiBody(page, cb) {
  fetch({
    url: favsUrl + '?page=' + page,
    success: function (xhr) {
      var fav = getRandomFav(JSON.parse(xhr.responseText));
      if ( fav ) {
        cb(fav);
      }
    }
  });
}

/**
 * Renders the favorite into the sidebar.
 *
 * @param  {object} fav Data of the starred repo
 * @return {undefinded}
 */
function appendFav(fav) {

  var favorite = document.createElement('div'),
      content;

  fav.user = fav.owner.login;
  fav.description = htmlEscape(fav.description);
  content = tmpl(tmplStr, fav);
  favorite.className = 'gh-random-favorite box box-small';
  favorite.innerHTML = content;
  sidebar.insertBefore(favorite, sidebar.firstElementChild);

}

/**
 * Starting the engines
 */
(function init() {

  userName = !metaLogin || metaLogin.getAttribute('content');

  // We need the username and the sidebar!
  if ( !userName || !sidebar ) {
    return;
  }

  favsUrl = API_URL.replace('{{user}}', userName);
  apiHhead(function (page) {
    apiBody(page, appendFav);
  });

})();

