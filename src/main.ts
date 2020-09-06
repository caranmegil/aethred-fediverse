import generator, { Response, OAuth, Entity/*, WebSocketInterface*/ } from 'megalodon'
import Koa from 'koa'
import Router from 'koa-router'
import request from 'superagent'

const SCOPES: Array<string> = ['read', 'write', 'follow']
const BASE_URL: string = `https://${process.env.HOST}` || 'https://chilli.social'

let accessToken: string | null
// let refreshToken: string | null

const app = new Koa()
const router = new Router()
const client = generator('pleroma', BASE_URL)

router.get("/", async (ctx: any, _ /*next: any*/) => {
let code = ctx.request.query.code
let clientId = ctx.request.query.clientId
let secret = ctx.request.query.secret
client
  .registerApp('aethred', {
    scopes: SCOPES
  })
  .then(appData => {
    console.log('Authorization URL is generated.')
    console.log(appData.url)
    console.log()
    return client.fetchAccessToken(clientId, secret, code)
  })
  .then((tokenData: OAuth.TokenData) => {
    accessToken = tokenData.accessToken
    // refreshToken = tokenData.refreshToken

    const activeClient = generator('pleroma', `https://${process.env.HOST}`, accessToken)

    activeClient.getPublicTimeline().then( (resp: Response<Array<Entity.Status>>) => {
      resp.data.forEach( (value: any) => {
        console.log('-->' + encodeURI(`${process.env.PERMISSIONS_HOST}/fediverse/${value.account.acct}`))
        request
        .get(encodeURI(`${process.env.PERMISSIONS_HOST}/fediverse/${value.account.acct}`))
        .then( (res) => {
          console.log('-->' + res.body.results)
          let permissions = res.body.results
          if ( (permissions.indexOf("master") > -1 || permissions.indexOf("commander") >= -1) && value.content.includes(`${process.env.NAME}@${process.env.HOST}`)) {
            request
              .post(`${process.env.LINGUA_HOST}/`)
              .send( {text: value.content} )
              .then( (resl) => {
                console.log("-->" + resl.body.response)
              })       
          }
        })
        .catch( (err) => {
          console.log(err)
        })
      })
    })
 /*   const stream: WebSocketInterface = activeClient.userSocket()

    stream.on('notification', (notification: Entity.Notification) => {
      // notification.account.acct = who said it
      // notification.status.content is what is said (HTML included)
      // notification.type === 'mention'
      if (notification.account.acct === 'caranmegil' && notification.type === 'mention' && notification.status !== undefined && notification.status.content !== undefined) {
        console.log(`${notification.account.acct}: ${notification.status.content}`)
      }
      console.log(notification)
    })
   
const activeClient2 = generator('pleroma', `https://${process.env.HOST}`, accessToken) 
activeClient2.postStatus('greetings, all!  i\'m just merely a bot.  i promise to be good! #introduction')
    .then( (res: Response<Entity.Status>) => { console.log(res); } )
    .catch( err => { console.error(err); } )
*/
  })
  .catch((err: Error) => console.error(err))
})

app.use(router.routes())
   .use(router.allowedMethods())

app.listen(process.env.PORT || 4000, () => {
  console.log('Koa started')
}) 
