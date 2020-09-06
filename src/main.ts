import generator, { Response, OAuth, Entity/*, WebSocketInterface*/ } from 'megalodon'
import Koa from 'koa'
import Router from 'koa-router'
import request from 'superagent'
import * as moment from 'moment'

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
    let next_available = moment()

    const activeClient = generator('pleroma', `https://${process.env.HOST}`, accessToken)
    setInterval( () => {
      activeClient.getPublicTimeline().then( (resp: Response<Array<Entity.Status>>) => {
        resp.data.forEach( (value: any) => {
          request
            .get(encodeURI(`${process.env.PERMISSIONS_HOST}/fediverse/${value.account.acct}`))
            .then( (res) => {
              let permissions = res.body.results
              if ( (permissions.indexOf("master") > -1 || permissions.indexOf("commander") >= -1) && value.content.includes(`${process.env.NAME}`)) {
                let created_at = moment(value.created_at, "YYYY-MM-DDTHH:mm:ss.SSSZ")
                if (created_at.duration().asMilliseconds() >= next_available.duration().asMilliseconds()) {
                  next_available = created_at

                  request
                    .post(`${process.env.LINGUA_HOST}`)
                    .send( {text: value.content} )
                    .then( (resl) => {
                      console.log("!-->" + resl.body.response)
                      console.log(value)
                      //activeClient.postStatus(resl.body.response, {in_reply_to_id: value.id})
                    })
                    .catch( (err) => {
                      console.log(err)
                    })       
                }
              }
            })
            .catch( (err) => {
              console.log(err)
            })
        })
      })
    }, 1000)
  })
  .catch((err: Error) => console.error(err))
})

app.use(router.routes())
   .use(router.allowedMethods())

app.listen(process.env.PORT || 4000, () => {
  console.log('Koa started')
}) 
