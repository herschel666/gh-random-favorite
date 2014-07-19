GH-Random-Favorite
====

This is a Chrome-extension that displays one of your starred repos in the sidebar of the GitHub.com frontpage, when you're logged in. [You can download it at the Chrome Web Store](https://chrome.google.com/webstore/detail/gh-random-favorite/ogmnlelgbkfjjjhmhefdlfblpdiopedb). If you found a bug, [file an issue](https://github.com/herschel666/gh-random-favorite/issues). Thanks!

![image](./app/images/icon-128.png)

The usual procedure is like this: you visit a repo, you think it's interesting, you star it — you forget about it. Maybe later you'll visit it again, think it's interesting and realize, that you already starred it and totally forgot about it.

That's a shame. And it is where **GH-Random-Favorite** comes to the rescue. Everytime you visit Github.com you will not only see the activity stream and a selection of your repos, but also one randomly picked repo of your favorites list.

You will re-discover real treasures!

## How does it work?

Unfortunately there is no way to load a list of all starred repos at once as they're paginated. So the extension makes an API-call to get the amount of pages and randomly choose one page from that interval. After that it loads all starred repos from this page and randomly picks one. That's the repo that appears in your sidebar on GitHub.com.

## Drawbacks

Due to the design of the GitHub-API there'll always be two requests necessary to get the random repo. The first request only fetches header data and is thereby rather "cheap". Nonetheless it counts as a fully qualified request and thus hits the counter.

As the extension requests the public API the amount of requests per hour is limited to 60. This means that when you frequent/refresh your GitHub frontpage more than 30 times in an hour, the **GH-Random-Favorite** won't appear anymore until GitHub resets your counter.

## Preview

Actually there's nothing to preview. A nice feature to circumvent the API-limit would be to integrate OAuth. But I'll wait for feedback before doing this. If you like to contribute you don't have to wait for feedback: fork the repo, set up a feature branch, integrate the feature and make a pull-request ;-)

Another feature - with an actually higher priority - would be to publish **GH-Random-Favorite** as a Firefox-extension as well. But I have neither plans nor a schedule regarding that.

## For Developers

To get started developing, clone the repo and install the dependencies:

```bash
$ git clone git@github.com:herschel666/gh-random-favorite.git
$ cd gh-random-favorite
$ npm install && bower install
```

There'll be a Grunt task for debugging:

```bash
$ grunt debug
```

That's all!

## License

Copyright 2014 Emanuel Kluge

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the Software), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED AS IS, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
