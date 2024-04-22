const puppeteer = require("puppeteer");
const sessionFactory = require("../factory/sessionFactory");
const userFactory = require("../factory/userFactory");

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({ 
      headless: true, 
      args: ['--no-sandbox']
    }); // instance of browser
    const page = await browser.newPage(); //instance of puppeteer page
    const customPage = new CustomPage(page); // instance of our custom-page

    return new Proxy(customPage, {
      get: (target, property, receiver) => {
        if (target[property]) {
          return target[property];
        }

        let value = browser[property];
        if (value instanceof Function) {
          return function (...args) {
            return value.apply(this === receiver ? browser : this, args);
          };
        }

        value = page[property];
        if (value instanceof Function) {
          return function (...args) {
            return value.apply(this === receiver ? page : this, args);
          };
        }

        return value;
      },
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);
    await this.page.setCookie(
      { name: "session", value: session },
      { name: "session.sig", value: sig }
    );
    await this.page.goto("http://localhost:3000/blogs");
    await this.page.waitForSelector('a[href="/auth/logout"]');
  }

  async getContentsOf(selector) {
    return await this.page.$eval(selector, (el) => el.innerHTML);
  }

  async get(path) {
    return await this.page.evaluate(
      (_path) => {
      return fetch(_path, {
        method: "get"
      }).then(res => res.json());
    }, path);

  };

  async post(path, data) {
    return await this.page.evaluate(
      (_path, _data) => {
        return fetch(_path, {
          method: "post",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(_data),
        }).then(res => res.json());
      },
      path,
      data
    );
  }

  execRequests(actions) {
    return Promise.all(actions.map(({method, path, data}) => {
      return this[method](path, data)
    }));
  }
}

module.exports = CustomPage;
