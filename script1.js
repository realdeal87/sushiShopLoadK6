import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  scenarios: {
    // Сайт открывается и производится заказ с интенсивностью 100 заказов/час
    openMainPageAndMakeAnOrder: {
      executor: 'constant-arrival-rate',
      rate: 100,
      timeUnit: '1h',
      duration: '1h',
      preAllocatedVUs: 1,
      exec: 'openMainPageAndMakeAnOrder',
    }
  },
  discardResponseBodies: false,
  thresholds: {
    'http_req_duration{test_type:s1}': ['p(95)<250', 'p(99)<350'],
  },
};

export function openMainPageAndMakeAnOrder() {
  let res = http.get('http://185.233.0.230:3000/');
  check(res, {
    "status code is 200": (res) => res.status == 200,
    "body not contains 'error'": (res) => res.body.includes('error') == false,
  });

  let headers = {'Content-Type': 'application/json'};
  let data = {
    "name": "My Name",
    "email": "My@email.com",
    "adress": "My Address",
    "cartItems": [
      {
        "_id": "sushi1",
        "title": "Philadelfia",
        "image": "/images/sushi1.jpg",
        "description": "Best delicious!",
        "price": 500,
        "availableSizes": [
          "Small",
          "Big"
        ],
        "count": 1
      }
    ]
  }
  res = http.post('http://185.233.0.230:3000/api/orders', JSON.stringify(data), {headers: headers});
  let body = JSON.parse(res.body)
  check(res, {
    "status code is 200": (res) => res.status == 200,
    "body not contains 'error'": (res) => res.body.includes('error') == false,
    "field '_id' match with regExp": body['_id'].match(/[a-zA-Z0-9_\-]+/),
    "field 'createdAt' match with regExp": body['createdAt'].match(/(\d{4}-[0-1]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d{3}Z)/),
  });
}