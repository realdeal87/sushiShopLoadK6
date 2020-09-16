import http from 'k6/http';
import { check } from 'k6';

export let options = {
  scenarios: {
    // Сайт открывается 100 раз/мин в течении 4х часов
    openMainPage: {
      executor: 'constant-arrival-rate',
      rate: 100,
      timeUnit: '1m',
      duration: '4h',
      preAllocatedVUs: 1,
      exec: 'openMainPage',
    }
  },
  discardResponseBodies: false,
  thresholds: {
    'http_req_duration{test_type:s1}': ['p(95)<250', 'p(99)<350'],
  },
};

export function openMainPage() {
  let res = http.get('http://185.233.0.230:3000/');
  check(res, {
    "status code is 200": (res) => res.status == 200,
    "body not contains 'error'": (res) => res.body.includes('error') == false,
  });
}