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
