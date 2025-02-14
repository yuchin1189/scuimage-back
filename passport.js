import passport from 'passport'
import passportLocal from 'passport-local'
import User from './models/user.js'
import bcrypt from 'bcrypt'
import passportJWT from 'passport-jwt'

passport.use(
  'login',
  new passportLocal.Strategy(async (username, password, done) => {
    try {
      // 查詢對應 username 是否存在
      // 若有的話 user 會宣告為正確的使用者帳號
      // 若無則此處的 user 會宣告成 null
      const user = await User.findOne({ username: username }).orFail(new Error('USERNAME'))
      // 比對該使用者的密碼（因為有加密，需使用 bcrypt 的方式比對）
      if (!bcrypt.compareSync(password, user.password)) {
        throw new Error('PASSWORD')
      }
      return done(null, user, null) // 呼叫 done() 的時候，資料會回到 auth.js 繼續往下走
    } catch (error) {
      console.log('passport.js login error', error)
      if (error.message === 'USERNAME') {
        return done(null, null, { message: 'userNotFound' })
      } else if (error.message === 'PASSWORD') {
        return done(null, null, { message: 'userPasswordIncorrect' })
      } else {
        return done(null, null, { message: 'serverError' })
      }
    }
  }),
)

passport.use(
  'jwt',
  new passportJWT.Strategy(
    {
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,

      // 允許過期的 token （後面再手動將登出和 refresh 以外的過期變成不允許）
      ignoreExpiration: true,
    },
    async (req, payload, done) => {
      try {
        const token = passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()(req)

        // 手動驗證 token 是否過期，宣告一個變數叫做過期 expired
        // payload.exp 是 jwt 過期了幾秒；Date().getTime() 是目前時間，單位是毫秒
        const expired = payload.exp * 1000 < new Date().getTime()

        // 將請求的 url 組裝起來
        const url = req.baseUrl + req.path
        if (expired && url !== '/user/refresh' && url !== '/user/logout') {
          throw new Error('EXPIRED')
        }

        const user = await User.findById(payload._id).orFail(new Error('USER'))
        if (!user.tokens.includes(token)) {
          throw new Error('TOKEN')
        }
        return done(null, { user, token }, null)
      } catch (error) {
        // token 舊換新也會出這段錯誤訊息，先註解掉
        // console.log('passport.js jwt error', error)
        if (error.message === 'USER') {
          return done(null, null, { message: 'userNotFound' })
        } else if (error.message === 'TOKEN') {
          return done(null, null, { message: 'userTokenInvalid' })
        } else if (error.message === 'EXPIRED') {
          return done(null, null, { message: 'userTokenExpired' })
        } else {
          return done(null, null, { message: 'serverError' })
        }
      }
    },
  ),
)
