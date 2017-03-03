#!/usr/bin/env node
'use strict'

const commander = require('commander')
const P = require('bluebird')
const request = require('request')

function get(host) {
  const options = {
    url: 'https://' + host + '/__version__',
    method: 'GET',
    json: true,
    strictSSL: true,
    followRedirects: false
  }

  return new P((resolve, reject) => {
    request.get(options, (err, res, body) => {
      if (err) {
        return reject(err)
      }

      if (res.statusCode !== 200) {
        return reject(new Error('Non-200 response ' + res.statusCode))
      }

      return resolve(body)
    })
  }).reflect()
}

function valueOrReason(p) {
  return p.isFulfilled() ? p.value() : p.reason()
}

function main() {
  commander
    .option('-e, --env [env]', 'prod|stage|latest|stable', 'prod')
    .parse(process.argv)

  const hosts = require('./config/index.json')[commander.env]
  P.all(hosts.map(get))
    .then((res) => console.log(JSON.stringify(res.map(valueOrReason), null, 2)))
    .catch(console.error)
}

main()
