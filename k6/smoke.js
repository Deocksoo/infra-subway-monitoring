import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';

export let options = {
    vus: 1, // 1 user looping for 1 minute
    duration: '10s',

    thresholds: {
        http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    },
};

const BASE_URL = 'http://13.209.81.179';
const USERNAME = 'deocks@woowahan.com';
const PASSWORD = '1234';

export default function ()  {

    var payload = JSON.stringify({
        email: USERNAME,
        password: PASSWORD,
    });

    var params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };


    let loginRes = http.post(`${BASE_URL}/login/token`, payload, params);

    check(loginRes, {
        'logged in successfully': (resp) => resp.json('accessToken') !== '',
    });

    let authHeaders = {
        headers: {
            Authorization: `Bearer ${loginRes.json('accessToken')}`,
        },
    };
    let myObjects = http.get(`${BASE_URL}/members/me`, authHeaders).json();
    check(myObjects, { 'retrieved member': (obj) => obj.id != 0, });

    let stations = http.get(`${BASE_URL}/stations`);
    check(stations, {
        'is status 200': response => response.status === 200,
        'result': response => response.json().length != 0
    })

    let lines = http.get(`${BASE_URL}/lines`);
    check(lines, {
        'is status 200': response => response.status === 200,
        'result': response => response.json().length != 0
    })

    let line2 = http.get(`${BASE_URL}/lines/22`);
    check(line2, {
        'is status 200': response => response.status === 200,
        'result': response => response.json().id != 0
    })

    let path = http.get(`${BASE_URL}/paths/?source=3&target=6`);
    check(path, {
        'is status 200': response => response.status === 200,
        'result': response => response.json().stations.length != 0
    })

    sleep(1);
};