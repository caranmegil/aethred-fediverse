/*

login.ts - log in to the server and pass on the access token to a running main.ts instance
Copyright (C) 2020  William R. Moore <caranmegil@gmail.com>

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

*/

import readline from 'readline'
import generator /*, { OAuth, Entity, WebSocketInterface }*/ from 'megalodon'
import request from 'superagent'

const rl: readline.ReadLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const SCOPES: Array<string> = ['read', 'write', 'follow']
const BASE_URL: string = 'https://chilli.social'

let clientId: string
let clientSecret: string
//let accessToken: string | null
//let refreshToken: string | null

const client = generator('pleroma', BASE_URL)

client
  .registerApp('aethred', {
    scopes: SCOPES
  })
  .then(appData => {
    clientId = appData.clientId
    clientSecret = appData.clientSecret
    console.log('Authorization URL is generated.')
    console.log(appData.url)
    console.log()
    return new Promise<string>(resolve => {
      rl.question('Enter the authorization code from website: ', code => {
        resolve(code)
        rl.close()
      })
    })
  })
  .then((code: string) => {
    console.log(`${process.env.SECOND_STAGE_HOST}/?code=${code}&clientId=${clientId}&secret=${clientSecret}`)
    request.get(`${process.env.SECOND_STAGE_HOST}/?code=${code}&clientId=${clientId}&secret=${clientSecret}`).end()
  })
