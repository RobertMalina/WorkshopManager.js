// const jsdom = require('jsdom');
// const { JSDOM } = jsdom;
// const { document, Element } = new JSDOM(`<!DOCTYPE html>`).window;

class OrdersList {
  constructor({ ordersService, placeholder, id }) {
    if (!placeholder instanceof Element) {
      throw new Error('placeholder must be an valid DOM element!');
    }
    this.id = id;
    this.placeholder = placeholder;
    this.ordersService = ordersService;
    this.statusFilters = {};
    this.filters = {
      registered: true,
      inProgress: true,
      finished: false,
    };
    this.errorTemplate = `<div id="${id}" class="items-list">
    <div class="error-message">
      Error occured during fetching the orders...
      </div>
    </div>`;
  }

  render(page = 0, itemsOnPage = 5, statusFilters = this.filters) {
    this.page = 0;
    this.itemsOnPage = itemsOnPage;
    return new Promise((resolve, reject) => {
      this.ordersService
        .fetchAsPageContent({ page, itemsOnPage, statusFilters })
        .then(response => {
          const list = document.createElement('div', {
            id: 'orders-list',
            class: 'items-list',
          });
          for (let order of response.orders) {
            list.innerHTML += `
          <div orderId="${order.id}" class="order list-item">
          <h2 class="title">${order.title}</h2>
          <p class="vehicle-descriptions">${order.vehicleDescription}</p>
          <div class="client-data">
            <p class="client-name">${order.client.firstName}  ${order.client.lastName}</p>
            <p class="client-phone">${order.client.phoneNumber}</p>
          </div>
        </div>
          `;
          }

          this.placeholder.innerHTML = list.outerHTML;
          resolve(this.placeholder);
        })
        .catch(err => {
          this.placeholder.innerHTML = this.errorTemplate;
          console.error(err);
          reject(err);
        });
    });
  }

  setFilters({ registered, inProgress, finished }) {
    if (
      registered === undefined ||
      inProgress === undefined ||
      finished === undefined
    ) {
      console.warn(`Set filters method invoked with wrong param value...`);
      return false;
    }
    this.filters = {
      registered,
      inProgress,
      finished,
    };
    this.render();
    return true;
  }
}

// $('#button').click(() => {
//   fetchCurrentUser(user => {
//     const loggedText = 'Logged ' + (user.loggedIn ? 'In' : 'Out');
//     $('#username').text(user.fullName + ' - ' + loggedText);
//   });
// });

module.exports = {
  OrdersList,
};
