import generator, { Response, OAuth, Entity, WebSocketInterface } from 'megalodon'
import Koa from 'koa'
import Router from 'koa-router'

const SCOPES: Array<string> = ['read', 'write', 'follow']
const BASE_URL: string = `https://${process.env.HOST}` || 'https://chilli.social'

let accessToken: string | null
let refreshToken: string | null

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
    refreshToken = tokenData.refreshToken
    console.log('\naccess_token:')
    console.log(accessToken)
    console.log('\nrefresh_token:')
    console.log(refreshToken)
    console.log()
    const activeClient = generator('pleroma', `wss://${process.env.HOST}`, accessToken)
    const stream: WebSocketInterface = activeClient.userSocket()

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
    .catch( err => { console.error(err); /*rl.close();*/ } )

  })
  .catch((err: Error) => console.error(err))
})

app.use(router.routes())
   .use(router.allowedMethods())

app.listen(process.env.PORT || 4000, () => {
  console.log('Koa started')
}) 
